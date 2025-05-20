import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Image 
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import CameraView from '@/components/CameraView';
import { mockAnalyzeImage } from '@/lib/api'; // Replace with real API in production

interface CapturedImage {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

export default function ScanScreen() {
  const router = useRouter();
  const [showCamera, setShowCamera] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const handleImageCaptured = (image: CapturedImage) => {
    setImageUri(image.uri);
    setShowCamera(false);
  };

  const handleImageFromGallery = async () => {
    try {
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error picking image:', error);
    }
  };

  const handleAnalyze = async () => {
    if (!imageUri) return;
    
    try {
      setIsAnalyzing(true);
      
      // In a real implementation, send the image to backend/API
      // For mockup purposes, use a mock function that returns predefined data
      const analysisResult = await mockAnalyzeImage();
      
      // Navigate to results with the analysis data
      // Note: There seems to be a type compatibility issue with the router navigation
      // For this implementation, we'll use an alert instead
      Alert.alert(
        'Analysis Complete',
        'The ingredients have been analyzed successfully.',
        [
          {
            text: 'View Results',
            onPress: () => {
              // In a production app, we would navigate to the results screen
              console.log('Would navigate to results with:', {
                result: analysisResult,
                imageUri
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert('Error', 'Failed to analyze the image. Please try again.');
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Ingredients</Text>
        <View style={{ width: 24 }} />
      </View>

      {showCamera ? (
        <CameraView
          onImageCaptured={handleImageCaptured}
          onClose={closeCamera}
        />
      ) : !imageUri ? (
        <>
          <View style={styles.cameraPrompt}>
            <Text style={styles.promptTitle}>Scan Product Ingredients</Text>
            <Text style={styles.promptText}>
              Take a clear photo of the product's ingredient list to analyze its healthiness
            </Text>
            
            <TouchableOpacity 
              style={styles.cameraButton}
              onPress={startCamera}
            >
              <FontAwesome name="camera" size={24} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.cameraButtonText}>Open Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.galleryButton}
              onPress={handleImageFromGallery}
            >
              <FontAwesome name="image" size={20} color="#4CAF50" style={styles.buttonIcon} />
              <Text style={styles.galleryButtonText}>Select from Gallery</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.previewImage}
              defaultSource={require('@/assets/placeholder.png')}
            />
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={isAnalyzing}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.analyzeButton}
              onPress={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.analyzeButtonText}>Analyze</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cameraPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  promptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  promptText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    width: '80%',
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  buttonIcon: {
    marginRight: 10,
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    backgroundColor: '#fff',
    width: '80%',
  },
  galleryButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '500',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewImage: {
    width: '100%',
    height: '80%',
    borderRadius: 12,
    resizeMode: 'contain',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff3b30',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  cancelButtonText: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: '500',
  },
  analyzeButton: {
    flex: 1,
    padding: 16,
    marginLeft: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#4CAF50',
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
}); 