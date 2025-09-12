import { useCallback } from 'react';

// Simplified Firebase hook that uses localStorage as fallback
export const useFirebase = () => {
  // Save data to Firebase (using localStorage as fallback)
  const saveToFirebase = useCallback(async (data) => {
    try {
      // For now, we'll use localStorage as fallback
      // You can implement Firebase later
      localStorage.setItem('stageTimerData', JSON.stringify({
        ...data,
        lastUpdated: new Date().toISOString()
      }));
      return { success: true };
    } catch (error) {
      console.error('Error saving data:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Load data from Firebase (using localStorage as fallback)
  const loadFromFirebase = useCallback(async () => {
    try {
      const storedData = localStorage.getItem('stageTimerData');
      if (storedData) {
        return { success: true, data: JSON.parse(storedData) };
      } else {
        return { success: false, error: 'No data found' };
      }
    } catch (error) {
      console.error('Error loading data:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Real-time listener placeholder
  const subscribeToChanges = useCallback((callback) => {
    // For now, return a no-op function
    // You can implement Firebase real-time listener later
    return () => {};
  }, []);

  return {
    saveToFirebase,
    loadFromFirebase,
    subscribeToChanges
  };
};