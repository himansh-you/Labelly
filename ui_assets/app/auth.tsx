import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, TextInput, Keyboard, Platform } from 'react-native';
import { Stack, Text } from '@tamagui/core';
import { useRouter } from 'expo-router';
import { Logo, GoogleIcon } from '../components';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';

const AnimatedStack = Animated.createAnimatedComponent(Stack);

export default function AuthScreen() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Animated values
  const contentOffset = useSharedValue(0);
  const logoOpacity = useSharedValue(1);
  const formTransition = useSharedValue(1); // Start at 1 (visible)

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        contentOffset.value = withSpring(-event.endCoordinates.height * 0.4, {
          damping: 20,
          stiffness: 300,
        });
        
        logoOpacity.value = withTiming(0, {
          duration: 400,
          easing: Easing.out(Easing.cubic),
        });
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        contentOffset.value = withSpring(0, {
          damping: 20,
          stiffness: 300,
        });
        
        logoOpacity.value = withTiming(1, {
          duration: 400,
          easing: Easing.out(Easing.cubic),
        });
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Single smooth form transition when switching between login/signup
  useEffect(() => {
    // Smooth fade out and slide
    formTransition.value = withTiming(0, {
      duration: 250,
      easing: Easing.inOut(Easing.cubic),
    });

    // After fade out, switch content and fade back in
    setTimeout(() => {
      formTransition.value = withSpring(1, {
        damping: 18,
        stiffness: 200,
      });
    }, 250);
  }, [isSignUp]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      {
        scale: interpolate(logoOpacity.value, [0, 1], [0.8, 1]),
      },
    ],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentOffset.value }],
  }));

  // Single unified form container animation
  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formTransition.value,
    transform: [
      {
        translateY: interpolate(formTransition.value, [0, 1], [30, 0]),
      },
      {
        scale: interpolate(formTransition.value, [0, 1], [0.95, 1]),
      },
    ],
  }));

  const handlePrimaryAction = () => {
    if (isSignUp) {
      console.log('Sign up pressed');
      // Handle sign up logic and navigate to welcome
      router.push('/welcome');
    } else {
      console.log('Sign in pressed');
      // Handle sign in logic and navigate to welcome
      router.push('/welcome');
    }
  };

  const handleSecondaryAction = () => {
    // Clear form and switch mode with smooth transition
    setEmail('');
    setPassword('');
    setIsSignUp(!isSignUp);
  };

  const handleForgotPassword = () => {
    console.log('Forgot password pressed');
  };

  const handleGoogleAuth = () => {
    console.log(isSignUp ? 'Sign up with Google' : 'Sign in with Google');
  };

  return (
    <>
      <StatusBar style="dark" backgroundColor="#FDFAF6" />
      <Stack 
        flex={1} 
        backgroundColor="$background" 
        paddingHorizontal="$6"
        paddingTop="$12"
        paddingBottom="$6"
      >
        {/* Logo - Enhanced fade with scale */}
        <AnimatedStack 
          alignItems="center" 
          marginBottom="$10"
          style={logoAnimatedStyle}
        >
          <Logo width={200} height={67} color="#363636" />
        </AnimatedStack>

        {/* Welcome Content + Form - Single unified animation */}
        <AnimatedStack 
          style={[contentAnimatedStyle, formAnimatedStyle]}
          flex={1}
        >
          {/* Welcome Content */}
          <Stack space="$1" marginBottom="$8">
            <Text 
              fontSize={32}
              fontWeight="200" 
              color="$color" 
              fontFamily="Baloo2Bold"
            >
              {isSignUp ? 'Sign Up' : 'Welcome Back!'}
            </Text>
            
            <Text 
              fontSize={18} 
              color="$color" 
              opacity={0.7}
              fontFamily="Baloo2Regular"
              lineHeight="$6"
            >
              {isSignUp 
                ? 'Create your account to get started.'
                : 'Enter your email and password to sign in to your account.'
              }
            </Text>
          </Stack>

          {/* Form Container */}
          <Stack 
            backgroundColor="$background" 
            borderRadius="$6" 
            borderWidth={1}
            borderColor="rgba(54, 54, 54, 0.1)"
            padding="$6"
            space="$5"
          >
            {/* Email Field */}
            <Stack space="$2">
              <Text 
                fontSize={16}
                fontWeight="600" 
                color="$color" 
                fontFamily="Baloo2SemiBold"
              >
                Email
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  fontFamily: 'Baloo2Regular',
                  backgroundColor: '#FFFFFF',
                  color: '#363636'
                }}
                placeholder="m@example.com"
                placeholderTextColor="#999999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </Stack>

            {/* Password Field */}
            <Stack space="$2">
              <Stack 
                flexDirection="row" 
                justifyContent="space-between" 
                alignItems="center"
              >
                <Text 
                  fontSize={16}
                  fontWeight="600" 
                  color="$color" 
                  fontFamily="Baloo2SemiBold"
                >
                  Password
                </Text>
                {!isSignUp && (
                  <TouchableOpacity onPress={handleForgotPassword}>
                    <Text 
                      fontSize={14}
                      color="$color" 
                      fontFamily="Baloo2Regular"
                      textDecorationLine="underline"
                      opacity={0.7}
                    >
                      Forgot password?
                    </Text>
                  </TouchableOpacity>
                )}
              </Stack>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  fontFamily: 'Baloo2Regular',
                  backgroundColor: '#FFFFFF',
                  color: '#363636'
                }}
                placeholder="Enter your password"
                placeholderTextColor="#999999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handlePrimaryAction}
              />
            </Stack>

            {/* Primary Action Button */}
            <Stack marginTop="$4">
              <TouchableOpacity onPress={handlePrimaryAction}>
                <Stack 
                  paddingHorizontal="$6"
                  paddingVertical="$3"
                  backgroundColor="$color" 
                  borderRadius="$12"
                  alignItems="center"
                >
                  <Text 
                    color="$background"
                    fontWeight="600"
                    fontSize={18}
                    fontFamily="Baloo2SemiBold"
                  >
                    {isSignUp ? 'Sign Up' : 'Sign In'}
                  </Text>
                </Stack>
              </TouchableOpacity>
            </Stack>

            {/* Google Auth Button - Only show for Sign Up */}
            {isSignUp && (
              <Stack>
                <TouchableOpacity onPress={handleGoogleAuth}>
                  <Stack 
                    paddingHorizontal="$6"
                    paddingVertical="$3"
                    backgroundColor="white"
                    borderRadius="$12"
                    borderWidth={1}
                    borderColor="#E0E0E0"
                    alignItems="center"
                    flexDirection="row"
                    justifyContent="center"
                    gap={12}
                  >
                    <GoogleIcon size={20} />
                    <Text 
                      color="#363636"
                      fontWeight="600"
                      fontSize={18}
                      fontFamily="Baloo2SemiBold"
                    >
                      Sign up with Google
                    </Text>
                  </Stack>
                </TouchableOpacity>
              </Stack>
            )}

            {/* Switch Mode Link */}
            <Stack alignItems="center" paddingTop="$2">
              <Stack flexDirection="row" alignItems="center" gap={4}>
                <Text 
                  fontSize={14}
                  color="$color"
                  opacity={0.7}
                  fontFamily="Baloo2Regular"
                >
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                </Text>
                <TouchableOpacity onPress={handleSecondaryAction}>
                  <Text 
                    fontSize={14}
                    color="$color"
                    fontWeight="500"
                    textDecorationLine="underline"
                    fontFamily="Baloo2Medium"
                  >
                    {isSignUp ? 'Sign in' : 'Sign up'}
                  </Text>
                </TouchableOpacity>
              </Stack>
            </Stack>
          </Stack>
        </AnimatedStack>
      </Stack>
    </>
  );
} 