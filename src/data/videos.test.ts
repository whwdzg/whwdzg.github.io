import { describe, expect, it } from 'vitest';
import { videos, videoStats, videosById } from './videos';

describe('bilibili dataset', () => {
  it('syncs the current Bilibili archive', () => {
    expect(videos).toHaveLength(249);
    expect(videoStats.total).toBe(249);
    expect(videosById.size).toBe(249);
  });

  it('uses local webp covers for every record', () => {
    for (const video of videos) {
      expect(video.cover).toMatch(/^\/media\/bilibili\/v\d+\.webp$/);
      expect(video.title.length).toBeGreaterThan(0);
    }
  });

  it('keeps dates valid or explicitly unknown', () => {
    for (const video of videos) {
      if (video.date !== null) expect(video.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('marks offline and missing-link records as disabled', () => {
    for (const video of videos) {
      if (video.status === 'offline' || !video.url) expect(video.disabled).toBe(true);
    }
  });
});
