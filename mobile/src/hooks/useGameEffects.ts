import { useState } from 'react';

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