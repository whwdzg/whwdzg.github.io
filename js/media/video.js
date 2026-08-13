/**
 * [站点注释 Site Note]
 * 文件: D:\Documents\GitHub\whwdzg.github.io\js\media\video.js
 * 作用: 前端交互逻辑与功能模块实现。
 * English: Implements client-side interactions and feature logic.
 */
import { MediaPlayerCore, defaultCover, formatTime } from "/js/media/common.js?v=20260728a";
import { parseBilibili } from "/js/vendor/bilibili-parse.js?v=20260728a";

const media = document.getElementById("main-media");
const cover = document.getElementById("cover-image");
const previewImage = document.getElementById("preview-image");
const stage = document.getElementById("video-stage");

const fallback = defaultCover("video");
cover.dataset.fallback = fallback;
cover.src = fallback;
previewImage.src = fallback;

const player = new MediaPlayerCore({
    type: "video",
    media,
    cover,
    previewImage,
    status: document.getElementById("status-tip"),
    danmakuLayer: document.getElementById("danmaku-layer"),
    fullscreenTarget: stage,
});

let externalVideoMetaToken = 0;

function normalizeSourceUrl(src) {
    const raw = String(src || "").trim();
    if (!raw) return "";
    try {
        return new URL(raw, window.location.href).href;
    } catch (error) {
        return raw;
    }
}

function inferTitleFromSource(src, fallbackTitle) {
    const fallbackTitleText = String(fallbackTitle || "组件页视频").trim() || "组件页视频";
    const normalized = normalizeSourceUrl(src);
    if (!normalized) return fallbackTitleText;
    try {
        const pathname = new URL(normalized, window.location.href).pathname || "";
        const segment = pathname.split("/").filter(Boolean).pop() || "";
        const decoded = decodeURIComponent(segment).replace(/\.[^.]+$/, "").trim();
        return decoded || fallbackTitleText;
    } catch (error) {
        return fallbackTitleText;
    }
}

function currentPlaylistFilter() {
    return player.ui?.playlistSearch
        ? player.ui.playlistSearch.value.trim().toLowerCase()
        : "";
}

function buildVideoAuthorText(track) {
    const parts = [];
    const sourceTag = String(track?.sourceTag || "").trim() || "来源：主站跳转";
    parts.push(sourceTag);

    const width = Number(track?.videoWidth || 0);
    const height = Number(track?.videoHeight || 0);
    if (width > 0 && height > 0) {
        parts.push(`${Math.round(width)}x${Math.round(height)}`);
    }

    const duration = Number(track?.duration || 0);
    if (Number.isFinite(duration) && duration > 0) {
        parts.push(`时长 ${formatTime(duration)}`);
    }

    return parts.join(" · ");
}

function updateCurrentVideoDisplay(track, trackIndex) {
    if (!track) return;
    player.renderPlaylist(currentPlaylistFilter());
    if (player.currentIndex !== trackIndex) return;

    if (player.ui?.title) {
        player.ui.title.textContent = track.title || "未命名视频";
    }
    if (player.ui?.author) {
        player.ui.author.textContent = player.formatTrackAuthorText(track);
    }

    const imgSrc = track.coverUrl || fallback;
    cover.src = imgSrc;
    previewImage.src = imgSrc;
    player.updateCoverShape(cover, imgSrc);
    player.updateMediaSession(track);
}

function refreshExternalVideoMetadata(track, trackIndex) {
    if (!track) return;
    const token = ++externalVideoMetaToken;

    const applyMetadata = () => {
        if (token !== externalVideoMetaToken) return;
        if (player.currentIndex !== trackIndex) return;

        const width = Number(player.media?.videoWidth || 0);
        const height = Number(player.media?.videoHeight || 0);
        const duration = Number(player.media?.duration || 0);

        if (width > 0 && height > 0) {
            track.videoWidth = width;
            track.videoHeight = height;
        }
        if (Number.isFinite(duration) && duration > 0) {
            track.duration = duration;
        }

        track.author = buildVideoAuthorText(track);
        updateCurrentVideoDisplay(track, trackIndex);
        player.setStatus(`已重新识别：${track.author}`);
    };

    if ((player.media?.readyState || 0) >= 1) {
        applyMetadata();
        return;
    }

    const onLoadedMetadata = () => {
        player.media.removeEventListener("loadedmetadata", onLoadedMetadata);
        applyMetadata();
    };
    player.media.addEventListener("loadedmetadata", onLoadedMetadata, { once: true });
}

function consumeExternalVideoFromQuery() {
    const params = new URLSearchParams(window.location.search || "");
    const src = normalizeSourceUrl(params.get("src") || "");
    if (!src) return;

    const queryTitle = String(params.get("title") || "").trim();
    const queryCover = String(params.get("cover") || "").trim();
    const resolvedTitle = queryTitle || inferTitleFromSource(src, "组件页视频");

    const existingIndex = player.tracks.findIndex((track) => normalizeSourceUrl(track?.sourceUrl || "") === src);
    if (existingIndex >= 0) {
        const existingTrack = player.tracks[existingIndex];
        existingTrack.sourceUrl = src;
        existingTrack.title = resolvedTitle;
        existingTrack.sourceTag = "来源：主站跳转";
        existingTrack.author = `${existingTrack.sourceTag} · 识别中`;
        if (queryCover) existingTrack.coverUrl = queryCover;
        existingTrack.localImport = false;
        existingTrack.danmakuFile = null;

        player.selectTrack(existingIndex);
        updateCurrentVideoDisplay(existingTrack, existingIndex);
        refreshExternalVideoMetadata(existingTrack, existingIndex);
        return;
    }

    const externalTrack = {
        type: "video",
        title: resolvedTitle,
        author: "来源：主站跳转 · 识别中",
        sourceTag: "来源：主站跳转",
        coverUrl: queryCover || fallback,
        sourceUrl: src,
        danmakuFile: null,
        localImport: false,
    };

    player.tracks.unshift(externalTrack);
    player.renderPlaylist(currentPlaylistFilter());
    player.selectTrack(0);
    updateCurrentVideoDisplay(externalTrack, 0);
    refreshExternalVideoMetadata(externalTrack, 0);
}

consumeExternalVideoFromQuery();

const bilibiliImportButton = document.getElementById("import-bilibili-btn");

if (bilibiliImportButton) {
    bilibiliImportButton.addEventListener("click", async () => {
        const input = await window.componentUi?.prompt?.({
            title: "导入哔哩哔哩视频",
            message: "输入视频链接、AV 号或 BV 号",
            placeholder: "例如 BV1xx411c7mD 或 https://www.bilibili.com/video/BV...",
            confirmText: "导入",
        });
        if (!input) return;

        bilibiliImportButton.disabled = true;
        player.ui.importPanel?.classList.remove("show");
        player.setStatus("正在解析哔哩哔哩视频...", { mode: "progress" });
        try {
            const result = await parseBilibili(input);
            const firstIndex = player.tracks.length;
            player.tracks.push(...result.tracks);
            result.tracks.forEach((track, offset) => {
                const index = firstIndex + offset;
                player.primeTrackCoverAsync?.(track, index);
                player.preloadTrackTheme?.(track);
            });
            player.renderPlaylist(currentPlaylistFilter());
            player.scheduleQueuePersistence?.();
            player.setStatus(`已导入 ${result.tracks.length} 个视频到队列末尾：${result.title}`);
        } catch (error) {
            player.setStatus(`导入失败：${error?.message || "无法解析该视频"}`);
        } finally {
            bilibiliImportButton.disabled = false;
        }
    });
}

window.addEventListener("beforeunload", () => player.dispose());
