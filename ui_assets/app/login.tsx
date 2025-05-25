import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, TextInput, Keyboard, Platform } from 'react-native';
import { Stack, Text } from '@tamagui/core';
import { useRouter } from 'expo-router';
import { Logo } from '../components';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  Easing 
} from 'react-native-reanimated';

const AnimatedStack = Animated.createAnimatedComponent(Stack);

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
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

  const handleSignIn = () => {
    // Handle sign in logic here
    console.log('Sign in pressed');
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password screen
    console.log('Forgot password pressed');
  };

  const handleSignUp = () => {
    // Navigate to sign up screen
    router.push('/signup');
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
              color="$color" 
              fontFamily="Baloo2Bold"
            >
              Welcome Back!
            </Text>
            
            <Text 
              fontSize={20} 
              color="$color" 
              opacity={0.7}
              fontFamily="Baloo2Regular"
              lineHeight="$6"
            >
              Enter your email and password to sign in to your account.
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
              />
            </Stack>

            {/* Sign In Button */}
            <Stack marginTop="$4">
              <TouchableOpacity onPress={handleSignIn}>
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
                    Sign In
                  </Text>
                </Stack>
              </TouchableOpacity>
            </Stack>

            {/* Sign Up Link */}
            <Stack alignItems="center" marginBottom={40}>
              <Stack flexDirection="row" gap={4}>
                <Text 
                  fontSize={14}
                  color="$color"
                  opacity={0.7}
                  fontFamily="Baloo2-Regular"
                >
                  Don't have an account?
                </Text>
                <TouchableOpacity onPress={() => router.push('/signup')}>
                  <Text 
                    fontSize={14}
                    color="$color"
                    fontWeight="500"
                    textDecorationLine="underline"
                    fontFamily="Baloo2-Medium"
                  >
                    Sign up
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