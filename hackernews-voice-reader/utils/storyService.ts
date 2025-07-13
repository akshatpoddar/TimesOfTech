import { Story } from '@backend/types/hn';
import { getAskStories, getBestStories, getNewStories, getShowStories, getTopStories } from '@backend/controller/hnController';
import { 
  getStoriesByType, 
  storeStoriesForType, 
  hasValidCache,
} from './storyCache';

type StoryType = 'top' | 'newest' | 'best' | 'ask' | 'show';

const PLACEHOLDER = 'https://via.placeholder.com/80x80.png?text=News';
const INITIAL_LOAD_LIMIT = 25; // Load only 25 stories initially

export class StoryService {
  async getStories(type: StoryType, forceRefresh = false, limit?: number): Promise<Story[]> {
    try {
      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const hasCache = await hasValidCache(type);
        if (hasCache) {
          const cachedStories = await getStoriesByType(type);
          if (cachedStories.length > 0) {
            console.log(`Using cached ${type} stories (${cachedStories.length} stories)`);
            // Return limited stories from cache if limit is specified
            return limit ? cachedStories.slice(0, limit) : cachedStories;
          }
        }
      }
      
      // Fetch fresh data from API with limit
      const fetchLimit = limit || INITIAL_LOAD_LIMIT;
      console.log(`Fetching fresh ${type} stories from API (limit: ${fetchLimit})`);
      let stories: Story[] = [];
      
      if (type === 'top') stories = await getTopStories(fetchLimit);
      else if (type === 'newest') stories = await getNewStories(fetchLimit);
      else if (type === 'best') stories = await getBestStories(fetchLimit);
      else if (type === 'ask') stories = await getAskStories(fetchLimit);
      else if (type === 'show') stories = await getShowStories(fetchLimit);
      
      // Fetch images for all stories in parallel (but limit concurrent requests)
      if (stories.length > 0) {
        console.log(`Fetching images for ${stories.length} ${type} stories`);
        await this.fetchImagesForStoriesOptimized(stories);
        
        // Store complete stories with imageUrl in cache
        await storeStoriesForType(stories, type);
        console.log(`Stored ${stories.length} ${type} stories in cache`);
      }
      
      return stories;
    } catch (error) {
      console.error(`Error fetching ${type} stories:`, error);
      return [];
    }
  }

  private async fetchImagesForStoriesOptimized(stories: Story[]): Promise<void> {
    // Process images in smaller batches to avoid overwhelming the microlink API
    const BATCH_SIZE = 5;
    
    for (let i = 0; i < stories.length; i += BATCH_SIZE) {
      const batch = stories.slice(i, i + BATCH_SIZE);
      const imagePromises = batch.map(async (story) => {
        if (story.url && !story.imageUrl) {
          try {
            const imageUrl = await this.fetchImageFromMicrolink(story.url);
            story.imageUrl = imageUrl;
          } catch (error) {
            console.warn(`Failed to fetch image for story ${story.id}:`, error);
            story.imageUrl = PLACEHOLDER;
          }
        } else if (!story.url) {
          story.imageUrl = PLACEHOLDER;
        }
      });

      // Wait for current batch to complete before starting next batch
      await Promise.all(imagePromises);
    }
  }

  private async fetchImageFromMicrolink(url: string): Promise<string> {
    try {
      console.log('Fetching preview for URL:', url);
      const res = await fetch(
        `https://api.microlink.io?url=${encodeURIComponent(url)}`
      );
      const json = await res.json();
      
      const imageUrl = json.data?.image?.url;
      if (imageUrl) {
        // console.log('Found image URL:', imageUrl);
        return imageUrl;
      } else {
        // console.log('No image found for URL:', url);
        return PLACEHOLDER;
      }
    } catch (error) {
      console.warn('Failed to fetch image from microlink:', error);
      return PLACEHOLDER;
    }
  }

  // Method to load more stories (for pagination)
  async loadMoreStories(type: StoryType, currentCount: number, additionalCount: number = 10): Promise<Story[]> {
    const newLimit = currentCount + additionalCount;
    return this.getStories(type, false, newLimit);
  }
}

// Singleton instance
export const storyService = new StoryService(); 