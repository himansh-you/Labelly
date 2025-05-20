import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload an image to Firebase Storage
 * @param uri Local URI of the image to upload
 * @param path Path in storage where the image should be saved
 * @returns Download URL of the uploaded image
 */
export const uploadImage = async (uri: string, path: string): Promise<string> => {
  try {
    // Convert URI to blob
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Create storage reference
    const storageRef = ref(storage, path);
    
    // Upload the file
    await uploadBytes(storageRef, blob);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image to Firebase Storage:', error);
    throw error;
  }
};

/**
 * Get the download URL for an image in Firebase Storage
 * @param path Path to the image in storage
 * @returns Download URL of the image
 */
export const getImageUrl = async (path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting image URL from Firebase Storage:', error);
    throw error;
  }
};

/**
 * Delete an image from Firebase Storage
 * @param path Path to the image in storage
 */
export const deleteImage = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image from Firebase Storage:', error);
    throw error;
  }
}; 