import Redis from 'ioredis';
import { Story } from '@backend/types/hn';

type StoryType = 'top' | 'newest' | 'best' | 'ask' | 'show';

// Redis configuration
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
});

// Cache keys
const CACHE_KEYS = {
  STORY: (id: number) => `story:${id}`,
  STORY_TYPE: (type: StoryType) => `stories:${type}`,
  STORY_TYPE_TIMESTAMP: (type: StoryType) => `stories:${type}:timestamp`,
  STORY_TYPE_SET: (type: StoryType) => `story_type:${type}`,
};

// Cache expiration times (in seconds)
const CACHE_EXPIRY = {
  STORIES: 10 * 60, // 10 minutes
  STORY_DATA: 60 * 60, // 1 hour
};

// Store a story in Redis
export async function storeStory(story: Story, storyType: StoryType): Promise<void> {
  const pipeline = redis.pipeline();
  
  // Store story data as hash (including imageUrl as part of story data)
  pipeline.hset(CACHE_KEYS.STORY(story.id), {
    id: story.id,
    title: story.title,
    url: story.url || '',
    text: story.text || '',
    score: story.score,
    time: story.time,
    by: story.by,
    descendants: story.descendants || 0,
    imageUrl: story.imageUrl || '', // Image URL is part of story data
  });
  
  // Add to story type set
  pipeline.sadd(CACHE_KEYS.STORY_TYPE_SET(storyType), story.id);
  
  // Set expiration for story data
  pipeline.expire(CACHE_KEYS.STORY(story.id), CACHE_EXPIRY.STORY_DATA);
  
  await pipeline.exec();
}

// Store multiple stories for a type
export async function storeStoriesForType(stories: Story[], storyType: StoryType): Promise<void> {
  const pipeline = redis.pipeline();
  
  // Store each story
  for (const story of stories) {
    pipeline.hset(CACHE_KEYS.STORY(story.id), {
      id: story.id,
      title: story.title,
      url: story.url || '',
      text: story.text || '',
      score: story.score,
      time: story.time,
      by: story.by,
      descendants: story.descendants || 0,
      imageUrl: story.imageUrl || '', // Image URL is part of story data
    });
    
    // Add to story type set
    pipeline.sadd(CACHE_KEYS.STORY_TYPE_SET(storyType), story.id);
    
    // Set expiration
    pipeline.expire(CACHE_KEYS.STORY(story.id), CACHE_EXPIRY.STORY_DATA);
  }
  
  // Store story type data with timestamp
  pipeline.setex(CACHE_KEYS.STORY_TYPE(storyType), CACHE_EXPIRY.STORIES, JSON.stringify(stories));
  pipeline.setex(CACHE_KEYS.STORY_TYPE_TIMESTAMP(storyType), CACHE_EXPIRY.STORIES, Date.now().toString());
  
  await pipeline.exec();
}

// Get a story by ID
export async function getStoryById(storyId: number): Promise<Story | null> {
  try {
    const storyData = await redis.hgetall(CACHE_KEYS.STORY(storyId));
    
    if (!storyData || Object.keys(storyData).length === 0) {
      return null;
    }
     
    return {
      id: parseInt(storyData.id),
      title: storyData.title,
      url: storyData.url || undefined,
      text: storyData.text || undefined,
      score: parseInt(storyData.score),
      time: parseInt(storyData.time),
      by: storyData.by,
      descendants: parseInt(storyData.descendants) || undefined,
      imageUrl: storyData.imageUrl || undefined, // Image URL is part of story data
      type: 'story',
    } as Story;
  } catch (error) {
    console.error('Error getting story by ID:', error);
    return null;
  }
}

// Get all stories for a type
export async function getStoriesByType(storyType: StoryType): Promise<Story[]> {
  try {
    // Check if we have cached data
    const cachedData = await redis.get(CACHE_KEYS.STORY_TYPE(storyType));
    
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    
    // Return empty array if no cached data
    return [];
  } catch (error) {
    console.error('Error getting stories by type:', error);
    return [];
  }
}

