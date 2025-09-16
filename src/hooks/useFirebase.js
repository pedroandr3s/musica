import { useState, useCallback } from 'react';
import { doc, setDoc, getDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const useFirebase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Guardar datos en Firebase
  const saveToFirebase = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, 'stageTimer', 'currentSession');
      await setDoc(docRef, {
        ...data,
        lastUpdated: new Date().toISOString()
      });
      
      console.log('Data saved to Firebase successfully');
      return { success: true };
    } catch (err) {
      console.error('Error saving data to Firebase:', err);
      setError(err.message);
      
      // Fallback a localStorage en caso de error
      try {
        localStorage.setItem('stageTimerData', JSON.stringify({
          ...data,
          lastUpdated: new Date().toISOString()
        }));
        console.log('Data saved to localStorage as fallback');
        return { success: true, fallback: true };
      } catch (localErr) {
        console.error('Error saving to localStorage fallback:', localErr);
        return { success: false, error: err.message };
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos desde Firebase
  const loadFromFirebase = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, 'stageTimer', 'currentSession');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('Data loaded from Firebase successfully:', data);
        return { success: true, data };
      } else {
        console.log('No document found in Firebase, checking localStorage');
        
        // Fallback a localStorage si no hay datos en Firebase
        const storedData = localStorage.getItem('stageTimerData');
        if (storedData) {
          const data = JSON.parse(storedData);
          console.log('Data loaded from localStorage fallback');
          return { success: true, data, fallback: true };
        } else {
          console.log('No data found in Firebase or localStorage');
          return { success: false, error: 'No data found' };
        }
      }
    } catch (err) {
      console.error('Error loading data from Firebase:', err);
      setError(err.message);
      
      // Fallback a localStorage en caso de error
      try {
        const storedData = localStorage.getItem('stageTimerData');
        if (storedData) {
          const data = JSON.parse(storedData);
          console.log('Data loaded from localStorage fallback due to Firebase error');
          return { success: true, data, fallback: true };
        } else {
          return { success: false, error: 'No data found in Firebase or localStorage' };
        }
      } catch (localErr) {
        console.error('Error loading from localStorage fallback:', localErr);
        return { success: false, error: err.message };
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Suscribirse a cambios en tiempo real
  const subscribeToChanges = useCallback((callback) => {
    try {
      const docRef = doc(db, 'stageTimer', 'currentSession');
      
      return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('Real-time update received from Firebase:', data);
          callback(data);
        }
      }, (error) => {
        console.error('Error in Firebase real-time listener:', error);
        setError(error.message);
        
        // Fallback a localStorage storage events
        const handleStorageChange = (e) => {
          if (e.key === 'stageTimerData' && e.newValue) {
            try {
              const data = JSON.parse(e.newValue);
              console.log('Storage event received (fallback):', data);
              callback(data);
            } catch (err) {
              console.error('Error parsing storage data:', err);
            }
          }
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
          window.removeEventListener('storage', handleStorageChange);
        };
      });
    } catch (err) {
      console.error('Error setting up Firebase listener:', err);
      setError(err.message);
      
      // Fallback a localStorage storage events
      const handleStorageChange = (e) => {
        if (e.key === 'stageTimerData' && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            console.log('Storage event received (fallback):', data);
            callback(data);
          } catch (err) {
            console.error('Error parsing storage data:', err);
          }
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, []);

  // Eliminar documento específico (útil para reset completo)
  const deleteFromFirebase = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, 'stageTimer', 'currentSession');
      await deleteDoc(docRef);
      
      console.log('Data deleted from Firebase successfully');
      return { success: true };
    } catch (err) {
      console.error('Error deleting data from Firebase:', err);
      setError(err.message);
      
      // Fallback a localStorage
      try {
        localStorage.removeItem('stageTimerData');
        console.log('Data deleted from localStorage as fallback');
        return { success: true, fallback: true };
      } catch (localErr) {
        console.error('Error deleting from localStorage fallback:', localErr);
        return { success: false, error: err.message };
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para verificar conectividad
  const checkConnection = useCallback(async () => {
    try {
      const docRef = doc(db, 'stageTimer', 'connectionTest');
      await getDoc(docRef);
      console.log('Firebase connection successful');
      return { connected: true };
    } catch (err) {
      console.error('Firebase connection error:', err);
      return { connected: false, error: err.message };
    }
  }, []);

  // Función específica para cargar solo las bandas
  const loadBands = useCallback(async () => {
    const result = await loadFromFirebase();
    if (result.success && result.data && result.data.bands) {
      return { success: true, data: { bands: result.data.bands } };
    }
    return { success: false, error: 'No bands found' };
  }, [loadFromFirebase]);

  // Función para guardar solo las bandas (manteniendo otros datos)
  const saveBands = useCallback(async (bands) => {
    // Primero cargar los datos existentes
    const currentData = await loadFromFirebase();
    const existingData = currentData.success ? currentData.data : {};
    
    // Combinar con las nuevas bandas
    const dataToSave = {
      ...existingData,
      bands,
      lastUpdated: new Date().toISOString(),
      totalBands: bands.length
    };
    
    return await saveToFirebase(dataToSave);
  }, [loadFromFirebase, saveToFirebase]);

  return {
    saveToFirebase,
    loadFromFirebase,
    subscribeToChanges,
    deleteFromFirebase,
    checkConnection,
    loadBands,
    saveBands,
    loading,
    error
  };
};