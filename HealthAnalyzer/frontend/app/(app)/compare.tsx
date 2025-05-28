import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { Stack, Text, XStack, YStack } from 'tamagui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  runOnJS,
  FadeInDown,
  FadeInUp,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { getUserHistory, HistoryItem, ScanData, getScanById } from '@/lib/firestore';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedStack = Animated.createAnimatedComponent(Stack);

// Types for parsed analysis result
interface AnalysisResult {
  product_name: string;
  safety_score: string;
  ingredients_summary: string;
  ingredient_categories: {
    safe: { percentage: string; ingredients: string[]; details: any[] };
    low_risk: { percentage: string; ingredients: string[]; details: any[] };
    not_great: { percentage: string; ingredients: string[]; details: any[] };
    dangerous: { percentage: string; ingredients: string[]; details: any[] };
  };
  allergen_additive_warnings: string[];
  product_summary: string;
}

interface ComparisonProduct {
  id: string;
  name: string;
  safetyScore: number;
  imageUri?: string;
  analysisData: AnalysisResult;
  scanData: ScanData;
}

// Enhanced Animated Button Component
interface AnimatedButtonProps {
  onPress: () => void;
  disabled?: boolean;
  backgroundColor: string;
  children: React.ReactNode;
  borderColor?: string;
  variant?: 'primary' | 'secondary';
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ 
  onPress, 
  disabled = false, 
  backgroundColor, 
  children, 
  borderColor,
  variant = 'primary'
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.15);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    shadowOpacity: shadowOpacity.value,
    elevation: shadowOpacity.value * 20,
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
    if (!disabled) {
      runOnJS(onPress)();
    }
  };

  return (
    <AnimatedTouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        {
          borderRadius: 16,
          paddingVertical: 16,
          paddingHorizontal: 24,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor,
          borderWidth: borderColor ? 2 : 0,
          borderColor: borderColor || 'transparent',
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 8,
          minHeight: 56,
          width: '100%',
        },
        animatedStyle,
        shadowStyle,
        disabled && { opacity: 0.6 }
      ]}
      activeOpacity={1}
    >
      {children}
    </AnimatedTouchableOpacity>
  );
};

// Product Selection Card Component
const ProductSelectionCard: React.FC<{
  item: HistoryItem;
  onPress: () => void;
  index: number;
  isSelected: boolean;
}> = ({ item, onPress, index, isSelected }) => {
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
    scale.value = withSpring(0.98, {
      damping: 20,
      stiffness: 400,
    });
    opacity.value = withTiming(0.9, { duration: 150 });
    shadowOpacity.value = withTiming(0.03, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 18,
      stiffness: 350,
    });
    opacity.value = withTiming(1, { duration: 200 });
    shadowOpacity.value = withTiming(0.1, { duration: 200 });
  };

  const handlePress = () => {
    runOnJS(onPress)();
  };

  const getSafetyColor = (score: number) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 75) return '#FFC107';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  return (
    <AnimatedStack
      entering={FadeInDown.delay(index * 100)}
      style={[animatedStyle, shadowStyle]}
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
          shadowRadius={4}
          borderWidth={isSelected ? 2 : 1}
          borderColor={isSelected ? "#4CAF50" : "#F0F0F0"}
        >
          <XStack alignItems="center" space="$3">
            {/* Selection Indicator */}
            <Stack
              width={24}
              height={24}
              borderRadius={12}
              backgroundColor={isSelected ? "#4CAF50" : "transparent"}
              borderWidth={2}
              borderColor={isSelected ? "#4CAF50" : "#CCC"}
              alignItems="center"
              justifyContent="center"
            >
              {isSelected && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </Stack>

            {/* Product Image */}
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
              <XStack justifyContent="space-between" alignItems="flex-start">
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
                    numberOfLines={2}
                  >
                    {item.composition || 'No composition available'}
                  </Text>
                </Stack>
                
                <Stack
                  backgroundColor={getSafetyColor(item.safetyScore)}
                  borderRadius="$2"
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  marginLeft="$2"
                >
                  <Text
                    fontSize={12}
                    color="white"
                    fontWeight="600"
                    fontFamily="Baloo2SemiBold"
                  >
                    {item.safetyScore}/100
                  </Text>
                </Stack>
              </XStack>
            </Stack>
          </XStack>
        </Stack>
      </AnimatedTouchableOpacity>
    </AnimatedStack>
  );
};

