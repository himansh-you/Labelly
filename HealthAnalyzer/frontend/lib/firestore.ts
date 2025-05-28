import { 
  collection, 
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc,
  addDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Collection references
const SCANS_COLLECTION = 'scans';

// Types - Updated to match backend field names
export interface ScanData {
  user_id: string;  // Changed from userId to user_id
  analysis_result: any;  // Changed from analysisResult to analysis_result
  timestamp: Timestamp;
  id?: string;
}

// Enhanced interface for history items
export interface HistoryItem {
  id?: string;
  userId: string;
  productName: string;
  composition?: string;
  safetyScore: number;
  imageUri?: string;
  scanTimestamp: Timestamp;
  analysisData: any;
}

export const getUserScans = async (userId: string) => {
  try {
    const q = query(
      collection(db, SCANS_COLLECTION), 
      where('user_id', '==', userId)  // Changed from 'userId' to 'user_id'
    );
    
    const querySnapshot = await getDocs(q);
    const scans: ScanData[] = [];
    
    querySnapshot.forEach((doc) => {
      scans.push({
        id: doc.id,
        ...doc.data()
      } as ScanData);
    });
    
    scans.sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
      return b.timestamp.toMillis() - a.timestamp.toMillis();
    });
    
    return scans;
  } catch (error) {
    console.error('Error getting user scans: ', error);
    throw error;
  }
};

export const getScanById = async (scanId: string) => {
  try {
    const docRef = doc(db, SCANS_COLLECTION, scanId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as ScanData;
    } else {
      throw new Error('Scan not found');
    }
  } catch (error) {
    console.error('Error getting scan: ', error);
    throw error;
  }
};

// Transform scan data to history format
export const getUserHistory = async (userId: string): Promise<HistoryItem[]> => {
  try {
    const scans = await getUserScans(userId);
    
    return scans.map(scan => {
      // Extract data from analysis result - Updated field name
      const analysisData = scan.analysis_result;  // Changed from scan.analysisResult
      let productName = 'Product Scan';
      let composition = 'Not available';
      let safetyScore = 75;
      
      try {
        if (analysisData?.choices?.[0]?.message?.content) {
          const analysisContent = analysisData.choices[0].message.content;
          
          // Try to extract structured data
          const jsonMatch = analysisContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            productName = parsed.product_name || 'Product Scan';
            
            // Handle both arrays and strings for ingredients
            if (parsed.main_ingredients) {
              if (Array.isArray(parsed.main_ingredients)) {
                composition = parsed.main_ingredients.join(', ');
              } else {
                composition = parsed.main_ingredients;
              }
            } else if (parsed.ingredients_summary) {
              composition = parsed.ingredients_summary.substring(0, 100) + '...';
            } else {
              composition = 'Ingredients available in details';
            }
            
            // Extract safety score number
            if (parsed.safety_score) {
              const scoreMatch = parsed.safety_score.toString().match(/\d+/);
              safetyScore = scoreMatch ? parseInt(scoreMatch[0]) : 75;
            }
          } else {
            // Fallback: try to extract product name from the text content
            const lines = analysisContent.split('\n');
            for (const line of lines) {
              if (line.toLowerCase().includes('product') && line.includes(':')) {
                productName = line.split(':')[1]?.trim() || 'Product Scan';
                break;
              }
            }
          }
        }
      } catch (error) {
        console.warn('Error parsing analysis data:', error);
      }

      return {
        id: scan.id,
        userId: scan.user_id,  // Map backend field to frontend field
        productName,
        composition,
        safetyScore,
        imageUri: undefined, // Can be enhanced to store image URLs
        scanTimestamp: scan.timestamp,
        analysisData: scan.analysis_result  // Changed from scan.analysisResult
      };
    });
  } catch (error) {
    console.error('Error getting user history:', error);
    throw error;
  }
};

// Add a new function to get multiple scans by IDs for comparison
export const getScansByIds = async (scanIds: string[]) => {
  try {
    const scans: ScanData[] = [];
    
    for (const scanId of scanIds) {
      const scan = await getScanById(scanId);
      if (scan) {
        scans.push(scan);
      }
    }
    
    return scans;
  } catch (error) {
    console.error('Error getting scans by IDs:', error);
    throw error;
  }
};

// Add a function to get comparison data for specific products
export const getComparisonData = async (userId: string, scanIds: string[]) => {
  try {
    const userHistory = await getUserHistory(userId);
    return userHistory.filter(item => scanIds.includes(item.id!));
  } catch (error) {
    console.error('Error getting comparison data:', error);
    throw error;
  }
}; 