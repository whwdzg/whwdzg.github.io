/**
 * [站点注释 Site Note]
 * 文件: D:\Documents\GitHub\whwdzg.github.io\js\media\music.js
 * 作用: 前端交互逻辑与功能模块实现。
 * English: Implements client-side interactions and feature logic.
 */
import { MediaPlayerCore, defaultCover, parseId3Tag, parseFlacMetadata } from "/js/media/common.js";

const media = document.getElementById("main-media");
const coverLarge = document.getElementById("cover-image");
const coverLeft = document.getElementById("left-cover");
const previewImage = document.getElementById("preview-image");
const qualityTip = document.getElementById("quality-tip");

const fallback = defaultCover("music");
coverLarge.dataset.fallback = fallback;
coverLarge.src = fallback;
coverLeft.src = fallback;
previewImage.src = fallback;

const player = new MediaPlayerCore({
    type: "music",
    media,
    cover: coverLarge,
    previewImage,
    status: document.getElementById("status-tip"),
    lyricsList: document.getElementById("lyrics-list"),
    fullscreenTarget: document.documentElement,
    musicOnly: true,
});

let externalIdentifyToken = 0;

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
    const fallback = String(fallbackTitle || "组件页音频").trim() || "组件页音频";
    const normalized = normalizeSourceUrl(src);
    if (!normalized) return fallback;
    try {
        const pathname = new URL(normalized, window.location.href).pathname || "";
        const segment = pathname.split("/").filter(Boolean).pop() || "";
        const decoded = decodeURIComponent(segment).replace(/\.[^.]+$/, "").trim();
        return decoded || fallback;
    } catch (error) {
        return fallback;
    }
}

function currentPlaylistFilter() {
    return player.ui?.playlistSearch
        ? player.ui.playlistSearch.value.trim().toLowerCase()
        : "";
}

function updateCurrentTrackDisplay(track, trackIndex) {
    if (!track) return;
    player.renderPlaylist(currentPlaylistFilter());
    if (player.currentIndex !== trackIndex) return;

    const imgSrc = track.coverUrl || fallback;
    coverLarge.src = imgSrc;
    coverLeft.src = imgSrc;
    previewImage.src = imgSrc;
    syncCoverShape(imgSrc);

    if (player.ui?.title) {
        player.ui.title.textContent = track.title || "未命名音频";
    }
    if (player.ui?.author) {
        player.ui.author.textContent = player.formatTrackAuthorText(track);
    }

    const sampleRate = track.sampleRate
        ? `${(track.sampleRate / 1000).toFixed(1)} kHz`
        : (track._sampling ? "解析中..." : "未知采样率");
    qualityTip.textContent = `音质信息：${sampleRate}`;
    player.updateMediaSession(track);
}

