import React from 'react';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Text,
  StyleSheet,
} from 'react-native';
import { getStoryById } from '@backend/controller/hnController';
import { Story } from '@backend/types/hn';
import { FONT_FAMILY, ORANGE, WHITE } from '@constants/theme';
import StoryDetail from '@components/StoryList/StoryDetail';
import CommentsList from '@components/StoryList/CommentsList';
import LoadingIndicator from '@components/Loading';
import StoryPage from '@components/StoryList/StoryPage';

export default function StoryDetailScreen() {
  const { id } = useLocalSearchParams();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getStoryById(Number(id)).then(story => {
        setStory(story);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <LoadingIndicator/>;
  if (!story) return <Text style={styles.notFound}>Story not found.</Text>;


  return (
    <>
      <Stack.Screen options={{ title: 'Story', headerTintColor: ORANGE }} />
      <StoryPage story={story} storyType="all" />
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginTop: 40,
  },
  notFound: {
    margin: 20,
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    color: '#555',
  },
});