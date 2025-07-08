import React from 'react';
import { View, Text } from 'react-native';
import CommentThread from './CommentThread';
import { FONT_FAMILY } from '@constants/theme';

interface CommentsListProps {
  commentIds: number[];
}

const CommentsList: React.FC<CommentsListProps> = ({ commentIds }) => {
  if (!commentIds || commentIds.length === 0) {
    return <Text style={{ margin: 16, color: '#888', fontFamily: FONT_FAMILY }}>No comments yet.</Text>;
  }
  return (
    <View style={{ marginTop: 16, marginHorizontal: 16 }}>
      {commentIds.map(id => (
        <CommentThread key={id} commentId={id} />
      ))}
    </View>
  );
};

export default CommentsList; 