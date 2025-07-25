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
  Easing 
} from 'react-native-reanimated';

const AnimatedStack = Animated.createAnimatedComponent(Stack);

// Login screen component
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user } = useAuth();
  
  // Animated values
  const contentOffset = useSharedValue(0);
  const logoOpacity = useSharedValue(1);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        // Move welcome content and form up
        contentOffset.value = withTiming(-event.endCoordinates.height * 0.4, {
          duration: Platform.OS === 'ios' ? 250 : 200,
          easing: Easing.out(Easing.quad),
        });
        
        // Fade out logo
        logoOpacity.value = withTiming(0, {
          duration: Platform.OS === 'ios' ? 200 : 150,
          easing: Easing.out(Easing.quad),
        });
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        // Return content to original position
        contentOffset.value = withTiming(0, {
          duration: Platform.OS === 'ios' ? 250 : 200,
          easing: Easing.out(Easing.quad),
        });
        
        // Fade in logo
        logoOpacity.value = withTiming(1, {
          duration: Platform.OS === 'ios' ? 200 : 150,
          easing: Easing.out(Easing.quad),
        });
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentOffset.value }],
  }));

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        Alert.alert('Error', error.message || 'Failed to sign in');
      } else {
        console.log('Login successful');
        console.log(user);
        // Navigation should happen automatically from RootLayoutNav once user state changes
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password screen
    console.log('Forgot password pressed');
  };

  const navigateToSignup = () => {
    router.push('/(auth)/signup');
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
        {/* Logo - Fades out */}
        <AnimatedStack 
          alignItems="center" 
          marginBottom="$10"
          style={logoAnimatedStyle}
        >
          <Logo width={200} height={67} color="#363636" />
        </AnimatedStack>

        {/* Welcome Content + Form - Move up together */}
        <AnimatedStack 
          style={contentAnimatedStyle}
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
              Welcome Back!
            </Text>
            
            <Text 
              fontSize={20} 
              color="#363636" 
              opacity={0.7}
              fontFamily="Baloo2Regular"
              lineHeight="$6"
            >
              Enter your email and password to sign in to your account.
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
                onSubmitEditing={handleSignIn}
                autoComplete="password"
              />
            </Stack>

            {/* Sign In Button */}
            <Stack marginTop="$4">
              <TouchableOpacity onPress={handleSignIn} disabled={isLoading}>
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
                      Sign In
                    </Text>
                  )}
                </Stack>
              </TouchableOpacity>
            </Stack>

            {/* Sign Up Link */}
            <Stack alignItems="center" marginBottom={40}>
              <Stack flexDirection="row" gap={4}>
                <Text 
                  fontSize={14}
                  color="#363636"
                  opacity={0.7}
                  fontFamily="Baloo2Regular"
                >
                  Don't have an account?
                </Text>
                <TouchableOpacity onPress={navigateToSignup}>
                  <Text 
                    fontSize={14}
                    color="#363636"
                    fontWeight="500"
                    textDecorationLine="underline"
                    fontFamily="Baloo2Medium"
                  >
                    SignUp
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