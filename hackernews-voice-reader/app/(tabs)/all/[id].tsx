import React from 'react';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Text,
  ActivityIndicator,
  useWindowDimensions,
  ScrollView,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import { getStoryById } from '@backend/controller/hnController';
import { Story } from '@backend/types/hn';
import { FONT_FAMILY, ORANGE, WHITE } from '@constants/theme';
import StoryDetail from '@components/StoryList/StoryDetail';
import CommentsList from '@components/StoryList/CommentsList';
import LoadingIndicator from '@components/Loading';

export default function StoryDetailScreen() {
  const { id } = useLocalSearchParams();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions();

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

  const source = {
    html: story.text || ' ',
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Story', headerTintColor: ORANGE }} />
      <ScrollView style={styles.scrollContainer}>
        <StoryDetail story={story} source={source} width={width} />

        {story.url ? (
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              onPress={() => {
                const encodedUrl = encodeURIComponent(story.url!);
                router.push(`/all/webview/${encodedUrl}`);
              }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Read Full Article</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <Text style={styles.commentHeader}>
          Comments: {story.descendants ?? 0}
        </Text>

        {story.kids && <CommentsList commentIds={story.kids} />}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loading: {
    marginTop: 40,
  },
  notFound: {
    margin: 20,
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    color: '#555',
  },
  buttonWrapper: {
    alignItems: 'center',
    marginVertical: 5,
    marginTop: -20
  },
  button: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // for Android shadow
  },
  buttonText: {
    color: ORANGE,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONT_FAMILY,
  },
  commentHeader: {
    marginHorizontal: 16,
    marginVertical: 16,
    color: '#222',
    fontWeight: 'bold',
    fontSize: 20,
    fontFamily: FONT_FAMILY,
  },
});