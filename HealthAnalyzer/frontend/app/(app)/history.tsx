import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, ScrollView, Image } from 'react-native';
import { Stack, Text } from '@tamagui/core';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  runOnJS,
  FadeInDown
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedStack = Animated.createAnimatedComponent(Stack);

interface HistoryItem {
  id: string;
  name: string;
  composition: string;
  scanDate: Date;
  safetyScore: number;
  imageUri?: string;
}

// Sample history data - replace with real data later
const historyData: HistoryItem[] = [
  {
    id: '1',
    name: 'Calcite',
    composition: 'CaCO3',
    scanDate: new Date('2024-01-15'),
    safetyScore: 85,
    imageUri: undefined
  },
  {
    id: '2',
    name: 'Gypsum',
    composition: 'CaSO4·2H2O',
    scanDate: new Date('2024-01-14'),
    safetyScore: 92,
    imageUri: undefined
  },
  {
    id: '3',
    name: 'Kyanite',
    composition: 'Al2SiO5',
    scanDate: new Date('2024-01-13'),
    safetyScore: 78,
    imageUri: undefined
  },
  {
    id: '4',
    name: 'Barite',
    composition: 'BaSO4',
    scanDate: new Date('2024-01-12'),
    safetyScore: 95,
    imageUri: undefined
  },
  {
    id: '5',
    name: 'Basalt',
    composition: 'SiO2',
    scanDate: new Date('2024-01-11'),
    safetyScore: 88,
    imageUri: undefined
  }
];

// History Item Card Component
interface HistoryCardProps {
  item: HistoryItem;
  onPress: () => void;
  index: number;
}

