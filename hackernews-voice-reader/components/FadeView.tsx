// FadeView.tsx
import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

const FadeView = ({ visible, children }: { visible: boolean; children: React.ReactNode }) => {
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  return (
    <Animated.View style={{ opacity, flex: 1, display: visible ? 'flex' : 'none' }}>
      {children}
    </Animated.View>
  );
};

export default FadeView;