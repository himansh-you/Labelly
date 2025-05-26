import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack, Text } from '@tamagui/core';
import { CameraView as ExpoCameraView, CameraType, useCameraPermissions, FlashMode } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat,
  withTiming,
  withSequence
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CameraViewProps {
  onImageCaptured: (image: { uri: string }) => void | Promise<void>;
  onClose: () => void;
}

const AnimatedStack = Animated.createAnimatedComponent(Stack);

export default function CameraView({ onImageCaptured, onClose }: CameraViewProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const cameraRef = useRef<ExpoCameraView>(null);

  // Scanning animation
  const scanLinePosition = useSharedValue(0);

  useEffect(() => {
    // Animated scanning line
    scanLinePosition.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      false
    );
  }, []);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: scanLinePosition.value * 200, // 200 is the scan area height
      },
    ],
  }));

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <Stack flex={1} backgroundColor="#000" justifyContent="center" alignItems="center" space="$4">
        <Text fontSize={18} color="white" textAlign="center" fontFamily="Baloo2Regular">
          We need your permission to show the camera
        </Text>
        <TouchableOpacity onPress={requestPermission}>
          <Stack 
            backgroundColor="#363636" 
            paddingHorizontal="$6" 
            paddingVertical="$3" 
            borderRadius="$4"
          >
            <Text color="white" fontSize={16} fontFamily="Baloo2SemiBold">
              Grant Permission
            </Text>
          </Stack>
        </TouchableOpacity>
      </Stack>
    );
  }

  const toggleFlash = () => {
    setFlash(flash === 'off' ? 'on' : 'off');
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        if (photo) {
          onImageCaptured({ uri: photo.uri });
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageCaptured({ uri: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error picking from gallery:', error);
    }
  };

  return (
    <>
      <StatusBar style="light" backgroundColor="#000" />
      <View style={styles.container}>
        <ExpoCameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          flash={flash}
        >
          {/* Top Overlay with Controls */}
          <Stack 
            position="absolute" 
            top={0} 
            left={0} 
            right={0} 
            paddingTop="$12" 
            paddingHorizontal="$6"
            zIndex={10}
          >
            <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
              {/* Close Button */}
              <TouchableOpacity onPress={onClose}>
                <Stack 
                  width={50} 
                  height={50} 
                  backgroundColor="rgba(255,255,255,0.2)" 
                  borderRadius={25} 
                  alignItems="center" 
                  justifyContent="center"
                >
                  <Ionicons name="close" size={24} color="white" />
                </Stack>
              </TouchableOpacity>

              {/* Flash Toggle */}
              <TouchableOpacity onPress={toggleFlash}>
                <Stack 
                  width={50} 
                  height={50} 
                  backgroundColor="rgba(255,255,255,0.2)" 
                  borderRadius={25} 
                  alignItems="center" 
                  justifyContent="center"
                >
                  <Ionicons 
                    name={flash === 'on' ? 'flash' : 'flash-off'} 
                    size={24} 
                    color={flash === 'on' ? '#FFD700' : 'white'} 
                  />
                </Stack>
              </TouchableOpacity>
            </Stack>
          </Stack>

          {/* Center Scan Area */}
          <Stack 
            position="absolute" 
            top="50%" 
            left="50%" 
            style={{
              transform: [
                { translateX: -150 },
                { translateY: -100 }
              ]
            }}
            zIndex={5}
          >
            {/* Scan Frame */}
            <Stack
              width={300}
              height={200}
              borderWidth={3}
              borderColor="rgba(255,255,255,0.8)"
              borderRadius={20}
              backgroundColor="transparent"
              position="relative"
              overflow="hidden"
            >
              {/* Corner Indicators */}
              <Stack position="absolute" top={-2} left={-2} width={30} height={30}>
                <Stack width={20} height={3} backgroundColor="white" />
                <Stack width={3} height={20} backgroundColor="white" />
              </Stack>
              <Stack position="absolute" top={-2} right={-2} width={30} height={30}>
                <Stack width={20} height={3} backgroundColor="white" position="absolute" right={0} />
                <Stack width={3} height={20} backgroundColor="white" position="absolute" right={0} />
              </Stack>
              <Stack position="absolute" bottom={-2} left={-2} width={30} height={30}>
                <Stack width={3} height={20} backgroundColor="white" position="absolute" bottom={0} />
                <Stack width={20} height={3} backgroundColor="white" position="absolute" bottom={0} />
              </Stack>
              <Stack position="absolute" bottom={-2} right={-2} width={30} height={30}>
                <Stack width={3} height={20} backgroundColor="white" position="absolute" bottom={0} right={0} />
                <Stack width={20} height={3} backgroundColor="white" position="absolute" bottom={0} right={0} />
              </Stack>

              {/* Animated Scanning Line */}
              <AnimatedStack
                position="absolute"
                left={0}
                right={0}
                height={2}
                backgroundColor="rgba(76, 175, 80, 0.8)"
                style={scanLineStyle}
              />
            </Stack>

            {/* Instruction Text */}
            <Stack alignItems="center" marginTop="$4">
              <Text 
                color="white" 
                fontSize={16} 
                fontFamily="Baloo2SemiBold"
                textAlign="center"
                backgroundColor="rgba(0,0,0,0.5)"
                paddingHorizontal="$4"
                paddingVertical="$2"
                borderRadius="$3"
              >
                Align nutrition label within frame
              </Text>
            </Stack>
          </Stack>

          {/* Bottom Controls */}
          <Stack 
            position="absolute" 
            bottom={0} 
            left={0} 
            right={0} 
            paddingBottom="$8" 
            paddingHorizontal="$6"
            zIndex={10}
          >
            <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
              {/* Gallery Button */}
              <TouchableOpacity onPress={pickFromGallery}>
                <Stack 
                  width={60} 
                  height={60} 
                  backgroundColor="rgba(255,255,255,0.2)" 
                  borderRadius={30} 
                  alignItems="center" 
                  justifyContent="center"
                >
                  <Ionicons name="images" size={28} color="white" />
                </Stack>
              </TouchableOpacity>

              {/* Capture Button */}
              <TouchableOpacity onPress={takePicture}>
                <Stack 
                  width={80} 
                  height={80} 
                  backgroundColor="white" 
                  borderRadius={40} 
                  alignItems="center" 
                  justifyContent="center"
                  borderWidth={4}
                  borderColor="rgba(255,255,255,0.3)"
                >
                  <Stack 
                    width={60} 
                    height={60} 
                    backgroundColor="#363636" 
                    borderRadius={30} 
                    alignItems="center" 
                    justifyContent="center"
                  >
                    <Ionicons name="camera" size={24} color="white" />
                  </Stack>
                </Stack>
              </TouchableOpacity>

              {/* Placeholder for symmetry */}
              <Stack width={60} height={60} />
            </Stack>
          </Stack>

          {/* Dark Overlay */}
          <Stack 
            position="absolute" 
            top={0} 
            left={0} 
            right={0} 
            bottom={0} 
            backgroundColor="rgba(0,0,0,0.3)"
            pointerEvents="none"
            zIndex={1}
          />
        </ExpoCameraView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
}); 