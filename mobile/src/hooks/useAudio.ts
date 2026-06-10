import { useState, useRef } from 'react';
import { Audio, AudioSource } from 'expo-av';

export function useAudio() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<AudioSource | null>(null);

  const loadSound = async (uri: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false, volume: 0.5 },
        () => setIsLoaded(true)
      );
      soundRef.current = sound;
      return sound;
    } catch (error) {
      console.error('Error loading sound:', error);
      return null;
    }
  };

  const playSound = async (type: 'shoot' | 'hit' | 'success') => {
    if (!soundRef.current) return;
    
    try {
      await soundRef.current.setPositionAsync(0);
      await soundRef.current.playAsync();
      setIsPlaying(true);
      
      soundRef.current.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const unloadSound = async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setIsLoaded(false);
      setIsPlaying(false);
    }
  };

  return {
    loadSound,
    playSound,
    unloadSound,
    isLoaded,
    isPlaying,
  };
}

export function useParticleEffects() {
  const [particles, setParticles] = useState<any[]>([]);

  const createHitEffect = (position: { x: number; y: number; z: number }) => {
    const newParticle = {
      id: Date.now(),
      position,
      color: getRandomColor(),
      life: 100,
      size: 0.5 + Math.random() * 1.5,
    };
    setParticles(prev => [...prev, newParticle]);
    
    // Remove particle after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 2000);
  };

  const createFireTrail = (position: { x: number; y: number; z: number }) => {
    const newParticle = {
      id: Date.now(),
      position,
      color: '#ff4444',
      life: 50,
      size: 0.2,
      isFire: true,
    };
    setParticles(prev => [...prev, newParticle]);
    
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 1000);
  };

  const getRandomColor = () => {
    const colors = ['#ff6b6b', '#4facfe', '#ffeb3b', '#96ceb4', '#f39c12', '#e74c3c', '#9b59b6'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return {
    particles,
    createHitEffect,
    createFireTrail,
  };
}

export function useGameEffects() {
  const [screenShake, setScreenShake] = useState(0);
  const [screenFlash, setScreenFlash] = useState(false);

  const triggerHitEffect = () => {
    // Screen shake effect
    setScreenShake(10);
    setTimeout(() => setScreenShake(0), 300);
    
    // Screen flash effect
    setScreenFlash(true);
    setTimeout(() => setScreenFlash(false), 200);
  };

  const triggerShootEffect = () => {
    // Lighter screen effect for shooting
    setScreenFlash(true);
    setTimeout(() => setScreenFlash(false), 100);
  };

  return {
    screenShake,
    screenFlash,
    triggerHitEffect,
    triggerShootEffect,
  };
}