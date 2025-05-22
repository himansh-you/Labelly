import { 
  collection, 
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Collection references
const SCANS_COLLECTION = 'scans';

// Types
export interface ScanData {
  userId: string;
  analysisResult: any;
  timestamp: Timestamp;
  id?: string;
}


export const getUserScans = async (userId: string) => {
  try {
    const q = query(
      collection(db, SCANS_COLLECTION), 
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const scans: ScanData[] = [];
    
    querySnapshot.forEach((doc) => {
      scans.push({
        id: doc.id,
        ...doc.data()
      } as ScanData);
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