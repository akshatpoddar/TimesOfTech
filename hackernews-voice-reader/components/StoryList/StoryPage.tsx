import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import StoryDetail from './StoryDetail'
import CommentsList from './CommentsList'
import { Story } from '@backend/types/hn'
import { ORANGE, FONT_FAMILY } from '@constants/theme'
import { useRouter } from 'expo-router'

interface StoryPageProps{
    story: Story;
    storyType: string;
}

const StoryPage : React.FC<StoryPageProps> = ({story, storyType}) => {
  const router = useRouter();

  return (
    <ScrollView style={styles.scrollContainer}>
        <StoryDetail story={story}/>

        {story.url ? (
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              onPress={() => {
                const encodedUrl = encodeURIComponent(story.url!);
                router.push(`/${storyType}/webview/${encodedUrl}`);
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
  )
}

export default StoryPage

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