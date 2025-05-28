import React, { useState, useMemo } from 'react';
import { TouchableOpacity } from 'react-native';
import { Stack, Text } from '@tamagui/core';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolate,
  runOnJS
} from 'react-native-reanimated';

const AnimatedStack = Animated.createAnimatedComponent(Stack);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// Type definitions
interface IngredientDetail {
  ingredient: string;
  reason: string;
}

interface CategoryData {
  ingredients: string[];
  details: IngredientDetail[];
}

interface IngredientData {
  ingredient_categories: {
    safe: CategoryData;
    low_risk: CategoryData;
    not_great: CategoryData;
    dangerous: CategoryData;
  };
}

interface AccordionCardProps {
  title: string;
  category: 'safe' | 'low_risk' | 'not_great' | 'dangerous';
  data: CategoryData;
  isExpanded: boolean;
  onToggle: () => void;
}

interface IngredientAccordionProps {
  data: IngredientData;
}

// Category styling configuration
const getCategoryStyles = (category: string) => {
  switch (category) {
    case 'safe':
      return {
        borderColor: '#4CAF50',
        badgeColor: '#4CAF50',
        iconColor: '#4CAF50',
        title: 'Safe Ingredients'
      };
    case 'low_risk':
      return {
        borderColor: '#FFC107',
        badgeColor: '#FFC107',
        iconColor: '#FFC107',
        title: 'Low Risk Ingredients'
      };
    case 'not_great':
      return {
        borderColor: '#FF9800',
        badgeColor: '#FF9800',
        iconColor: '#FF9800',
        title: 'Not Great Ingredients'
      };
    case 'dangerous':
      return {
        borderColor: '#F44336',
        badgeColor: '#F44336',
        iconColor: '#F44336',
        title: 'Dangerous Ingredients'
      };
    default:
      return {
        borderColor: '#666',
        badgeColor: '#666',
        iconColor: '#666',
        title: 'Unknown Category'
      };
  }
};

