/**
 * [站点注释 Site Note]
 * 文件: D:\Documents\GitHub\whwdzg.github.io\js\media\video.js
 * 作用: 前端交互逻辑与功能模块实现。
 * English: Implements client-side interactions and feature logic.
 */
import { MediaPlayerCore, defaultCover } from "/js/media/common.js";

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

window.addEventListener("beforeunload", () => player.dispose());
