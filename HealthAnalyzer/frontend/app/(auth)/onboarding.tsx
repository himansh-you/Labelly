import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity } from 'react-native';
import { Stack, Text } from '@tamagui/core';
import { useRouter } from 'expo-router';
import { Logo } from '@/components/Logo';

export default function OnboardingScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/(auth)/auth');
  };

  return (
    <>
      <StatusBar style="dark" backgroundColor="#FDFAF6" />
      <Stack 
        flex={1} 
        backgroundColor="#FDFAF6" 
        paddingHorizontal="$4"
      >
        {/* Main content - centered */}
        <Stack 
          flex={1}
          alignItems="center" 
          justifyContent="center"
        >
          <Stack alignItems="center" space="$3">
            <Logo width={330} height={110} color="#363636" />
            
            <Stack alignItems="center" space="$1">
              <Text 
                fontSize={28}
                fontWeight="200" 
                color="#363636" 
                textAlign="center"
                style={{ fontFamily: 'Baloo2Bold' }}
              >
                Know your product
              </Text>
              <Text 
                fontSize={20} 
                color="#363636" 
                textAlign="center" 
                opacity={0.7}
                maxWidth={420}
                style={{ fontFamily: 'Baloo2Regular' }}
              >
                Instantly see what's really inside any product.
              </Text>
            </Stack>
          </Stack>
        </Stack>

        {/* Button - at bottom */}
        <Stack paddingBottom="$6">
          <TouchableOpacity onPress={handleGetStarted}>
            <Stack 
              paddingHorizontal="$6"
              paddingVertical="$3"
              backgroundColor="#363636" 
              borderRadius="$12"
              alignItems="center"
            >
              <Text 
                color="#FDFAF6"
                fontWeight="600"
                fontSize={20}
                style={{ fontFamily: 'Baloo2SemiBold' }}
              >
                Get Started
              </Text>
            </Stack>
          </TouchableOpacity>
        </Stack>
      </Stack>
    </>
  );
} 