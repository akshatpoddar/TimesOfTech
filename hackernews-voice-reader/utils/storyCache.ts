import AsyncStorage from '@react-native-async-storage/async-storage';
import { Story } from '@backend/types/hn';

type StoryType = 'top' | 'newest' | 'best' | 'ask' | 'show';

// Cache keys
const CACHE_KEYS = {
  STORY: (id: number) => `story:${id}`,
  STORY_TYPE: (type: StoryType) => `stories:${type}`,
  STORY_TYPE_TIMESTAMP: (type: StoryType) => `stories:${type}:timestamp`,
};

// Cache expiration times (in milliseconds)
const CACHE_EXPIRY = {
  STORIES: 10 * 60 * 1000, // 10 minutes
  STORY_DATA: 60 * 60 * 1000, // 1 hour
};

// Store a story in AsyncStorage (no redundancy)
export async function storeStory(story: Story, storyType: StoryType): Promise<void> {
  try {
    const storyData = {
      id: story.id,
      title: story.title,
      url: story.url || '',
      text: story.text || '',
      score: story.score,
      time: story.time,
      by: story.by,
      descendants: story.descendants || 0,
      imageUrl: story.imageUrl || '',
    };
    
    // Store individual story (like Redis hash)
    await AsyncStorage.setItem(CACHE_KEYS.STORY(story.id), JSON.stringify(storyData));
  } catch (error) {
    console.error('Error storing story:', error);
  }
}

// Store multiple stories for a type (efficient like Redis)
export async function storeStoriesForType(stories: Story[], storyType: StoryType): Promise<void> {
  try {
    // Store each story individually (like Redis hashes)
    for (const story of stories) {
      await storeStory(story, storyType);
    }
    
    // Store story type as array of IDs (like Redis set)
    const storyIds = stories.map(story => story.id);
    await AsyncStorage.setItem(CACHE_KEYS.STORY_TYPE(storyType), JSON.stringify(storyIds));
    await AsyncStorage.setItem(CACHE_KEYS.STORY_TYPE_TIMESTAMP(storyType), Date.now().toString());
  } catch (error) {
    console.error('Error storing stories for type:', error);
  }
}

// Get a story by ID (like Redis HGETALL)
export async function getStoryById(storyId: number): Promise<Story | null> {
  try {
    const storyData = await AsyncStorage.getItem(CACHE_KEYS.STORY(storyId));
    
    if (!storyData) {
      return null;
    }
     
    const story = JSON.parse(storyData);
    return {
      ...story,
      type: 'story',
    } as Story;
  } catch (error) {
    console.error('Error getting story by ID:', error);
    return null;
  }
}

// Get all stories for a type (like Redis SMEMBERS + HGETALL)
export async function getStoriesByType(storyType: StoryType): Promise<Story[]> {
  try {
    // Get story IDs for this type
    const storyIdsData = await AsyncStorage.getItem(CACHE_KEYS.STORY_TYPE(storyType));
    
    if (!storyIdsData) {
      return [];
    }
    
    const storyIds = JSON.parse(storyIdsData);
    
    // Fetch all stories by ID (like Redis pipeline)
    const storyPromises = storyIds.map((id: number) => getStoryById(id));
    const stories = await Promise.all(storyPromises);
    
    // Filter out nulls (stories that might have been deleted)
    return stories.filter((story): story is Story => story !== null);
  } catch (error) {
    console.error('Error getting stories by type:', error);
    return [];
  }
}

// Check if cache is expired for a story type
export async function isCacheExpired(storyType: StoryType): Promise<boolean> {
  try {
    const timestamp = await AsyncStorage.getItem(CACHE_KEYS.STORY_TYPE_TIMESTAMP(storyType));
    
    if (!timestamp) {
      return true; // No cache exists
    }
    
    const cacheTime = parseInt(timestamp);
    const now = Date.now();
    
    return (now - cacheTime) > CACHE_EXPIRY.STORIES;
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
    
    const cachedData = await AsyncStorage.getItem(CACHE_KEYS.STORY_TYPE(storyType));
    return cachedData !== null;
  } catch (error) {
    console.error('Error checking cache validity:', error);
    return false;
  }
}

// Update story image URL (like Redis HSET)
export async function updateStoryImage(storyId: number, imageUrl: string): Promise<void> {
  try {
    const storyData = await AsyncStorage.getItem(CACHE_KEYS.STORY(storyId));
    if (storyData) {
      const story = JSON.parse(storyData);
      story.imageUrl = imageUrl;
      await AsyncStorage.setItem(CACHE_KEYS.STORY(storyId), JSON.stringify(story));
    }
    
    // Also update in story type cache if it exists
    const storyTypes = ['top', 'newest', 'best', 'ask', 'show'] as StoryType[];
    
    for (const type of storyTypes) {
      const cachedData = await AsyncStorage.getItem(CACHE_KEYS.STORY_TYPE(type));
      if (cachedData) {
        const storyIds = JSON.parse(cachedData);
        if (storyIds.includes(storyId)) {
          // Story exists in this type, update it
          const story = await getStoryById(storyId);
          if (story) {
            story.imageUrl = imageUrl;
            await storeStory(story, type);
          }
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
    const cachedData = await AsyncStorage.getItem(CACHE_KEYS.STORY_TYPE(storyType));
    if (cachedData) {
      const storyIds = JSON.parse(cachedData);
      // Remove individual story data
      for (const storyId of storyIds) {
        await AsyncStorage.removeItem(CACHE_KEYS.STORY(storyId));
      }
    }
    
    // Clear type-specific data
    await AsyncStorage.removeItem(CACHE_KEYS.STORY_TYPE(storyType));
    await AsyncStorage.removeItem(CACHE_KEYS.STORY_TYPE_TIMESTAMP(storyType));
    
    console.log(`Cleared cache for ${storyType} stories`);
  } catch (error) {
    console.error('Error clearing story type cache:', error);
  }
}

// Clear all cache
export async function clearAllCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const storyKeys = keys.filter((key: string) => key.startsWith('story:'));
    if (storyKeys.length > 0) {
      await AsyncStorage.multiRemove(storyKeys);
    }
    console.log('Cleared all story cache');
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
}

// Get cache statistics
export async function getCacheStats(): Promise<any> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const storyKeys = keys.filter((key: string) => key.startsWith('story:'));
    const typeKeys = keys.filter((key: string) => key.startsWith('stories:'));
    
    const stats = {
      totalStories: storyKeys.length,
      storyTypes: typeKeys.length,
      memoryUsage: 'AsyncStorage does not provide memory usage',
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return null;
  }
} 