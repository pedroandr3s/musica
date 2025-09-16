import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import BandView from './BandView';
import NotificationSystem from './NotificationSystem';
import TimerDisplay from './TimerDisplay';
import TimerControls from './TimerControls';
import WindowControls from './WindowControls';
import BandsList from './BandsList';
import AddBandForm from './AddBandForm';
import { formatTime, getPhaseLabel } from '../utils/helpers';
import { useFirebase } from '../hooks/useFirebase';

const StageTimer = () => {
  const [bands, setBands] = useState([]);
  const [currentBandIndex, setCurrentBandIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [displayWindow, setDisplayWindow] = useState(null);
  const [bandWindow, setBandWindow] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [autoMode, setAutoMode] = useState(true);
  const [currentView, setCurrentView] = useState('admin');

  const { saveToFirebase, loadFromFirebase } = useFirebase();

  // Load bands from Firebase on component mount
  useEffect(() => {
    const loadBands = async () => {
      try {
        const result = await loadFromFirebase();
        if (result.success && result.data?.bands) {
          setBands(result.data.bands);
          if (result.data.currentBandIndex !== undefined) {
            setCurrentBandIndex(result.data.currentBandIndex);
          }
          if (result.data.autoMode !== undefined) {
            setAutoMode(result.data.autoMode);
          }
          addNotification(`📥 ${result.data.bands.length} bandas cargadas desde Firebase`, 'success');
        }
      } catch (error) {
        console.error('Error loading bands from Firebase:', error);
        addNotification('❌ Error al cargar bandas desde Firebase', 'error');
      }
    };

    loadBands();
  }, [loadFromFirebase]);

  // Save to Firebase when important data changes
  useEffect(() => {
    const saveData = async () => {
      await saveToFirebase({
        bands,
        currentBandIndex,
        autoMode,
        lastUpdated: new Date().toISOString()
      });
    };
    
    // Debounce save to avoid too frequent calls
    const timeoutId = setTimeout(saveData, 1000);
    return () => clearTimeout(timeoutId);
  }, [bands, currentBandIndex, autoMode, saveToFirebase]);

  // Enhanced audio context for notifications
  const playSound = useCallback((frequency = 800, duration = 200) => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  }, [soundEnabled]);

  // Add notification system
  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Enhanced timer with auto/manual mode
  useEffect(() => {
    let interval = null;
    if (isRunning && currentBandIndex < bands.length) {
      interval = setInterval(() => {
        setBands(prevBands => {
          const newBands = [...prevBands];
          if (newBands[currentBandIndex] && newBands[currentBandIndex].timeRemaining > 0) {
            newBands[currentBandIndex].timeRemaining -= 1;
            newBands[currentBandIndex].status = 'active';
            
            // Warning sounds at 5 minutes, 2 minutes, 1 minute, and 30 seconds
            const timeLeft = newBands[currentBandIndex].timeRemaining;
            if (timeLeft === 300) {
              playSound(600, 300);
              addNotification('⚠️ 5 minutos restantes', 'warning');
            } else if (timeLeft === 120) {
              playSound(700, 300);
              addNotification('⚠️ 2 minutos restantes', 'warning');
            } else if (timeLeft === 60) {
              playSound(800, 300);
              addNotification('⚠️ 1 minuto restante', 'warning');
            } else if (timeLeft === 30) {
              playSound(900, 500);
              addNotification('🚨 30 segundos restantes', 'error');
            } else if (timeLeft <= 10 && timeLeft > 0) {
              playSound(1000, 100);
            }
            
          } else if (newBands[currentBandIndex]) {
            const currentBand = newBands[currentBandIndex];
            playSound(400, 800);
            
            if (currentBand.phase === 'setup') {
              currentBand.phase = 'show';
              currentBand.timeRemaining = currentBand.showTime * 60;
              currentBand.status = 'waiting';
              addNotification(`✅ ${currentBand.name} - Montaje completado. ¡Hora del show!`, 'success');
              
              // Auto mode: automatically start next phase
              if (autoMode) {
                setTimeout(() => {
                  setIsRunning(true);
                  currentBand.status = 'active';
                }, 2000);
              }
            } else if (currentBand.phase === 'show') {
              currentBand.phase = 'teardown';
              currentBand.timeRemaining = currentBand.teardownTime * 60;
              currentBand.status = 'waiting';
              addNotification(`🎵 ${currentBand.name} - Show terminado. Tiempo de desmontaje`, 'success');
              
              // Auto mode: automatically start teardown
              if (autoMode) {
                setTimeout(() => {
                  setIsRunning(true);
                  currentBand.status = 'active';
                }, 2000);
              }
            } else {
              currentBand.status = 'finished';
              addNotification(`🎉 ${currentBand.name} - ¡Presentación completa!`, 'success');
              
              // Auto mode: move to next band
              if (autoMode && currentBandIndex < bands.length - 1) {
                setTimeout(() => {
                  setCurrentBandIndex(prev => prev + 1);
                  addNotification(`🎸 Auto-cambio a: ${bands[currentBandIndex + 1].name}`, 'info');
                }, 3000);
              }
            }
            
            if (!autoMode) {
              setIsRunning(false);
            }
          }
          return newBands;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, currentBandIndex, bands.length, playSound, autoMode, addNotification]);

  // Timer control functions
  const startTimer = () => {
    if (currentBandIndex < bands.length) {
      setIsRunning(true);
      addNotification(`🎬 Iniciando ${getPhaseLabel(bands[currentBandIndex].phase)} - ${bands[currentBandIndex].name}`, 'info');
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
    addNotification('⏸️ Timer pausado', 'info');
  };

  const resetCurrentBand = () => {
    if (currentBandIndex < bands.length) {
      setBands(prevBands => {
        const newBands = [...prevBands];
        const currentBand = newBands[currentBandIndex];
        currentBand.phase = 'setup';
        currentBand.timeRemaining = currentBand.setupTime * 60;
        currentBand.status = 'waiting';
        return newBands;
      });
      setIsRunning(false);
      addNotification('🔄 Banda reiniciada al montaje', 'info');
    }
  };

  const nextPhase = () => {
    if (currentBandIndex < bands.length) {
      setBands(prevBands => {
        const newBands = [...prevBands];
        const currentBand = newBands[currentBandIndex];
        
        if (currentBand.phase === 'setup') {
          currentBand.phase = 'show';
          currentBand.timeRemaining = currentBand.showTime * 60;
          addNotification(`🎵 ${currentBand.name} - Iniciando show`, 'success');
        } else if (currentBand.phase === 'show') {
          currentBand.phase = 'teardown';
          currentBand.timeRemaining = currentBand.teardownTime * 60;
          addNotification(`📦 ${currentBand.name} - Iniciando desmontaje`, 'success');
        } else {
          currentBand.status = 'finished';
          addNotification(`✅ ${currentBand.name} - Finalizada`, 'success');
        }
        currentBand.status = 'waiting';
        return newBands;
      });
      setIsRunning(false);
    }
  };

  const nextBand = () => {
    if (currentBandIndex < bands.length - 1) {
      setCurrentBandIndex(currentBandIndex + 1);
      setIsRunning(false);
      addNotification(`🎸 Cambiando a: ${bands[currentBandIndex + 1].name}`, 'info');
    }
  };

  const selectBand = (index) => {
    setCurrentBandIndex(index);
    setIsRunning(false);
    addNotification(`🎸 Banda seleccionada: ${bands[index].name}`, 'info');
  };

  // Reorder bands function for drag and drop
  const reorderBands = useCallback((dragIndex, hoverIndex) => {
    setBands(prevBands => {
      const newBands = [...prevBands];
      const draggedBand = newBands[dragIndex];
      newBands.splice(dragIndex, 1);
      newBands.splice(hoverIndex, 0, draggedBand);
      return newBands;
    });
  }, []);

  // Band management functions
  const addBand = (bandData) => {
    const newBand = {
      id: Date.now(),
      ...bandData,
      status: 'waiting',
      phase: 'setup',
      timeRemaining: bandData.setupTime * 60
    };
    setBands([...bands, newBand]);
    addNotification(`➕ Banda "${newBand.name}" agregada`, 'success');
  };

  // Reload bands from Firebase
  const reloadBandsFromFirebase = async () => {
    try {
      const result = await loadFromFirebase();
      if (result.success && result.data?.bands) {
        setBands(result.data.bands);
        if (result.data.currentBandIndex !== undefined) {
          setCurrentBandIndex(result.data.currentBandIndex);
        }
        if (result.data.autoMode !== undefined) {
          setAutoMode(result.data.autoMode);
        }
        addNotification(`🔄 ${result.data.bands.length} bandas recargadas desde Firebase`, 'success');
      } else {
        addNotification('⚠️ No se encontraron bandas en Firebase', 'warning');
      }
    } catch (error) {
      console.error('Error reloading bands from Firebase:', error);
      addNotification('❌ Error al recargar bandas desde Firebase', 'error');
    }
  };

  // Handle when a new band is added from the form
  const handleBandAdded = async (newBand) => {
    // Automatically reload bands from Firebase to sync with the new addition
    await reloadBandsFromFirebase();
    addNotification(`✅ Nueva banda "${newBand.name}" agregada y sincronizada`, 'success');
  };

  const deleteBand = (id, name) => {
    setBands(bands.filter(band => band.id !== id));
    if (currentBandIndex >= bands.length - 1) {
      setCurrentBandIndex(Math.max(0, bands.length - 2));
    }
    addNotification(`🗑️ Banda "${name}" eliminada`, 'info');
  };

  const updateBand = (updatedBand) => {
    setBands(bands.map(band => {
      if (band.id === updatedBand.id) {
        const newBand = { ...band, ...updatedBand };
        
        if (band.status === 'waiting') {
          if (band.phase === 'setup') {
            newBand.timeRemaining = updatedBand.setupTime * 60;
          } else if (band.phase === 'show') {
            newBand.timeRemaining = updatedBand.showTime * 60;
          } else if (band.phase === 'teardown') {
            newBand.timeRemaining = updatedBand.teardownTime * 60;
          }
        }
        
        return newBand;
      }
      return band;
    }));
    addNotification(`✏️ Banda "${updatedBand.name}" actualizada`, 'success');
  };

  // Utility functions
  const getTotalTime = () => {
    return bands.reduce((total, band) => 
      total + band.setupTime + band.showTime + band.teardownTime, 0);
  };

  // Window management functions
  const openDisplayWindow = () => {
    const newDisplayWindow = window.open('', 'StageDisplay', 'width=1920,height=1080,fullscreen=yes');
    if (newDisplayWindow) {
      setDisplayWindow(newDisplayWindow);
      
      newDisplayWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Stage Timer - Display</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            * { box-sizing: border-box; }
            body { 
              margin: 0; 
              font-family: Arial, sans-serif; 
              overflow: hidden;
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
            @keyframes slideIn {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
            @media (max-width: 768px) {
              .timer { font-size: 4rem !important; }
              .band-name { font-size: 2rem !important; }
              .phase { font-size: 1.5rem !important; }
            }
            @media (min-width: 769px) and (max-width: 1200px) {
              .timer { font-size: 6rem !important; }
              .band-name { font-size: 3rem !important; }
              .phase { font-size: 2rem !important; }
            }
          </style>
        </head>
        <body>
          <div id="display-root">Inicializando visualizador...</div>
        </body>
        </html>
      `);
      
      addNotification('📺 Visualizador abierto en nueva ventana', 'success');
    } else {
      addNotification('❌ No se pudo abrir el visualizador. Verifica que los pop-ups estén habilitados.', 'error');
    }
  };

  const openBandWindow = () => {
    const newBandWindow = window.open('', 'BandView', 'width=1200,height=800');
    if (newBandWindow) {
      setBandWindow(newBandWindow);
      
      newBandWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Stage Timer - Band View</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            * { box-sizing: border-box; }
            body { 
              margin: 0; 
              font-family: Arial, sans-serif;
              background-color: #1a1a1a;
              color: white;
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          </style>
        </head>
        <body>
          <div id="band-root">Cargando vista de banda...</div>
        </body>
        </html>
      `);
      
      addNotification('🎸 Vista de banda abierta en nueva ventana', 'success');
    } else {
      addNotification('❌ No se pudo abrir la vista de banda', 'error');
    }
  };

  // Export/Import functions
  const exportSchedule = () => {
    const data = {
      bands,
      currentBandIndex,
      autoMode,
      exportDate: new Date().toISOString(),
      totalTime: getTotalTime()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stage-schedule-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addNotification('📊 Cronograma exportado', 'success');
  };

  const importSchedule = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.bands) {
            setBands(data.bands);
            setCurrentBandIndex(data.currentBandIndex || 0);
            if (typeof data.autoMode === 'boolean') {
              setAutoMode(data.autoMode);
            }
            addNotification('📂 Cronograma importado exitosamente', 'success');
          }
        } catch (error) {
          addNotification('❌ Error al importar cronograma', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  // Update display window content
  useEffect(() => {
    if (displayWindow && !displayWindow.closed) {
      const currentBand = bands[currentBandIndex];
      const totalPhaseTime = currentBand ? (
        currentBand.phase === 'setup' ? currentBand.setupTime * 60 :
        currentBand.phase === 'show' ? currentBand.showTime * 60 :
        currentBand.teardownTime * 60
      ) : 0;
      
      const progressPercentage = currentBand ? 
        Math.max(0, ((totalPhaseTime - currentBand.timeRemaining) / totalPhaseTime) * 100) : 0;
      
      const displayContent = `
        <div style="
          min-height: 100vh;
          background-color: #1a1a1a;
          color: white;
          font-family: Arial, sans-serif;
          display: flex;
          flex-direction: column;
        ">
          <!-- Header -->
          <div style="
            background-color: #2d3748;
            padding: 1vh 2vw;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
          ">
            <div style="display: flex; align-items: center; gap: 1vw; font-size: clamp(1.2rem, 3vw, 2rem); font-weight: bold;">
              🕐 Stage Timer
            </div>
            <div style="display: flex; gap: 2vw; align-items: center; font-size: clamp(0.8rem, 2vw, 1.2rem);">
              ${currentBand ? `<div style="color: #a0aec0;">${currentBandIndex + 1}/${bands.length}</div>` : ''}
              <div style="color: ${soundEnabled ? '#68d391' : '#a0aec0'};">
                ${soundEnabled ? '🔊' : '🔇'}
              </div>
            </div>
          </div>

          <!-- Main Display -->
          <div style="
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2vh 2vw;
            text-align: center;
          ">
            ${currentBand ? `
              <div class="band-name" style="
                font-size: clamp(2rem, 8vw, 6rem); 
                font-weight: bold; 
                margin-bottom: 2vh; 
                line-height: 1.2;
                word-break: break-word;
              ">
                ${currentBand.name}
              </div>
              
              <div class="timer" style="
                font-size: clamp(4rem, 15vw, 12rem);
                font-family: monospace;
                font-weight: bold;
                margin-bottom: 2vh;
                color: ${currentBand.timeRemaining <= 30 && currentBand.status === 'active' ? '#f56565' :
                        currentBand.timeRemaining <= 300 && currentBand.status === 'active' ? '#f56565' : 
                        currentBand.timeRemaining <= 600 && currentBand.status === 'active' ? '#f6ad55' : 
                        currentBand.phase === 'show' ? '#68d391' :
                        currentBand.phase === 'teardown' ? '#f6ad55' : '#63b3ed'};
                ${currentBand.timeRemaining <= 30 && currentBand.status === 'active' ? 'animation: pulse 1s infinite;' : ''}
              ">
                ${formatTime(currentBand.timeRemaining)}
              </div>

              <div class="phase" style="
                font-size: clamp(1.5rem, 5vw, 3rem);
                font-weight: bold;
                padding: 1vh 3vw;
                border-radius: 50px;
                margin-bottom: 3vh;
                background-color: ${currentBand.status === 'waiting' ? 
                  (currentBand.phase === 'setup' ? '#d69e2e' :
                   currentBand.phase === 'show' ? '#38a169' :
                   '#dd6b20') :
                currentBand.status === 'active' ? 
                  (currentBand.timeRemaining <= 30 ? '#e53e3e' : '#3182ce') :
                '#4a5568'};
                ${currentBand.timeRemaining <= 30 && currentBand.status === 'active' ? 'animation: pulse 1s infinite;' : ''}
              ">
                ${currentBand.status === 'waiting' ? 
                  `ESPERANDO ${getPhaseLabel(currentBand.phase).toUpperCase()}` :
                 currentBand.status === 'active' ? 
                  (currentBand.timeRemaining <= 30 ? 
                    `¡${getPhaseLabel(currentBand.phase).toUpperCase()}!` :
                    getPhaseLabel(currentBand.phase).toUpperCase()) : 
                  'FINALIZADO'}
              </div>

              <!-- Progress Bar -->
              <div style="width: min(90vw, 800px); margin-top: 2vh;">
                <div style="
                  width: 100%;
                  height: clamp(16px, 2vh, 32px);
                  background-color: #4a5568;
                  border-radius: 12px;
                  overflow: hidden;
                  position: relative;
                ">
                  <div style="
                    height: 100%;
                    border-radius: 12px;
                    transition: width 1s ease;
                    background-color: ${currentBand.timeRemaining <= 300 && currentBand.status === 'active' ? '#f56565' : 
                                       currentBand.timeRemaining <= 600 && currentBand.status === 'active' ? '#f6ad55' : 
                                       currentBand.phase === 'show' ? '#68d391' :
                                       currentBand.phase === 'teardown' ? '#f6ad55' : '#63b3ed'};
                    width: ${progressPercentage}%;
                  "></div>
                </div>
                
                <div style="
                  display: flex;
                  justify-content: space-between;
                  margin-top: 1vh;
                  font-size: clamp(0.8rem, 2vw, 1rem);
                  color: #a0aec0;
                ">
                  <span>0:00</span>
                  <span>${formatTime(totalPhaseTime)}</span>
                </div>
              </div>

              ${currentBand.timeRemaining <= 300 && currentBand.status === 'active' ? `
                <div style="
                  margin-top: 3vh;
                  font-size: clamp(1.2rem, 4vw, 2.5rem);
                  font-weight: bold;
                  text-align: center;
                  color: ${currentBand.timeRemaining <= 30 ? '#f56565' : '#f6ad55'};
                  ${currentBand.timeRemaining <= 30 ? 'animation: pulse 1s infinite;' : ''}
                ">
                  ${currentBand.timeRemaining <= 10 ? '¡TIEMPO AGOTADO!' :
                    currentBand.timeRemaining <= 30 ? '¡30 SEGUNDOS!' :
                    currentBand.timeRemaining <= 60 ? '¡1 MINUTO RESTANTE!' :
                    currentBand.timeRemaining <= 120 ? '2 MINUTOS RESTANTES' :
                    '5 MINUTOS RESTANTES'}
                </div>
              ` : ''}

              ${currentBandIndex < bands.length - 1 ? `
                <div style="margin-top: 3vh; text-align: center;">
                  <div style="font-size: clamp(1rem, 3vw, 1.5rem); color: #a0aec0;">Siguiente:</div>
                  <div style="font-size: clamp(1.5rem, 4vw, 2.5rem); font-weight: bold; color: #e2e8f0;">
                    ${bands[currentBandIndex + 1].name}
                  </div>
                </div>
              ` : ''}
            ` : `
              <div style="text-align: center;">
                <div style="font-size: clamp(2rem, 6vw, 4rem); color: #a0aec0; margin-bottom: 2vh;">
                  No hay bandas programadas
                </div>
                <div style="font-size: clamp(1rem, 3vw, 1.5rem); color: #718096;">
                  Agrega bandas en el panel de administración
                </div>
              </div>
            `}
          </div>

          <!-- Bottom Info -->
          <div style="background-color: #2d3748; padding: 1vh 2vw; flex-shrink: 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
              <div style="font-size: clamp(1rem, 3vw, 1.5rem);">
                ${currentBand ? `
                  Banda ${currentBandIndex + 1} de ${bands.length} - ${getPhaseLabel(currentBand.phase)}
                  ${currentBand.status === 'active' ? '<span style="margin-left: 1vw; color: #63b3ed;">● EN VIVO</span>' : ''}
                ` : 'Sin bandas programadas'}
              </div>
              <div style="display: flex; gap: 2vw; align-items: center; font-size: clamp(0.9rem, 2.5vw, 1.2rem);">
                ${currentBand ? `
                  <span>
                    Tiempo asignado: ${
                      currentBand.phase === 'setup' ? currentBand.setupTime :
                      currentBand.phase === 'show' ? currentBand.showTime :
                      currentBand.teardownTime
                    } minutos
                  </span>
                  <div style="display: flex; gap: 0.5vw;">
                    <div style="
                      width: 1vw; height: 1vw; border-radius: 4px;
                      background-color: ${currentBand.phase === 'setup' ? '#f6ad55' : '#4a5568'};
                    " title="Montaje"></div>
                    <div style="
                      width: 1vw; height: 1vw; border-radius: 4px;
                      background-color: ${currentBand.phase === 'show' ? '#68d391' : '#4a5568'};
                    " title="Show"></div>
                    <div style="
                      width: 1vw; height: 1vw; border-radius: 4px;
                      background-color: ${currentBand.phase === 'teardown' ? '#f6ad55' : '#4a5568'};
                    " title="Desmontaje"></div>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
      
      const displayRoot = displayWindow.document.getElementById('display-root');
      if (displayRoot) {
        displayRoot.innerHTML = displayContent;
      }
    }
  }, [bands, currentBandIndex, isRunning, soundEnabled, displayWindow]);

  // Update band window content  
  useEffect(() => {
    if (bandWindow && !bandWindow.closed) {
      const currentBand = bands[currentBandIndex];
      const bandContent = `
        <div style="
          min-height: 100vh;
          background-color: #1a1a1a;
          color: white;
          padding: 2vh 2vw;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        ">
          ${currentBand ? `
            <div style="font-size: 3rem; font-weight: bold; margin-bottom: 2vh; text-align: center;">
              ${currentBand.name}
            </div>
            <div style="
              font-size: 6rem;
              font-family: monospace;
              font-weight: bold;
              margin-bottom: 2vh;
              color: ${currentBand.timeRemaining <= 300 ? '#f56565' : '#63b3ed'};
            ">
              ${formatTime(currentBand.timeRemaining)}
            </div>
            <div style="
              font-size: 2rem;
              padding: 1vh 2vw;
              border-radius: 25px;
              background-color: ${currentBand.phase === 'setup' ? '#d69e2e' :
                                currentBand.phase === 'show' ? '#38a169' : '#dd6b20'};
            ">
              ${getPhaseLabel(currentBand.phase)}
            </div>
            <div style="margin-top: 3vh; text-align: center;">
              <div style="font-size: 1.2rem; color: #a0aec0;">Estado:</div>
              <div style="font-size: 1.5rem; color: ${currentBand.status === 'active' ? '#63b3ed' : '#f6ad55'};">
                ${currentBand.status === 'waiting' ? 'Esperando' :
                  currentBand.status === 'active' ? 'EN VIVO' : 'Finalizada'}
              </div>
            </div>
          ` : `
            <div>No hay banda seleccionada</div>
          `}
        </div>
      `;
      
      const bandRoot = bandWindow.document.getElementById('band-root');
      if (bandRoot) {
        bandRoot.innerHTML = bandContent;
      }
    }
  }, [bands, currentBandIndex, isRunning, bandWindow]);

  // Clean up windows on unmount
  useEffect(() => {
    return () => {
      if (displayWindow && !displayWindow.closed) {
        displayWindow.close();
      }
      if (bandWindow && !bandWindow.closed) {
        bandWindow.close();
      }
    };
  }, [displayWindow, bandWindow]);

  // Switch to band view
  if (currentView === 'band') {
    return (
      <>
        <BandView
          band={bands[currentBandIndex]}
          currentBandIndex={currentBandIndex}
          totalBands={bands.length}
          onBackToAdmin={() => setCurrentView('admin')}
        />
        <NotificationSystem notifications={notifications} />
      </>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#1a1a1a',
        color: 'white',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              margin: '0 0 10px 0',
              background: 'linear-gradient(45deg, #4299e1, #9f7aea)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              🎵 Stage Timer
            </h1>
            <p style={{
              color: '#a0aec0',
              fontSize: '1.1rem',
              margin: 0
            }}>
              Sistema de gestión de tiempo para presentaciones en vivo
            </p>
          </div>

          {/* Main Content Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '20px'
          }}>
            {/* Left Column */}
            <div>
              <TimerDisplay 
                bands={bands} 
                currentBandIndex={currentBandIndex} 
              />
              <TimerControls
                bands={bands}
                currentBandIndex={currentBandIndex}
                isRunning={isRunning}
                onStartTimer={startTimer}
                onPauseTimer={pauseTimer}
                onResetCurrentBand={resetCurrentBand}
                onNextPhase={nextPhase}
                onNextBand={nextBand}
              />
            </div>

            {/* Right Column */}
            <div>
              <WindowControls
                soundEnabled={soundEnabled}
                autoMode={autoMode}
                setSoundEnabled={setSoundEnabled}
                setAutoMode={setAutoMode}
                onOpenDisplayWindow={openDisplayWindow}
                onOpenBandWindow={openBandWindow}
                onExportSchedule={exportSchedule}
                onImportSchedule={importSchedule}
                onSwitchToBandView={() => setCurrentView('band')}
                onReloadBands={reloadBandsFromFirebase}
              />
              <AddBandForm onBandAdded={handleBandAdded} />
            </div>
          </div>

          {/* Full Width Bands List */}
          <BandsList
            bands={bands}
            currentBandIndex={currentBandIndex}
            onSelectBand={selectBand}
            onDeleteBand={deleteBand}
            onUpdateBand={updateBand}
            onReorderBands={reorderBands}
            getTotalTime={getTotalTime}
          />
        </div>
      </div>
      <NotificationSystem notifications={notifications} />
    </DndProvider>
  );
};

export default StageTimer;