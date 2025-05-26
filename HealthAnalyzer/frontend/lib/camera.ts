import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export interface CapturedImage {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

// Copy image to permanent location to prevent ENOENT errors
export const copyImageToPermanentLocation = async (sourceUri: string): Promise<string> => {
  try {
    console.log('Copying image from:', sourceUri);
    
    // Generate a unique filename
    const filename = `captured_image_${Date.now()}.jpg`;
    const permanentUri = `${FileSystem.documentDirectory}${filename}`;
    
    // Copy the image to a permanent location
    await FileSystem.copyAsync({
      from: sourceUri,
      to: permanentUri
    });
    
    console.log('Image copied to permanent location:', permanentUri);
    
    // Verify the copied file exists
    const fileInfo = await FileSystem.getInfoAsync(permanentUri);
    if (!fileInfo.exists) {
      throw new Error('Failed to copy image to permanent location');
    }
    
    return permanentUri;
  } catch (error) {
    console.error('Error copying image:', error);
    throw new Error('Failed to save image permanently');
  }
};

// Utility function to validate and process image URIs
export const processImageUri = (uri: string): string => {
  console.log('Processing image URI:', uri);
  
  // Ensure the URI is properly formatted for React Native Image component
  if (uri.startsWith('file://')) {
    return uri;
  } else if (uri.startsWith('/')) {
    return `file://${uri}`;
  }
  
  return uri;
};

// Utility function to verify image exists and is accessible
export const verifyImageUri = async (uri: string): Promise<boolean> => {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    console.log('Image info:', info);
    return info.exists;
  } catch (error) {
    console.error('Error verifying image URI:', error);
    return false;
  }
};

export const requestCameraPermission = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
};

export const requestMediaLibraryPermission = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
};

export const pickImageFromGallery = async (): Promise<CapturedImage | null> => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
    //   aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      return {
        uri: result.assets[0].uri,
        width: result.assets[0].width,
        height: result.assets[0].height,
      };
    }
    return null;
  } catch (error) {
    console.error('Error picking image from gallery:', error);
    throw error;
  }
};
