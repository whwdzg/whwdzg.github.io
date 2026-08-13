const LOOP_MODES = ["none", "all", "one", "shuffle"];
const BILIBILI_QUALITY_LABELS = {
    "0": "自动",
    "16": "360P",
    "32": "480P",
    "64": "720P",
    "80": "1080P",
    "112": "1080P 高码率",
    "120": "4K",
    "125": "HDR",
    "127": "8K",
};

function bilibiliQualityLabel(value) {
    return BILIBILI_QUALITY_LABELS[String(value || "0")] || "自动";
}

function inferResolutionLabel(width, height) {
    const w = Number(width || 0);
    const h = Number(height || 0);
    const maxEdge = Math.max(w, h);
    if (maxEdge >= 7680) return "8K";
    if (maxEdge >= 3840) return "4K";
    if (maxEdge >= 1920) return "1080P";
    if (maxEdge >= 1280) return "720P";
    if (maxEdge >= 854) return "480P";
    if (maxEdge >= 640) return "360P";
    return maxEdge > 0 ? `${w}x${h}` : "未知";
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function rgbToHex(r, g, b) {
    const toHex = (n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function parseRgbText(text) {
    const m = String(text || "").match(/(\d+)/g);
    if (!m || m.length < 3) return null;
    return [Number(m[0]), Number(m[1]), Number(m[2])];
}

function hexToRgb(hex) {
    const raw = String(hex || "").replace("#", "").trim();
    if (raw.length !== 6) return null;
    const n = Number.parseInt(raw, 16);
    if (!Number.isFinite(n)) return null;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function normalizeMediaStem(name) {
    return String(name || "")
        .toLowerCase()
        .replace(/\.[^.]+$/, "")
        .replace(/[\s\-_.\[\](){}]+/g, "")
        .trim();
}

function decodeDanmakuXmlBuffer(buffer) {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    const candidates = [];
    const tryDecode = (enc) => {
        try {
            const txt = new TextDecoder(enc).decode(bytes);
            const score = (txt.match(/<d\s+/g) || []).length * 10 + (txt.includes("<i") ? 2 : 0) - (txt.match(/\uFFFD/g) || []).length;
            candidates.push({ txt, score });
        } catch (error) {
            // ignore unsupported encoding
        }
    };
    tryDecode("utf-8");
    tryDecode("gb18030");
    tryDecode("gbk");
    if (!candidates.length) return "";
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0].txt;
}

function scoreDecodedText(text) {
    if (!text) return -9999;
    const badReplacement = (text.match(/\uFFFD/g) || []).length;
    const mojibake = (text.match(/锟斤拷|Ã|Â|Ð|¢|¤|�/g) || []).length;
    const cjk = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const lrcHints = (text.match(/[\[\]:\.]/g) || []).length;
    return (cjk * 3) + (lrcHints * 0.6) - (badReplacement * 20) - (mojibake * 8);
}

function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
    const sec = Math.floor(seconds);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function readZeroTerminated(bytes, offset, encodingByte) {
    const isUnicode = encodingByte === 1 || encodingByte === 2;
    if (isUnicode) {
        for (let i = offset; i + 1 < bytes.length; i += 2) {
            if (bytes[i] === 0x00 && bytes[i + 1] === 0x00) {
                return { next: i + 2, raw: bytes.slice(offset, i) };
            }
        }
        return { next: bytes.length, raw: bytes.slice(offset) };
    }
    for (let i = offset; i < bytes.length; i += 1) {
        if (bytes[i] === 0x00) return { next: i + 1, raw: bytes.slice(offset, i) };
    }
    return { next: bytes.length, raw: bytes.slice(offset) };
}

function decodeText(rawBytes, encodingByte, preserveWhitespace = false) {
    const finalize = (text) => {
        const normalized = String(text || "").replace(/\u0000/g, "");
        return preserveWhitespace ? normalized : normalized.trim();
    };
    if (!rawBytes || rawBytes.length === 0) return "";
    try {
        if (encodingByte === 1) {
            if (rawBytes.length >= 2 && rawBytes[0] === 0xff && rawBytes[1] === 0xfe) {
                return finalize(new TextDecoder("utf-16le").decode(rawBytes.slice(2)));
            }
            if (rawBytes.length >= 2 && rawBytes[0] === 0xfe && rawBytes[1] === 0xff) {
                const swapped = new Uint8Array(rawBytes.length - 2);
                for (let i = 2; i + 1 < rawBytes.length; i += 2) {
                    swapped[i - 2] = rawBytes[i + 1];
                    swapped[i - 1] = rawBytes[i];
                }
                return finalize(new TextDecoder("utf-16le").decode(swapped));
            }
            let zeroOdd = 0;
            let zeroEven = 0;
            const sample = Math.min(rawBytes.length, 256);
            for (let i = 0; i < sample; i += 1) {
                if (i % 2 === 0 && rawBytes[i] === 0) zeroEven += 1;
                if (i % 2 === 1 && rawBytes[i] === 0) zeroOdd += 1;
            }
            if (zeroEven > zeroOdd) {
                const swapped = new Uint8Array(rawBytes.length);
                for (let i = 0; i + 1 < rawBytes.length; i += 2) {
                    swapped[i] = rawBytes[i + 1];
                    swapped[i + 1] = rawBytes[i];
                }
                return finalize(new TextDecoder("utf-16le").decode(swapped));
            }
            return finalize(new TextDecoder("utf-16le").decode(rawBytes));
        }
        if (encodingByte === 2) {
            const swapped = new Uint8Array(rawBytes.length);
            for (let i = 0; i + 1 < rawBytes.length; i += 2) {
                swapped[i] = rawBytes[i + 1];
                swapped[i + 1] = rawBytes[i];
            }
            return finalize(new TextDecoder("utf-16le").decode(swapped));
        }
        if (encodingByte === 3) {
            return finalize(new TextDecoder("utf-8").decode(rawBytes));
        }
    } catch (error) {
        return "";
    }
    try {
        return finalize(new TextDecoder("gb18030").decode(rawBytes));
    } catch (error) {
        return finalize(new TextDecoder("latin1").decode(rawBytes));
    }
}

function parseWordTaggedLine(text) {
    const wordMatches = [...text.matchAll(/<(\d{1,2}):(\d{1,2}(?:\.\d{1,3})?)>([^<]*)/g)];
    if (!wordMatches.length) return null;
    const words = [];
    for (const match of wordMatches) {
        const time = Number(match[1]) * 60 + Number(match[2]);
        words.push({ time, text: String(match[3] || "").replace(/\n+/g, " ") });
    }
    const plain = words.map((w) => w.text).join("").replace(/\s{2,}/g, " ").trim();
    return { plain, words };
}

function normalizeLyricText(text) {
    return String(text || "")
        .replace(/\\N|\\n/g, "\n")
        .replace(/\r/g, "");
}

function parseInlineTimedWords(line) {
    const matches = [...line.matchAll(/\[(\d{1,2}):(\d{1,2}(?:\.\d{1,3})?)\]/g)];
    if (matches.length < 2) return null;

    const chunks = [];
    for (let i = 0; i < matches.length; i += 1) {
        const cur = matches[i];
        const next = matches[i + 1];
        const start = cur.index + cur[0].length;
        const end = next ? next.index : line.length;
        const txt = normalizeLyricText(line.slice(start, end)).replace(/\n+/g, " ");
        if (txt && txt.trim()) {
            chunks.push({
                time: Number(cur[1]) * 60 + Number(cur[2]),
                text: txt.trim(),
            });
        }
    }

    // Only treat as inline word-timed lyrics when there are multiple timed chunks
    // on the same physical line. This avoids mis-parsing lines like
    // [00:10.00][00:20.00]same lyric.
    if (chunks.length < 2) return null;
    const plain = chunks.map((c) => c.text).join("").trim();
    return {
        time: Number(matches[0][1]) * 60 + Number(matches[0][2]),
        text: plain,
        words: chunks,
    };
}

function parseLrcTextWithThirdParty(rawLrc) {
    const LyricCtor = window.Lyric;
    if (typeof LyricCtor !== "function") return [];
    try {
        const parser = new LyricCtor(String(rawLrc || ""), () => {});
        const lines = Array.isArray(parser?.lines) ? parser.lines : [];
        return lines.map((line) => ({
            time: Number(line?.time || 0) / 1000,
            text: String(line?.txt || "").trim(),
            words: null,
            translations: [],
        })).filter((line) => line.text || Number.isFinite(line.time));
    } catch (error) {
        return [];
    }
}

function parseLrcText(rawLrc) {
    if (!rawLrc) return [];
    const lines = rawLrc.split(/\r?\n/);
    const entries = [];

    for (const line of lines) {
        const inlineTimed = parseInlineTimedWords(line);
        if (inlineTimed) {
            entries.push({
                time: inlineTimed.time,
                anchorTime: inlineTimed.time,
                text: inlineTimed.text,
                words: inlineTimed.words,
                translations: [],
            });
            continue;
        }

        const matches = [...line.matchAll(/\[(\d{1,2}):(\d{1,2}(?:\.\d{1,3})?)\]/g)];
        if (!matches.length) continue;
        const textRaw = normalizeLyricText(line.replace(/\[(\d{1,2}):(\d{1,2}(?:\.\d{1,3})?)\]/g, ""));
        const wordTagged = parseWordTaggedLine(textRaw);
        const compactText = textRaw.replace(/\n+/g, " ").replace(/\s{2,}/g, " ").trim();
        const mainText = wordTagged
            ? String(wordTagged.plain || "").replace(/\n+/g, " ").trim()
            : compactText;
        const wordList = wordTagged
            ? wordTagged.words.map((w) => ({
                time: Number(w.time || 0),
                text: String(w.text || "").replace(/\n+/g, " ").trim(),
            })).filter((w) => w.text)
            : null;

        for (const match of matches) {
            const sec = Number(match[1]) * 60 + Number(match[2]);
            entries.push({
                time: sec,
                anchorTime: sec,
                text: mainText,
                words: wordList,
                translations: [],
            });
        }
    }
    entries.sort((a, b) => a.time - b.time);

    const grouped = [];
    for (const item of entries) {
        const last = grouped[grouped.length - 1];
        if (last && Math.abs(last.time - item.time) < 0.001) {
            if (!last.text && item.text) {
                last.text = item.text;
            } else if (item.text && item.text !== last.text && !last.translations.includes(item.text)) {
                last.translations.push(item.text);
            }
            if (!last.words && item.words && item.words.length) {
                last.words = item.words;
            }
            (item.translations || []).forEach((trans) => {
                const text = String(trans || "").trim();
                if (text && text !== last.text && !last.translations.includes(text)) {
                    last.translations.push(text);
                }
            });
        } else {
            grouped.push({
                time: item.time,
                anchorTime: Number(item.anchorTime ?? item.time),
                text: item.text,
                words: item.words,
                translations: [...(item.translations || [])],
            });
        }
    }
    const thirdParty = parseLrcTextWithThirdParty(rawLrc);
    if (grouped.length) return grouped;
    return thirdParty;
}

function parseSyncedLyrics(raw, encodingByte = 0) {
    if (!raw || !raw.length) return [];
    const bytes = raw instanceof Uint8Array ? raw : new Uint8Array(raw);
    const chunks = [];
    let idx = 0;
    while (idx < bytes.length) {
        const part = readZeroTerminated(bytes, idx, encodingByte);
        if (part.next + 3 >= bytes.length) break;
        const text = decodeText(part.raw, encodingByte, true);
        const t = (bytes[part.next] << 24) | (bytes[part.next + 1] << 16) | (bytes[part.next + 2] << 8) | bytes[part.next + 3];
        chunks.push({ time: t / 1000, text: normalizeLyricText(text) });
        idx = part.next + 4;
    }

    if (!chunks.length) return [];

    const lines = [];
    let current = {
        time: chunks[0].time,
        text: "",
        words: [],
        translations: [],
    };

    const pushCurrent = () => {
        const compact = current.text.replace(/\n+$/g, "").trim();
        const words = current.words.filter((w) => String(w.text || "").length > 0);
        if (compact || words.length) {
            lines.push({
                time: current.time,
                anchorTime: current.time,
                text: compact || words.map((w) => w.text).join(""),
                words: words.length ? words : null,
                translations: [],
            });
        }
    };

    for (let i = 0; i < chunks.length; i += 1) {
        const chunk = chunks[i];
        const segments = String(chunk.text || "").split("\n");

        for (let j = 0; j < segments.length; j += 1) {
            const seg = segments[j];
            if (seg) {
                current.text += seg;
                current.words.push({ time: chunk.time, text: seg });
            }

            // Explicit newline in SYLT text indicates line break.
            if (j < segments.length - 1) {
                pushCurrent();
                current = {
                    time: chunks[i + 1]?.time ?? chunk.time,
                    text: "",
                    words: [],
                    translations: [],
                };
            }
        }
    }

    pushCurrent();

    // Keep every lyric line and normalize timeline to avoid same-timestamp lines
    // being skipped by active-line lookup during playback.
    const normalized = [];
    for (const line of lines) {
        const rawTime = Number(line?.time || 0);
        const baseText = String(line?.text || "").trim();
        const words = Array.isArray(line?.words) && line.words.length ? line.words : null;
        const text = baseText || (words ? words.map((w) => String(w.text || "")).join("").trim() : "");
        if (!text && !words) continue;

        const prev = normalized[normalized.length - 1];
        if (prev && Math.abs(prev.anchorTime - rawTime) < 0.001 && isLikelySameLyricText(prev.text, text)) {
            if (!prev.words && words) prev.words = words;
            continue;
        }

        let time = Number.isFinite(rawTime) ? rawTime : (prev ? prev.time + 0.001 : 0);
        if (prev && time <= prev.time) {
            time = prev.time + 0.001;
        }
        normalized.push({
            time,
            anchorTime: Number.isFinite(rawTime) ? rawTime : time,
            text,
            words,
            translations: [...(line.translations || [])],
        });
    }

    return normalized;
}

function timedTrackMeta(lines) {
    const list = (lines || []).filter((line) => Number.isFinite(line?.time));
    if (!list.length) {
        return {
            len: 0,
            start: 0,
            end: 0,
            span: 0,
        };
    }
    const start = Number(list[0].time || 0);
    const end = Number(list[list.length - 1].time || start);
    return {
        len: list.length,
        start,
        end,
        span: Math.max(0, end - start),
    };
}

function canUseIndexFallback(baseLines, extraLines) {
    const base = timedTrackMeta(baseLines);
    const extra = timedTrackMeta(extraLines);
    if (!base.len || !extra.len) return false;
    const lenRatio = extra.len / Math.max(1, base.len);
    if (lenRatio < 0.82 || lenRatio > 1.22) return false;
    if (base.span <= 0.001 || extra.span <= 0.001) return false;
    const spanRatio = extra.span / Math.max(0.001, base.span);
    return spanRatio >= 0.8 && spanRatio <= 1.25;
}

function estimateIndexByTime(baseLines, extraLines, time) {
    const baseMeta = timedTrackMeta(baseLines);
    const extraMeta = timedTrackMeta(extraLines);
    if (!baseMeta.len || !extraMeta.len || extraMeta.span <= 0.001) return 0;
    const ratio = clamp((time - extraMeta.start) / extraMeta.span, 0, 1);
    return Math.round(ratio * Math.max(baseMeta.len - 1, 0));
}

function estimateTrackTimeShift(baseLines, extraLines) {
    const base = (baseLines || []).filter((line) => Number.isFinite(line?.time));
    const extra = (extraLines || []).filter((line) => Number.isFinite(line?.time));
    if (!base.length || !extra.length) return 0;

    const pickIdx = (list, ratio) => {
        if (list.length <= 1) return 0;
        return Math.min(list.length - 1, Math.max(0, Math.round((list.length - 1) * ratio)));
    };

    const diffs = [0, 0.5, 1].map((ratio) => {
        const bi = pickIdx(base, ratio);
        const ei = pickIdx(extra, ratio);
        return Number(base[bi].time || 0) - Number(extra[ei].time || 0);
    }).filter((v) => Number.isFinite(v));

    if (!diffs.length) return 0;
    diffs.sort((a, b) => a - b);
    const mid = diffs[Math.floor(diffs.length / 2)];
    return clamp(mid, -6, 6);
}

function collectLyricCandidates(line) {
    const list = [];
    const push = (value) => {
        const text = String(value || "").trim();
        if (!text) return;
        if (!list.includes(text)) list.push(text);
    };
    push(line?.text);
    (line?.translations || []).forEach((text) => push(text));
    return list;
}

function getLyricLineAnchorTime(line) {
    const anchorTime = Number(line?.anchorTime);
    if (Number.isFinite(anchorTime)) return anchorTime;
    const wordTime = Number(line?.words?.[0]?.time);
    if (Number.isFinite(wordTime)) return wordTime;
    const lineTime = Number(line?.time);
    if (Number.isFinite(lineTime)) return lineTime;
    return 0;
}

function buildLyricAnchorLookup(lines) {
    const lookup = new Map();
    (lines || []).forEach((line, index) => {
        const key = Math.round(getLyricLineAnchorTime(line) * 1000);
        if (!Number.isFinite(key)) return;
        if (!lookup.has(key)) lookup.set(key, []);
        lookup.get(key).push(index);
    });
    return lookup;
}

function findLyricAnchorMatchedIndex(lookup, time, preferredIndex = 0) {
    if (!lookup || !lookup.size || !Number.isFinite(time)) return -1;
    const key = Math.round(Number(time) * 1000);
    const candidates = lookup.get(key);
    if (!candidates || !candidates.length) return -1;
    let best = candidates[0];
    let bestDist = Math.abs(best - preferredIndex);
    for (let i = 1; i < candidates.length; i += 1) {
        const idx = candidates[i];
        const dist = Math.abs(idx - preferredIndex);
        if (dist < bestDist) {
            best = idx;
            bestDist = dist;
        }
    }
    return best;
}

function normalizeLyricCompareText(text) {
    return String(text || "")
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[，。！？、,.!?;:：；'"`~\-_=+()\[\]{}<>《》【】「」『』]/g, "");
}

function isLikelySameLyricText(a, b) {
    const ta = normalizeLyricCompareText(a);
    const tb = normalizeLyricCompareText(b);
    if (!ta || !tb) return false;
    if (ta === tb) return true;
    if (ta.includes(tb) || tb.includes(ta)) {
        const minLen = Math.min(ta.length, tb.length);
        const maxLen = Math.max(ta.length, tb.length);
        return (minLen / Math.max(maxLen, 1)) >= 0.72;
    }
    return false;
}

function detectLyricScript(text) {
    const source = String(text || "");
    let cjk = 0;
    let latin = 0;
    let kana = 0;
    let hangul = 0;
    let cyrillic = 0;
    for (const ch of source) {
        const cp = ch.codePointAt(0) || 0;
        if ((cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3400 && cp <= 0x4dbf)) {
            cjk += 1;
        } else if ((cp >= 0x3040 && cp <= 0x30ff) || (cp >= 0x31f0 && cp <= 0x31ff)) {
            kana += 1;
        } else if (cp >= 0xac00 && cp <= 0xd7af) {
            hangul += 1;
        } else if (cp >= 0x0400 && cp <= 0x04ff) {
            cyrillic += 1;
        } else if ((cp >= 0x0041 && cp <= 0x007a) || (cp >= 0x00c0 && cp <= 0x024f)) {
            latin += 1;
        }
    }
    const max = Math.max(cjk, latin, kana, hangul, cyrillic);
    if (max <= 0) return "unknown";
    if (max === cjk) return "cjk";
    if (max === latin) return "latin";
    if (max === kana) return "kana";
    if (max === hangul) return "hangul";
    return "cyrillic";
}

function pickSingleTranslationCandidate(line, baseText = "") {
    const pool = [line?.text, ...(line?.translations || [])];
    for (let i = 0; i < pool.length; i += 1) {
        const text = String(pool[i] || "").trim();
        if (!text) continue;
        if (baseText && isLikelySameLyricText(text, baseText)) continue;
        return text;
    }
    return "";
}

function sanitizeLyricsForDisplay(lines) {
    const sanitized = (lines || []).map((line) => ({
        ...line,
        translations: [...(line?.translations || [])],
    }));

    let diffScriptPairs = 0;
    let totalPairs = 0;
    sanitized.forEach((line) => {
        const baseText = String(line?.text || "").trim();
        const unique = [];
        (line.translations || []).forEach((raw) => {
            const text = String(raw || "").trim();
            if (!text) return;
            if (isLikelySameLyricText(text, baseText)) return;
            if (unique.some((item) => isLikelySameLyricText(item, text))) return;
            unique.push(text);
        });
        line.translations = unique.slice(0, 1);
        if (!baseText || !line.translations.length) return;
        const baseScript = detectLyricScript(baseText);
        line.translations.forEach((trans) => {
            totalPairs += 1;
            const transScript = detectLyricScript(trans);
            if (baseScript !== "unknown" && transScript !== "unknown" && baseScript !== transScript) {
                diffScriptPairs += 1;
            }
        });
    });

    if (!totalPairs || diffScriptPairs <= 0) {
        sanitized.forEach((line) => {
            line.translations = [];
        });
    }

    // Ensure strictly increasing timestamps to avoid same-time lines being skipped.
    let lastTime = -Infinity;
    sanitized.forEach((line) => {
        const rawTime = Number(line?.time);
        let safeTime = Number.isFinite(rawTime) ? rawTime : (Number.isFinite(lastTime) ? lastTime + 0.001 : 0);
        if (safeTime <= lastTime) safeTime = lastTime + 0.001;
        if (!Number.isFinite(Number(line.anchorTime))) {
            line.anchorTime = Number.isFinite(rawTime) ? rawTime : safeTime;
        }
        line.time = safeTime;
        lastTime = safeTime;
    });

    return sanitized;
}

function backfillMissingTranslationsByIndex(baseLines, extraLines, options = {}) {
    const base = baseLines || [];
    const extras = extraLines || [];
    if (!base.length || !extras.length) return;
    const radius = Math.max(0, Number(options.radius ?? 1));
    const maxPerLine = Math.max(1, Number(options.maxPerLine ?? 2));

    const pickOrder = (center, max) => {
        const out = [];
        out.push(center);
        for (let step = 1; step <= radius; step += 1) {
            const left = center - step;
            const right = center + step;
            if (left >= 0) out.push(left);
            if (right < max) out.push(right);
        }
        return out;
    };

    for (let i = 0; i < base.length; i += 1) {
        const line = base[i];
        if (!line) continue;
        if (Array.isArray(line.translations) && line.translations.length) continue;

        const ratio = base.length > 1 ? i / Math.max(base.length - 1, 1) : 0;
        const mapped = Math.round(ratio * Math.max(extras.length - 1, 0));
        const order = pickOrder(mapped, extras.length);
        let added = 0;
        for (let j = 0; j < order.length; j += 1) {
            const extra = extras[order[j]];
            const candidates = collectLyricCandidates(extra);
            if (!candidates.length) continue;
            for (let k = 0; k < candidates.length; k += 1) {
                const text = candidates[k];
                if (text === line.text) continue;
                if (!line.translations.includes(text)) {
                    line.translations.push(text);
                    added += 1;
                }
                if (added >= maxPerLine) break;
            }
            if (added >= maxPerLine) break;
        }
    }
}

function mergeSyncedLyricTracks(trackList) {
    const tracks = (trackList || []).filter((t) => Array.isArray(t) && t.length);
    if (!tracks.length) return [];
    if (tracks.length === 1) return tracks[0];

    const merged = [];

    const ensureBase = (line) => {
        const exact = merged.find((item) => Math.abs(item.time - line.time) < 0.001);
        if (exact) return exact;
        const base = {
            time: line.time,
            anchorTime: Number(line.anchorTime ?? getLyricLineAnchorTime(line)),
            text: line.text,
            words: line.words || null,
            translations: [...(line.translations || [])],
        };
        merged.push(base);
        return base;
    };

    const findNearestBaseInWindow = (time, startIdx) => {
        if (!merged.length) return { target: null, index: -1, diff: Infinity };
        const left = Math.max(0, startIdx - 1);
        const right = Math.min(merged.length - 1, startIdx + 6);
        let bestIndex = -1;
        let bestDiff = Infinity;
        for (let i = left; i <= right; i += 1) {
            const diff = Math.abs(merged[i].time - time);
            if (diff < bestDiff) {
                bestDiff = diff;
                bestIndex = i;
            }
        }
        return {
            target: bestIndex >= 0 ? merged[bestIndex] : null,
            index: bestIndex,
            diff: bestDiff,
        };
    };

    const scoreTrack = (track) => {
        let textChars = 0;
        let wordCount = 0;
        (track || []).forEach((line) => {
            textChars += [...String(line?.text || "")].length;
            wordCount += Array.isArray(line?.words) ? line.words.length : 0;
        });
        return textChars + (track.length * 6) + (wordCount * 2);
    };

    let baseTrackIndex = 0;
    let bestScore = -Infinity;
    for (let i = 0; i < tracks.length; i += 1) {
        const score = scoreTrack(tracks[i]);
        if (score > bestScore) {
            bestScore = score;
            baseTrackIndex = i;
        }
    }

    // Use the richest SYLT track as the base karaoke line.
    tracks[baseTrackIndex].forEach((line) => ensureBase(line));
    const baseAnchorLookup = buildLyricAnchorLookup(merged);

    // Remaining SYLT tracks are treated as translation candidates.
    for (let i = 0; i < tracks.length; i += 1) {
        if (i === baseTrackIndex) continue;
        let cursor = 0;
        const candidateTrack = tracks[i];
        const trackShift = estimateTrackTimeShift(merged, candidateTrack);
        tracks[i].forEach((line) => {
            let base = null;
            const anchorTime = getLyricLineAnchorTime(line);
            const exactIndex = findLyricAnchorMatchedIndex(baseAnchorLookup, anchorTime, cursor);
            if (exactIndex >= 0) {
                base = merged[exactIndex];
                cursor = exactIndex;
            }
            const shiftedTime = Number(line.time || 0) + trackShift;
            const expected = estimateIndexByTime(merged, candidateTrack, shiftedTime);
            if (!base) {
                const narrowCursor = Math.max(0, Math.min(cursor, expected + 2));
                const { target, index, diff } = findNearestBaseInWindow(shiftedTime, narrowCursor);
                if (target && diff <= 0.75) {
                    base = target;
                    cursor = Math.max(0, index);
                } else {
                    return;
                }
            }
            const candidate = pickSingleTranslationCandidate(line, base.text);
            if (!candidate || candidate === base.text) return;
            if (!base.translations.includes(candidate)) {
                base.translations.push(candidate);
            }
        });
    }

    merged.sort((a, b) => a.time - b.time);
    return merged;
}

function mergeTimedLyricsNearest(baseLines, extraLines) {
    const base = (baseLines || []).map((line) => ({
        time: line.time,
        anchorTime: Number(line.anchorTime ?? getLyricLineAnchorTime(line)),
        text: line.text,
        words: line.words || null,
        translations: [...(line.translations || [])],
    }));
    const extras = (extraLines || []).filter((line) => line && (String(line.text || "").trim() || (line.translations && line.translations.length)));
    if (!base.length || !extras.length) return base;

    let cursor = 0;
    const tolerance = 0.7;
    const trackShift = estimateTrackTimeShift(base, extras);
    const baseAnchorLookup = buildLyricAnchorLookup(base);

    const findTarget = (line) => {
        if (!base.length) return null;
        const anchorTime = getLyricLineAnchorTime(line);
        const directAnchorIndex = findLyricAnchorMatchedIndex(baseAnchorLookup, anchorTime, cursor);
        if (directAnchorIndex >= 0) {
            cursor = directAnchorIndex;
            return base[directAnchorIndex];
        }
        const time = Number(line?.time || 0);
        const shiftedTime = Number(time || 0) + trackShift;
        const expected = estimateIndexByTime(base, extras, shiftedTime);
        const left = Math.max(0, Math.min(cursor, expected) - 2);
        const right = Math.min(base.length - 1, Math.max(cursor, expected) + 6);
        let bestIndex = -1;
        let bestDiff = Infinity;
        for (let i = left; i <= right; i += 1) {
            const diff = Math.abs(base[i].time - shiftedTime);
            if (diff < bestDiff) {
                bestDiff = diff;
                bestIndex = i;
            }
        }

        if (bestIndex >= 0 && bestDiff <= tolerance) {
            cursor = Math.max(0, bestIndex);
            return base[bestIndex];
        }

        return null;
    };

    extras.forEach((line) => {
        const candidate = pickSingleTranslationCandidate(line);
        if (!candidate) return;
        let target = findTarget(line);
        if (!target) return;
        if (candidate === target.text) return;
        if (!target.translations.includes(candidate)) {
            target.translations.push(candidate);
        }
    });
    return base;
}

function decodeTextByGuess(bytes) {
    if (!bytes || !bytes.length) return "";
    const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    if (u8.length >= 2) {
        if (u8[0] === 0xff && u8[1] === 0xfe) {
            return new TextDecoder("utf-16le").decode(u8.slice(2)).replace(/\u0000/g, "").trim();
        }
        if (u8[0] === 0xfe && u8[1] === 0xff) {
            const swapped = new Uint8Array(u8.length - 2);
            for (let i = 2; i + 1 < u8.length; i += 2) {
                swapped[i - 2] = u8[i + 1];
                swapped[i - 1] = u8[i];
            }
            return new TextDecoder("utf-16le").decode(swapped).replace(/\u0000/g, "").trim();
        }
    }
    if (u8.length >= 3 && u8[0] === 0xef && u8[1] === 0xbb && u8[2] === 0xbf) {
        return new TextDecoder("utf-8").decode(u8.slice(3)).replace(/\u0000/g, "").trim();
    }

    const sample = Math.min(u8.length, 256);
    let zeroOdd = 0;
    let zeroEven = 0;
    for (let i = 0; i < sample; i += 1) {
        if (i % 2 === 0 && u8[i] === 0) zeroEven += 1;
        if (i % 2 === 1 && u8[i] === 0) zeroOdd += 1;
    }
    if (zeroOdd > sample * 0.2 || zeroEven > sample * 0.2) {
        if (zeroOdd >= zeroEven) {
            return new TextDecoder("utf-16le").decode(u8).replace(/\u0000/g, "").trim();
        }
        const swapped = new Uint8Array(u8.length);
        for (let i = 0; i + 1 < u8.length; i += 2) {
            swapped[i] = u8[i + 1];
            swapped[i + 1] = u8[i];
        }
        return new TextDecoder("utf-16le").decode(swapped).replace(/\u0000/g, "").trim();
    }

    const candidates = [];
    try {
        candidates.push(new TextDecoder("utf-8").decode(u8));
    } catch (error) {
        // ignore
    }
    try {
        candidates.push(new TextDecoder("gb18030").decode(u8));
    } catch (error) {
        // ignore
    }
    try {
        candidates.push(new TextDecoder("gbk").decode(u8));
    } catch (error) {
        // ignore
    }
    if (!candidates.length) return "";
    let best = candidates[0];
    let bestScore = scoreDecodedText(best);
    for (let i = 1; i < candidates.length; i += 1) {
        const score = scoreDecodedText(candidates[i]);
        if (score > bestScore) {
            bestScore = score;
            best = candidates[i];
        }
    }
    return best.replace(/\u0000/g, "").trim();
}

function parseId3Tag(buffer) {
    const bytes = new Uint8Array(buffer);
    const result = {
        title: "",
        artist: "",
        album: "",
        coverUrl: "",
        unsyncedLyrics: "",
        syncedLyrics: [],
    };
    const syltTracks = [];
    const usltTracks = [];
    const txxxTimedTracks = [];
    const txxxTranslationTimedTracks = [];
    const txxxPlainTracks = [];

    function uint32(offset) {
        return (bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3];
    }

    function synchsafe(offset) {
        return (bytes[offset] << 21) | (bytes[offset + 1] << 14) | (bytes[offset + 2] << 7) | bytes[offset + 3];
    }

    if (bytes.length > 10 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
        const version = bytes[3];
        const size = synchsafe(6);
        const end = Math.min(bytes.length, 10 + size);
        let ptr = 10;
        while (ptr + 10 <= end) {
            const frameId = String.fromCharCode(bytes[ptr], bytes[ptr + 1], bytes[ptr + 2], bytes[ptr + 3]);
            if (!/^[A-Z0-9]{4}$/.test(frameId)) break;
            const frameSize = version === 4 ? synchsafe(ptr + 4) : uint32(ptr + 4);
            if (frameSize <= 0) break;
            const dataStart = ptr + 10;
            const dataEnd = dataStart + frameSize;
            if (dataEnd > bytes.length) break;
            const data = bytes.slice(dataStart, dataEnd);

            if (frameId[0] === "T" && frameId !== "TXXX" && data.length > 1) {
                const text = decodeText(data.slice(1), data[0]);
                if (frameId === "TIT2") result.title = text || result.title;
                if (frameId === "TPE1") result.artist = text || result.artist;
                if (frameId === "TALB") result.album = text || result.album;
            }

            if (frameId === "TXXX" && data.length > 1) {
                const encoding = data[0];
                const descInfo = readZeroTerminated(data, 1, encoding);
                const desc = decodeText(descInfo.raw, encoding).toLowerCase();
                const value = decodeText(data.slice(descInfo.next), encoding, true);
                const val = String(value || "").trim();
                if (val) {
                    const parsed = parseLrcText(val);
                    const isTranslationKey = /(trans|translation|译|tlrc|romaji|roman)/i.test(desc);
                    const isLyricKey = /(lyric|lyrics|lrc|krc|karaoke|synced)/i.test(desc);

                    if (parsed.length) {
                        if (isTranslationKey) {
                            txxxTranslationTimedTracks.push(parsed);
                        } else if (isLyricKey || !desc) {
                            txxxTimedTracks.push(parsed);
                        }
                    } else if (isLyricKey || isTranslationKey) {
                        txxxPlainTracks.push(val);
                    }
                }
            }

            if (frameId === "APIC" && data.length > 10 && !result.coverUrl) {
                const encoding = data[0];
                const mimeInfo = readZeroTerminated(data, 1, 0);
                const picTypePos = mimeInfo.next;
                const descInfo = readZeroTerminated(data, picTypePos + 1, encoding);
                const imageRaw = data.slice(descInfo.next);
                const mime = decodeText(mimeInfo.raw, 0) || "image/jpeg";
                if (imageRaw.length > 0) {
                    const blob = new Blob([imageRaw], { type: mime });
                    result.coverUrl = URL.createObjectURL(blob);
                }
            }

            if (frameId === "USLT" && data.length > 6) {
                const encoding = data[0];
                const descInfo = readZeroTerminated(data, 4, encoding);
                const textRaw = data.slice(descInfo.next);
                const text = decodeText(textRaw, encoding);
                if (text) usltTracks.push(text);
            }

            if (frameId === "SYLT" && data.length > 8) {
                const encoding = data[0];
                const descInfo = readZeroTerminated(data, 6, encoding);
                const lyricRaw = data.slice(descInfo.next);
                const parsed = parseSyncedLyrics(lyricRaw, encoding);
                if (parsed.length) syltTracks.push(parsed);
            }

            ptr = dataEnd;
        }
    }

    if (syltTracks.length) {
        result.syncedLyrics = mergeSyncedLyricTracks(syltTracks);
    }

    if (!result.syncedLyrics.length && txxxTimedTracks.length) {
        result.syncedLyrics = txxxTimedTracks[0];
    }
    if (result.syncedLyrics.length) {
        for (const track of txxxTimedTracks) {
            result.syncedLyrics = mergeTimedLyricsNearest(result.syncedLyrics, track);
        }
        for (const track of txxxTranslationTimedTracks) {
            result.syncedLyrics = mergeTimedLyricsNearest(result.syncedLyrics, track);
        }
    }

    if (usltTracks.length) {
        result.unsyncedLyrics = usltTracks.join("\n");
    } else if (txxxPlainTracks.length) {
        result.unsyncedLyrics = txxxPlainTracks.join("\n");
    }

    if ((!result.title || !result.artist || !result.album) && bytes.length >= 128) {
        const start = bytes.length - 128;
        if (bytes[start] === 0x54 && bytes[start + 1] === 0x41 && bytes[start + 2] === 0x47) {
            if (!result.title) result.title = decodeText(bytes.slice(start + 3, start + 33), 0);
            if (!result.artist) result.artist = decodeText(bytes.slice(start + 33, start + 63), 0);
            if (!result.album) result.album = decodeText(bytes.slice(start + 63, start + 93), 0);
        }
    }

    return result;
}

function parseFlacMetadata(buffer) {
    const bytes = new Uint8Array(buffer);
    const result = {
        title: "",
        artist: "",
        album: "",
        coverUrl: "",
        unsyncedLyrics: "",
        syncedLyrics: [],
    };
    if (bytes.length < 8) return result;
    if (!(bytes[0] === 0x66 && bytes[1] === 0x4c && bytes[2] === 0x61 && bytes[3] === 0x43)) {
        return result;
    }
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let ptr = 4;
    let isLast = false;
    while (!isLast && ptr + 4 <= bytes.length) {
        const header = bytes[ptr];
        isLast = (header & 0x80) !== 0;
        const type = header & 0x7f;
        const length = (bytes[ptr + 1] << 16) | (bytes[ptr + 2] << 8) | bytes[ptr + 3];
        ptr += 4;
        if (ptr + length > bytes.length) break;

        if (type === 4) {
            const block = bytes.slice(ptr, ptr + length);
            const view = new DataView(block.buffer, block.byteOffset, block.byteLength);
            let off = 0;
            if (off + 4 > block.length) {
                ptr += length;
                continue;
            }
            const vendorLen = view.getUint32(off, true);
            off += 4 + vendorLen;
            if (off + 4 > block.length) {
                ptr += length;
                continue;
            }
            const listLen = view.getUint32(off, true);
            off += 4;
            for (let i = 0; i < listLen && off + 4 <= block.length; i += 1) {
                const itemLen = view.getUint32(off, true);
                off += 4;
                if (off + itemLen > block.length) break;
                const itemText = decodeTextByGuess(block.slice(off, off + itemLen));
                off += itemLen;
                const eq = itemText.indexOf("=");
                if (eq < 1) continue;
                const key = itemText.slice(0, eq).toUpperCase();
                const val = itemText.slice(eq + 1).trim();
                if (!val) continue;
                if ((key === "TITLE") && !result.title) result.title = val;
                if ((key === "ARTIST" || key === "ALBUMARTIST") && !result.artist) result.artist = val;
                if (key === "ALBUM" && !result.album) result.album = val;
                if ((key === "LYRICS" || key === "UNSYNCEDLYRICS" || key === "UNSYNCED LYRICS") && !result.unsyncedLyrics) {
                    result.unsyncedLyrics = val;
                }
            }
        }

        if (type === 6 && !result.coverUrl) {
            const block = bytes.slice(ptr, ptr + length);
            const view = new DataView(block.buffer, block.byteOffset, block.byteLength);
            let off = 0;
            if (off + 4 > block.length) {
                ptr += length;
                continue;
            }
            off += 4; // picture type
            if (off + 4 > block.length) {
                ptr += length;
                continue;
            }
            const mimeLen = view.getUint32(off, false);
            off += 4;
            if (off + mimeLen > block.length) {
                ptr += length;
                continue;
            }
            const mime = decodeTextByGuess(block.slice(off, off + mimeLen)) || "image/jpeg";
            off += mimeLen;
            if (off + 4 > block.length) {
                ptr += length;
                continue;
            }
            const descLen = view.getUint32(off, false);
            off += 4 + descLen;
            off += 16; // width/height/depth/colors
            if (off + 4 > block.length) {
                ptr += length;
                continue;
            }
            const picLen = view.getUint32(off, false);
            off += 4;
            if (off + picLen > block.length) {
                ptr += length;
                continue;
            }
            const picBytes = block.slice(off, off + picLen);
            const blob = new Blob([picBytes], { type: mime });
            result.coverUrl = URL.createObjectURL(blob);
        }

        ptr += length;
    }
    return result;
}

function parseDanmakuXml(text) {
    const modeMap = {
        4: "bottom",
        5: "top",
    };
    function toColor(value) {
        const n = Number(value);
        if (!Number.isFinite(n) || n < 0) return "#ffffff";
        const hex = Math.floor(n).toString(16).toUpperCase().padStart(6, "0");
        return `#${hex.slice(-6)}`;
    }

    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "application/xml");
    let items = [...xml.querySelectorAll("d")].map((node) => {
        const p = (node.getAttribute("p") || "").split(",");
        const rawMode = Number(p[1] || 1);
        return {
            time: Number(p[0] || 0),
            text: node.textContent || "",
            mode: modeMap[rawMode] || "scroll",
            color: toColor(p[3] || "16777215"),
        };
    }).filter((item) => item.text && Number.isFinite(item.time));

    if (!items.length) {
        const regex = /<d\s+[^>]*p="([^"]+)"[^>]*>([\s\S]*?)<\/d>/gi;
        let match = regex.exec(text);
        while (match) {
            const p = String(match[1] || "").split(",");
            const rawMode = Number(p[1] || 1);
            const decoded = String(match[2] || "")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&amp;/g, "&")
                .replace(/&#39;/g, "'")
                .replace(/&quot;/g, '"');
            items.push({
                time: Number(p[0] || 0),
                text: decoded,
                mode: modeMap[rawMode] || "scroll",
                color: toColor(p[3] || "16777215"),
            });
            match = regex.exec(text);
        }
        items = items.filter((item) => item.text && Number.isFinite(item.time));
    }

    return items.sort((a, b) => a.time - b.time);
}

function parseAssDanmakuColor(rawText) {
    const source = String(rawText || "");
    const matches = [...source.matchAll(/\\(?:1?c|c)&H([0-9A-Fa-f]{1,8})&/gi)];
    if (!matches.length) return "#ffffff";
    const bgr = String(matches[matches.length - 1][1] || "")
        .toUpperCase()
        .padStart(6, "0")
        .slice(-6);
    return `#${bgr.slice(4, 6)}${bgr.slice(2, 4)}${bgr.slice(0, 2)}`;
}

function normalizeDanmakuAssText(rawText) {
    return String(rawText || "")
        .replace(/\{[^}]*\}/g, "")
        .replace(/\\[Nn]/g, " ")
        .replace(/\\h/g, " ")
        .replace(/\\[{}]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function parseDanmakuAssMode(rawText, styleName = "") {
    const source = String(rawText || "");
    const alignMatches = [...source.matchAll(/\\an([1-9])/gi)];
    if (alignMatches.length) {
        const align = Number(alignMatches[alignMatches.length - 1][1]);
        if ([7, 8, 9].includes(align)) return "top";
        if ([1, 2, 3].includes(align)) return "bottom";
    }

    const style = String(styleName || "").toLowerCase();
    if (/(^|[^a-z])(top|upper|up)($|[^a-z])/.test(style) || /上/.test(style)) return "top";
    if (/(^|[^a-z])(bottom|lower|down)($|[^a-z])/.test(style) || /下/.test(style)) return "bottom";
    return "scroll";
}

function parseDanmakuAss(rawText) {
    const source = String(rawText || "").replace(/\r/g, "").replace(/^\uFEFF/, "");
    if (!source) return [];

    const items = [];
    const lines = source.split("\n");
    let inEvents = false;
    let formatFields = [];

    for (let i = 0; i < lines.length; i += 1) {
        const line = String(lines[i] || "").trim();
        if (!line) continue;

        if (/^\[Events\]/i.test(line)) {
            inEvents = true;
            continue;
        }
        if (/^\[[^\]]+\]/.test(line) && !/^\[Events\]/i.test(line)) {
            inEvents = false;
            continue;
        }
        if (!inEvents) continue;

        if (/^Format\s*:/i.test(line)) {
            formatFields = line
                .replace(/^Format\s*:/i, "")
                .split(",")
                .map((field) => field.trim().toLowerCase());
            continue;
        }
        if (!/^Dialogue\s*:/i.test(line)) continue;

        const payload = line.replace(/^Dialogue\s*:\s*/i, "");
        const parts = payload.split(",");
        if (parts.length < 2) continue;

        let startRaw = "";
        let styleRaw = "";
        let textRaw = "";

        if (formatFields.length && parts.length >= formatFields.length) {
            const getFieldValue = (name) => {
                const idx = formatFields.indexOf(name);
                return idx >= 0 ? String(parts[idx] || "").trim() : "";
            };
            const textIdx = formatFields.indexOf("text");
            startRaw = getFieldValue("start");
            styleRaw = getFieldValue("style");
            if (textIdx >= 0) {
                textRaw = parts.slice(textIdx).join(",");
            } else {
                textRaw = parts.slice(formatFields.length - 1).join(",");
            }
        } else {
            if (parts.length < 10) continue;
            startRaw = String(parts[1] || "").trim();
            styleRaw = String(parts[3] || "").trim();
            textRaw = parts.slice(9).join(",");
        }

        const time = parseSubtitleTimecode(startRaw);
        if (!Number.isFinite(time)) continue;

        const text = normalizeDanmakuAssText(textRaw);
        if (!text) continue;

        items.push({
            time,
            text,
            mode: parseDanmakuAssMode(textRaw, styleRaw),
            color: parseAssDanmakuColor(textRaw),
        });
    }

    return items.sort((a, b) => a.time - b.time);
}

function parseSubtitleTimecode(raw) {
    const text = String(raw || "").trim().replace(",", ".");
    const match = text.match(/(?:(\d{1,2}):)?(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?/);
    if (!match) return NaN;
    const h = Number(match[1] || 0);
    const m = Number(match[2] || 0);
    const s = Number(match[3] || 0);
    const ms = Number(String(match[4] || "0").padEnd(3, "0"));
    if (![h, m, s, ms].every((v) => Number.isFinite(v))) return NaN;
    return h * 3600 + m * 60 + s + (ms / 1000);
}

function normalizeSubtitleText(text) {
    return String(text || "")
        .replace(/\uFEFF/g, "")
        .replace(/\r/g, "")
        .replace(/\{[^}]*\}/g, "")
        .replace(/\\N/g, "\n")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join("\n")
        .trim();
}

function parseVttCues(rawText) {
    const source = String(rawText || "").replace(/\r/g, "").replace(/^\uFEFF/, "").trim();
    if (!source) return [];
    const blocks = source.split(/\n{2,}/);
    const cues = [];

    blocks.forEach((block) => {
        const lines = block.split("\n").map((line) => String(line || "").trimEnd());
        if (!lines.length) return;
        if (/^WEBVTT/i.test(lines[0])) return;
        if (/^NOTE\b/i.test(lines[0])) return;
        const timingIndex = lines.findIndex((line) => line.includes("-->"));
        if (timingIndex < 0) return;
        const timingLine = lines[timingIndex];
        const pair = timingLine.split("-->");
        if (pair.length < 2) return;

        const start = parseSubtitleTimecode(pair[0]);
        const endRaw = String(pair[1] || "").trim().split(/\s+/)[0] || "";
        let end = parseSubtitleTimecode(endRaw);
        if (!Number.isFinite(start)) return;
        if (!Number.isFinite(end) || end <= start) end = start + 2;

        const text = normalizeSubtitleText(lines.slice(timingIndex + 1).join("\n"));
        if (!text) return;
        cues.push({ start, end, text });
    });

    return cues.sort((a, b) => a.start - b.start);
}

function parseSrtCues(rawText) {
    const source = String(rawText || "").replace(/\r/g, "").replace(/^\uFEFF/, "").trim();
    if (!source) return [];
    const blocks = source.split(/\n{2,}/);
    const cues = [];

    blocks.forEach((block) => {
        const lines = block.split("\n").map((line) => String(line || "").trimEnd());
        if (!lines.length) return;
        const timingIndex = lines.findIndex((line) => line.includes("-->"));
        if (timingIndex < 0) return;
        const timingLine = lines[timingIndex];
        const pair = timingLine.split("-->");
        if (pair.length < 2) return;

        const start = parseSubtitleTimecode(pair[0]);
        const endRaw = String(pair[1] || "").trim().split(/\s+/)[0] || "";
        let end = parseSubtitleTimecode(endRaw);
        if (!Number.isFinite(start)) return;
        if (!Number.isFinite(end) || end <= start) end = start + 2;

        const text = normalizeSubtitleText(lines.slice(timingIndex + 1).join("\n"));
        if (!text) return;
        cues.push({ start, end, text });
    });

    return cues.sort((a, b) => a.start - b.start);
}

function parseAssCues(rawText) {
    const source = String(rawText || "").replace(/\r/g, "").replace(/^\uFEFF/, "");
    if (!source) return [];
    const cues = [];

    source.split("\n").forEach((line) => {
        if (!/^Dialogue\s*:/i.test(line)) return;
        const payload = String(line || "").replace(/^Dialogue\s*:\s*/i, "");
        const parts = payload.split(",");
        if (parts.length < 10) return;
        const start = parseSubtitleTimecode(parts[1]);
        let end = parseSubtitleTimecode(parts[2]);
        if (!Number.isFinite(start)) return;
        if (!Number.isFinite(end) || end <= start) end = start + 2;
        const text = normalizeSubtitleText(parts.slice(9).join(","));
        if (!text) return;
        cues.push({ start, end, text });
    });

    return cues.sort((a, b) => a.start - b.start);
}

function parseSubtitleCues(rawText, filename = "") {
    const lower = String(filename || "").toLowerCase();
    if (lower.endsWith(".vtt")) return parseVttCues(rawText);
    if (lower.endsWith(".srt")) return parseSrtCues(rawText);
    if (lower.endsWith(".ass") || lower.endsWith(".ssa")) return parseAssCues(rawText);
    const vtt = parseVttCues(rawText);
    if (vtt.length) return vtt;
    const srt = parseSrtCues(rawText);
    if (srt.length) return srt;
    return parseAssCues(rawText);
}

function parseBilibiliJsonSubtitleCues(rawJson) {
    if (!rawJson) return [];
    let payload = rawJson;
    if (typeof payload === "string") {
        try {
            payload = JSON.parse(payload);
        } catch (error) {
            return [];
        }
    }
    const body = Array.isArray(payload?.body) ? payload.body : [];
    return body
        .map((item) => {
            const start = Number(item?.from);
            const end = Number(item?.to);
            const text = normalizeSubtitleText(item?.content || "");
            if (!Number.isFinite(start) || !Number.isFinite(end) || !text) return null;
            return {
                start,
                end: end > start ? end : (start + 2),
                text,
            };
        })
        .filter(Boolean)
        .sort((a, b) => a.start - b.start);
}

function mergeBilingualSubtitleCues(primary, secondary) {
    const a = Array.isArray(primary) ? primary : [];
    const b = Array.isArray(secondary) ? secondary : [];
    if (!a.length) return b;
    if (!b.length) return a;

    const merged = [];
    let cursor = 0;
    for (let i = 0; i < a.length; i += 1) {
        const cue = a[i];
        while (cursor < b.length && b[cursor].end < cue.start - 0.4) {
            cursor += 1;
        }

        let bestIndex = -1;
        let bestScore = -Infinity;
        for (let j = cursor; j < b.length; j += 1) {
            const other = b[j];
            if (other.start > cue.end + 0.6) break;
            const overlap = Math.min(cue.end, other.end) - Math.max(cue.start, other.start);
            const startDiff = Math.abs(other.start - cue.start);
            if (overlap < -0.12 && startDiff > 0.35) continue;
            const score = overlap - (startDiff * 0.5);
            if (score > bestScore) {
                bestScore = score;
                bestIndex = j;
            }
        }

        let text = cue.text;
        let end = cue.end;
        if (bestIndex >= 0) {
            const other = b[bestIndex];
            end = Math.max(end, other.end);
            if (other.text && !isLikelySameLyricText(text, other.text)) {
                text = `${text}\n${other.text}`;
            }
        }
        merged.push({ start: cue.start, end, text: normalizeSubtitleText(text) });
    }

    return merged;
}

function extractColorsFromDataUrl(dataUrl) {
    return new Promise((resolve) => {
        const fallback = ["#1e2a4a", "#15303a", "#2d1f45"];
        let settled = false;
        const finish = (colors) => {
            if (settled) return;
            settled = true;
            resolve(colors || fallback);
        };
        if (!dataUrl) {
            finish(fallback);
            return;
        }
        const img = new Image();
        let timeoutId = null;
        const clearTimer = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
        };
        timeoutId = setTimeout(() => {
            clearTimer();
            finish(fallback);
        }, 1800);
        img.crossOrigin = "anonymous";
        img.onload = () => {
            clearTimer();
            try {
                const c = document.createElement("canvas");
                c.width = 64;
                c.height = 64;
                const ctx = c.getContext("2d");
                if (!ctx) {
                    finish(fallback);
                    return;
                }
                ctx.drawImage(img, 0, 0, 64, 64);
                const raw = ctx.getImageData(0, 0, 64, 64).data;
                const bucket = [];
                for (let i = 0; i < raw.length; i += 32) {
                    const r = raw[i];
                    const g = raw[i + 1];
                    const b = raw[i + 2];
                    bucket.push([r, g, b]);
                }
                const avg = bucket.reduce((acc, rgb) => {
                    acc[0] += rgb[0];
                    acc[1] += rgb[1];
                    acc[2] += rgb[2];
                    return acc;
                }, [0, 0, 0]).map((v) => Math.round(v / Math.max(bucket.length, 1)));
                const tint = (v, delta) => clamp(v + delta, 0, 255);
                const c1 = `rgb(${avg[0]}, ${avg[1]}, ${avg[2]})`;
                const c2 = `rgb(${tint(avg[0], -38)}, ${tint(avg[1], -24)}, ${tint(avg[2], 20)})`;
                const c3 = `rgb(${tint(avg[0], 32)}, ${tint(avg[1], -12)}, ${tint(avg[2], -30)})`;
                finish([c1, c2, c3]);
            } catch (error) {
                finish(fallback);
            }
        };
        img.onerror = () => {
            clearTimer();
            finish(fallback);
        };
        img.src = dataUrl;
    });
}

