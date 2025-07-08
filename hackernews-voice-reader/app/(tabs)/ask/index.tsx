import { SafeAreaView, Text } from 'react-native';
import { ORANGE, WHITE, FONT_FAMILY } from '@constants/theme'
import { useEffect, useState } from 'react'
import { Story } from '@backend/types/hn';
import StoryList from '@components/StoryList/StoryList';
import TopBar from '@components/TopBar/TopBar';
import { fetchStoriesWithCache } from 'utils/storyCache';

export default function AskScreen() {

  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const handleRefresh = async () => {
    setRefreshing(true);
    const stories = await fetchStoriesWithCache("ask", true);
    setStories(stories);
    setRefreshing(false);
  };

  useEffect(() => {
    async function fetchAllStories() {
      const initialStories = await fetchStoriesWithCache("ask", false);
      setStories(initialStories);
      setLoading(false);
    }
    fetchAllStories();
  }, []);


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: WHITE }}>
      <TopBar search={search} setSearch={setSearch} />
      <StoryList stories={stories} refreshing={refreshing} onRefresh={handleRefresh} loading={loading} search={search} storyType='ask'/>
    </SafeAreaView>
  );
} 