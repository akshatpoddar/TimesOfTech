import React from 'react';
import { View, TextInput, StyleSheet, Platform, TouchableOpacity, Text } from 'react-native';
import { ORANGE, WHITE, FONT_FAMILY } from '../../constants/theme';

interface TopBarProps {
  search: string;
  setSearch: (q: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({ search, setSearch }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search"
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  search: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    fontFamily: FONT_FAMILY,
    marginRight: 12,
  },
});

export default TopBar; 