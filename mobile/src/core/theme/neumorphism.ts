import { ViewStyle, TextStyle } from 'react-native';

export function button3D(backgroundColor: string): ViewStyle {
  return {
    backgroundColor,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 14,
  };
}

export function buttonPressed3D(backgroundColor: string): ViewStyle {
  return {
    backgroundColor,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  };
}

export function card3D(): ViewStyle {
  return {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  };
}

export function modal3D(): ViewStyle {
  return {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.35,
    shadowRadius: 32,
    elevation: 24,
  };
}

export function input3D(): ViewStyle {
  return {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  };
}

export function icon3DStyle(size: number): TextStyle {
  return {
    fontSize: size,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  };
}

export function iconContainer3D(size: number, bgColor: string): ViewStyle {
  return {
    width: size * 1.8,
    height: size * 1.8,
    borderRadius: size * 0.9,
    backgroundColor: bgColor,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  };
}
