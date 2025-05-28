import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, ScrollView, Image, ActivityIndicator, TextInput } from 'react-native';
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
import { useAuth } from '@/context/AuthContext';
import { getUserHistory, HistoryItem } from '@/lib/firestore';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedStack = Animated.createAnimatedComponent(Stack);

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

  const formatDate = (timestamp: any) => {
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
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
                <Ionicons name="nutrition-outline" size={24} color="#363636" />
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
                    {item.productName}
                  </Text>
                  <Text
                    fontSize={14}
                    color="#666"
                    fontFamily="Baloo2Regular"
                    marginTop="$1"
                    numberOfLines={2}
                  >
                    {item.composition}
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
                    {item.safetyScore}
                  </Text>
                </Stack>
              </Stack>

              <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
                <Text
                  fontSize={12}
                  color="#B0B0B0"
                  fontFamily="Baloo2Regular"
                >
                  Scanned: {formatDate(item.scanTimestamp)}
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
                      View Details →
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
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user history
  useEffect(() => {
    async function loadHistory() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const history = await getUserHistory(user.uid);
        setHistoryData(history);
      } catch (err) {
        console.error('Error loading history:', err);
        setError('Failed to load history');
      } finally {
        setIsLoading(false);
      }
    }

    loadHistory();
  }, [user]);

  const handleBack = () => {
    router.back();
  };

  const handleItemPress = (item: HistoryItem) => {
    console.log('History item pressed:', item.productName);
    // Navigate to result screen with the scan data
    router.push(`/(app)/result?scanId=${item.id}`);
  };

  const filteredHistory = historyData.filter(item =>
    item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.composition && item.composition.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Loading state
  if (isLoading) {
    return (
      <>
        <StatusBar style="dark" backgroundColor="#FDFAF6" />
        <Stack flex={1} backgroundColor="#FDFAF6" alignItems="center" justifyContent="center">
          <ActivityIndicator size="large" color="#363636" />
          <Text marginTop="$4" fontSize={16} color="#666" fontFamily="Baloo2Regular">
            Loading your history...
          </Text>
        </Stack>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <StatusBar style="dark" backgroundColor="#FDFAF6" />
        <Stack flex={1} backgroundColor="#FDFAF6" alignItems="center" justifyContent="center" padding="$6">
          <Ionicons name="alert-circle" size={48} color="#F44336" />
          <Text marginTop="$4" fontSize={18} color="#F44336" fontFamily="Baloo2SemiBold" textAlign="center">
            {error}
          </Text>
          <TouchableOpacity onPress={() => window.location.reload()} style={{ marginTop: 16 }}>
            <Text fontSize={14} color="#363636" fontFamily="Baloo2Medium">
              Tap to retry
            </Text>
          </TouchableOpacity>
        </Stack>
      </>
    );
  }

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
              {historyData.length} scanned products
            </Text>
          </Stack>

          {/* Search Bar */}
          <Stack
            backgroundColor="white"
            borderRadius="$4"
            paddingHorizontal="$4"
            paddingVertical="$3"
            borderWidth={1}
            borderColor="#E0E0E0"
            flexDirection="row"
            alignItems="center"
            space="$3"
          >
            <Ionicons name="search" size={20} color="#B0B0B0" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search products..."
              style={{
                flex: 1,
                fontSize: 16,
                fontFamily: 'Baloo2Regular',
                color: '#363636'
              }}
              placeholderTextColor="#B0B0B0"
            />
          </Stack>
        </Stack>

        {/* Content */}
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
            ) : historyData.length === 0 ? (
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
            ) : (
              <Stack alignItems="center" paddingTop="$10">
                <Ionicons name="search" size={40} color="#B0B0B0" />
                <Text
                  fontSize={18}
                  color="#666"
                  fontFamily="Baloo2SemiBold"
                  textAlign="center"
                  marginTop="$4"
                >
                  No results found
                </Text>
                <Text
                  fontSize={14}
                  color="#B0B0B0"
                  fontFamily="Baloo2Regular"
                  textAlign="center"
                  marginTop="$2"
                >
                  Try a different search term
                </Text>
              </Stack>
            )}
          </Stack>
        </ScrollView>
      </Stack>
    </>
  );
} 