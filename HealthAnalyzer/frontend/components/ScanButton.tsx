import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface ScanButtonProps {
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
}

export default function ScanButton({ 
  size = 'large',
  onPress
}: ScanButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Default behavior: navigate to scan screen
      router.push('/(app)/scan');
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, styles[`button${size.charAt(0).toUpperCase() + size.slice(1)}`]]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        <FontAwesome 
          name="camera" 
          size={size === 'large' ? 24 : size === 'medium' ? 18 : 14} 
          color="#fff" 
          style={styles.icon}
        />
        <Text style={[styles.text, styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}`]]}>
          Scan Ingredients
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4CAF50', // Green color
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonLarge: {
    paddingVertical: 18,
    paddingHorizontal: 36,
    width: '80%',
    maxWidth: 300,
  },
  buttonMedium: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    width: '60%',
    maxWidth: 200,
  },
  buttonSmall: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: 'auto',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: '600',
  },
  textLarge: {
    fontSize: 18,
  },
  textMedium: {
    fontSize: 16,
  },
  textSmall: {
    fontSize: 14,
  },
  icon: {
    marginRight: 8,
  },
}); 