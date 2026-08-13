function extractBilibiliId(input) {
    const value = String(input || "").trim();
    const bvMatch = value.match(/\b(BV[0-9A-Za-z]{10})\b/i);
    if (bvMatch) return { bvid: bvMatch[1] };
    const avMatch = value.match(/\bav(\d+)\b/i);
    if (avMatch) return { aid: avMatch[1] };
    throw new Error("请输入有效的哔哩哔哩链接、AV 号或 BV 号");
}

function fetchBilibiliJson(url) {
    return new Promise((resolve, reject) => {
        const callbackName = `bilibiliParse_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const script = document.createElement("script");
        const timeout = window.setTimeout(() => finish(new Error("哔哩哔哩服务响应超时")), 12000);

        const finish = (error, payload) => {
            window.clearTimeout(timeout);
            delete window[callbackName];
            script.remove();
            if (error) {
                reject(error);
                return;
            }
            if (payload?.code !== 0 || !payload?.data) {
                reject(new Error(payload?.message || "未找到该视频"));
                return;
            }
            resolve(payload.data);
        };

        window[callbackName] = (payload) => finish(null, payload);
        script.onerror = () => finish(new Error("哔哩哔哩服务暂时不可用"));
        script.src = `${url}${url.includes("?") ? "&" : "?"}jsonp=jsonp&callback=${callbackName}`;
        document.head.appendChild(script);
    });
}

function normalizeCoverUrl(raw) {
    const value = String(raw || "").trim();
    if (!value) return "";
    const httpsValue = value.replace(/^http:\/\//i, "https://");
    const withoutProtocol = httpsValue.replace(/^https?:\/\//i, "");
    return `https://images.weserv.nl/?url=${encodeURIComponent(withoutProtocol)}`;
}

function normalizeSubtitleUrl(raw) {
    const value = String(raw || "").trim();
    if (!value) return "";
    if (value.startsWith("//")) return `https:${value}`;
    if (/^https?:\/\//i.test(value)) return value.replace(/^http:\/\//i, "https://");
    return "";
}

function qualityLabelFromCode(code) {
    const map = {
        0: "自动",
        16: "360P",
        32: "480P",
        64: "720P",
        80: "1080P",
        112: "1080P 高码率",
        120: "4K",
        125: "HDR",
        127: "8K",
    };
    return map[Number(code)] || `${Number(code) || 0}`;
}

function pickBestStreamUrl(playurlData) {
    if (!playurlData || typeof playurlData !== "object") return "";
    const dashVideos = Array.isArray(playurlData.dash?.video) ? playurlData.dash.video : [];
    if (dashVideos.length) {
        const bestVideo = [...dashVideos].sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0))[0] || null;
        const direct = String(bestVideo?.baseUrl || bestVideo?.base_url || "").trim();
        if (direct) return direct;
    }
    const durl = Array.isArray(playurlData.durl) ? playurlData.durl : [];
    if (durl.length) {
        const direct = String(durl[0]?.url || "").trim();
        if (direct) return direct;
    }
    return "";
}

function buildQualityOptions(playurlData) {
    const supportFormats = Array.isArray(playurlData?.support_formats) ? playurlData.support_formats : [];
    const fromSupport = supportFormats
        .map((item) => {
            const value = String(item?.quality ?? "").trim();
            if (!value) return null;
            const label = String(item?.new_description || item?.display_desc || item?.format || "").trim()
                || qualityLabelFromCode(Number(value));
            return { value, label };
        })
        .filter(Boolean);
    if (fromSupport.length) {
        const unique = new Map();
        fromSupport.forEach((item) => unique.set(item.value, item));
        return Array.from(unique.values()).sort((a, b) => Number(a.value) - Number(b.value));
    }

    const accepted = Array.isArray(playurlData?.accept_quality) ? playurlData.accept_quality : [];
    const fallback = accepted
        .map((q) => ({ value: String(q), label: qualityLabelFromCode(Number(q)) }));
    const unique = new Map();
    fallback.forEach((item) => unique.set(item.value, item));
    return Array.from(unique.values()).sort((a, b) => Number(a.value) - Number(b.value));
}

function buildAudioQualityLabel(playurlData) {
    const dashAudios = Array.isArray(playurlData?.dash?.audio) ? playurlData.dash.audio : [];
    if (!dashAudios.length) return "B站音轨";
    const best = [...dashAudios].sort((a, b) => Number(b?.bandwidth || 0) - Number(a?.bandwidth || 0))[0] || null;
    const bandwidth = Number(best?.bandwidth || 0);
    if (bandwidth > 0) {
        const kbps = Math.round(bandwidth / 1000);
        return `${kbps} kbps`;
    }
    return "B站音轨";
}

export async function parseBilibili(input) {
    const id = extractBilibiliId(input);
    const query = id.bvid ? `bvid=${encodeURIComponent(id.bvid)}` : `aid=${encodeURIComponent(id.aid)}`;
    const video = await fetchBilibiliJson(`https://api.bilibili.com/x/web-interface/view?${query}`);
    const pages = Array.isArray(video.pages) && video.pages.length ? video.pages : [];
    if (!pages.length) throw new Error("该视频没有可播放的分 P");

    const trackResults = await Promise.all(pages.map(async (page, index) => {
        const pageTitle = String(page.part || "").trim();
        const cid = Number(page?.cid || 0) || 0;
        const pageNumber = index + 1;
        const pageTrackTitle = pages.length > 1 ? `${video.title} - P${pageNumber}${pageTitle ? ` ${pageTitle}` : ""}` : video.title;

        const playurlPromise = fetchBilibiliJson(
            `https://api.bilibili.com/x/player/playurl?${query}&cid=${encodeURIComponent(cid)}&qn=127&fnval=4048&fnver=0&fourk=1`
        ).catch(() => null);
        const playerV2Promise = fetchBilibiliJson(
            `https://api.bilibili.com/x/player/v2?${query}&cid=${encodeURIComponent(cid)}`
        ).catch(() => null);
        const [playurlData, playerV2Data] = await Promise.all([playurlPromise, playerV2Promise]);

        const qualityOptions = buildQualityOptions(playurlData);
        const currentQuality = String(playurlData?.quality ?? "0") || "0";
        const streamUrl = pickBestStreamUrl(playurlData);
        const subtitleEntries = Array.isArray(playerV2Data?.subtitle?.subtitles)
            ? playerV2Data.subtitle.subtitles
                .map((item) => {
                    const subUrl = normalizeSubtitleUrl(item?.subtitle_url);
                    if (!subUrl) return null;
                    const lang = String(item?.lan || "").trim();
                    const label = String(item?.lan_doc || lang || "字幕").trim() || "字幕";
                    return { lang, label, url: subUrl };
                })
                .filter(Boolean)
            : [];

        const track = {
            type: "video",
            title: pageTrackTitle,
            author: `哔哩哔哩 · ${video.owner?.name || "未知 UP 主"}`,
            sourceTag: "来源：哔哩哔哩",
            coverUrl: normalizeCoverUrl(video.pic),
            sourceUrl: streamUrl,
            embedUrl: "",
            danmakuFile: null,
            subtitleFiles: [],
            remoteSubtitleUrls: subtitleEntries,
            localImport: false,
            bvid: video.bvid,
            aid: video.aid,
            cid,
            videoQualityLabel: qualityOptions.find((item) => item.value === currentQuality)?.label || qualityLabelFromCode(Number(currentQuality)),
            videoDynamicRange: "SDR",
            audioQuality: buildAudioQualityLabel(playurlData),
            bilibiliUrl: `https://www.bilibili.com/video/${encodeURIComponent(video.bvid)}?p=${pageNumber}`,
            bilibiliDanmakuUrl: cid ? `https://comment.bilibili.com/${cid}.xml` : "",
            bilibiliQualityOptions: qualityOptions,
            bilibiliPlayInfo: {
                quality: currentQuality,
                acceptQuality: Array.isArray(playurlData?.accept_quality) ? playurlData.accept_quality : [],
                acceptDescription: Array.isArray(playurlData?.accept_description) ? playurlData.accept_description : [],
            },
        };
        return track;
    }));

    const tracks = trackResults;

    return { title: video.title, tracks };
}