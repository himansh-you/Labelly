import React, { useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  Easing 
} from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const fadeIn = useSharedValue(0);

  useEffect(() => {
    fadeIn.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.quad),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  const handleScanPress = () => {
    router.push('/(app)/scan');
  };

  return (
    <>
      <StatusBar style="dark" backgroundColor="#FDFAF6" />
      <SafeAreaView style={styles.container}>
        <AnimatedView style={[animatedStyle, styles.content]}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Logo width={280} height={93} color="#363636" />
            
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>
                Welcome{user ? `, ${user.email?.split('@')[0]}` : ''}!
              </Text>
              
              <Text style={styles.subtitle}>
                Labelly empowers you to understand your product ingredients, enabling you to make informed decisions and choose wisely.
              </Text>

              <Text style={styles.howItWorksText}>
                How it Works?
              </Text>
            </View>
          </View>

          {/* Illustration Section */}
          <View style={styles.illustrationContainer}>
            <View style={styles.illustrationPlaceholder}>
              <View style={styles.phoneIcon}>
                <Text style={styles.phoneText}>📱</Text>
              </View>
              <View style={styles.arrowContainer}>
                <Text style={styles.arrowText}>→</Text>
              </View>
              <View style={styles.ingredientsCard}>
                <Text style={styles.ingredientsTitle}>INGREDIENTS</Text>
                <View style={styles.ingredientLines}>
                  <View style={styles.ingredientLine} />
                  <View style={styles.ingredientLine} />
                  <View style={styles.ingredientLine} />
                  <View style={styles.ingredientLine} />
                </View>
              </View>
            </View>
          </View>

          {/* Button Section */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleScanPress} style={styles.scanButton}>
              <Text style={styles.scanButtonText}>
                Scan a label to begin
              </Text>
            </TouchableOpacity>
          </View>
        </AnimatedView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFAF6',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 30,
    gap: 8,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#363636',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#363636',
    textAlign: 'center',
    opacity: 0.7,
    maxWidth: 420,
    lineHeight: 28,
    marginBottom: 16,
  },
  howItWorksText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#363636',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  illustrationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  illustrationPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  phoneIcon: {
    width: 80,
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#363636',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  phoneText: {
    fontSize: 32,
  },
  arrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 32,
    color: '#363636',
    fontWeight: 'bold',
  },
  ingredientsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#363636',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    minWidth: 150,
  },
  ingredientsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#363636',
    marginBottom: 12,
    textAlign: 'center',
  },
  ingredientLines: {
    gap: 6,
  },
  ingredientLine: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
  },
  buttonContainer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: '#363636',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 20,
  },
}); 