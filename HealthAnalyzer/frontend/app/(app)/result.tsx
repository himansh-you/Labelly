import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Image, Alert, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Stack, 
  Text, 
  ScrollView, 
  XStack, 
  YStack,
  Button
} from 'tamagui';
import { Sheet } from '@tamagui/sheet';
import { getUserScans, getScanById, ScanData } from '@/lib/firestore';
import { auth } from '@/lib/firebase';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { IngredientAccordion } from '@/components/IngredientAccordion';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const { height: screenHeight } = Dimensions.get('window');

// Types for parsed analysis result
interface AnalysisResult {
  product_name: string;
  safety_score: string;
  ingredients_summary: string;
  ingredient_categories: {
    safe: {
      percentage: string;
      ingredients: string[];
    };
    low_risk: {
      percentage: string;
      ingredients: string[];
    };
    not_great: {
      percentage: string;
      ingredients: string[];
    };
    dangerous: {
      percentage: string;
      ingredients: string[];
    };
  };
}

// Tab type - changed Reviews to Compare
type TabType = 'Ingredients' | 'Compare' | 'Alternatives';

// Safety Bar Component matching the reference image
const SafetyBar = ({ analysisData }: { analysisData: AnalysisResult }) => {
  // Calculate counts from ingredients
  const safeCount = analysisData.ingredient_categories.safe.ingredients.length;
  const lowRiskCount = analysisData.ingredient_categories.low_risk.ingredients.length;
  const notGreatCount = analysisData.ingredient_categories.not_great.ingredients.length;
  const dangerousCount = analysisData.ingredient_categories.dangerous.ingredients.filter(ing => ing !== "None").length;
  
  const totalCount = safeCount + lowRiskCount + notGreatCount + dangerousCount;
  
  // Calculate percentages for width
  const safeWidth = totalCount > 0 ? (safeCount / totalCount) * 100 : 0;
  const lowRiskWidth = totalCount > 0 ? (lowRiskCount / totalCount) * 100 : 0;
  const notGreatWidth = totalCount > 0 ? (notGreatCount / totalCount) * 100 : 0;
  const dangerousWidth = totalCount > 0 ? (dangerousCount / totalCount) * 100 : 0;

  return (
    <YStack space="$3" marginVertical="$4">
      {/* Progress Bar - matching reference design */}
      <XStack height={12} borderRadius="$3" overflow="hidden" backgroundColor="#E5E5E5">
        {safeWidth > 0 && (
          <Stack 
            width={`${safeWidth}%`} 
            height="100%" 
            backgroundColor="#4CAF50" 
          />
        )}
        {lowRiskWidth > 0 && (
          <Stack 
            width={`${lowRiskWidth}%`} 
            height="100%" 
            backgroundColor="#FFC107" 
          />
        )}
        {notGreatWidth > 0 && (
          <Stack 
            width={`${notGreatWidth}%`} 
            height="100%" 
            backgroundColor="#FF9800" 
          />
        )}
        {dangerousWidth > 0 && (
          <Stack 
            width={`${dangerousWidth}%`} 
            height="100%" 
            backgroundColor="#F44336" 
          />
        )}
      </XStack>

      {/* Legend with exact styling from reference */}
      <YStack space="$2">
        <XStack justifyContent="space-between" alignItems="center">
          <XStack alignItems="center" space="$3">
            <Stack width={16} height={16} borderRadius="$1" backgroundColor="#4CAF50" />
            <Text fontSize={15} color="#333" fontWeight="400" fontFamily="Baloo2Regular">Safe</Text>
          </XStack>
          <Text fontSize={15} color="#333" fontWeight="600" fontFamily="Baloo2SemiBold">{safeCount}</Text>
        </XStack>
        
        <XStack justifyContent="space-between" alignItems="center">
          <XStack alignItems="center" space="$3">
            <Stack width={16} height={16} borderRadius="$1" backgroundColor="#FFC107" />
            <Text fontSize={15} color="#333" fontWeight="400" fontFamily="Baloo2Regular">Low Risk</Text>
          </XStack>
          <Text fontSize={15} color="#333" fontWeight="600" fontFamily="Baloo2SemiBold">{lowRiskCount}</Text>
        </XStack>
        
        <XStack justifyContent="space-between" alignItems="center">
          <XStack alignItems="center" space="$3">
            <Stack width={16} height={16} borderRadius="$1" backgroundColor="#FF9800" />
            <Text fontSize={15} color="#333" fontWeight="400" fontFamily="Baloo2Regular">Not Great</Text>
          </XStack>
          <Text fontSize={15} color="#333" fontWeight="600" fontFamily="Baloo2SemiBold">{notGreatCount}</Text>
        </XStack>
        
        <XStack justifyContent="space-between" alignItems="center">
          <XStack alignItems="center" space="$3">
            <Stack width={16} height={16} borderRadius="$1" backgroundColor="#F44336" />
            <Text fontSize={15} color="#333" fontWeight="400" fontFamily="Baloo2Regular">Dangerous</Text>
          </XStack>
          <Text fontSize={15} color="#333" fontWeight="600" fontFamily="Baloo2SemiBold">{dangerousCount}</Text>
        </XStack>
      </YStack>
    </YStack>
  );
};

