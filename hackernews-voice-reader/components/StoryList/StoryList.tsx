import React, { useRef } from 'react';
import { FlatList, View, StyleSheet, Text } from 'react-native';
import { WHITE, FONT_FAMILY } from '../../constants/theme';
import { Story } from '@backend/types/hn';
import StoryCard from './StoryCard';
import LoadingIndicator from '@components/Loading';
import { FlashList } from '@shopify/flash-list';

type SortType = 'top' | 'newest' | 'best';

interface StoryListProps {
  sort?: SortType;
  stories: Story[];
  onRefresh: () => void;
  refreshing: boolean;
  loading: boolean;
  search: string;
  storyType: string;
}

const StoryList: React.FC<StoryListProps> = ({ stories, onRefresh, refreshing, loading, search, storyType}) => {
  const filteredStories = search
    ? stories.filter(story =>
        story.title.toLowerCase().includes(search.toLowerCase()) ||
        story.by.toLowerCase().includes(search.toLowerCase())
      )
    : stories;


  if (loading) return <LoadingIndicator/>

  if (!filteredStories || filteredStories.length === 0) {
    return <Text style={{ textAlign: 'center', marginTop: 20 }}>No stories found.</Text>;
  }

  return (
    <View style={styles.container}>
      <FlashList
        estimatedItemSize={500}
        data={filteredStories}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <StoryCard story={item} storyType={storyType}/>}
        showsVerticalScrollIndicator={false}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
    paddingTop: 8,
  },
});

export default StoryList; 