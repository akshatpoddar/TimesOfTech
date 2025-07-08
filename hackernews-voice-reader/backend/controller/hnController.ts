import axiosInstance from '../../utils/axiosInstance';
import { Story, Comment, Item } from '../types/hn';

// Fetch top stories (500 max)
export async function getTopStories(): Promise<Story[]> {
  try {
    const { data: ids } = await axiosInstance.get<number[]>('topstories.json');
    const storyPromises = ids.map(id => getStoryById(id));
    const stories = await Promise.all(storyPromises);
    // Filter out nulls (non-story items)
    console.log("Fetched all top stories successfully!")
    return stories.filter((story): story is Story => story !== null);
  } catch (e) {
    return [];
  }
}

// Fetch new stories (500 max)
export async function getNewStories(): Promise<Story[]> {
  try {
    const { data: ids } = await axiosInstance.get<number[]>('newstories.json');
    const storyPromises = ids.map(id => getStoryById(id));
    const stories = await Promise.all(storyPromises);
    console.log("Fetched all new stories successfully!")
    return stories.filter((story): story is Story => story !== null);
  } catch (e) {
    return [];
  }
}

// Fetch best stories (500 max)
export async function getBestStories(): Promise<Story[]> {
    try {
      const { data: ids } = await axiosInstance.get<number[]>('beststories.json');
      const storyPromises = ids.map(id => getStoryById(id));
      const stories = await Promise.all(storyPromises);
      console.log("Fetched all best stories successfully!")
      return stories.filter((story): story is Story => story !== null);
    } catch (e) {
      return [];
    }
  }

// Fetch ask stories
export async function getAskStories(): Promise<Story[]> {
  try {
    const { data: ids } = await axiosInstance.get<number[]>('askstories.json');
    const storyPromises = ids.map(id => getStoryById(id));
    const stories = await Promise.all(storyPromises);
    console.log("Fetched all ask stories successfully!")
    return stories.filter((story): story is Story => story !== null);
  } catch (e) {
    return [];
  }
}

// Fetch show stories
export async function getShowStories(): Promise<Story[]> {
    try {
        const { data: ids } = await axiosInstance.get<number[]>('showstories.json');
        const storyPromises = ids.map(id => getStoryById(id));
        const stories = await Promise.all(storyPromises);
        console.log("Fetched all show stories successfully!")
        return stories.filter((story): story is Story => story !== null);
      } catch (e) {
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
      title: data.title || '',
      by: data.by || '',
      score: data.score || 0,
      time: data.time,
      descendants: data.descendants,
      url: data.url,
      text: data.text,
      kids: data.kids,
    };
    return story;
  } catch (e) {
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
      by: data.by || '',
      time: data.time,
      text: data.text,
      kids: data.kids,
    };
    return comment;
  } catch (e) {
    return null;
  }
} 