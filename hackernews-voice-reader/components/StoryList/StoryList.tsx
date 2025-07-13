import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Story } from '@backend/types/hn';
import StoryCard from './StoryCard';
import LoadingIndicator from '../Loading';

interface StoryListProps {
  stories: Story[];
  onRefresh?: () => void;
  refreshing?: boolean;
  loading?: boolean;
  search?: string;
  storyType: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const StoryList: React.FC<StoryListProps> = ({ 
  stories, 
  onRefresh, 
  refreshing, 
  loading, 
  search, 
  storyType,
  onLoadMore,
  hasMore = true
}) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const filteredStories = search
    ? stories.filter(story =>
        story.title.toLowerCase().includes(search.toLowerCase()) ||
        story.by.toLowerCase().includes(search.toLowerCase())
      )
    : stories;

  const handleLoadMore = useCallback(async () => {
    if (onLoadMore && hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      await onLoadMore();
      setIsLoadingMore(false);
    }
  }, [onLoadMore, hasMore, isLoadingMore]);

  if (loading) return <LoadingIndicator/>

  if (!filteredStories || filteredStories.length === 0) {
    return <Text style={{ textAlign: 'center', marginTop: 20 }}>No stories found.</Text>;
  }

  const renderFooter = () => {
    if (!hasMore) {
      return (
        <Text style={styles.endText}>No more stories to load</Text>
      );
    }
    if (isLoadingMore) {
      return <LoadingIndicator />;
    }
    return null;
  };

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
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  endText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
    fontSize: 14,
  },
});

export default StoryList; 