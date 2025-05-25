import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, TextInput, Keyboard, Platform, Alert, ActivityIndicator } from 'react-native';
import { Stack, Text } from '@tamagui/core';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withSpring,
  Easing,
  interpolate
} from 'react-native-reanimated';

const AnimatedStack = Animated.createAnimatedComponent(Stack);

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  
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

  // Smooth transition when switching between login/signup
  useEffect(() => {
    // Fade out entire form
    formTransition.value = withTiming(0, {
      duration: 250,
      easing: Easing.inOut(Easing.cubic),
    });

    // Switch content and fade back in
    setTimeout(() => {
      formTransition.value = withSpring(1, {
        damping: 18,
        stiffness: 200,
      });
    }, 250);
  }, [isSignUp]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentOffset.value }],
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formTransition.value,
    transform: [
      { translateY: interpolate(formTransition.value, [0, 1], [30, 0]) },
      { scale: interpolate(formTransition.value, [0, 1], [0.95, 1]) },
    ],
  }));

  const handlePrimaryAction = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (isSignUp && !confirmPassword) {
      Alert.alert('Error', 'Please confirm your password');
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        // Sign up flow
        const { error } = await signUp(email, password);
        if (error) {
          Alert.alert('Error', error.message || 'Failed to create account');
        } else {
          console.log('Account created successfully');
          // After successful signup, automatically sign in the user
          const signInResult = await signIn(email, password);
          if (signInResult.error) {
            console.log('Auto sign-in failed:', signInResult.error);
            Alert.alert(
              'Account Created',
              'Your account has been created successfully. Please log in.',
              [{ text: 'OK', onPress: () => setIsSignUp(false) }]
            );
          } else {
            console.log('Auto sign-in successful');
          }
        }
      } else {
        // Sign in flow
        const { error } = await signIn(email, password);
        if (error) {
          Alert.alert('Error', error.message || 'Failed to sign in');
        } else {
          console.log('Login successful');
        }
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecondaryAction = () => {
    // Clear form and switch mode
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setIsSignUp(!isSignUp);
  };

  const handleForgotPassword = () => {
    console.log('Forgot password pressed');
  };

  return (
    <>
      <StatusBar style="dark" backgroundColor="#FDFAF6" />
      <Stack 
        flex={1} 
        backgroundColor="#FDFAF6" 
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
              color="#363636" 
              fontFamily="Baloo2Bold"
            >
              {isSignUp ? 'Create Account' : 'Welcome Back!'}
            </Text>
            
            <Text 
              fontSize={20} 
              color="#363636" 
              opacity={0.7}
              fontFamily="Baloo2Regular"
              lineHeight="$6"
            >
              {isSignUp 
                ? 'Sign up to get started with Labelly'
                : 'Enter your email and password to sign in to your account.'
              }
            </Text>
          </Stack>

          {/* Form Container */}
          <Stack 
            backgroundColor="#FFFFFF" 
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
                color="#363636" 
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
                autoComplete="email"
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
                  color="#363636" 
                  fontFamily="Baloo2SemiBold"
                >
                  Password
                </Text>
                {!isSignUp && (
                  <TouchableOpacity onPress={handleForgotPassword}>
                    <Text 
                      fontSize={14}
                      color="#363636" 
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
                placeholder={isSignUp ? "Create a password" : "Enter your password"}
                placeholderTextColor="#999999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType={isSignUp ? "next" : "done"}
                onSubmitEditing={isSignUp ? undefined : handlePrimaryAction}
                autoComplete={isSignUp ? "password-new" : "password"}
              />
            </Stack>

            {/* Confirm Password Field - Only for Sign Up */}
            {isSignUp && (
              <Stack space="$2">
                <Text 
                  fontSize={16}
                  fontWeight="600" 
                  color="#363636" 
                  fontFamily="Baloo2SemiBold"
                >
                  Confirm Password
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
                  placeholder="Confirm your password"
                  placeholderTextColor="#999999"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  returnKeyType="done"
                  onSubmitEditing={handlePrimaryAction}
                  autoComplete="password-new"
                />
              </Stack>
            )}

            {/* Primary Action Button */}
            <Stack marginTop="$4">
              <TouchableOpacity onPress={handlePrimaryAction} disabled={isLoading}>
                <Stack 
                  paddingHorizontal="$6"
                  paddingVertical="$3"
                  backgroundColor="#363636" 
                  borderRadius="$12"
                  alignItems="center"
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text 
                      color="#FFFFFF"
                      fontWeight="600"
                      fontSize={18}
                      fontFamily="Baloo2SemiBold"
                    >
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </Text>
                  )}
                </Stack>
              </TouchableOpacity>
            </Stack>

            {/* Switch Mode Link */}
            <Stack alignItems="center" marginBottom={40}>
              <Stack flexDirection="row" gap={4}>
                <Text 
                  fontSize={14}
                  color="#363636"
                  opacity={0.7}
                  fontFamily="Baloo2Regular"
                >
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                </Text>
                <TouchableOpacity onPress={handleSecondaryAction}>
                  <Text 
                    fontSize={14}
                    color="#363636"
                    fontWeight="500"
                    textDecorationLine="underline"
                    fontFamily="Baloo2Medium"
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
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