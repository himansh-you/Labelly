import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import HealthSummaryCard from '@/components/HealthSummaryCard';
import ScanButton from '@/components/ScanButton';

interface AnalysisResult {
  healthScore: string;
  summary: string;
  insights: string[];
  warnings: {
    ingredient: string;
    level: 'low' | 'moderate' | 'high';
    description: string;
  }[];
}

export default function ResultScreen() {
  const router = useRouter();
  const { result: resultParam, imageUri } = useLocalSearchParams<{
    result: string;
    imageUri: string;
  }>();
  
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (resultParam) {
      try {
        const parsedResult = JSON.parse(resultParam);
        setResult(parsedResult);
      } catch (error) {
        console.error('Error parsing result:', error);
      }
    }
  }, [resultParam]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Health Analysis: ${result?.healthScore} - ${result?.summary}`,
        // url: imageUri // Uncomment to share image
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleNewScan = () => {
    // Navigate back to scan screen
    router.push('/(app)/scan');
  };

  if (!result) {
    return (
      <View style={styles.container}>
        <Text>Loading result...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analysis Result</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <FontAwesome name="share-alt" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {imageUri && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            defaultSource={require('@/assets/placeholder.png')}
          />
        </View>
      )}

      <HealthSummaryCard
        healthScore={result.healthScore}
        summary={result.summary}
        insights={result.insights}
        warnings={result.warnings}
      />

      <View style={styles.newScanContainer}>
        <ScanButton size="medium" onPress={handleNewScan} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  shareButton: {
    padding: 8,
  },
  imageContainer: {
    margin: 16,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  image: {
    flex: 1,
    resizeMode: 'cover',
  },
  newScanContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
}); 