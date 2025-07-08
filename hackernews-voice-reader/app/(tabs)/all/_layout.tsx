import { ORANGE } from '@constants/theme';
import { Stack } from 'expo-router';

export default function AllRootLayout() {

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title:"All"}} />;
      <Stack.Screen name="[id]" options={{title:"Story", headerShown: true, headerTintColor: ORANGE}} />;
      <Stack.Screen name="webview/[url]" options={{title:"Web Article", headerShown: true, headerTintColor: ORANGE}} />;
    </Stack>
  )
  
}