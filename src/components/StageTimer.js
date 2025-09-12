import React, { useState, useEffect, useCallback } from 'react';
import AdminView from './AdminView';
import NotificationSystem from './NotificationSystem';
import { formatTime, getPhaseLabel } from '../utils/helpers';

const StageTimer = () => {
  const [bands, setBands] = useState([
    { id: 1, name: 'Osyan', setupTime: 30, showTime: 45, teardownTime: 15, status: 'waiting', phase: 'setup', timeRemaining: 30 * 60 },
    { id: 2, name: 'Wofo', setupTime: 45, showTime: 60, teardownTime: 20, status: 'waiting', phase: 'setup', timeRemaining: 45 * 60 },
    { id: 3, name: 'Carnada', setupTime: 25, showTime: 30, teardownTime: 10, status: 'waiting', phase: 'setup', timeRemaining: 25 * 60 }
  ]);
  const [currentBandIndex, setCurrentBandIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [displayWindow, setDisplayWindow] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifications, setNotifications] = useState([]);

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

  // Enhanced timer with warnings
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
            } else if (currentBand.phase === 'show') {
              currentBand.phase = 'teardown';
              currentBand.timeRemaining = currentBand.teardownTime * 60;
              currentBand.status = 'waiting';
              addNotification(`🎵 ${currentBand.name} - Show terminado. Tiempo de desmontaje`, 'success');
            } else {
              currentBand.status = 'finished';
              addNotification(`🎉 ${currentBand.name} - ¡Presentación completa!`, 'success');
            }
            setIsRunning(false);
          }
          return newBands;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, currentBandIndex, bands.length, playSound]);

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

  // Display window management
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
          <style>
            body { margin: 0; font-family: Arial, sans-serif; }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
            @keyframes slideIn {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          </style>
        </head>
        <body>
          <div id="display-root">Cargando visualizador...</div>
        </body>
        </html>
      `);
      
      addNotification('📺 Visualizador abierto en nueva ventana', 'success');
    } else {
      addNotification('❌ No se pudo abrir el visualizador. Verifica que los pop-ups estén habilitados.', 'error');
    }
  };

  // Update display window content
  useEffect(() => {
    if (displayWindow && !displayWindow.closed) {
      const currentBand = bands[currentBandIndex];
      const displayContent = `
        <div style="
          min-height: 100vh;
          background-color: #1a1a1a;
          color: white;
          font-family: Arial, sans-serif;
        ">
          <!-- Header -->
          <div style="
            background-color: #2d3748;
            padding: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          ">
            <div style="display: flex; align-items: center; gap: 12px; font-size: 24px; font-weight: bold;">
              🕐 Stage Timer
            </div>
            <div style="display: flex; gap: 16px; align-items: center;">
              ${currentBand ? `<div style="font-size: 14px; color: #a0aec0;">${currentBandIndex + 1}/${bands.length}</div>` : ''}
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
            padding: 32px;
          ">
            ${currentBand ? `
              <div style="font-size: 4rem; font-weight: bold; margin-bottom: 32px; text-align: center;">
                ${currentBand.name}
              </div>
              
              <div style="
                font-size: 8rem;
                font-family: monospace;
                font-weight: bold;
                margin-bottom: 32px;
                color: ${currentBand.timeRemaining <= 30 && currentBand.status === 'active' ? '#f56565' :
                        currentBand.timeRemaining <= 300 && currentBand.status === 'active' ? '#f56565' : 
                        currentBand.timeRemaining <= 600 && currentBand.status === 'active' ? '#f6ad55' : 
                        currentBand.phase === 'show' ? '#68d391' :
                        currentBand.phase === 'teardown' ? '#f6ad55' : '#63b3ed'};
                ${currentBand.timeRemaining <= 30 && currentBand.status === 'active' ? 'animation: pulse 1s infinite;' : ''}
              ">
                ${formatTime(currentBand.timeRemaining)}
              </div>

              <div style="
                font-size: 3rem;
                font-weight: bold;
                padding: 16px 32px;
                border-radius: 50px;
                margin-bottom: 32px;
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
              <div style="width: 100%; max-width: 800px; margin-top: 32px;">
                <div style="
                  width: 100%;
                  height: 24px;
                  background-color: #4a5568;
                  border-radius: 12px;
                  overflow: hidden;
                ">
                  <div style="
                    height: 100%;
                    border-radius: 12px;
                    transition: width 1s ease;
                    background-color: ${currentBand.timeRemaining <= 300 && currentBand.status === 'active' ? '#f56565' : 
                                       currentBand.timeRemaining <= 600 && currentBand.status === 'active' ? '#f6ad55' : 
                                       currentBand.phase === 'show' ? '#68d391' :
                                       currentBand.phase === 'teardown' ? '#f6ad55' : '#63b3ed'};
                    width: ${Math.max(0, (currentBand.timeRemaining / (
                      currentBand.phase === 'setup' ? currentBand.setupTime * 60 :
                      currentBand.phase === 'show' ? currentBand.showTime * 60 :
                      currentBand.teardownTime * 60
                    )) * 100)}%;
                  "></div>
                </div>
                
                <div style="
                  display: flex;
                  justify-content: space-between;
                  margin-top: 8px;
                  font-size: 14px;
                  color: #a0aec0;
                ">
                  <span>0:00</span>
                  <span>${formatTime(
                    currentBand.phase === 'setup' ? currentBand.setupTime * 60 :
                    currentBand.phase === 'show' ? currentBand.showTime * 60 :
                    currentBand.teardownTime * 60
                  )}</span>
                </div>
              </div>

              ${currentBand.timeRemaining <= 300 && currentBand.status === 'active' ? `
                <div style="
                  margin-top: 32px;
                  font-size: 2rem;
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
                <div style="margin-top: 32px; text-align: center;">
                  <div style="font-size: 18px; color: #a0aec0;">Siguiente:</div>
                  <div style="font-size: 2rem; font-weight: bold; color: #e2e8f0;">
                    ${bands[currentBandIndex + 1].name}
                  </div>
                </div>
              ` : ''}
            ` : `
              <div style="text-align: center;">
                <div style="font-size: 4rem; color: #a0aec0; margin-bottom: 16px;">
                  No hay bandas programadas
                </div>
                <div style="font-size: 20px; color: #718096;">
                  Agrega bandas en el panel de administración
                </div>
              </div>
            `}
          </div>

          <!-- Bottom Info -->
          <div style="background-color: #2d3748; padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="font-size: 18px;">
                ${currentBand ? `
                  Banda ${currentBandIndex + 1} de ${bands.length} - ${getPhaseLabel(currentBand.phase)}
                  ${currentBand.status === 'active' ? '<span style="margin-left: 8px; color: #63b3ed;">● EN VIVO</span>' : ''}
                ` : 'Sin bandas programadas'}
              </div>
              <div style="display: flex; gap: 16px; align-items: center; font-size: 18px;">
                ${currentBand ? `
                  <span>
                    Tiempo asignado: ${
                      currentBand.phase === 'setup' ? currentBand.setupTime :
                      currentBand.phase === 'show' ? currentBand.showTime :
                      currentBand.teardownTime
                    } minutos
                  </span>
                  <div style="display: flex; gap: 4px;">
                    <div style="
                      width: 12px; height: 12px; border-radius: 4px;
                      background-color: ${currentBand.phase === 'setup' ? '#f6ad55' : '#4a5568'};
                    " title="Montaje"></div>
                    <div style="
                      width: 12px; height: 12px; border-radius: 4px;
                      background-color: ${currentBand.phase === 'show' ? '#68d391' : '#4a5568'};
                    " title="Show"></div>
                    <div style="
                      width: 12px; height: 12px; border-radius: 4px;
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

  // Clean up display window on unmount
  useEffect(() => {
    return () => {
      if (displayWindow && !displayWindow.closed) {
        displayWindow.close();
      }
    };
  }, [displayWindow]);

  // Export/Import functions
  const exportSchedule = () => {
    const data = {
      bands,
      currentBandIndex,
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
            addNotification('📂 Cronograma importado exitosamente', 'success');
          }
        } catch (error) {
          addNotification('❌ Error al importar cronograma', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <AdminView
        bands={bands}
        currentBandIndex={currentBandIndex}
        isRunning={isRunning}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onStartTimer={startTimer}
        onPauseTimer={pauseTimer}
        onResetCurrentBand={resetCurrentBand}
        onNextPhase={nextPhase}
        onNextBand={nextBand}
        onSelectBand={selectBand}
        onAddBand={addBand}
        onDeleteBand={deleteBand}
        onUpdateBand={updateBand}
        onOpenDisplayWindow={openDisplayWindow}
        onExportSchedule={exportSchedule}
        onImportSchedule={importSchedule}
        getTotalTime={getTotalTime}
      />
      <NotificationSystem notifications={notifications} />
    </>
  );
};

export default StageTimer;