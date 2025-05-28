import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  Stack, 
  Text, 
  ScrollView, 
  XStack, 
  YStack,
  Button
} from 'tamagui';
import { auth } from '@/lib/firebase';

// Base URL for API calls - same as in lib/api.ts
const API_BASE_URL = 'https://labelly.onrender.com';

// Add PurchaseLinks interface
interface PurchaseLinks {
  amazon?: string;
  walmart?: string;
  target?: string;
  instacart?: string;
}

// Update AlternativeProduct interface to include purchase_links
interface AlternativeProduct {
  product_name: string;
  brand: string;
  why_better: string;
  key_improvements: string[];
  safety_score: string;
  price_range: string;
  availability: string;
  main_benefits: string[];
  purchase_links?: PurchaseLinks;
}

interface GeneralAdvice {
  avoid_ingredients: string[];
  look_for_ingredients: string[];
  shopping_tips: string[];
}

interface AlternativesData {
  alternatives: AlternativeProduct[];
  general_advice: GeneralAdvice;
}

interface AlternativesViewProps {
  analysisData: any; // The original analysis data
}

// Add PurchaseLinks component
const PurchaseLinksComponent = ({ links }: { links: PurchaseLinks }) => {
  const handlePurchaseLink = async (url: string, store: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Cannot open ${store} link`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to open ${store} link`);
    }
  };

  return (
    <Stack marginTop="$3">
      <Text
        fontSize={14}
        fontWeight="600"
        color="#363636"
        fontFamily="Baloo2SemiBold"
        marginBottom="$2"
      >
        Where to Buy:
      </Text>
      <XStack space="$2" flexWrap="wrap">
        {links.amazon && (
          <Button
            size="$2"
            backgroundColor="#FF9900"
            color="white"
            borderRadius="$2"
            paddingHorizontal="$3"
            onPress={() => handlePurchaseLink(links.amazon!, 'Amazon')}
          >
            <XStack alignItems="center" space="$1">
              <Ionicons name="storefront" size={14} color="white" />
              <Text fontSize={12} color="white" fontFamily="Baloo2SemiBold">
                Amazon
              </Text>
            </XStack>
          </Button>
        )}
        {links.walmart && (
          <Button
            size="$2"
            backgroundColor="#0071CE"
            color="white"
            borderRadius="$2"
            paddingHorizontal="$3"
            onPress={() => handlePurchaseLink(links.walmart!, 'Walmart')}
          >
            <XStack alignItems="center" space="$1">
              <Ionicons name="storefront" size={14} color="white" />
              <Text fontSize={12} color="white" fontFamily="Baloo2SemiBold">
                Walmart
              </Text>
            </XStack>
          </Button>
        )}
        {links.target && (
          <Button
            size="$2"
            backgroundColor="#CC0000"
            color="white"
            borderRadius="$2"
            paddingHorizontal="$3"
            onPress={() => handlePurchaseLink(links.target!, 'Target')}
          >
            <XStack alignItems="center" space="$1">
              <Ionicons name="storefront" size={14} color="white" />
              <Text fontSize={12} color="white" fontFamily="Baloo2SemiBold">
                Target
              </Text>
            </XStack>
          </Button>
        )}
        {links.instacart && (
          <Button
            size="$2"
            backgroundColor="#43B02A"
            color="white"
            borderRadius="$2"
            paddingHorizontal="$3"
            onPress={() => handlePurchaseLink(links.instacart!, 'Instacart')}
          >
            <XStack alignItems="center" space="$1">
              <Ionicons name="bicycle" size={14} color="white" />
              <Text fontSize={12} color="white" fontFamily="Baloo2SemiBold">
                Instacart
              </Text>
            </XStack>
          </Button>
        )}
      </XStack>
    </Stack>
  );
};

