import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'expo-router';

export default function AppLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !user && pathname !== '/') {
      router.replace('/(auth)/login');
    }
  }, [user, isLoading, router, pathname]);

  // Don't render anything while checking authentication
  if (isLoading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="home" />
      <Stack.Screen name="scan" />
      <Stack.Screen name="result" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="chatbot" />
    </Stack>
  );
} 