const HistoryCard: React.FC<HistoryCardProps> = ({ item, onPress, index }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, {
      damping: 15,
      stiffness: 300,
    });
    opacity.value = 0.8;
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
    opacity.value = 1;
  };

  const handlePress = () => {
    runOnJS(onPress)();
  };

  const getSafetyColor = (score: number) => {
    if (score >= 90) return '#4CAF50'; // Green
    if (score >= 75) return '#FFC107'; // Yellow
    if (score >= 60) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <AnimatedStack
      entering={FadeInDown.delay(index * 100)}
      style={animatedStyle}
    >
      <AnimatedTouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ marginHorizontal: 20, marginBottom: 16 }}
      >
        <Stack
          backgroundColor="white"
          borderRadius="$4"
          padding="$4"
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={4}
          elevation={3}
          borderWidth={1}
          borderColor="#F0F0F0"
        >
          <Stack flexDirection="row" alignItems="center" space="$3">
            {/* Product Image Placeholder */}
            <Stack
              width={60}
              height={60}
              backgroundColor="#D3D3D3"
              borderRadius="$3"
              alignItems="center"
              justifyContent="center"
            >
              {item.imageUri ? (
                <Image 
                  source={{ uri: item.imageUri }} 
                  style={{ width: 60, height: 60, borderRadius: 12 }}
                />
              ) : (
                <Ionicons name="cube-outline" size={24} color="#363636" />
              )}
            </Stack>

            {/* Content */}
            <Stack flex={1} space="$2">
              <Stack flexDirection="row" justifyContent="space-between" alignItems="flex-start">
                <Stack flex={1}>
                  <Text
                    fontSize={18}
                    fontWeight="600"
                    color="#363636"
                    fontFamily="Baloo2SemiBold"
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text
                    fontSize={14}
                    color="#666"
                    fontFamily="Baloo2Regular"
                    marginTop="$1"
                  >
                    Composition: {item.composition}
                  </Text>
                </Stack>

                {/* Safety Score Badge */}
                <Stack
                  backgroundColor={getSafetyColor(item.safetyScore)}
                  borderRadius="$6"
                  paddingHorizontal="$3"
                  paddingVertical="$1"
                  marginLeft="$2"
                >
                  <Text
                    fontSize={12}
                    fontWeight="600"
                    color="white"
                    fontFamily="Baloo2SemiBold"
                  >
                    {item.safetyScore}%
                  </Text>
                </Stack>
              </Stack>

              <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
                <Text
                  fontSize={12}
                  color="#B0B0B0"
                  fontFamily="Baloo2Regular"
                >
                  Scanned: {formatDate(item.scanDate)}
                </Text>
                
                <TouchableOpacity>
                  <Stack
                    backgroundColor="#F8F8F8"
                    borderRadius="$3"
                    paddingHorizontal="$3"
                    paddingVertical="$1.5"
                    borderWidth={1}
                    borderColor="#E0E0E0"
                  >
                    <Text
                      fontSize={12}
                      fontWeight="500"
                      color="#363636"
                      fontFamily="Baloo2Medium"
                    >
                      Other Details →
                    </Text>
                  </Stack>
                </TouchableOpacity>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </AnimatedTouchableOpacity>
    </AnimatedStack>
  );
};

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  const handleBack = () => {
    router.back();
  };

  const handleItemPress = (item: HistoryItem) => {
    console.log('History item pressed:', item.name);
    // Navigate to detailed view or re-analyze
    // router.push(`/(app)/result?itemId=${item.id}`);
  };

  const filteredHistory = historyData.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.composition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <StatusBar style="dark" backgroundColor="#FDFAF6" />
      <Stack flex={1} backgroundColor="#FDFAF6">
        {/* Header */}
        <Stack paddingHorizontal="$5" paddingTop={insets.top + 20} paddingBottom="$4">
          {/* Back Button */}
          <Stack marginBottom="$6">
            <TouchableOpacity onPress={handleBack}>
              <Stack flexDirection="row" alignItems="center" paddingVertical="$2">
                <Ionicons name="arrow-back" size={24} color="#363636" />
                <Text 
                  fontSize={18} 
                  fontFamily="Baloo2SemiBold" 
                  color="#363636"
                  marginLeft="$2"
                >
                  Back
                </Text>
              </Stack>
            </TouchableOpacity>
          </Stack>

          {/* Title */}
          <Stack marginBottom="$4">
            <Text
              fontSize={32}
              fontWeight="600"
              color="#363636"
              fontFamily="Baloo2SemiBold"
            >
              My History
            </Text>
            <Text
              fontSize={16}
              color="#B0B0B0"
              fontFamily="Baloo2Regular"
              marginTop="$1"
            >
              Your scan history and saved items
            </Text>
          </Stack>

          {/* Search Bar */}
          <Stack
            backgroundColor="white"
            borderRadius="$4"
            paddingHorizontal="$4"
            paddingVertical="$3"
            flexDirection="row"
            alignItems="center"
            borderWidth={1}
            borderColor="#E0E0E0"
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 1 }}
            shadowOpacity={0.05}
            shadowRadius={2}
            elevation={1}
          >
            <Ionicons name="search" size={20} color="#B0B0B0" />
            <Text
              flex={1}
              fontSize={16}
              fontFamily="Baloo2Regular"
              color="#B0B0B0"
              marginLeft="$2"
            >
              Search your collections...
            </Text>
          </Stack>
        </Stack>

        {/* History List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <Stack paddingTop="$2">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item, index) => (
                <HistoryCard
                  key={item.id}
                  item={item}
                  onPress={() => handleItemPress(item)}
                  index={index}
                />
              ))
            ) : (
              <Stack alignItems="center" paddingTop="$10">
                <Stack
                  width={80}
                  height={80}
                  backgroundColor="#D3D3D3"
                  borderRadius={40}
                  alignItems="center"
                  justifyContent="center"
                  marginBottom="$4"
                >
                  <Ionicons name="time-outline" size={40} color="#B0B0B0" />
                </Stack>
                <Text
                  fontSize={20}
                  fontWeight="600"
                  color="#363636"
                  fontFamily="Baloo2SemiBold"
                  textAlign="center"
                  marginBottom="$2"
                >
                  No History Yet
                </Text>
                <Text
                  fontSize={16}
                  color="#B0B0B0"
                  fontFamily="Baloo2Regular"
                  textAlign="center"
                  paddingHorizontal="$8"
                  lineHeight={22}
                >
                  Start scanning products to build your collection history
                </Text>
              </Stack>
            )}
          </Stack>
        </ScrollView>
      </Stack>
    </>
  );
} 