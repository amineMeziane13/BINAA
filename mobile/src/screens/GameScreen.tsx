import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import Game3D from '../components/Game3D';
import { colors } from '../core/theme/colors';
import { useGameEffects } from '../hooks/useGameEffects';

const { width, height } = Dimensions.get('window');

interface GameScreenProps {
  onBack: () => void;
}

export default function GameScreen({ onBack }: GameScreenProps) {
  const [score, setScore] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [aimPosition, setAimPosition] = useState({ x: 0, y: 0 });
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Game effects
  const { screenShake, screenFlash, triggerHitEffect, triggerShootEffect } = useGameEffects();

  const handleScoreChange = (newScore: number) => {
    setScore(newScore);
  };

  const handleHit = () => {
    // Trigger visual effects
    triggerHitEffect();
  };

  const handleTouchStart = (event: any) => {
    const touch = event.nativeEvent.touches[0];
    touchStartRef.current = {
      x: touch.pageX - width / 2,
      y: touch.pageY - height / 2
    };
    setIsGameActive(true);
    triggerShootEffect();
  };

  const handleTouchMove = (event: any) => {
    if (!touchStartRef.current) return;
    
    const touch = event.nativeEvent.touches[0];
    const deltaX = (touch.pageX - width / 2) - touchStartRef.current.x;
    const deltaY = (touch.pageY - height / 2) - touchStartRef.current.y;
    
    setAimPosition({
      x: Math.max(-1, Math.min(1, deltaX / (width / 2))),
      y: Math.max(-1, Math.min(1, deltaY / (height / 2)))
    });
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
    setIsGameActive(false);
    
    // Shoot arrow
    if (isGameActive) {
      console.log('Shooting arrow at angle:', aimPosition);
    }
  };

  return (
    <View style={styles.container}>
      {/* Screen shake effect */}
      <Animated.View 
        style={[styles.container, { transform: [{ translateX: screenShake }] }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>3D Physics Arena</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>Score: {score}</Text>
          </View>
        </View>

        {/* 3D Game Area */}
        <View style={styles.gameArea}>
          <Game3D onScoreChange={handleScoreChange} onHit={handleHit} />
          
          {/* Crosshair/aim indicator */}
          <View 
            style={[
              styles.aimIndicator,
              {
                left: aimPosition.x * 50 + width / 2 - 10,
                top: aimPosition.y * 50 + height / 2 - 10,
              }
            ]}
          />
        </View>

        {/* Flash effect overlay */}
        {screenFlash && <View style={styles.flashOverlay} />}

        {/* Controls */}
        <View style={styles.controls}>
          <Text style={styles.instructionText}>
            {isGameActive 
              ? "Release to shoot the fire arrow!" 
              : "Drag to aim, then release to shoot!"
            }
          </Text>
          <TouchableOpacity 
            style={styles.shootButton}
            onPressIn={handleTouchStart}
            onPressOut={handleTouchEnd}
            onResponderGrant={handleTouchStart}
            onResponderRelease={handleTouchEnd}
            onResponderMove={handleTouchMove}
          >
            <Text style={styles.shootText}>🔥 SHOOT</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E3A8A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backText: {
    color: colors.textLight,
    fontWeight: '600',
    fontSize: 16,
  },
  title: {
    color: colors.textLight,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  scoreContainer: {
    backgroundColor: colors.surfaceDark,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  scoreText: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: '700',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  aimIndicator: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: 'rgba(255, 68, 68, 0.7)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    pointerEvents: 'none',
  },
  controls: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: colors.surfaceDark,
  },
  instructionText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  shootButton: {
    backgroundColor: colors.error,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  shootText: {
    color: colors.textLight,
    fontSize: 20,
    fontWeight: '700',
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 100,
    animation: 'flash 0.2s',
  },
});