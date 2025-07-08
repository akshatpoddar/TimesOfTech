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
} from 'react-native';
import TopBar from '@components/TopBar/TopBar';
import StoryList from '@components/StoryList/StoryList';
import { WHITE, ORANGE, FONT_FAMILY } from '@constants/theme';
import { Story } from '@backend/types/hn';
import { fetchStoriesWithCache } from 'utils/storyCache';
import { Stack } from 'expo-router';
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


  const handleRefresh = async () => {
    setRefreshing(true);
    const stories = await fetchStoriesWithCache(sort, true);
    setStories(stories);
    setRefreshing(false);
  };

  useEffect(() => {
    async function fetchAllStories() {
      await Promise.all(SORT_TYPES.map(type => fetchStoriesWithCache(type, false)));
      const initialStories = await fetchStoriesWithCache(sort, false);
      setStories(initialStories);
      setLoading(false);
    }
    fetchAllStories();
  }, []);

  useEffect(() => {
    let isMounted = true;
    setStories([]);
    setLoading(true);
    async function fetchSortStories() {
      const sortStories = await fetchStoriesWithCache(sort, false);
      if (isMounted) {
        setStories(sortStories);
        setLoading(false);
      }
    }
    fetchSortStories();

    // Animate the indicator
    const toValue = SORT_TYPES.indexOf(sort) * (segmentWidth.current || 0);
    Animated.spring(indicatorAnim, {
      toValue,
      useNativeDriver: true,
      stiffness: 100,
      damping: 25,
      mass: 0.4,
    }).start();

    return () => { isMounted = false; };
  }, [sort]);

  const onLayoutSegment = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width / SORT_OPTIONS.length;
    segmentWidth.current = width;
  };
  return (
    <>
    <Stack.Screen options={{ title:"All"}} />
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
            onPress={() => setSort(option.value as SortType)}
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
            sort={option.value as SortType}
            stories={stories}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            loading={loading}
            search={search}
            storyType={storyType}
          />
        </FadeView>
      ))}
    </SafeAreaView>
    </>
  )

  // return (
  //   <SafeAreaView style={{ flex: 1, backgroundColor: WHITE }}>
  //     <TopBar search={search} setSearch={setSearch} />
  //     <View style={styles.segmentedContainer} onLayout={onLayoutSegment}>
  //       <Animated.View
  //         style={[
  //           styles.indicator,
  //           {
  //             width: `${100 / SORT_OPTIONS.length}%`,
  //             transform: [{ translateX: indicatorAnim }],
  //           },
  //         ]}
  //       />
  //       {SORT_OPTIONS.map(option => (
  //         <TouchableOpacity
  //           key={option.value}
  //           style={styles.segment}
  //           onPress={() => setSort(option.value as SortType)}
  //         >
  //           <Text
  //             style={[
  //               styles.segmentText,
  //               sort === option.value && styles.segmentTextActive,
  //             ]}
  //           >
  //             {option.label}
  //           </Text>
  //         </TouchableOpacity>
  //       ))}
  //     </View>
  //     <StoryList
  //       stories={stories}
  //       refreshing={refreshing}
  //       onRefresh={handleRefresh}
  //       loading={loading}
  //       search={search}
  //       storyType={storyType}
  //     />
  //   </SafeAreaView>
  // );
}

const styles = StyleSheet.create({
  segmentedContainer: {
    flexDirection: 'row',
    position: 'relative',
    marginTop: 8,
    marginBottom: 4,
    marginHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 4,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    zIndex: 1,
  },
  segmentText: {
    color: '#888',
    fontFamily: FONT_FAMILY,
    fontWeight: '600',
    fontSize: 15,
  },
  segmentTextActive: {
    color: WHITE,
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 0,
    backgroundColor: ORANGE,
    borderRadius: 8,
    zIndex: 0,
  },
});