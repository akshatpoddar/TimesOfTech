import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

const { width, height } = Dimensions.get('window');

interface CustomSplashProps {
  onFinish: () => void;
}

const CustomSplash: React.FC<CustomSplashProps> = ({ onFinish }) => {
  useEffect(() => {
    const showSplash = async () => {
      // Keep the splash screen visible
      await SplashScreen.preventAutoHideAsync();
      
      // Show the splash for 1 second
      setTimeout(async () => {
        // Hide the splash screen
        await SplashScreen.hideAsync();
        // Call the onFinish callback
        onFinish();
      }, 1000);
    };

    showSplash();
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/YHN-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ff6600',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.6, // 60% of screen width
    height: height * 0.3, // 30% of screen height
  },
});

export default CustomSplash; 