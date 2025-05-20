import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, Image } from 'react-native';
import ScanButton from '@/components/ScanButton';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Welcome{user ? `, ${user.email?.split('@')[0]}` : ''}
          </Text>
          <Text style={styles.subtitle}>
            Scan any ingredients label to analyze its health impact
          </Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>1</Text>
            <Text style={styles.instructionText}>
              Point your camera at an ingredients list
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>2</Text>
            <Text style={styles.instructionText}>
              Make sure the text is clearly visible
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>3</Text>
            <Text style={styles.instructionText}>
              Get instant health insights about the product
            </Text>
          </View>
        </View>

        {/* Main CTA Scan Button */}
        <View style={styles.buttonContainer}>
          <ScanButton />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 40,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  instructionsContainer: {
    width: '100%',
    marginVertical: 30,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  instructionNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4CAF50',
    textAlign: 'center',
    lineHeight: 30,
    color: '#fff',
    fontWeight: '700',
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
}); 