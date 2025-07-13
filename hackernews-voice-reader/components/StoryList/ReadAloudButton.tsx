import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';
import { useAudioPlayer } from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import { ORANGE, FONT_FAMILY } from '@constants/theme';

const API_KEY_STORAGE_KEY = 'elevenlabs_api_key';
const ELEVEN_LABS_TTS_URL = 'https://api.elevenlabs.io/v1/text-to-speech/';
const DEFAULT_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';

interface ReadAloudButtonProps {
  storyText: string;
}

const ReadAloudButton: React.FC<ReadAloudButtonProps> = ({ storyText }) => {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioUri, setAudioUri] = useState<string | undefined>(undefined);

  const player = useAudioPlayer(audioUri);

  useEffect(() => {
    if (audioUri && !loading) {
      player.play();
      setPlaying(true);
    }
  }, [audioUri]);

  const handlePress = async () => {
    if (!storyText) return;
    setLoading(true);
    try {
      const apiKey = await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
      if (!apiKey) {
        setLoading(false);
        Alert.alert('API Key Required', 'Please enter your Eleven Labs API key to use this feature.');
        return;
      }
      // Call Eleven Labs API
      const response = await fetch(`${ELEVEN_LABS_TTS_URL}${DEFAULT_VOICE_ID}`, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: storyText,
          model_id: 'eleven_flash_v2_5',
          voice_settings: { stability: 0.5, similarity_boost: 0.5 },
        }),
      });
      if (!response.ok) {
        setLoading(false);
        const errorText = await response.text();
        console.log('Error response:', response.status, errorText);
        if (response.status === 401 || response.status === 403) {
          Alert.alert('API Key Error', 'Your API key is invalid or you are out of credits. Please check your Eleven Labs account.');
        } else {
          Alert.alert('Error', `Could not connect to Eleven Labs. Status: ${response.status}\n${errorText}`);
        }
        return;
      }
      // Get the blob
      const blob = await response.blob();
      // Convert blob to base64 using FileReader
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result?.toString().split(',')[1]; // Remove data:audio/mpeg;base64, prefix
        if (!base64data) {
          setLoading(false);
          Alert.alert('Error', 'Failed to process audio data.');
          return;
        }
        const fileUri = FileSystem.cacheDirectory + `tts-${Date.now()}.mp3`;
        await FileSystem.writeAsStringAsync(fileUri, base64data, { encoding: FileSystem.EncodingType.Base64 });
        setAudioUri(fileUri);
        setLoading(false);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      setLoading(false);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        disabled={loading || playing}
      >
        {loading ? (
          <ActivityIndicator color={ORANGE} />
        ) : (
          <>
            <Ionicons name="volume-high-outline" size={20} color={ORANGE} />
            <Text style={styles.buttonText}>Read Aloud</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: 12 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: ORANGE,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  buttonText: {
    color: ORANGE,
    fontFamily: FONT_FAMILY,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default ReadAloudButton; 