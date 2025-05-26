import React, { useState, useEffect } from 'react';
import { 
  ActivityIndicator,
  Alert,
  Image 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack, Text } from '@tamagui/core';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
  withTiming,
  runOnJS
} from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// Enhanced Animated Button Component matching app design
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

export default function ScanScreen() {
  const router = useRouter();
  const { directCamera } = useLocalSearchParams<{ directCamera?: string }>();
  const [showCamera, setShowCamera] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Auto-open camera if directCamera param is passed
  useEffect(() => {
    if (directCamera === 'true') {
      setShowCamera(true);
    }
  }, [directCamera]);
  
  const handleImageCaptured = async (image: { uri: string }) => {
    console.log('Image captured:', image.uri);
    if (image.uri) {
      try {
        const permanentUri = await copyImageToPermanentLocation(image.uri);
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
          const permanentUri = await copyImageToPermanentLocation(result.assets[0].uri);
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

  const handleRetake = () => {
    setImageUri(null);
    setShowCamera(true);
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
            onGalleryPress={handleImageFromGallery}
          />
        ) : (
          <Stack flex={1} paddingHorizontal="$5" paddingTop="$12" paddingBottom="$6">
            {/* Enhanced Back Button */}
            <Stack marginBottom="$6">
              <TouchableOpacity onPress={handleBack} activeOpacity={0.7}>
                <Stack 
                  flexDirection="row" 
                  alignItems="center" 
                  space="$2"
                  paddingVertical="$3"
                  paddingHorizontal="$2"
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
              // Camera/Gallery Selection Screen
              <Stack flex={1} justifyContent="center" alignItems="center" space="$8">
                {/* Title Section */}
                <Stack alignItems="center" space="$4">
                  <Text
                    fontSize={28}
                    fontWeight="600"
                    color="#363636"
                    fontFamily="Baloo2SemiBold"
                    textAlign="center"
                  >
                    Scan Product
                  </Text>
                  <Text
                    fontSize={16}
                    color="#666"
                    fontFamily="Baloo2Regular"
                    textAlign="center"
                    lineHeight={22}
                  >
                    Take a photo or select from gallery to analyze ingredients
                  </Text>
                </Stack>

                {/* Camera Icon */}
                <Stack 
                  width={120} 
                  height={120} 
                  backgroundColor="#D3D3D3" 
                  borderRadius={60} 
                  alignItems="center" 
                  justifyContent="center"
                  shadowColor="#000"
                  shadowOffset={{ width: 0, height: 4 }}
                  shadowOpacity={0.1}
                  shadowRadius={8}
                  elevation={5}
                >
                  <Ionicons name="camera" size={48} color="#363636" />
                </Stack>

                {/* Action Buttons */}
                <Stack width="100%" space="$4" paddingHorizontal="$2">
                  <AnimatedButton
                    onPress={startCamera}
                    backgroundColor="#363636"
                    variant="primary"
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
                    variant="secondary"
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
              // Image Preview and Analysis Screen
              <Stack flex={1} space="$6">
                {/* Title */}
                <Stack alignItems="center" marginBottom="$4">
                  <Text
                    fontSize={24}
                    fontWeight="600"
                    color="#363636"
                    fontFamily="Baloo2SemiBold"
                  >
                    Review Image
                  </Text>
                  <Text
                    fontSize={14}
                    color="#666"
                    fontFamily="Baloo2Regular"
                    textAlign="center"
                  >
                    Make sure the nutrition label is clear and readable
                  </Text>
                </Stack>

                {/* Enhanced Image Preview */}
                <Stack 
                  flex={1} 
                  justifyContent="center" 
                  alignItems="center"
                  backgroundColor="#FFFFFF"
                  borderRadius="$6"
                  padding="$4"
                  borderWidth={1}
                  borderColor="rgba(54, 54, 54, 0.1)"
                  shadowColor="#000"
                  shadowOffset={{ width: 0, height: 2 }}
                  shadowOpacity={0.1}
                  shadowRadius={8}
                  elevation={3}
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

                {/* Enhanced Action Buttons with Retake Option */}
                <Stack space="$3" paddingHorizontal="$2">
                  {/* Top Row: Retake and Gallery */}
                  <Stack flexDirection="row" space="$3">
                    <AnimatedButton
                      onPress={handleRetake}
                      disabled={isAnalyzing}
                      backgroundColor="#FDFAF6"
                      borderColor="#007AFF"
                      variant="secondary"
                    >
                      <Stack flexDirection="row" alignItems="center" space="$2">
                        <Ionicons name="camera-reverse" size={20} color="#007AFF" />
                        <Text 
                          color="#007AFF"
                          fontSize={16}
                          fontFamily="Baloo2SemiBold"
                        >
                          Retake
                        </Text>
                      </Stack>
                    </AnimatedButton>

                    <AnimatedButton
                      onPress={handleImageFromGallery}
                      disabled={isAnalyzing}
                      backgroundColor="#FDFAF6"
                      borderColor="#666"
                      variant="secondary"
                    >
                      <Stack flexDirection="row" alignItems="center" space="$2">
                        <Ionicons name="images" size={18} color="#666" />
                        <Text 
                          color="#666"
                          fontSize={16}
                          fontFamily="Baloo2SemiBold"
                        >
                          Gallery
                        </Text>
                      </Stack>
                    </AnimatedButton>
                  </Stack>

                  {/* Bottom Row: Cancel and Analyze */}
                  <Stack flexDirection="row" space="$3">
                    <AnimatedButton
                      onPress={handleCancel}
                      disabled={isAnalyzing}
                      backgroundColor="#FDFAF6"
                      borderColor="#FF3B30"
                      variant="secondary"
                    >
                      <Stack flexDirection="row" alignItems="center" space="$2">
                        <Ionicons name="close-circle-outline" size={20} color="#FF3B30" />
                        <Text 
                          color="#FF3B30"
                          fontSize={16}
                          fontFamily="Baloo2SemiBold"
                        >
                          Cancel
                        </Text>
                      </Stack>
                    </AnimatedButton>

                    <AnimatedButton
                      onPress={handleAnalyze}
                      disabled={isAnalyzing}
                      backgroundColor="#363636"
                      variant="primary"
                    >
                      {isAnalyzing ? (
                        <Stack flexDirection="row" alignItems="center" space="$3">
                          <ActivityIndicator size="small" color="#FDFAF6" />
                          <Text 
                            color="#FDFAF6"
                            fontSize={16}
                            fontFamily="Baloo2SemiBold"
                          >
                            Analyzing...
                          </Text>
                        </Stack>
                      ) : (
                        <Stack flexDirection="row" alignItems="center" space="$3">
                          <Ionicons name="analytics" size={20} color="#FDFAF6" />
                          <Text 
                            color="#FDFAF6"
                            fontSize={16}
                            fontFamily="Baloo2SemiBold"
                          >
                            Analyze
                          </Text>
                        </Stack>
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