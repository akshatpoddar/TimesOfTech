import { useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router';
import { WebView } from 'react-native-webview';
import React from 'react';
import { View, Text } from 'react-native';

export default function WebViewer() {
  const { url } = useLocalSearchParams();

  if (!url || typeof url !== 'string') {
    return <Text style={{ margin: 20 }}>Invalid URL</Text>;
  }

  return (
    <>
      <Stack.Screen options={{ title: "Web Article" }} />
      <WebView source={{ uri: decodeURIComponent(url) }} style={{ flex: 1 }} />
    </>
  );
}