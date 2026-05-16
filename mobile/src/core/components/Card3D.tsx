import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { card3D } from '../theme/neumorphism';

interface Props {
  children: ReactNode;
  style?: ViewStyle;
}

export default function Card3D({ children, style }: Props) {
  return <View style={[styles.card, card3D(), style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 14, marginVertical: 7 },
});
