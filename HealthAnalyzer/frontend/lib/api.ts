import { auth } from './firebase';

// Base URL for API calls
const API_BASE_URL = 'https://labelly.onrender.com';
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

export const sendChatbotMessage = async (message: string, context?: any) => {
  try {
    const token = await getAuthToken();
    const user = auth.currentUser;
    
    if (!user) throw new Error('User not authenticated');
    
    const response = await fetch(`${API_BASE_URL}/api/chatbot`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        context: context || {}
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get chatbot response');
    }
    
    const chatbotData = await response.json();
    return chatbotData;

  } catch (error) {
    console.error('Error sending chatbot message:', error);
    throw error;
  }
};