// Ingredient Category Component matching reference layout
const IngredientCategory = ({ 
  title, 
  percentage, 
  ingredients, 
  borderColor 
}: { 
  title: string; 
  percentage: string; 
  ingredients: string[]; 
  borderColor: string;
}) => (
  <YStack 
    backgroundColor="#F8F8F8" 
    borderRadius="$2" 
    padding="$4" 
    marginVertical="$2"
    borderLeftWidth={4}
    borderLeftColor={borderColor}
  >
    <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
      <Text fontSize={16} fontWeight="600" color="#333" fontFamily="Baloo2SemiBold">{title}</Text>
      <Text fontSize={14} color="#666" fontFamily="Baloo2Regular">{percentage}</Text>
    </XStack>
    <YStack space="$1">
      {ingredients.map((ingredient, index) => (
        <Text key={index} fontSize={14} color="#333" lineHeight={18} fontFamily="Baloo2Regular">
          {ingredient}
        </Text>
      ))}
    </YStack>
  </YStack>
);

// Tab Navigation Component matching reference design
const TabNavigation = ({ 
  activeTab, 
  onTabChange 
}: { 
  activeTab: TabType; 
  onTabChange: (tab: TabType) => void;
}) => (
  <XStack backgroundColor="#E5E5E5" borderRadius="$4" padding="$1" marginVertical="$4">
    {(['Ingredients', 'Compare', 'Alternatives'] as TabType[]).map((tab) => (
      <Button
        key={tab}
        flex={1}
        onPress={() => onTabChange(tab)}
        backgroundColor={activeTab === tab ? "#333333" : "transparent"}
        borderRadius="$3"
        size="$3"
        fontWeight={activeTab === tab ? "600" : "400"}
        color={activeTab === tab ? "white" : "#666"}
        fontFamily={activeTab === tab ? "Baloo2SemiBold" : "Baloo2Regular"}
        pressStyle={{
          backgroundColor: activeTab === tab ? "#222222" : "#D0D0D0"
        }}
      >
        {tab}
      </Button>
    ))}
  </XStack>
);

