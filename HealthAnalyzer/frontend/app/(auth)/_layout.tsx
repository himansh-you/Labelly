import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  // Snappier auth screen animations
  const authScreenOptions = {
    headerShown: false,
    animation: 'slide_from_right' as const,
    animationDuration: 220, // Reduced from 300
    gestureEnabled: true,
    transitionSpec: {
      open: {
        animation: 'spring',
        config: {
          stiffness: 400, // Increased from 300
          damping: 28,    // Reduced from 30
          mass: 0.8,      // Reduced from 1
        },
      },
      close: {
        animation: 'spring',
        config: {
          stiffness: 450, // Increased from 300
          damping: 28,    // Reduced from 30
          mass: 0.8,      // Reduced from 1
        },
      },
    },
    cardStyleInterpolator: ({ current, layouts }: any) => {
      return {
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0],
              }),
            },
            {
              scale: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.98, 1],
              }),
            },
          ],
          opacity: current.progress.interpolate({
            inputRange: [0, 0.4, 1], // Faster opacity
            outputRange: [0, 0.8, 1],
          }),
        },
      };
    },
  };

  return (
    <Stack>
      <Stack.Screen 
        name="login" 
        options={authScreenOptions}
      />
      <Stack.Screen 
        name="signup" 
        options={authScreenOptions}
      />
      <Stack.Screen 
        name="auth" 
        options={authScreenOptions}
      />
    </Stack>
  );
} 