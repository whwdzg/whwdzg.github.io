const LOOP_MODES = ["none", "all", "one", "shuffle"];

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

    // Merge identical timestamps as translation lines, keeping the first line
    // as the primary karaoke line.
    const grouped = [];
    for (const line of lines) {
        const last = grouped[grouped.length - 1];
        if (last && Math.abs(last.time - line.time) < 0.001) {
            if (line.text && line.text !== last.text && !last.translations.includes(line.text)) {
                last.translations.push(line.text);
            }
            continue;
        }
        grouped.push({
            time: line.time,
            text: line.text,
            words: line.words,
            translations: [...(line.translations || [])],
        });
    }

    return grouped;
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

    // First SYLT track is the base karaoke line.
    tracks[0].forEach((line) => ensureBase(line));

    // Remaining SYLT tracks are treated as translation candidates.
    for (let i = 1; i < tracks.length; i += 1) {
        let cursor = 0;
        const candidateTrack = tracks[i];
        const allowIndexFallback = canUseIndexFallback(merged, candidateTrack);
        const trackShift = estimateTrackTimeShift(merged, candidateTrack);
        tracks[i].forEach((line, lineIndex) => {
            let base = null;
            const shiftedTime = Number(line.time || 0) + trackShift;
            const expected = estimateIndexByTime(merged, candidateTrack, shiftedTime);
            const narrowCursor = Math.max(0, Math.min(cursor, expected + 2));
            const { target, index, diff } = findNearestBaseInWindow(shiftedTime, narrowCursor);
            if (target && diff <= 1.2) {
                base = target;
                cursor = Math.max(0, index);
            } else if (allowIndexFallback && merged.length) {
                // Only allow index fallback when line count and timeline span are close.
                const ratio = candidateTrack.length > 1 ? lineIndex / Math.max(candidateTrack.length - 1, 1) : 0;
                const mapped = Math.round(ratio * Math.max(merged.length - 1, 0));
                const mappedIndex = Math.min(Math.max(mapped, expected - 1), Math.min(expected + 1, merged.length - 1));
                base = merged[mappedIndex];
                cursor = mappedIndex;
            } else {
                // Relaxed rescue for shifted tracks: only within tiny neighborhood.
                const left = Math.max(0, expected - 1);
                const right = Math.min(merged.length - 1, expected + 1);
                let pick = -1;
                let pickDiff = Infinity;
                for (let k = left; k <= right; k += 1) {
                    const d = Math.abs(Number(merged[k].time || 0) - shiftedTime);
                    if (d < pickDiff) {
                        pick = k;
                        pickDiff = d;
                    }
                }
                if (pick >= 0 && pickDiff <= 1.8) {
                    base = merged[pick];
                    cursor = pick;
                } else {
                    return;
                }
            }
            const candidates = collectLyricCandidates(line);
            if (!candidates.length) return;
            candidates.forEach((text) => {
                if (text === base.text) return;
                if (!base.translations.includes(text)) {
                    base.translations.push(text);
                }
            });
        });
        backfillMissingTranslationsByIndex(merged, candidateTrack, { radius: 2, maxPerLine: 1 });
    }

    merged.sort((a, b) => a.time - b.time);
    return merged;
}

