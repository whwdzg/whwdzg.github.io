import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BILIBILI_COLLECTIONS, collectionForBvid } from './bilibili-collections';

describe('bilibili collection snapshot', () => {
  it('contains both synced UGC seasons', () => {
    expect(BILIBILI_COLLECTIONS).toHaveLength(2);
    expect(BILIBILI_COLLECTIONS.map((collection) => collection.title)).toEqual([
      'Minecraft 官方短视频',
      'Hypixel 官方短视频',
    ]);
    expect(BILIBILI_COLLECTIONS.map((collection) => collection.count)).toEqual([161, 46]);
  });

  it('has all episodes with covers, titles and dates', () => {
    const episodes = BILIBILI_COLLECTIONS.flatMap((collection) =>
      collection.sections.flatMap((section) => section.episodes),
    );
    expect(episodes).toHaveLength(207);
    for (const episode of episodes) {
      expect(episode.title.length).toBeGreaterThan(0);
      expect(episode.bvid).toMatch(/^BV[0-9A-Za-z]+$/);
      expect(episode.url).toContain(episode.bvid);
      expect(episode.cover).toMatch(/^\/media\/bilibili\/collections\/\d+\/.+\.webp$/);
      if (episode.date) expect(episode.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (episode.cover) expect(existsSync(`public${episode.cover}`)).toBe(true);
    }
  });

  it('maps the archive collection card to its season', () => {
    expect(collectionForBvid('BV1tWvKe5E8p')?.seasonId).toBe(3513313);
    expect(collectionForBvid('BV1SD4ZeMEjM')?.seasonId).toBe(3832038);
    expect(collectionForBvid('BV000')).toBeUndefined();
  });
});
