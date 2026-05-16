import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { iconContainer3D, icon3DStyle } from '../theme/neumorphism';

interface Props {
  icon: string;
  size?: number;
  color?: string;
  bgColor?: string;
  style?: ViewStyle;
}

export default function Icon3D({
  icon, size = 24, color = '#FFFFFF', bgColor = '#1E3A8A', style,
}: Props) {
  return (
    <View style={[iconContainer3D(size, bgColor), style]}>
      <Text style={[icon3DStyle(size * 0.6), { color }]}>{icon}</Text>
    </View>
  );
}