function mergeTimedLyricsNearest(baseLines, extraLines) {
    const base = (baseLines || []).map((line) => ({
        time: line.time,
        text: line.text,
        words: line.words || null,
        translations: [...(line.translations || [])],
    }));
    const extras = (extraLines || []).filter((line) => line && (String(line.text || "").trim() || (line.translations && line.translations.length)));
    if (!base.length || !extras.length) return base;

    let cursor = 0;
    const tolerance = 1.2;
    const allowIndexFallback = canUseIndexFallback(base, extras);
    const trackShift = estimateTrackTimeShift(base, extras);

    const findTarget = (time, fallbackIndex) => {
        if (!base.length) return null;
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

        if (!allowIndexFallback) return null;
        const ratio = base.length > 1 && extras.length > 1
            ? fallbackIndex / Math.max(extras.length - 1, 1)
            : 0;
        const mapped = Math.round(ratio * Math.max(base.length - 1, 0));
        const idx = Math.min(Math.max(mapped, expected - 1), Math.min(expected + 1, base.length - 1));
        cursor = idx;
        return base[idx];
    };

    extras.forEach((line, i) => {
        const candidates = collectLyricCandidates(line);
        if (!candidates.length) return;
        let target = findTarget(line.time, i);
        if (!target) {
            const shiftedTime = Number(line.time || 0) + trackShift;
            const expected = estimateIndexByTime(base, extras, shiftedTime);
            const left = Math.max(0, expected - 1);
            const right = Math.min(base.length - 1, expected + 1);
            let pick = -1;
            let pickDiff = Infinity;
            for (let k = left; k <= right; k += 1) {
                const d = Math.abs(Number(base[k].time || 0) - shiftedTime);
                if (d < pickDiff) {
                    pick = k;
                    pickDiff = d;
                }
            }
            if (pick >= 0 && pickDiff <= 1.8) {
                target = base[pick];
            }
        }
        if (!target) return;
        candidates.forEach((text) => {
            if (text === target.text) return;
            if (!target.translations.includes(text)) {
                target.translations.push(text);
            }
        });
    });
    backfillMissingTranslationsByIndex(base, extras, { radius: 1, maxPerLine: 1 });
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

function extractColorsFromDataUrl(dataUrl) {
    return new Promise((resolve) => {
        if (!dataUrl) {
            resolve(["#1e2a4a", "#15303a", "#2d1f45"]);
            return;
        }
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const c = document.createElement("canvas");
            c.width = 64;
            c.height = 64;
            const ctx = c.getContext("2d");
            if (!ctx) {
                resolve(["#1e2a4a", "#15303a", "#2d1f45"]);
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
            resolve([c1, c2, c3]);
        };
        img.onerror = () => resolve(["#1e2a4a", "#15303a", "#2d1f45"]);
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
        this.brightnessLevel = 1;
        this.gestureState = null;
        this.lyricScrollbarTimer = null;
        this.lyricAutoScrollUntil = 0;

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
        this.initPlaylistCoverObserver();
        this.refreshSettingValueBadges();
        this.applyThemeFromCover(this.lastThemeColors);
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
            dynamicBg: document.getElementById("toggle-dynamic-bg"),
            karaoke: document.getElementById("toggle-karaoke"),
            lyricBlur: document.getElementById("toggle-lyric-blur"),
            volumeValue: document.getElementById("volume-value"),
            lyricSize: document.getElementById("lyric-size"),
            lyricSizeValue: document.getElementById("lyric-size-value"),
            lyricWeight: document.getElementById("lyric-weight"),
            lyricWeightValue: document.getElementById("lyric-weight-value"),
            videoStage: document.getElementById("video-stage"),
            playerDock: document.querySelector(".player-dock"),
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
                this.media.currentTime = time;
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
                this.loadVisiblePlaylistCovers();
            }
        });
        if (this.ui.playlistCloseBtn) {
            this.ui.playlistCloseBtn.addEventListener("click", () => this.ui.playlistDrawer.classList.remove("show"));
        }
        if (this.ui.playlistList) {
            this.ui.playlistList.addEventListener("scroll", () => this.loadVisiblePlaylistCovers(), { passive: true });
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
                this.brightnessLevel = clamp(Number(this.ui.brightnessRange.value || 1), 0.4, 1.6);
                this.applyBrightness();
                this.saveSetting("brightness", this.brightnessLevel);
                this.refreshSettingValueBadges();
                if (this.type === "video") {
                    this.showGestureToast(`亮度 ${(this.brightnessLevel * 100).toFixed(0)}%`, "brightness");
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

        if (this.ui.karaoke) {
            this.ui.karaoke.addEventListener("change", () => {
                this.karaokeEnabled = this.ui.karaoke.checked;
                this.saveSetting("karaoke", this.karaokeEnabled);
            });
        }
        if (this.ui.lyricBlur) {
            this.ui.lyricBlur.addEventListener("change", () => {
                this.lyricBlur = this.ui.lyricBlur.checked;
                this.saveSetting("lyricBlur", this.lyricBlur);
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
                this.seekBy(10);
            }
            if (evt.key === " ") {
                evt.preventDefault();
                this.togglePlay();
            }
        });
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
            setNodeValue(this.ui.brightnessValue, `${Math.round(this.brightnessLevel * 100)}%`);
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
            min: 0.4,
            max: 1.6,
            step: 0.01,
            parse: (text, fallback) => {
                const n = parseFloatFromText(text, fallback);
                if (!Number.isFinite(n)) return fallback;
                return String(text).includes("%") ? n / 100 : n;
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
                : "icon-ic_fluent_speaker_2_24_regular";
            this.ui.gestureToastIcon.className = `component-toast__icon fluent-icon ${icon}`;
        }

        toast.classList.add("show");
        if (this.gestureToastHideTimer) clearTimeout(this.gestureToastHideTimer);
        this.gestureToastHideTimer = setTimeout(() => {
            if (this.ui.gestureToast) this.ui.gestureToast.classList.remove("show");
        }, 900);
    }

    setStatus(text, options = {}) {
        if (!this.status) return;
        const mode = options.mode || "toast";
        this.status.textContent = text;
        this.status.classList.toggle("progress", mode === "progress");
        this.status.classList.add("show");
        if (this.statusHideTimer) clearTimeout(this.statusHideTimer);
        if (mode !== "progress") {
            this.statusHideTimer = setTimeout(() => {
                if (this.status) this.status.classList.remove("show");
            }, 5000);
        }
    }

    showVideoResolutionStatus() {
        if (this.type !== "video" || !this.media) return;
        const width = Math.round(Number(this.media.videoWidth || 0));
        const height = Math.round(Number(this.media.videoHeight || 0));
        if (!width || !height) return;

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

        this.loopMode = this.loadSetting("loopMode", "none");
        if (!LOOP_MODES.includes(this.loopMode)) {
            this.loopMode = "none";
        }
        this.syncLoopButtonState();

        this.karaokeEnabled = !!this.loadSetting("karaoke", true);
        if (this.ui.karaoke) this.ui.karaoke.checked = this.karaokeEnabled;
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

        this.brightnessLevel = Number(this.loadSetting("brightness", 1));
        this.brightnessLevel = clamp(this.brightnessLevel, 0.4, 1.6);
        if (this.ui.brightnessRange) {
            this.ui.brightnessRange.value = String(this.brightnessLevel);
        }
        this.applyBrightness();
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
        const videos = [];
        for (const file of files) {
            const lower = file.name.toLowerCase();
            if (lower.endsWith(".xml")) {
                const stem = lower.replace(/\.xml$/, "");
                const norm = normalizeMediaStem(stem);
                xmlMap.set(stem, file);
                xmlMap.set(norm, file);
                xmlCandidates.push({ stem, norm, file });
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
            this.tracks.push({
                type: "video",
                title: name,
                author: `本地导入 · ${danmakuFile ? "含弹幕" : "无弹幕"}`,
                coverUrl: "",
                sourceUrl: url,
                danmakuFile,
            });
            appendedCount += 1;

            this.renderPlaylist(this.ui.playlistSearch.value.trim().toLowerCase());
            if (this.currentIndex < 0) {
                await this.selectTrack(this.tracks.length - 1);
            }

            const percent = Math.round(((i + 1) / videos.length) * 100);
            this.setStatus(`正在解析视频与弹幕... ${percent}%`, { mode: "progress" });
            await Promise.resolve();
        }
        if (this.currentIndex < 0 && this.tracks.length) {
            await this.selectTrack(appendStart);
        }
        this.setStatus(`已新增 ${appendedCount} 个视频（共 ${this.tracks.length} 个）`);
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

            this.renderPlaylist(this.ui.playlistSearch.value.trim().toLowerCase());
            if (this.currentIndex < 0) {
                await this.selectTrack(this.tracks.length - 1);
            }

            const percent = Math.round(((i + 1) / audioFiles.length) * 100);
            this.setStatus(`正在解析音乐标签与歌词... ${percent}%`, { mode: "progress" });
        }
        if (this.currentIndex < 0 && this.tracks.length) {
            await this.selectTrack(appendStart);
        }
        this.setStatus(`已新增 ${appended.length} 首音乐（共 ${this.tracks.length} 首）`);
    }

    renderPlaylist(filter) {
        const target = this.ui.playlistList;
        const fallbackCover = defaultCover(this.type);
        target.innerHTML = "";
        this.ensurePlaybackOrder();
        const order = this.loopMode === "shuffle"
            ? [...this.playOrder]
            : this.tracks.map((_, idx) => idx);
        order.forEach((trackIndex) => {
            const track = this.tracks[trackIndex];
            if (filter && !(`${track.title} ${track.author}`.toLowerCase().includes(filter))) return;
            const item = document.createElement("li");
            item.className = `play-item${trackIndex === this.currentIndex ? " active" : ""}`;
            item.dataset.trackIndex = String(trackIndex);
            const realCover = track.coverUrl || fallbackCover;
            item.innerHTML = `
                <div class="play-cover" draggable="true" title="按住拖动调整播放位置" aria-label="拖动封面排序">
                    <img src="${fallbackCover}" data-src="${realCover}" loading="lazy" alt="cover" draggable="false">
                    <span class="play-cover-overlay" aria-hidden="true">
                        <i class="fluent-icon icon-ic_fluent_apps_list_24_regular"></i>
                    </span>
                </div>
                <div class="play-item-main">
                    <div class="play-name">${track.title}</div>
                    <div class="play-author">${track.author}</div>
                </div>
            `;
            item.addEventListener("click", async () => {
                await this.selectTrack(trackIndex);
                this.ui.playlistDrawer.classList.remove("show");
            });
            const cover = item.querySelector(".play-cover");
            if (cover) {
                const coverImg = cover.querySelector("img");
                if (coverImg) {
                    coverImg.addEventListener("dragstart", (evt) => evt.preventDefault());
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
        this.loadVisiblePlaylistCovers();
    }

    refreshPlaylistSearchClearButton() {
        if (!this.ui.playlistSearchClear || !this.ui.playlistSearch) return;
        const hasText = String(this.ui.playlistSearch.value || "").trim().length > 0;
        this.ui.playlistSearchClear.classList.toggle("hidden", !hasText);
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
    }

    async selectTrack(index) {
        if (index < 0 || index >= this.tracks.length) return;
        this.currentIndex = index;
        this.ensurePlaybackOrder();
        this.danmakuLaneEndTime.scroll.fill(0);
        this.danmakuLaneEndTime.top.fill(0);
        this.danmakuLaneEndTime.bottom.fill(0);
        this.danmakuCursor = 0;
        this.lastDanmakuTime = -1;
        this.lastDanmakuTick = -1;
        const track = this.tracks[index];
        if (this.type === "video" && this.artPlayer) {
            try {
                this.artPlayer.url = track.sourceUrl;
            } catch (error) {
                // fallback below uses native media source assignment
            }
        }
        this.media.src = track.sourceUrl;
        this.media.load();
        if (this.ui.speedRange) {
            this.media.playbackRate = Number(this.ui.speedRange.value || 1);
        }
        this.ui.title.textContent = track.title;
        this.ui.author.textContent = this.formatTrackAuthorText(track);
        this.ui.runningTime.textContent = "00:00";
        this.ui.totalTime.textContent = "00:00";

        if (this.cover) {
            this.cover.src = track.coverUrl || this.cover.dataset.fallback;
            this.updateCoverShape(this.cover, this.cover.src);
        }

        const colors = await extractColorsFromDataUrl(track.coverUrl || this.cover?.src || "");
        if (this.dynamicBg) {
            document.documentElement.style.setProperty("--bg-a", colors[0]);
            document.documentElement.style.setProperty("--bg-b", colors[1]);
            document.documentElement.style.setProperty("--bg-c", colors[2]);
        }
        this.applyThemeFromCover(colors);

        if (this.type === "video") {
            this.danmakuList = [];
            this.lastDanmakuTick = -1;
            if (track.danmakuFile) {
                try {
                    const danmakuBuffer = await fileToArrayBuffer(track.danmakuFile);
                    const xml = decodeDanmakuXmlBuffer(danmakuBuffer);
                    this.danmakuList = parseDanmakuXml(xml);
                    track.author = `本地导入 · 弹幕 ${this.danmakuList.length} 条`;
                    this.ui.author.textContent = this.formatTrackAuthorText(track);
                    this.setStatus(`检测到 ${this.danmakuList.length} 条弹幕`);
                    this.syncDanmakuRenderer();
                } catch (error) {
                    track.author = "本地导入 · 弹幕读取失败";
                    this.ui.author.textContent = this.formatTrackAuthorText(track);
                    this.setStatus("弹幕读取失败");
                    this.syncDanmakuRenderer();
                }
            } else {
                track.author = "本地导入 · 无弹幕";
                this.ui.author.textContent = this.formatTrackAuthorText(track);
                this.syncDanmakuRenderer();
            }
        }

        this.currentLyrics = track.lyrics || [];
        this.lastLyricLookupIndex = 0;
        this.renderLyrics();
        this.renderPlaylist(this.ui.playlistSearch.value.trim().toLowerCase());
        if (this.type === "music") {
            this.applyAutoLyricColor(colors);
            this.applyMusicReadableTheme(colors);
        }
        this.updateMediaSession(track);
        await this.media.play().catch(() => {});
        this.setPlayVisual(!this.media.paused);
        this.ensureEq();

        if (this.type === "video") {
            this.showVideoResolutionStatus();
        }

        if (this.type === "music" && !track.sampleRate && track.sourceFile) {
            this.resolveTrackSampleRate(track);
        }
    }

    formatTrackAuthorText(track) {
        const authorRaw = String(track?.author || "").trim() || "未知作者";
        if (track?.type !== "music") return authorRaw;
        const albumRaw = String(track?.album || "").trim();
        if (!albumRaw) return `作者：${authorRaw}`;
        return `作者：${authorRaw} · 专辑：${albumRaw}`;
    }

    async resolveTrackSampleRate(track) {
        if (!track || track.sampleRate || !track.sourceFile || track._sampling) return;
        track._sampling = true;
        try {
            const ab = await fileToArrayBuffer(track.sourceFile);
            const sr = await this.getSampleRateFromBuffer(ab);
            track.sampleRate = sr || null;
            if (this.currentIndex >= 0 && this.tracks[this.currentIndex] === track) {
                this.setStatus(`音质信息：${track.sampleRate ? `${(track.sampleRate / 1000).toFixed(1)} kHz` : "未知采样率"}`);
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
            text: line.text,
            words: line.words || null,
            translations: [...(line.translations || [])],
        }));
        if (!extraLyrics || !extraLyrics.length) return base;

        let cursor = 0;
        const tolerance = 0.65;
        const allowIndexFallback = canUseIndexFallback(base, extraLyrics);
        const trackShift = estimateTrackTimeShift(base, extraLyrics);

        const findTarget = (time, fallbackIndex) => {
            if (!base.length) return null;
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
            if (!allowIndexFallback) return null;
            const ratio = base.length > 1 && extraLyrics.length > 1
                ? fallbackIndex / Math.max(extraLyrics.length - 1, 1)
                : 0;
            const mapped = Math.round(ratio * Math.max(base.length - 1, 0));
            const idx = Math.min(Math.max(mapped, expected - 1), Math.min(expected + 1, base.length - 1));
            cursor = idx;
            return base[idx];
        };

        extraLyrics.forEach((line, idx) => {
            const candidates = collectLyricCandidates(line);
            if (!candidates.length) return;
            let target = findTarget(line.time, idx);
            if (!target) {
                const shiftedTime = Number(line.time || 0) + trackShift;
                const expected = estimateIndexByTime(base, extraLyrics, shiftedTime);
                const left = Math.max(0, expected - 1);
                const right = Math.min(base.length - 1, expected + 1);
                let pick = -1;
                let pickDiff = Infinity;
                for (let k = left; k <= right; k += 1) {
                    const d = Math.abs(Number(base[k].time || 0) - shiftedTime);
                    if (d < pickDiff) {
                        pick = k;
                        pickDiff = d;
                    }
                }
                if (pick >= 0 && pickDiff <= 1.4) {
                    target = base[pick];
                }
            }
            if (!target) return;
            candidates.forEach((text) => {
                if (text === target.text) return;
                if (!target.translations.includes(text)) {
                    target.translations.push(text);
                }
            });
        });
        backfillMissingTranslationsByIndex(base, extraLyrics, { radius: 1, maxPerLine: 1 });
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
            navigator.mediaSession.setActionHandler("play", () => this.media.play());
            navigator.mediaSession.setActionHandler("pause", () => this.media.pause());
            navigator.mediaSession.setActionHandler("previoustrack", () => this.playPrev());
            navigator.mediaSession.setActionHandler("nexttrack", () => this.playNext());
        } catch (error) {
            // ignore unsupported handlers
        }
    }

    togglePlay() {
        if (!this.media.src) return;
        if (this.media.paused) {
            this.media.play().catch(() => {});
            this.setPlayVisual(true);
            this.ensureEq();
        } else {
            this.media.pause();
            this.setPlayVisual(false);
        }
    }

    seekBy(delta) {
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
        if (this.loopMode === "one") {
            this.media.currentTime = 0;
            this.media.play().catch(() => {});
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
        const cur = this.media.currentTime || 0;
        const total = this.media.duration || 0;
        if (!this.isSeeking) {
            this.ui.seek.value = String(cur);
        }
        this.setProgressVisual(cur, total);
        this.ui.runningTime.textContent = formatTime(cur);
        this.ui.totalTime.textContent = formatTime(total);
    }

    handlePreviewMove(evt) {
        const rect = this.ui.seek.getBoundingClientRect();
        const ratio = clamp((evt.clientX - rect.left) / rect.width, 0, 1);
        const time = (this.media.duration || 0) * ratio;
        this.showProgressPreview(time, ratio);
    }

    showProgressPreview(time, ratio) {
        const seekRect = this.ui.seek.getBoundingClientRect();
        this.ui.preview.classList.add("show");
        this.ui.preview.style.left = `${clamp(ratio, 0, 1) * seekRect.width}px`;
        this.ui.previewTime.textContent = formatTime(time);
        this.ui.previewTotal.textContent = formatTime(this.media.duration || 0);

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
                const colors = await extractColorsFromDataUrl(captured);
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
                this.brightnessLevel = clamp(gs.startBrightness + delta, 0.4, 1.6);
                this.applyBrightness();
                if (this.ui.brightnessRange) this.ui.brightnessRange.value = String(this.brightnessLevel);
                this.refreshSettingValueBadges();
                this.showGestureToast(`亮度 ${(this.brightnessLevel * 100).toFixed(0)}%`, "brightness");
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
                const karaoke = document.createElement("div");
                karaoke.className = "lyric-karaoke";
                const base = document.createElement("span");
                base.className = "karaoke-base";
                base.textContent = line.text || "...";
                const fill = document.createElement("span");
                fill.className = "karaoke-fill";
                fill.textContent = line.text || "...";
                karaoke.style.setProperty("--karaoke-progress", "0%");
                karaoke.append(base, fill);
                div.appendChild(karaoke);
                this.karaokeLineNodes.push(karaoke);
            } else {
                div.textContent = line.text || "...";
                this.karaokeLineNodes.push(null);
            }
            line.translations?.forEach((trans) => {
                const t = document.createElement("div");
                t.className = "lyric-translation";
                t.textContent = trans;
                div.appendChild(t);
            });
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
                const node = this.karaokeLineNodes[i];
                if (!node) continue;
                const progress = this.karaokeEnabled ? (i < active ? 100 : 0) : 0;
                node.style.setProperty("--karaoke-progress", `${progress}%`);
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
        activeKaraoke.style.setProperty("--karaoke-progress", `${(progress * 100).toFixed(2)}%`);
    }

    findActiveLyricIndex(now) {
        const list = this.currentLyrics;
        if (!list.length) return 0;

        // Fast path for adjacent playback movement.
        let idx = clamp(this.lastLyricLookupIndex, 0, list.length - 1);
        if (now >= list[idx].time && now < (list[idx + 1]?.time ?? Infinity)) {
            return idx;
        }
        if (idx + 1 < list.length && now >= list[idx + 1].time && now < (list[idx + 2]?.time ?? Infinity)) {
            this.lastLyricLookupIndex = idx + 1;
            return idx + 1;
        }

        // Binary search fallback.
        let left = 0;
        let right = list.length - 1;
        let best = 0;
        while (left <= right) {
            const mid = (left + right) >> 1;
            if (list[mid].time <= now) {
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
                this.ui.danmakuLayer.style.display = "none";
            }
        } catch (error) {
            this.artPlayer = null;
            this.artDanmukuReady = false;
        }
    }

    getArtDanmakuPlugin() {
        if (!this.artDanmukuReady || !this.artPlayer?.plugins) return null;
        return this.artPlayer.plugins.artplayerPluginDanmuku || null;
    }

    getFilteredDanmakuItems() {
        const list = (this.danmakuList || []).filter((item) => item && item.text);
        return list.filter((item) => {
            const mode = item.mode || "scroll";
            if (mode === "scroll" && this.blockScrollDanmaku) return false;
            if (mode === "top" && this.blockTopDanmaku) return false;
            if (mode === "bottom" && this.blockBottomDanmaku) return false;
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
                const items = this.getFilteredDanmakuItems();
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

    renderDanmaku() {
        if (this.artDanmukuReady) return;
        if (this.type !== "video" || !this.danmakuEnabled || !this.danmakuLayer || !this.danmakuList.length) return;
        const nowTick = Math.floor((this.media.currentTime || 0) * 10);
        if (nowTick === this.lastDanmakuTick) return;
        this.lastDanmakuTick = nowTick;
        const currentTime = this.media.currentTime || 0;
        const windowStart = currentTime - 0.15;
        const windowEnd = currentTime + 0.15;

        if (this.lastDanmakuTime < 0 || currentTime < this.lastDanmakuTime - 0.2) {
            this.danmakuCursor = this.findDanmakuStartIndex(windowStart);
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

            const span = document.createElement("span");
            span.className = `danmaku-item mode-${mode}`;
            span.textContent = item.text;
            span.style.color = item.color || "#ffffff";
            span.style.fontSize = `${this.danmakuSize}px`;
            span.style.fontWeight = String(this.danmakuWeight);
            span.style.opacity = String(this.danmakuOpacity);

            let duration = (12 + Math.random() * 4) / Math.max(0.5, this.danmakuSpeed);
            if (mode === "top") {
                span.style.top = "6%";
                duration = 4 / Math.max(0.5, this.danmakuSpeed);
            } else if (mode === "bottom") {
                span.style.top = "86%";
                duration = 4 / Math.max(0.5, this.danmakuSpeed);
            } else {
                span.style.top = `${Math.random() * 76}%`;
            }

            span.style.animationDuration = `${duration}s`;
            span.style.animationPlayState = this.media.paused ? "paused" : "running";
            this.danmakuLayer.appendChild(span);
            setTimeout(() => span.remove(), Math.ceil(duration * 1000) + 200);
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
            source.connect(low);
            low.connect(mid);
            mid.connect(high);
            high.connect(this.audioCtx.destination);
            this.eqNodes = { low, mid, high };
            this.eqInited = true;
            this.updateEq();
        } catch (error) {
            this.setStatus("均衡器初始化失败，浏览器可能限制自动播放音频上下文");
        }
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
        this.media.style.filter = `brightness(${this.brightnessLevel})`;
    }

    updateCoverShape(target, src) {
        if (!target || !src) return;
        target.classList.remove("cover-rect");
        const probe = new Image();
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
        if (this.fullscreenDockHideTimer) clearTimeout(this.fullscreenDockHideTimer);
        if (this.statusHideTimer) clearTimeout(this.statusHideTimer);
        if (this.gestureToastHideTimer) clearTimeout(this.gestureToastHideTimer);
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

export { formatTime, LOOP_MODES };
