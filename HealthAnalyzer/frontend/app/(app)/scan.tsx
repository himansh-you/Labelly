import React, { useState, useEffect } from 'react';
import { 
  ActivityIndicator,
  Alert,
  Image 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack, Text } from '@tamagui/core';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import CameraView from '@/components/CameraView';
import { analyzeIngredients } from '@/lib/api';
import { CapturedImage, processImageUri, verifyImageUri, copyImageToPermanentLocation } from '@/lib/camera';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  runOnJS
} from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// Animated Button Component
interface AnimatedButtonProps {
  onPress: () => void;
  disabled?: boolean;
  backgroundColor: string;
  children: React.ReactNode;
  borderColor?: string;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ 
  onPress, 
  disabled = false, 
  backgroundColor, 
  children, 
  borderColor 
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.95);
      opacity.value = 0.8;
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1);
      opacity.value = 1;
    }
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
      style={animatedStyle}
    >
      <Stack
        backgroundColor={backgroundColor}
        borderRadius="$4"
        paddingVertical="$4"
        paddingHorizontal="$6"
        alignItems="center"
        justifyContent="center"
        borderWidth={borderColor ? 2 : 0}
        borderColor={borderColor}
        opacity={disabled ? 0.6 : 1}
        minHeight={56}
      >
        {children}
      </Stack>
    </AnimatedTouchableOpacity>
  );
};

