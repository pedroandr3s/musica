import { useState, useCallback } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const useFirebase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveToFirebase = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      // Using a fixed document ID for simplicity - you might want to make this dynamic
      const docRef = doc(db, 'stageTimer', 'currentSession');
      await setDoc(docRef, data);
      console.log('Data saved to Firebase successfully');
      return { success: true };
    } catch (err) {
      console.error('Error saving to Firebase:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFromFirebase = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, 'stageTimer', 'currentSession');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('Data loaded from Firebase successfully');
        return { success: true, data };
      } else {
        console.log('No document found in Firebase');
        return { success: false, error: 'No data found' };
      }
    } catch (err) {
      console.error('Error loading from Firebase:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    saveToFirebase,
    loadFromFirebase,
    loading,
    error
  };
};