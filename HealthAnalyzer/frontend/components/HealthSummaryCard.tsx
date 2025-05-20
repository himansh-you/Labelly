import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import WarningBadge from './WarningBadge';

interface Warning {
  ingredient: string;
  level: 'low' | 'moderate' | 'high';
  description: string;
}

interface HealthSummaryCardProps {
  healthScore: string; // 'Healthy', 'Moderate', or 'Unhealthy'
  summary: string;
  insights: string[];
  warnings: Warning[];
}

export default function HealthSummaryCard({
  healthScore,
  summary,
  insights,
  warnings,
}: HealthSummaryCardProps) {
  // Get color based on health score
  const getScoreColor = () => {
    switch (healthScore.toLowerCase()) {
      case 'healthy':
        return '#4CAF50'; // Green
      case 'moderate':
        return '#FF9800'; // Orange
      case 'unhealthy':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Grey
    }
  };

  return (
    <View style={styles.card}>
      {/* Health Score Badge */}
      <View style={[styles.scoreBadge, { backgroundColor: getScoreColor() }]}>
        <Text style={styles.scoreText}>{healthScore}</Text>
      </View>

      {/* Summary */}
      <Text style={styles.summary}>{summary}</Text>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Insights */}
      <Text style={styles.sectionTitle}>Key Insights</Text>
      {insights.map((insight, index) => (
        <View key={`insight-${index}`} style={styles.insightItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.insightText}>{insight}</Text>
        </View>
      ))}

      {/* Warnings Section */}
      {warnings.length > 0 && (
        <>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Potential Concerns</Text>
          
          {/* Warning Badges */}
          <View style={styles.warningTags}>
            {warnings.map((warning, index) => (
              <WarningBadge
                key={`warning-compact-${index}`}
                ingredient={warning.ingredient}
                level={warning.level}
                compact
              />
            ))}
          </View>
          
          {/* Detailed Warnings */}
          {warnings.map((warning, index) => (
            <WarningBadge
              key={`warning-${index}`}
              ingredient={warning.ingredient}
              level={warning.level}
              description={warning.description}
            />
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  scoreText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  summary: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  insightItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    marginRight: 8,
    color: '#333',
  },
  insightText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  warningTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
}); 