// Comparison Result Card
const ComparisonCard: React.FC<{
  product: ComparisonProduct;
  isWinner?: boolean;
}> = ({ product, isWinner = false }) => {
  const getSafetyColor = (score: number) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 75) return '#FFC107';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const calculateCategoryCounts = (analysisData: AnalysisResult) => {
    const safeCount = analysisData.ingredient_categories.safe.ingredients.filter(ing => ing !== "None").length;
    const lowRiskCount = analysisData.ingredient_categories.low_risk.ingredients.filter(ing => ing !== "None").length;
    const notGreatCount = analysisData.ingredient_categories.not_great.ingredients.filter(ing => ing !== "None").length;
    const dangerousCount = analysisData.ingredient_categories.dangerous.ingredients.filter(ing => ing !== "None").length;
    
    return { safeCount, lowRiskCount, notGreatCount, dangerousCount };
  };

  const { safeCount, lowRiskCount, notGreatCount, dangerousCount } = calculateCategoryCounts(product.analysisData);

  return (
    <AnimatedStack entering={FadeInUp.delay(200)}>
      <Stack
        backgroundColor="white"
        borderRadius="$4"
        padding="$4"
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.15}
        shadowRadius={8}
        elevation={8}
        borderWidth={isWinner ? 3 : 1}
        borderColor={isWinner ? "#4CAF50" : "#F0F0F0"}
        marginBottom="$4"
      >
        {/* Winner Badge */}
        {isWinner && (
          <Stack
            position="absolute"
            top={-10}
            left="50%"
            marginLeft={-30}
            backgroundColor="#4CAF50"
            borderRadius="$4"
            paddingHorizontal="$3"
            paddingVertical="$1"
            zIndex={1}
          >
            <Text
              fontSize={12}
              color="white"
              fontWeight="600"
              fontFamily="Baloo2SemiBold"
              textAlign="center"
            >
              🏆 BETTER CHOICE
            </Text>
          </Stack>
        )}

        {/* Product Header */}
        <XStack space="$4" alignItems="center" marginBottom="$4">
          <Stack
            width={60}
            height={60}
            backgroundColor="#D3D3D3"
            borderRadius="$3"
            alignItems="center"
            justifyContent="center"
          >
            {product.imageUri ? (
              <Image 
                source={{ uri: product.imageUri }} 
                style={{ width: 60, height: 60, borderRadius: 12 }}
              />
            ) : (
              <Ionicons name="nutrition-outline" size={24} color="#363636" />
            )}
          </Stack>
          
          <YStack flex={1} space="$2">
            <Text
              fontSize={18}
              fontWeight="600"
              color="#363636"
              fontFamily="Baloo2SemiBold"
            >
              {product.name}
            </Text>
            <Stack
              backgroundColor={getSafetyColor(product.safetyScore)}
              borderRadius="$3"
              paddingHorizontal="$3"
              paddingVertical="$1"
              alignSelf="flex-start"
            >
              <Text
                fontSize={14}
                color="white"
                fontWeight="600"
                fontFamily="Baloo2SemiBold"
              >
                {product.safetyScore}/100
              </Text>
            </Stack>
          </YStack>
        </XStack>

        {/* Ingredients Breakdown */}
        <YStack space="$3">
          <Text
            fontSize={16}
            fontWeight="600"
            color="#363636"
            fontFamily="Baloo2SemiBold"
          >
            Ingredient Analysis
          </Text>
          
          <YStack space="$2">
            <XStack justifyContent="space-between" alignItems="center">
              <XStack alignItems="center" space="$2">
                <Stack width={12} height={12} borderRadius="$1" backgroundColor="#4CAF50" />
                <Text fontSize={14} color="#333" fontFamily="Baloo2Regular">Safe</Text>
              </XStack>
              <Text fontSize={14} color="#333" fontWeight="600" fontFamily="Baloo2SemiBold">{safeCount}</Text>
            </XStack>
            
            <XStack justifyContent="space-between" alignItems="center">
              <XStack alignItems="center" space="$2">
                <Stack width={12} height={12} borderRadius="$1" backgroundColor="#FFC107" />
                <Text fontSize={14} color="#333" fontFamily="Baloo2Regular">Low Risk</Text>
              </XStack>
              <Text fontSize={14} color="#333" fontWeight="600" fontFamily="Baloo2SemiBold">{lowRiskCount}</Text>
            </XStack>
            
            <XStack justifyContent="space-between" alignItems="center">
              <XStack alignItems="center" space="$2">
                <Stack width={12} height={12} borderRadius="$1" backgroundColor="#FF9800" />
                <Text fontSize={14} color="#333" fontFamily="Baloo2Regular">Not Great</Text>
              </XStack>
              <Text fontSize={14} color="#333" fontWeight="600" fontFamily="Baloo2SemiBold">{notGreatCount}</Text>
            </XStack>
            
            <XStack justifyContent="space-between" alignItems="center">
              <XStack alignItems="center" space="$2">
                <Stack width={12} height={12} borderRadius="$1" backgroundColor="#F44336" />
                <Text fontSize={14} color="#333" fontFamily="Baloo2Regular">Dangerous</Text>
              </XStack>
              <Text fontSize={14} color="#333" fontWeight="600" fontFamily="Baloo2SemiBold">{dangerousCount}</Text>
            </XStack>
          </YStack>
        </YStack>

        {/* Allergen Warnings */}
        {product.analysisData.allergen_additive_warnings && product.analysisData.allergen_additive_warnings.length > 0 && (
          <YStack space="$2" marginTop="$3">
            <Text
              fontSize={14}
              fontWeight="600"
              color="#F44336"
              fontFamily="Baloo2SemiBold"
            >
              ⚠️ Allergen Warnings
            </Text>
            {product.analysisData.allergen_additive_warnings.slice(0, 3).map((warning, index) => (
              <Text
                key={index}
                fontSize={12}
                color="#666"
                fontFamily="Baloo2Regular"
                lineHeight={16}
              >
                • {warning}
              </Text>
            ))}
          </YStack>
        )}
      </Stack>
    </AnimatedStack>
  );
};

