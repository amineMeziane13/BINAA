import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, ViewStyle } from 'react-native';
import { button3D, buttonPressed3D } from '../theme/neumorphism';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface Props {
  title: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: string;
}

export default function Button3D({ title, onPress, color = colors.accent, disabled, style, icon }: Props) {
  const [pressed, setPressed] = useState(false);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      activeOpacity={1}
      style={[styles.wrapper, style]}
    >
      <Animated.View style={[styles.button, pressed ? buttonPressed3D(color) : button3D(color), disabled && styles.disabled]}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text style={styles.text}>{title}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignSelf: 'stretch', marginVertical: 8 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  disabled: { opacity: 0.5 },
  icon: { fontSize: 20 },
  text: { ...typography.button, color: colors.textLight },
});