// Tab Content Component
const TabContent = ({ activeTab, analysisData }: { activeTab: TabType; analysisData: AnalysisResult }) => {
  if (activeTab === 'Ingredients') {
    return (
      <Stack space="$4">
        {/* Safety Bar - keep existing */}
        <Stack space="$3">
          <Text fontSize={16} fontFamily="Baloo2SemiBold" color="#363636">
            Safety Overview
          </Text>
          
          {/* Your existing safety bar component */}
          <SafetyBar analysisData={analysisData} />
        </Stack>

        {/* New Accordion Component */}
        <Stack space="$3">
          <Text fontSize={16} fontFamily="Baloo2SemiBold" color="#363636">
            Ingredient Analysis
          </Text>
          
          <IngredientAccordion data={analysisData} />
        </Stack>
      </Stack>
    );
  }

  if (activeTab === 'Compare') {
    return (
      <YStack 
        alignItems="center"
        justifyContent="center"
        minHeight={200}
      >
        <Text fontSize={16} color="#666" fontFamily="Baloo2Regular">Product comparison coming soon</Text>
      </YStack>
    );
  }

  if (activeTab === 'Alternatives') {
    return (
      <YStack 
        alignItems="center"
        justifyContent="center"
        minHeight={200}
      >
        <Text fontSize={16} color="#666" fontFamily="Baloo2Regular">Alternatives coming soon</Text>
      </YStack>
    );
  }

  return null;
};

// Enhanced Animated Button Component matching scan page design
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
    opacity.value = 0.9;
    shadowOpacity.value = 0.05;
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 18,
      stiffness: 350,
    });
    opacity.value = 1;
    shadowOpacity.value = 0.15;
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
          flex: 1,
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

