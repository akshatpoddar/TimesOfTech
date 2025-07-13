import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
} from 'react-native';
import TopBar from '@components/TopBar/TopBar';
import StoryList from '@components/StoryList/StoryList';
import { WHITE, ORANGE, FONT_FAMILY } from '@constants/theme';
import { Story } from '@backend/types/hn';
import { storyService } from 'utils/storyService';
import { useFocusEffect } from 'expo-router';
import FadeView from '@components/FadeView';

const SORT_OPTIONS = [
  { label: 'Top', value: 'top' },
  { label: 'Newest', value: 'newest' },
  { label: 'Best', value: 'best' },
];

type SortType = 'top' | 'newest' | 'best';
const SORT_TYPES: SortType[] = ['top', 'newest', 'best'];
const storyType = 'all';

export default function AllScreen() {
  const [sort, setSort] = useState<SortType>('top');
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [currentLimit, setCurrentLimit] = useState(25);

  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const segmentWidth = useRef(0);

  const scrollRefs = useRef<Record<SortType, FlatList | null>>({
    top: null,
    best: null,
    newest: null,
  });
  
  const scrollPositions = useRef<Record<SortType, number>>({
    top: 0,
    best: 0,
    newest: 0,
  });
  
  const handleScroll = (sort: SortType) => (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollPositions.current[sort] = e.nativeEvent.contentOffset.y;
  };
  
  const restoreScroll = (sort: SortType) => {
    scrollRefs.current[sort]?.scrollToOffset({
      offset: scrollPositions.current[sort],
      animated: false,
    });
  };

  const scrollViewRef = useRef<ScrollView | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.setNativeProps({ scrollEnabled: true });
      }
      return () => {
        if (scrollViewRef.current) {
          scrollViewRef.current.setNativeProps({ scrollEnabled: false });
        }
      };
    }, [])
  )

  const handleRefresh = async () => {
    setRefreshing(true);
    setCurrentLimit(25);
    const stories = await storyService.getStories(sort, true, 25);
    setStories(stories);
    setHasMore(stories.length >= 25);
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (!hasMore) return;
    
    const newLimit = currentLimit + 10;
    const newStories = await storyService.getStories(sort, false, newLimit);
    setStories(newStories);
    setCurrentLimit(newLimit);
    setHasMore(newStories.length >= newLimit);
  };

  useEffect(() => {
    async function fetchInitialStories() {
      setLoading(true);
      // Preload current sort type first
      const initialStories = await storyService.getStories(sort, false, 25);
      setStories(initialStories);
      setCurrentLimit(25);
      setHasMore(initialStories.length >= 25);
      setLoading(false);
      
      // Preload other story types in background
      setTimeout(async () => {
        await Promise.all(SORT_TYPES.map(type => 
          storyService.getStories(type, false, 25)
        ));
      }, 1000);
    }
    fetchInitialStories();
  }, [sort]);

  const onLayoutSegment = (event: LayoutChangeEvent) => {
    segmentWidth.current = event.nativeEvent.layout.width;
  };

  const handleSortChange = (newSort: SortType) => {
    setSort(newSort);
    setCurrentLimit(25);
    setHasMore(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: WHITE }}>
      <TopBar search={search} setSearch={setSearch} />

      <View style={styles.segmentedContainer} onLayout={onLayoutSegment}>
        <Animated.View
          style={[
            styles.indicator,
            {
              width: `${100 / SORT_OPTIONS.length}%`,
              transform: [{ translateX: indicatorAnim }],
            },
          ]}
        />
        {SORT_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.value}
            style={styles.segment}
            onPress={() => handleSortChange(option.value as SortType)}
          >
            <Text
              style={[
                styles.segmentText,
                sort === option.value && styles.segmentTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Render all StoryLists but only show the active one */}
      {SORT_OPTIONS.map(option => (
        <FadeView
          key={option.value}
          visible={sort === option.value}
        >
          <StoryList
            stories={stories}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            loading={loading}
            search={search}
            storyType={storyType}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
          />
        </FadeView>
      ))}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 4,
    position: 'relative',
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    zIndex: 1,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    fontFamily: FONT_FAMILY,
  },
  segmentTextActive: {
    color: ORANGE,
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    backgroundColor: WHITE,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    zIndex: 0,
  },
});