// Update AlternativeCard to include purchase links
const AlternativeCard = ({ alternative }: { alternative: AlternativeProduct }) => (
  <Stack
    backgroundColor="#FFFFFF"
    borderRadius={16}
    padding="$4"
    borderWidth={1}
    borderColor="rgba(54, 54, 54, 0.1)"
    marginBottom="$3"
    shadowColor="#000"
    shadowOffset={{ width: 0, height: 2 }}
    shadowOpacity={0.1}
    shadowRadius={4}
    elevation={3}
  >
    {/* Header */}
    <XStack alignItems="center" justifyContent="space-between" marginBottom="$3">
      <YStack flex={1}>
        <Text
          fontSize={18}
          fontWeight="600"
          color="#363636"
          fontFamily="Baloo2SemiBold"
          marginBottom="$1"
        >
          {alternative.product_name}
        </Text>
        <Text
          fontSize={14}
          color="#666"
          fontFamily="Baloo2Regular"
        >
          {alternative.brand}
        </Text>
      </YStack>
      
      <Stack
        backgroundColor="#E8F5E8"
        paddingHorizontal="$3"
        paddingVertical="$1"
        borderRadius={8}
      >
        <Text
          fontSize={12}
          fontWeight="600"
          color="#4CAF50"
          fontFamily="Baloo2SemiBold"
        >
          {alternative.safety_score}
        </Text>
      </Stack>
    </XStack>

    {/* Why Better */}
    <Text
      fontSize={14}
      color="#363636"
      fontFamily="Baloo2Regular"
      lineHeight={20}
      marginBottom="$3"
    >
      {alternative.why_better}
    </Text>

    {/* Key Improvements */}
    <Stack marginBottom="$3">
      <Text
        fontSize={14}
        fontWeight="600"
        color="#363636"
        fontFamily="Baloo2SemiBold"
        marginBottom="$2"
      >
        Key Improvements:
      </Text>
      {alternative.key_improvements.map((improvement, index) => (
        <XStack key={index} alignItems="center" marginBottom="$1">
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          <Text
            fontSize={13}
            color="#666"
            fontFamily="Baloo2Regular"
            marginLeft="$2"
          >
            {improvement}
          </Text>
        </XStack>
      ))}
    </Stack>

    {/* Main Benefits */}
    <Stack marginBottom="$3">
      <Text
        fontSize={14}
        fontWeight="600"
        color="#363636"
        fontFamily="Baloo2SemiBold"
        marginBottom="$2"
      >
        Health Benefits:
      </Text>
      {alternative.main_benefits.map((benefit, index) => (
        <XStack key={index} alignItems="center" marginBottom="$1">
          <Ionicons name="heart" size={14} color="#FF6B6B" />
          <Text
            fontSize={13}
            color="#666"
            fontFamily="Baloo2Regular"
            marginLeft="$2"
          >
            {benefit}
          </Text>
        </XStack>
      ))}
    </Stack>

    {/* Price and Availability */}
    <XStack justifyContent="space-between" marginTop="$2" space="$2">
      <Stack flex={1}>
        <Text
          fontSize={12}
          fontWeight="600"
          color="#363636"
          fontFamily="Baloo2SemiBold"
          marginBottom="$1"
        >
          Price Range
        </Text>
        <Text
          fontSize={12}
          color="#666"
          fontFamily="Baloo2Regular"
        >
          {alternative.price_range}
        </Text>
      </Stack>
      
      <Stack flex={1} alignItems="flex-end">
        <Text
          fontSize={12}
          fontWeight="600"
          color="#363636"
          fontFamily="Baloo2SemiBold"
          marginBottom="$1"
        >
          Where to Find
        </Text>
        <Text
          fontSize={12}
          color="#666"
          fontFamily="Baloo2Regular"
          textAlign="right"
          flexWrap="wrap"
          numberOfLines={3}
        >
          {alternative.availability}
        </Text>
      </Stack>
    </XStack>

    {/* Purchase Links */}
    {alternative.purchase_links && (
      <PurchaseLinksComponent links={alternative.purchase_links} />
    )}
  </Stack>
);

