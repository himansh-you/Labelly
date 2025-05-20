import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyAPxNxQ7mN3Vk1knz6Yi0no8g-OrjcPU3o",
    authDomain: "labelly-f8bcc.firebaseapp.com",
    projectId: "labelly-f8bcc",
    storageBucket: "labelly-f8bcc.appspot.com",
    messagingSenderId: "1050914591906",
    appId: "1:1050914591906:web:15e608b85758c7cddf33fb",
    measurementId: "G-PR4WYV0XY9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

export default app; 