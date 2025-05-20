import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerTitle: 'Log In', headerBackTitle: 'Back' }} />
      <Stack.Screen name="signup" options={{ headerTitle: 'Sign Up', headerBackTitle: 'Back' }} />
    </Stack>
  );
} 