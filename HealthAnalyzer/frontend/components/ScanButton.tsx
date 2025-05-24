import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface ScanButtonProps {
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
}

export default function ScanButton({ 
  size = 'large',
  onPress,
  variant = 'primary'
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
            style={[        styles.button,         size === 'large' ? styles.buttonLarge : size === 'medium' ? styles.buttonMedium : styles.buttonSmall,        variant === 'secondary' && styles.buttonSecondary      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        <FontAwesome 
          name="camera" 
          size={size === 'large' ? 24 : size === 'medium' ? 18 : 14} 
          color={variant === 'secondary' ? '#363636' : '#fff'} 
          style={styles.icon}
        />
                <Text style={[          styles.text,           size === 'large' ? styles.textLarge : size === 'medium' ? styles.textMedium : styles.textSmall,          variant === 'secondary' && styles.textSecondary        ]}>
          Scan Ingredients
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#363636',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#363636',
  },
  buttonLarge: {
    paddingVertical: 18,
    paddingHorizontal: 36,
    width: '100%',
    maxWidth: 300,
  },
  buttonMedium: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    width: '80%',
    maxWidth: 240,
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
  textSecondary: {
    color: '#363636',
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