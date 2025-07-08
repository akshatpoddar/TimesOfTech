import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { Story } from '@backend/types/hn';
import RenderHTML from 'react-native-render-html';
import { FONT_FAMILY, ORANGE } from '@constants/theme';

interface StoryDetailProp {
  story: Story;
  source: { html: string };
  width: number;
}

const StoryDetail: React.FC<StoryDetailProp> = ({ story, source, width }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{story.title}</Text>

      <View style={styles.metaContainer}>
        <Text style={styles.meta}>By: <Text style={styles.metaValue}>{story.by}</Text></Text>
        <Text style={styles.meta}>Points: <Text style={styles.metaValue}>{story.score}</Text></Text>
        <Text style={styles.meta}>Posted: <Text style={styles.metaValue}>{new Date(story.time * 1000).toLocaleString()}</Text></Text>
      </View>

      {story.text ? (
        <RenderHTML
          source={source}
          contentWidth={width}
          tagsStyles={{
            p: {
              fontSize: 16,
              color: '#333',
              marginBottom: 14,
              lineHeight: 24,
              fontFamily: FONT_FAMILY,
            },
            a: {
              color: ORANGE,
              textDecorationLine: 'underline',
            },
            strong: {
              fontWeight: 'bold',
            },
            em: {
              fontStyle: 'italic',
            },
            blockquote: {
              paddingHorizontal: 14,
              borderLeftWidth: 4,
              borderLeftColor: ORANGE,
              color: '#666',
              fontStyle: 'italic',
              marginVertical: 12,
            },
            li: {
              marginBottom: 8,
              marginLeft: 10,
              fontSize: 15,
              fontFamily: FONT_FAMILY,
            },
            ul: {
              paddingLeft: 20,
            },
            ol: {
              paddingLeft: 20,
            },
          }}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 18,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111',
    fontFamily: FONT_FAMILY,
  },
  metaContainer: {
    marginBottom: 24,
  },
  meta: {
    fontSize: 14,
    color: '#777',
    marginBottom: 6,
    fontFamily: FONT_FAMILY,
  },
  metaValue: {
    color: '#333',
    fontWeight: '600',
  },
});

export default StoryDetail;