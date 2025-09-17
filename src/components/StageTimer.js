import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import BandView from './BandView';
import TimerDisplay from './TimerDisplay';
import TimerControls from './TimerControls';
import WindowControls from './WindowControls';
import BandsList from './BandsList';
import AddBandForm from './AddBandForm';
import DisplayWindowButton from './DisplayWindowButton';
import { updateDisplayWindow } from './DisplayWindowButton';
import { formatTime, getPhaseLabel } from '../utils/helpers';
import { useFirebase } from '../hooks/useFirebase';

const StageTimer = () => {
  const [bands, setBands] = useState([]);
  const [currentBandIndex, setCurrentBandIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [displayWindow, setDisplayWindow] = useState(null);
  const [bandWindow, setBandWindow] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoMode, setAutoMode] = useState(true);
  const [currentView, setCurrentView] = useState('admin');
  const [isMobile, setIsMobile] = useState(false);

  const { saveToFirebase, loadFromFirebase } = useFirebase();

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load bands from Firebase on component mount
  useEffect(() => {
    const loadBands = async () => {
      try {
        const result = await loadFromFirebase();
        if (result.success && result.data?.bands && result.data.bands.length > 0) {
          setBands(result.data.bands);
          if (result.data.currentBandIndex !== undefined) {
            setCurrentBandIndex(result.data.currentBandIndex);
          }
          if (result.data.autoMode !== undefined) {
            setAutoMode(result.data.autoMode);
          }
        } else {
          console.log('No bands found in Firebase - starting fresh');
        }
      } catch (error) {
        console.error('Error loading bands from Firebase:', error);
      }
    };

    loadBands();
  }, [loadFromFirebase]);

  // Save to Firebase when important data changes
  useEffect(() => {
    if (bands.length === 0) return;
    
    const saveData = async () => {
      try {
        await saveToFirebase({
          bands,
          currentBandIndex,
          autoMode,
          lastUpdated: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error saving to Firebase:', error);
      }
    };
    
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

  // Enhanced timer with auto/manual mode
  useEffect(() => {
    let interval = null;
    if (isRunning && currentBandIndex < bands.length) {
      interval = setInterval(() => {
        setBands(prevBands => {
          const newBands = [...prevBands];
          const currentBand = newBands[currentBandIndex];
          
          if (!currentBand) return newBands;
          
          if (currentBand.timeRemaining > 0) {
            currentBand.timeRemaining -= 1;
            currentBand.status = 'active';
            
            const timeLeft = currentBand.timeRemaining;
            if (timeLeft === 300) {
              playSound(600, 300);
            } else if (timeLeft === 120) {
              playSound(700, 300);
            } else if (timeLeft === 60) {
              playSound(800, 300);
            } else if (timeLeft === 30) {
              playSound(900, 500);
            } else if (timeLeft <= 10 && timeLeft > 0) {
              playSound(1000, 100);
            }
          } else {
            playSound(400, 800);
            
            if (currentBand.phase === 'setup') {
              currentBand.phase = 'show';
              currentBand.timeRemaining = currentBand.showTime * 60;
              currentBand.status = 'waiting';
              
              if (autoMode) {
                setTimeout(() => {
                  setIsRunning(true);
                }, 2000);
              } else {
                setIsRunning(false);
              }
              
            } else if (currentBand.phase === 'show') {
              currentBand.phase = 'teardown';
              currentBand.timeRemaining = currentBand.teardownTime * 60;
              currentBand.status = 'waiting';
              
              if (autoMode) {
                setTimeout(() => {
                  setIsRunning(true);
                }, 2000);
              } else {
                setIsRunning(false);
              }
              
            } else if (currentBand.phase === 'teardown') {
              currentBand.status = 'finished';
              
              if (autoMode && currentBandIndex < bands.length - 1) {
                setTimeout(() => {
                  setCurrentBandIndex(prev => prev + 1);
                }, 3000);
              } else {
                setIsRunning(false);
              }
            }
          }
          
          return newBands;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, currentBandIndex, bands.length, playSound, autoMode]);

  // Timer control functions
  const startTimer = () => {
    if (currentBandIndex < bands.length) {
      setIsRunning(true);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
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
        } else if (currentBand.phase === 'show') {
          currentBand.phase = 'teardown';
          currentBand.timeRemaining = currentBand.teardownTime * 60;
        } else {
          currentBand.status = 'finished';
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
    }
  };

  const selectBand = (index) => {
    setCurrentBandIndex(index);
    setIsRunning(false);
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
      }
    } catch (error) {
      console.error('Error reloading bands from Firebase:', error);
    }
  };

  // Handle when a new band is added from the form
  const handleBandAdded = async (newBand) => {
    await reloadBandsFromFirebase();
  };

  const deleteBand = (id, name) => {
    setBands(bands.filter(band => band.id !== id));
    if (currentBandIndex >= bands.length - 1) {
      setCurrentBandIndex(Math.max(0, bands.length - 2));
    }
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
  };

  // Utility functions
  const getTotalTime = () => {
    return bands.reduce((total, band) => 
      total + band.setupTime + band.showTime + band.teardownTime, 0);
  };

  // Window management functions - SIMPLIFICADAS
  const handleDisplayWindowCreated = (newDisplayWindow) => {
    setDisplayWindow(newDisplayWindow);
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
          }
        } catch (error) {
          console.error('Error importing schedule:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  // Update display window content usando la función exportada
  useEffect(() => {
    updateDisplayWindow(displayWindow, bands, currentBandIndex, isRunning, soundEnabled);
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
      <BandView
        band={bands[currentBandIndex]}
        currentBandIndex={currentBandIndex}
        totalBands={bands.length}
        onBackToAdmin={() => setCurrentView('admin')}
      />
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#1a1a1a',
        color: 'white',
        padding: isMobile ? '10px' : '20px'
      }}>
        <div style={{
          maxWidth: isMobile ? '100%' : '1200px',
          margin: '0 auto'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: isMobile ? '15px' : '30px'
          }}>
            <h1 style={{
              fontSize: isMobile ? '1.8rem' : '2.5rem',
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
              fontSize: isMobile ? '0.9rem' : '1.1rem',
              margin: 0
            }}>
              Sistema de gestión de tiempo para presentaciones en vivo
            </p>
          </div>

          {/* Main Content - Mobile First Layout */}
          {isMobile ? (
            // Mobile Layout (Vertical)
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <TimerDisplay 
                bands={bands} 
                currentBandIndex={currentBandIndex}
                isMobile={isMobile}
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
              
              {/* Aquí se usa el nuevo componente DisplayWindowButton */}
              <div style={{ marginBottom: '15px' }}>
                <DisplayWindowButton
                  bands={bands}
                  currentBandIndex={currentBandIndex}
                  isRunning={isRunning}
                  soundEnabled={soundEnabled}
                  onDisplayWindowCreated={handleDisplayWindowCreated}
                />
              </div>
              
              <WindowControls
                soundEnabled={soundEnabled}
                autoMode={autoMode}
                setSoundEnabled={setSoundEnabled}
                setAutoMode={setAutoMode}
                onOpenBandWindow={openBandWindow}
                onExportSchedule={exportSchedule}
                onImportSchedule={importSchedule}
                onSwitchToBandView={() => setCurrentView('band')}
                onReloadBands={reloadBandsFromFirebase}
                hideDisplayButton={true} // Ocultar el botón original en WindowControls
              />
              
              <AddBandForm onBandAdded={handleBandAdded} />
              
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
          ) : (
            // Desktop Layout (Grid)
            <>
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
                    isMobile={isMobile}
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
                  {/* Aquí se usa el nuevo componente DisplayWindowButton */}
                  <div style={{ marginBottom: '20px' }}>
                    <DisplayWindowButton
                      bands={bands}
                      currentBandIndex={currentBandIndex}
                      isRunning={isRunning}
                      soundEnabled={soundEnabled}
                      onDisplayWindowCreated={handleDisplayWindowCreated}
                    />
                  </div>
                  
                  <WindowControls
                    soundEnabled={soundEnabled}
                    autoMode={autoMode}
                    setSoundEnabled={setSoundEnabled}
                    setAutoMode={setAutoMode}
                    onOpenBandWindow={openBandWindow}
                    onExportSchedule={exportSchedule}
                    onImportSchedule={importSchedule}
                    onSwitchToBandView={() => setCurrentView('band')}
                    onReloadBands={reloadBandsFromFirebase}
                    hideDisplayButton={true} // Ocultar el botón original en WindowControls
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
            </>
          )}
        </div>
      </div>
    </DndProvider>
  );
};

export default StageTimer;