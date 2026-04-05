/**
 * [站点注释 Site Note]
 * 文件: D:\Documents\GitHub\whwdzg.github.io\js\media\music.js
 * 作用: 前端交互逻辑与功能模块实现。
 * English: Implements client-side interactions and feature logic.
 */
import { MediaPlayerCore, defaultCover } from "/js/media/common.js";

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
    const src = String(params.get("src") || "").trim();
    if (!src) return;

    const title = String(params.get("title") || "组件页音频").trim();
    const author = String(params.get("author") || "组件页").trim();
    const cover = String(params.get("cover") || "").trim();

    const normalizedSrc = src.startsWith("http") ? src : src;
    const existingIndex = player.tracks.findIndex((track) => String(track?.sourceUrl || "") === normalizedSrc);
    if (existingIndex >= 0) {
        player.selectTrack(existingIndex);
        return;
    }

    player.tracks.unshift({
        type: "music",
        title: title || "组件页音频",
        author: author || "组件页",
        album: "",
        coverUrl: cover || fallback,
        sourceUrl: normalizedSrc,
        lyrics: [],
        quality: "external",
        sampleRate: null,
        sourceFile: null,
    });

    player.renderPlaylist("");
    player.selectTrack(0);
}

consumeExternalTrackFromQuery();

window.addEventListener("beforeunload", () => player.dispose());
