import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Comment } from '@backend/types/hn';
import { getCommentById } from '@backend/controller/hnController';
import { ORANGE, FONT_FAMILY } from '@constants/theme';

interface CommentThreadProps {
  commentId: number;
  depth?: number;
  maxDepth?: number;
}

const INDENT = 16;

const CommentThread: React.FC<CommentThreadProps> = ({ commentId, depth = 0, maxDepth = 5 }) => {
  const [comment, setComment] = useState<Comment | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    async function fetchCommentData() {
      const commentData: Comment | null = await getCommentById(commentId);
      setComment(commentData);
    }
    fetchCommentData();
  }, [commentId]);

  if (!comment || !comment.text) return null; // Deleted or empty

  return (
    <View style={[styles.commentContainer, { marginLeft: depth * INDENT }]}>
      <TouchableOpacity onPress={() => setCollapsed(c => !c)}>
        <Text style={styles.author}>
          {comment.by}{' '}
          <Text style={styles.time}>
            • {new Date(comment.time * 1000).toLocaleString()}
          </Text>
        </Text>

        <Text style={styles.text}>
          {comment.text.replace(/<[^>]+>/g, '')}
        </Text>

        {comment.kids && comment.kids.length > 0 && (
          <Text style={styles.toggleReplies}>
            {collapsed ? 'Show replies' : 'Hide replies'}
          </Text>
        )}
      </TouchableOpacity>

      {!collapsed && comment.kids && depth < maxDepth && (
        <View style={{ marginTop: 8 }}>
          {comment.kids.map(childId => (
            <CommentThread
              key={childId}
              commentId={childId}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  commentContainer: {
    paddingVertical: 10,
    paddingRight: 10,
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#eee',
  },
  author: {
    color: ORANGE,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONT_FAMILY,
    marginBottom: 4,
  },
  time: {
    fontWeight: 'normal',
    color: '#888',
    fontSize: 12,
    fontFamily: FONT_FAMILY,
  },
  text: {
    fontSize: 15,
    color: '#222',
    lineHeight: 22,
    fontFamily: FONT_FAMILY,
    marginBottom: 6,
  },
  toggleReplies: {
    fontSize: 13,
    color: '#888',
    fontFamily: FONT_FAMILY,
    textDecorationLine: 'underline',
    marginTop: 4,
  },
});

export default CommentThread;