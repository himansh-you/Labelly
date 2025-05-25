import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Redirect, useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  withDelay,
  withSequence,
  runOnJS,
  Easing 
} from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function IndexPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Splash screen animations
  const splashOpacity = useSharedValue(1);
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  
  // Onboarding screen animations
  const onboardingOpacity = useSharedValue(0);
  const logoTranslateY = useSharedValue(0);
  const logoFinalScale = useSharedValue(1);
  const textOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(50);

  useEffect(() => {
    if (!isLoading) {
      // Start splash screen animation
      startSplashAnimation();
    }
  }, [isLoading]);

  const startSplashAnimation = () => {
    // Initial logo appear animation
    logoOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.quad),
    });

    logoScale.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
      mass: 1,
    });

    // After splash, morph to onboarding screen
    setTimeout(() => {
      morphToOnboarding();
    }, 2000); // Show splash for 2 seconds
  };

  const morphToOnboarding = () => {
    // Start onboarding screen transition
    runOnJS(setShowOnboarding)(true);
    
    // Fade out splash background and fade in onboarding
    splashOpacity.value = withTiming(0, { duration: 500 });
    onboardingOpacity.value = withTiming(1, { duration: 500 });
    
    // Animate logo to final position (slightly smaller and moved up)
    logoFinalScale.value = withTiming(0.85, {
      duration: 800,
      easing: Easing.out(Easing.quad),
    });
    
    logoTranslateY.value = withTiming(-50, {
      duration: 800,
      easing: Easing.out(Easing.quad),
    });

    // Fade in text with delay
    textOpacity.value = withDelay(400, withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.quad),
    }));

    // Slide up and fade in button
    buttonOpacity.value = withDelay(700, withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.quad),
    }));
    
    buttonTranslateY.value = withDelay(700, withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.back(1.5)),
    }));

    // Hide splash completely after animation
    setTimeout(() => {
      setShowSplash(false);
    }, 1000);
  };

  const handleGetStarted = () => {
    // Add exit animation before navigation
    onboardingOpacity.value = withTiming(0, {
      duration: 300,
    }, (finished) => {
      if (finished) {
        runOnJS(() => router.push('/(auth)/auth'))();
      }
    });
  };

  // Animated styles
  const splashContainerStyle = useAnimatedStyle(() => ({
    opacity: splashOpacity.value,
  }));

  const splashLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const onboardingContainerStyle = useAnimatedStyle(() => ({
    opacity: onboardingOpacity.value,
  }));

  const onboardingLogoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoFinalScale.value },
      { translateY: logoTranslateY.value }
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  // Show loading splash while auth is initializing
  if (isLoading) {
    return (
      <>
        <StatusBar style="dark" backgroundColor="#FDFAF6" />
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Logo width={300} height={100} color="#363636" />
            </View>
          </View>
        </View>
      </>
    );
  }

  // Redirect if user is authenticated
  if (user && !showSplash && !showOnboarding) {
    return <Redirect href="/(app)" />;
  }

  // Redirect to login if not authenticated and splash/onboarding is done
  if (!user && !showSplash && !showOnboarding) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor="#FDFAF6" />
      <View style={styles.container}>
        {/* Splash Screen */}
        {showSplash && (
          <AnimatedView style={[styles.splashContainer, splashContainerStyle]}>
            <AnimatedView style={[styles.splashLogoContainer, splashLogoStyle]}>
              <Logo width={330} height={110} color="#363636" />
            </AnimatedView>
          </AnimatedView>
        )}

        {/* Onboarding Screen */}
        {showOnboarding && (
          <AnimatedView style={[styles.onboardingContainer, onboardingContainerStyle]}>
            {/* Logo */}
            <View style={styles.onboardingContent}>
              <AnimatedView style={[styles.onboardingLogoContainer, onboardingLogoStyle]}>
                <Logo width={330} height={110} color="#363636" />
              </AnimatedView>

              {/* Text Content */}
              <AnimatedView style={[styles.textContainer, textStyle]}>
                <Text style={styles.title}>Know your product</Text>
                <Text style={styles.subtitle}>
                  Instantly see what's really inside any product.
                </Text>
              </AnimatedView>
            </View>

            {/* Get Started Button */}
            <AnimatedTouchableOpacity 
              style={[styles.buttonContainer, buttonStyle]}
              onPress={handleGetStarted}
            >
              <View style={styles.button}>
                <Text style={styles.buttonText}>Get Started</Text>
              </View>
            </AnimatedTouchableOpacity>
          </AnimatedView>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFAF6',
  },
  content: {
    alignItems: 'center',
    gap: 48,
  },
  
  // Splash Screen Styles
  splashContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FDFAF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashLogoContainer: {
    alignItems: 'center',
  },

  // Onboarding Screen Styles
  onboardingContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  onboardingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onboardingLogoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  textContainer: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '200',
    color: '#363636',
    textAlign: 'center',
    fontFamily: 'Baloo2Bold',
  },
  subtitle: {
    fontSize: 20,
    color: '#363636',
    textAlign: 'center',
    opacity: 0.7,
    maxWidth: 420,
    lineHeight: 28,
    fontFamily: 'Baloo2Regular',
  },
  
  // Button Styles
  buttonContainer: {
    paddingBottom: 48,
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: '#363636',
    borderRadius: 48,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FDFAF6',
    fontWeight: '600',
    fontSize: 20,
    fontFamily: 'Baloo2SemiBold',
  },
  logoContainer: {
    alignItems: 'center',
  },
}); 