import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, ScrollView, Text as RNText } from 'react-native';
import { Stack, Text, Button } from '@tamagui/core';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
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
import { AnimatedButton } from '@/components/AnimatedButton';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedStack = Animated.createAnimatedComponent(Stack);

// Enhanced Feature Card Component with improved animations
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, onPress }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    shadowOpacity: shadowOpacity.value,
    elevation: shadowOpacity.value * 30,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, {
      damping: 20,
      stiffness: 400,
    });
    opacity.value = withTiming(0.9, { duration: 150 });
    shadowOpacity.value = withTiming(0.05, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 18,
      stiffness: 350,
    });
    opacity.value = withTiming(1, { duration: 200 });
    shadowOpacity.value = withTiming(0.15, { duration: 200 });
  };

  const handlePress = () => {
    scale.value = withSpring(0.98, {
      damping: 25,
      stiffness: 500,
    });
    
    setTimeout(() => {
      scale.value = withSpring(1, {
        damping: 18,
        stiffness: 350,
      });
    }, 100);
    
    runOnJS(onPress)();
  };

  return (
    <AnimatedTouchableOpacity 
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        { 
          flex: 1, 
          marginHorizontal: 6, 
          marginVertical: 8 
        }, 
        animatedStyle
      ]}
      activeOpacity={1}
    >
      <AnimatedStack
        style={[
          {
            backgroundColor: "#D3D3D3",
            borderRadius: 20,
            padding: 24,
            alignItems: "center",
            justifyContent: "center",
            height: 180,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 8,
          },
          shadowStyle
        ]}
      >
        {/* Icon with subtle animation */}
        <AnimatedStack
          style={{
            marginBottom: 12,
            transform: [{ scale: scale.value * 0.98 + 0.02 }] // Subtle icon scaling
          }}
        >
          {icon}
        </AnimatedStack>

        <Text
          fontSize={16}
          fontWeight="600"
          color="#363636"
          fontFamily="Baloo2SemiBold"
          textAlign="center"
          marginBottom="$2"
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

// Enhanced Icon components with subtle hover states
const ScanIcon = () => {
  const iconScale = useSharedValue(1);
  
  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <AnimatedStack 
      style={[
        {
          width: 48, 
          height: 48, 
          backgroundColor: "#363636", 
          borderRadius: 12, 
          alignItems: "center", 
          justifyContent: "center"
        },
        iconAnimatedStyle
      ]}
    >
      <Ionicons name="camera-outline" size={24} color="white" />
    </AnimatedStack>
  );
};

const ChatIcon = () => {
  const iconScale = useSharedValue(1);
  
  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <AnimatedStack 
      style={[
        {
          width: 48, 
          height: 48, 
          backgroundColor: "#363636", 
          borderRadius: 12, 
          alignItems: "center", 
          justifyContent: "center"
        },
        iconAnimatedStyle
      ]}
    >
      <Ionicons name="chatbubble-outline" size={24} color="white" />
    </AnimatedStack>
  );
};

const HistoryIcon = () => {
  const iconScale = useSharedValue(1);
  
  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <AnimatedStack 
      style={[
        {
          width: 48, 
          height: 48, 
          backgroundColor: "#363636", 
          borderRadius: 12, 
          alignItems: "center", 
          justifyContent: "center"
        },
        iconAnimatedStyle
      ]}
    >
      <Ionicons name="time-outline" size={24} color="white" />
    </AnimatedStack>
  );
};

const CompareIcon = () => {
  const iconScale = useSharedValue(1);
  
  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <AnimatedStack 
      style={[
        {
          width: 48, 
          height: 48, 
          backgroundColor: "#363636", 
          borderRadius: 12, 
          alignItems: "center", 
          justifyContent: "center"
        },
        iconAnimatedStyle
      ]}
    >
      <MaterialIcons name="compare-arrows" size={24} color="white" />
    </AnimatedStack>
  );
};

