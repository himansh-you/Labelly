import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, ScrollView } from 'react-native';
import { Stack, Text, Button } from '@tamagui/core';
import { useRouter } from 'expo-router';
import { Logo } from '@/components/Logo';
import { 
  Ionicons, 
  MaterialIcons, 
  Feather,
  AntDesign 
} from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withSpring,
  runOnJS
} from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedStack = Animated.createAnimatedComponent(Stack);

// Icon components for the feature cards
const ScanIcon = () => (
  <Stack 
    width={48} 
    height={48} 
    backgroundColor="#363636" 
    borderRadius={12} 
    alignItems="center" 
    justifyContent="center"
  >
    <Ionicons name="camera-outline" size={24} color="white" />
  </Stack>
);

const ChatIcon = () => (
  <Stack 
    width={48} 
    height={48} 
    backgroundColor="#363636" 
    borderRadius={12} 
    alignItems="center" 
    justifyContent="center"
  >
    <Ionicons name="chatbubble-outline" size={24} color="white" />
  </Stack>
);

const HistoryIcon = () => (
  <Stack 
    width={48} 
    height={48} 
    backgroundColor="#363636" 
    borderRadius={12} 
    alignItems="center" 
    justifyContent="center"
  >
    <Ionicons name="time-outline" size={24} color="white" />
  </Stack>
);

const CompareIcon = () => (
  <Stack 
    width={48} 
    height={48} 
    backgroundColor="#363636" 
    borderRadius={12} 
    alignItems="center" 
    justifyContent="center"
  >
    <MaterialIcons name="compare-arrows" size={24} color="white" />
  </Stack>
);

// Feature Card Component with click animation and fixed height
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, onPress }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 300,
    });
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const handlePress = () => {
    runOnJS(onPress)();
  };

  return (
    <AnimatedTouchableOpacity 
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[{ flex: 1, marginHorizontal: 6, marginVertical: 8 }, animatedStyle]}
    >
      <AnimatedStack
        backgroundColor="#D3D3D3"
        borderRadius={20}
        padding="$6"
        alignItems="center"
        justifyContent="center"
        height={180}
        space="$3"
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.1}
        shadowRadius={4}
        elevation={3}
      >
        {icon}
        <Text
          fontSize={16}
          fontWeight="600"
          color="#363636"
          fontFamily="Baloo2SemiBold"
          textAlign="center"
        >
          {title}
        </Text>
        <Text
          fontSize={12}
          color="#363636"
          opacity={0.8}
          fontFamily="Baloo2Regular"
          textAlign="center"
          lineHeight={16}
          numberOfLines={2}
        >
          {description}
        </Text>
      </AnimatedStack>
    </AnimatedTouchableOpacity>
  );
};

// Bottom Navigation Component with larger scan button and filled camera
const BottomNavigation = () => {
  const router = useRouter();

  const handleScanPress = () => {
    router.push('/(app)/scan');
  };

  const handleProfilePress = () => {
    router.push('/(app)/profile');
  };

  return (
    <Stack
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      backgroundColor="white"
      borderTopWidth={1}
      borderTopColor="#E0E0E0"
      paddingTop="$4"
      paddingBottom="$8"
      paddingHorizontal="$6"
    >
      <Stack flexDirection="row" alignItems="center" justifyContent="space-around">
        {/* Home - Active */}
        <TouchableOpacity>
          <Stack alignItems="center" space="$1">
            <Ionicons name="home" size={24} color="#363636" />
            <Text fontSize={11} fontFamily="Baloo2SemiBold" color="#363636">
              Home
            </Text>
          </Stack>
        </TouchableOpacity>

        {/* Chat */}
        <TouchableOpacity>
          <Stack alignItems="center" space="$1">
            <Ionicons name="chatbubble-outline" size={24} color="#B0B0B0" />
            <Text fontSize={11} fontFamily="Baloo2Regular" color="#B0B0B0">
              Chat
            </Text>
          </Stack>
        </TouchableOpacity>

        {/* Scan (Center - Elevated) - Increased size */}
        <TouchableOpacity onPress={handleScanPress}>
          <Stack alignItems="center" marginTop={-32}>
            <Stack
              width={85}
              height={85}
              backgroundColor="#363636"
              borderRadius={42.5}
              alignItems="center"
              justifyContent="center"
              borderWidth={4}
              borderColor="white"
              shadowColor="#000"
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.3}
              shadowRadius={8}
              elevation={8}
            >
              <Ionicons name="camera" size={32} color="white" />
            </Stack>
          </Stack>
        </TouchableOpacity>

        {/* History */}
        <TouchableOpacity>
          <Stack alignItems="center" space="$1">
            <Ionicons name="time-outline" size={24} color="#B0B0B0" />
            <Text fontSize={11} fontFamily="Baloo2Regular" color="#B0B0B0">
              History
            </Text>
          </Stack>
        </TouchableOpacity>

        {/* Profile */}
        <TouchableOpacity onPress={handleProfilePress}>
          <Stack alignItems="center" space="$1">
            <Ionicons name="person-outline" size={24} color="#B0B0B0" />
            <Text fontSize={11} fontFamily="Baloo2Regular" color="#B0B0B0">
              Profile
            </Text>
          </Stack>
        </TouchableOpacity>
      </Stack>
    </Stack>
  );
};

export default function HomeScreen() {
  const router = useRouter();

  const handleProductScan = () => {
    console.log('Product Scanner pressed');
    router.push('/(app)/scan');
  };

  const handleChatBot = () => {
    console.log('ChatBot pressed');
    router.push('/(app)/chatbot');
  };

  const handleHistory = () => {
    console.log('History pressed');
    // Navigate to history screen when available
  };

  const handleCompare = () => {
    console.log('Compare pressed');
    // Navigate to compare screen when available
  };

  return (
    <>
      <StatusBar style="dark" backgroundColor="#FDFAF6" />
      <Stack flex={1} backgroundColor="#FDFAF6">
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <Stack flex={1} paddingHorizontal="$5" paddingTop="$16" paddingBottom={120}>
            {/* Original Logo - kept unchanged */}
            <Stack alignItems="center" marginBottom="$10">
              <Logo width={200} height={67} color="#363636" />
            </Stack>

            {/* Get Started Title */}
            <Stack marginBottom="$8" marginLeft="$2">
              <Text
                fontSize={32}
                fontWeight="600"
                color="#363636"
                fontFamily="Baloo2SemiBold"
              >
                Get Started
              </Text>
            </Stack>

            {/* Feature Cards Grid with animations */}
            <Stack flex={1} space="$1">
              {/* First Row */}
              <Stack flexDirection="row" marginBottom="$2">
                <FeatureCard
                  icon={<ScanIcon />}
                  title="Product Scanner"
                  description="Analyze your product and in seconds"
                  onPress={handleProductScan}
                />
                <FeatureCard
                  icon={<ChatIcon />}
                  title="ChatBot"
                  description="Get your questions answered with SONAR"
                  onPress={handleChatBot}
                />
              </Stack>

              {/* Second Row */}
              <Stack flexDirection="row">
                <FeatureCard
                  icon={<HistoryIcon />}
                  title="History"
                  description="Re-visit your last scans"
                  onPress={handleHistory}
                />
                <FeatureCard
                  icon={<CompareIcon />}
                  title="Compare"
                  description="Get to know the better product"
                  onPress={handleCompare}
                />
              </Stack>
            </Stack>
          </Stack>
        </ScrollView>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </Stack>
    </>
  );
} 