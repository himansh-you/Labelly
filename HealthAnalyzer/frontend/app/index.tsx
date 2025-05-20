import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function IndexPage() {
  const { user, isLoading } = useAuth();

  // Wait for auth to initialize before redirecting
  if (isLoading) {
    return null;
  }

  // Redirect to the appropriate screen based on authentication state
  return user ? <Redirect href="/(app)" /> : <Redirect href="/(auth)/login" />;
} 