// Bottom Navigation Component with FUNCTIONAL HISTORY BUTTON
const BottomNavigation = () => {
  const router = useRouter();

  const handleScanPress = () => {
    router.push('/(app)/scan?directCamera=true');
  };

  const handleChatPress = () => {
    router.push('/(app)/chatbot');
  };

  const handleHistoryPress = () => {
    router.push('/(app)/history');
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
      paddingTop="$2"
      paddingBottom="$4"
      paddingHorizontal="$6"
    >
      <Stack flexDirection="row" alignItems="center" justifyContent="space-around">
        {/* Home - Active */}
        <TouchableOpacity activeOpacity={0.7}>
          <Stack alignItems="center" space="$0.5">
            <Ionicons name="home" size={22} color="#363636" />
            <RNText style={{
              fontSize: 10,
              fontFamily: "Baloo2SemiBold",
              color: "#363636",
              textAlign: "center"
            }}>
              Home
            </RNText>
          </Stack>
        </TouchableOpacity>

        {/* Chat */}
        <TouchableOpacity onPress={handleChatPress} activeOpacity={0.7}>
          <Stack alignItems="center" space="$0.5">
            <Ionicons name="chatbubble-outline" size={22} color="#B0B0B0" />
            <RNText style={{
              fontSize: 10,
              fontFamily: "Baloo2Regular",
              color: "#B0B0B0",
              textAlign: "center"
            }}>
              Chat
            </RNText>
          </Stack>
        </TouchableOpacity>

        {/* Scan (Center - MUCH LARGER like reference) */}
        <TouchableOpacity 
          onPress={handleScanPress}
          activeOpacity={0.8}
        >
          <Stack 
            backgroundColor="#363636" 
            width={85}
            height={85}
            borderRadius={42.5}
            alignItems="center" 
            justifyContent="center"
            marginTop={-20}
            borderWidth={5}
            borderColor="white"
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 6 }}
            shadowOpacity={0.25}
            shadowRadius={10}
            elevation={15}
          >
            <Ionicons name="camera" size={36} color="white" />
          </Stack>
        </TouchableOpacity>

        {/* History - NOW FUNCTIONAL */}
        <TouchableOpacity onPress={handleHistoryPress} activeOpacity={0.7}>
          <Stack alignItems="center" space="$0.5">
            <Ionicons name="time-outline" size={22} color="#B0B0B0" />
            <RNText style={{
              fontSize: 10,
              fontFamily: "Baloo2Regular",
              color: "#B0B0B0",
              textAlign: "center"
            }}>
              History
            </RNText>
          </Stack>
        </TouchableOpacity>

        {/* Profile */}
        <TouchableOpacity onPress={handleProfilePress} activeOpacity={0.7}>
          <Stack alignItems="center" space="$0.5">
            <Ionicons name="person-outline" size={22} color="#B0B0B0" />
            <RNText style={{
              fontSize: 10,
              fontFamily: "Baloo2Regular",
              color: "#B0B0B0",
              textAlign: "center"
            }}>
              Profile
            </RNText>
          </Stack>
        </TouchableOpacity>
      </Stack>
    </Stack>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // Function to get user's first name for greeting
  const getUserFirstName = () => {
    if (user?.displayName) {
      // Extract first name from display name
      return user.displayName.split(' ')[0];
    }
    if (user?.email) {
      // Extract name from email (before @)
      return user.email.split('@')[0];
    }
    return 'there'; // Fallback greeting
  };

  const handleProductScan = () => {
    console.log('Product Scanner pressed');
    router.push('/(app)/scan?directCamera=true');
  };

  const handleChatBot = () => {
    console.log('ChatBot pressed');
    router.push('/(app)/chatbot');
  };

  const handleHistory = () => {
    console.log('History pressed');
    router.push('/(app)/history');
  };

  const handleCompare = () => {
    console.log('Compare pressed');
    router.push('/(app)/compare');
  };

  return (
    <>
      <StatusBar style="dark" backgroundColor="#FDFAF6" />
      <Stack flex={1} backgroundColor="#FDFAF6">
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <Stack flex={1} paddingHorizontal="$5" paddingTop="$16" paddingBottom={90}>
            {/* Original Logo - kept unchanged */}
            <Stack alignItems="center" marginBottom="$10">
              <Logo width={200} height={67} color="#363636" />
            </Stack>

            {/* Personalized Greeting Title */}
            <Stack marginBottom="$8" marginLeft="$2">
              <Text
                fontSize={32}
                fontWeight="600"
                color="#363636"
                fontFamily="Baloo2SemiBold"
              >
                Hi! {getUserFirstName()}
              </Text>
            </Stack>

            {/* Feature Cards Grid with enhanced animations */}
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