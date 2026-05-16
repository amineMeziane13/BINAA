import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface Props {
  rating: number;
  size?: number;
}

export default function Star3D({ rating, size = 22 }: Props) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;

  const starStyle = {
    fontSize: size,
    color: colors.accent,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 3 } as const,
    textShadowRadius: 5,
  };

  const emptyStyle = {
    fontSize: size,
    color: '#CBD5E1',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 } as const,
    textShadowRadius: 2,
  };

  return (
    <View style={styles.container}>
      <Text style={starStyle}>
        {'★'.repeat(full)}
        {half ? '½' : ''}
      </Text>
      <Text style={emptyStyle}>
        {'☆'.repeat(Math.max(0, 5 - full - (half ? 1 : 0)))}
      </Text>
      <View style={styles.badge}>
        <Text style={styles.text}>{rating.toFixed(1)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  badge: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
    shadowColor: colors.accentDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  text: { ...typography.caption, color: colors.textLight, fontWeight: '700' },
});
