import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { ORANGE, WHITE, FONT_FAMILY } from '../../constants/theme';
import { Story } from '@backend/types/hn';
import { useRouter } from 'expo-router';

const PLACEHOLDER = 'https://via.placeholder.com/80x80.png?text=News';

interface StoryCardProps {
  story: Story;
  storyType: string;
}

function formatTimeAgo(unixTime: number): string {
  const now = Date.now();
  const diff = now - unixTime * 1000;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return days === 1 ? 'Yesterday' : `${days} days ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

const StoryCard: React.FC<StoryCardProps> = ({ story, storyType }) => {
  const router = useRouter();
  
  return (
    <TouchableOpacity onPress={() => router.push(`/${storyType}/${story.id}`)}>
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <Text style={styles.source}>{story.by}</Text>
            <Text style={styles.time}>{formatTimeAgo(story.time)}</Text>
          </View>
          <Text style={styles.title}>{story.title}</Text>
          <Text style={styles.reads}>{story.score} points</Text>
        </View>
        {story.imageUrl && story.imageUrl !== PLACEHOLDER && (
          <Image
            source={{ uri: story.imageUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        )} 
        
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  source: {
    color: ORANGE,
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 8,
    fontFamily: FONT_FAMILY,
  },
  time: {
    color: '#888',
    fontSize: 13,
    fontFamily: FONT_FAMILY,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
    fontFamily: FONT_FAMILY,
  },
  reads: {
    color: '#aaa',
    fontSize: 13,
    fontFamily: FONT_FAMILY,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginLeft: 12,
    backgroundColor: '#eee',
  },
});

export default StoryCard; 