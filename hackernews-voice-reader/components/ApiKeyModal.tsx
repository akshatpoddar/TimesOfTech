import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Modal from 'react-native-modal';

const API_KEY_STORAGE_KEY = 'elevenlabs_api_key';

interface ApiKeyModalProps {
  visible: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ visible, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (visible) {
      SecureStore.getItemAsync(API_KEY_STORAGE_KEY).then(key => {
        setApiKey(key || '');
        setSaved(false);
      });
    }
  }, [visible]);

  const saveKey = async () => {
    await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, apiKey);
    setSaved(true);
    Alert.alert('Saved', 'Your Eleven Labs API key has been saved.');
    onClose();
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      animationIn="zoomIn"
      animationOut="zoomOut"
      backdropTransitionOutTiming={0}
      useNativeDriver
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modal}>
          <Text style={styles.label}>Eleven Labs API Key</Text>
          <TextInput
            style={styles.input}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="Enter your API key"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Button title="Save" onPress={saveKey} color="#ff6600" />
          <Button title="Cancel" onPress={onClose} color="#888" />
          {saved && <Text style={styles.saved}>API key saved!</Text>}
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: { backgroundColor: '#fff', padding: 24, borderRadius: 12, width: '100%', elevation: 4 },
  label: { fontSize: 18, marginBottom: 8, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  saved: { color: 'green', marginTop: 12, fontSize: 16 },
});

export default ApiKeyModal; 