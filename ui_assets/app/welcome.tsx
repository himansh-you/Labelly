import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, Image } from 'react-native';
import { Stack, Text } from '@tamagui/core';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  Easing 
} from 'react-native-reanimated';

const AnimatedStack = Animated.createAnimatedComponent(Stack);

export default function WelcomeScreen() {
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

  const handleScanPress = () => {
    // Navigate to scan screen (we'll create this later)
    router.push('/scan');
  };

  return (
    <>
      <StatusBar style="dark" backgroundColor="#FDFAF6" />
      <Stack 
        flex={1} 
        backgroundColor="$background" 
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
                color="$color" 
                textAlign="center"
                fontFamily="Baloo2Bold"
              >
                Welcome!
              </Text>
              
              <Text 
                fontSize={20} 
                color="$color" 
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
                color="$color" 
                textAlign="center"
                fontFamily="Baloo2Bold"
                textDecorationLine="underline"
              >
                How it Works?
              </Text>
            </Stack>

            {/* Illustration - Your Welcome Screen Image */}
            <Stack alignItems="center" justifyContent="center" marginTop="$8">
              <Image 
                source={require('../assets/images/welcome_screen.png')}
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
            <TouchableOpacity onPress={() => router.push('/home')}>
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