import React, { useRef, useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { modal3D, button3D, buttonPressed3D } from '../theme/neumorphism';
import { typography } from '../theme/typography';

interface Props {
  visible: boolean;
  title?: string;
  message: string;
  icon?: string;
  iconColor?: string;
  buttonText?: string;
  buttonColor?: string;
  onClose: () => void;
}

export default function Modal3D({
  visible, title, message, icon, iconColor = colors.accent,
  buttonText = 'OK', buttonColor = colors.primary, onClose,
}: Props) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, damping: 12, stiffness: 200, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.modal, modal3D(), { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
          {icon && (
            <View style={[styles.iconCircle, { backgroundColor: iconColor + '20' }]}>
              <Text style={[styles.iconText, icon3DStyle(36), { color: iconColor }]}>{icon}</Text>
            </View>
          )}
          {title && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            onPress={onClose}
            activeOpacity={1}
          >
            <Animated.View style={[styles.button, pressed ? buttonPressed3D(buttonColor) : button3D(buttonColor)]}>
              <Text style={styles.buttonText}>{buttonText}</Text>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const icon3DStyle = (size: number) => ({
  textShadowColor: 'rgba(0,0,0,0.2)',
  textShadowOffset: { width: 0, height: 3 } as const,
  textShadowRadius: 6,
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  modal: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: { fontWeight: '700' },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    minWidth: 140,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.button,
    color: colors.textLight,
  },
});