export default function CompareScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { compareWith } = useLocalSearchParams<{ compareWith?: string }>();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [comparisonProducts, setComparisonProducts] = useState<ComparisonProduct[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    loadHistory();
    
    // If compareWith parameter is provided, pre-select that product
    if (compareWith) {
      setSelectedProducts([compareWith]);
    }
  }, [compareWith]);

  const loadHistory = async () => {
    if (!user) return;
    
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
  };

  const handleProductSelection = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        // Remove if already selected
        return prev.filter(id => id !== productId);
      } else if (prev.length < 2) {
        // Add if less than 2 selected
        return [...prev, productId];
      } else {
        // Replace oldest selection if 2 already selected
        return [prev[1], productId];
      }
    });
  };

  const parseAnalysisData = (scanData: ScanData): AnalysisResult => {
    try {
      const analysisContent = scanData.analysis_result?.choices?.[0]?.message?.content || '';
      const jsonMatch = analysisContent.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback structure
      return {
        product_name: "Product Analysis",
        safety_score: "75",
        ingredients_summary: analysisContent || "No analysis available",
        ingredient_categories: {
          safe: { percentage: "0%", ingredients: [], details: [] },
          low_risk: { percentage: "0%", ingredients: [], details: [] },
          not_great: { percentage: "0%", ingredients: [], details: [] },
          dangerous: { percentage: "0%", ingredients: [], details: [] }
        },
        allergen_additive_warnings: [],
        product_summary: ""
      };
    } catch (error) {
      console.error('Error parsing analysis data:', error);
      return {
        product_name: "Product Analysis",
        safety_score: "75",
        ingredients_summary: "Error parsing analysis",
        ingredient_categories: {
          safe: { percentage: "0%", ingredients: [], details: [] },
          low_risk: { percentage: "0%", ingredients: [], details: [] },
          not_great: { percentage: "0%", ingredients: [], details: [] },
          dangerous: { percentage: "0%", ingredients: [], details: [] }
        },
        allergen_additive_warnings: [],
        product_summary: ""
      };
    }
  };

  const handleCompare = async () => {
    if (selectedProducts.length !== 2) {
      Alert.alert('Selection Required', 'Please select exactly 2 products to compare.');
      return;
    }

    try {
      setIsLoading(true);
      const products: ComparisonProduct[] = [];

      for (const productId of selectedProducts) {
        const historyItem = historyData.find(item => item.id === productId);
        if (historyItem) {
          // Fetch full scan data
          const scanData = await getScanById(productId);
          const analysisData = parseAnalysisData(scanData);
          
          products.push({
            id: productId,
            name: historyItem.productName,
            safetyScore: historyItem.safetyScore,
            imageUri: historyItem.imageUri,
            analysisData,
            scanData
          });
        }
      }

      setComparisonProducts(products);
      setShowComparison(true);
    } catch (error) {
      console.error('Error preparing comparison:', error);
      Alert.alert('Error', 'Failed to load comparison data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (showComparison) {
      setShowComparison(false);
      setComparisonProducts([]);
    } else {
      router.back();
    }
  };

  const handleNewScan = () => {
    router.push('/(app)/scan?directCamera=true');
  };

  // Determine winner
  const winner = comparisonProducts.length === 2 
    ? comparisonProducts[0].safetyScore > comparisonProducts[1].safetyScore 
      ? comparisonProducts[0] 
      : comparisonProducts[1]
    : null;

  if (isLoading && !showComparison) {
    return (
      <>
        <StatusBar style="dark" backgroundColor="#FDFAF6" />
        <Stack flex={1} backgroundColor="#FDFAF6" alignItems="center" justifyContent="center">
          <ActivityIndicator size="large" color="#363636" />
          <Text marginTop="$4" fontSize={16} color="#666" fontFamily="Baloo2Regular">
            Loading products...
          </Text>
        </Stack>
      </>
    );
  }

  if (error) {
    return (
      <>
        <StatusBar style="dark" backgroundColor="#FDFAF6" />
        <Stack flex={1} backgroundColor="#FDFAF6" alignItems="center" justifyContent="center" padding="$6">
          <Ionicons name="alert-circle" size={48} color="#F44336" />
          <Text marginTop="$4" fontSize={18} color="#F44336" fontFamily="Baloo2SemiBold" textAlign="center">
            {error}
          </Text>
          <TouchableOpacity onPress={loadHistory} style={{ marginTop: 16 }}>
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
        {/* Header - Fixed styling */}
        <Stack
          paddingTop={insets.top + 20}
          paddingHorizontal="$5"
          paddingBottom="$4"
          backgroundColor="#FDFAF6"
          borderBottomWidth={1}
          borderBottomColor="rgba(54, 54, 54, 0.1)"
        >
          <XStack alignItems="center" justifyContent="space-between">
            <TouchableOpacity onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="#363636" />
            </TouchableOpacity>
            
            <Text
              fontSize={20}
              fontWeight="600"
              color="#363636"
              fontFamily="Baloo2SemiBold"
            >
              {showComparison ? 'Comparison Results' : 'Compare Products'}
            </Text>
            
            <TouchableOpacity onPress={handleNewScan}>
              <Ionicons name="add" size={24} color="#363636" />
            </TouchableOpacity>
          </XStack>
        </Stack>

        {showComparison ? (
          // Comparison Results View
          <ScrollView 
            flex={1} 
            paddingHorizontal="$5" 
            paddingTop="$4"
            showsVerticalScrollIndicator={false}
          >
            {/* Winner Announcement */}
            {winner && (
              <AnimatedStack entering={FadeInDown.delay(100)}>
                <Stack
                  backgroundColor="#E8F5E8"
                  borderRadius="$4"
                  padding="$4"
                  marginBottom="$4"
                  borderWidth={1}
                  borderColor="#4CAF50"
                >
                  <XStack alignItems="center" space="$3">
                    <Stack
                      backgroundColor="#4CAF50"
                      borderRadius={20}
                      width={40}
                      height={40}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Ionicons name="trophy" size={20} color="white" />
                    </Stack>
                    <YStack flex={1}>
                      <Text
                        fontSize={16}
                        fontWeight="600"
                        color="#4CAF50"
                        fontFamily="Baloo2SemiBold"
                      >
                        Better Choice: {winner.name}
                      </Text>
                      <Text
                        fontSize={14}
                        color="#666"
                        fontFamily="Baloo2Regular"
                      >
                        Higher safety score: {winner.safetyScore}/100
                      </Text>
                    </YStack>
                  </XStack>
                </Stack>
              </AnimatedStack>
            )}

            {/* Comparison Cards */}
            <YStack space="$4" paddingBottom={100}>
              {comparisonProducts.map((product, index) => (
                <ComparisonCard
                  key={product.id}
                  product={product}
                  isWinner={winner?.id === product.id}
                />
              ))}
            </YStack>
          </ScrollView>
        ) : (
          // Product Selection View
          <Stack flex={1}>
            {/* Selection Info */}
            <Stack paddingHorizontal="$5" paddingVertical="$4" backgroundColor="#F8F9FA">
              <Text
                fontSize={16}
                color="#666"
                fontFamily="Baloo2Regular"
                textAlign="center"
                marginBottom="$2"
              >
                Select 2 products to compare
              </Text>
              <Text
                fontSize={14}
                color="#4CAF50"
                fontFamily="Baloo2SemiBold"
                textAlign="center"
              >
                {selectedProducts.length}/2 selected
              </Text>
            </Stack>

            {/* Products List */}
            <Stack flex={1} position="relative">
              <ScrollView 
                flex={1} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: selectedProducts.length > 0 ? 140 : 20 }}
              >
                {historyData.length === 0 ? (
                  <Stack alignItems="center" paddingTop="$10">
                    <Ionicons name="analytics-outline" size={64} color="#B0B0B0" />
                    <Text
                      fontSize={20}
                      fontWeight="600"
                      color="#363636"
                      fontFamily="Baloo2SemiBold"
                      textAlign="center"
                      marginTop="$4"
                      marginBottom="$2"
                    >
                      No Products to Compare
                    </Text>
                    <Text
                      fontSize={16}
                      color="#B0B0B0"
                      fontFamily="Baloo2Regular"
                      textAlign="center"
                      paddingHorizontal="$8"
                      lineHeight={22}
                    >
                      Start scanning products to build your comparison library
                    </Text>
                  </Stack>
                ) : (
                  <YStack space="$0">
                    {historyData.map((item, index) => (
                      <ProductSelectionCard
                        key={item.id}
                        item={item}
                        onPress={() => handleProductSelection(item.id!)}
                        index={index}
                        isSelected={selectedProducts.includes(item.id!)}
                      />
                    ))}
                  </YStack>
                )}
              </ScrollView>

              {/* Fixed Compare Button */}
              {selectedProducts.length > 0 && (
                <Stack
                  position="absolute"
                  bottom={0}
                  left={0}
                  right={0}
                  backgroundColor="white"
                  paddingHorizontal="$5"
                  paddingTop="$4"
                  borderTopWidth={1}
                  borderTopColor="#E5E5E5"
                  style={{
                    paddingBottom: insets.bottom + 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 8,
                  }}
                >
                  <AnimatedButton
                    onPress={handleCompare}
                    disabled={selectedProducts.length !== 2 || isLoading}
                    backgroundColor={selectedProducts.length === 2 ? "#363636" : "#CCC"}
                    variant="primary"
                  >
                    <XStack alignItems="center" space="$3">
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#FDFAF6" />
                      ) : (
                        <MaterialIcons name="compare-arrows" size={20} color="#FDFAF6" />
                      )}
                      <Text 
                        color="#FDFAF6"
                        fontSize={16}
                        fontFamily="Baloo2SemiBold"
                      >
                        {isLoading ? 'Loading...' : 'Compare Products'}
                      </Text>
                    </XStack>
                  </AnimatedButton>
                </Stack>
              )}
            </Stack>
          </Stack>
        )}
      </Stack>
    </>
  );
} 