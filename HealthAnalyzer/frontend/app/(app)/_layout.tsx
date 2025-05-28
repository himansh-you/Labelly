import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'expo-router';
import { Platform } from 'react-native';

export default function AppLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !user && pathname !== '/') {
      router.replace('/(auth)/login');
    }
  }, [user, isLoading, router, pathname]);

  // Don't render anything while checking authentication
  if (isLoading) {
    return null;
  }

  // Enhanced animation with faster back transitions
  const defaultScreenOptions = {
    headerShown: false,
    animation: 'slide_from_right' as const,
    animationDuration: 220, // Forward duration
    gestureEnabled: true,
    gestureDirection: 'horizontal' as const,
    fullScreenGestureEnabled: true,
    gestureResponseDistance: 50,
    animationTypeForReplace: 'push' as const,
    detachPreviousScreen: false,
    transitionSpec: {
      open: {
        animation: 'spring',
        config: {
          stiffness: 400,
          damping: 28,
          mass: 0.8,
        },
      },
      close: {
        animation: 'spring',
        config: {
          stiffness: 600, // Higher stiffness for faster back
          damping: 22,    // Lower damping for snappier response
          mass: 0.5,      // Lighter mass for quicker movement
        },
      },
    },
    // Custom timing for different directions
    transitionDuration: {
      open: 220,  // Forward: 220ms
      close: 110, // Back: 110ms (2x faster)
    },
    cardStyleInterpolator: ({ current, next, layouts }: any) => {
      const progress = current.progress;
      
      return {
        cardStyle: {
          backgroundColor: 'transparent',
          transform: [
            {
              translateX: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0],
                extrapolate: 'clamp',
              }),
            },
            {
              scale: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.98, 1],
                extrapolate: 'clamp',
              }),
            },
          ],
          opacity: progress.interpolate({
            inputRange: [0, 0.01, 1],
            outputRange: [0, 1, 1],
            extrapolate: 'clamp',
          }),
        },
        overlayStyle: {
          backgroundColor: 'transparent',
          opacity: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.1],
            extrapolate: 'clamp',
          }),
        },
      };
    },
    cardStyle: {
      backgroundColor: 'transparent',
    },
    cardOverlayEnabled: false,
  };

  // Enhanced modal animation with faster back
  const modalScreenOptions = {
    headerShown: false,
    presentation: 'modal' as const,
    animation: 'slide_from_bottom' as const,
    animationDuration: 250, // Forward duration
    gestureEnabled: true,
    gestureDirection: 'vertical' as const,
    fullScreenGestureEnabled: true,
    gestureResponseDistance: 100,
    detachPreviousScreen: false,
    animationTypeForReplace: 'push' as const,
    transitionSpec: {
      open: {
        animation: 'spring',
        config: {
          stiffness: 350,
          damping: 24,
          mass: 0.8,
        },
      },
      close: {
        animation: 'spring',
        config: {
          stiffness: 550, // Faster close for modal
          damping: 20,    // Snappier damping
          mass: 0.5,      // Lighter mass
        },
      },
    },
    transitionDuration: {
      open: 250,  // Forward: 250ms
      close: 125, // Back: 125ms (2x faster)
    },
    cardStyleInterpolator: ({ current, layouts }: any) => {
      return {
        cardStyle: {
          backgroundColor: 'transparent',
          transform: [
            {
              translateY: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.height, 0],
                extrapolate: 'clamp',
              }),
            },
            {
              scale: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1],
                extrapolate: 'clamp',
              }),
            },
          ],
          opacity: current.progress.interpolate({
            inputRange: [0, 0.01, 1],
            outputRange: [0, 1, 1],
            extrapolate: 'clamp',
          }),
        },
        overlayStyle: {
          backgroundColor: 'transparent',
          opacity: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.2],
            extrapolate: 'clamp',
          }),
        },
      };
    },
    cardStyle: {
      backgroundColor: 'transparent',
    },
    cardOverlayEnabled: false,
  };

  return (
    <Stack
      screenOptions={{
        cardStyle: { backgroundColor: 'transparent' },
        cardOverlayEnabled: false,
        detachPreviousScreen: false,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={defaultScreenOptions}
      />
      <Stack.Screen 
        name="welcome" 
        options={defaultScreenOptions}
      />
      <Stack.Screen 
        name="home" 
        options={defaultScreenOptions}
      />
      <Stack.Screen 
        name="scan" 
        options={{
          ...defaultScreenOptions,
          animationDuration: 200,
          animation: 'slide_from_bottom',
          gestureDirection: 'vertical',
          transitionSpec: {
            open: {
              animation: 'spring',
              config: {
                stiffness: 400,
                damping: 28,
                mass: 0.8,
              },
            },
            close: {
              animation: 'spring',
              config: {
                stiffness: 600, // Faster close
                damping: 22,
                mass: 0.5,
              },
            },
          },
          transitionDuration: {
            open: 200,  // Forward: 200ms
            close: 100, // Back: 100ms (2x faster)
          },
          cardStyleInterpolator: ({ current, layouts }: any) => {
            return {
              cardStyle: {
                backgroundColor: 'transparent',
                transform: [
                  {
                    translateY: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.height * 0.3, 0],
                      extrapolate: 'clamp',
                    }),
                  },
                  {
                    scale: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.96, 1],
                      extrapolate: 'clamp',
                    }),
                  },
                ],
                opacity: current.progress.interpolate({
                  inputRange: [0, 0.01, 1],
                  outputRange: [0, 1, 1],
                  extrapolate: 'clamp',
                }),
              },
            };
          },
        }}
      />
      <Stack.Screen 
        name="result" 
        options={modalScreenOptions}
      />
      <Stack.Screen 
        name="chatbot" 
        options={{
          ...defaultScreenOptions,
          animationDuration: 210,
          transitionSpec: {
            open: {
              animation: 'spring',
              config: {
                stiffness: 400,
                damping: 28,
                mass: 0.8,
              },
            },
            close: {
              animation: 'spring',
              config: {
                stiffness: 600, // Faster close
                damping: 22,
                mass: 0.5,
              },
            },
          },
          transitionDuration: {
            open: 210,  // Forward: 210ms
            close: 105, // Back: 105ms (2x faster)
          },
          cardStyleInterpolator: ({ current, layouts }: any) => {
            return {
              cardStyle: {
                backgroundColor: 'transparent',
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                      extrapolate: 'clamp',
                    }),
                  },
                  {
                    scale: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.97, 1],
                      extrapolate: 'clamp',
                    }),
                  },
                ],
                opacity: current.progress.interpolate({
                  inputRange: [0, 0.01, 1],
                  outputRange: [0, 1, 1],
                  extrapolate: 'clamp',
                }),
              },
            };
          },
        }}
      />
      <Stack.Screen 
        name="history" 
        options={defaultScreenOptions}
      />
      <Stack.Screen 
        name="profile" 
        options={defaultScreenOptions}
      />
      <Stack.Screen 
        name="edit-profile" 
        options={defaultScreenOptions}
      />
      <Stack.Screen 
        name="settings" 
        options={defaultScreenOptions}
      />
      <Stack.Screen 
        name="compare" 
        options={defaultScreenOptions}
      />
    </Stack>
  );
} 