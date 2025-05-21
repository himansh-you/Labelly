import { auth } from './firebase';
import { saveScan } from './firestore';
import { uploadImage } from './storage';

// Base URL for API calls
const API_BASE_URL = 'http://10.0.2.2:5000'; // For Android emulator
// Use 'http://localhost:5000' for web or 'http://127.0.0.1:5000' for iOS simulator


const getAuthToken = async (): Promise<string> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return await user.getIdToken();
};


export const analyzeIngredients = async (imageUri: string) => {
  try {
    const token = await getAuthToken();
    const user = auth.currentUser;
    
    if (!user) throw new Error('User not authenticated');
    
    // Create form data with the image
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'ingredient_image.jpg',
    } as unknown as Blob);
    
    // Send to backend for processing
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze ingredients');
    }
    
    const analysisData = await response.json();
    
    // Save to Firestore
    const imageStoragePath = `scans/${user.uid}/${Date.now()}.jpg`;
    const imageUrl = await uploadImage(imageUri, imageStoragePath);
    
    await saveScan({
      userId: user.uid,
      analysisResult: {
        ...analysisData,
        imageUrl
      }
    });
    
    return analysisData;
  } catch (error) {
    console.error('Error analyzing ingredients:', error);
    throw error;
  }
};


export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};

// Function to analyze an image with Perplexity Sonar API
export const analyzeImage = async (imageUri: string): Promise<any> => {
  try {
    // Create a FormData object to send the image
    const formData = new FormData();
    
    // Append the image file to the FormData object
    formData.append('image', {
      uri: imageUri,
      name: 'image.jpg',
      type: 'image/jpeg',
    } as any);

    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
};

// Function to mock Perplexity Sonar API response for development
export const mockAnalyzeImage = async (): Promise<any> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return mock data
  return {
    healthScore: 'Moderate',
    summary: 'This product contains some potentially concerning ingredients.',
    insights: [
      'Contains artificial preservatives (sodium benzoate)',
      'Contains added sugars (high fructose corn syrup)',
      'No artificial colors detected',
    ],
    warnings: [
      {
        ingredient: 'Sodium Benzoate',
        level: 'moderate',
        description: 'A preservative that may cause allergic reactions in some individuals.',
      },
      {
        ingredient: 'High Fructose Corn Syrup',
        level: 'high',
        description: 'A sweetener linked to obesity and metabolic disorders when consumed in excess.',
      },
    ],
  };
}; 