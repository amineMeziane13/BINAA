import { useState } from 'react';

interface Particle {
  id: number;
  position: { x: number; y: number; z: number };
  color: string;
  life: number;
  size: number;
  isFire?: boolean;
}

export function useParticleEffects() {
  const [particles, setParticles] = useState<Particle[]>([]);

  const createHitEffect = (position: { x: number; y: number; z: number }) => {
    const newParticle: Particle = {
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
    const newParticle: Particle = {
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