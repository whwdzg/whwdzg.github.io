/**
 * 每天外部数据同步编排 / Orchestrate daily data sync.
 *
 * 依次同步 Modrinth、MC百科、GitHub、B站，并在成功后写入
 * src/data/sync-status.ts。单个来源失败不会阻止其他来源更新。
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const NODE = process.execPath;
const failures = [];

function run(label, script, args = []) {
  console.log(`\n=== ${label} ===`);
  try {
    execFileSync(NODE, [path.join(ROOT, script), ...args], { cwd: ROOT, stdio: 'inherit' });
    return true;
  } catch (error) {
    failures.push(label);
    console.warn(`[sync] ${label} 失败：${error.message}`);
    return false;
  }
}

function mark(source, count) {
  run(`mark ${source}`, 'scripts/sync-status.mjs', [source, String(count)]);
}

function countVideos() {
  try {
    const text = readFileSync(path.join(ROOT, 'src/data/videos.ts'), 'utf8');
    const json = text.match(/videos: Video\[\] = (\[[\s\S]*?\]);/)?.[1];
    return json ? JSON.parse(json).length : 0;
  } catch {
    return 0;
  }
}

if (run('Modrinth', 'scripts/sync-modrinth.mjs')) mark('modrinth', 6);
if (run('MC百科', 'scripts/sync-mcmod.mjs')) mark('mcmod', 3);
run('MC百科评论', 'scripts/sync-mcmod-comments.mjs');
if (run('GitHub', 'scripts/sync-github.mjs')) mark('github', 9);

// B 站接口偶发风控；失败时保留已有归档，不阻塞其他来源。
run('B站个人主页', 'scripts/sync-bilibili-profile.mjs');
run('B站空间新视频', 'scripts/sync-bilibili-space.mjs');
const coversOk = run('B站封面与元数据', 'scripts/fetch-covers.mjs');
const seasonsOk = run('B站合集', 'scripts/sync-bilibili-seasons.mjs');
if (coversOk || seasonsOk) mark('bilibili', countVideos());

console.log(`\n[sync] 完成${failures.length ? `，失败：${failures.join('、')}` : '，全部成功'}`);
// 允许部分失败：工作流仍然提交成功更新的数据与状态。
