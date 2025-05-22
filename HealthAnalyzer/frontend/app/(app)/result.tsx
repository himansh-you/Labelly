import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Share, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import HealthSummaryCard from '@/components/HealthSummaryCard';
import ScanButton from '@/components/ScanButton';
import { getUserScans, getScanById, ScanData } from '@/lib/firestore';
import { auth } from '@/lib/firebase';

interface Warning {
  ingredient: string;
  level: 'low' | 'moderate' | 'high';
  description: string;
}

interface AnalysisResult {
  analysis: string;
  citations?: any[];
  healthScore?: string;
  summary?: string;
  insights?: string[];
  warnings?: Warning[];
}

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
  const [formattedResult, setFormattedResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    async function fetchScanData() {
      try {
        setIsLoading(true);
        setError(null);

        // If analyzeResult is provided, use it directly
        if (analyzeResult) {
          try {
            const parsedResult = JSON.parse(analyzeResult);
            
            // Create formatted result directly from the parsed result
            const result: AnalysisResult = {
              analysis: parsedResult.analysis || '',
              citations: parsedResult.citations || [],
            };
            
            // Process the result same way as before
            processAnalysisResult(result);
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
        
        // Format the analysis result
        const analysisResult = scan.analysisResult;
        
        // Process the AI's response into our expected format
        const result: AnalysisResult = {
          analysis: analysisResult.analysis || '',
          citations: analysisResult.citations || [],
        };
        
        // Process the analysis result
        processAnalysisResult(result);
      } catch (error) {
        console.error('Error fetching scan data:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    
    // Function to process analysis text and extract structured data
    function processAnalysisResult(result: AnalysisResult) {
      if (result.analysis) {
        // Try to extract health verdict (Safe, Conditionally Safe, Potentially Unsafe)
        const healthVerdictMatch = result.analysis.match(/Overall Safety Verdict:?\s*(Safe|Conditionally Safe|Potentially Unsafe)/i);
        if (healthVerdictMatch) {
          result.healthScore = healthVerdictMatch[1];
        } else {
          result.healthScore = 'Unknown';
        }
        
        // Extract a summary from the beginning of the analysis
        const firstParagraphEnd = result.analysis.indexOf('\n\n');
        if (firstParagraphEnd > 0) {
          result.summary = result.analysis.substring(0, firstParagraphEnd).trim();
        } else {
          result.summary = result.analysis.substring(0, 150) + '...';
        }
        
        // Extract warnings for flagged ingredients
        const warnings: Warning[] = [];
        const lines = result.analysis.split('\n');
        
        let currentIngredient = '';
        let currentConcern = '';
        let currentRisk = '';
        
        for (const line of lines) {
          // Check for ingredient names
          if (line.match(/^[A-Z][a-zA-Z\s\-()]+:$/)) {
            currentIngredient = line.replace(':', '').trim();
          } 
          // Check for risk level
          else if (line.includes('Risk level:')) {
            const riskMatch = line.match(/Risk level:\s*(Moderate|High)/i);
            if (riskMatch) {
              currentRisk = riskMatch[1].toLowerCase();
              
              // If we have all the info, add a warning
              if (currentIngredient && currentRisk) {
                warnings.push({
                  ingredient: currentIngredient,
                  level: currentRisk as 'low' | 'moderate' | 'high',
                  description: currentConcern || 'Potentially harmful ingredient',
                });
                
                // Reset for the next ingredient
                currentIngredient = '';
                currentConcern = '';
                currentRisk = '';
              }
            }
          }
          // Check for concern
          else if (line.includes('Concern:')) {
            const concernMatch = line.match(/Concern:\s*(.+)/i);
            if (concernMatch) {
              currentConcern = concernMatch[1].trim();
            }
          }
        }
        
        result.warnings = warnings;
        
        // Extract insights
        const insights: string[] = [];
        let insightSection = false;
        
        for (const line of lines) {
          // Skip empty lines
          if (!line.trim()) continue;
          
          // If we found a bullet point that's not part of warnings
          if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
            // Skip lines about ingredients we already covered in warnings
            if (!warnings.some(w => line.includes(w.ingredient))) {
              insights.push(line.trim().substring(1).trim());
            }
          }
        }
        
        // If we didn't find any insights, create some from the summary
        if (insights.length === 0 && result.summary) {
          insights.push(result.summary);
        }
        
        result.insights = insights;
      }
      
      setFormattedResult(result);
    }
    
    fetchScanData();
  }, [scanId, analyzeResult]);

  const handleShare = async () => {
    if (!formattedResult) return;
    
    try {
      const shareText = formattedResult.analysis || 
        `Health Analysis: ${formattedResult.healthScore || 'Unknown'}\n\n${formattedResult.summary || ''}\n\n${
          (formattedResult.warnings || []).map(w => `- ${w.ingredient}: ${w.description}`).join('\n')
        }`;
        
      await Share.share({
        message: shareText,
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

  if (!formattedResult) {
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
          />
        </View>
      )}

      {formattedResult.healthScore && formattedResult.summary ? (
        <HealthSummaryCard
          healthScore={formattedResult.healthScore}
          summary={formattedResult.summary}
          insights={formattedResult.insights || []}
          warnings={formattedResult.warnings || []}
        />
      ) : (
        <View style={styles.rawAnalysisContainer}>
          <Text style={styles.rawAnalysisTitle}>Analysis Result</Text>
          <Text style={styles.rawAnalysisText}>{formattedResult.analysis}</Text>
          
          {formattedResult.citations && formattedResult.citations.length > 0 && (
            <View style={styles.citationsContainer}>
              <Text style={styles.citationsTitle}>Sources:</Text>
              {formattedResult.citations.map((citation, index) => (
                <Text key={index} style={styles.citationText}>
                  {index + 1}. {citation.source || citation.url || 'Unknown source'}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

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
    backgroundColor: '#000',
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
  rawAnalysisContainer: {
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
  rawAnalysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  rawAnalysisText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
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