export default function ScanScreen() {
  const router = useRouter();
  const [showCamera, setShowCamera] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const handleImageCaptured = async (image: { uri: string }) => {
    console.log('Image captured:', image.uri);
    if (image.uri) {
      try {
        // Copy image to permanent location first
        const permanentUri = await copyImageToPermanentLocation(image.uri);
        
        // Process and verify the permanent URI
        const processedUri = processImageUri(permanentUri);
        const isValid = await verifyImageUri(processedUri);
        
        if (isValid) {
          setImageUri(processedUri);
          setShowCamera(false);
        } else {
          console.error('Image verification failed for URI:', processedUri);
          Alert.alert('Error', 'Failed to save captured image. Please try again.');
        }
      } catch (error) {
        console.error('Error processing captured image:', error);
        Alert.alert('Error', 'Failed to save captured image. Please try again.');
      }
    } else {
      console.error('No image URI received');
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };

  const handleImageFromGallery = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('Gallery image selected:', result.assets[0].uri);
        
        try {
          // Copy gallery image to permanent location first
          const permanentUri = await copyImageToPermanentLocation(result.assets[0].uri);
          
          // Process and verify the permanent URI
          const processedUri = processImageUri(permanentUri);
          const isValid = await verifyImageUri(processedUri);
          
          if (isValid) {
            setImageUri(processedUri);
          } else {
            console.error('Gallery image verification failed for URI:', processedUri);
            Alert.alert('Error', 'Failed to load selected image. Please try another image.');
          }
        } catch (error) {
          console.error('Error processing gallery image:', error);
          Alert.alert('Error', 'Failed to save selected image. Please try another image.');
        }
      } else {
        console.log('Gallery selection cancelled or no image selected');
      }
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      Alert.alert('Error', 'Failed to select image from gallery. Please try again.');
    }
  };

  const handleAnalyze = async () => {
    if (!imageUri) return;
    
    try {
      setIsAnalyzing(true);
      
      const analysisResult = await analyzeIngredients(imageUri);
      console.log("Analysis result:", JSON.stringify(analysisResult));
      
      router.push({
        pathname: '/(app)/result',
        params: {
          imageUri: imageUri,
          analyzeResult: JSON.stringify(analysisResult)
        }
      });
      
    } catch (error) {
      console.error('Error analyzing image:', error);
      
      let errorMessage = 'Failed to analyze the image. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCancel = () => {
    setImageUri(null);
  };

  const startCamera = () => {
    setShowCamera(true);
  };

  const closeCamera = () => {
    setShowCamera(false);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <StatusBar style="dark" backgroundColor="#FDFAF6" />
      <Stack flex={1} backgroundColor="#FDFAF6">
        {showCamera ? (
          <CameraView
            onImageCaptured={handleImageCaptured}
            onClose={closeCamera}
          />
        ) : (
          <Stack flex={1} paddingHorizontal="$6" paddingTop="$12" paddingBottom="$6">
            {/* Back Button */}
            <Stack marginBottom="$6">
              <TouchableOpacity onPress={handleBack}>
                <Stack 
                  flexDirection="row" 
                  alignItems="center" 
                  space="$2"
                  paddingVertical="$2"
                >
                  <Ionicons name="arrow-back" size={24} color="#363636" />
                  <Text 
                    fontSize={18} 
                    fontFamily="Baloo2SemiBold" 
                    color="#363636"
                  >
                    Back
                  </Text>
                </Stack>
              </TouchableOpacity>
            </Stack>

            {!imageUri ? (
              <Stack flex={1} justifyContent="center" alignItems="center" space="$6">
                {/* Title and Description */}
                <Stack alignItems="center" space="$3">
                  <Text 
                    fontSize={32}
                    fontWeight="600" 
                    color="#363636" 
                    textAlign="center"
                    fontFamily="Baloo2Bold"
                  >
                    Scan Product Ingredients
                  </Text>
                  
                  <Text 
                    fontSize={20} 
                    color="#363636" 
                    textAlign="center" 
                    opacity={0.7}
                    maxWidth={350}
                    fontFamily="Baloo2Regular"
                    lineHeight="$6"
                  >
                    Take a clear photo of the product's ingredient list to analyze its healthiness
                  </Text>
                </Stack>

                {/* Camera Icon */}
                <Stack 
                  width={120} 
                  height={120} 
                  backgroundColor="#363636" 
                  borderRadius={60} 
                  alignItems="center" 
                  justifyContent="center"
                  marginVertical="$4"
                >
                  <Ionicons name="camera" size={48} color="#FDFAF6" />
                </Stack>

                {/* Action Buttons */}
                <Stack width="100%" space="$4" paddingHorizontal="$4">
                  <AnimatedButton
                    onPress={startCamera}
                    backgroundColor="#363636"
                  >
                    <Stack flexDirection="row" alignItems="center" space="$3">
                      <Ionicons name="camera" size={24} color="#FDFAF6" />
                      <Text 
                        color="#FDFAF6"
                        fontSize={18}
                        fontFamily="Baloo2SemiBold"
                      >
                        Open Camera
                      </Text>
                    </Stack>
                  </AnimatedButton>

                  <AnimatedButton
                    onPress={handleImageFromGallery}
                    backgroundColor="#FDFAF6"
                    borderColor="#363636"
                  >
                    <Stack flexDirection="row" alignItems="center" space="$3">
                      <Ionicons name="images" size={20} color="#363636" />
                      <Text 
                        color="#363636"
                        fontSize={16}
                        fontFamily="Baloo2SemiBold"
                      >
                        Select from Gallery
                      </Text>
                    </Stack>
                  </AnimatedButton>
                </Stack>
              </Stack>
            ) : (
              <Stack flex={1} space="$6">
                {/* Image Preview */}
                <Stack 
                  flex={1} 
                  justifyContent="center" 
                  alignItems="center"
                  backgroundColor="#FFFFFF"
                  borderRadius="$6"
                  padding="$4"
                  borderWidth={1}
                  borderColor="rgba(54, 54, 54, 0.1)"
                >
                  <Image
                    source={{ uri: imageUri }}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 12,
                      resizeMode: 'contain'
                    }}
                    defaultSource={require('@/assets/placeholder.png')}
                    onError={(error) => {
                      console.error('Image loading error:', error);
                      Alert.alert('Error', 'Failed to load image. Please try taking another photo.');
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully');
                    }}
                  />
                </Stack>

                {/* Action Buttons */}
                <Stack flexDirection="row" space="$4">
                  <Stack flex={1}>
                    <AnimatedButton
                      onPress={handleCancel}
                      disabled={isAnalyzing}
                      backgroundColor="#FDFAF6"
                      borderColor="#FF3B30"
                    >
                      <Text 
                        color="#FF3B30"
                        fontSize={16}
                        fontFamily="Baloo2SemiBold"
                      >
                        Cancel
                      </Text>
                    </AnimatedButton>
                  </Stack>

                  <Stack flex={1}>
                    <AnimatedButton
                      onPress={handleAnalyze}
                      disabled={isAnalyzing}
                      backgroundColor="#363636"
                    >
                      {isAnalyzing ? (
                        <ActivityIndicator size="small" color="#FDFAF6" />
                      ) : (
                        <Text 
                          color="#FDFAF6"
                          fontSize={16}
                          fontFamily="Baloo2SemiBold"
                        >
                          Analyze
                        </Text>
                      )}
                    </AnimatedButton>
                  </Stack>
                </Stack>
              </Stack>
            )}
          </Stack>
        )}
      </Stack>
    </>
  );
} 