const GeneralAdviceCard = ({ advice }: { advice: GeneralAdvice }) => (
  <Stack
    backgroundColor="#F8F9FA"
    borderRadius={16}
    padding="$4"
    borderWidth={1}
    borderColor="rgba(54, 54, 54, 0.1)"
    marginTop="$4"
  >
    <XStack alignItems="center" marginBottom="$3">
      <Ionicons name="bulb" size={20} color="#FF9800" />
      <Text
        fontSize={16}
        fontWeight="600"
        color="#363636"
        fontFamily="Baloo2SemiBold"
        marginLeft="$2"
      >
        Shopping Tips
      </Text>
    </XStack>

    {/* Avoid Ingredients */}
    {advice.avoid_ingredients.length > 0 && (
      <Stack marginBottom="$3">
        <Text
          fontSize={14}
          fontWeight="600"
          color="#E53E3E"
          fontFamily="Baloo2SemiBold"
          marginBottom="$2"
        >
          Avoid These Ingredients:
        </Text>
        {advice.avoid_ingredients.map((ingredient, index) => (
          <XStack key={index} alignItems="center" marginBottom="$1">
            <Ionicons name="close-circle" size={14} color="#E53E3E" />
            <Text
              fontSize={13}
              color="#666"
              fontFamily="Baloo2Regular"
              marginLeft="$2"
            >
              {ingredient}
            </Text>
          </XStack>
        ))}
      </Stack>
    )}

    {/* Look for Ingredients */}
    {advice.look_for_ingredients.length > 0 && (
      <Stack marginBottom="$3">
        <Text
          fontSize={14}
          fontWeight="600"
          color="#4CAF50"
          fontFamily="Baloo2SemiBold"
          marginBottom="$2"
        >
          Look for These Instead:
        </Text>
        {advice.look_for_ingredients.map((ingredient, index) => (
          <XStack key={index} alignItems="center" marginBottom="$1">
            <Ionicons name="add-circle" size={14} color="#4CAF50" />
            <Text
              fontSize={13}
              color="#666"
              fontFamily="Baloo2Regular"
              marginLeft="$2"
            >
              {ingredient}
            </Text>
          </XStack>
        ))}
      </Stack>
    )}

    {/* Shopping Tips */}
    {advice.shopping_tips.length > 0 && (
      <Stack>
        <Text
          fontSize={14}
          fontWeight="600"
          color="#363636"
          fontFamily="Baloo2SemiBold"
          marginBottom="$2"
        >
          Pro Tips:
        </Text>
        {advice.shopping_tips.map((tip, index) => (
          <XStack key={index} alignItems="flex-start" marginBottom="$1">
            <Ionicons name="star" size={14} color="#FF9800" style={{ marginTop: 2 }} />
            <Text
              fontSize={13}
              color="#666"
              fontFamily="Baloo2Regular"
              marginLeft="$2"
              flex={1}
            >
              {tip}
            </Text>
          </XStack>
        ))}
      </Stack>
    )}
  </Stack>
);

export const AlternativesView: React.FC<AlternativesViewProps> = ({ analysisData }) => {
  const [alternatives, setAlternatives] = useState<AlternativesData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlternatives = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = await user.getIdToken();
      
      const response = await fetch(`${API_BASE_URL}/api/alternatives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          analysis_data: analysisData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAlternatives(data.alternatives);
    } catch (error) {
      console.error('Error fetching alternatives:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch alternatives');
      Alert.alert('Error', 'Failed to load alternatives. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlternatives();
  }, [analysisData]);

  if (isLoading) {
    return (
      <YStack 
        alignItems="center"
        justifyContent="center"
        minHeight={200}
        space="$3"
      >
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text fontSize={16} color="#666" fontFamily="Baloo2Regular">
          Finding better alternatives...
        </Text>
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack 
        alignItems="center"
        justifyContent="center"
        minHeight={200}
        space="$3"
      >
        <Ionicons name="alert-circle" size={48} color="#E53E3E" />
        <Text fontSize={16} color="#E53E3E" fontFamily="Baloo2SemiBold" textAlign="center">
          Failed to load alternatives
        </Text>
        <Button 
          onPress={fetchAlternatives}
          backgroundColor="#4CAF50"
          borderRadius="$4"
        >
          <Text color="white" fontFamily="Baloo2SemiBold">Try Again</Text>
        </Button>
      </YStack>
    );
  }

  if (!alternatives) {
    return (
      <YStack 
        alignItems="center"
        justifyContent="center"
        minHeight={200}
      >
        <Text fontSize={16} color="#666" fontFamily="Baloo2Regular">
          No alternatives found
        </Text>
      </YStack>
    );
  }

  return (
    <Stack space="$4">
      {/* Header */}
      <XStack alignItems="center" space="$2">
        <Ionicons name="leaf" size={24} color="#4CAF50" />
        <Text
          fontSize={18}
          fontWeight="600"
          color="#363636"
          fontFamily="Baloo2SemiBold"
        >
          Healthier Alternatives
        </Text>
      </XStack>

      {/* Alternatives List */}
      {alternatives.alternatives.map((alternative, index) => (
        <AlternativeCard key={index} alternative={alternative} />
      ))}

      {/* General Advice */}
      {alternatives.general_advice && (
        <GeneralAdviceCard advice={alternatives.general_advice} />
      )}
    </Stack>
  );
}; 