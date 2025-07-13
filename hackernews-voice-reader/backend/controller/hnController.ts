import axiosInstance from '../../utils/axiosInstance';
import { Story, Comment, Item } from '../types/hn';
import he from 'he';

const INITIAL_STORY_LIMIT = 25; // Load only first 25 stories initially
const BATCH_SIZE = 10; // Process stories in batches of 10

// Helper function to fetch stories in batches
async function fetchStoriesInBatches(ids: number[], limit: number = INITIAL_STORY_LIMIT): Promise<Story[]> {
  const limitedIds = ids.slice(0, limit);
  const stories: Story[] = [];
  
  // Process in batches to avoid overwhelming the API
  for (let i = 0; i < limitedIds.length; i += BATCH_SIZE) {
    const batch = limitedIds.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map(id => getStoryById(id));
    
    try {
      const batchResults = await Promise.allSettled(batchPromises);
      const validStories = batchResults
        .filter((result): result is PromiseFulfilledResult<Story> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);
      
      stories.push(...validStories);
    } catch (error) {
      console.error(`Error fetching batch ${i / BATCH_SIZE + 1}:`, error);
    }
  }
  
  return stories;
}

// Fetch top stories (limited initial load)
export async function getTopStories(limit?: number): Promise<Story[]> {
  try {
    const { data: ids } = await axiosInstance.get<number[]>('topstories.json');
    const stories = await fetchStoriesInBatches(ids, limit);
    console.log(`Fetched ${stories.length} top stories successfully!`);
    return stories;
  } catch (e) {
    console.error('Error fetching top stories:', e);
    return [];
  }
}

// Fetch new stories (limited initial load)
export async function getNewStories(limit?: number): Promise<Story[]> {
  try {
    const { data: ids } = await axiosInstance.get<number[]>('newstories.json');
    const stories = await fetchStoriesInBatches(ids, limit);
    console.log(`Fetched ${stories.length} new stories successfully!`);
    return stories;
  } catch (e) {
    console.error('Error fetching new stories:', e);
    return [];
  }
}

// Fetch best stories (limited initial load)
export async function getBestStories(limit?: number): Promise<Story[]> {
  try {
    const { data: ids } = await axiosInstance.get<number[]>('beststories.json');
    const stories = await fetchStoriesInBatches(ids, limit);
    console.log(`Fetched ${stories.length} best stories successfully!`);
    return stories;
  } catch (e) {
    console.error('Error fetching best stories:', e);
    return [];
  }
}

// Fetch ask stories (limited initial load)
export async function getAskStories(limit?: number): Promise<Story[]> {
  try {
    const { data: ids } = await axiosInstance.get<number[]>('askstories.json');
    const stories = await fetchStoriesInBatches(ids, limit);
    console.log(`Fetched ${stories.length} ask stories successfully!`);
    return stories;
  } catch (e) {
    console.error('Error fetching ask stories:', e);
    return [];
  }
}

// Fetch show stories (limited initial load)
export async function getShowStories(limit?: number): Promise<Story[]> {
  try {
    const { data: ids } = await axiosInstance.get<number[]>('showstories.json');
    const stories = await fetchStoriesInBatches(ids, limit);
    console.log(`Fetched ${stories.length} show stories successfully!`);
    return stories;
  } catch (e) {
    console.error('Error fetching show stories:', e);
    return [];
  }
}

// Fetch a single story by ID (only if type is 'story')
export async function getStoryById(id: number): Promise<Story | null> {
  try {
    const { data } = await axiosInstance.get<Item>(`item/${id}.json`);
    if (!data || data.type !== 'story') return null;
    const story: Story = {
      id: data.id,
      type: 'story',
      title: he.decode(data.title || ''),
      by: he.decode(data.by || ''),
      score: data.score || 0,
      time: data.time,
      descendants: data.descendants,
      url: data.url ? he.decode(data.url) : undefined,
      text: data.text ? he.decode(data.text) : '',
      kids: data.kids,
    };
    return story;
  } catch (e) {
    console.error(`Error fetching story ${id}:`, e);
    return null;
  }
}

// Fetch a single comment by ID
export async function getCommentById(id: number): Promise<Comment | null> {
  try {
    const { data } = await axiosInstance.get<Item>(`item/${id}.json`);
    if (!data || data.type !== 'comment') return null;
    const comment: Comment = {
      type: 'comment',
      id: data.id,
      parent: data.parent || 0,
      by: he.decode(data.by || ''),
      time: data.time,
      text: data.text ? he.decode(data.text) : '',
      kids: data.kids,
    };
    return comment;
  } catch (e) {
    console.error(`Error fetching comment ${id}:`, e);
    return null;
  }
} 