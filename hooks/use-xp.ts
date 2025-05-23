import { useState, useEffect, useRef, useCallback } from 'react';

export const useXP = (initialXp: number = 2750, initialMaxXp: number = 4000) => {
  const [currentXp, setCurrentXp] = useState<number>(initialXp);
  const [maxXp, setMaxXp] = useState<number>(initialMaxXp); // It might be useful to allow setting this later
  const [xpGain, setXpGain] = useState<{ amount: number; show: boolean }>({ amount: 0, show: false });

  const gainXP = useCallback((amount: number) => {
    setCurrentXp(prevXp => {
      const newXp = prevXp + amount;
      return newXp > maxXp ? maxXp : newXp;
    });
    setXpGain({ amount, show: true });
  }, [maxXp]); // Add maxXp to dependency array as it's used in the logic

  const loseXP = useCallback((amount: number) => {
    setCurrentXp(prevXp => {
      const newXp = prevXp - amount;
      return newXp < 0 ? 0 : newXp;
    });
    setXpGain({ amount: -amount, show: true });
  }, []);

  const handleXpAnimationComplete = useCallback(() => {
    setXpGain({ amount: 0, show: false });
  }, []);

  const xpPercentage = (currentXp / maxXp) * 100;

  // It might be useful to add a way to update maxXp if it can change,
  // e.g., when a user levels up. For now, it's fixed after initialization.
  // const updateMaxXp = (newMaxXp: number) => {
  //   setMaxXp(newMaxXp);
  //   setCurrentXp(prevXp => prevXp > newMaxXp ? newMaxXp : prevXp); // Adjust currentXp if it exceeds new maxXp
  // };

  return {
    currentXp,
    maxXp,
    xpGain,
    xpPercentage,
    gainXP,
    loseXP,
    handleXpAnimationComplete,
    // updateMaxXp, // if we decide to expose it
  };
};