async function fileToText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                resolve(String(decodeTextByGuess(reader.result)).replace(/\u0000/g, "").trim());
            } catch (error) {
                resolve("");
            }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
}

async function fileToArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
}

export class MediaPlayerCore {
    constructor(options) {
        this.type = options.type;
        this.media = options.media;
        this.cover = options.cover;
        this.lyricsList = options.lyricsList || null;
        this.status = options.status;
        this.fullscreenTarget = options.fullscreenTarget || document.documentElement;
        this.previewImage = options.previewImage;
        this.danmakuLayer = options.danmakuLayer || null;
        this.musicOnly = !!options.musicOnly;

        this.tracks = [];
        this.currentIndex = -1;
        this.loopMode = "none";
        this.currentLyrics = [];
        this.currentLineIndex = -1;
        this.lastLyricLookupIndex = 0;
        this.lyricLineNodes = [];
        this.karaokeLineNodes = [];
        this.lastKaraokeProgress = -1;
        this.karaokeEnabled = true;
        this.showTranslation = true;
        this.lyricBlur = true;
        this.dynamicBg = true;
        this.danmakuEnabled = false;
        this.danmakuList = [];
        this.lastDanmakuTick = -1;
        this.danmakuSize = 24;
        this.danmakuWeight = 700;
        this.danmakuSpeed = 0.8;
        this.danmakuOpacity = 0.9;
        this.blockScrollDanmaku = false;
        this.blockTopDanmaku = false;
        this.blockBottomDanmaku = false;
        this.danmakuLayoutMode = "all";
        this.danmakuLaneEndTime = {
            scroll: Array.from({ length: 10 }, () => 0),
            top: Array.from({ length: 4 }, () => 0),
            bottom: Array.from({ length: 4 }, () => 0),
        };
        this.danmakuCursor = 0;
        this.lastDanmakuTime = -1;
        this.lastDanmakuRenderAt = 0;
        this.subtitleEnabled = true;
        this.subtitleOpacity = 1;
        this.subtitleCues = [];
        this.subtitleLookupIndex = 0;
        this.currentSubtitleText = "";
        this.pauseFadeEnabled = false;
        this.pauseFadeDurationMs = 220;
        this.pauseFadeRafId = 0;
        this.deferPlaylistRender = false;
        this.pendingPlaylistFilter = "";
        this.lastRenderedRunningSecond = -1;
        this.lastRenderedTotalSecond = -1;
        this.coverColorCache = new Map();

        this.objectUrls = new Set();
        this.playOrder = [];
        this.playOrderCursor = -1;
        this.draggedTrackIndex = -1;
        this.previewVideo = null;
        this.previewCanvas = document.createElement("canvas");
        this.previewCanvas.width = 220;
        this.previewCanvas.height = 124;

        this.audioCtx = null;
        this.eqNodes = null;
        this.eqInited = false;
        this.playlistCoverObserver = null;
        this.progressAnimId = null;
        this.isSeeking = false;
        this.lyricSize = 36;
        this.lyricWeight = 600;
        this.lyricTextColor = "#ffffff";
        this.lyricGlowColor = "rgba(255, 255, 255, 0.48)";
        this.lastThemeColors = ["rgb(126, 220, 255)", "rgb(60, 120, 180)", "rgb(255, 159, 128)"];
        this.artPlayer = null;
        this.artDanmukuReady = false;
        this.systemThemeMedia = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
        this.onSystemThemeChanged = () => {
            if (this.getPreferredThemeMode() !== "auto") return;
            this.applyPreferredThemeMode();
            this.refreshThemeAwareColors();
        };
        this.onThemeStorageChanged = (evt) => {
            if (evt && evt.key && !["setting-lightdarktoggle", "follow-system", "theme"].includes(evt.key)) return;
            this.applyPreferredThemeMode();
            this.refreshThemeAwareColors();
        };
        this.fullscreenDockHideTimer = null;
        this.fullscreenDockOriginalParent = null;
        this.fullscreenDockNextSibling = null;
        this.fullscreenStatusOriginalParent = null;
        this.fullscreenStatusNextSibling = null;
        this.fullscreenGestureToastOriginalParent = null;
        this.fullscreenGestureToastNextSibling = null;
        this.statusHideTimer = null;
        this.gestureToastHideTimer = null;
        this.brightnessLevel = 100;
        this.gestureState = null;
        this.lyricScrollbarTimer = null;
        this.lyricAutoScrollUntil = 0;
        this.rightKeyHoldTimer = null;
        this.rightKeyHoldActive = false;
        this.rightKeyOriginalRate = 1;
        this.queuePersistTimer = null;
        this.playlistEditing = false;
        this.playlistSelectedSet = new Set();
        this.embeddedSyncTimer = null;
        this.embeddedTimeHint = 0;
        this.embeddedFallbackHandled = false;
        this.embeddedState = {
            currentTime: 0,
            duration: 0,
            paused: true,
            ended: false,
            qualityLabel: "自动",
            dynamicRange: "SDR",
            audioQuality: "未知",
        };
        this.onEmbeddedMessage = (evt) => this.handleEmbeddedPlayerMessage(evt);
        window.addEventListener("message", this.onEmbeddedMessage);

        this.bindDom();
        this.tryInitArtDanmakuEngine();
        this.applyPreferredThemeMode();
        this.loadSettingsFromStorage();
        this.bindEvents();
        window.addEventListener("storage", this.onThemeStorageChanged);
        if (this.systemThemeMedia) {
            if (this.systemThemeMedia.addEventListener) {
                this.systemThemeMedia.addEventListener("change", this.onSystemThemeChanged);
            } else if (this.systemThemeMedia.addListener) {
                this.systemThemeMedia.addListener(this.onSystemThemeChanged);
            }
        }
        this.setPlayVisual(false);
        this.toggleDanmakuPauseState(true);
        if (this.ui.danmakuSize) this.danmakuSize = Number(this.ui.danmakuSize.value || this.danmakuSize);
        if (this.ui.danmakuWeight) this.danmakuWeight = Number(this.ui.danmakuWeight.value || this.danmakuWeight);
        if (this.ui.danmakuSpeed) this.danmakuSpeed = Number(this.ui.danmakuSpeed.value || this.danmakuSpeed);
        if (this.ui.danmakuOpacity) this.danmakuOpacity = Number(this.ui.danmakuOpacity.value || this.danmakuOpacity);
        if (this.ui.subtitleOpacity) this.subtitleOpacity = Number(this.ui.subtitleOpacity.value || this.subtitleOpacity);
        this.initPlaylistCoverObserver();
        this.refreshSettingValueBadges();
        this.applyThemeFromCover(this.lastThemeColors);
        if (this.type === "video") {
            setTimeout(() => {
                this.restoreQueueFromStorage();
            }, 0);
        }
    }

