import React from 'react';
import {Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, useWindowDimensions } from 'react-native';
import { getStoryById } from '@backend/controller/hnController';
import { Story } from '@backend/types/hn';
import { ORANGE } from '@constants/theme';
import LoadingIndicator from '@components/Loading';
import StoryPage from '@components/StoryList/StoryPage';

export default function StoryDetailScreen() {
  const { id } = useLocalSearchParams();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const {width} = useWindowDimensions()

  useEffect(() => {
    if (id) {
      getStoryById(Number(id)).then(story => {
        setStory(story);
        setLoading(false);
      });
    }
  }, [id]);



  if (loading) return <LoadingIndicator/>;
  if (!story) return <Text style={{ margin: 20 }}>Story not found.</Text>;

  return (
    <>
    <Stack.Screen options={{ title: "Story", headerTintColor: ORANGE}} />
    <StoryPage story={story} storyType="ask" />
    </>
  );
}
