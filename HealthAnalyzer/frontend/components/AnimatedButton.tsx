import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Stack, Text } from '@tamagui/core';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  runOnJS
} from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export interface AnimatedButtonProps {
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'destructive' | 'action';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({ 
  onPress, 
  disabled = false, 
  variant = 'primary',
  size = 'medium',
  children, 
  backgroundColor,
  borderColor,
  textColor,
  fullWidth = true,
  icon
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.15);

  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: backgroundColor || '#363636',
          borderColor: 'transparent',
          textColor: textColor || '#FDFAF6',
        };
      case 'secondary':
        return {
          backgroundColor: backgroundColor || '#FDFAF6',
          borderColor: borderColor || '#363636',
          textColor: textColor || '#363636',
        };
      case 'destructive':
        return {
          backgroundColor: backgroundColor || '#FDFAF6',
          borderColor: borderColor || '#FF3B30',
          textColor: textColor || '#FF3B30',
        };
      case 'action':
        return {
          backgroundColor: backgroundColor || '#FDFAF6',
          borderColor: borderColor || '#007AFF',
          textColor: textColor || '#007AFF',
        };
      default:
        return {
          backgroundColor: backgroundColor || '#363636',
          borderColor: 'transparent',
          textColor: textColor || '#FDFAF6',
        };
    }
  };

  // Get size-specific styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 12,
          paddingHorizontal: 20,
          minHeight: 44,
          fontSize: 14,
          borderRadius: 12,
        };
      case 'medium':
        return {
          paddingVertical: 16,
          paddingHorizontal: 24,
          minHeight: 56,
          fontSize: 16,
          borderRadius: 16,
        };
      case 'large':
        return {
          paddingVertical: 20,
          paddingHorizontal: 32,
          minHeight: 64,
          fontSize: 18,
          borderRadius: 20,
        };
      default:
        return {
          paddingVertical: 16,
          paddingHorizontal: 24,
          minHeight: 56,
          fontSize: 16,
          borderRadius: 16,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    shadowOpacity: shadowOpacity.value,
    elevation: shadowOpacity.value * 20,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, {
      damping: 20,
      stiffness: 400,
    });
    opacity.value = withTiming(0.9, { duration: 150 });
    shadowOpacity.value = withTiming(0.05, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 18,
      stiffness: 350,
    });
    opacity.value = withTiming(1, { duration: 200 });
    shadowOpacity.value = withTiming(0.15, { duration: 200 });
  };

  const handlePress = () => {
    if (!disabled) {
      runOnJS(onPress)();
    }
  };

  return (
    <AnimatedTouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        {
          borderRadius: sizeStyles.borderRadius,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: variantStyles.backgroundColor,
          borderWidth: variant === 'primary' ? 0 : 2,
          borderColor: variantStyles.borderColor,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 8,
          minHeight: sizeStyles.minHeight,
          flexDirection: 'row',
        },
        fullWidth && { flex: 1 },
        animatedStyle,
        shadowStyle,
        disabled && { opacity: 0.6 }
      ]}
      activeOpacity={1}
    >
      {icon && (
        <Stack marginRight={children ? "$2" : 0}>
          {icon}
        </Stack>
      )}
      {typeof children === 'string' ? (
        <Text 
          color={variantStyles.textColor}
          fontSize={sizeStyles.fontSize}
          fontFamily="Baloo2SemiBold"
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </AnimatedTouchableOpacity>
  );
};

export default AnimatedButton; 