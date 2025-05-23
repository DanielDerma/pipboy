import { useState, useEffect, useCallback } from 'react';
import { habitsDB, Habit } from '@/lib/db-service';
import { notificationService } from '@/lib/notification-service';

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadHabits = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedHabits = await habitsDB.getAll();
      setHabits(fetchedHabits.map(h => ({ ...h, animating: false }))); // Initialize animating to false
      setError(null);
    } catch (err) {
      console.error('Failed to load habits:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      notificationService.error(`Error loading habits: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  const addHabit = async (
    habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'count' | 'animating'>
  ): Promise<Habit | null> => {
    try {
      const newHabit = await habitsDB.add(habitData);
      setHabits(prevHabits => [...prevHabits, { ...newHabit, animating: false }]);
      notificationService.success(`Habit "${newHabit.name}" added successfully.`);
      return newHabit;
    } catch (err) {
      console.error('Failed to add habit:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      notificationService.error(`Error adding habit: ${errorMessage}`);
      return null;
    }
  };

  const updateHabit = async (updatedHabitData: Habit): Promise<Habit | null> => {
    try {
      const habitToUpdate = { ...updatedHabitData, updatedAt: Date.now() };
      const savedHabit = await habitsDB.update(habitToUpdate);
      setHabits(prevHabits =>
        prevHabits.map(h => (h.id === savedHabit.id ? { ...savedHabit, animating: h.animating } : h))
      );
      notificationService.success(`Habit "${savedHabit.name}" updated successfully.`);
      return savedHabit;
    } catch (err) {
      console.error('Failed to update habit:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      notificationService.error(`Error updating habit: ${errorMessage}`);
      return null;
    }
  };

  const deleteHabit = async (habitId: number): Promise<void> => {
    try {
      const habitToDelete = habits.find(h => h.id === habitId);
      await habitsDB.delete(habitId);
      setHabits(prevHabits => prevHabits.filter(h => h.id !== habitId));
      if (habitToDelete) {
        notificationService.success(`Habit "${habitToDelete.name}" deleted successfully.`);
      } else {
        notificationService.success(`Habit deleted successfully.`);
      }
    } catch (err) {
      console.error('Failed to delete habit:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      notificationService.error(`Error deleting habit: ${errorMessage}`);
    }
  };

  const incrementHabitCounter = async (habit: Habit): Promise<Habit | null> => {
    try {
      const updatedHabit = { ...habit, count: habit.count + 1, updatedAt: Date.now() };
      await habitsDB.update(updatedHabit);
      setHabits(prevHabits =>
        prevHabits.map(h => (h.id === habit.id ? { ...updatedHabit, animating: true } : h))
      );
      notificationService.success(`Counter incremented for "${habit.name}".`);
      return updatedHabit;
    } catch (err) {
      console.error('Failed to increment habit counter:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      notificationService.error(`Error incrementing counter: ${errorMessage}`);
      return null;
    }
  };

  const decrementHabitCounter = async (habit: Habit): Promise<Habit | null> => {
    try {
      const updatedHabit = { ...habit, count: habit.count - 1, updatedAt: Date.now() };
      await habitsDB.update(updatedHabit);
      setHabits(prevHabits =>
        prevHabits.map(h => (h.id === habit.id ? { ...updatedHabit, animating: true } : h))
      );
      notificationService.success(`Counter decremented for "${habit.name}".`);
      return updatedHabit;
    } catch (err) {
      console.error('Failed to decrement habit counter:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      notificationService.error(`Error decrementing counter: ${errorMessage}`);
      return null;
    }
  };

  useEffect(() => {
    const habitsToReset = habits.filter(h => h.animating);
    if (habitsToReset.length > 0) {
      const timer = setTimeout(() => {
        setHabits(prevHabits =>
          prevHabits.map(h => (h.animating ? { ...h, animating: false } : h))
        );
      }, 1500); // Reset animation after 1.5 seconds

      return () => clearTimeout(timer);
    }
  }, [habits]);

  return {
    habits,
    isLoading,
    error,
    addHabit,
    updateHabit,
    deleteHabit,
    incrementHabitCounter,
    decrementHabitCounter,
    loadHabits, // Exposing loadHabits for manual refresh if needed
  };
};
