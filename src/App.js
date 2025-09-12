import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Play, Pause, RotateCcw, Settings, Monitor, Plus, Trash2, Edit3, Volume2, VolumeX, Save, Upload, Download, AlertTriangle, CheckCircle } from 'lucide-react';

const StageTimer = () => {
  const [currentView, setCurrentView] = useState('admin');
  const [bands, setBands] = useState([
    { id: 1, name: 'Osyan', setupTime: 30, showTime: 45, teardownTime: 15, status: 'waiting', phase: 'setup', timeRemaining: 30 * 60 },
    { id: 2, name: 'Wofo', setupTime: 45, showTime: 60, teardownTime: 20, status: 'waiting', phase: 'setup', timeRemaining: 45 * 60 },
    { id: 3, name: 'Carnada', setupTime: 25, showTime: 30, teardownTime: 10, status: 'waiting', phase: 'setup', timeRemaining: 25 * 60 }
  ]);
  const [currentBandIndex, setCurrentBandIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [newBandName, setNewBandName] = useState('');
  const [newBandSetup, setNewBandSetup] = useState('');
  const [newBandShow, setNewBandShow] = useState('');
  const [newBandTeardown, setNewBandTeardown] = useState('');
  const [editingBand, setEditingBand] = useState(null);
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  const getPhaseLabel = (phase) => {
    switch(phase) {
      case 'setup': return 'Montaje';
      case 'show': return 'Show';
      case 'teardown': return 'Desmontaje';
      default: return 'Montaje';
    }
  };

  const addBand = () => {
    if (newBandName && newBandSetup && newBandShow && newBandTeardown && 
        !isNaN(newBandSetup) && !isNaN(newBandShow) && !isNaN(newBandTeardown)) {
      const newBand = {
        id: Date.now(),
        name: newBandName,
        setupTime: parseInt(newBandSetup),
        showTime: parseInt(newBandShow),
        teardownTime: parseInt(newBandTeardown),
        status: 'waiting',
        phase: 'setup',
        timeRemaining: parseInt(newBandSetup) * 60
      };
      setBands([...bands, newBand]);
      setNewBandName('');
      setNewBandSetup('');
      setNewBandShow('');
      setNewBandTeardown('');
      addNotification(`➕ Banda "${newBand.name}" agregada`, 'success');
    }
  };

  const deleteBand = (id, name) => {
    setBands(bands.filter(band => band.id !== id));
    if (currentBandIndex >= bands.length - 1) {
      setCurrentBandIndex(Math.max(0, bands.length - 2));
    }
    addNotification(`🗑️ Banda "${name}" eliminada`, 'info');
  };

  const editBand = (band) => {
    setEditingBand({
      ...band,
      newName: band.name,
      newSetupTime: band.setupTime,
      newShowTime: band.showTime,
      newTeardownTime: band.teardownTime
    });
  };

  const saveBandEdit = () => {
    if (editingBand) {
      setBands(bands.map(band => {
        if (band.id === editingBand.id) {
          const updatedBand = {
            ...band,
            name: editingBand.newName,
            setupTime: parseInt(editingBand.newSetupTime),
            showTime: parseInt(editingBand.newShowTime),
            teardownTime: parseInt(editingBand.newTeardownTime)
          };
          
          if (band.status === 'waiting') {
            if (band.phase === 'setup') {
              updatedBand.timeRemaining = parseInt(editingBand.newSetupTime) * 60;
            } else if (band.phase === 'show') {
              updatedBand.timeRemaining = parseInt(editingBand.newShowTime) * 60;
            } else if (band.phase === 'teardown') {
              updatedBand.timeRemaining = parseInt(editingBand.newTeardownTime) * 60;
            }
          }
          
          return updatedBand;
        }
        return band;
      }));
      setEditingBand(null);
      addNotification(`✏️ Banda "${editingBand.newName}" actualizada`, 'success');
    }
  };

  // Calculate total schedule time
  const getTotalTime = () => {
    return bands.reduce((total, band) => 
      total + band.setupTime + band.showTime + band.teardownTime, 0);
  };

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

  // Styles object
  const styles = {
    // Base styles
    container: {
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    },
    adminContainer: {
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      color: 'white',
      padding: '24px'
    },
    maxWidth: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    // Header styles
    header: {
      backgroundColor: '#2d3748',
      padding: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '24px',
      fontWeight: 'bold'
    },
    // Button styles
    button: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s'
    },
    buttonPrimary: {
      backgroundColor: '#3182ce',
      color: 'white'
    },
    buttonSuccess: {
      backgroundColor: '#38a169',
      color: 'white'
    },
    buttonWarning: {
      backgroundColor: '#d69e2e',
      color: 'white'
    },
    buttonDanger: {
      backgroundColor: '#e53e3e',
      color: 'white'
    },
    buttonSecondary: {
      backgroundColor: '#4a5568',
      color: 'white'
    },
    // Card styles
    card: {
      backgroundColor: '#2d3748',
      padding: '24px',
      borderRadius: '12px',
      marginBottom: '24px'
    },
    cardBordered: {
      backgroundColor: '#2d3748',
      padding: '24px',
      borderRadius: '12px',
      marginBottom: '24px',
      border: '2px solid #3182ce'
    },
    // Input styles
    input: {
      backgroundColor: '#4a5568',
      border: '1px solid #718096',
      borderRadius: '8px',
      padding: '12px 16px',
      color: 'white',
      fontSize: '14px'
    },
    // Grid styles
    grid: {
      display: 'grid',
      gap: '16px'
    },
    gridCols4: {
      gridTemplateColumns: 'repeat(4, 1fr)'
    },
    gridCols3: {
      gridTemplateColumns: 'repeat(3, 1fr)'
    },
    // Flex styles
    flex: {
      display: 'flex'
    },
    flexBetween: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    flexCenter: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    flexCol: {
      display: 'flex',
      flexDirection: 'column'
    },
    gap: {
      gap: '12px'
    },
    // Display view styles
    displayMain: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px'
    },
    bandName: {
      fontSize: '4rem',
      fontWeight: 'bold',
      marginBottom: '32px',
      textAlign: 'center'
    },
    timer: {
      fontSize: '8rem',
      fontFamily: 'monospace',
      fontWeight: 'bold',
      marginBottom: '32px'
    },
    timerCritical: {
      fontSize: '8rem',
      fontFamily: 'monospace',
      fontWeight: 'bold',
      marginBottom: '32px',
      color: '#f56565',
      animation: 'pulse 1s infinite'
    },
    timerWarning: {
      fontSize: '8rem',
      fontFamily: 'monospace',
      fontWeight: 'bold',
      marginBottom: '32px',
      color: '#f6ad55'
    },
    phase: {
      fontSize: '3rem',
      fontWeight: 'bold',
      padding: '16px 32px',
      borderRadius: '50px',
      marginBottom: '32px'
    },
    phaseSetup: {
      backgroundColor: '#d69e2e'
    },
    phaseShow: {
      backgroundColor: '#38a169'
    },
    phaseTeardown: {
      backgroundColor: '#dd6b20'
    },
    phaseActive: {
      backgroundColor: '#3182ce'
    },
    // Progress bar
    progressContainer: {
      width: '100%',
      maxWidth: '800px',
      marginTop: '32px'
    },
    progressBar: {
      width: '100%',
      height: '24px',
      backgroundColor: '#4a5568',
      borderRadius: '12px',
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      borderRadius: '12px',
      transition: 'width 1s ease'
    },
    // Notifications
    notificationContainer: {
      position: 'fixed',
      top: '16px',
      right: '16px',
      zIndex: 1000
    },
    notification: {
      padding: '12px 16px',
      marginBottom: '8px',
      borderRadius: '8px',
      maxWidth: '300px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      animation: 'slideIn 0.3s ease'
    },
    notificationInfo: {
      backgroundColor: '#3182ce'
    },
    notificationSuccess: {
      backgroundColor: '#38a169'
    },
    notificationWarning: {
      backgroundColor: '#d69e2e'
    },
    notificationError: {
      backgroundColor: '#e53e3e'
    },
    // Band list
    bandItem: {
      padding: '16px',
      borderRadius: '8px',
      border: '2px solid #4a5568',
      backgroundColor: '#4a5568',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    bandItemCurrent: {
      border: '2px solid #3182ce',
      backgroundColor: 'rgba(49, 130, 206, 0.1)'
    },
    bandItemFinished: {
      border: '2px solid #38a169',
      backgroundColor: 'rgba(56, 161, 105, 0.1)'
    },
    // Status indicators
    status: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    statusWaiting: {
      backgroundColor: '#d69e2e'
    },
    statusActive: {
      backgroundColor: '#3182ce'
    },
    statusFinished: {
      backgroundColor: '#38a169'
    },
    // Modal
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: '#2d3748',
      padding: '24px',
      borderRadius: '12px',
      width: '400px'
    }
  };

  // Notifications Component
  const NotificationSystem = () => (
    <div style={styles.notificationContainer}>
      {notifications.map(notification => (
        <div
          key={notification.id}
          style={{
            ...styles.notification,
            ...(notification.type === 'error' ? styles.notificationError :
                notification.type === 'warning' ? styles.notificationWarning :
                notification.type === 'success' ? styles.notificationSuccess :
                styles.notificationInfo)
          }}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );

  // Schedule Overview Component
  const ScheduleOverview = () => (
    <div style={styles.card}>
      <div style={styles.flexBetween}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 16px 0' }}>
          Resumen del Cronograma
        </h2>
        <div style={{ fontSize: '14px', color: '#a0aec0' }}>
          Tiempo total: {Math.floor(getTotalTime() / 60)}h {getTotalTime() % 60}m
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {bands.map((band, index) => (
          <div
            key={band.id}
            style={{
              ...styles.bandItem,
              ...(index === currentBandIndex ? styles.bandItemCurrent :
                  band.status === 'finished' ? styles.bandItemFinished : {})
            }}
            onClick={() => selectBand(index)}
          >
            <div style={styles.flexBetween}>
              <div style={{ ...styles.flex, ...styles.gap, alignItems: 'center' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: band.status === 'finished' ? '#38a169' :
                                 band.status === 'active' ? '#3182ce' : '#718096'
                }} />
                <span style={{ fontWeight: '500' }}>{band.name}</span>
                <div style={{
                  ...styles.status,
                  backgroundColor: band.phase === 'setup' ? '#d69e2e' :
                                 band.phase === 'show' ? '#38a169' : '#dd6b20'
                }}>
                  {getPhaseLabel(band.phase)}
                </div>
              </div>
              <div style={{ fontSize: '14px', color: '#e2e8f0' }}>
                {band.setupTime + band.showTime + band.teardownTime}min
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Admin View
  const AdminView = () => (
    <div style={styles.adminContainer}>
      <div style={styles.maxWidth}>
        <div style={{ ...styles.flexBetween, marginBottom: '32px' }}>
          <div style={styles.title}>
            <Settings size={32} color="#63b3ed" />
            <h1>Panel de Administración</h1>
          </div>
          <div style={{ ...styles.flex, gap: '8px' }}>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={{
                ...styles.button,
                backgroundColor: soundEnabled ? '#38a169' : '#4a5568'
              }}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              {soundEnabled ? 'Sonido On' : 'Sonido Off'}
            </button>
            <button
              onClick={exportSchedule}
              style={{ ...styles.button, ...styles.buttonSecondary }}
              title="Exportar cronograma"
            >
              <Download size={20} />
            </button>
            <label style={{ ...styles.button, ...styles.buttonSecondary, cursor: 'pointer' }} title="Importar cronograma">
              <Upload size={20} />
              <input
                type="file"
                accept=".json"
                onChange={importSchedule}
                style={{ display: 'none' }}
              />
            </label>
            <button
              onClick={() => setCurrentView('display')}
              style={{ ...styles.button, ...styles.buttonSuccess }}
            >
              <Monitor size={20} />
              Vista Visualizador
            </button>
          </div>
        </div>

        {/* Schedule Overview */}
        <ScheduleOverview />

        {/* Current Band Control */}
        {bands.length > 0 && currentBandIndex < bands.length && (
          <div style={styles.cardBordered}>
            <div style={{ ...styles.flexBetween, marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  Banda Actual: {bands[currentBandIndex].name}
                </h2>
                <div style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  backgroundColor: bands[currentBandIndex].phase === 'setup' ? '#d69e2e' :
                                  bands[currentBandIndex].phase === 'show' ? '#38a169' : '#dd6b20'
                }}>
                  {getPhaseLabel(bands[currentBandIndex].phase)}
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
                    backgroundColor: bands[currentBandIndex].phase === 'setup' ? '#f6ad55' : '#4a5568'
                  }} />
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    backgroundColor: bands[currentBandIndex].phase === 'show' ? '#68d391' : '#4a5568'
                  }} />
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    backgroundColor: bands[currentBandIndex].phase === 'teardown' ? '#f6ad55' : '#4a5568'
                  }} />
                </div>
              </div>
            </div>
            
            <div style={{ ...styles.flex, gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{
                fontSize: '4rem',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                color: bands[currentBandIndex].timeRemaining <= 300 ? '#f56565' : 
                       bands[currentBandIndex].timeRemaining <= 600 ? '#f6ad55' : '#63b3ed'
              }}>
                {formatTime(bands[currentBandIndex].timeRemaining)}
              </div>
              <div style={{ ...styles.flex, gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={startTimer}
                  disabled={isRunning}
                  style={{
                    ...styles.button,
                    ...styles.buttonSuccess,
                    opacity: isRunning ? 0.5 : 1
                  }}
                >
                  <Play size={20} />
                  Iniciar
                </button>
                <button
                  onClick={pauseTimer}
                  disabled={!isRunning}
                  style={{
                    ...styles.button,
                    ...styles.buttonWarning,
                    opacity: !isRunning ? 0.5 : 1
                  }}
                >
                  <Pause size={20} />
                  Pausar
                </button>
                <button
                  onClick={resetCurrentBand}
                  style={{ ...styles.button, ...styles.buttonDanger }}
                >
                  <RotateCcw size={20} />
                  Reset
                </button>
                <button
                  onClick={nextPhase}
                  disabled={bands[currentBandIndex].status === 'finished'}
                  style={{
                    ...styles.button,
                    backgroundColor: '#805ad5',
                    color: 'white',
                    opacity: bands[currentBandIndex].status === 'finished' ? 0.5 : 1
                  }}
                >
                  {bands[currentBandIndex].phase === 'setup' ? 'Ir a Show' :
                   bands[currentBandIndex].phase === 'show' ? 'Ir a Desmontaje' :
                   'Finalizar'}
                </button>
                <button
                  onClick={nextBand}
                  disabled={currentBandIndex >= bands.length - 1}
                  style={{
                    ...styles.button,
                    backgroundColor: '#667eea',
                    color: 'white',
                    opacity: currentBandIndex >= bands.length - 1 ? 0.5 : 1
                  }}
                >
                  Siguiente Banda
                </button>
              </div>
            </div>

            <div style={{ ...styles.grid, ...styles.gridCols3, fontSize: '14px' }}>
              <div style={{ backgroundColor: 'rgba(214, 158, 46, 0.2)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ color: '#f6ad55', fontWeight: 'bold' }}>Montaje</div>
                <div>{bands[currentBandIndex].setupTime} min</div>
              </div>
              <div style={{ backgroundColor: 'rgba(56, 161, 105, 0.2)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ color: '#68d391', fontWeight: 'bold' }}>Show</div>
                <div>{bands[currentBandIndex].showTime} min</div>
              </div>
              <div style={{ backgroundColor: 'rgba(221, 107, 32, 0.2)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ color: '#f6ad55', fontWeight: 'bold' }}>Desmontaje</div>
                <div>{bands[currentBandIndex].teardownTime} min</div>
              </div>
            </div>

            {/* Warning indicators */}
            {bands[currentBandIndex].timeRemaining <= 300 && bands[currentBandIndex].status === 'active' && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: 'rgba(229, 62, 62, 0.2)',
                border: '1px solid #f56565',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertTriangle size={20} color="#f56565" />
                <span style={{ color: '#fed7d7' }}>
                  {bands[currentBandIndex].timeRemaining <= 30 ? '¡TIEMPO CRÍTICO!' :
                   bands[currentBandIndex].timeRemaining <= 60 ? 'Último minuto' :
                   bands[currentBandIndex].timeRemaining <= 120 ? 'Quedan 2 minutos' :
                   'Quedan 5 minutos o menos'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Add New Band */}
        <div style={styles.card}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
            Agregar Nueva Banda
          </h2>
          <div style={{ ...styles.grid, ...styles.gridCols4, marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Nombre de la banda"
              value={newBandName}
              onChange={(e) => setNewBandName(e.target.value)}
              style={styles.input}
            />
            <input
              type="number"
              placeholder="Montaje (min)"
              value={newBandSetup}
              onChange={(e) => setNewBandSetup(e.target.value)}
              style={styles.input}
              min="1"
              max="120"
            />
            <input
              type="number"
              placeholder="Show (min)"
              value={newBandShow}
              onChange={(e) => setNewBandShow(e.target.value)}
              style={styles.input}
              min="1"
              max="180"
            />
            <input
              type="number"
              placeholder="Desmontaje (min)"
              value={newBandTeardown}
              onChange={(e) => setNewBandTeardown(e.target.value)}
              style={styles.input}
              min="1"
              max="60"
            />
          </div>
          <button
            onClick={addBand}
            style={{ ...styles.button, ...styles.buttonPrimary }}
          >
            <Plus size={20} />
            Agregar Banda
          </button>
        </div>

        {/* Bands List */}
        <div style={styles.card}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
            Lista de Bandas
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bands.map((band, index) => (
              <div
                key={band.id}
                style={{
                  ...styles.bandItem,
                  ...(index === currentBandIndex ? styles.bandItemCurrent :
                      band.status === 'finished' ? styles.bandItemFinished : {})
                }}
                onClick={() => selectBand(index)}
              >
                <div style={styles.flexBetween}>
                  <div style={{ ...styles.flex, gap: '16px', alignItems: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{band.name}</div>
                    <div style={{ fontSize: '14px', color: '#a0aec0' }}>
                      M:{band.setupTime}m | S:{band.showTime}m | D:{band.teardownTime}m
                    </div>
                    <div style={{
                      ...styles.status,
                      backgroundColor: band.status === 'waiting' ? '#d69e2e' :
                                      band.status === 'active' ? '#3182ce' : '#38a169'
                    }}>
                      {band.status === 'waiting' ? 'Esperando' :
                       band.status === 'active' ? 'Activa' : 'Finalizada'}
                    </div>
                    <div style={{
                      ...styles.status,
                      backgroundColor: band.phase === 'setup' ? '#d69e2e' :
                                      band.phase === 'show' ? '#38a169' : '#dd6b20'
                    }}>
                      {getPhaseLabel(band.phase)}
                    </div>
                  </div>
                  <div style={{ ...styles.flex, gap: '8px', alignItems: 'center' }}>
                    <div style={{ fontSize: '24px', fontFamily: 'monospace' }}>
                      {formatTime(band.timeRemaining)}
                    </div>
                    <button
                      onClick={(e) => {e.stopPropagation(); editBand(band);}}
                      style={{ 
                        padding: '8px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: '#f6ad55',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={(e) => {e.stopPropagation(); deleteBand(band.id, band.name);}}
                      style={{ 
                        padding: '8px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: '#f56565',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Modal */}
        {editingBand && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
                Editar Banda
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input
                  type="text"
                  placeholder="Nombre"
                  value={editingBand.newName}
                  onChange={(e) => setEditingBand({...editingBand, newName: e.target.value})}
                  style={{ ...styles.input, width: '100%' }}
                />
                <div style={{ ...styles.grid, ...styles.gridCols3 }}>
                  <input
                    type="number"
                    placeholder="Montaje (min)"
                    value={editingBand.newSetupTime}
                    onChange={(e) => setEditingBand({...editingBand, newSetupTime: e.target.value})}
                    style={styles.input}
                    min="1"
                    max="120"
                  />
                  <input
                    type="number"
                    placeholder="Show (min)"
                    value={editingBand.newShowTime}
                    onChange={(e) => setEditingBand({...editingBand, newShowTime: e.target.value})}
                    style={styles.input}
                    min="1"
                    max="180"
                  />
                  <input
                    type="number"
                    placeholder="Desmontaje (min)"
                    value={editingBand.newTeardownTime}
                    onChange={(e) => setEditingBand({...editingBand, newTeardownTime: e.target.value})}
                    style={styles.input}
                    min="1"
                    max="60"
                  />
                </div>
                <div style={{ ...styles.flex, gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setEditingBand(null)}
                    style={{ ...styles.button, ...styles.buttonSecondary }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveBandEdit}
                    style={{ ...styles.button, ...styles.buttonPrimary }}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <NotificationSystem />
    </div>
  );

  // Enhanced Display View
  const DisplayView = () => {
    const currentBand = bands[currentBandIndex];
    
    return (
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.title}>
            <Clock size={32} color="#68d391" />
            <h1>Stage Timer</h1>
          </div>
          <div style={{ ...styles.flex, gap: '16px', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', color: '#a0aec0' }}>
              {currentBand && `${currentBandIndex + 1}/${bands.length}`}
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={{
                padding: '8px',
                border: 'none',
                backgroundColor: 'transparent',
                color: soundEnabled ? '#68d391' : '#a0aec0',
                cursor: 'pointer'
              }}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <button
              onClick={() => setCurrentView('admin')}
              style={{ ...styles.button, ...styles.buttonPrimary }}
            >
              <Settings size={20} />
              Admin
            </button>
          </div>
        </div>

        {/* Main Timer Display */}
        <div style={styles.displayMain}>
          {currentBand ? (
            <>
              <div style={styles.bandName}>
                {currentBand.name}
              </div>
              
              <div style={{
                ...styles.timer,
                color: currentBand.timeRemaining <= 30 && currentBand.status === 'active' ? '#f56565' :
                       currentBand.timeRemaining <= 300 && currentBand.status === 'active' ? '#f56565' : 
                       currentBand.timeRemaining <= 600 && currentBand.status === 'active' ? '#f6ad55' : 
                       currentBand.phase === 'show' ? '#68d391' :
                       currentBand.phase === 'teardown' ? '#f6ad55' : '#63b3ed',
                animation: currentBand.timeRemaining <= 30 && currentBand.status === 'active' ? 'pulse 1s infinite' : 'none'
              }}>
                {formatTime(currentBand.timeRemaining)}
              </div>

              <div style={{
                ...styles.phase,
                backgroundColor: currentBand.status === 'waiting' ? 
                  (currentBand.phase === 'setup' ? '#d69e2e' :
                   currentBand.phase === 'show' ? '#38a169' :
                   '#dd6b20') :
                currentBand.status === 'active' ? 
                  (currentBand.timeRemaining <= 30 ? '#e53e3e' : '#3182ce') :
                '#4a5568',
                animation: currentBand.timeRemaining <= 30 && currentBand.status === 'active' ? 'pulse 1s infinite' : 'none'
              }}>
                {currentBand.status === 'waiting' ? 
                  `ESPERANDO ${getPhaseLabel(currentBand.phase).toUpperCase()}` :
                 currentBand.status === 'active' ? 
                  (currentBand.timeRemaining <= 30 ? 
                    `¡${getPhaseLabel(currentBand.phase).toUpperCase()}!` :
                    getPhaseLabel(currentBand.phase).toUpperCase()) : 
                  'FINALIZADO'}
              </div>

              {/* Progress Bar */}
              <div style={styles.progressContainer}>
                <div style={styles.progressBar}>
                  <div 
                    style={{
                      ...styles.progressFill,
                      backgroundColor: currentBand.timeRemaining <= 300 && currentBand.status === 'active' ? '#f56565' : 
                                      currentBand.timeRemaining <= 600 && currentBand.status === 'active' ? '#f6ad55' : 
                                      currentBand.phase === 'show' ? '#68d391' :
                                      currentBand.phase === 'teardown' ? '#f6ad55' : '#63b3ed',
                      width: `${Math.max(0, (currentBand.timeRemaining / (
                        currentBand.phase === 'setup' ? currentBand.setupTime * 60 :
                        currentBand.phase === 'show' ? currentBand.showTime * 60 :
                        currentBand.teardownTime * 60
                      )) * 100)}%`
                    }}
                  />
                </div>
                
                {/* Time milestones */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginTop: '8px', 
                  fontSize: '14px', 
                  color: '#a0aec0' 
                }}>
                  <span>0:00</span>
                  <span>
                    {formatTime(
                      currentBand.phase === 'setup' ? currentBand.setupTime * 60 :
                      currentBand.phase === 'show' ? currentBand.showTime * 60 :
                      currentBand.teardownTime * 60
                    )}
                  </span>
                </div>
              </div>

              {/* Warning messages */}
              {currentBand.timeRemaining <= 300 && currentBand.status === 'active' && (
                <div style={{
                  marginTop: '32px',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  color: currentBand.timeRemaining <= 30 ? '#f56565' : '#f6ad55',
                  animation: currentBand.timeRemaining <= 30 ? 'pulse 1s infinite' : 'none'
                }}>
                  {currentBand.timeRemaining <= 10 ? '¡TIEMPO AGOTADO!' :
                   currentBand.timeRemaining <= 30 ? '¡30 SEGUNDOS!' :
                   currentBand.timeRemaining <= 60 ? '¡1 MINUTO RESTANTE!' :
                   currentBand.timeRemaining <= 120 ? '2 MINUTOS RESTANTES' :
                   '5 MINUTOS RESTANTES'}
                </div>
              )}

              {/* Next band preview */}
              {currentBandIndex < bands.length - 1 && (
                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', color: '#a0aec0' }}>Siguiente:</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e2e8f0' }}>
                    {bands[currentBandIndex + 1].name}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', color: '#a0aec0', marginBottom: '16px' }}>
                No hay bandas programadas
              </div>
              <div style={{ fontSize: '20px', color: '#718096' }}>
                Agrega bandas en el panel de administración
              </div>
            </div>
          )}
        </div>

        {/* Bottom Info */}
        <div style={{ backgroundColor: '#2d3748', padding: '16px' }}>
          <div style={styles.flexBetween}>
            <div style={{ fontSize: '18px' }}>
              {currentBand ? (
                <>
                  Banda {currentBandIndex + 1} de {bands.length} - {getPhaseLabel(currentBand.phase)}
                  {currentBand.status === 'active' && (
                    <span style={{ marginLeft: '8px', color: '#63b3ed' }}>● EN VIVO</span>
                  )}
                </>
              ) : (
                'Sin bandas programadas'
              )}
            </div>
            <div style={{ ...styles.flex, gap: '16px', alignItems: 'center', fontSize: '18px' }}>
              {currentBand && (
                <>
                  <span>
                    Tiempo asignado: {
                      currentBand.phase === 'setup' ? currentBand.setupTime :
                      currentBand.phase === 'show' ? currentBand.showTime :
                      currentBand.teardownTime
                    } minutos
                  </span>
                  <div style={{ ...styles.flex, gap: '4px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '4px',
                      backgroundColor: currentBand.phase === 'setup' ? '#f6ad55' : '#4a5568'
                    }} title="Montaje" />
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '4px',
                      backgroundColor: currentBand.phase === 'show' ? '#68d391' : '#4a5568'
                    }} title="Show" />
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '4px',
                      backgroundColor: currentBand.phase === 'teardown' ? '#f6ad55' : '#4a5568'
                    }} title="Desmontaje" />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <NotificationSystem />
      </div>
    );
  };

  return <AdminView />;
};

// Add CSS animations as a style tag
const AnimationStyles = () => {
  useEffect(() => {
    const styles = `
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
      
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);
  
  return null;
};

const App = () => {
  return (
    <>
      <AnimationStyles />
      <StageTimer />
    </>
  );
};

export default App;