    bindDom() {
        this.ui = {
            importBtn: document.getElementById("import-btn"),
            importPanel: document.getElementById("import-panel"),
            importFileBtn: document.getElementById("import-file-btn"),
            importFolderBtn: document.getElementById("import-folder-btn"),
            importFileInput: document.getElementById("import-file-input"),
            importFolderInput: document.getElementById("import-folder-input"),
            seek: document.getElementById("seek-range"),
            play: document.getElementById("play-btn"),
            playIcon: document.getElementById("play-icon"),
            prev: document.getElementById("prev-btn"),
            next: document.getElementById("next-btn"),
            back10: document.getElementById("back10-btn"),
            fwd10: document.getElementById("fwd10-btn"),
            settingsBtn: document.getElementById("settings-btn"),
            settingsPanel: document.getElementById("settings-panel"),
            volumeBtn: document.getElementById("volume-btn"),
            volumePanel: document.getElementById("volume-panel"),
            volumeRange: document.getElementById("volume-range"),
            playlistBtn: document.getElementById("playlist-btn"),
            playlistCloseBtn: document.getElementById("playlist-close-btn"),
            playlistDrawer: document.getElementById("playlist-drawer"),
            playlistList: document.getElementById("playlist-list"),
            playlistSearch: document.getElementById("playlist-search"),
            playlistSearchClear: document.getElementById("playlist-search-clear"),
            playlistLocateBtn: document.getElementById("playlist-locate-btn"),
            playlistEditBtn: document.getElementById("playlist-edit-btn"),
            playlistEditToolbar: document.getElementById("playlist-edit-toolbar"),
            playlistSelectAllBtn: document.getElementById("playlist-select-all-btn"),
            playlistInvertBtn: document.getElementById("playlist-invert-btn"),
            playlistDeleteSelectedBtn: document.getElementById("playlist-delete-selected-btn"),
            playlistEditDoneBtn: document.getElementById("playlist-edit-done-btn"),
            fullscreenBtn: document.getElementById("fullscreen-btn"),
            fullscreenIcon: document.querySelector("#fullscreen-btn .fluent-icon"),
            danmakuBtn: document.getElementById("danmaku-btn"),
            danmakuSettingsBtn: document.getElementById("danmaku-settings-btn"),
            danmakuSettingsPanel: document.getElementById("danmaku-settings-panel"),
            danmakuSize: document.getElementById("danmaku-size"),
            danmakuSizeValue: document.getElementById("danmaku-size-value"),
            danmakuWeight: document.getElementById("danmaku-weight"),
            danmakuWeightValue: document.getElementById("danmaku-weight-value"),
            blockScrollDanmaku: document.getElementById("block-scroll-danmaku"),
            blockTopDanmaku: document.getElementById("block-top-danmaku"),
            blockBottomDanmaku: document.getElementById("block-bottom-danmaku"),
            danmakuLayout: document.getElementById("danmaku-layout"),
            danmakuLayoutDropdown: document.getElementById("danmaku-layout-dropdown"),
            danmakuLayoutLabel: document.getElementById("danmaku-layout-label"),
            danmakuSpeed: document.getElementById("danmaku-speed"),
            danmakuSpeedValue: document.getElementById("danmaku-speed-value"),
            danmakuOpacity: document.getElementById("danmaku-opacity"),
            danmakuOpacityValue: document.getElementById("danmaku-opacity-value"),
            title: document.getElementById("track-title"),
            author: document.getElementById("track-author"),
            trackAlbum: document.getElementById("track-album"),
            runningTime: document.getElementById("running-time"),
            totalTime: document.getElementById("total-time"),
            preview: document.getElementById("progress-preview"),
            previewTime: document.getElementById("preview-time"),
            previewTotal: document.getElementById("preview-total"),
            loopButtons: [...document.querySelectorAll("[data-loop]")],
            speedRange: document.getElementById("speed-range"),
            speedValue: document.getElementById("speed-value"),
            brightnessRange: document.getElementById("brightness-range"),
            brightnessValue: document.getElementById("brightness-value"),
            eqLow: document.getElementById("eq-low"),
            eqLowValue: document.getElementById("eq-low-value"),
            eqMid: document.getElementById("eq-mid"),
            eqMidValue: document.getElementById("eq-mid-value"),
            eqHigh: document.getElementById("eq-high"),
            eqHighValue: document.getElementById("eq-high-value"),
            gestureToast: document.getElementById("gesture-toast"),
            gestureToastIcon: document.getElementById("gesture-toast-icon"),
            gestureToastMessage: document.getElementById("gesture-toast-message"),
            subtitleLayer: document.getElementById("subtitle-layer"),
            dynamicBg: document.getElementById("toggle-dynamic-bg"),
            bilibiliPlayer: document.getElementById("bilibili-player"),
            bilibiliClickGuard: document.getElementById("bilibili-click-guard"),
            subtitleMode: document.getElementById("subtitle-mode"),
            qualitySelect: document.getElementById("quality-select"),
            subtitleOpacity: document.getElementById("subtitle-opacity"),
            subtitleOpacityValue: document.getElementById("subtitle-opacity-value"),
            pauseFadeToggle: document.getElementById("toggle-pause-fade"),
            karaoke: document.getElementById("toggle-karaoke"),
            showTranslation: document.getElementById("toggle-translation"),
            lyricBlur: document.getElementById("toggle-lyric-blur"),
            volumeValue: document.getElementById("volume-value"),
            lyricSize: document.getElementById("lyric-size"),
            lyricSizeValue: document.getElementById("lyric-size-value"),
            lyricWeight: document.getElementById("lyric-weight"),
            lyricWeightValue: document.getElementById("lyric-weight-value"),
            videoStage: document.getElementById("video-stage"),
            playerDock: document.querySelector(".player-dock"),
            videoMetaBar: document.getElementById("video-meta-bar"),
            noticeLogStack: document.getElementById("media-notice-log-stack"),
            noticeToastStack: document.getElementById("media-notice-toast-stack"),
        };
    }

