import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Share, ActivityIndicator, Alert, TextStyle, ViewStyle, ImageStyle } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import ScanButton from '@/components/ScanButton';
import { getUserScans, getScanById, ScanData } from '@/lib/firestore';
import { auth } from '@/lib/firebase';

// Markdown styles definition
type MarkdownStyle = {
  [key: string]: ViewStyle | TextStyle | ImageStyle;
};

const markdownStyles: MarkdownStyle = {
  heading1: { fontSize: 22, fontWeight: 'bold' as const, marginVertical: 8 },
  heading2: { fontSize: 18, fontWeight: 'bold' as const, marginVertical: 6 },
  heading3: { fontSize: 16, fontWeight: 'bold' as const, marginVertical: 4 },
  paragraph: { fontSize: 16, lineHeight: 24, marginVertical: 4, color: '#333' },
  list_item: { fontSize: 16, marginVertical: 2, color: '#333' },
  bullet_list: { marginLeft: 8 },
  ordered_list: { marginLeft: 8 },
  strong: { fontWeight: 'bold' as const },
  em: { fontStyle: 'italic' as const },
  link: { color: '#007AFF', textDecorationLine: 'underline' as const },
  blockquote: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 8, borderLeftWidth: 4, borderLeftColor: '#ddd' },
  code_block: { backgroundColor: '#f8f8f8', padding: 10, borderRadius: 4, fontFamily: 'monospace' },
  code_inline: { backgroundColor: '#f8f8f8', padding: 2, fontFamily: 'monospace' }
};

export default function ResultScreen() {
  const router = useRouter();
  const { scanId, imageUri, analyzeResult } = useLocalSearchParams<{
    scanId: string;
    imageUri: string;
    analyzeResult: string;
  }>();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanData, setScanData] = useState<ScanData | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [citations, setCitations] = useState<any[]>([]);

  useEffect(() => {
    async function fetchScanData() {
      try {
        setIsLoading(true);
        setError(null);

        // If analyzeResult is provided, use it directly
        if (analyzeResult) {
          try {
            const parsedResult = JSON.parse(analyzeResult);
            
            // Just store the raw analysis and citations
            setMarkdownContent(parsedResult.analysis || '');
            setCitations(parsedResult.citations || []);
            setIsLoading(false);
            return;
          } catch (parseError) {
            console.error('Error parsing analyzeResult:', parseError);
            // Continue to fetch from Firestore if parsing fails
          }
        }
        
        // Fallback to the original Firestore fetch logic
        const user = auth.currentUser;
        if (!user) {
          throw new Error('User not authenticated');
        }

        let scan: ScanData | null = null;
        
        // If we have a scanId, fetch that specific scan
        if (scanId) {
          scan = await getScanById(scanId);
        } else {
          // Otherwise, get the most recent scan for this user
          const userScans = await getUserScans(user.uid);
          if (userScans.length > 0) {
            scan = userScans[0];
          }
        }
        
        if (!scan) {
          throw new Error('No scan data found');
        }
        
        setScanData(scan);
        
        // Store the raw analysis content
        if (scan.analysisResult) {
          setMarkdownContent(scan.analysisResult.analysis || '');
          setCitations(scan.analysisResult.citations || []);
        }
      } catch (error) {
        console.error('Error fetching scan data:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchScanData();
  }, [scanId, analyzeResult]);

  const handleShare = async () => {
    if (!markdownContent) return;
    
    try {
      await Share.share({
        message: markdownContent,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share analysis');
    }
  };

  const handleNewScan = () => {
    router.push('/(app)/scan');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading analysis results...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <FontAwesome name="exclamation-triangle" size={50} color="#ff3b30" />
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleNewScan}>
          <Text style={styles.retryButtonText}>Try a New Scan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!markdownContent) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>No analysis result found.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleNewScan}>
          <Text style={styles.retryButtonText}>Try a New Scan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Get the image URI either from params or from the scan data
  const displayImageUri = imageUri || (scanData?.analysisResult?.imageUrl || null);

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

      {displayImageUri && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: displayImageUri }}
            style={styles.image}
            defaultSource={require('@/assets/placeholder.png')}
            onError={(error) => {
              console.error('Image loading error in result screen:', error);
            }}
            onLoad={() => {
              console.log('Result image loaded successfully');
            }}
          />
        </View>
      )}

      <View style={styles.markdownContainer}>
        <Markdown style={markdownStyles}>
          {markdownContent}
        </Markdown>
        
        {citations && citations.length > 0 && (
          <View style={styles.citationsContainer}>
            <Text style={styles.citationsTitle}>Sources:</Text>
            {citations.map((citation, index) => (
              <Text key={index} style={styles.citationText}>
                {index + 1}. {citation.source || citation.url || 'Unknown source'}
              </Text>
            ))}
          </View>
        )}
      </View>

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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    backgroundColor: '#f0f0f0',
  },
  image: {
    flex: 1,
    resizeMode: 'cover',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff3b30',
  },
  errorText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  newScanContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  markdownContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  citationsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  citationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  citationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
}); 