import * as ImagePicker from 'expo-image-picker';

export interface CapturedImage {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

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
