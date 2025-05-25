import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, ScrollView } from 'react-native';
import { Stack, Text } from '@tamagui/core';
import { useRouter } from 'expo-router';
import { Logo } from '../components';
import { 
  Ionicons, 
  MaterialIcons, 
  Feather,
  AntDesign 
} from '@expo/vector-icons';

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
    <Ionicons name="camera" size={24} color="white" />
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
    <Ionicons name="chatbubble" size={24} color="white" />
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
    <Ionicons name="time" size={24} color="white" />
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

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, onPress }) => (
  <TouchableOpacity onPress={onPress} style={{ flex: 1, margin: 8 }}>
    <Stack
      backgroundColor="#E5E5E5"
      borderRadius={16}
      padding="$6"
      alignItems="center"
      justifyContent="center"
      minHeight={160}
      space="$3"
    >
      {icon}
      <Text
        fontSize={18}
        fontWeight="600"
        color="#363636"
        fontFamily="Baloo2SemiBold"
        textAlign="center"
      >
        {title}
      </Text>
      <Text
        fontSize={14}
        color="#363636"
        opacity={0.8}
        fontFamily="Baloo2Regular"
        textAlign="center"
        lineHeight="$4"
      >
        {description}
      </Text>
    </Stack>
  </TouchableOpacity>
);

// Original Bottom Navigation Component
const BottomNavigation = () => {
  const router = useRouter();

  return (
    <Stack
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      backgroundColor="white"
      borderTopWidth={1}
      borderTopColor="#E5E5E5"
      paddingTop="$3"
      paddingBottom="$6"
      paddingHorizontal="$4"
    >
      <Stack flexDirection="row" alignItems="center" justifyContent="space-between">
        {/* Home */}
        <TouchableOpacity>
          <Stack alignItems="center" space="$1">
            <Ionicons name="home" size={24} color="#363636" />
            <Text fontSize={12} fontFamily="Baloo2Medium" color="#363636">
              Home
            </Text>
          </Stack>
        </TouchableOpacity>

        {/* Chat */}
        <TouchableOpacity>
          <Stack alignItems="center" space="$1">
            <Ionicons name="chatbubble-outline" size={24} color="#999" />
            <Text fontSize={12} fontFamily="Baloo2Regular" color="#999" opacity={0.6}>
              Chat
            </Text>
          </Stack>
        </TouchableOpacity>

        {/* Scan (Center - Elevated) */}
        <TouchableOpacity>
          <Stack alignItems="center" marginTop={-25}>
            <Stack
              width={80}
              height={80}
              backgroundColor="#363636"
              borderRadius={40}
              alignItems="center"
              justifyContent="center"
              borderWidth={5}
              borderColor="white"
              shadowColor="#000000"
              shadowOffset={{
                width: 0,
                height: 15,
              }}
              shadowOpacity={1}
              shadowRadius={25}
            >
              <Ionicons name="camera" size={32} color="white" />
            </Stack>
          </Stack>
        </TouchableOpacity>

        {/* History */}
        <TouchableOpacity>
          <Stack alignItems="center" space="$1">
            <Ionicons name="time-outline" size={24} color="#999" />
            <Text fontSize={12} fontFamily="Baloo2Regular" color="#999" opacity={0.6}>
              History
            </Text>
          </Stack>
        </TouchableOpacity>

        {/* Profile */}
        <TouchableOpacity>
          <Stack alignItems="center" space="$1">
            <Ionicons name="person-outline" size={24} color="#999" />
            <Text fontSize={12} fontFamily="Baloo2Regular" color="#999" opacity={0.6}>
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
    // Navigate to scanner screen
  };

  const handleChatBot = () => {
    console.log('ChatBot pressed');
    // Navigate to chatbot screen
  };

  const handleHistory = () => {
    console.log('History pressed');
    // Navigate to history screen
  };

  const handleCompare = () => {
    console.log('Compare pressed');
    // Navigate to compare screen
  };

  return (
    <>
      <StatusBar style="dark" backgroundColor="#FDFAF6" />
      <Stack flex={1} backgroundColor="$background">
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <Stack flex={1} paddingHorizontal="$6" paddingTop="$12" paddingBottom={100}>
            {/* Logo */}
            <Stack alignItems="center" marginBottom="$8">
              <Logo width={200} height={67} color="#363636" />
            </Stack>

            {/* Get Started Title */}
            <Stack marginBottom="$6">
              <Text
                fontSize={28}
                fontWeight="600"
                color="#363636"
                fontFamily="Baloo2SemiBold"
              >
                Get Started
              </Text>
            </Stack>

            {/* Feature Cards Grid */}
            <Stack flex={1} space="$2">
              {/* First Row */}
              <Stack flexDirection="row">
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

        {/* Original Bottom Navigation */}
        <BottomNavigation />
      </Stack>
    </>
  );
} 