import { Ionicons } from '@expo/vector-icons';
import { ORANGE } from '@constants/theme';
import { Stack } from 'expo-router';
import { useApiKeyModal } from '@components/ApiKeyModalContext';

export default function AskRootLayout() {
  const { showModal } = useApiKeyModal();

  return (
    <Stack>
      <Stack.Screen name="index" options={{
        title: "Ask",
        headerRight: () => (
          <Ionicons
            name="key-outline"
            size={24}
            color={ORANGE}
            style={{ marginRight: 12 }}
            onPress={showModal}
          />
        ),
      }} />;
      <Stack.Screen name="[id]" options={{title:"Story", headerShown: true, headerTintColor: ORANGE}} />;
      <Stack.Screen name="webview/[url]" options={{title:"Web Article", headerShown: true, headerTintColor: ORANGE}} />;
    </Stack>
  )
  
}