// Individual Accordion Card Component
const AccordionCard: React.FC<AccordionCardProps> = ({
  title,
  category,
  data,
  isExpanded,
  onToggle
}) => {
  const heightValue = useSharedValue(0);
  const rotationValue = useSharedValue(0);
  const shadowOpacity = useSharedValue(0.1);
  const scale = useSharedValue(1);

  const styles = getCategoryStyles(category);
  // Filter out "None" entries when counting ingredients
  const filteredIngredients = data.ingredients.filter(ing => ing !== "None");
  const ingredientCount = filteredIngredients.length;

  // Calculate content height outside of animated style
  const contentHeight = useMemo(() => {
    let height = 0;
    
    // Divider height + margins
    height += 1 + 32; // 1px divider + 16px margin top + 16px margin bottom
    
    // Each ingredient detail card
    data.details.forEach((detail) => {
      // Base card height (padding + content)
      height += 24; // Top and bottom padding (12px each)
      
      // Ingredient name height (16px font + line height)
      height += 20;
      
      // Margin between name and reason
      height += 4;
      
      // Reason text height - estimate based on character count
      const reasonLines = Math.ceil(detail.reason.length / 45); // Approximate characters per line
      height += reasonLines * 20; // 14px font + 6px line spacing
      
      // Margin between cards
      height += 12;
    });
    
    // Empty state height if no details
    if (data.details.length === 0 && ingredientCount > 0) {
      height += 80; // Empty state card height
    }
    
    // Bottom padding
    height += 16;
    
    return Math.max(height, 120); // Minimum height
  }, [data.details, ingredientCount]);

  React.useEffect(() => {
    if (isExpanded) {
      heightValue.value = withSpring(1, {
        damping: 25,
        stiffness: 250,
      });
      rotationValue.value = withSpring(180, {
        damping: 20,
        stiffness: 300,
      });
      shadowOpacity.value = withTiming(0.15, { duration: 200 });
    } else {
      heightValue.value = withSpring(0, {
        damping: 25,
        stiffness: 250,
      });
      rotationValue.value = withSpring(0, {
        damping: 20,
        stiffness: 300,
      });
      shadowOpacity.value = withTiming(0.1, { duration: 200 });
    }
  }, [isExpanded]);

  const expandedContentStyle = useAnimatedStyle(() => {
    const height = interpolate(
      heightValue.value,
      [0, 1],
      [0, contentHeight]
    );

    return {
      height,
      opacity: interpolate(
        heightValue.value,
        [0, 0.3, 1],
        [0, 0, 1]
      ),
    };
  });

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotationValue.value}deg` }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: shadowOpacity.value,
    elevation: shadowOpacity.value * 20,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, {
      damping: 20,
      stiffness: 400,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 18,
      stiffness: 350,
    });
  };

  const handlePress = () => {
    runOnJS(onToggle)();
  };

  return (
    <AnimatedStack
      style={[
        {
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          borderLeftWidth: 4,
          borderLeftColor: styles.borderColor,
          borderWidth: 1,
          borderColor: 'rgba(54, 54, 54, 0.1)',
          marginBottom: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 8,
        },
        cardStyle
      ]}
    >
      {/* Header - Always Visible */}
      <AnimatedTouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Stack
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          padding="$4"
          paddingVertical="$5"
        >
          <Stack flex={1} flexDirection="row" alignItems="center" space="$3">
            {/* Category Title */}
            <Stack flex={1}>
              <Text
                fontSize={18}
                fontWeight="600"
                color="#363636"
                fontFamily="Baloo2SemiBold"
                marginBottom="$1"
              >
                {styles.title}
              </Text>
              
              {/* Ingredient Names Preview (Collapsed State) */}
              {!isExpanded && ingredientCount > 0 && (
                <Text
                  fontSize={14}
                  color="#666"
                  fontFamily="Baloo2Regular"
                  numberOfLines={2}
                  lineHeight={18}
                >
                  {filteredIngredients.slice(0, 3).join(', ')}
                  {filteredIngredients.length > 3 && ` +${filteredIngredients.length - 3} more`}
                </Text>
              )}
            </Stack>

            {/* Count Badge */}
            <Stack
              backgroundColor={styles.badgeColor}
              borderRadius={12}
              paddingHorizontal="$3"
              paddingVertical="$1"
              minWidth={32}
              alignItems="center"
              justifyContent="center"
            >
              <Text
                fontSize={14}
                fontWeight="600"
                color="#FFFFFF"
                fontFamily="Baloo2SemiBold"
              >
                {ingredientCount}
              </Text>
            </Stack>

            {/* Chevron Icon */}
            <Animated.View style={chevronStyle}>
              <Ionicons 
                name="chevron-down" 
                size={20} 
                color={styles.iconColor} 
              />
            </Animated.View>
          </Stack>
        </Stack>
      </AnimatedTouchableOpacity>

      {/* Expanded Content */}
      <AnimatedStack 
        style={[
          expandedContentStyle,
          { overflow: 'hidden' }
        ]}
      >
        <Stack paddingHorizontal="$4" paddingBottom="$4">
          {/* Divider */}
          <Stack
            height={1}
            backgroundColor="rgba(54, 54, 54, 0.1)"
            marginBottom="$4"
          />

          {/* Ingredient Details */}
          <Stack space="$3">
            {data.details.map((detail, index) => (
              <Stack
                key={`${detail.ingredient}-${index}`}
                backgroundColor="#FDFAF6"
                borderRadius={12}
                padding="$3"
                borderLeftWidth={3}
                borderLeftColor={styles.borderColor}
              >
                <Text
                  fontSize={16}
                  fontWeight="600"
                  color="#363636"
                  fontFamily="Baloo2SemiBold"
                  marginBottom="$1"
                  lineHeight={20}
                >
                  {detail.ingredient}
                </Text>
                <Text
                  fontSize={14}
                  color="#666"
                  fontFamily="Baloo2Regular"
                  lineHeight={20}
                >
                  {detail.reason}
                </Text>
              </Stack>
            ))}
          </Stack>

          {/* Empty State */}
          {data.details.length === 0 && ingredientCount > 0 && (
            <Stack
              backgroundColor="#F5F5F5"
              borderRadius={12}
              padding="$4"
              alignItems="center"
              minHeight={60}
            >
              <Text
                fontSize={14}
                color="#999"
                fontFamily="Baloo2Regular"
                textAlign="center"
                lineHeight={18}
              >
                No detailed information available for these ingredients
              </Text>
            </Stack>
          )}
        </Stack>
      </AnimatedStack>
    </AnimatedStack>
  );
};

// Main Accordion Component
export const IngredientAccordion: React.FC<IngredientAccordionProps> = ({ data }) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const handleToggle = (category: string) => {
    setExpandedCard(expandedCard === category ? null : category);
  };

  const categories = [
    { key: 'safe', data: data.ingredient_categories.safe },
    { key: 'low_risk', data: data.ingredient_categories.low_risk },
    { key: 'not_great', data: data.ingredient_categories.not_great },
    { key: 'dangerous', data: data.ingredient_categories.dangerous },
  ] as const;

  return (
    <Stack space="$2" paddingBottom="$4">
      {categories.map(({ key, data: categoryData }) => {
        const styles = getCategoryStyles(key);
        return (
          <AccordionCard
            key={key}
            title={styles.title}
            category={key}
            data={categoryData}
            isExpanded={expandedCard === key}
            onToggle={() => handleToggle(key)}
          />
        );
      })}
    </Stack>
  );
};

export default IngredientAccordion; 