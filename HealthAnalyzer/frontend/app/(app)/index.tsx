import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, Image } from 'react-native';
import { Stack, Text } from '@tamagui/core';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  Easing 
} from 'react-native-reanimated';

const AnimatedStack = Animated.createAnimatedComponent(Stack);

export default function WelcomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const fadeIn = useSharedValue(0);

  React.useEffect(() => {
    fadeIn.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.quad),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  const handleAllDone = () => {
    // Navigate to home page
    router.replace('/(app)/home');
  };

  return (
    <>
      <StatusBar style="dark" backgroundColor="#FDFAF6" />
      <Stack 
        flex={1} 
        backgroundColor="#FDFAF6" 
        paddingHorizontal="$4"
      >
        <AnimatedStack style={animatedStyle} flex={1}>
          {/* Main content - centered */}
          <Stack 
            flex={1}
            alignItems="center" 
            justifyContent="center"
          >
            {/* Header Content */}
            <Stack space="$1" alignItems="center">
              <Text 
                fontSize={28}
                fontWeight="200" 
                color="#363636" 
                textAlign="center"
                fontFamily="Baloo2Bold"
              >
                Welcome{user ? `, ${user.email?.split('@')[0]}` : ''}!
              </Text>
              
              <Text 
                fontSize={20} 
                color="#363636" 
                textAlign="center" 
                opacity={0.7}
                maxWidth={420}
                fontFamily="Baloo2Regular"
              >
                Labelly empowers you to understand your product ingredients, enabling you to make informed decisions and choose wisely.
              </Text>

              <Text 
                fontSize={20}
                fontWeight="200" 
                color="#363636" 
                textAlign="center"
                fontFamily="Baloo2Bold"
                textDecorationLine="underline"
              >
                How it Works?
              </Text>
            </Stack>

            {/* Illustration - Welcome Screen Image */}
            <Stack alignItems="center" justifyContent="center" marginTop="$8">
              <Image 
                source={require('../../assets/images/welcome_screen.png')}
                style={{
                  width: 400,
                  height: 300,
                  resizeMode: 'contain'
                }}
              />
            </Stack>
          </Stack>

          {/* All Done Button */}
          <Stack 
            position="absolute"
            bottom={40}
            left={20}
            right={20}
          >
            <TouchableOpacity onPress={handleAllDone}>
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
                  fontSize={18}
                  fontFamily="Baloo2SemiBold"
                >
                  All Done!
                </Text>
              </Stack>
            </TouchableOpacity>
          </Stack>
        </AnimatedStack>
      </Stack>
    </>
  );
} 