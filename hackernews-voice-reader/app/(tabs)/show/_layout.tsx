import { ORANGE } from '@constants/theme';
import { Stack } from 'expo-router';

export default function ShowRootLayout() {

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title:"Show"}} />;
      <Stack.Screen name="[id]" options={{title:"Story", headerShown: true, headerTintColor: ORANGE}} />;
    </Stack>
  )
  
}