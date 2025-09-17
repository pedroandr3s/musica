import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  serverTimestamp, 
  collection,
  setDoc
} from 'firebase/firestore';
import { db } from '../config/firebase'; // Asegúrate de que esta ruta sea correcta

export const useRealtimeSync = (sessionId = 'default-session') => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMaster, setIsMaster] = useState(false);
  const lastUpdateRef = useRef(null);
  const unsubscribeRef = useRef(null);

  // Referencia al documento de sesión en Firestore
  const sessionRef = doc(db, 'timerSessions', sessionId);

  // Función para sincronizar el estado del timer
  const syncTimerState = useCallback(async (timerData) => {
    if (!isMaster) return;
    
    try {
      const syncData = {
        ...timerData,
        lastUpdated: serverTimestamp(),
        updatedBy: 'master', // Podrías usar un ID único del dispositivo
        timestamp: Date.now()
      };
      
      await updateDoc(sessionRef, syncData);
      lastUpdateRef.current = Date.now();
    } catch (error) {
      console.error('Error syncing timer state:', error);
    }
  }, [isMaster, sessionRef]);

  // Función para actualizar el estado del timer (para usar en el componente principal)
  const updateTimerState = useCallback(async (timerState) => {
    const data = {
      bands: timerState.bands,
      currentBandIndex: timerState.currentBandIndex,
      isRunning: timerState.isRunning,
      autoMode: timerState.autoMode,
      soundEnabled: timerState.soundEnabled,
      lastSync: Date.now()
    };
    
    await syncTimerState(data);
  }, [syncTimerState]);

  // Función para enviar comandos de control
  const sendControlCommand = useCallback(async (command, data = {}) => {
    try {
      const commandData = {
        command,
        data,
        timestamp: Date.now(),
        lastUpdated: serverTimestamp()
      };
      
      await updateDoc(sessionRef, {
        controlCommand: commandData
      });
    } catch (error) {
      console.error('Error sending control command:', error);
    }
  }, [sessionRef]);

  // Función para establecer como dispositivo maestro
  const becomeMaster = useCallback(async () => {
    try {
      await updateDoc(sessionRef, {
        masterId: 'current-device', // Podrías usar un ID único
        masterTimestamp: serverTimestamp()
      });
      setIsMaster(true);
    } catch (error) {
      console.error('Error becoming master:', error);
    }
  }, [sessionRef]);

  // Función para inicializar la sesión
  const initializeSession = useCallback(async (initialData) => {
    try {
      await setDoc(sessionRef, {
        ...initialData,
        masterId: 'current-device',
        masterTimestamp: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        isRunning: false,
        controlCommand: null
      }, { merge: true });
      
      setIsMaster(true);
      setIsConnected(true);
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  }, [sessionRef]);

  // Configurar el listener en tiempo real
  useEffect(() => {
    const setupRealtimeListener = () => {
      unsubscribeRef.current = onSnapshot(sessionRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setIsConnected(true);
          
          // Evitar loops infinitos de actualización
          if (lastUpdateRef.current && 
              data.timestamp && 
              Date.now() - lastUpdateRef.current < 1000) {
            return;
          }
          
          // Disparar evento personalizado para que el componente principal lo escuche
          const event = new CustomEvent('timerStateUpdate', {
            detail: data
          });
          window.dispatchEvent(event);
          
        } else {
          setIsConnected(false);
        }
      }, (error) => {
        console.error('Realtime listener error:', error);
        setIsConnected(false);
      });
    };

    setupRealtimeListener();

    // Cleanup
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [sessionRef]);

  return {
    isConnected,
    isMaster,
    syncTimerState: updateTimerState,
    sendControlCommand,
    becomeMaster,
    initializeSession
  };
};