async function reidentifyExternalMusicTrack(track, trackIndex) {
    if (!track || !track.sourceUrl) return;
    const token = ++externalIdentifyToken;
    track._sampling = true;
    updateCurrentTrackDisplay(track, trackIndex);

    let urlObj;
    try {
        urlObj = new URL(track.sourceUrl, window.location.href);
    } catch (error) {
        track._sampling = false;
        updateCurrentTrackDisplay(track, trackIndex);
        return;
    }

    if (urlObj.origin !== window.location.origin) {
        track._sampling = false;
        updateCurrentTrackDisplay(track, trackIndex);
        player.setStatus("外部来源受跨域限制，保留跳转参数中的详情");
        return;
    }

    try {
        player.setStatus("正在重新识别音频详情...", { mode: "progress" });
        const response = await fetch(urlObj.href, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const buffer = await response.arrayBuffer();
        if (token !== externalIdentifyToken) return;

        const lowerPath = String(urlObj.pathname || "").toLowerCase();
        const id3Meta = parseId3Tag(buffer);
        const flacMeta = lowerPath.endsWith(".flac") ? parseFlacMetadata(buffer) : null;

        const nextTitle = id3Meta.title || flacMeta?.title || track.title || inferTitleFromSource(track.sourceUrl, "组件页音频");
        const nextAuthor = id3Meta.artist || flacMeta?.artist || track.author || "未知作者";
        const nextAlbum = id3Meta.album || flacMeta?.album || track.album || "";
        const nextCover = id3Meta.coverUrl || flacMeta?.coverUrl || track.coverUrl || fallback;

        track.title = String(nextTitle || "未命名音频").trim() || "未命名音频";
        track.author = String(nextAuthor || "未知作者").trim() || "未知作者";
        track.album = String(nextAlbum || "").trim();
        track.coverUrl = String(nextCover || fallback).trim() || fallback;
        if (track.coverUrl.startsWith("blob:")) {
            player.objectUrls.add(track.coverUrl);
        }

        const sampleRate = await player.getSampleRateFromBuffer(buffer);
        if (token !== externalIdentifyToken) return;
        track.sampleRate = sampleRate || null;
        track._sampling = false;

        updateCurrentTrackDisplay(track, trackIndex);
        const sampleRateText = track.sampleRate ? `${(track.sampleRate / 1000).toFixed(1)} kHz` : "未知采样率";
        player.setStatus(`已重新识别：${track.title} · ${sampleRateText}`);
    } catch (error) {
        if (token !== externalIdentifyToken) return;
        track._sampling = false;
        updateCurrentTrackDisplay(track, trackIndex);
        player.setStatus("音频详情识别失败，已保留跳转参数中的信息");
    }
}

function syncCoverShape(src) {
    player.updateCoverShape(coverLarge, src);
    player.updateCoverShape(coverLeft, src);
}

const originalSelectTrack = player.selectTrack.bind(player);
player.selectTrack = async (index) => {
    await originalSelectTrack(index);
    const track = player.tracks[player.currentIndex];
    if (!track) return;
    const imgSrc = track.coverUrl || fallback;
    coverLarge.src = imgSrc;
    coverLeft.src = imgSrc;
    syncCoverShape(imgSrc);
    previewImage.src = imgSrc;
    const sampleRate = track.sampleRate ? `${(track.sampleRate / 1000).toFixed(1)} kHz` : (track._sampling ? "解析中..." : "未知采样率");
    qualityTip.textContent = `音质信息：${sampleRate}`;

    if (track._sampling) {
        const timer = setInterval(() => {
            if (!track._sampling) {
                const resolved = track.sampleRate ? `${(track.sampleRate / 1000).toFixed(1)} kHz` : "未知采样率";
                qualityTip.textContent = `音质信息：${resolved}`;
                clearInterval(timer);
            }
        }, 220);
        setTimeout(() => clearInterval(timer), 5000);
    }
};

syncCoverShape(fallback);

function consumeExternalTrackFromQuery() {
    const params = new URLSearchParams(window.location.search || "");
    const src = normalizeSourceUrl(params.get("src") || "");
    if (!src) return;

    const title = String(params.get("title") || "").trim();
    const author = String(params.get("author") || "").trim();
    const cover = String(params.get("cover") || "").trim();

    const inferredTitle = inferTitleFromSource(src, "组件页音频");
    const existingIndex = player.tracks.findIndex((track) => normalizeSourceUrl(track?.sourceUrl || "") === src);
    if (existingIndex >= 0) {
        const existingTrack = player.tracks[existingIndex];
        existingTrack.sourceUrl = src;
        if (title) existingTrack.title = title;
        if (author) existingTrack.author = author;
        if (cover) existingTrack.coverUrl = cover;
        existingTrack.sampleRate = null;
        existingTrack._sampling = false;
        player.selectTrack(existingIndex);
        reidentifyExternalMusicTrack(existingTrack, existingIndex);
        return;
    }

    const externalTrack = {
        type: "music",
        title: title || inferredTitle,
        author: author || "来源：主站跳转",
        album: "",
        coverUrl: cover || fallback,
        sourceUrl: src,
        lyrics: [],
        quality: "external",
        sampleRate: null,
        sourceFile: null,
        _sampling: false,
    };
    player.tracks.unshift(externalTrack);

    player.renderPlaylist("");
    player.selectTrack(0);
    reidentifyExternalMusicTrack(externalTrack, 0);
}

consumeExternalTrackFromQuery();

window.addEventListener("beforeunload", () => player.dispose());
