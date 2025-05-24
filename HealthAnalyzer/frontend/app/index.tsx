import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Redirect } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  Easing 
} from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);

export default function IndexPage() {
  const { user, isLoading } = useAuth();
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

  // Wait for auth to initialize before redirecting
  if (isLoading) {
    return (
      <>
        <StatusBar style="dark" backgroundColor="#FDFAF6" />
        <View style={styles.container}>
          <View style={styles.content}>
            {/* Logo with animations */}
            <AnimatedView style={[logoAnimatedStyle, styles.logoContainer]}>
              <Logo width={330} height={110} color="#363636" />
            </AnimatedView>

            {/* Tagline */}
            <AnimatedView style={[textAnimatedStyle, styles.textContainer]}>
              <Text style={styles.title}>
                Understand your ingredients
              </Text>
              <Text style={styles.subtitle}>
                Make informed decisions about what you consume.
              </Text>
            </AnimatedView>
          </View>
        </View>
      </>
    );
  }

  // Redirect to the appropriate screen based on authentication state
  return user ? <Redirect href="/(app)" /> : <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFAF6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  content: {
    alignItems: 'center',
    gap: 48,
  },
  logoContainer: {
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#363636',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#363636',
    textAlign: 'center',
    opacity: 0.8,
    maxWidth: 320,
    lineHeight: 28,
  },
}); 