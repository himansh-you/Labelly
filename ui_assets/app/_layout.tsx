import React from 'react';
import { Stack } from 'expo-router';
import { TamaguiProvider } from '@tamagui/core';
import tamaguiConfig from '../tamagui.config';
import { useFonts } from 'expo-font';

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    // Baloo 2 fonts with proper naming
    Baloo2Regular: require('../assets/fonts/Baloo2-Regular.ttf'),
    Baloo2Medium: require('../assets/fonts/Baloo2-Medium.ttf'),
    Baloo2SemiBold: require('../assets/fonts/Baloo2-SemiBold.ttf'),
    Baloo2Bold: require('../assets/fonts/Baloo2-Bold.ttf'),
    Baloo2ExtraBold: require('../assets/fonts/Baloo2-ExtraBold.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="welcome" />
      </Stack>
    </TamaguiProvider>
  );
} 