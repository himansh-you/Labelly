import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

type WarningLevel = 'low' | 'moderate' | 'high';

interface WarningBadgeProps {
  ingredient: string;
  level: WarningLevel;
  description?: string;
  compact?: boolean;
}

export default function WarningBadge({
  ingredient,
  level,
  description,
  compact = false
}: WarningBadgeProps) {
  // Get color based on warning level
  const getColor = () => {
    switch (level) {
      case 'low':
        return '#FFC107'; // Amber/Yellow
      case 'moderate':
        return '#FF9800'; // Orange
      case 'high':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Grey
    }
  };

  if (compact) {
    return (
      <View style={[styles.badgeCompact, { backgroundColor: getColor() }]}>
        <Text style={styles.textCompact}>{ingredient}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: getColor() }]}>
        <Text style={styles.text}>{ingredient}</Text>
      </View>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  badgeCompact: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  textCompact: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    marginTop: 4,
    marginLeft: 2,
    fontSize: 14,
    color: '#666',
  },
}); 