import { ORANGE } from '@constants/theme';
import { Stack } from 'expo-router';

export default function AskRootLayout() {

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title:"Ask"}} />;
      <Stack.Screen name="[id]" options={{title:"Story", headerShown: true, headerTintColor: ORANGE}} />;
    </Stack>
  )
  
}