    bindEvents() {
        this.ui.importBtn.addEventListener("click", () => this.togglePanel(this.ui.importPanel));
        this.ui.importFileBtn.addEventListener("click", () => this.ui.importFileInput.click());
        this.ui.importFolderBtn.addEventListener("click", () => this.ui.importFolderInput.click());
        this.ui.importFileInput.addEventListener("change", async (evt) => {
            await this.importFiles([...evt.target.files]);
            evt.target.value = "";
            this.ui.importPanel.classList.remove("show");
        });
        this.ui.importFolderInput.addEventListener("change", async (evt) => {
            await this.importFiles([...evt.target.files]);
            evt.target.value = "";
            this.ui.importPanel.classList.remove("show");
        });

        this.ui.seek.addEventListener("input", () => {
            const time = Number(this.ui.seek.value);
            if (Number.isFinite(time)) {
                this.isSeeking = true;
                const track = this.tracks[this.currentIndex];
                if (track?.embedUrl) {
                    this.embeddedState.currentTime = Math.max(0, time);
                    this.embeddedTimeHint = this.embeddedState.currentTime;
                    this.postEmbeddedCommand("seek", { time: this.embeddedState.currentTime });
                } else {
                    this.media.currentTime = time;
                }
                this.refreshTime();
            }
        });
        this.ui.seek.addEventListener("change", () => {
            this.isSeeking = false;
            this.refreshTime();
        });

        this.ui.seek.addEventListener("mousemove", (evt) => this.handlePreviewMove(evt));
        this.ui.seek.addEventListener("mouseenter", (evt) => this.handlePreviewMove(evt));
        this.ui.seek.addEventListener("mouseleave", () => this.ui.preview.classList.remove("show"));

        if (this.lyricsList) {
            const markManualLyricScroll = () => {
                if (Date.now() < this.lyricAutoScrollUntil) return;
                this.showLyricsScrollbarTemporarily();
            };
            this.lyricsList.addEventListener("wheel", markManualLyricScroll, { passive: true });
            this.lyricsList.addEventListener("touchstart", markManualLyricScroll, { passive: true });
            this.lyricsList.addEventListener("pointerdown", markManualLyricScroll, { passive: true });
            this.lyricsList.addEventListener("scroll", markManualLyricScroll, { passive: true });
        }

        this.ui.play.addEventListener("click", () => this.togglePlay());
        this.ui.prev.addEventListener("click", () => this.playPrev());
        this.ui.next.addEventListener("click", () => this.playNext());
        this.ui.back10.addEventListener("click", () => this.seekBy(-10));
        this.ui.fwd10.addEventListener("click", () => this.seekBy(10));

        this.ui.settingsBtn.addEventListener("click", () => this.togglePanel(this.ui.settingsPanel));
        this.ui.volumeBtn.addEventListener("click", () => this.togglePanel(this.ui.volumePanel));
        this.ui.playlistBtn.addEventListener("click", () => {
            this.ui.playlistDrawer.classList.toggle("show");
            if (this.ui.playlistDrawer.classList.contains("show")) {
                this.syncPlaylistEditingVisualState();
                this.loadVisiblePlaylistCovers();
            }
        });
        if (this.ui.playlistCloseBtn) {
            this.ui.playlistCloseBtn.addEventListener("click", () => this.ui.playlistDrawer.classList.remove("show"));
        }
        if (this.ui.playlistLocateBtn) {
            this.ui.playlistLocateBtn.addEventListener("click", () => this.scrollPlaylistToCurrent());
        }
        if (this.ui.playlistEditBtn) {
            this.ui.playlistEditBtn.addEventListener("click", () => this.togglePlaylistEditing());
        }
        if (this.ui.playlistEditDoneBtn) {
            this.ui.playlistEditDoneBtn.addEventListener("click", () => this.togglePlaylistEditing(false));
        }
        if (this.ui.playlistSelectAllBtn) {
            this.ui.playlistSelectAllBtn.addEventListener("click", () => this.selectAllPlaylistItems());
        }
        if (this.ui.playlistInvertBtn) {
            this.ui.playlistInvertBtn.addEventListener("click", () => this.invertPlaylistSelection());
        }
        if (this.ui.playlistDeleteSelectedBtn) {
            this.ui.playlistDeleteSelectedBtn.addEventListener("click", () => this.deleteSelectedPlaylistItems());
        }
        if (this.ui.playlistList) {
            this.ui.playlistList.addEventListener("scroll", () => this.loadVisiblePlaylistCovers(), { passive: true });
        }
        if (this.cover) {
            this.cover.setAttribute("data-lightbox", "on");
            this.cover.addEventListener("click", () => {
                const lightbox = window.siteLightbox;
                if (!lightbox || typeof lightbox.refresh !== "function" || typeof lightbox.open !== "function") return;
                const currentTrack = this.tracks[this.currentIndex];
                const src = currentTrack?.coverUrl || this.cover?.src || "";
                if (!src) return;
                if (this.cover.src !== src) this.cover.src = src;
                lightbox.refresh();
                const allCandidates = Array.from(document.querySelectorAll("main img, img[data-lightbox='on']")).filter((img) => {
                    const lb = String(img.getAttribute("data-lightbox") || "").toLowerCase();
                    return lb !== "false" && lb !== "off";
                });
                const idx = allCandidates.indexOf(this.cover);
                if (idx >= 0) lightbox.open(idx);
            });
        }
        if (this.ui.danmakuSettingsBtn && this.ui.danmakuSettingsPanel) {
            this.ui.danmakuSettingsBtn.addEventListener("click", () => this.togglePanel(this.ui.danmakuSettingsPanel));
        }

        this.ui.volumeRange.addEventListener("input", () => {
            this.media.volume = Number(this.ui.volumeRange.value);
            this.saveSetting("volume", this.media.volume);
            this.refreshSettingValueBadges();
        });

        this.ui.playlistSearch.addEventListener("input", () => {
            this.renderPlaylist(this.ui.playlistSearch.value.trim().toLowerCase());
            this.refreshPlaylistSearchClearButton();
        });
        if (this.ui.playlistSearchClear) {
            const clearSearch = () => {
                this.ui.playlistSearch.value = "";
                this.renderPlaylist("");
                this.refreshPlaylistSearchClearButton();
                this.ui.playlistSearch.focus();
            };
            this.ui.playlistSearchClear.addEventListener("click", clearSearch);
            this.ui.playlistSearchClear.addEventListener("pointerdown", () => {
                this.ui.playlistSearchClear.classList.add("is-feedback");
            });
            const clearPressState = () => this.ui.playlistSearchClear.classList.remove("is-feedback");
            this.ui.playlistSearchClear.addEventListener("pointerup", clearPressState);
            this.ui.playlistSearchClear.addEventListener("pointerleave", clearPressState);
            this.ui.playlistSearchClear.addEventListener("blur", clearPressState);
        }

        this.ui.fullscreenBtn.addEventListener("click", async () => {
            if (this.isFullscreenActive()) {
                await this.exitFullscreenCompat();
                setTimeout(() => this.refreshFullscreenButtonVisual(this.isFullscreenActive()), 60);
                return;
            }
            await this.requestFullscreenCompat();
            setTimeout(() => this.refreshFullscreenButtonVisual(this.isFullscreenActive()), 60);
        });

        this.ui.speedRange.addEventListener("input", () => {
            this.media.playbackRate = Number(this.ui.speedRange.value || 1);
            this.saveSetting("speed", this.media.playbackRate);
            this.refreshSettingValueBadges();
        });

        if (this.ui.brightnessRange) {
            this.ui.brightnessRange.addEventListener("input", () => {
                this.brightnessLevel = clamp(Number(this.ui.brightnessRange.value || 100), 0, 100);
                this.applyBrightness();
                this.saveSetting("brightness", this.brightnessLevel);
                this.refreshSettingValueBadges();
                if (this.type === "video") {
                    this.showGestureToast(`亮度 ${Math.round(this.brightnessLevel)}%`, "brightness");
                }
            });
        }

        [this.ui.eqLow, this.ui.eqMid, this.ui.eqHigh].forEach((node) => {
            node.addEventListener("input", () => {
                this.updateEq();
                this.saveEqSettings();
                this.refreshSettingValueBadges();
            });
        });

        this.ui.dynamicBg.addEventListener("change", () => {
            this.dynamicBg = this.ui.dynamicBg.checked;
            document.body.classList.toggle("dynamic-off", !this.dynamicBg);
            this.saveSetting("dynamicBg", this.dynamicBg);
        });

        if (this.ui.subtitleMode) {
            this.ui.subtitleMode.addEventListener("change", () => {
                const mode = this.ui.subtitleMode.value || "on";
                this.subtitleEnabled = mode === "on";
                this.saveSetting("subtitleMode", mode);
                this.renderSubtitles();
            });
        }

        if (this.ui.qualitySelect) {
            this.ui.qualitySelect.addEventListener("change", () => {
                this.saveSetting("bilibiliQuality", this.ui.qualitySelect.value || "0");
                const track = this.tracks[this.currentIndex];
                if (track?.embedUrl) {
                    this.embeddedState.qualityLabel = bilibiliQualityLabel(this.ui.qualitySelect.value || "0");
                    this.refreshTrackMetaDisplay(track);
                    this.refreshEmbeddedPlayer(track, { resetToStart: false });
                }
            });
        }

        if (this.ui.subtitleOpacity) {
            this.ui.subtitleOpacity.addEventListener("input", () => {
                this.subtitleOpacity = clamp(Number(this.ui.subtitleOpacity.value || 1), 0.2, 1);
                this.applySubtitleOpacity();
                this.saveSetting("subtitleOpacity", this.subtitleOpacity);
                this.refreshSettingValueBadges();
            });
        }

        if (this.ui.pauseFadeToggle) {
            this.ui.pauseFadeToggle.addEventListener("change", () => {
                this.pauseFadeEnabled = this.ui.pauseFadeToggle.checked;
                this.saveSetting("pauseFadeEnabled", this.pauseFadeEnabled);
                if (!this.pauseFadeEnabled) {
                    this.cancelPauseFadeAnimation();
                    this.restoreMasterGainForPlayback();
                }
            });
        }

        if (this.ui.karaoke) {
            this.ui.karaoke.addEventListener("change", () => {
                this.karaokeEnabled = this.ui.karaoke.checked;
                this.saveSetting("karaoke", this.karaokeEnabled);
                this.renderLyrics();
                this.refreshLyrics();
            });
        }
        if (this.ui.showTranslation) {
            this.ui.showTranslation.addEventListener("change", () => {
                this.showTranslation = this.ui.showTranslation.checked;
                this.saveSetting("showTranslation", this.showTranslation);
                this.renderLyrics();
                this.refreshLyrics();
            });
        }
        if (this.ui.lyricBlur) {
            this.ui.lyricBlur.addEventListener("change", () => {
                this.lyricBlur = this.ui.lyricBlur.checked;
                this.saveSetting("lyricBlur", this.lyricBlur);
                this.refreshLyrics();
            });
        }
        if (this.ui.lyricSize) {
            this.ui.lyricSize.addEventListener("input", () => {
                this.lyricSize = Number(this.ui.lyricSize.value || 36);
                this.saveSetting("lyricSize", this.lyricSize);
                this.refreshSettingValueBadges();
                this.applyLyricTypography();
            });
        }
        if (this.ui.lyricWeight) {
            this.ui.lyricWeight.addEventListener("input", () => {
                this.lyricWeight = Number(this.ui.lyricWeight.value || 800);
                this.saveSetting("lyricWeight", this.lyricWeight);
                this.refreshSettingValueBadges();
                this.applyLyricTypography();
            });
        }

        this.ui.loopButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
                this.loopMode = btn.dataset.loop;
                this.syncLoopButtonState();
                if (this.loopMode === "shuffle") {
                    this.ensurePlaybackOrder({ reshuffle: true });
                } else {
                    this.ensurePlaybackOrder();
                }
                this.renderPlaylist(this.ui.playlistSearch.value.trim().toLowerCase());
                this.saveSetting("loopMode", this.loopMode);
                this.scheduleQueuePersistence();
            });
        });

        if (this.ui.danmakuBtn) {
            this.ui.danmakuBtn.addEventListener("click", () => {
                this.danmakuEnabled = !this.danmakuEnabled;
                this.ui.danmakuBtn.setAttribute("aria-pressed", this.danmakuEnabled ? "true" : "false");
                if (!this.danmakuEnabled && this.danmakuLayer) this.danmakuLayer.innerHTML = "";
                this.syncDanmakuRenderer();
                this.saveSetting("danmakuEnabled", this.danmakuEnabled);
            });
        }

        if (this.ui.danmakuSize) {
            this.ui.danmakuSize.addEventListener("input", () => {
                this.danmakuSize = Number(this.ui.danmakuSize.value || 24);
                this.syncDanmakuRenderer();
                this.saveSetting("danmakuSize", this.danmakuSize);
                this.refreshSettingValueBadges();
            });
        }
        if (this.ui.danmakuWeight) {
            this.ui.danmakuWeight.addEventListener("input", () => {
                this.danmakuWeight = Number(this.ui.danmakuWeight.value || 700);
                this.syncDanmakuRenderer();
                this.saveSetting("danmakuWeight", this.danmakuWeight);
                this.refreshSettingValueBadges();
            });
        }
        if (this.ui.blockScrollDanmaku) {
            this.ui.blockScrollDanmaku.addEventListener("change", () => {
                this.blockScrollDanmaku = this.ui.blockScrollDanmaku.checked;
                this.syncDanmakuRenderer();
                this.saveSetting("blockScrollDanmaku", this.blockScrollDanmaku);
            });
        }
        if (this.ui.blockTopDanmaku) {
            this.ui.blockTopDanmaku.addEventListener("change", () => {
                this.blockTopDanmaku = this.ui.blockTopDanmaku.checked;
                this.syncDanmakuRenderer();
                this.saveSetting("blockTopDanmaku", this.blockTopDanmaku);
            });
        }
        if (this.ui.blockBottomDanmaku) {
            this.ui.blockBottomDanmaku.addEventListener("change", () => {
                this.blockBottomDanmaku = this.ui.blockBottomDanmaku.checked;
                this.syncDanmakuRenderer();
                this.saveSetting("blockBottomDanmaku", this.blockBottomDanmaku);
            });
        }
        if (this.ui.danmakuLayout) {
            this.ui.danmakuLayout.addEventListener("change", () => {
                this.danmakuLayoutMode = this.ui.danmakuLayout.value || "all";
                this.syncDanmakuLayoutDropdownLabel(this.danmakuLayoutMode);
                this.syncDanmakuRenderer();
                this.saveSetting("danmakuLayoutMode", this.danmakuLayoutMode);
            });
        }
        if (this.ui.danmakuSpeed) {
            this.ui.danmakuSpeed.addEventListener("input", () => {
                this.danmakuSpeed = Number(this.ui.danmakuSpeed.value || 0.8);
                this.syncDanmakuRenderer();
                this.saveSetting("danmakuSpeed", this.danmakuSpeed);
                this.refreshSettingValueBadges();
            });
        }
        if (this.ui.danmakuOpacity) {
            this.ui.danmakuOpacity.addEventListener("input", () => {
                this.danmakuOpacity = Number(this.ui.danmakuOpacity.value || 0.9);
                this.syncDanmakuRenderer();
                this.saveSetting("danmakuOpacity", this.danmakuOpacity);
                this.refreshSettingValueBadges();
            });
        }

        this.media.addEventListener("loadedmetadata", () => {
            this.ui.seek.max = String(this.media.duration || 0);
            this.ui.totalTime.textContent = formatTime(this.media.duration || 0);
            this.ui.previewTotal.textContent = formatTime(this.media.duration || 0);
            if (this.type === "video") {
                this.captureThirtyPercentFrame();
                this.showVideoResolutionStatus();
            }
        });

        this.media.addEventListener("timeupdate", () => {
            if (!this.progressAnimId) this.refreshTime();
            if (!this.progressAnimId) {
                this.refreshLyrics();
                this.renderDanmaku();
            }
        });

        this.media.addEventListener("progress", () => this.refreshTime());

        this.media.addEventListener("play", () => {
            this.setPlayVisual(true);
            this.toggleDanmakuPauseState(false);
            this.startProgressAnimation();
        });

        this.media.addEventListener("pause", () => {
            this.setPlayVisual(false);
            this.toggleDanmakuPauseState(true);
            this.stopProgressAnimation();
        });

        this.media.addEventListener("ended", () => {
            this.stopProgressAnimation();
            this.onTrackEnded();
        });

        this.bindValueInputEditors();
        this.bindDanmakuLayoutDropdown();
        this.bindMediaSelectDropdown("subtitle-mode-dropdown", this.ui.subtitleMode, "subtitle-mode-label");
        this.bindMediaSelectDropdown("quality-select-dropdown", this.ui.qualitySelect, "quality-select-label");
        this.syncComponentRangeVisuals();

        if (this.type === "video" && this.ui.videoStage) {
            this.ui.videoStage.addEventListener("dblclick", () => this.togglePlay());
            this.bindVideoGestureEvents();
        }

        this.refreshPlaylistSearchClearButton();
        this.refreshFullscreenButtonVisual(this.isFullscreenActive());

        document.addEventListener("fullscreenchange", () => this.handleFullscreenDockState());
        document.addEventListener("webkitfullscreenchange", () => this.handleFullscreenDockState());
        window.addEventListener("mousemove", (evt) => this.handleVideoFullscreenHover(evt));

        document.addEventListener("click", (evt) => {
            const target = evt.target;
            const inSettingsTrigger = !!(this.ui.settingsBtn && this.ui.settingsBtn.contains(target));
            const inVolumeTrigger = !!(this.ui.volumeBtn && this.ui.volumeBtn.contains(target));
            const inImportTrigger = !!(this.ui.importBtn && this.ui.importBtn.contains(target));

            this.handleDanmakuLayoutDropdownOutsideClick(target);
            this.closeMediaSelectDropdowns(target);

            if (!this.ui.settingsPanel.contains(target) && !inSettingsTrigger) {
                this.ui.settingsPanel.classList.remove("show");
            }
            if (!this.ui.volumePanel.contains(target) && !inVolumeTrigger) {
                this.ui.volumePanel.classList.remove("show");
            }
            if (!this.ui.importPanel.contains(target) && !inImportTrigger) {
                this.ui.importPanel.classList.remove("show");
            }
            if (this.ui.danmakuSettingsPanel && this.ui.danmakuSettingsBtn) {
                const inDanmakuTrigger = this.ui.danmakuSettingsBtn.contains(target);
                if (!this.ui.danmakuSettingsPanel.contains(target) && !inDanmakuTrigger) {
                    this.ui.danmakuSettingsPanel.classList.remove("show");
                }
            }
        });

        window.addEventListener("keydown", (evt) => {
            if (evt.key === "Escape") {
                this.closeDanmakuLayoutDropdown();
            }
            if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName || "")) return;
            if (evt.key === "ArrowLeft") {
                evt.preventDefault();
                this.seekBy(-10);
            }
            if (evt.key === "ArrowRight") {
                evt.preventDefault();
                if (!evt.repeat && !this.rightKeyHoldActive) {
                    this.seekBy(10);
                }
                this.beginRightArrowHold();
            }
            if (evt.key === " ") {
                evt.preventDefault();
                this.togglePlay();
            }
        });

        window.addEventListener("keyup", (evt) => {
            if (evt.key === "ArrowRight") {
                this.endRightArrowHold();
            }
        });

        window.addEventListener("blur", () => this.endRightArrowHold());
    }

    beginRightArrowHold() {
        if (this.rightKeyHoldActive) return;
        if (this.rightKeyHoldTimer) clearTimeout(this.rightKeyHoldTimer);
        this.rightKeyHoldTimer = setTimeout(() => {
            this.rightKeyHoldTimer = null;
            const currentRate = Number(this.media?.playbackRate || 1);
            this.rightKeyOriginalRate = Number.isFinite(currentRate) ? currentRate : 1;
            this.media.playbackRate = 2;
            this.rightKeyHoldActive = true;
            this.showGestureToast("临时 2.00x", "speed");
        }, 260);
    }

    endRightArrowHold() {
        if (this.rightKeyHoldTimer) {
            clearTimeout(this.rightKeyHoldTimer);
            this.rightKeyHoldTimer = null;
        }
        if (!this.rightKeyHoldActive) return;
        const restore = Number(this.rightKeyOriginalRate || 1);
        this.media.playbackRate = clamp(restore, 0.5, 2);
        this.rightKeyHoldActive = false;
        this.showGestureToast(`恢复 ${this.media.playbackRate.toFixed(2)}x`, "speed");
    }

    togglePanel(panel) {
        const willShow = !panel.classList.contains("show");
        this.closeDanmakuLayoutDropdown();
        this.ui.settingsPanel.classList.remove("show");
        this.ui.volumePanel.classList.remove("show");
        this.ui.importPanel.classList.remove("show");
        if (this.ui.danmakuSettingsPanel) this.ui.danmakuSettingsPanel.classList.remove("show");
        if (willShow) panel.classList.add("show");
    }

    toggleDanmakuPauseState(paused) {
        if (!this.danmakuLayer) return;
        this.danmakuLayer.classList.toggle("paused", !!paused);
    }

    refreshSettingValueBadges() {
        const setNodeValue = (node, valueText) => {
            if (!node) return;
            if ("value" in node) {
                node.value = valueText;
                return;
            }
            node.textContent = valueText;
        };
        if (this.ui.speedValue && this.ui.speedRange) {
            setNodeValue(this.ui.speedValue, `${Number(this.ui.speedRange.value || 1).toFixed(2)}x`);
        }
        if (this.ui.brightnessValue) {
            setNodeValue(this.ui.brightnessValue, `${Math.round(this.brightnessLevel)}%`);
        }
        if (this.ui.volumeValue && this.ui.volumeRange) {
            setNodeValue(this.ui.volumeValue, `${Math.round(Number(this.ui.volumeRange.value || 1) * 100)}%`);
        }
        if (this.ui.eqLowValue && this.ui.eqLow) {
            const v = Number(this.ui.eqLow.value || 0);
            setNodeValue(this.ui.eqLowValue, `${v >= 0 ? "+" : ""}${v} dB`);
        }
        if (this.ui.eqMidValue && this.ui.eqMid) {
            const v = Number(this.ui.eqMid.value || 0);
            setNodeValue(this.ui.eqMidValue, `${v >= 0 ? "+" : ""}${v} dB`);
        }
        if (this.ui.eqHighValue && this.ui.eqHigh) {
            const v = Number(this.ui.eqHigh.value || 0);
            setNodeValue(this.ui.eqHighValue, `${v >= 0 ? "+" : ""}${v} dB`);
        }
        if (this.ui.danmakuSizeValue && this.ui.danmakuSize) {
            setNodeValue(this.ui.danmakuSizeValue, `${Number(this.ui.danmakuSize.value || 24)} px`);
        }
        if (this.ui.danmakuWeightValue && this.ui.danmakuWeight) {
            setNodeValue(this.ui.danmakuWeightValue, `${Number(this.ui.danmakuWeight.value || 700)} wt`);
        }
        if (this.ui.danmakuSpeedValue && this.ui.danmakuSpeed) {
            setNodeValue(this.ui.danmakuSpeedValue, `${Number(this.ui.danmakuSpeed.value || 0.8).toFixed(1)}x`);
        }
        if (this.ui.danmakuOpacityValue && this.ui.danmakuOpacity) {
            setNodeValue(this.ui.danmakuOpacityValue, `${Math.round(Number(this.ui.danmakuOpacity.value || 0.9) * 100)}%`);
        }
        if (this.ui.subtitleOpacityValue && this.ui.subtitleOpacity) {
            setNodeValue(this.ui.subtitleOpacityValue, `${Math.round(Number(this.ui.subtitleOpacity.value || 1) * 100)}%`);
        }
        if (this.ui.lyricSizeValue && this.ui.lyricSize) {
            setNodeValue(this.ui.lyricSizeValue, `${Number(this.ui.lyricSize.value || 36)} px`);
        }
        if (this.ui.lyricWeightValue && this.ui.lyricWeight) {
            setNodeValue(this.ui.lyricWeightValue, `${Number(this.ui.lyricWeight.value || 800)} wt`);
        }
        this.syncComponentRangeVisuals();
    }

    syncComponentRangeVisuals(scope = document) {
        const sliders = scope.querySelectorAll('input[type="range"].component-range-slider');
        sliders.forEach((rangeEl) => {
            const update = () => {
                const min = Number(rangeEl.min || 0);
                const max = Number(rangeEl.max || 100);
                const value = Number(rangeEl.value || min);
                const safeMax = max <= min ? min + 1 : max;
                const pct = ((value - min) / (safeMax - min)) * 100;
                const clamped = Math.min(100, Math.max(0, pct));
                rangeEl.style.setProperty("--slider-pct", `${clamped.toFixed(2)}%`);
            };

            if (rangeEl.dataset.boundSliderPct !== "true") {
                rangeEl.dataset.boundSliderPct = "true";
                rangeEl.addEventListener("input", update);
                rangeEl.addEventListener("change", update);
            }
            update();
        });
    }

    bindValueInputEditors() {
        const bind = (valueNode, rangeNode, options = {}) => {
            if (!valueNode || !rangeNode || !("value" in valueNode)) return;
            const apply = () => {
                const rawText = String(valueNode.value || "").trim();
                let parsed = options.parse ? options.parse(rawText, Number(rangeNode.value || 0)) : Number(rawText);
                if (!Number.isFinite(parsed)) {
                    this.refreshSettingValueBadges();
                    return;
                }
                parsed = clamp(parsed, options.min ?? parsed, options.max ?? parsed);
                if (Number.isFinite(options.step) && options.step > 0) {
                    parsed = Math.round(parsed / options.step) * options.step;
                    parsed = Number(parsed.toFixed(4));
                }
                rangeNode.value = String(parsed);
                rangeNode.dispatchEvent(new Event("input", { bubbles: true }));
            };
            valueNode.addEventListener("change", apply);
            valueNode.addEventListener("blur", apply);
            valueNode.addEventListener("keydown", (evt) => {
                if (evt.key !== "Enter") return;
                evt.preventDefault();
                apply();
                valueNode.blur();
            });
        };

        const parseFloatFromText = (text, fallback = NaN) => {
            const matched = String(text || "").match(/-?\d+(?:\.\d+)?/);
            if (!matched) return fallback;
            return Number(matched[0]);
        };
        const parsePercentOrRatio = (text, fallback = NaN) => {
            const n = parseFloatFromText(text, fallback);
            if (!Number.isFinite(n)) return fallback;
            return String(text).includes("%") ? n / 100 : (n > 1 ? n / 100 : n);
        };

        bind(this.ui.speedValue, this.ui.speedRange, {
            min: 0.5,
            max: 2,
            step: 0.05,
            parse: (text, fallback) => parseFloatFromText(text, fallback),
        });
        bind(this.ui.brightnessValue, this.ui.brightnessRange, {
            min: 0,
            max: 100,
            step: 1,
            parse: (text, fallback) => {
                const n = parseFloatFromText(text, fallback);
                return Number.isFinite(n) ? n : fallback;
            },
        });
        bind(this.ui.volumeValue, this.ui.volumeRange, {
            min: 0,
            max: 1,
            step: 0.01,
            parse: (text, fallback) => parsePercentOrRatio(text, fallback),
        });
        bind(this.ui.eqLowValue, this.ui.eqLow, {
            min: -12,
            max: 12,
            step: 1,
            parse: (text, fallback) => parseFloatFromText(text, fallback),
        });
        bind(this.ui.eqMidValue, this.ui.eqMid, {
            min: -12,
            max: 12,
            step: 1,
            parse: (text, fallback) => parseFloatFromText(text, fallback),
        });
        bind(this.ui.eqHighValue, this.ui.eqHigh, {
            min: -12,
            max: 12,
            step: 1,
            parse: (text, fallback) => parseFloatFromText(text, fallback),
        });
        bind(this.ui.lyricSizeValue, this.ui.lyricSize, {
            min: 24,
            max: 84,
            step: 1,
            parse: (text, fallback) => parseFloatFromText(text, fallback),
        });
        bind(this.ui.lyricWeightValue, this.ui.lyricWeight, {
            min: 500,
            max: 900,
            step: 100,
            parse: (text, fallback) => parseFloatFromText(text, fallback),
        });
        bind(this.ui.danmakuSizeValue, this.ui.danmakuSize, {
            min: 14,
            max: 42,
            step: 1,
            parse: (text, fallback) => parseFloatFromText(text, fallback),
        });
        bind(this.ui.danmakuWeightValue, this.ui.danmakuWeight, {
            min: 400,
            max: 900,
            step: 100,
            parse: (text, fallback) => parseFloatFromText(text, fallback),
        });
        bind(this.ui.danmakuSpeedValue, this.ui.danmakuSpeed, {
            min: 0.5,
            max: 2,
            step: 0.1,
            parse: (text, fallback) => parseFloatFromText(text, fallback),
        });
        bind(this.ui.danmakuOpacityValue, this.ui.danmakuOpacity, {
            min: 0.2,
            max: 1,
            step: 0.05,
            parse: (text, fallback) => parsePercentOrRatio(text, fallback),
        });
        bind(this.ui.subtitleOpacityValue, this.ui.subtitleOpacity, {
            min: 0.2,
            max: 1,
            step: 0.05,
            parse: (text, fallback) => parsePercentOrRatio(text, fallback),
        });
    }

    refreshFullscreenButtonVisual(inFullscreen) {
        if (!this.ui.fullscreenBtn || !this.ui.fullscreenIcon) return;
        const normalLabel = this.type === "video" ? "全屏视频" : "全屏页面";
        this.ui.fullscreenBtn.setAttribute("title", inFullscreen ? "退出全屏" : normalLabel);
        this.ui.fullscreenBtn.setAttribute("aria-label", inFullscreen ? "退出全屏" : normalLabel);
        this.ui.fullscreenIcon.className = inFullscreen
            ? "fluent-icon icon-ic_fluent_full_screen_minimize_24_regular"
            : "fluent-icon icon-ic_fluent_full_screen_maximize_24_regular";
    }

    isFullscreenActive() {
        return !!(document.fullscreenElement || document.webkitFullscreenElement);
    }

    async requestFullscreenCompat() {
        if (!this.fullscreenTarget) return;
        if (typeof this.fullscreenTarget.requestFullscreen === "function") {
            await this.fullscreenTarget.requestFullscreen();
            return;
        }
        if (typeof this.fullscreenTarget.webkitRequestFullscreen === "function") {
            this.fullscreenTarget.webkitRequestFullscreen();
        }
    }

    async exitFullscreenCompat() {
        if (typeof document.exitFullscreen === "function") {
            await document.exitFullscreen();
            return;
        }
        if (typeof document.webkitExitFullscreen === "function") {
            document.webkitExitFullscreen();
        }
    }

    setProgressVisual(cur, total) {
        if (!this.ui.seek) return;
        const safeTotal = total > 0 ? total : 0;
        const ratio = safeTotal > 0 ? clamp(cur / safeTotal, 0, 1) : 0;
        this.ui.seek.style.setProperty("--progress-percent", `${(ratio * 100).toFixed(3)}%`);
    }

    startProgressAnimation() {
        if (this.progressAnimId) return;
        const tick = (ts) => {
            this.refreshTime();
            this.refreshLyrics();
            if (this.type === "video" && (ts - this.lastDanmakuRenderAt >= 50)) {
                this.renderDanmaku();
                this.lastDanmakuRenderAt = ts;
            }
            if (!this.media.paused && !this.media.ended) {
                this.progressAnimId = requestAnimationFrame(tick);
            } else {
                this.progressAnimId = null;
            }
        };
        this.progressAnimId = requestAnimationFrame(tick);
    }

    stopProgressAnimation() {
        if (!this.progressAnimId) return;
        cancelAnimationFrame(this.progressAnimId);
        this.progressAnimId = null;
    }

    initPlaylistCoverObserver() {
        if (!this.ui.playlistList || this.playlistCoverObserver || typeof IntersectionObserver === "undefined") return;
        this.playlistCoverObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const img = entry.target;
                const src = img.getAttribute("data-src");
                if (src && img.src !== src) {
                    img.src = src;
                    img.removeAttribute("data-src");
                }
                this.playlistCoverObserver.unobserve(img);
            });
        }, {
            root: this.ui.playlistList,
            rootMargin: "80px 0px",
            threshold: 0.01,
        });
    }

    loadVisiblePlaylistCovers() {
        if (!this.ui.playlistList) return;
        const listRect = this.ui.playlistList.getBoundingClientRect();
        this.ui.playlistList.querySelectorAll("img[data-src]").forEach((img) => {
            const rect = img.getBoundingClientRect();
            if (rect.bottom >= listRect.top - 40 && rect.top <= listRect.bottom + 40) {
                const src = img.getAttribute("data-src");
                if (src) {
                    img.src = src;
                    img.removeAttribute("data-src");
                }
            }
        });
    }

    setPlayVisual(isPlaying) {
        if (!this.ui.play || !this.ui.playIcon) return;
        this.ui.play.setAttribute("aria-label", isPlaying ? "暂停" : "播放");
        this.ui.play.setAttribute("title", isPlaying ? "暂停" : "播放");
        this.ui.playIcon.className = isPlaying
            ? "fluent-icon icon-ic_fluent_pause_24_regular"
            : "fluent-icon icon-ic_fluent_play_24_regular";
    }

    syncLoopButtonState() {
        if (!this.ui.loopButtons.length) return;
        this.ui.loopButtons.forEach((item) => {
            const active = item.dataset.loop === this.loopMode;
            item.classList.toggle("active", active);
            item.setAttribute("aria-pressed", active ? "true" : "false");
        });
    }

    syncDanmakuLayoutDropdownLabel(value) {
        const dropdown = this.ui.danmakuLayoutDropdown;
        const label = this.ui.danmakuLayoutLabel;
        const select = this.ui.danmakuLayout;
        if (!dropdown || !label || !select) return;

        const normalized = Array.from(select.options).some((opt) => opt.value === value)
            ? value
            : (select.options[0]?.value || "all");
        if (select.value !== normalized) {
            select.value = normalized;
        }

        const selectedOption = Array.from(select.options).find((opt) => opt.value === normalized);
        label.textContent = selectedOption ? selectedOption.textContent.trim() : "全部";

        dropdown.querySelectorAll(".component-dropdown-item").forEach((item) => {
            const active = item.dataset.value === normalized;
            item.classList.toggle("selected", active);
            item.setAttribute("aria-selected", active ? "true" : "false");
        });
    }

    bindDanmakuLayoutDropdown() {
        const dropdown = this.ui.danmakuLayoutDropdown;
        const select = this.ui.danmakuLayout;
        if (!dropdown || !select) return;
        if (dropdown.dataset.boundDanmakuDropdown === "true") {
            this.syncDanmakuLayoutDropdownLabel(select.value || "all");
            return;
        }
        dropdown.dataset.boundDanmakuDropdown = "true";

        const toggle = dropdown.querySelector(".component-dropdown-toggle");
        const items = Array.from(dropdown.querySelectorAll(".component-dropdown-item[data-value]"));
        if (!toggle || !items.length) return;

        toggle.addEventListener("click", () => {
            const willOpen = !dropdown.classList.contains("open");
            dropdown.classList.toggle("open", willOpen);
            toggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
        });

        items.forEach((item) => {
            item.addEventListener("click", () => {
                const value = item.dataset.value || "all";
                if (select.value !== value) {
                    select.value = value;
                    select.dispatchEvent(new Event("change", { bubbles: true }));
                } else {
                    this.syncDanmakuLayoutDropdownLabel(value);
                }
                this.closeDanmakuLayoutDropdown();
            });
        });

        this.syncDanmakuLayoutDropdownLabel(select.value || "all");
    }

    bindMediaSelectDropdown(dropdownId, select, labelId) {
        const dropdown = document.getElementById(dropdownId);
        const label = document.getElementById(labelId);
        if (!dropdown || !select || !label) return;
        const sync = () => this.syncMediaSelectDropdown(dropdown, select, label);
        if (dropdown.dataset.boundMediaSelect === "true") {
            sync();
            return;
        }
        dropdown.dataset.boundMediaSelect = "true";
        const toggle = dropdown.querySelector(".component-dropdown-toggle");
        if (!toggle) return;
        toggle.addEventListener("click", () => {
            if (select.disabled) return;
            const willOpen = !dropdown.classList.contains("open");
            this.closeMediaSelectDropdowns(dropdown);
            dropdown.classList.toggle("open", willOpen);
            toggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
        });
        dropdown.querySelectorAll(".component-dropdown-item[data-value]").forEach((item) => {
            item.addEventListener("click", () => {
                const value = item.dataset.value || select.value;
                if (select.value !== value) {
                    select.value = value;
                    select.dispatchEvent(new Event("change", { bubbles: true }));
                }
                sync();
                dropdown.classList.remove("open");
                toggle.setAttribute("aria-expanded", "false");
            });
        });
        select.addEventListener("change", sync);
        sync();
    }

    syncMediaSelectDropdown(dropdown, select, label) {
        if (!dropdown || !select || !label) return;
        const option = Array.from(select.options).find((item) => item.value === select.value) || select.options[0];
        if (!option) return;
        label.textContent = option.textContent.trim();
        dropdown.querySelectorAll(".component-dropdown-item[data-value]").forEach((item) => {
            const selected = item.dataset.value === option.value;
            item.classList.toggle("selected", selected);
            item.setAttribute("aria-selected", selected ? "true" : "false");
        });
    }

    closeMediaSelectDropdowns(except = null) {
        document.querySelectorAll(".media-select-dropdown.open").forEach((dropdown) => {
            if (dropdown === except || (except && dropdown.contains(except))) return;
            dropdown.classList.remove("open");
            const toggle = dropdown.querySelector(".component-dropdown-toggle");
            if (toggle) toggle.setAttribute("aria-expanded", "false");
        });
    }

    closeDanmakuLayoutDropdown() {
        const dropdown = this.ui.danmakuLayoutDropdown;
        if (!dropdown || !dropdown.classList.contains("open")) return;
        dropdown.classList.remove("open");
        const toggle = dropdown.querySelector(".component-dropdown-toggle");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
    }

    handleDanmakuLayoutDropdownOutsideClick(target) {
        const dropdown = this.ui.danmakuLayoutDropdown;
        if (!dropdown || !dropdown.classList.contains("open")) return;
        if (target && typeof dropdown.contains === "function" && dropdown.contains(target)) return;
        this.closeDanmakuLayoutDropdown();
    }

    showGestureToast(text, mode = "volume") {
        const toast = this.ui.gestureToast;
        const messageNode = this.ui.gestureToastMessage;
        if (!toast || !messageNode) {
            this.setStatus(text, { mode: "toast" });
            return;
        }

        messageNode.textContent = text;
        if (this.ui.gestureToastIcon) {
            const icon = mode === "brightness"
                ? "icon-ic_fluent_brightness_high_24_regular"
                : (mode === "speed"
                    ? "icon-ic_fluent_flash_24_regular"
                    : "icon-ic_fluent_speaker_2_24_regular");
            this.ui.gestureToastIcon.className = `component-toast__icon fluent-icon ${icon}`;
        }

        toast.classList.add("show");
        if (this.ui.noticeToastStack) this.ui.noticeToastStack.classList.add("show");
        if (this.gestureToastHideTimer) clearTimeout(this.gestureToastHideTimer);
        this.gestureToastHideTimer = setTimeout(() => {
            if (this.ui.gestureToast) this.ui.gestureToast.classList.remove("show");
            if (this.ui.noticeToastStack) this.ui.noticeToastStack.classList.remove("show");
        }, 900);
    }

    setStatus(text, options = {}) {
        if (!this.status) return;
        const mode = options.mode || "toast";
        this.status.textContent = text;
        this.status.classList.toggle("progress", mode === "progress");
        this.status.classList.add("show");
        if (this.ui.noticeLogStack) this.ui.noticeLogStack.classList.add("show");
        if (this.statusHideTimer) clearTimeout(this.statusHideTimer);
        if (mode !== "progress") {
            this.statusHideTimer = setTimeout(() => {
                if (this.status) this.status.classList.remove("show");
                if (this.ui.noticeLogStack) this.ui.noticeLogStack.classList.remove("show");
            }, 5000);
        }
    }

    showVideoResolutionStatus() {
        if (this.type !== "video" || !this.media) return;
        const width = Math.round(Number(this.media.videoWidth || 0));
        const height = Math.round(Number(this.media.videoHeight || 0));
        if (!width || !height) return;
        const currentTrack = this.tracks[this.currentIndex];
        if (currentTrack && !currentTrack.embedUrl) {
            currentTrack.videoWidth = width;
            currentTrack.videoHeight = height;
            currentTrack.videoQualityLabel = inferResolutionLabel(width, height);
            currentTrack.videoDynamicRange = "SDR";
            if (!currentTrack.audioQuality) {
                currentTrack.audioQuality = currentTrack.sampleRate
                    ? `${(Number(currentTrack.sampleRate) / 1000).toFixed(1)} kHz`
                    : "本地音轨";
            }
            this.refreshTrackMetaDisplay(currentTrack);
        }

        const gcd = (a, b) => {
            let x = Math.abs(a);
            let y = Math.abs(b);
            while (y) {
                const t = x % y;
                x = y;
                y = t;
            }
            return x || 1;
        };

        const factor = gcd(width, height);
        const ratioW = Math.round(width / factor);
        const ratioH = Math.round(height / factor);
        this.setStatus(`视频信息：${width}x${height} · 横纵比 ${ratioW}:${ratioH}`);
    }

    settingsPrefix() {
        return `media-player:${this.type}:`;
    }

    loadSetting(key, fallback) {
        try {
            const raw = localStorage.getItem(this.settingsPrefix() + key);
            if (raw === null) return fallback;
            return JSON.parse(raw);
        } catch (error) {
            return fallback;
        }
    }

    saveSetting(key, value) {
        try {
            localStorage.setItem(this.settingsPrefix() + key, JSON.stringify(value));
        } catch (error) {
            // ignore persistence failures
        }
    }

    saveEqSettings() {
        if (!this.ui.eqLow || !this.ui.eqMid || !this.ui.eqHigh) return;
        this.saveSetting("eq", {
            low: Number(this.ui.eqLow.value || 0),
            mid: Number(this.ui.eqMid.value || 0),
            high: Number(this.ui.eqHigh.value || 0),
        });
    }

    loadSettingsFromStorage() {
        const speed = Number(this.loadSetting("speed", this.ui.speedRange ? this.ui.speedRange.value : 1));
        if (this.ui.speedRange && Number.isFinite(speed)) {
            this.ui.speedRange.value = String(clamp(speed, 0.5, 2));
            this.media.playbackRate = Number(this.ui.speedRange.value);
        }

        const volume = Number(this.loadSetting("volume", this.ui.volumeRange ? this.ui.volumeRange.value : 1));
        if (this.ui.volumeRange && Number.isFinite(volume)) {
            this.ui.volumeRange.value = String(clamp(volume, 0, 1));
            this.media.volume = Number(this.ui.volumeRange.value);
        }

        const eq = this.loadSetting("eq", null);
        if (eq && this.ui.eqLow && this.ui.eqMid && this.ui.eqHigh) {
            this.ui.eqLow.value = String(clamp(Number(eq.low || 0), -12, 12));
            this.ui.eqMid.value = String(clamp(Number(eq.mid || 0), -12, 12));
            this.ui.eqHigh.value = String(clamp(Number(eq.high || 0), -12, 12));
        }

        this.dynamicBg = !!this.loadSetting("dynamicBg", true);
        if (this.ui.dynamicBg) this.ui.dynamicBg.checked = this.dynamicBg;
        document.body.classList.toggle("dynamic-off", !this.dynamicBg);

        const subtitleMode = this.loadSetting("subtitleMode", this.loadSetting("subtitleEnabled", true) ? "on" : "off");
        this.subtitleEnabled = subtitleMode === "on";
        if (this.ui.subtitleMode) this.ui.subtitleMode.value = subtitleMode;
        const bilibiliQuality = String(this.loadSetting("bilibiliQuality", "0"));
        if (this.ui.qualitySelect) this.ui.qualitySelect.value = bilibiliQuality;
        this.subtitleOpacity = Number(this.loadSetting("subtitleOpacity", this.subtitleOpacity));
        this.subtitleOpacity = clamp(this.subtitleOpacity, 0.2, 1);
        if (this.ui.subtitleOpacity) this.ui.subtitleOpacity.value = String(this.subtitleOpacity);
        this.applySubtitleOpacity();

        this.pauseFadeEnabled = !!this.loadSetting("pauseFadeEnabled", false);
        if (this.ui.pauseFadeToggle) this.ui.pauseFadeToggle.checked = this.pauseFadeEnabled;

        this.loopMode = this.loadSetting("loopMode", "none");
        if (!LOOP_MODES.includes(this.loopMode)) {
            this.loopMode = "none";
        }
        this.syncLoopButtonState();

        this.karaokeEnabled = !!this.loadSetting("karaoke", true);
        if (this.ui.karaoke) this.ui.karaoke.checked = this.karaokeEnabled;
        this.showTranslation = !!this.loadSetting("showTranslation", true);
        if (this.ui.showTranslation) this.ui.showTranslation.checked = this.showTranslation;
        this.lyricBlur = !!this.loadSetting("lyricBlur", true);
        if (this.ui.lyricBlur) this.ui.lyricBlur.checked = this.lyricBlur;

        const danmakuEnabledRaw = this.loadSetting("danmakuEnabled", null);
        if (danmakuEnabledRaw === null && this.type === "video") {
            this.danmakuEnabled = true;
            this.saveSetting("danmakuEnabled", true);
        } else {
            this.danmakuEnabled = !!danmakuEnabledRaw;
        }
        if (this.ui.danmakuBtn) this.ui.danmakuBtn.setAttribute("aria-pressed", this.danmakuEnabled ? "true" : "false");

        this.danmakuSize = Number(this.loadSetting("danmakuSize", this.danmakuSize));
        if (this.ui.danmakuSize) this.ui.danmakuSize.value = String(clamp(this.danmakuSize, 14, 42));
        this.danmakuWeight = Number(this.loadSetting("danmakuWeight", this.danmakuWeight));
        if (this.ui.danmakuWeight) this.ui.danmakuWeight.value = String(clamp(this.danmakuWeight, 400, 900));
        this.danmakuSpeed = Number(this.loadSetting("danmakuSpeed", this.danmakuSpeed));
        if (this.ui.danmakuSpeed) this.ui.danmakuSpeed.value = String(clamp(this.danmakuSpeed, 0.5, 2));
        this.danmakuOpacity = Number(this.loadSetting("danmakuOpacity", this.danmakuOpacity));
        if (this.ui.danmakuOpacity) this.ui.danmakuOpacity.value = String(clamp(this.danmakuOpacity, 0.2, 1));

        this.blockScrollDanmaku = !!this.loadSetting("blockScrollDanmaku", false);
        this.blockTopDanmaku = !!this.loadSetting("blockTopDanmaku", false);
        this.blockBottomDanmaku = !!this.loadSetting("blockBottomDanmaku", false);
        if (this.ui.blockScrollDanmaku) this.ui.blockScrollDanmaku.checked = this.blockScrollDanmaku;
        if (this.ui.blockTopDanmaku) this.ui.blockTopDanmaku.checked = this.blockTopDanmaku;
        if (this.ui.blockBottomDanmaku) this.ui.blockBottomDanmaku.checked = this.blockBottomDanmaku;

        this.danmakuLayoutMode = this.loadSetting("danmakuLayoutMode", "all");
        if (this.ui.danmakuLayout) this.ui.danmakuLayout.value = this.danmakuLayoutMode;

        this.lyricSize = Number(this.loadSetting("lyricSize", 36));
        this.lyricWeight = Number(this.loadSetting("lyricWeight", 600));
        if (this.ui.lyricSize) this.ui.lyricSize.value = String(clamp(this.lyricSize, 24, 84));
        if (this.ui.lyricWeight) this.ui.lyricWeight.value = String(clamp(this.lyricWeight, 500, 900));
        this.applyLyricTypography();

        this.brightnessLevel = Number(this.loadSetting("brightness", 100));
        if (Number.isFinite(this.brightnessLevel) && this.brightnessLevel <= 2) {
            this.brightnessLevel *= 100;
        }
        this.brightnessLevel = clamp(this.brightnessLevel, 0, 100);
        if (this.ui.brightnessRange) {
            this.ui.brightnessRange.value = String(this.brightnessLevel);
        }
        this.applyBrightness();
        this.syncSubtitleToggleAvailability();
    }

    async importFiles(files) {
        if (!files.length) {
            this.setStatus("未选择文件");
            return;
        }
        this.setStatus(`正在导入${this.type === "video" ? "视频" : "音乐"}... 0%`, { mode: "progress" });
        if (this.type === "video") {
            await this.importVideoFiles(files);
        } else {
            await this.importMusicFiles(files);
        }
    }

    async importVideoFiles(files) {
        const xmlMap = new Map();
        const xmlCandidates = [];
        const assDanmakuCandidates = [];
        const subtitleCandidates = [];
        const videos = [];
        const isDanmakuAssName = (stem) => /(danmaku|弹幕|(^|[._-])dm([._-]|$))/i.test(stem);

        for (const file of files) {
            const lower = file.name.toLowerCase();
            if (lower.endsWith(".xml")) {
                const stem = lower.replace(/\.xml$/, "");
                const norm = normalizeMediaStem(stem);
                xmlMap.set(stem, file);
                xmlMap.set(norm, file);
                xmlCandidates.push({ stem, norm, file });
            }
            if (/\.(ass|ssa)$/i.test(lower)) {
                const stem = lower.replace(/\.(ass|ssa)$/i, "");
                assDanmakuCandidates.push({
                    stem,
                    norm: normalizeMediaStem(stem),
                    file,
                });
            }
            if (/\.(srt|vtt|ass|ssa)$/i.test(lower)) {
                const stem = lower.replace(/\.(srt|vtt|ass|ssa)$/i, "");
                subtitleCandidates.push({
                    stem,
                    norm: normalizeMediaStem(stem),
                    file,
                });
            }
            if (file.type.startsWith("video/") || /\.(mp4|mkv|webm|mov|avi)$/i.test(lower)) {
                videos.push(file);
            }
        }
        if (!videos.length) {
            this.setStatus("未找到可播放视频文件");
            return;
        }

        const appendStart = this.tracks.length;
        let appendedCount = 0;
        const currentFilter = this.ui.playlistSearch.value.trim().toLowerCase();
        this.deferPlaylistRender = true;

        const pickDanmakuAssFile = (keyLower, keyNorm) => {
            const ranked = assDanmakuCandidates
                .map((entry) => {
                    const marked = isDanmakuAssName(entry.stem);
                    let score = 0;
                    if (entry.stem === keyLower || entry.norm === keyNorm) {
                        score = marked ? 120 : 88;
                    } else if (entry.stem.startsWith(`${keyLower}.`) || entry.norm.startsWith(keyNorm)) {
                        score = marked ? 112 : 80;
                    } else if (entry.norm.includes(keyNorm) || keyNorm.includes(entry.norm)) {
                        score = marked ? 96 : 0;
                    }
                    return { ...entry, score };
                })
                .filter((entry) => entry.score > 0)
                .sort((a, b) => b.score - a.score || a.stem.localeCompare(b.stem));
            return ranked[0]?.file || null;
        };

        const pickSubtitleFiles = (keyLower, keyNorm, excludedDanmakuFile = null) => {
            const ranked = subtitleCandidates
                .map((entry) => {
                    let score = 0;
                    if (entry.stem === keyLower || entry.norm === keyNorm) {
                        score = 100;
                    } else if (entry.stem.startsWith(`${keyLower}.`) || entry.stem.startsWith(`${keyNorm}.`)) {
                        score = 92;
                    } else if (entry.norm.startsWith(keyNorm)) {
                        score = 86;
                    } else if (entry.norm.includes(keyNorm) || keyNorm.includes(entry.norm)) {
                        score = 72;
                    }
                    return { ...entry, score };
                })
                .filter((entry) => {
                    if (entry.score <= 0) return false;
                    if (excludedDanmakuFile && entry.file === excludedDanmakuFile) return false;
                    if (/\.(ass|ssa)$/i.test(String(entry.file?.name || "")) && isDanmakuAssName(entry.stem)) return false;
                    return true;
                })
                .sort((a, b) => b.score - a.score || a.stem.localeCompare(b.stem));

            const selected = [];
            const seen = new Set();
            for (let i = 0; i < ranked.length; i += 1) {
                const subFile = ranked[i].file;
                if (!subFile || seen.has(subFile)) continue;
                selected.push(subFile);
                seen.add(subFile);
                if (selected.length >= 2) break;
            }
            return selected;
        };

        try {
            for (let i = 0; i < videos.length; i += 1) {
                const file = videos[i];
                const name = file.name.replace(/\.[^.]+$/, "");
                const url = URL.createObjectURL(file);
                this.objectUrls.add(url);
                const keyLower = name.toLowerCase();
                const keyNorm = normalizeMediaStem(name);
                let danmakuFile = xmlMap.get(keyLower) || xmlMap.get(keyNorm) || null;
                if (!danmakuFile) {
                    const fuzzy = xmlCandidates.find((entry) => entry.norm.includes(keyNorm) || keyNorm.includes(entry.norm));
                    danmakuFile = fuzzy?.file || null;
                }
                if (!danmakuFile) {
                    danmakuFile = pickDanmakuAssFile(keyLower, keyNorm);
                }
                const subtitleFiles = pickSubtitleFiles(keyLower, keyNorm, danmakuFile);
                this.tracks.push({
                    type: "video",
                    title: name,
                    author: `本地导入 · ${danmakuFile ? "含弹幕" : "无弹幕"}${subtitleFiles.length ? ` · 字幕 ${subtitleFiles.length} 轨` : ""}`,
                    coverUrl: "",
                    sourceUrl: url,
                    danmakuFile,
                    subtitleFiles,
                    localImport: true,
                });
                const insertedIndex = this.tracks.length - 1;
                this.primeTrackCoverAsync(this.tracks[insertedIndex], insertedIndex);
                appendedCount += 1;

                this.renderPlaylist(currentFilter);
                if (this.currentIndex < 0) {
                    await this.selectTrack(this.tracks.length - 1);
                }

                const percent = Math.round(((i + 1) / videos.length) * 100);
                this.setStatus(`正在解析视频、弹幕与 CC 字幕... ${percent}%`, { mode: "progress" });
                await Promise.resolve();
            }
        } finally {
            this.deferPlaylistRender = false;
            const filter = this.pendingPlaylistFilter || currentFilter;
            this.pendingPlaylistFilter = "";
            this.renderPlaylist(filter);
        }
        if (this.currentIndex < 0 && this.tracks.length) {
            await this.selectTrack(appendStart);
        }
        this.scheduleQueuePersistence();
        this.setStatus(`已新增 ${appendedCount} 个视频（共 ${this.tracks.length} 个）`);
    }

    async loadSubtitleCuesFromFiles(files) {
        const input = Array.isArray(files) ? files : [];
        const cueTracks = [];
        for (let i = 0; i < input.length; i += 1) {
            const file = input[i];
            if (!file) continue;
            try {
                const rawText = await fileToText(file);
                const cues = parseSubtitleCues(rawText, file.name);
                if (cues.length) cueTracks.push(cues);
            } catch (error) {
                // Ignore single subtitle parse failures.
            }
        }
        if (!cueTracks.length) return [];
        if (cueTracks.length === 1) return cueTracks[0];

        const scoreTrack = (cues) => cues.reduce((sum, cue) => {
            return sum + [...String(cue.text || "")].length;
        }, 0) + (cues.length * 6);

        cueTracks.sort((a, b) => scoreTrack(b) - scoreTrack(a));
        return mergeBilingualSubtitleCues(cueTracks[0], cueTracks[1]);
    }

    async loadSubtitleCuesFromRemote(track) {
        if (!track || !Array.isArray(track.remoteSubtitleUrls) || !track.remoteSubtitleUrls.length) return [];
        const cueTracks = [];
        for (let i = 0; i < track.remoteSubtitleUrls.length; i += 1) {
            const entry = track.remoteSubtitleUrls[i];
            const url = String(entry?.url || "").trim();
            if (!url) continue;
            try {
                const response = await fetch(url, { credentials: "omit", mode: "cors" });
                if (!response.ok) continue;
                const text = await response.text();
                let cues = parseBilibiliJsonSubtitleCues(text);
                if (!cues.length) {
                    cues = parseSubtitleCues(text, url);
                }
                if (cues.length) cueTracks.push(cues);
            } catch (error) {
                // Ignore single remote subtitle source failures.
            }
        }
        if (!cueTracks.length) return [];
        if (cueTracks.length === 1) return cueTracks[0];

        const scoreTrack = (cues) => cues.reduce((sum, cue) => {
            return sum + [...String(cue.text || "")].length;
        }, 0) + (cues.length * 6);

        cueTracks.sort((a, b) => scoreTrack(b) - scoreTrack(a));
        return mergeBilingualSubtitleCues(cueTracks[0], cueTracks[1]);
    }

    refreshEmbeddedQualityOptions(track) {
        if (!this.ui?.qualitySelect || this.type !== "video") return;
        const select = this.ui.qualitySelect;
        const dropdownList = document.getElementById("quality-select-list");
        const options = Array.isArray(track?.bilibiliQualityOptions) ? track.bilibiliQualityOptions : [];
        if (!options.length) return;

        const prev = String(select.value || "0");
        select.innerHTML = "";
        if (dropdownList) dropdownList.innerHTML = "";

        const normalized = [{ value: "0", label: "自动" }, ...options.filter((item) => String(item.value) !== "0")];
        const unique = [];
        const seen = new Set();
        normalized.forEach((item) => {
            const value = String(item?.value || "");
            if (!value || seen.has(value)) return;
            seen.add(value);
            unique.push({
                value,
                label: String(item?.label || value).trim() || value,
            });
        });

        unique.forEach((item, index) => {
            const option = document.createElement("option");
            option.value = item.value;
            option.textContent = item.label;
            select.appendChild(option);

            if (dropdownList) {
                const row = document.createElement("div");
                row.className = "component-dropdown-item" + (index === 0 ? " selected" : "");
                row.setAttribute("role", "option");
                row.setAttribute("aria-selected", index === 0 ? "true" : "false");
                row.dataset.value = item.value;
                row.textContent = item.label;
                dropdownList.appendChild(row);
            }
        });

        const fallback = unique.some((item) => item.value === prev) ? prev : "0";
        select.value = fallback;
        this.syncMediaSelectDropdown(
            document.getElementById("quality-select-dropdown"),
            select,
            document.getElementById("quality-select-label")
        );
    }

    async importMusicFiles(files) {
        const lrcMap = new Map();
        const audioFiles = [];
        for (const file of files) {
            const lower = file.name.toLowerCase();
            if (lower.endsWith(".lrc") || lower.endsWith(".txt")) {
                lrcMap.set(lower.replace(/\.(lrc|txt)$/, ""), file);
            }
            if (file.type.startsWith("audio/") || /\.(mp3|flac|m4a|wav|ogg)$/i.test(lower)) {
                audioFiles.push(file);
            }
        }
        if (!audioFiles.length) {
            this.setStatus("未找到可播放音频文件");
            return;
        }

        const appendStart = this.tracks.length;
        const appended = [];
        const currentFilter = this.ui.playlistSearch.value.trim().toLowerCase();
        this.deferPlaylistRender = true;
        try {
            for (let i = 0; i < audioFiles.length; i += 1) {
                const file = audioFiles[i];
                const ab = await fileToArrayBuffer(file);
                const lower = file.name.toLowerCase();
                const id3Meta = parseId3Tag(ab);
                const flacMeta = lower.endsWith(".flac") ? parseFlacMetadata(ab) : null;
                const meta = {
                    title: id3Meta.title || flacMeta?.title || "",
                    artist: id3Meta.artist || flacMeta?.artist || "",
                    album: id3Meta.album || flacMeta?.album || "",
                    coverUrl: id3Meta.coverUrl || flacMeta?.coverUrl || "",
                    unsyncedLyrics: id3Meta.unsyncedLyrics || flacMeta?.unsyncedLyrics || "",
                    syncedLyrics: id3Meta.syncedLyrics || [],
                };
                const stem = file.name.toLowerCase().replace(/\.[^.]+$/, "");
                let rawLyrics = meta.unsyncedLyrics || "";
                if (!rawLyrics && lrcMap.has(stem)) {
                    rawLyrics = await fileToText(lrcMap.get(stem));
                }
                const parsedLrc = rawLyrics ? parseLrcText(rawLyrics) : [];
                const url = URL.createObjectURL(file);
                this.objectUrls.add(url);
                if (meta.coverUrl && meta.coverUrl.startsWith("blob:")) {
                    this.objectUrls.add(meta.coverUrl);
                }
                let mergedLyrics = parsedLrc;
                if (meta.syncedLyrics.length) {
                    mergedLyrics = this.mergeLyricsWithTranslations(meta.syncedLyrics, parsedLrc);
                }

                const track = {
                    type: "music",
                    title: meta.title || file.name.replace(/\.[^.]+$/, ""),
                    author: meta.artist || "未知作者",
                    album: meta.album || "",
                    coverUrl: meta.coverUrl || "",
                    sourceUrl: url,
                    lyrics: mergedLyrics,
                    quality: file.type || "local",
                    sampleRate: null,
                    sourceFile: file,
                };
                appended.push(track);
                this.tracks.push(track);

                this.renderPlaylist(currentFilter);
                if (this.currentIndex < 0) {
                    await this.selectTrack(this.tracks.length - 1);
                }

                const percent = Math.round(((i + 1) / audioFiles.length) * 100);
                this.setStatus(`正在解析音乐标签与歌词... ${percent}%`, { mode: "progress" });
            }
        } finally {
            this.deferPlaylistRender = false;
            const filter = this.pendingPlaylistFilter || currentFilter;
            this.pendingPlaylistFilter = "";
            this.renderPlaylist(filter);
        }
        if (this.currentIndex < 0 && this.tracks.length) {
            await this.selectTrack(appendStart);
        }
        this.setStatus(`已新增 ${appended.length} 首音乐（共 ${this.tracks.length} 首）`);
    }

    renderPlaylist(filter) {
        if (this.deferPlaylistRender) {
            this.pendingPlaylistFilter = String(filter || "");
            return;
        }
        const target = this.ui.playlistList;
        const fallbackCover = defaultCover(this.type);
        target.innerHTML = "";
        this.ensurePlaybackOrder();
        const order = this.loopMode === "shuffle"
            ? [...this.playOrder]
            : this.tracks.map((_, idx) => idx);
        order.forEach((trackIndex) => {
            const track = this.tracks[trackIndex];
            if (filter && !(`${track.title} ${track.author} ${track.album || ""}`.toLowerCase().includes(filter))) return;
            const item = document.createElement("li");
            item.className = `play-item${trackIndex === this.currentIndex ? " active" : ""}${this.playlistEditing ? " editing" : ""}`;
            item.dataset.trackIndex = String(trackIndex);
            const realCover = track.coverUrl || fallbackCover;
            const authorText = this.formatTrackAuthorText(track);
            const albumText = this.formatTrackAlbumText(track);
            const checked = this.playlistSelectedSet.has(trackIndex) ? "checked" : "";
            const selectCell = this.playlistEditing
                ? `<input class="play-select" type="checkbox" data-role="playlist-select" data-track-index="${trackIndex}" ${checked} aria-label="选择 ${track.title}">`
                : "";
            item.innerHTML = `
                ${selectCell}
                <div class="play-cover" draggable="true" title="按住拖动调整播放位置" aria-label="拖动封面排序">
                    <img src="${fallbackCover}" data-src="${realCover}" data-lightbox="on" loading="lazy" alt="cover" draggable="false">
                    <span class="play-cover-overlay" aria-hidden="true">
                        <i class="fluent-icon icon-ic_fluent_apps_list_24_regular"></i>
                    </span>
                </div>
                <div class="play-item-main">
                    <div class="play-name">${track.title}</div>
                    <div class="play-author">${authorText}</div>
                    ${albumText ? `<div class="play-author-right">${albumText}</div>` : ""}
                </div>
            `;
            item.addEventListener("click", async () => {
                if (this.playlistEditing) return;
                await this.selectTrack(trackIndex);
                this.ui.playlistDrawer.classList.remove("show");
            });

            if (this.playlistEditing) {
                const checkbox = item.querySelector('input[data-role="playlist-select"]');
                if (checkbox) {
                    checkbox.addEventListener("click", (evt) => evt.stopPropagation());
                    checkbox.addEventListener("change", () => {
                        if (checkbox.checked) {
                            this.playlistSelectedSet.add(trackIndex);
                        } else {
                            this.playlistSelectedSet.delete(trackIndex);
                        }
                    });
                }
            }
            const cover = item.querySelector(".play-cover");
            if (cover) {
                const coverImg = cover.querySelector("img");
                if (coverImg) {
                    coverImg.addEventListener("dragstart", (evt) => evt.preventDefault());
                    coverImg.addEventListener("click", (evt) => {
                        evt.stopPropagation();
                        const lightbox = window.siteLightbox;
                        if (!lightbox || typeof lightbox.refresh !== "function" || typeof lightbox.open !== "function") return;
                        lightbox.refresh();
                        const allCandidates = Array.from(document.querySelectorAll("main img, img[data-lightbox='on']")).filter((img) => {
                            const lb = String(img.getAttribute("data-lightbox") || "").toLowerCase();
                            return lb !== "false" && lb !== "off";
                        });
                        const idx = allCandidates.indexOf(coverImg);
                        if (idx >= 0) lightbox.open(idx);
                    });
                }
                cover.addEventListener("dragstart", (evt) => {
                    this.draggedTrackIndex = trackIndex;
                    item.classList.add("dragging");
                    if (evt.dataTransfer) {
                        evt.dataTransfer.setData("text/plain", String(trackIndex));
                        evt.dataTransfer.effectAllowed = "move";
                        evt.dataTransfer.setDragImage(cover, 18, 18);
                    }
                });
                cover.addEventListener("dragend", () => {
                    this.draggedTrackIndex = -1;
                    target.querySelectorAll(".play-item.drag-over").forEach((node) => node.classList.remove("drag-over"));
                    target.querySelectorAll(".play-item.dragging").forEach((node) => node.classList.remove("dragging"));
                });
            }
            item.addEventListener("dragover", (evt) => {
                evt.preventDefault();
                item.classList.add("drag-over");
            });
            item.addEventListener("dragleave", () => item.classList.remove("drag-over"));
            item.addEventListener("drop", (evt) => {
                evt.preventDefault();
                item.classList.remove("drag-over");
                const fromRaw = evt.dataTransfer ? evt.dataTransfer.getData("text/plain") : "";
                const fromTrackIndex = Number.isFinite(Number(fromRaw)) ? Number(fromRaw) : this.draggedTrackIndex;
                const toTrackIndex = trackIndex;
                if (Number.isFinite(fromTrackIndex) && Number.isFinite(toTrackIndex)) {
                    if (this.loopMode === "shuffle") {
                        this.moveTrackInPlayOrder(fromTrackIndex, toTrackIndex);
                    } else {
                        this.moveTrackByIndex(fromTrackIndex, toTrackIndex);
                    }
                    this.renderPlaylist(this.ui.playlistSearch.value.trim().toLowerCase());
                }
            });
            const lazyImg = item.querySelector("img[data-src]");
            if (lazyImg && this.playlistCoverObserver) {
                this.playlistCoverObserver.observe(lazyImg);
            }
            target.appendChild(item);
        });
        this.syncPlaylistEditingVisualState();
        this.loadVisiblePlaylistCovers();
    }

    refreshPlaylistSearchClearButton() {
        if (!this.ui.playlistSearchClear || !this.ui.playlistSearch) return;
        const hasText = String(this.ui.playlistSearch.value || "").trim().length > 0;
        this.ui.playlistSearchClear.classList.toggle("hidden", !hasText);
    }

    syncPlaylistEditingVisualState() {
        if (this.ui.playlistDrawer) {
            this.ui.playlistDrawer.classList.toggle("editing", !!this.playlistEditing);
        }
        if (this.ui.playlistEditToolbar) {
            this.ui.playlistEditToolbar.classList.toggle("hidden", !this.playlistEditing);
        }
        if (this.ui.playlistEditBtn) {
            this.ui.playlistEditBtn.setAttribute("aria-pressed", this.playlistEditing ? "true" : "false");
        }
    }

    togglePlaylistEditing(force) {
        const next = typeof force === "boolean" ? force : !this.playlistEditing;
        this.playlistEditing = next;
        if (!next) this.playlistSelectedSet.clear();
        this.syncPlaylistEditingVisualState();
        this.renderPlaylist(this.ui.playlistSearch.value.trim().toLowerCase());
    }

    selectAllPlaylistItems() {
        if (!this.playlistEditing) return;
        this.playlistSelectedSet.clear();
        this.tracks.forEach((_, idx) => this.playlistSelectedSet.add(idx));
        this.renderPlaylist(this.ui.playlistSearch.value.trim().toLowerCase());
    }

    invertPlaylistSelection() {
        if (!this.playlistEditing) return;
        const next = new Set();
        this.tracks.forEach((_, idx) => {
            if (!this.playlistSelectedSet.has(idx)) next.add(idx);
        });
        this.playlistSelectedSet = next;
        this.renderPlaylist(this.ui.playlistSearch.value.trim().toLowerCase());
    }

    async deleteSelectedPlaylistItems() {
        if (!this.playlistEditing || !this.playlistSelectedSet.size) return;
        const removeSet = new Set(this.playlistSelectedSet);
        const keepTracks = [];
        let nextCurrent = -1;
        for (let i = 0; i < this.tracks.length; i += 1) {
            if (removeSet.has(i)) continue;
            if (i === this.currentIndex) nextCurrent = keepTracks.length;
            keepTracks.push(this.tracks[i]);
        }
        const removed = this.tracks.length - keepTracks.length;
        this.tracks = keepTracks;
        this.playlistSelectedSet.clear();

        if (!this.tracks.length) {
            this.currentIndex = -1;
            this.media.pause();
            this.media.removeAttribute("src");
            this.media.load();
            this.setPlayVisual(false);
            this.ui.runningTime.textContent = "00:00";
            this.ui.totalTime.textContent = "00:00";
            this.ui.title.textContent = this.type === "video" ? "未导入视频" : "未导入音乐";
            this.ui.author.textContent = this.type === "video" ? "作者：-" : "作者：-";
            this.syncPlaylistEditingVisualState();
            this.renderPlaylist(this.ui.playlistSearch.value.trim().toLowerCase());
            this.setStatus(`已删除 ${removed} 项，播放列表为空`);
            this.scheduleQueuePersistence();
            return;
        }

        if (nextCurrent < 0) {
            nextCurrent = clamp(this.currentIndex, 0, this.tracks.length - 1);
        }
        this.ensurePlaybackOrder({ force: true });
        this.currentIndex = -1;
        this.renderPlaylist(this.ui.playlistSearch.value.trim().toLowerCase());
        this.togglePlaylistEditing(false);
        await this.selectTrack(nextCurrent, { autoplay: false });
        this.setStatus(`已删除 ${removed} 项`);
        this.scheduleQueuePersistence();
    }

    scrollPlaylistToCurrent() {
        if (!this.ui.playlistDrawer || !this.ui.playlistList) return;
        if (!this.ui.playlistDrawer.classList.contains("show")) {
            this.ui.playlistDrawer.classList.add("show");
        }
        const node = this.ui.playlistList.querySelector(`.play-item[data-track-index="${this.currentIndex}"]`);
        if (!node) {
            this.renderPlaylist(this.ui.playlistSearch.value.trim().toLowerCase());
        }
        const target = this.ui.playlistList.querySelector(`.play-item[data-track-index="${this.currentIndex}"]`);
        if (target) {
            target.scrollIntoView({ block: "center", behavior: "smooth" });
        }
    }

    ensurePlaybackOrder(options = {}) {
        const total = this.tracks.length;
        if (!total) {
            this.playOrder = [];
            this.playOrderCursor = -1;
            return;
        }
        const invalidOrder = this.playOrder.length !== total
            || new Set(this.playOrder).size !== total
            || this.playOrder.some((idx) => idx < 0 || idx >= total);

        if (this.loopMode !== "shuffle") {
            if (invalidOrder || options.force) {
                this.playOrder = this.tracks.map((_, idx) => idx);
            }
            this.playOrderCursor = this.playOrder.indexOf(this.currentIndex);
            return;
        }

        if (invalidOrder || options.reshuffle) {
            const all = this.tracks.map((_, idx) => idx);
            const current = this.currentIndex;
            const pool = all.filter((idx) => idx !== current);
            for (let i = pool.length - 1; i > 0; i -= 1) {
                const j = Math.floor(Math.random() * (i + 1));
                [pool[i], pool[j]] = [pool[j], pool[i]];
            }
            if (current >= 0 && current < total) {
                this.playOrder = [current, ...pool];
                this.playOrderCursor = 0;
            } else {
                this.playOrder = pool;
                this.playOrderCursor = this.playOrder.length ? 0 : -1;
            }
            return;
        }

        this.playOrderCursor = this.playOrder.indexOf(this.currentIndex);
    }

    moveTrackByIndex(fromIndex, toIndex) {
        if (!Number.isFinite(fromIndex) || !Number.isFinite(toIndex)) return;
        if (fromIndex === toIndex) return;
        if (fromIndex < 0 || toIndex < 0) return;
        if (fromIndex >= this.tracks.length || toIndex >= this.tracks.length) return;

        const movedTrack = this.tracks[fromIndex];
        this.tracks.splice(fromIndex, 1);
        this.tracks.splice(toIndex, 0, movedTrack);

        if (this.currentIndex === fromIndex) {
            this.currentIndex = toIndex;
        } else if (fromIndex < this.currentIndex && toIndex >= this.currentIndex) {
            this.currentIndex -= 1;
        } else if (fromIndex > this.currentIndex && toIndex <= this.currentIndex) {
            this.currentIndex += 1;
        }

        if (this.playOrder.length) {
            this.playOrder = this.playOrder.map((idx) => {
                if (idx === fromIndex) return toIndex;
                if (fromIndex < toIndex && idx > fromIndex && idx <= toIndex) return idx - 1;
                if (fromIndex > toIndex && idx >= toIndex && idx < fromIndex) return idx + 1;
                return idx;
            });
        }
        this.ensurePlaybackOrder();
        this.scheduleQueuePersistence();
    }

    moveTrackInPlayOrder(fromTrackIndex, toTrackIndex) {
        this.ensurePlaybackOrder();
        if (!this.playOrder.length) return;
        const fromPos = this.playOrder.indexOf(fromTrackIndex);
        const toPos = this.playOrder.indexOf(toTrackIndex);
        if (fromPos < 0 || toPos < 0 || fromPos === toPos) return;
        const [moved] = this.playOrder.splice(fromPos, 1);
        this.playOrder.splice(toPos, 0, moved);
        this.playOrderCursor = this.playOrder.indexOf(this.currentIndex);
        this.scheduleQueuePersistence();
    }

    async selectTrack(index, options = {}) {
        if (index < 0 || index >= this.tracks.length) return;
        const shouldAutoplay = options.autoplay !== false;
        this.currentIndex = index;
        this.ensurePlaybackOrder();
        this.danmakuLaneEndTime.scroll.fill(0);
        this.danmakuLaneEndTime.top.fill(0);
        this.danmakuLaneEndTime.bottom.fill(0);
        this.danmakuCursor = 0;
        this.lastDanmakuTime = -1;
        this.lastDanmakuTick = -1;
        this.subtitleCues = [];
        this.subtitleLookupIndex = 0;
        this.currentSubtitleText = "";
        this.syncSubtitleToggleAvailability();
        this.lastRenderedRunningSecond = -1;
        this.lastRenderedTotalSecond = -1;
        if (this.ui.subtitleLayer) {
            this.ui.subtitleLayer.classList.add("hidden");
            this.ui.subtitleLayer.innerHTML = "";
        }
        const track = this.tracks[index];
        const isEmbeddedVideo = this.type === "video" && !!track.embedUrl;
        if (isEmbeddedVideo) {
            this.refreshEmbeddedQualityOptions(track);
        }
        this.setEmbeddedVideoMode(isEmbeddedVideo);
        if (isEmbeddedVideo) {
            this.resetEmbeddedState();
            this.refreshEmbeddedPlayer(track, { resetToStart: true });
        }
        if (this.type === "video" && this.artPlayer && !isEmbeddedVideo) {
            try {
                this.artPlayer.url = track.sourceUrl;
            } catch (error) {
                // fallback below uses native media source assignment
            }
        }
        if (isEmbeddedVideo) {
            this.media.pause();
            this.media.removeAttribute("src");
            this.media.load();
        } else {
            this.media.src = track.sourceUrl;
            this.media.load();
        }
        if (!isEmbeddedVideo && this.type === "video") {
            this.bindDirectVideoFallback(track);
        }
        if (this.ui.speedRange) {
            this.media.playbackRate = Number(this.ui.speedRange.value || 1);
        }
        this.ui.title.textContent = track.title;
        this.refreshTrackMetaDisplay(track);
        this.ui.runningTime.textContent = "00:00";
        this.ui.totalTime.textContent = "00:00";

        if (this.cover) {
            this.cover.src = track.coverUrl || this.cover.dataset.fallback;
            this.updateCoverShape(this.cover, this.cover.src);
        }

        const colors = await this.getTrackThemeColors(track.coverUrl || this.cover?.src || "");
        if (this.dynamicBg) {
            document.documentElement.style.setProperty("--bg-a", colors[0]);
            document.documentElement.style.setProperty("--bg-b", colors[1]);
            document.documentElement.style.setProperty("--bg-c", colors[2]);
        }
        this.applyThemeFromCover(colors);

        if (this.type === "video") {
            this.danmakuList = [];
            this.lastDanmakuTick = -1;
            if (isEmbeddedVideo) {
                // B 站官方播放器负责其弹幕和 CC 字幕，跨域 iframe 无法由本站读取播放时间。
                this.syncDanmakuRenderer();
            } else if (track.danmakuFile) {
                try {
                    const danmakuName = String(track.danmakuFile.name || "").toLowerCase();
                    if (/\.(ass|ssa)$/i.test(danmakuName)) {
                        const assText = await fileToText(track.danmakuFile);
                        this.danmakuList = parseDanmakuAss(assText);
                    } else {
                        const danmakuBuffer = await fileToArrayBuffer(track.danmakuFile);
                        const xml = decodeDanmakuXmlBuffer(danmakuBuffer);
                        this.danmakuList = parseDanmakuXml(xml);
                    }
                    track.author = `本地导入 · 弹幕 ${this.danmakuList.length} 条`;
                    this.refreshTrackMetaDisplay(track);
                    this.setStatus(`检测到 ${this.danmakuList.length} 条弹幕`);
                    this.syncDanmakuRenderer();
                } catch (error) {
                    track.author = "本地导入 · 弹幕读取失败";
                    this.refreshTrackMetaDisplay(track);
                    this.setStatus("弹幕读取失败");
                    this.syncDanmakuRenderer();
                }
            } else if (track.localImport) {
                track.author = "本地导入 · 无弹幕";
                this.refreshTrackMetaDisplay(track);
                this.syncDanmakuRenderer();
            } else {
                this.syncDanmakuRenderer();
            }

            if (Array.isArray(track.subtitleFiles) && track.subtitleFiles.length) {
                try {
                    this.subtitleCues = await this.loadSubtitleCuesFromFiles(track.subtitleFiles);
                    if (this.subtitleCues.length) {
                        this.setStatus(`检测到 CC 字幕 ${this.subtitleCues.length} 条`);
                    } else {
                        this.setStatus("CC 字幕读取失败或为空");
                    }
                } catch (error) {
                    this.subtitleCues = [];
                    this.setStatus("CC 字幕读取失败");
                }
            } else if (Array.isArray(track.remoteSubtitleUrls) && track.remoteSubtitleUrls.length) {
                try {
                    this.subtitleCues = await this.loadSubtitleCuesFromRemote(track);
                    if (this.subtitleCues.length) {
                        this.setStatus(`检测到远程字幕 ${this.subtitleCues.length} 条`);
                    }
                } catch (error) {
                    this.subtitleCues = [];
                }
            }
            this.syncSubtitleToggleAvailability();
            this.renderSubtitles();
        }

        this.currentLyrics = sanitizeLyricsForDisplay(track.lyrics || []);
        this.lastLyricLookupIndex = 0;
        this.renderLyrics();
        this.renderPlaylist(this.ui.playlistSearch.value.trim().toLowerCase());
        if (this.type === "music") {
            this.applyAutoLyricColor(colors);
            this.applyMusicReadableTheme(colors);
        }
        this.updateMediaSession(track);
        this.restoreMasterGainForPlayback();
        if (isEmbeddedVideo) {
            if (shouldAutoplay) {
                this.postEmbeddedCommand("play");
                this.setPlayVisual(true);
                this.toggleDanmakuPauseState(false);
            } else {
                this.postEmbeddedCommand("pause");
                this.setPlayVisual(false);
                this.toggleDanmakuPauseState(true);
            }
        } else if (shouldAutoplay) {
            await this.media.play().catch(() => {});
            this.setPlayVisual(!this.media.paused);
        } else {
            this.media.pause();
            this.setPlayVisual(false);
            this.toggleDanmakuPauseState(true);
        }
        this.ensureEq();

        if (this.type === "video") {
            this.showVideoResolutionStatus();
        }

        if (this.type === "music" && !track.sampleRate && track.sourceFile) {
            this.resolveTrackSampleRate(track);
        }
        this.scheduleQueuePersistence();
    }

    formatTrackAuthorText(track) {
        const authorRaw = String(track?.author || "").trim() || "未知作者";
        if (track?.type !== "music") return authorRaw;
        return `作者：${authorRaw}`;
    }

    formatTrackAlbumText(track) {
        if (track?.type === "video") {
            const quality = String(track?.videoQualityLabel || "").trim() || (track?.embedUrl
                ? bilibiliQualityLabel(this.ui.qualitySelect?.value || "0")
                : inferResolutionLabel(track?.videoWidth, track?.videoHeight));
            const dynamicRange = String(track?.videoDynamicRange || "").trim() || "SDR";
            const audioQuality = String(track?.audioQuality || "").trim() || (track?.embedUrl ? "B站音轨" : "本地音轨");
            return `清晰度：${quality} · ${dynamicRange} · 音质：${audioQuality}`;
        }
        if (track?.type !== "music") return "";
        const albumRaw = String(track?.album || "").trim();
        return `专辑：${albumRaw || "-"}`;
    }

    refreshTrackMetaDisplay(track) {
        if (!track) return;
        this.updateTrackMetaLink(this.ui.title, track.title || "未命名视频", track.bilibiliUrl);
        this.updateTrackMetaLink(this.ui.author, this.formatTrackAuthorText(track), track.bilibiliUrl);
        if (this.ui.videoMetaBar && track.type === "video") {
            this.ui.videoMetaBar.textContent = this.formatTrackAlbumText(track);
        }
        if (!this.ui.trackAlbum) return;
        const albumText = this.formatTrackAlbumText(track);
        if (albumText) {
            this.ui.trackAlbum.textContent = albumText;
            this.ui.trackAlbum.classList.remove("hidden");
            return;
        }
        this.ui.trackAlbum.textContent = "";
        this.ui.trackAlbum.classList.add("hidden");
    }

    updateTrackMetaLink(node, text, href) {
        if (!node) return;
        node.textContent = text;
        if (href) {
            node.href = href;
            node.target = "_blank";
            node.rel = "noopener noreferrer";
            node.classList.add("is-external-link");
            return;
        }
        node.removeAttribute("href");
        node.removeAttribute("target");
        node.removeAttribute("rel");
        node.classList.remove("is-external-link");
    }

    async resolveTrackSampleRate(track) {
        if (!track || track.sampleRate || !track.sourceFile || track._sampling) return;
        track._sampling = true;
        try {
            const ab = await fileToArrayBuffer(track.sourceFile);
            const sr = await this.getSampleRateFromBuffer(ab);
            track.sampleRate = sr || null;
            if (track.type === "video" && track.sampleRate) {
                track.audioQuality = `${(track.sampleRate / 1000).toFixed(1)} kHz`;
            }
            if (this.currentIndex >= 0 && this.tracks[this.currentIndex] === track) {
                this.setStatus(`音质信息：${track.sampleRate ? `${(track.sampleRate / 1000).toFixed(1)} kHz` : "未知采样率"}`);
                this.refreshTrackMetaDisplay(track);
            }
        } catch (error) {
            track.sampleRate = null;
        } finally {
            track._sampling = false;
        }
    }

    mergeLyricsWithTranslations(baseLyrics, extraLyrics) {
        const base = (baseLyrics || []).map((line) => ({
            time: line.time,
            anchorTime: Number(line.anchorTime ?? getLyricLineAnchorTime(line)),
            text: line.text,
            words: line.words || null,
            translations: [...(line.translations || [])],
        }));
        if (!extraLyrics || !extraLyrics.length) return base;

        let cursor = 0;
        const tolerance = 0.45;
        const trackShift = estimateTrackTimeShift(base, extraLyrics);
        const baseAnchorLookup = buildLyricAnchorLookup(base);

        const findTarget = (line) => {
            if (!base.length) return null;
            const anchorTime = getLyricLineAnchorTime(line);
            const directAnchorIndex = findLyricAnchorMatchedIndex(baseAnchorLookup, anchorTime, cursor);
            if (directAnchorIndex >= 0) {
                cursor = directAnchorIndex;
                return base[directAnchorIndex];
            }
            const time = Number(line?.time || 0);
            const shiftedTime = Number(time || 0) + trackShift;
            const expected = estimateIndexByTime(base, extraLyrics, shiftedTime);
            let bestIndex = -1;
            let bestDiff = Infinity;
            const left = Math.max(0, Math.min(cursor, expected) - 1);
            const right = Math.min(base.length - 1, Math.max(cursor, expected) + 6);
            for (let i = left; i <= right; i += 1) {
                const diff = Math.abs(base[i].time - shiftedTime);
                if (diff < bestDiff) {
                    bestDiff = diff;
                    bestIndex = i;
                }
                if (base[i].time > shiftedTime + tolerance && bestDiff <= tolerance) break;
                if (base[i].time > shiftedTime + 1.5 && bestIndex >= 0) break;
            }
            if (bestIndex >= 0 && bestDiff <= tolerance) {
                cursor = bestIndex;
                return base[bestIndex];
            }
            return null;
        };

        extraLyrics.forEach((line) => {
            const candidate = pickSingleTranslationCandidate(line);
            if (!candidate) return;
            let target = findTarget(line);
            if (!target) return;
            if (candidate === target.text) return;
            if (!target.translations.includes(candidate)) {
                target.translations.push(candidate);
            }
        });
        return base;
    }

    updateMediaSession(track) {
        if (!("mediaSession" in navigator) || !track) return;
        try {
            const artwork = track.coverUrl ? [{ src: track.coverUrl, sizes: "512x512", type: "image/png" }] : [];
            navigator.mediaSession.metadata = new MediaMetadata({
                title: track.title || "未命名",
                artist: track.author || "未知作者",
                album: this.type === "video" ? "视频" : "音乐",
                artwork,
            });
            navigator.mediaSession.setActionHandler("play", () => this.playMediaWithOptionalFade());
            navigator.mediaSession.setActionHandler("pause", () => this.pauseMediaWithOptionalFade());
            navigator.mediaSession.setActionHandler("previoustrack", () => this.playPrev());
            navigator.mediaSession.setActionHandler("nexttrack", () => this.playNext());
        } catch (error) {
            // ignore unsupported handlers
        }
    }

    togglePlay() {
        const track = this.tracks[this.currentIndex];
        if (track?.embedUrl) {
            if (this.embeddedState.paused) {
                this.postEmbeddedCommand("play");
                this.embeddedState.paused = false;
                this.toggleDanmakuPauseState(false);
                this.setPlayVisual(true);
            } else {
                this.postEmbeddedCommand("pause");
                this.embeddedState.paused = true;
                this.toggleDanmakuPauseState(true);
                this.setPlayVisual(false);
            }
            return;
        }
        if (!this.media.src) return;
        if (this.media.paused) {
            this.playMediaWithOptionalFade();
        } else {
            this.pauseMediaWithOptionalFade();
        }
    }

    restoreMasterGainForPlayback() {
        const master = this.eqNodes?.master;
        if (!master) return;
        try {
            if (this.audioCtx?.state === "running") {
                master.gain.cancelScheduledValues(this.audioCtx.currentTime);
            }
        } catch (error) {
            // ignore gain scheduler errors
        }
        master.gain.value = 1;
    }

    cancelPauseFadeAnimation() {
        if (!this.pauseFadeRafId) return;
        cancelAnimationFrame(this.pauseFadeRafId);
        this.pauseFadeRafId = 0;
    }

    animateMasterGain(from, to, duration, done) {
        const master = this.eqNodes?.master;
        if (!master) {
            if (typeof done === "function") done();
            return;
        }
        this.cancelPauseFadeAnimation();
        const start = performance.now();
        const safeDuration = Math.max(60, Number(duration || 0));
        const tick = (now) => {
            const ratio = clamp((now - start) / safeDuration, 0, 1);
            master.gain.value = from + ((to - from) * ratio);
            if (ratio >= 1) {
                this.pauseFadeRafId = 0;
                if (typeof done === "function") done();
                return;
            }
            this.pauseFadeRafId = requestAnimationFrame(tick);
        };
        this.pauseFadeRafId = requestAnimationFrame(tick);
    }

    async playMediaWithOptionalFade() {
        const track = this.tracks[this.currentIndex];
        if (track?.embedUrl) {
            this.postEmbeddedCommand("play");
            this.embeddedState.paused = false;
            this.setPlayVisual(true);
            this.toggleDanmakuPauseState(false);
            return;
        }
        this.ensureEq();
        const useFade = this.type === "music" && this.pauseFadeEnabled && !!this.eqNodes?.master;
        this.cancelPauseFadeAnimation();

        if (useFade) {
            if (this.audioCtx?.state === "suspended") {
                await this.audioCtx.resume().catch(() => {});
            }
            const master = this.eqNodes?.master;
            if (master) master.gain.value = 0;
        } else {
            this.restoreMasterGainForPlayback();
        }

        await this.media.play().catch(() => {});

        if (useFade && !this.media.paused && this.eqNodes?.master) {
            this.animateMasterGain(0, 1, this.pauseFadeDurationMs);
        }
    }

    pauseMediaWithOptionalFade() {
        const track = this.tracks[this.currentIndex];
        if (track?.embedUrl) {
            this.postEmbeddedCommand("pause");
            this.embeddedState.paused = true;
            this.setPlayVisual(false);
            this.toggleDanmakuPauseState(true);
            return;
        }
        if (this.media.paused) return;
        this.ensureEq();
        const useFade = this.type === "music" && this.pauseFadeEnabled && !!this.eqNodes?.master;
        if (!useFade) {
            this.media.pause();
            return;
        }

        const from = clamp(Number(this.eqNodes?.master?.gain?.value ?? 1), 0, 1);
        this.animateMasterGain(from, 0, this.pauseFadeDurationMs, () => {
            if (!this.media.paused) this.media.pause();
        });
    }

    seekBy(delta) {
        const track = this.tracks[this.currentIndex];
        if (track?.embedUrl) {
            const total = Number(this.embeddedState.duration || this.media.duration || 0);
            const next = clamp((this.embeddedState.currentTime || 0) + delta, 0, total || Infinity);
            this.embeddedState.currentTime = next;
            this.embeddedTimeHint = next;
            this.postEmbeddedCommand("seek", { time: next });
            this.refreshEmbeddedProgressFromHint();
            return;
        }
        this.media.currentTime = clamp((this.media.currentTime || 0) + delta, 0, this.media.duration || Infinity);
        this.refreshTime();
    }

    playPrev() {
        if (!this.tracks.length) return;
        if (this.loopMode === "shuffle") {
            this.ensurePlaybackOrder();
            if (!this.playOrder.length) return;
            if (this.playOrderCursor < 0) {
                this.playOrderCursor = this.playOrder.indexOf(this.currentIndex);
            }
            if (this.playOrderCursor < 0) this.playOrderCursor = 0;
            this.playOrderCursor = (this.playOrderCursor - 1 + this.playOrder.length) % this.playOrder.length;
            this.selectTrack(this.playOrder[this.playOrderCursor]);
            return;
        }
        const nextIndex = this.currentIndex <= 0 ? this.tracks.length - 1 : this.currentIndex - 1;
        this.selectTrack(nextIndex);
    }

    playNext() {
        if (!this.tracks.length) return;
        if (this.loopMode === "shuffle") {
            this.ensurePlaybackOrder();
            if (!this.playOrder.length) return;
            if (this.playOrderCursor < 0) {
                this.playOrderCursor = this.playOrder.indexOf(this.currentIndex);
            }
            if (this.playOrderCursor < 0) this.playOrderCursor = 0;
            this.playOrderCursor = (this.playOrderCursor + 1) % this.playOrder.length;
            this.selectTrack(this.playOrder[this.playOrderCursor]);
            return;
        }
        const nextIndex = this.currentIndex >= this.tracks.length - 1 ? 0 : this.currentIndex + 1;
        this.selectTrack(nextIndex);
    }

    onTrackEnded() {
        const track = this.tracks[this.currentIndex];
        if (track?.embedUrl) {
            this.embeddedState.paused = true;
        }
        if (this.loopMode === "one") {
            if (track?.embedUrl) {
                this.embeddedState.ended = false;
                this.embeddedState.currentTime = 0;
                this.embeddedTimeHint = 0;
                this.postEmbeddedCommand("seek", { time: 0 });
                this.postEmbeddedCommand("play");
                this.embeddedState.paused = false;
                this.toggleDanmakuPauseState(false);
                this.setPlayVisual(true);
            } else {
                this.media.currentTime = 0;
                this.media.play().catch(() => {});
            }
            return;
        }
        if (this.loopMode === "all" || this.loopMode === "shuffle") {
            this.playNext();
            return;
        }
        if (this.currentIndex < this.tracks.length - 1) {
            this.selectTrack(this.currentIndex + 1);
        } else {
            this.setPlayVisual(false);
        }
    }

    refreshTime() {
        const track = this.tracks[this.currentIndex];
        if (track?.embedUrl) {
            this.refreshEmbeddedProgressFromHint();
            this.renderSubtitles();
            return;
        }
        const cur = this.media.currentTime || 0;
        const total = this.media.duration || 0;
        if (!this.isSeeking) {
            this.ui.seek.value = String(cur);
        }
        this.setProgressVisual(cur, total);
        this.setBufferedProgressVisual(cur, total);
        const curSec = Math.floor(cur);
        if (curSec !== this.lastRenderedRunningSecond) {
            this.lastRenderedRunningSecond = curSec;
            this.ui.runningTime.textContent = formatTime(cur);
        }
        const totalSec = Math.floor(total);
        if (totalSec !== this.lastRenderedTotalSecond) {
            this.lastRenderedTotalSecond = totalSec;
            this.ui.totalTime.textContent = formatTime(total);
        }
        this.renderSubtitles();
    }

    setBufferedProgressVisual(cur, total) {
        if (!this.ui.seek || !total || !this.media?.buffered?.length) return;
        let bufferedEnd = 0;
        for (let index = 0; index < this.media.buffered.length; index += 1) {
            const start = this.media.buffered.start(index);
            if (start <= cur + 0.1) bufferedEnd = Math.max(bufferedEnd, this.media.buffered.end(index));
        }
        const ratio = clamp(bufferedEnd / total, 0, 1);
        this.ui.seek.style.setProperty("--buffered-percent", `${(ratio * 100).toFixed(3)}%`);
    }

    handlePreviewMove(evt) {
        const rect = this.ui.seek.getBoundingClientRect();
        const ratio = clamp((evt.clientX - rect.left) / rect.width, 0, 1);
        const currentTrack = this.tracks[this.currentIndex];
        const duration = currentTrack?.embedUrl
            ? Number(this.embeddedState.duration || this.media.duration || 0)
            : Number(this.media.duration || 0);
        const time = duration * ratio;
        this.showProgressPreview(time, ratio);
    }

    showProgressPreview(time, ratio) {
        const seekRect = this.ui.seek.getBoundingClientRect();
        const zoneRect = this.ui.seek.parentElement
            ? this.ui.seek.parentElement.getBoundingClientRect()
            : seekRect;
        this.ui.preview.classList.add("show");
        const previewWidth = Number(this.ui.preview.offsetWidth || 164);
        const half = previewWidth / 2;
        const seekOffset = seekRect.left - zoneRect.left;
        const minCenter = half + seekOffset;
        const maxCenter = seekOffset + seekRect.width - half;
        const targetCenter = seekOffset + clamp(ratio, 0, 1) * seekRect.width;
        const safeLeft = clamp(targetCenter, minCenter, Math.max(minCenter, maxCenter));
        this.ui.preview.style.left = `${safeLeft}px`;
        this.ui.previewTime.textContent = formatTime(time);
        const currentTrack = this.tracks[this.currentIndex];
        const duration = currentTrack?.embedUrl
            ? Number(this.embeddedState.duration || this.media.duration || 0)
            : Number(this.media.duration || 0);
        this.ui.previewTotal.textContent = formatTime(duration);

        if (this.type === "video") {
            this.updateVideoPreview(time);
        } else if (this.cover?.src) {
            this.previewImage.src = this.cover.src;
        }
    }

    async updateVideoPreview(time) {
        if (!this.media.src) return;
        if (!this.previewVideo) {
            this.previewVideo = document.createElement("video");
            this.previewVideo.muted = true;
            this.previewVideo.crossOrigin = "anonymous";
            this.previewVideo.playsInline = true;
            this.previewVideo.preload = "auto";
        }
        if (this.previewVideo.src !== this.media.src) {
            this.previewVideo.src = this.media.src;
            await new Promise((resolve) => {
                let settled = false;
                const finish = () => {
                    if (settled) return;
                    settled = true;
                    this.previewVideo.onloadedmetadata = null;
                    this.previewVideo.onerror = null;
                    resolve();
                };
                this.previewVideo.onloadedmetadata = finish;
                this.previewVideo.onerror = finish;
                setTimeout(finish, 1200);
            });
        }
        const duration = Number.isFinite(this.media.duration) && this.media.duration > 0
            ? this.media.duration
            : (Number.isFinite(this.previewVideo.duration) ? this.previewVideo.duration : 0);
        const target = clamp(time, 0, duration || 0);
        const image = await new Promise((resolve) => {
            let settled = false;
            let timeoutId = null;
            const done = (dataUrl = "") => {
                if (settled) return;
                settled = true;
                this.previewVideo.removeEventListener("seeked", onSeeked);
                this.previewVideo.removeEventListener("error", onError);
                if (timeoutId) clearTimeout(timeoutId);
                resolve(dataUrl);
            };
            const captureNow = () => {
                const ctx = this.previewCanvas.getContext("2d");
                if (ctx) {
                    try {
                        ctx.drawImage(this.previewVideo, 0, 0, this.previewCanvas.width, this.previewCanvas.height);
                        done(this.previewCanvas.toDataURL("image/jpeg", 0.76));
                        return;
                    } catch (error) {
                        // tainted canvas or decode timing issue
                    }
                }
                done("");
            };
            const onSeeked = () => captureNow();
            const onError = () => done("");

            if (Math.abs((this.previewVideo.currentTime || 0) - target) < 0.02 && this.previewVideo.readyState >= 2) {
                requestAnimationFrame(() => captureNow());
                return;
            }

            this.previewVideo.addEventListener("seeked", onSeeked);
            this.previewVideo.addEventListener("error", onError);
            timeoutId = setTimeout(() => captureNow(), 1200);
            try {
                this.previewVideo.currentTime = target;
            } catch (error) {
                captureNow();
            }
        });
        if (image) this.previewImage.src = image;
        return image;
    }

    async captureThirtyPercentFrame() {
        if (this.type !== "video" || !this.media.duration) return;
        const target = this.media.duration * 0.3;
        try {
            const captured = await this.updateVideoPreview(target);
            const track = this.tracks[this.currentIndex];
            if (track && captured && /^data:image\//.test(captured)) {
                track.coverUrl = captured;
                if (this.cover) this.cover.src = captured;
                if (this.cover) this.updateCoverShape(this.cover, captured);
                    const colors = await this.getTrackThemeColors(captured);
                if (this.dynamicBg) {
                    document.documentElement.style.setProperty("--bg-a", colors[0]);
                    document.documentElement.style.setProperty("--bg-b", colors[1]);
                    document.documentElement.style.setProperty("--bg-c", colors[2]);
                }
                this.applyThemeFromCover(colors);
                this.updateMediaSession(track);
                this.renderPlaylist(this.ui.playlistSearch.value.trim().toLowerCase());
            }
        } catch (error) {
            // ignore capture failures
        }
    }

    bindVideoGestureEvents() {
        const stage = this.ui.videoStage;
        const isDockInteractiveTarget = (target) => {
            if (!target || typeof target.closest !== "function") return false;
            return !!target.closest(".player-dock, .floating-panel, .playlist-drawer, button, input, select, textarea, label, a");
        };

        const onClick = (evt) => {
            const track = this.tracks[this.currentIndex];
            if (track?.embedUrl) {
                evt.preventDefault();
                evt.stopPropagation();
                return;
            }
            if (!document.fullscreenElement) return;
            if (isDockInteractiveTarget(evt.target)) return;
            document.body.classList.add("show-dock");
            if (this.fullscreenDockHideTimer) clearTimeout(this.fullscreenDockHideTimer);
            this.fullscreenDockHideTimer = setTimeout(() => {
                document.body.classList.remove("show-dock");
            }, 1000);
        };
        const onPointerDown = (evt) => {
            if (evt.pointerType === "mouse" && evt.button !== 0) return;
            if (isDockInteractiveTarget(evt.target)) return;
            const rect = stage.getBoundingClientRect();
            this.gestureState = {
                pointerId: evt.pointerId,
                startX: evt.clientX,
                startY: evt.clientY,
                startTime: this.media.currentTime || 0,
                startVolume: this.media.volume,
                startBrightness: this.brightnessLevel,
                width: rect.width,
                height: rect.height,
                side: evt.clientX < rect.left + rect.width / 2 ? "left" : "right",
                mode: null,
            };
            stage.setPointerCapture(evt.pointerId);
        };

        const onPointerMove = (evt) => {
            if (!this.gestureState || this.gestureState.pointerId !== evt.pointerId) return;
            const gs = this.gestureState;
            const dx = evt.clientX - gs.startX;
            const dy = evt.clientY - gs.startY;
            if (!gs.mode) {
                gs.mode = Math.abs(dx) >= Math.abs(dy) ? "seek" : (gs.side === "left" ? "brightness" : "volume");
            }
            if (gs.mode === "seek") {
                const duration = this.media.duration || 0;
                if (duration <= 0) return;
                const target = clamp(gs.startTime + (dx / Math.max(gs.width, 1)) * duration, 0, duration);
                this.media.currentTime = target;
                this.refreshTime();
                this.showProgressPreview(target, target / duration);
                return;
            }
            const delta = -dy / Math.max(gs.height, 1);
            if (gs.mode === "brightness") {
                this.brightnessLevel = clamp(gs.startBrightness + (delta * 100), 0, 100);
                this.applyBrightness();
                if (this.ui.brightnessRange) this.ui.brightnessRange.value = String(this.brightnessLevel);
                this.refreshSettingValueBadges();
                this.showGestureToast(`亮度 ${Math.round(this.brightnessLevel)}%`, "brightness");
            } else {
                this.media.volume = clamp(gs.startVolume + delta, 0, 1);
                if (this.ui.volumeRange) this.ui.volumeRange.value = String(this.media.volume);
                this.refreshSettingValueBadges();
                this.saveSetting("volume", this.media.volume);
                this.showGestureToast(`音量 ${(this.media.volume * 100).toFixed(0)}%`, "volume");
            }
        };

        const onPointerUp = (evt) => {
            if (!this.gestureState || this.gestureState.pointerId !== evt.pointerId) return;
            const mode = this.gestureState.mode;
            if (mode === "seek") {
                setTimeout(() => this.ui.preview.classList.remove("show"), 600);
            }
            if (mode === "brightness") {
                this.saveSetting("brightness", this.brightnessLevel);
            }
            this.gestureState = null;
            if (this.status) this.status.classList.remove("progress");
        };

        stage.addEventListener("click", onClick);
        stage.addEventListener("pointerdown", onPointerDown);
        stage.addEventListener("pointermove", onPointerMove);
        stage.addEventListener("pointerup", onPointerUp);
        stage.addEventListener("pointercancel", onPointerUp);
    }

    renderLyrics() {
        if (!this.lyricsList) return;
        this.lyricsList.innerHTML = "";
        this.currentLineIndex = -1;
        this.lastKaraokeProgress = -1;
        this.lyricLineNodes = [];
        this.karaokeLineNodes = [];
        this.applyLyricTypography();
        if (!this.currentLyrics.length) {
            this.lyricsList.innerHTML = '<div class="lyric-line">暂无歌词</div>';
            return;
        }
        this.currentLyrics.forEach((line, index) => {
            const div = document.createElement("div");
            div.className = "lyric-line";
            div.dataset.index = String(index);
            if (line.words && line.words.length) {
                const lyricText = String(line.text || "...");
                const karaoke = document.createElement("div");
                karaoke.className = "lyric-karaoke";
                const base = document.createElement("span");
                base.className = "karaoke-base";
                base.textContent = lyricText;
                const fill = document.createElement("span");
                fill.className = "karaoke-fill";
                fill.textContent = "";
                karaoke.append(base, fill);
                div.appendChild(karaoke);
                this.karaokeLineNodes.push({
                    root: karaoke,
                    fill,
                    chars: Array.from(lyricText),
                    lastSolidCount: -1,
                    lastPartialPercent: -1,
                });
            } else {
                div.textContent = line.text || "...";
                this.karaokeLineNodes.push(null);
            }
            if (this.showTranslation) {
                line.translations?.forEach((trans) => {
                    const t = document.createElement("div");
                    t.className = "lyric-translation";
                    t.textContent = trans;
                    div.appendChild(t);
                });
            }
            div.addEventListener("click", () => {
                this.media.currentTime = Math.max(0, Number(line.time || 0));
                this.refreshTime();
                this.refreshLyrics();
                this.centerLyricLine(div);
            });
            this.lyricsList.appendChild(div);
            this.lyricLineNodes.push(div);
        });
    }

    setKaraokeFillProgress(karaokeEntry, progress) {
        if (!karaokeEntry || !karaokeEntry.fill) return;
        const chars = Array.isArray(karaokeEntry.chars) ? karaokeEntry.chars : [];
        if (!chars.length) {
            karaokeEntry.fill.textContent = "";
            karaokeEntry.lastSolidCount = 0;
            karaokeEntry.lastPartialPercent = 0;
            return;
        }
        const clampedProgress = clamp(Number(progress || 0), 0, 1);
        const doneFloat = clampedProgress * chars.length;
        const solidCount = Math.floor(doneFloat);
        const partialPercent = solidCount < chars.length ? Math.round((doneFloat - solidCount) * 100) : 0;
        if (solidCount === karaokeEntry.lastSolidCount && partialPercent === karaokeEntry.lastPartialPercent) {
            return;
        }
        karaokeEntry.lastSolidCount = solidCount;
        karaokeEntry.lastPartialPercent = partialPercent;

        const fill = karaokeEntry.fill;
        const fullText = chars.join("");
        if (solidCount >= chars.length) {
            fill.textContent = fullText;
            return;
        }

        const prefix = chars.slice(0, solidCount).join("");
        fill.textContent = "";
        if (prefix) {
            fill.appendChild(document.createTextNode(prefix));
        }
        if (partialPercent > 0) {
            const partialChar = document.createElement("span");
            partialChar.className = "karaoke-partial-char";
            partialChar.style.setProperty("--karaoke-char-progress", `${partialPercent}%`);
            partialChar.textContent = chars[solidCount];
            fill.appendChild(partialChar);
        }
    }

    centerLyricLine(node) {
        if (!node || !this.lyricsList) return;
        const isNarrowMusic = this.type === "music" && window.matchMedia("(max-width: 640px)").matches;
        const focusRatio = isNarrowMusic ? 0.45 : 0.5;
        const top = node.offsetTop - (this.lyricsList.clientHeight * focusRatio) + (node.clientHeight / 2);
        this.lyricAutoScrollUntil = Date.now() + 1100;
        this.lyricsList.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }

    showLyricsScrollbarTemporarily() {
        if (!this.lyricsList) return;
        this.lyricsList.classList.add("show-scrollbar");
        if (this.lyricScrollbarTimer) clearTimeout(this.lyricScrollbarTimer);
        this.lyricScrollbarTimer = setTimeout(() => {
            if (!this.lyricsList) return;
            this.lyricsList.classList.remove("show-scrollbar");
        }, 1200);
    }

    computeKaraokeProgress(line, now, lineIndex) {
        const textLen = [...String(line?.text || "")].length;
        if (!line || textLen <= 0) return 0;
        if (line.words && line.words.length) {
            const starts = line.words.map((w) => Number(w.time || 0));
            const nextLineTime = this.currentLyrics[lineIndex + 1]?.time ?? (line.time + 4);
            let doneCount = 0;
            for (let i = 0; i < line.words.length; i += 1) {
                const wordStart = starts[i];
                const wordEnd = starts[i + 1] ?? nextLineTime;
                const wordLen = [...String(line.words[i].text || "")].length;
                if (now >= wordEnd) {
                    doneCount += wordLen;
                    continue;
                }
                if (now > wordStart && now < wordEnd) {
                    const ratio = clamp((now - wordStart) / Math.max(0.08, wordEnd - wordStart), 0, 1);
                    doneCount += wordLen * ratio;
                }
                break;
            }
            return clamp(doneCount / Math.max(textLen, 1), 0, 1);
        }
        const start = Number(line.time || 0);
        const end = this.currentLyrics[lineIndex + 1]?.time ?? (start + 4);
        return clamp((now - start) / Math.max(0.2, end - start), 0, 1);
    }

    refreshLyrics() {
        if (!this.lyricsList || !this.currentLyrics.length) return;
        const now = this.media.currentTime || 0;
        const active = this.findActiveLyricIndex(now);

        if (active !== this.currentLineIndex) {
            const previousActive = this.currentLineIndex;
            this.currentLineIndex = active;
            const activeLine = this.currentLyrics[active];
            const plainActive = !this.karaokeEnabled || !(activeLine?.words && activeLine.words.length);
            this.lyricLineNodes.forEach((node, idx) => {
                node.classList.toggle("active", idx === active);
                node.classList.toggle("near", Math.abs(idx - active) <= 2 && idx !== active);
                node.classList.toggle("far", this.lyricBlur && Math.abs(idx - active) > 2);
                node.classList.toggle("active-plain", idx === active && plainActive);
            });
            const activeNode = this.lyricLineNodes[active];
            if (activeNode) this.centerLyricLine(activeNode);

            // Sync karaoke masks only when active line changes.
            for (let i = 0; i < this.karaokeLineNodes.length; i += 1) {
                const entry = this.karaokeLineNodes[i];
                if (!entry) continue;
                const progress = this.karaokeEnabled ? (i < active ? 100 : 0) : 0;
                this.setKaraokeFillProgress(entry, progress / 100);
            }
            if (previousActive !== active) this.lastKaraokeProgress = -1;
        }

        const activeKaraoke = this.karaokeLineNodes[active];
        if (!activeKaraoke) return;
        const progress = this.karaokeEnabled
            ? this.computeKaraokeProgress(this.currentLyrics[active], now, active)
            : 0;
        if (Math.abs(progress - this.lastKaraokeProgress) < 0.002) return;
        this.lastKaraokeProgress = progress;
        this.setKaraokeFillProgress(activeKaraoke, progress);
    }

    findActiveLyricIndex(now) {
        const list = this.currentLyrics;
        if (!list.length) return 0;

        // Advance exactly at next line start to avoid lingering on previous line tail.
        const epsilon = 0.0001;

        // Fast path for adjacent playback movement.
        let idx = clamp(this.lastLyricLookupIndex, 0, list.length - 1);
        if (now >= list[idx].time - epsilon && now < ((list[idx + 1]?.time ?? Infinity) - epsilon)) {
            return idx;
        }
        if (idx + 1 < list.length && now >= list[idx + 1].time - epsilon && now < ((list[idx + 2]?.time ?? Infinity) - epsilon)) {
            this.lastLyricLookupIndex = idx + 1;
            return idx + 1;
        }

        // Binary search fallback.
        let left = 0;
        let right = list.length - 1;
        let best = 0;
        while (left <= right) {
            const mid = (left + right) >> 1;
            if (list[mid].time - epsilon <= now) {
                best = mid;
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        this.lastLyricLookupIndex = best;
        return best;
    }

    syncVideoDockPlacement(inFullscreen) {
        if (this.type !== "video") return;
        const dock = this.ui.playerDock;
        const stage = this.ui.videoStage;
        if (!dock || !stage) return;

        if (inFullscreen) {
            if (!this.fullscreenDockOriginalParent) {
                this.fullscreenDockOriginalParent = dock.parentNode;
                this.fullscreenDockNextSibling = dock.nextSibling;
            }
            if (dock.parentNode !== stage) {
                stage.appendChild(dock);
            }
            return;
        }

        if (!this.fullscreenDockOriginalParent || dock.parentNode === this.fullscreenDockOriginalParent) return;
        this.fullscreenDockOriginalParent.insertBefore(dock, this.fullscreenDockNextSibling);
    }

    syncVideoOverlayPlacement(inFullscreen) {
        if (this.type !== "video") return;
        const stage = this.ui.videoStage;
        if (!stage) return;

        const moveNode = (node, parentKey, siblingKey) => {
            if (!node) return;
            if (inFullscreen) {
                if (!this[parentKey]) {
                    this[parentKey] = node.parentNode;
                    this[siblingKey] = node.nextSibling;
                }
                if (node.parentNode !== stage) {
                    stage.appendChild(node);
                }
                return;
            }
            if (!this[parentKey] || node.parentNode === this[parentKey]) return;
            this[parentKey].insertBefore(node, this[siblingKey]);
        };

        moveNode(this.status, "fullscreenStatusOriginalParent", "fullscreenStatusNextSibling");
        moveNode(this.ui.gestureToast, "fullscreenGestureToastOriginalParent", "fullscreenGestureToastNextSibling");
    }

    handleFullscreenDockState() {
        const isFs = this.isFullscreenActive();
        this.refreshFullscreenButtonVisual(isFs);

        if (this.type !== "video") return;
        this.syncVideoDockPlacement(isFs);
        this.syncVideoOverlayPlacement(isFs);
        document.body.classList.toggle("video-fullscreen", isFs);
        if (!isFs) {
            document.body.classList.remove("show-dock");
            if (this.fullscreenDockHideTimer) clearTimeout(this.fullscreenDockHideTimer);
            this.fullscreenDockHideTimer = null;
            return;
        }
        document.body.classList.add("show-dock");
        if (this.fullscreenDockHideTimer) clearTimeout(this.fullscreenDockHideTimer);
        this.fullscreenDockHideTimer = setTimeout(() => {
            document.body.classList.remove("show-dock");
        }, 1000);
    }

    handleVideoFullscreenHover(evt) {
        if (this.type !== "video") return;
        if (!this.isFullscreenActive()) return;
        const target = evt.target;
        if (target && typeof target.closest === "function" && target.closest(".player-dock, .floating-panel, .playlist-drawer")) {
            document.body.classList.add("show-dock");
            if (this.fullscreenDockHideTimer) clearTimeout(this.fullscreenDockHideTimer);
            this.fullscreenDockHideTimer = null;
            return;
        }
        const nearBottom = evt.clientY >= window.innerHeight - 140;
        if (nearBottom) {
            document.body.classList.add("show-dock");
            if (this.fullscreenDockHideTimer) clearTimeout(this.fullscreenDockHideTimer);
            this.fullscreenDockHideTimer = null;
            return;
        }
        if (this.fullscreenDockHideTimer) clearTimeout(this.fullscreenDockHideTimer);
        this.fullscreenDockHideTimer = setTimeout(() => {
            document.body.classList.remove("show-dock");
        }, 1000);
    }

    tryInitArtDanmakuEngine() {
        if (this.type !== "video") return;
        const Artplayer = window.Artplayer;
        const danmukuFactory = window.artplayerPluginDanmuku;
        const stage = this.ui?.videoStage;
        if (!Artplayer || !danmukuFactory || !stage) return;

        try {
            const sourceMedia = this.media;
            const plugin = danmukuFactory({
                danmuku: [],
                speed: Math.max(1, Number((8 / Math.max(0.5, this.danmakuSpeed)).toFixed(2))),
                opacity: this.danmakuOpacity,
                fontSize: this.danmakuSize,
                antiOverlap: this.danmakuLayoutMode === "no-overlap",
                synchronousPlayback: true,
            });
            this.artPlayer = new Artplayer({
                container: stage,
                url: sourceMedia?.currentSrc || sourceMedia?.src || "",
                autoplay: false,
                autoMini: false,
                pip: false,
                setting: false,
                hotkey: false,
                fullscreen: false,
                fullscreenWeb: false,
                miniProgressBar: false,
                mutex: false,
                backdrop: false,
                controls: [],
                plugins: [plugin],
            });
            if (sourceMedia) {
                sourceMedia.pause?.();
                sourceMedia.style.display = "none";
            }
            this.media = this.artPlayer.video;
            this.artDanmukuReady = true;
            if (this.ui.danmakuLayer) {
                this.ui.danmakuLayer.style.display = "";
                this.ui.danmakuLayer.innerHTML = "";
            }
        } catch (error) {
            this.artPlayer = null;
            this.artDanmukuReady = false;
        }
    }

    setEmbeddedVideoMode(isEmbeddedVideo) {
        if (this.ui.videoStage) this.ui.videoStage.classList.toggle("is-embedded-video", isEmbeddedVideo);
        if (this.ui.bilibiliClickGuard) {
            this.ui.bilibiliClickGuard.classList.toggle("hidden", !isEmbeddedVideo);
        }
        if (this.ui.bilibiliPlayer && !isEmbeddedVideo) {
            this.ui.bilibiliPlayer.classList.add("hidden");
            this.ui.bilibiliPlayer.src = "";
        }
        [this.ui.volumeRange].forEach((control) => {
            if (control) control.disabled = isEmbeddedVideo;
        });
        if (this.ui.qualitySelect) this.ui.qualitySelect.disabled = !isEmbeddedVideo;
        if (isEmbeddedVideo) {
            this.stopProgressAnimation();
            this.startEmbeddedSyncTimer();
            this.setPlayVisual(false);
            if (this.ui.seek) {
                this.ui.seek.value = "0";
                this.ui.seek.style.setProperty("--progress-percent", "0%");
                this.ui.seek.style.setProperty("--buffered-percent", "0%");
            }
            this.ui.runningTime.textContent = "00:00";
            this.ui.totalTime.textContent = "00:00";
            this.postEmbeddedCommand("requestState");
            return;
        }
        this.stopEmbeddedSyncTimer();
    }

    refreshEmbeddedPlayer(track, options = {}) {
        if (!track?.embedUrl || !this.ui.bilibiliPlayer) return;
        const quality = this.ui.qualitySelect?.value || "0";
        const url = new URL(track.embedUrl);
        url.searchParams.set("qn", quality);
        url.searchParams.set("high_quality", "1");
        url.searchParams.set("fnval", "4048");
        if (["120", "125", "127"].includes(String(quality))) {
            url.searchParams.set("fourk", "1");
        }
        if (options.resetToStart !== false) {
            url.searchParams.set("start_progress", "0");
            this.embeddedState.currentTime = 0;
            this.embeddedTimeHint = 0;
        }
        this.embeddedState.qualityLabel = bilibiliQualityLabel(quality);
        this.embeddedState.dynamicRange = String(quality) === "125" ? "HDR" : "SDR";
        this.refreshEmbeddedStatusText();
        this.ui.bilibiliPlayer.src = url.href;
        this.ui.bilibiliPlayer.classList.remove("hidden");
        this.ui.bilibiliPlayer.onload = () => {
            this.postEmbeddedCommand("seek", { time: 0 });
            this.postEmbeddedCommand("requestState");
            this.postEmbeddedCommand("getState");
            if (!this.embeddedState.paused) {
                this.postEmbeddedCommand("play");
            }
            this.refreshEmbeddedProgressFromHint();
        };
    }

    bindDirectVideoFallback(track) {
        if (this.type !== "video" || !track || track._directFallbackBound) return;
        track._directFallbackBound = true;
        const media = this.media;
        const fail = () => {
            if (this.embeddedFallbackHandled) return;
            this.embeddedFallbackHandled = true;
            this.setStatus("直链播放失效，正在回退到 B 站播放器...");
            if (track.bilibiliUrl) {
                track.embedUrl = `https://player.bilibili.com/player.html?bvid=${encodeURIComponent(track.bvid || "")}&page=1&high_quality=1&danmaku=1&autoplay=0`;
                this.refreshEmbeddedQualityOptions(track);
                this.setEmbeddedVideoMode(true);
                this.resetEmbeddedState();
                this.refreshEmbeddedPlayer(track, { resetToStart: true });
                return;
            }
            if (track.bilibiliUrl) {
                window.open(track.bilibiliUrl, "_blank", "noopener,noreferrer");
                this.setStatus("已切换到外链打开，继续在新页面播放");
                return;
            }
            this.setStatus("视频直链失效，且没有可用的 B 站回退链接");
        };

        media.addEventListener("error", fail, { once: true });
        media.addEventListener("stalled", () => {
            if (Number(media.currentTime || 0) > 0 || media.readyState > 2) return;
            fail();
        }, { once: true });
    }

    getArtDanmakuPlugin() {
        if (!this.artDanmukuReady || !this.artPlayer?.plugins) return null;
        return this.artPlayer.plugins.artplayerPluginDanmuku || null;
    }

    getFilteredDanmakuItems() {
        return this.getFilteredDanmakuItemsWithOptions();
    }

    getFilteredDanmakuItemsWithOptions(options = {}) {
        const includeTop = options.includeTop !== false;
        const includeBottom = options.includeBottom !== false;
        const includeScroll = options.includeScroll !== false;
        const list = (this.danmakuList || []).filter((item) => item && item.text);
        return list.filter((item) => {
            const mode = item.mode || "scroll";
            if (mode === "scroll" && this.blockScrollDanmaku) return false;
            if (mode === "top" && this.blockTopDanmaku) return false;
            if (mode === "bottom" && this.blockBottomDanmaku) return false;
            if (mode === "top" && !includeTop) return false;
            if (mode === "bottom" && !includeBottom) return false;
            if (mode === "scroll" && !includeScroll) return false;
            return true;
        }).map((item) => ({
            text: item.text,
            time: Number(item.time || 0),
            color: item.color || "#ffffff",
            mode: item.mode === "top" ? 1 : (item.mode === "bottom" ? 2 : 0),
        }));
    }

    syncDanmakuRenderer() {
        if (this.type !== "video") return;
        const plugin = this.getArtDanmakuPlugin();
        if (plugin) {
            try {
                if (!this.danmakuEnabled) {
                    if (typeof plugin.hide === "function") plugin.hide();
                    if (this.danmakuLayer) this.danmakuLayer.innerHTML = "";
                    this.danmakuCursor = 0;
                    this.lastDanmakuTime = -1;
                    this.danmakuLaneEndTime.scroll.fill(0);
                    this.danmakuLaneEndTime.top.fill(0);
                    this.danmakuLaneEndTime.bottom.fill(0);
                    return;
                }
                if (typeof plugin.show === "function") plugin.show();
                if (typeof plugin.config === "function") {
                    plugin.config({
                        speed: Math.max(1, Number((8 / Math.max(0.5, this.danmakuSpeed)).toFixed(2))),
                        opacity: this.danmakuOpacity,
                        fontSize: this.danmakuSize,
                        antiOverlap: this.danmakuLayoutMode === "no-overlap",
                    });
                }
                const items = this.getFilteredDanmakuItemsWithOptions({ includeTop: false, includeScroll: false });
                if (typeof plugin.load === "function") {
                    plugin.load(items);
                }
            } catch (error) {
                // fallback to legacy renderer below
            }
            return;
        }

        if (!this.danmakuEnabled && this.danmakuLayer) {
            this.danmakuLayer.innerHTML = "";
            this.danmakuCursor = 0;
            this.lastDanmakuTime = -1;
            this.danmakuLaneEndTime.scroll.fill(0);
            this.danmakuLaneEndTime.top.fill(0);
            this.danmakuLaneEndTime.bottom.fill(0);
        }
    }

    findDanmakuStartIndex(timeSec) {
        const list = this.danmakuList || [];
        let left = 0;
        let right = list.length - 1;
        let answer = list.length;
        while (left <= right) {
            const mid = (left + right) >> 1;
            if (Number(list[mid]?.time || 0) >= timeSec) {
                answer = mid;
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        return answer;
    }

    findActiveSubtitleIndex(now) {
        const list = this.subtitleCues || [];
        if (!list.length) return -1;

        let idx = clamp(this.subtitleLookupIndex, 0, list.length - 1);
        const isActive = (i) => i >= 0
            && i < list.length
            && now >= Number(list[i].start || 0)
            && now <= Number(list[i].end || 0);

        if (isActive(idx)) return idx;
        if (isActive(idx + 1)) {
            this.subtitleLookupIndex = idx + 1;
            return idx + 1;
        }

        let left = 0;
        let right = list.length - 1;
        let best = -1;
        while (left <= right) {
            const mid = (left + right) >> 1;
            if (Number(list[mid].start || 0) <= now) {
                best = mid;
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        if (best >= 0 && now <= Number(list[best].end || 0)) {
            this.subtitleLookupIndex = best;
            return best;
        }
        return -1;
    }

    syncSubtitleToggleAvailability() {
        if (this.type !== "video") return;
        const hasSubtitle = Array.isArray(this.subtitleCues) && this.subtitleCues.length > 0;
        const isEmbeddedVideo = !!this.tracks[this.currentIndex]?.embedUrl;
        if (this.ui.subtitleMode) {
            this.ui.subtitleMode.disabled = false;
            if (isEmbeddedVideo) {
                this.ui.subtitleMode.value = "bilibili";
            } else if (!hasSubtitle) {
                this.ui.subtitleMode.value = "off";
            } else {
                this.ui.subtitleMode.value = this.subtitleEnabled ? "on" : "off";
            }
            this.syncMediaSelectDropdown(
                document.getElementById("subtitle-mode-dropdown"),
                this.ui.subtitleMode,
                document.getElementById("subtitle-mode-label")
            );
        }
        this.applySubtitleOpacity();
        if (!hasSubtitle && this.ui.subtitleLayer) {
            this.currentSubtitleText = "";
            this.ui.subtitleLayer.classList.add("hidden");
            if (this.ui.subtitleLayer.childElementCount) {
                this.ui.subtitleLayer.innerHTML = "";
            }
        }
    }

    applySubtitleOpacity() {
        if (!this.ui.subtitleLayer) return;
        const opacity = clamp(Number(this.subtitleOpacity || 1), 0.2, 1);
        this.subtitleOpacity = opacity;
        this.ui.subtitleLayer.style.opacity = String(opacity);
    }

    renderSubtitles() {
        if (this.type !== "video" || !this.ui.subtitleLayer) return;
        const layer = this.ui.subtitleLayer;
        if (this.tracks[this.currentIndex]?.embedUrl) {
            layer.classList.add("hidden");
            layer.innerHTML = "";
            return;
        }
        if (!this.subtitleEnabled || !Array.isArray(this.subtitleCues) || !this.subtitleCues.length) {
            if (this.currentSubtitleText || !layer.classList.contains("hidden") || layer.childElementCount) {
                this.currentSubtitleText = "";
                layer.classList.add("hidden");
                layer.innerHTML = "";
            }
            return;
        }

        const now = Number(this.media.currentTime || 0);
        const active = this.findActiveSubtitleIndex(now);
        if (active < 0) {
            if (this.currentSubtitleText || !layer.classList.contains("hidden") || layer.childElementCount) {
                this.currentSubtitleText = "";
                layer.classList.add("hidden");
                layer.innerHTML = "";
            }
            return;
        }

        const cue = this.subtitleCues[active];
        const text = normalizeSubtitleText(cue?.text || "");
        if (!text) {
            if (this.currentSubtitleText || !layer.classList.contains("hidden") || layer.childElementCount) {
                this.currentSubtitleText = "";
                layer.classList.add("hidden");
                layer.innerHTML = "";
            }
            return;
        }

        if (text !== this.currentSubtitleText) {
            this.currentSubtitleText = text;
            layer.innerHTML = "";

            const cueNode = document.createElement("div");
            cueNode.className = "subtitle-cue";
            const lines = text.split(/\n+/).slice(0, 2);
            if (!lines.length) {
                cueNode.textContent = text;
            } else {
                lines.forEach((line) => {
                    const lineNode = document.createElement("div");
                    lineNode.className = "subtitle-line";
                    lineNode.textContent = line;
                    cueNode.appendChild(lineNode);
                });
            }

            layer.appendChild(cueNode);
        }

        layer.classList.remove("hidden");
    }

    renderDanmaku() {
        if (this.type !== "video" || !this.danmakuEnabled || !this.danmakuLayer || !this.danmakuList.length) return;
        const nowTick = Math.floor((this.media.currentTime || 0) * 10);
        if (nowTick === this.lastDanmakuTick) return;
        this.lastDanmakuTick = nowTick;
        const currentTime = this.media.currentTime || 0;
        const windowStart = currentTime - 0.15;
        const windowEnd = currentTime + 0.15;

        if (this.lastDanmakuTime < 0 || currentTime < this.lastDanmakuTime - 0.2) {
            this.danmakuCursor = this.findDanmakuStartIndex(windowStart);
            this.danmakuLaneEndTime.scroll.fill(0);
            this.danmakuLaneEndTime.top.fill(0);
        }
        this.lastDanmakuTime = currentTime;

        while (this.danmakuCursor < this.danmakuList.length && Number(this.danmakuList[this.danmakuCursor].time || 0) < windowStart) {
            this.danmakuCursor += 1;
        }

        let idx = this.danmakuCursor;
        while (idx < this.danmakuList.length) {
            const item = this.danmakuList[idx];
            const time = Number(item?.time || 0);
            if (time > windowEnd) break;
            const mode = item.mode || "scroll";
            const renderNatively = mode === "top" || mode === "scroll";
            if (mode === "scroll" && this.blockScrollDanmaku) {
                idx += 1;
                continue;
            }
            if (mode === "top" && this.blockTopDanmaku) {
                idx += 1;
                continue;
            }
            if (mode === "bottom" && this.blockBottomDanmaku) {
                idx += 1;
                continue;
            }
            if (this.artDanmukuReady && !renderNatively) {
                idx += 1;
                continue;
            }

            const span = document.createElement("span");
            span.className = `danmaku-item mode-${mode}`;
            span.textContent = item.text;
            span.style.color = item.color || "#ffffff";
            span.style.fontSize = `${this.danmakuSize}px`;
            span.style.fontWeight = String(this.danmakuWeight);
            span.style.opacity = String(this.danmakuOpacity);
            span.style.setProperty("--danmaku-opacity", String(this.danmakuOpacity));

            let duration = (12 + Math.random() * 4) / Math.max(0.5, this.danmakuSpeed);
            if (mode === "top") {
                duration = 4 / Math.max(0.5, this.danmakuSpeed);
                const layerHeight = Math.max(this.danmakuLayer.clientHeight || 0, this.media.clientHeight || 0, 280);
                const laneHeight = Math.max(24, Math.round(this.danmakuSize * 1.35));
                const maxTopLanes = Math.max(1, Math.min(10, Math.floor((layerHeight * 0.46) / laneHeight)));
                if (this.danmakuLaneEndTime.top.length !== maxTopLanes) {
                    const nextLanes = Array.from({ length: maxTopLanes }, (_, lane) => Number(this.danmakuLaneEndTime.top[lane] || 0));
                    this.danmakuLaneEndTime.top = nextLanes;
                }
                const laneIndex = this.danmakuLaneEndTime.top.findIndex((endAt) => Number(endAt || 0) <= currentTime);
                if (laneIndex < 0) {
                    idx += 1;
                    continue;
                }
                this.danmakuLaneEndTime.top[laneIndex] = currentTime + duration + 0.06;
                span.style.top = `${8 + (laneIndex * laneHeight)}px`;
            } else if (mode === "bottom") {
                span.style.top = "86%";
                duration = 4 / Math.max(0.5, this.danmakuSpeed);
            } else {
                const layerHeight = Math.max(this.danmakuLayer.clientHeight || 0, this.media.clientHeight || 0, 280);
                const laneHeight = Math.max(22, Math.round(this.danmakuSize * 1.28));
                const maxScrollLanes = Math.max(1, Math.min(30, Math.floor((layerHeight * 0.78) / laneHeight)));
                if (this.danmakuLaneEndTime.scroll.length !== maxScrollLanes) {
                    const nextLanes = Array.from({ length: maxScrollLanes }, (_, lane) => Number(this.danmakuLaneEndTime.scroll[lane] || 0));
                    this.danmakuLaneEndTime.scroll = nextLanes;
                }
                const laneIndex = this.danmakuLaneEndTime.scroll.findIndex((endAt) => Number(endAt || 0) <= currentTime);
                if (laneIndex < 0) {
                    idx += 1;
                    continue;
                }
                this.danmakuLaneEndTime.scroll[laneIndex] = currentTime + duration + 0.06;
                span.style.top = `${6 + (laneIndex * laneHeight)}px`;
            }

            span.style.animationDuration = `${duration}s`;
            span.style.animationPlayState = this.media.paused ? "paused" : "running";
            this.danmakuLayer.appendChild(span);
            span.addEventListener("animationend", () => {
                span.remove();
            }, { once: true });
            idx += 1;
        }
        this.danmakuCursor = idx;
    }

    ensureEq() {
        if (this.eqInited) return;
        try {
            this.audioCtx = new AudioContext();
            const source = this.audioCtx.createMediaElementSource(this.media);
            const low = this.audioCtx.createBiquadFilter();
            low.type = "lowshelf";
            low.frequency.value = 320;
            const mid = this.audioCtx.createBiquadFilter();
            mid.type = "peaking";
            mid.frequency.value = 1200;
            mid.Q.value = 1;
            const high = this.audioCtx.createBiquadFilter();
            high.type = "highshelf";
            high.frequency.value = 4000;
            const master = this.audioCtx.createGain();
            master.gain.value = 1;
            source.connect(low);
            low.connect(mid);
            mid.connect(high);
            high.connect(master);
            master.connect(this.audioCtx.destination);
            this.eqNodes = { low, mid, high, master };
            this.eqInited = true;
            this.updateEq();
        } catch (error) {
            this.setStatus("均衡器初始化失败，浏览器可能限制自动播放音频上下文");
        }
    }

    async getTrackThemeColors(coverSource) {
        const key = String(coverSource || "").trim();
        if (!key) return extractColorsFromDataUrl(coverSource);
        if (this.coverColorCache.has(key)) {
            return this.coverColorCache.get(key);
        }
        const colors = await extractColorsFromDataUrl(coverSource);
        this.coverColorCache.set(key, colors);
        if (this.coverColorCache.size > 96) {
            const oldestKey = this.coverColorCache.keys().next().value;
            this.coverColorCache.delete(oldestKey);
        }
        return colors;
    }

    updateEq() {
        if (!this.eqNodes) return;
        this.eqNodes.low.gain.value = Number(this.ui.eqLow.value || 0);
        this.eqNodes.mid.gain.value = Number(this.ui.eqMid.value || 0);
        this.eqNodes.high.gain.value = Number(this.ui.eqHigh.value || 0);
    }

    applyLyricTypography() {
        if (!this.lyricsList) return;
        const isDarkText = this.lyricTextColor.toLowerCase() === "#111111";
        this.lyricsList.style.setProperty("--lyric-size", `${this.lyricSize}px`);
        this.lyricsList.style.setProperty("--lyric-weight", String(this.lyricWeight));
        this.lyricsList.style.setProperty("--lyric-color", this.lyricTextColor);
        this.lyricsList.style.setProperty("--lyric-glow", this.lyricGlowColor);
        this.lyricsList.style.setProperty("--lyric-translation-color", isDarkText ? "rgba(17, 17, 17, 0.62)" : "rgba(234, 240, 255, 0.56)");
        this.lyricsList.style.setProperty("--lyric-karaoke-pending", isDarkText ? "rgba(17, 17, 17, 0.42)" : "rgba(255, 255, 255, 0.42)");
        this.lyricsList.style.setProperty("--lyric-karaoke-done", isDarkText ? "rgba(17, 17, 17, 0.96)" : "#ffffff");
    }

    applyAutoLyricColor(colors) {
        const rgb = parseRgbText(colors?.[0] || "");
        if (!rgb) {
            this.lyricTextColor = "#ffffff";
            this.lyricGlowColor = "rgba(255, 255, 255, 0.52)";
            this.applyLyricTypography();
            return;
        }
        const r = rgb[0] / 255;
        const g = rgb[1] / 255;
        const b = rgb[2] / 255;
        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        if (luma > 0.82) {
            this.lyricTextColor = "#111111";
            this.lyricGlowColor = "rgba(0, 0, 0, 0.34)";
        } else {
            this.lyricTextColor = "#ffffff";
            this.lyricGlowColor = "rgba(255, 255, 255, 0.52)";
        }
        this.applyLyricTypography();
    }

    applyMusicReadableTheme(colors) {
        const root = document.documentElement;
        const rgb = parseRgbText(colors?.[0] || "");
        if (!rgb) {
            root.style.setProperty("--text-main", "#ffffff");
            root.style.setProperty("--text-muted", "rgba(255, 255, 255, 0.72)");
            root.style.setProperty("--music-text-main", "#ffffff");
            root.style.setProperty("--music-text-muted", "rgba(255, 255, 255, 0.72)");
            root.style.setProperty("--music-control-bg", "rgba(255, 255, 255, 0.06)");
            root.style.setProperty("--music-control-border", "rgba(255, 255, 255, 0.16)");
            root.style.setProperty("--icon-color-main", "#ffffff");
            root.style.setProperty("--icon-color-contrast", "#07101f");
            return;
        }
        const r = rgb[0] / 255;
        const g = rgb[1] / 255;
        const b = rgb[2] / 255;
        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const isBrightBg = luma > 0.82;
        if (isBrightBg) {
            root.style.setProperty("--text-main", "#111111");
            root.style.setProperty("--text-muted", "rgba(17, 17, 17, 0.72)");
            root.style.setProperty("--music-text-main", "#111111");
            root.style.setProperty("--music-text-muted", "rgba(17, 17, 17, 0.72)");
            root.style.setProperty("--music-control-bg", "rgba(255, 255, 255, 0.22)");
            root.style.setProperty("--music-control-border", "rgba(0, 0, 0, 0.2)");
            root.style.setProperty("--icon-color-main", "#111111");
            root.style.setProperty("--icon-color-contrast", "#07101f");
        } else {
            root.style.setProperty("--text-main", "#ffffff");
            root.style.setProperty("--text-muted", "rgba(255, 255, 255, 0.72)");
            root.style.setProperty("--music-text-main", "#ffffff");
            root.style.setProperty("--music-text-muted", "rgba(255, 255, 255, 0.72)");
            root.style.setProperty("--music-control-bg", "rgba(255, 255, 255, 0.06)");
            root.style.setProperty("--music-control-border", "rgba(255, 255, 255, 0.16)");
            root.style.setProperty("--icon-color-main", "#ffffff");
            root.style.setProperty("--icon-color-contrast", "#07101f");
        }
    }

    applyThemeFromCover(colors) {
        this.lastThemeColors = Array.isArray(colors) && colors.length ? [...colors] : this.lastThemeColors;
        const primaryParsed = parseRgbText(colors?.[0]);
        const primary = primaryParsed || [126, 220, 255];
        const accent = parseRgbText(colors?.[2]) || [255, 159, 128];
        const root = document.documentElement;
        const accentHex = rgbToHex(primary[0], primary[1], primary[2]);
        root.style.setProperty("--accent", accentHex);
        root.style.setProperty("--accent-rgb", `${primary[0]}, ${primary[1]}, ${primary[2]}`);
        root.style.setProperty("--accent-2", rgbToHex(accent[0], accent[1], accent[2]));
        root.style.setProperty("--accent-2-rgb", `${accent[0]}, ${accent[1]}, ${accent[2]}`);
        this.applyMusicReadableTheme(colors);
        this.publishBrowserThemeColor(accentHex);
    }

    getPreferredThemeMode() {
        let mode = null;
        try {
            const raw = localStorage.getItem("setting-lightdarktoggle");
            const parsed = Number(raw);
            if (parsed === 1) mode = "light";
            if (parsed === 2) mode = "dark";
        } catch (error) {
            mode = null;
        }
        if (mode) return mode;

        try {
            const follow = localStorage.getItem("follow-system");
            if (follow === "false") {
                const theme = localStorage.getItem("theme");
                return theme === "dark" ? "dark" : "light";
            }
        } catch (error) {
            // ignore
        }
        return "auto";
    }

    resolveEffectiveThemeMode() {
        const preferred = this.getPreferredThemeMode();
        if (preferred === "auto") {
            return this.systemThemeMedia?.matches ? "dark" : "light";
        }
        return preferred;
    }

    applyPreferredThemeMode() {
        const effective = this.resolveEffectiveThemeMode();
        document.body.classList.toggle("theme-light", effective === "light");
        document.body.classList.toggle("theme-dark", effective === "dark");
    }

    refreshThemeAwareColors() {
        if (this.type !== "music") return;
        this.applyAutoLyricColor(this.lastThemeColors);
        this.applyMusicReadableTheme(this.lastThemeColors);
    }

    publishBrowserThemeColor(colorHex) {
        if (!colorHex) return;
        let meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) {
            meta = document.createElement("meta");
            meta.setAttribute("name", "theme-color");
            document.head.appendChild(meta);
        }
        meta.setAttribute("content", colorHex);
    }

    applyBrightness() {
        if (this.type !== "video") return;
        const ratio = clamp(Number(this.brightnessLevel || 100) / 100, 0, 2);
        this.media.style.filter = `brightness(${ratio})`;
        if (this.ui.bilibiliPlayer) {
            this.ui.bilibiliPlayer.style.filter = `brightness(${ratio})`;
        }
    }

    updateCoverShape(target, src) {
        if (!target || !src) return;
        target.classList.remove("cover-rect");
        const probe = new Image();
        probe.referrerPolicy = "no-referrer";
        probe.onload = () => {
            const w = Number(probe.naturalWidth || 0);
            const h = Number(probe.naturalHeight || 0);
            if (!w || !h) return;
            const ratio = w / h;
            if (ratio < 0.9 || ratio > 1.1) {
                target.classList.add("cover-rect");
            } else {
                target.classList.remove("cover-rect");
            }
        };
        probe.src = src;
    }

    queueStorageKey() {
        return `${this.settingsPrefix()}queue-v3`;
    }

    scheduleQueuePersistence() {
        if (this.type !== "video") return;
        if (this.queuePersistTimer) clearTimeout(this.queuePersistTimer);
        this.queuePersistTimer = setTimeout(() => {
            this.queuePersistTimer = null;
            this.persistQueueState();
        }, 120);
    }

    sanitizeTrackForStorage(track) {
        if (!track || track.type !== "video") return null;
        const sourceUrl = String(track.sourceUrl || "");
        const bilibiliUrl = String(track.bilibiliUrl || "");
        const embedUrl = String(track.embedUrl || "");
        if (track.localImport) return null;
        if (!track.localImport && !bilibiliUrl && !/^https?:\/\//i.test(sourceUrl)) return null;
        return {
            type: "video",
            title: String(track.title || ""),
            author: String(track.author || ""),
            coverUrl: String(track.coverUrl || ""),
            sourceUrl,
            sourceTag: String(track.sourceTag || ""),
            localImport: !!track.localImport,
            embedUrl,
            bilibiliUrl,
            bvid: track.bvid || "",
            aid: track.aid || "",
            cid: track.cid || "",
            videoQualityLabel: String(track.videoQualityLabel || ""),
            videoDynamicRange: String(track.videoDynamicRange || ""),
            audioQuality: String(track.audioQuality || ""),
            videoWidth: Number(track.videoWidth || 0) || 0,
            videoHeight: Number(track.videoHeight || 0) || 0,
        };
    }

    persistQueueState() {
        if (this.type !== "video") return;
        const tracks = this.tracks
            .map((track) => this.sanitizeTrackForStorage(track))
            .filter(Boolean);
        const payload = {
            version: 3,
            tracks,
            currentIndex: clamp(Number(this.currentIndex || 0), 0, Math.max(0, tracks.length - 1)),
            loopMode: this.loopMode,
            quality: String(this.ui.qualitySelect?.value || "0"),
            updatedAt: Date.now(),
        };
        try {
            localStorage.setItem(this.queueStorageKey(), JSON.stringify(payload));
        } catch (error) {
            // ignore storage failures
        }
    }

    restoreQueueFromStorage() {
        if (this.type !== "video" || this.tracks.length) return;
        let payload = null;
        try {
            payload = JSON.parse(localStorage.getItem(this.queueStorageKey()) || "null");
        } catch (error) {
            payload = null;
        }
        if (!payload || !Array.isArray(payload.tracks) || !payload.tracks.length) return;
        const restored = payload.tracks
            .map((raw) => this.sanitizeTrackForStorage(raw))
            .filter(Boolean)
            .map((track) => ({
                ...track,
                danmakuFile: null,
                subtitleFiles: [],
            }));
        if (!restored.length) return;
        this.tracks = restored;
        this.ensurePlaybackOrder({ force: true });
        if (this.ui.qualitySelect && payload.quality) {
            this.ui.qualitySelect.value = String(payload.quality);
            this.syncMediaSelectDropdown(
                document.getElementById("quality-select-dropdown"),
                this.ui.qualitySelect,
                document.getElementById("quality-select-label")
            );
        }
        this.renderPlaylist(this.ui.playlistSearch?.value?.trim().toLowerCase() || "");
        const index = clamp(Number(payload.currentIndex || 0), 0, restored.length - 1);
        this.selectTrack(index, { autoplay: false });
        this.setStatus(`已恢复 ${restored.length} 条播放记录`);
    }

    primeTrackCoverAsync(track, trackIndex) {
        if (this.type !== "video" || !track) return;
        if (track.coverUrl) {
            this.scheduleQueuePersistence();
            return;
        }
        if (track.embedUrl || track.bilibiliUrl) {
            if (track.coverUrl) {
                this.renderPlaylist(this.ui.playlistSearch.value.trim().toLowerCase());
                this.scheduleQueuePersistence();
                this.preloadTrackTheme(track);
            }
            return;
        }
        if (!track.sourceUrl || /^blob:/i.test(track.sourceUrl) === false) return;
        const probe = document.createElement("video");
        probe.preload = "metadata";
        probe.muted = true;
        probe.src = track.sourceUrl;
        const finish = () => {
            probe.src = "";
            probe.remove();
        };
        const onLoaded = async () => {
            try {
                const duration = Number(probe.duration || 0);
                if (!duration || !Number.isFinite(duration)) {
                    finish();
                    return;
                }
                const canvas = this.previewCanvas;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    finish();
                    return;
                }
                probe.currentTime = clamp(duration * 0.3, 0, Math.max(0, duration - 0.1));
                probe.addEventListener("seeked", async () => {
                    try {
                        ctx.drawImage(probe, 0, 0, canvas.width, canvas.height);
                        const data = canvas.toDataURL("image/jpeg", 0.76);
                        if (data && this.tracks[trackIndex] === track && !track.coverUrl) {
                            track.coverUrl = data;
                            this.updateCoverShape(this.cover, this.cover.src || data);
                            this.renderPlaylist(this.ui.playlistSearch.value.trim().toLowerCase());
                            if (this.currentIndex === trackIndex && this.cover) {
                                this.cover.src = data;
                                this.preloadTrackTheme(track);
                            }
                            this.scheduleQueuePersistence();
                        }
                    } catch (error) {
                        // ignore cover capture failures
                    } finally {
                        finish();
                    }
                }, { once: true });
            } catch (error) {
                finish();
            }
        };
        probe.addEventListener("loadedmetadata", onLoaded, { once: true });
        probe.addEventListener("error", finish, { once: true });
    }

    async preloadTrackTheme(track) {
        if (!track?.coverUrl) return;
        try {
            const colors = await this.getTrackThemeColors(track.coverUrl);
            if (this.currentIndex >= 0 && this.tracks[this.currentIndex] === track && this.dynamicBg) {
                document.documentElement.style.setProperty("--bg-a", colors[0]);
                document.documentElement.style.setProperty("--bg-b", colors[1]);
                document.documentElement.style.setProperty("--bg-c", colors[2]);
                this.applyThemeFromCover(colors);
            }
        } catch (error) {
            // ignore theme extraction failures
        }
    }

    resetEmbeddedState() {
        this.embeddedTimeHint = 0;
        this.embeddedState = {
            currentTime: 0,
            duration: 0,
            paused: true,
            ended: false,
            qualityLabel: bilibiliQualityLabel(this.ui.qualitySelect?.value || "0"),
            dynamicRange: String(this.ui.qualitySelect?.value || "0") === "125" ? "HDR" : "SDR",
            audioQuality: "B站音轨",
        };
        this.refreshEmbeddedStatusText();
    }

    refreshEmbeddedStatusText() {
        const track = this.tracks[this.currentIndex];
        if (!track?.embedUrl) return;
        track.videoQualityLabel = this.embeddedState.qualityLabel;
        track.videoDynamicRange = this.embeddedState.dynamicRange;
        track.audioQuality = this.embeddedState.audioQuality;
        this.refreshTrackMetaDisplay(track);
    }

    postEmbeddedCommand(command, extra = {}) {
        const frame = this.ui.bilibiliPlayer;
        if (!frame || !frame.contentWindow) return;
        const payload = { command, ...extra };
        const aliasMap = {
            play: "player.play",
            pause: "player.pause",
            seek: "player.seek",
            getCurrentTime: "player.getCurrentTime",
            getDuration: "player.getDuration",
            requestState: "player.getState",
            getState: "player.getState",
        };
        const commandAlias = aliasMap[command] || command;
        const payloadVariants = [
            payload,
            { method: commandAlias, ...extra },
            { cmd: commandAlias, ...extra },
            JSON.stringify(payload),
        ];
        try {
            payloadVariants.forEach((item) => {
                frame.contentWindow.postMessage(item, "https://player.bilibili.com");
            });
        } catch (error) {
            // ignore postMessage failures
        }
    }

    handleEmbeddedPlayerMessage(evt) {
        if (!this.ui?.bilibiliPlayer || !this.ui.bilibiliPlayer.src) return;
        if (evt.origin !== "https://player.bilibili.com") return;
        const activeTrack = this.tracks[this.currentIndex];
        if (!activeTrack?.embedUrl) return;
        let data = evt.data;
        if (typeof data === "string") {
            try {
                data = JSON.parse(data);
            } catch (error) {
                return;
            }
        }
        if (!data || typeof data !== "object") return;
        const nested = data.data && typeof data.data === "object" ? data.data : null;
        const mergedData = nested ? { ...nested, ...data } : data;
        const eventName = String(mergedData.event || mergedData.type || mergedData.method || "").toLowerCase();
        if (!eventName) return;
        if (eventName.includes("time") || eventName.includes("progress") || eventName.includes("play")) {
            const current = Number(mergedData.currentTime ?? mergedData.time ?? mergedData.progress ?? NaN);
            if (Number.isFinite(current) && current >= 0) {
                this.embeddedState.currentTime = current;
                this.embeddedTimeHint = current;
            }
            const duration = Number(mergedData.duration ?? mergedData.total ?? NaN);
            if (Number.isFinite(duration) && duration > 0) {
                this.embeddedState.duration = duration;
            }
            if (eventName.includes("pause")) {
                this.embeddedState.paused = true;
                this.toggleDanmakuPauseState(true);
                this.setPlayVisual(false);
            }
            if (eventName.includes("play")) {
                this.embeddedState.paused = false;
                this.toggleDanmakuPauseState(false);
                this.setPlayVisual(true);
            }
            if (eventName.includes("ended") || eventName.includes("complete")) {
                this.embeddedState.ended = true;
                this.onTrackEnded();
            }
            this.refreshEmbeddedStatusText();
            this.refreshEmbeddedProgressFromHint();
        }

        const subtitleEnabled = mergedData.subtitleEnabled;
        if (typeof subtitleEnabled === "boolean" && this.ui?.subtitleMode && this.tracks[this.currentIndex]?.embedUrl) {
            this.ui.subtitleMode.value = subtitleEnabled ? "bilibili" : "off";
            this.syncMediaSelectDropdown(
                document.getElementById("subtitle-mode-dropdown"),
                this.ui.subtitleMode,
                document.getElementById("subtitle-mode-label")
            );
        }
    }

    refreshEmbeddedProgressFromHint() {
        const track = this.tracks[this.currentIndex];
        if (!track?.embedUrl) return;
        const total = Number(this.embeddedState.duration || this.media.duration || 0);
        const cur = Number(this.embeddedState.currentTime || this.embeddedTimeHint || 0);
        if (total > 0) {
            if (this.ui.seek) {
                this.ui.seek.max = String(total);
                if (!this.isSeeking) this.ui.seek.value = String(clamp(cur, 0, total));
                this.ui.seek.style.setProperty("--buffered-percent", "0%");
            }
            this.setProgressVisual(cur, total);
            this.ui.runningTime.textContent = formatTime(cur);
            this.ui.totalTime.textContent = formatTime(total);
            return;
        }
        this.ui.runningTime.textContent = formatTime(cur);
    }

    startEmbeddedSyncTimer() {
        if (this.embeddedSyncTimer) return;
        this.embeddedSyncTimer = setInterval(() => {
            const track = this.tracks[this.currentIndex];
            if (!track?.embedUrl) return;
            this.embeddedTimeHint += this.embeddedState.paused ? 0 : 0.5;
            this.embeddedState.currentTime = this.embeddedTimeHint;
            if (!this.embeddedState.ended && this.embeddedState.duration > 0 && this.embeddedState.currentTime >= this.embeddedState.duration - 0.2) {
                this.embeddedState.ended = true;
                this.onTrackEnded();
                return;
            }
            this.refreshEmbeddedProgressFromHint();
            this.postEmbeddedCommand("getCurrentTime");
            this.postEmbeddedCommand("getDuration");
            this.postEmbeddedCommand("requestState");
        }, 500);
    }

    stopEmbeddedSyncTimer() {
        if (!this.embeddedSyncTimer) return;
        clearInterval(this.embeddedSyncTimer);
        this.embeddedSyncTimer = null;
    }

    async getSampleRateFromBuffer(arrayBuffer) {
        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return null;
            const ctx = new Ctx();
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
            await ctx.close();
            return Number(audioBuffer.sampleRate || 0) || null;
        } catch (error) {
            return null;
        }
    }

    dispose() {
        this.stopProgressAnimation();
        this.endRightArrowHold();
        if (this.rightKeyHoldTimer) clearTimeout(this.rightKeyHoldTimer);
        this.stopEmbeddedSyncTimer();
        if (this.queuePersistTimer) clearTimeout(this.queuePersistTimer);
        if (this.fullscreenDockHideTimer) clearTimeout(this.fullscreenDockHideTimer);
        if (this.statusHideTimer) clearTimeout(this.statusHideTimer);
        if (this.gestureToastHideTimer) clearTimeout(this.gestureToastHideTimer);
        window.removeEventListener("message", this.onEmbeddedMessage);
        if (this.artPlayer && typeof this.artPlayer.destroy === "function") {
            this.artPlayer.destroy(false);
        }
        window.removeEventListener("storage", this.onThemeStorageChanged);
        if (this.systemThemeMedia) {
            if (this.systemThemeMedia.removeEventListener) {
                this.systemThemeMedia.removeEventListener("change", this.onSystemThemeChanged);
            } else if (this.systemThemeMedia.removeListener) {
                this.systemThemeMedia.removeListener(this.onSystemThemeChanged);
            }
        }
        this.objectUrls.forEach((url) => URL.revokeObjectURL(url));
    }
}

export function defaultCover(type) {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='320'%3E%3Crect width='320' height='320' fill='%2322304a'/%3E%3Ctext x='160' y='170' fill='%23ffffff' text-anchor='middle' font-size='34'%3E${type === "video" ? "VIDEO" : "MUSIC"}%3C/text%3E%3C/svg%3E`;
}

export { formatTime, LOOP_MODES, parseId3Tag, parseFlacMetadata };
