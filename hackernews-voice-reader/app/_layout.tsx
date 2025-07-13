import { Stack } from 'expo-router';
import { useState } from 'react';
import { ApiKeyModalProvider } from '@components/ApiKeyModalContext';
import ApiKeyModal from '@components/ApiKeyModal';
import { useApiKeyModal } from '@components/ApiKeyModalContext';
import CustomSplash from '@components/CustomSplash';

function RootLayoutContent() {
  const { isVisible, hideModal } = useApiKeyModal();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <ApiKeyModal visible={isVisible} onClose={hideModal} />
    </>
  );
}

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <CustomSplash onFinish={() => setShowSplash(false)} />
    );
  }

  return (
    <ApiKeyModalProvider>
      <RootLayoutContent />
    </ApiKeyModalProvider>
  );
}