export default function ResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { scanId, imageUri, analyzeResult } = useLocalSearchParams<{
    scanId: string;
    imageUri: string;
    analyzeResult: string;
  }>();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanData, setScanData] = useState<ScanData | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [citations, setCitations] = useState<any[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('Ingredients');

  // Calculate snap points as percentages of screen height
  const snapPoints = [
    95, // Nearly full screen (95% to leave status bar visible)
    75, // Three quarters
    25  // Minimum (quarter screen)
  ];

  useEffect(() => {
    async function fetchScanData() {
      try {
        setIsLoading(true);
        setError(null);

        // If analyzeResult is provided, use it directly
        if (analyzeResult) {
          try {
            const parsedResult = JSON.parse(analyzeResult);
            
            // Parse the analysis content to extract structured data
            const analysisContent = parsedResult.analysis || '';
            console.log('Raw analysis content:', analysisContent);
            
            // Try to extract JSON from the analysis content
            try {
              // Look for JSON in the content
              const jsonMatch = analysisContent.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const extractedData = JSON.parse(jsonMatch[0]);
                setAnalysisData(extractedData);
              } else {
                throw new Error('No JSON found in analysis content');
              }
            } catch (parseError) {
              console.error('Error parsing structured data:', parseError);
              // Fallback: create a basic structure
              setAnalysisData({
                product_name: "Product Analysis",
                safety_score: "Analysis Complete",
                ingredients_summary: analysisContent,
                ingredient_categories: {
                  safe: { percentage: "0%", ingredients: [] },
                  low_risk: { percentage: "0%", ingredients: [] },
                  not_great: { percentage: "0%", ingredients: [] },
                  dangerous: { percentage: "0%", ingredients: [] }
                }
              });
            }
            
            setCitations(parsedResult.citations || []);
            setIsLoading(false);
            // Show the sheet after data is loaded
            setTimeout(() => setSheetOpen(true), 500);
            return;
          } catch (parseError) {
            console.error('Error parsing analyzeResult:', parseError);
            // Continue to fetch from Firestore if parsing fails
          }
        }
        
        // Fallback to the original Firestore fetch logic
        const user = auth.currentUser;
        if (!user) {
          throw new Error('User not authenticated');
        }

        let scan: ScanData | null = null;
        
        // If we have a scanId, fetch that specific scan
        if (scanId) {
          scan = await getScanById(scanId);
        } else {
          // Otherwise, get the most recent scan for this user
          const userScans = await getUserScans(user.uid);
          if (userScans.length > 0) {
            scan = userScans[0];
          }
        }
        
        if (!scan) {
          throw new Error('No scan data found');
        }
        
        setScanData(scan);
        
        // Process scan data similar to above
        if (scan.analysisResult) {
          // Try to parse structured data from stored analysis
          const analysisContent = scan.analysisResult.analysis || '';
          try {
            const jsonMatch = analysisContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const extractedData = JSON.parse(jsonMatch[0]);
              setAnalysisData(extractedData);
            }
          } catch {
            // Fallback
            setAnalysisData({
              product_name: "Product Analysis",
              safety_score: "Analysis Complete",
              ingredients_summary: analysisContent,
              ingredient_categories: {
                safe: { percentage: "0%", ingredients: [] },
                low_risk: { percentage: "0%", ingredients: [] },
                not_great: { percentage: "0%", ingredients: [] },
                dangerous: { percentage: "0%", ingredients: [] }
              }
            });
          }
          setCitations(scan.analysisResult.citations || []);
        }
        
        // Show the sheet after data is loaded
        setTimeout(() => setSheetOpen(true), 500);
      } catch (error) {
        console.error('Error fetching scan data:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchScanData();
  }, [scanId, analyzeResult]);

  const handleNewScan = () => {
    setSheetOpen(false);
    router.push('/(app)/scan');
  };

  const handleBack = () => {
    setSheetOpen(false);
    router.back();
  };

  if (isLoading) {
    return (
      <Stack flex={1} backgroundColor="#f8f8f8" alignItems="center" justifyContent="center">
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text marginTop="$4" fontSize={16} color="#666" fontFamily="Baloo2Regular">Loading analysis results...</Text>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack flex={1} backgroundColor="#f8f8f8" alignItems="center" justifyContent="center" padding="$6">
        <FontAwesome name="exclamation-triangle" size={50} color="#ff3b30" />
        <Text marginTop="$4" fontSize={20} fontWeight="bold" color="#ff3b30" fontFamily="Baloo2Bold">Error</Text>
        <Text marginTop="$2" fontSize={16} color="#666" textAlign="center" fontFamily="Baloo2Regular">{error}</Text>
        <Stack marginTop="$6" width="100%" maxWidth={200}>
          <AnimatedButton 
            onPress={handleNewScan} 
            backgroundColor="#363636"
            variant="primary"
          >
            <Stack flexDirection="row" alignItems="center" space="$3">
              <Ionicons name="refresh" size={20} color="#FDFAF6" />
              <Text 
                color="#FDFAF6"
                fontSize={16}
                fontFamily="Baloo2SemiBold"
              >
                Try a New Scan
              </Text>
            </Stack>
          </AnimatedButton>
        </Stack>
      </Stack>
    );
  }

  if (!analysisData) {
    return (
      <Stack flex={1} backgroundColor="#f8f8f8" alignItems="center" justifyContent="center" padding="$6">
        <Text fontSize={16} fontFamily="Baloo2Regular">No analysis result found.</Text>
        <Stack marginTop="$4" width="100%" maxWidth={200}>
          <AnimatedButton 
            onPress={handleNewScan} 
            backgroundColor="#363636"
            variant="primary"
          >
            <Stack flexDirection="row" alignItems="center" space="$3">
              <Ionicons name="camera" size={20} color="#FDFAF6" />
              <Text 
                color="#FDFAF6"
                fontSize={16}
                fontFamily="Baloo2SemiBold"
              >
                Try a New Scan
              </Text>
            </Stack>
          </AnimatedButton>
        </Stack>
      </Stack>
    );
  }

  // Get the image URI either from params or from the scan data
  const displayImageUri = imageUri || (scanData?.analysisResult?.imageUrl || null);

  return (
    <>
      <StatusBar style="dark" backgroundColor="#f8f8f8" />
      <Stack flex={1} backgroundColor="#f8f8f8">
        {/* Background content - you can add camera view or other content here */}
        <Stack flex={1} alignItems="center" justifyContent="center">
          <Text fontSize={18} color="#666" fontFamily="Baloo2Regular">Scan complete!</Text>
          <Text fontSize={14} color="#999" marginTop="$2" fontFamily="Baloo2Regular">Swipe up to view results</Text>
        </Stack>

        {/* Sheet Component - Updated to handle complete dismissal */}
        <Sheet
          modal={true}
          open={sheetOpen}
          onOpenChange={(open) => {
            if (!open) {
              // When sheet is completely dismissed, redirect to scan screen
              handleNewScan();
            } else {
              setSheetOpen(open);
            }
          }}
          snapPoints={[95, 75, 25]}
          dismissOnSnapToBottom={true}  // Allow complete dismissal
          animation="medium"
          zIndex={100000}
          moveOnKeyboardChange={true}
        >
          <Sheet.Overlay 
            animation="lazy" 
            enterStyle={{ opacity: 0 }} 
            exitStyle={{ opacity: 0 }} 
          />
          
          <Sheet.Handle backgroundColor="#DDD" />
          
          <Sheet.Frame 
            backgroundColor="white" 
            borderTopLeftRadius="$6" 
            borderTopRightRadius="$6"
            flex={1}
          >
            <YStack flex={1}>
              {/* Scrollable Content - with proper bottom padding */}
              <ScrollView 
                flex={1} 
                padding="$5" 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ 
                  paddingBottom: 120 + insets.bottom // Extra space for buttons
                }}
              >
                {/* All your existing content stays the same */}
                <YStack space="$4">
                  <XStack space="$4" alignItems="center">
      {displayImageUri && (
          <Image
            source={{ uri: displayImageUri }}
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 8,
                          backgroundColor: '#f0f0f0'
                        }}
            defaultSource={require('@/assets/placeholder.png')}
                      />
                    )}
                    <YStack flex={1} space="$2">
                      <Text fontSize={18} fontWeight="600" color="#333" fontFamily="Baloo2SemiBold">
                        {analysisData.product_name || "Product Analysis"}
                      </Text>
                      <Stack 
                        backgroundColor="#4CAF50" 
                        borderRadius="$3" 
                        paddingHorizontal="$3" 
                        paddingVertical="$1" 
                        alignSelf="flex-start"
                      >
                        <Text fontSize={12} color="white" fontWeight="600" fontFamily="Baloo2SemiBold">
                          {analysisData.safety_score}
                        </Text>
                      </Stack>
                    </YStack>
                  </XStack>

                  {/* Tab Navigation */}
                  <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

                  {/* Content based on active tab */}
                  <TabContent activeTab={activeTab} analysisData={analysisData} />
                </YStack>
              </ScrollView>

              {/* Absolutely positioned buttons at bottom */}
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
                <XStack space="$4">
                  {/* Back Button */}
                  <AnimatedButton
                    onPress={handleBack}
                    backgroundColor="#FDFAF6"
                    borderColor="#363636"
                    variant="secondary"
                  >
                    <Stack flexDirection="row" alignItems="center" space="$3">
                      <Ionicons name="arrow-back" size={20} color="#363636" />
                      <Text 
                        color="#363636"
                        fontSize={16}
                        fontFamily="Baloo2SemiBold"
                      >
                        Back
                      </Text>
                    </Stack>
                  </AnimatedButton>

                  {/* New Scan Button */}
                  <AnimatedButton
                    onPress={handleNewScan}
                    backgroundColor="#363636"
                    variant="primary"
                  >
                    <Stack flexDirection="row" alignItems="center" space="$3">
                      <Ionicons name="camera" size={20} color="#FDFAF6" />
                      <Text 
                        color="#FDFAF6"
                        fontSize={16}
                        fontFamily="Baloo2SemiBold"
                      >
                        New Scan
                      </Text>
                    </Stack>
                  </AnimatedButton>
                </XStack>
              </Stack>
            </YStack>
          </Sheet.Frame>
        </Sheet>
      </Stack>
    </>
  );
} 