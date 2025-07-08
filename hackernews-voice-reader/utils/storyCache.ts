import { getAskStories, getBestStories, getNewStories, getShowStories, getTopStories } from '@backend/controller/hnController';
import { Story } from '@backend/types/hn';

type StoryType = 'top' | 'newest' | 'best' | 'ask' | 'show';

interface CachedStories {
  data: Story[];
  lastFetched: number; // Unix timestamp (ms)
}

export const storyCache: Record<StoryType, CachedStories> = {
  top: { data: [], lastFetched: 0 },
  newest: { data: [], lastFetched: 0 },
  best: { data: [], lastFetched: 0 },
  ask: { data: [], lastFetched: 0},
  show: { data: [], lastFetched: 0},
};

const TEN_MINUTES = 10 * 60 * 1000;

export async function fetchStoriesWithCache(type: StoryType, forceRefresh = false): Promise<Story[]> {
  const now = Date.now();
  const cache = storyCache[type];

  if (!forceRefresh && cache.data.length > 0 && now - cache.lastFetched < TEN_MINUTES) {
    return cache.data;
  }

  let stories: Story[] = [];
  if (type === 'top') stories = await getTopStories();
  else if (type === 'newest') stories = await getNewStories();
  else if (type === 'best') stories = await getBestStories();
  else if (type === 'ask') stories = await getAskStories();
  else if (type === 'show') stories = await getShowStories();

  storyCache[type] = { data: stories, lastFetched: now };
  return stories;
}