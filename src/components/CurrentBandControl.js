import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, Database, Wifi, WifiOff } from 'lucide-react';
import { formatTime, getPhaseLabel } from '../utils/helpers';
import { useFirebase } from '../hooks/useFirebase';
import styles from '../styles/styles';

const CurrentBandControl = ({ 
  band, 
  isRunning, 
  onStartTimer, 
  onPauseTimer, 
  onResetCurrentBand, 
  onNextPhase, 
  onNextBand,
  canNextBand,
  onBandUpdate // Nueva prop para notificar cambios al componente padre
}) => {
  const { saveToFirebase, loadFromFirebase, subscribeToChanges, loading, error } = useFirebase();
  const [localBand, setLocalBand] = useState(band);
  const [localIsRunning, setLocalIsRunning] = useState(isRunning);
  const [lastSyncTime, setLastSyncTime] = useState(Date.now());
  const [isConnected, setIsConnected] = useState(true);
  const unsubscribeRef = useRef(null);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  // Cargar estado persistido al inicializar
  useEffect(() => {
    loadPersistedState();
    setupRealtimeSync();
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Sincronizar cuando cambie la banda desde props
  useEffect(() => {
    if (band && band.id !== localBand?.id) {
      setLocalBand(band);
      loadPersistedState();
    } else if (!band) {
      // Si no hay banda, limpiar el estado local
      setLocalBand(null);
      setLocalIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [band]);

  // Configurar sincronización en tiempo real
  const setupRealtimeSync = () => {
    if (subscribeToChanges) {
      unsubscribeRef.current = subscribeToChanges((data) => {
        console.log('Real-time update in CurrentBandControl:', data);
        
        if (data.bands && data.bands.length > 0 && data.currentBandIndex !== undefined) {
          const currentBand = data.bands[data.currentBandIndex];
          if (currentBand && currentBand.id && localBand && currentBand.id === localBand.id) {
            // Solo actualizar si los datos han cambiado significativamente
            const timeChanged = Math.abs(currentBand.timeRemaining - localBand.timeRemaining) > 2;
            const statusChanged = currentBand.status !== localBand.status;
            const phaseChanged = currentBand.phase !== localBand.phase;
            
            if (timeChanged || statusChanged || phaseChanged) {
              setLocalBand(currentBand);
              setLocalIsRunning(currentBand.status === 'active' && currentBand.timeRemaining > 0);
            }
          }
        }
        
        setIsConnected(true);
        setLastSyncTime(Date.now());
      });
    }
  };

  // Cargar estado persistido
  const loadPersistedState = async () => {
    try {
      const result = await loadFromFirebase();
      if (result.success && result.data) {
        const { bands, currentBandIndex, timerState } = result.data;
        
        if (bands && bands.length > 0 && currentBandIndex !== undefined && bands[currentBandIndex]) {
          const currentBand = bands[currentBandIndex];
          if (currentBand && currentBand.id) {
            // Calcular tiempo real basado en timestamp guardado
            let adjustedBand = { ...currentBand };
            
            if (timerState && timerState.isRunning && timerState.lastUpdateTime) {
              const now = Date.now();
              const timePassed = Math.floor((now - timerState.lastUpdateTime) / 1000);
              adjustedBand.timeRemaining = Math.max(0, currentBand.timeRemaining - timePassed);
              
              // Verificar si debe cambiar de fase automáticamente
              if (adjustedBand.timeRemaining === 0) {
                adjustedBand = handlePhaseTransition(adjustedBand);
              }
            }
            
            setLocalBand(adjustedBand);
            setLocalIsRunning(timerState?.isRunning && adjustedBand.timeRemaining > 0);
            
            // Notificar al padre si hay cambios
            if (onBandUpdate) {
              onBandUpdate(adjustedBand);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading persisted state:', error);
      setIsConnected(false);
    }
  };

  // Manejar transición de fase automática
  const handlePhaseTransition = (bandData) => {
    if (!bandData) return bandData;
    
    let updatedBand = { ...bandData };
    
    switch (bandData.phase) {
      case 'setup':
        updatedBand.phase = 'show';
        updatedBand.timeRemaining = bandData.showTime * 60;
        break;
      case 'show':
        updatedBand.phase = 'teardown';
        updatedBand.timeRemaining = bandData.teardownTime * 60;
        break;
      case 'teardown':
        updatedBand.status = 'finished';
        updatedBand.timeRemaining = 0;
        setLocalIsRunning(false);
        break;
      default:
        break;
    }
    
    return updatedBand;
  };

  // Guardar estado en Firebase con validación
  const persistState = async (updatedBand, isTimerRunning) => {
    if (!updatedBand || !updatedBand.id) {
      console.error('Cannot persist state: invalid band data');
      return;
    }

    try {
      const currentData = await loadFromFirebase();
      const existingData = currentData.success ? currentData.data : {};
      
      // Validar que existingData.bands es un array
      const currentBands = Array.isArray(existingData.bands) ? existingData.bands : [];
      
      const dataToSave = {
        ...existingData,
        bands: currentBands.map(b => 
          b && b.id === updatedBand.id ? updatedBand : b
        ),
        timerState: {
          isRunning: isTimerRunning,
          lastUpdateTime: Date.now(),
          currentBandId: updatedBand.id
        },
        lastUpdated: new Date().toISOString()
      };
      
      await saveToFirebase(dataToSave);
      setLastSyncTime(Date.now());
      setIsConnected(true);
    } catch (err) {
      console.error('Error persisting state:', err);
      setIsConnected(false);
    }
  };

  // Iniciar timer mejorado con validación
  const handleStartTimer = () => {
    if (!localBand || !localBand.id) {
      console.error('Cannot start timer: no valid band selected');
      return;
    }

    setLocalIsRunning(true);
    persistState(localBand, true);
    
    if (onStartTimer) {
      onStartTimer();
    }
    
    // Configurar intervalo para actualizar tiempo cada segundo
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      setLocalBand(prevBand => {
        if (!prevBand || prevBand.timeRemaining <= 0) {
          clearInterval(intervalRef.current);
          
          if (prevBand) {
            const transitionedBand = handlePhaseTransition(prevBand);
            persistState(transitionedBand, transitionedBand.status !== 'finished');
            
            if (onBandUpdate) {
              onBandUpdate(transitionedBand);
            }
            
            return transitionedBand;
          }
          
          return prevBand;
        }
        
        const updatedBand = {
          ...prevBand,
          timeRemaining: prevBand.timeRemaining - 1
        };
        
        // Guardar cada 10 segundos para reducir llamadas a Firebase
        if (updatedBand.timeRemaining % 10 === 0) {
          persistState(updatedBand, true);
        }
        
        return updatedBand;
      });
    }, 1000);
  };

  // Pausar timer mejorado
  const handlePauseTimer = () => {
    if (!localBand) {
      console.error('Cannot pause timer: no valid band selected');
      return;
    }

    setLocalIsRunning(false);
    persistState(localBand, false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (onPauseTimer) {
      onPauseTimer();
    }
  };

  // Reset banda mejorado
  const handleResetBand = () => {
    if (!localBand || !localBand.setupTime) {
      console.error('Cannot reset band: no valid band selected');
      return;
    }

    const resetBand = {
      ...localBand,
      phase: 'setup',
      timeRemaining: localBand.setupTime * 60,
      status: 'waiting'
    };
    
    setLocalBand(resetBand);
    setLocalIsRunning(false);
    persistState(resetBand, false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (onResetCurrentBand) {
      onResetCurrentBand();
    }
    
    if (onBandUpdate) {
      onBandUpdate(resetBand);
    }
  };

  // Siguiente fase mejorada
  const handleNextPhase = () => {
    if (!localBand) {
      console.error('Cannot advance phase: no valid band selected');
      return;
    }

    const nextPhaseBand = handlePhaseTransition(localBand);
    setLocalBand(nextPhaseBand);
    persistState(nextPhaseBand, localIsRunning);
    
    if (onNextPhase) {
      onNextPhase();
    }
    
    if (onBandUpdate) {
      onBandUpdate(nextPhaseBand);
    }
  };

  // Función segura para validar banda
  const isValidBand = (band) => {
    return band && 
           band.id && 
           band.name && 
           typeof band.setupTime === 'number' && 
           typeof band.showTime === 'number' && 
           typeof band.teardownTime === 'number' &&
           typeof band.timeRemaining === 'number';
  };

  // Limpiar intervalos cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Si no hay banda válida, mostrar mensaje
  if (!isValidBand(localBand)) {
    return (
      <div style={styles.cardBordered}>
        <div style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>
            No hay banda seleccionada
          </div>
          <div style={{ fontSize: '14px' }}>
            Selecciona una banda del cronograma para comenzar
          </div>
          {error && (
            <div style={{ 
              marginTop: '12px', 
              padding: '8px', 
              backgroundColor: '#fed7d7', 
              color: '#c53030',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              Error: {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.cardBordered}>
      {/* Header con estado de conexión */}
      <div style={{ ...styles.flexBetween, marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
              Banda Actual: {localBand.name}
            </h2>
            {loading ? (
              <Database size={16} className="animate-pulse" color="#3182ce" />
            ) : isConnected ? (
              <Wifi size={16} color="#38a169" title="Conectado a Firebase" />
            ) : (
              <WifiOff size={16} color="#f56565" title="Desconectado" />
            )}
          </div>
          <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'white',
            backgroundColor: localBand.phase === 'setup' ? '#d69e2e' :
                            localBand.phase === 'show' ? '#38a169' : '#dd6b20'
          }}>
            {getPhaseLabel(localBand.phase)}
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '14px', color: '#a0aec0', marginBottom: '4px' }}>
            Progreso de la banda
          </div>
          <div style={{ ...styles.flex, gap: '8px' }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '4px',
              backgroundColor: localBand.phase === 'setup' ? '#f6ad55' : '#4a5568',
              transition: 'all 0.3s ease'
            }} />
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '4px',
              backgroundColor: localBand.phase === 'show' ? '#68d391' : '#4a5568',
              transition: 'all 0.3s ease'
            }} />
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '4px',
              backgroundColor: localBand.phase === 'teardown' ? '#f6ad55' : '#4a5568',
              transition: 'all 0.3s ease'
            }} />
          </div>
        </div>
      </div>
      
      {/* Timer principal */}
      <div style={{ ...styles.flex, gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{
          fontSize: '4rem',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          color: localBand.timeRemaining <= 300 ? '#f56565' : 
                 localBand.timeRemaining <= 600 ? '#f6ad55' : '#63b3ed',
          textShadow: localBand.timeRemaining <= 60 ? '0 0 10px rgba(245, 101, 101, 0.5)' : 'none',
          transition: 'all 0.3s ease'
        }}>
          {formatTime(localBand.timeRemaining)}
        </div>
        
        {/* Controles */}
        <div style={{ ...styles.flex, gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={handleStartTimer}
            disabled={localIsRunning || loading || !isValidBand(localBand)}
            style={{
              ...styles.button,
              ...styles.buttonSuccess,
              opacity: (localIsRunning || loading || !isValidBand(localBand)) ? 0.5 : 1
            }}
          >
            <Play size={20} />
            Iniciar
          </button>
          <button
            onClick={handlePauseTimer}
            disabled={!localIsRunning || loading || !isValidBand(localBand)}
            style={{
              ...styles.button,
              ...styles.buttonWarning,
              opacity: (!localIsRunning || loading || !isValidBand(localBand)) ? 0.5 : 1
            }}
          >
            <Pause size={20} />
            Pausar
          </button>
          <button
            onClick={handleResetBand}
            disabled={loading || !isValidBand(localBand)}
            style={{ 
              ...styles.button, 
              ...styles.buttonDanger,
              opacity: (loading || !isValidBand(localBand)) ? 0.5 : 1
            }}
          >
            <RotateCcw size={20} />
            Reset
          </button>
          <button
            onClick={handleNextPhase}
            disabled={localBand.status === 'finished' || loading || !isValidBand(localBand)}
            style={{
              ...styles.button,
              backgroundColor: '#805ad5',
              color: 'white',
              opacity: (localBand.status === 'finished' || loading || !isValidBand(localBand)) ? 0.5 : 1
            }}
          >
            {localBand.phase === 'setup' ? 'Ir a Show' :
             localBand.phase === 'show' ? 'Ir a Desmontaje' :
             'Finalizar'}
          </button>
          <button
            onClick={onNextBand}
            disabled={!canNextBand || loading}
            style={{
              ...styles.button,
              backgroundColor: '#667eea',
              color: 'white',
              opacity: (!canNextBand || loading) ? 0.5 : 1
            }}
          >
            Siguiente Banda
          </button>
        </div>
      </div>

      {/* Información de tiempos */}
      <div style={{ ...styles.grid, ...styles.gridCols3, fontSize: '14px' }}>
        <div style={{ 
          backgroundColor: localBand.phase === 'setup' ? 'rgba(214, 158, 46, 0.3)' : 'rgba(214, 158, 46, 0.1)', 
          padding: '12px', 
          borderRadius: '8px',
          border: localBand.phase === 'setup' ? '2px solid #d69e2e' : '1px solid #e2e8f0',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ color: '#d69e2e', fontWeight: 'bold' }}>Montaje</div>
          <div>{localBand.setupTime} min</div>
        </div>
        <div style={{ 
          backgroundColor: localBand.phase === 'show' ? 'rgba(56, 161, 105, 0.3)' : 'rgba(56, 161, 105, 0.1)', 
          padding: '12px', 
          borderRadius: '8px',
          border: localBand.phase === 'show' ? '2px solid #38a169' : '1px solid #e2e8f0',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ color: '#38a169', fontWeight: 'bold' }}>Show</div>
          <div>{localBand.showTime} min</div>
        </div>
        <div style={{ 
          backgroundColor: localBand.phase === 'teardown' ? 'rgba(221, 107, 32, 0.3)' : 'rgba(221, 107, 32, 0.1)', 
          padding: '12px', 
          borderRadius: '8px',
          border: localBand.phase === 'teardown' ? '2px solid #dd6b20' : '1px solid #e2e8f0',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ color: '#dd6b20', fontWeight: 'bold' }}>Desmontaje</div>
          <div>{localBand.teardownTime} min</div>
        </div>
      </div>

      {/* Indicadores de advertencia */}
      {localBand.timeRemaining <= 300 && localBand.status === 'active' && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: 'rgba(229, 62, 62, 0.2)',
          border: '1px solid #f56565',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: localBand.timeRemaining <= 60 ? 'pulse 1s infinite' : 'none'
        }}>
          <AlertTriangle size={20} color="#f56565" />
          <span style={{ color: '#f56565', fontWeight: 'bold' }}>
            {localBand.timeRemaining <= 30 ? 'TIEMPO CRITICO!' :
             localBand.timeRemaining <= 60 ? 'Último minuto' :
             localBand.timeRemaining <= 120 ? 'Quedan 2 minutos' :
             'Quedan 5 minutos o menos'}
          </span>
        </div>
      )}

      {/* Footer con información de estado */}
      <div style={{
        marginTop: '16px',
        fontSize: '12px',
        color: '#a0aec0',
        borderTop: '1px solid #e2e8f0',
        paddingTop: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>
          Estado: {localIsRunning ? '🟢 Ejecutándose' : '⏸️ Pausado'}
        </span>
        <span>
          Última sync: {new Date(lastSyncTime).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default CurrentBandControl;