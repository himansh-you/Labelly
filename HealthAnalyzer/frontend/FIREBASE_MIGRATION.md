# Firebase Migration Guide

This document outlines the changes made to migrate the HealthAnalyzer app from Supabase to Firebase.

## Overview of Changes

### Authentication
- Replaced Supabase auth with Firebase Authentication
- Updated AuthContext to use Firebase's auth methods
- Updated login/signup screens to work with Firebase

### Database
- Replaced Supabase PostgreSQL with Firebase Firestore
- Created Firestore service for database operations
- Implemented collections for user data and scan logs

### Storage
- Replaced Supabase Storage with Firebase Cloud Storage
- Created Storage service for image upload/retrieval

## Setup Instructions

### 1. Firebase Project Setup
1. Create a new Firebase project at https://console.firebase.google.com/
2. Enable Authentication (Email/Password and Google providers)
3. Create a Firestore database in production mode
4. Enable Storage for your project

### 2. Configuration
Update the Firebase configuration in `/lib/firebase.ts` with your project credentials:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Firestore Rules
Set up appropriate security rules for your Firestore database and Storage:

```
// Firestore rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scans/{scanId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}

// Storage rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /scans/{userId}/{imageId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## API Changes

### Auth API
- `signIn(email, password)` - Sign in with email/password
- `signUp(email, password)` - Create a new account
- `signInWithGoogle()` - Sign in with Google
- `signOut()` - Sign out the current user

### Database API
- `saveScan(scanData)` - Save a new scan to Firestore
- `getUserScans(userId)` - Get all scans for a user
- `getScanById(scanId)` - Get a specific scan by ID

### Storage API
- `uploadImage(uri, path)` - Upload an image to Firebase Storage
- `getImageUrl(path)` - Get download URL for an image
- `deleteImage(path)` - Delete an image from storage

## Backend Changes

The backend API now needs to verify Firebase auth tokens instead of Supabase tokens. The token verification code needs to be updated in all API endpoints. 