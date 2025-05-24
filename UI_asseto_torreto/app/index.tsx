import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Stack, Text } from '@tamagui/core';
import { Logo } from '../components';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  Easing 
} from 'react-native-reanimated';

const AnimatedStack = Animated.createAnimatedComponent(Stack);

export default function SplashScreen() {
  const router = useRouter();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const logoTranslateY = useSharedValue(30);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    // Start animations immediately
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
      mass: 1,
    });
    
    opacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.quad),
    });

    // Logo slide up animation
    logoTranslateY.value = withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.back(1.5)),
    });

    // Text fade in with delay
    setTimeout(() => {
      textOpacity.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.quad),
      });
    }, 300);

    // Navigate to onboarding after 1.2 seconds
    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: logoTranslateY.value }
    ],
    opacity: opacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <>
      <StatusBar style="dark" backgroundColor="#FDFAF6" />
      <Stack 
        flex={1} 
        backgroundColor="$background" 
        alignItems="center" 
        justifyContent="center"
        paddingHorizontal="$4"
      >
        <Stack alignItems="center" space="$6">
          {/* Logo with animations - updated to 330x110 dimensions */}
          <AnimatedStack style={logoAnimatedStyle} alignItems="center">
            <Logo width={330} height={110} color="#363636" />
          </AnimatedStack>

          {/* Tagline with Baloo2 font */}
          <AnimatedStack style={textAnimatedStyle} alignItems="center" space="$3">
            <Text 
              fontSize="$7" 
              fontWeight="600" 
              color="$color" 
              textAlign="center"
              fontFamily="Baloo2SemiBold"
            >
              Know your product
            </Text>
            <Text 
              fontSize="$5" 
              color="$color" 
              textAlign="center" 
              opacity={0.8}
              maxWidth={320}
              fontFamily="Baloo2Regular"
              lineHeight="$6"
            >
              Instantly see what's really inside any product.
            </Text>
          </AnimatedStack>
        </Stack>
      </Stack>
    </>
  );
} 