// Check if cache is expired for a story type
export async function isCacheExpired(storyType: StoryType): Promise<boolean> {
  try {
    const timestamp = await redis.get(CACHE_KEYS.STORY_TYPE_TIMESTAMP(storyType));
    
    if (!timestamp) {
      return true; // No cache exists
    }
    
    const cacheTime = parseInt(timestamp);
    const now = Date.now();
    const expiryTime = CACHE_EXPIRY.STORIES * 1000; // Convert to milliseconds
    
    return (now - cacheTime) > expiryTime;
  } catch (error) {
    console.error('Error checking cache expiration:', error);
    return true; // Assume expired on error
  }
}

// Check if cache exists and is valid 
export async function hasValidCache(storyType: StoryType): Promise<boolean> {
  try {
    const isExpired = await isCacheExpired(storyType);
    if (isExpired) {
      return false;
    }
    
    const cachedData = await redis.get(CACHE_KEYS.STORY_TYPE(storyType));
    return cachedData !== null;
  } catch (error) {
    console.error('Error checking cache validity:', error);
    return false;
  }
}

// Update story image URL (updates the story data directly)
export async function updateStoryImage(storyId: number, imageUrl: string): Promise<void> {
  try {
    // Update the story's imageUrl field directly
    await redis.hset(CACHE_KEYS.STORY(storyId), 'imageUrl', imageUrl);
    
    // Also update in story type cache if it exists
    const storyTypes = ['top', 'newest', 'best', 'ask', 'show'] as StoryType[];
    
    for (const type of storyTypes) {
      const cachedData = await redis.get(CACHE_KEYS.STORY_TYPE(type));
      if (cachedData) {
        const stories = JSON.parse(cachedData);
        const storyIndex = stories.findIndex((s: Story) => s.id === storyId);
        
        if (storyIndex !== -1) {
          stories[storyIndex] = { ...stories[storyIndex], imageUrl };
          await redis.setex(CACHE_KEYS.STORY_TYPE(type), CACHE_EXPIRY.STORIES, JSON.stringify(stories));
        }
      }
    }
    
    console.log(`Updated image URL for story ${storyId}`);
  } catch (error) {
    console.error('Error updating story image:', error);
  }
}

// Clear cache for a specific story type
export async function clearStoryTypeCache(storyType: StoryType): Promise<void> {
  try {
    const pipeline = redis.pipeline();
    
    // Get all story IDs for this type
    const storyIds = await redis.smembers(CACHE_KEYS.STORY_TYPE_SET(storyType));
    
    // Remove story data
    for (const storyId of storyIds) {
      pipeline.del(CACHE_KEYS.STORY(parseInt(storyId)));
    }
    
    // Clear type-specific data
    pipeline.del(CACHE_KEYS.STORY_TYPE(storyType));
    pipeline.del(CACHE_KEYS.STORY_TYPE_TIMESTAMP(storyType));
    pipeline.del(CACHE_KEYS.STORY_TYPE_SET(storyType));
    
    await pipeline.exec();
    console.log(`Cleared cache for ${storyType} stories`);
  } catch (error) {
    console.error('Error clearing story type cache:', error);
  }
}

// Clear all cache
export async function clearAllCache(): Promise<void> {
  try {
    const keys = await redis.keys('story:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    console.log('Cleared all story cache');
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
}

// Get cache statistics
export async function getCacheStats(): Promise<any> {
  try {
    const stats = {
      totalStories: 0,
      storyTypes: {} as Record<StoryType, number>,
      memoryUsage: await redis.memory('STATS'),
    };
    
    const types: StoryType[] = ['top', 'newest', 'best', 'ask', 'show'];
    
    for (const type of types) {
      const count = await redis.scard(CACHE_KEYS.STORY_TYPE_SET(type));
      stats.storyTypes[type] = count;
      stats.totalStories += count;
    }
    
    return stats;
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return null;
  }
}



export default redis; 