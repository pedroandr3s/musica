import React from 'react';
import { formatTime, getPhaseLabel } from '../utils/helpers';

const TimerDisplay = ({ bands, currentBandIndex, isMobile }) => {
  const currentBand = bands[currentBandIndex];

  if (!currentBand) {
    return (
      <div style={{
        backgroundColor: '#1a1a1a',
        color: 'white',
        padding: isMobile ? '20px' : '40px',
        borderRadius: '12px',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ fontSize: isMobile ? '32px' : '48px', marginBottom: '20px' }}>🎵</div>
        <h2 style={{ 
          fontSize: isMobile ? '18px' : '24px', 
          color: '#a0aec0', 
          margin: 0 
        }}>
          No hay bandas programadas
        </h2>
        <p style={{ 
          color: '#718096', 
          marginTop: '8px',
          fontSize: isMobile ? '14px' : '16px'
        }}>
          Agrega bandas para comenzar
        </p>
      </div>
    );
  }

  const totalPhaseTime = currentBand.phase === 'setup' ? currentBand.setupTime * 60 :
                        currentBand.phase === 'show' ? currentBand.showTime * 60 :
                        currentBand.teardownTime * 60;

  const progressPercentage = Math.max(0, ((totalPhaseTime - currentBand.timeRemaining) / totalPhaseTime) * 100);

  const getPhaseColor = () => {
    if (currentBand.timeRemaining <= 30 && currentBand.status === 'active') return '#f56565';
    if (currentBand.timeRemaining <= 300 && currentBand.status === 'active') return '#f56565';
    if (currentBand.timeRemaining <= 600 && currentBand.status === 'active') return '#f6ad55';
    if (currentBand.phase === 'show') return '#68d391';
    if (currentBand.phase === 'teardown') return '#f6ad55';
    return '#63b3ed';
  };

  const getStatusBackgroundColor = () => {
    if (currentBand.status === 'waiting') {
      return currentBand.phase === 'setup' ? '#d69e2e' :
             currentBand.phase === 'show' ? '#38a169' : '#dd6b20';
    }
    if (currentBand.status === 'active') {
      return currentBand.timeRemaining <= 30 ? '#e53e3e' : '#3182ce';
    }
    return '#4a5568';
  };

  const getStatusText = () => {
    if (currentBand.status === 'waiting') {
      return `ESPERANDO ${getPhaseLabel(currentBand.phase).toUpperCase()}`;
    }
    if (currentBand.status === 'active') {
      if (currentBand.timeRemaining <= 30) {
        return `¡${getPhaseLabel(currentBand.phase).toUpperCase()}!`;
      }
      return getPhaseLabel(currentBand.phase).toUpperCase();
    }
    return 'FINALIZADO';
  };

  const shouldPulse = currentBand.timeRemaining <= 30 && currentBand.status === 'active';

  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      color: 'white',
      padding: isMobile ? '20px' : '40px',
      borderRadius: '12px',
      textAlign: 'center',
      marginBottom: '20px'
    }}>
      {/* Band Name */}
      <div style={{
        fontSize: isMobile ? 'clamp(1.2rem, 8vw, 2rem)' : 'clamp(1.5rem, 4vw, 3rem)',
        fontWeight: 'bold',
        marginBottom: isMobile ? '15px' : '20px',
        lineHeight: 1.2,
        wordBreak: 'break-word'
      }}>
        {currentBand.name}
      </div>

      {/* Timer */}
      <div style={{
        fontSize: isMobile ? 'clamp(2.5rem, 15vw, 4rem)' : 'clamp(3rem, 8vw, 6rem)',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        marginBottom: isMobile ? '15px' : '20px',
        color: getPhaseColor(),
        animation: shouldPulse ? 'pulse 1s infinite' : 'none'
      }}>
        {formatTime(currentBand.timeRemaining)}
      </div>

      {/* Status Badge */}
      <div style={{
        fontSize: isMobile ? 'clamp(0.8rem, 4vw, 1.2rem)' : 'clamp(1rem, 3vw, 1.5rem)',
        fontWeight: 'bold',
        padding: isMobile ? '8px 16px' : '12px 24px',
        borderRadius: '25px',
        marginBottom: isMobile ? '20px' : '30px',
        backgroundColor: getStatusBackgroundColor(),
        display: 'inline-block',
        animation: shouldPulse ? 'pulse 1s infinite' : 'none'
      }}>
        {getStatusText()}
      </div>

      {/* Progress Bar */}
      <div style={{ 
        maxWidth: isMobile ? '100%' : '600px', 
        margin: `0 auto ${isMobile ? '20px' : '30px'}` 
      }}>
        <div style={{
          width: '100%',
          height: isMobile ? '12px' : '20px',
          backgroundColor: '#4a5568',
          borderRadius: isMobile ? '6px' : '10px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            height: '100%',
            borderRadius: isMobile ? '6px' : '10px',
            transition: 'width 1s ease',
            backgroundColor: getPhaseColor(),
            width: `${progressPercentage}%`
          }}></div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '8px',
          fontSize: isMobile ? '12px' : '14px',
          color: '#a0aec0'
        }}>
          <span>0:00</span>
          <span>{formatTime(totalPhaseTime)}</span>
        </div>
      </div>

      {/* Warning Messages */}
      {currentBand.timeRemaining <= 300 && currentBand.status === 'active' && (
        <div style={{
          fontSize: isMobile ? 'clamp(0.9rem, 4vw, 1.2rem)' : 'clamp(1rem, 3vw, 1.5rem)',
          fontWeight: 'bold',
          textAlign: 'center',
          color: currentBand.timeRemaining <= 30 ? '#f56565' : '#f6ad55',
          animation: currentBand.timeRemaining <= 30 ? 'pulse 1s infinite' : 'none',
          marginBottom: isMobile ? '15px' : '20px'
        }}>
          {currentBand.timeRemaining <= 10 ? '¡TIEMPO AGOTADO!' :
           currentBand.timeRemaining <= 30 ? '¡30 SEGUNDOS!' :
           currentBand.timeRemaining <= 60 ? '¡1 MINUTO RESTANTE!' :
           currentBand.timeRemaining <= 120 ? '2 MINUTOS RESTANTES' :
           '5 MINUTOS RESTANTES'}
        </div>
      )}

      {/* Phase Indicators */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: isMobile ? '6px' : '8px',
        marginBottom: isMobile ? '15px' : '20px'
      }}>
        <div style={{
          width: isMobile ? '8px' : '12px',
          height: isMobile ? '8px' : '12px',
          borderRadius: isMobile ? '4px' : '6px',
          backgroundColor: currentBand.phase === 'setup' ? '#f6ad55' : '#4a5568',
          transition: 'all 0.3s'
        }} title="Montaje"></div>
        <div style={{
          width: isMobile ? '8px' : '12px',
          height: isMobile ? '8px' : '12px',
          borderRadius: isMobile ? '4px' : '6px',
          backgroundColor: currentBand.phase === 'show' ? '#68d391' : '#4a5568',
          transition: 'all 0.3s'
        }} title="Show"></div>
        <div style={{
          width: isMobile ? '8px' : '12px',
          height: isMobile ? '8px' : '12px',
          borderRadius: isMobile ? '4px' : '6px',
          backgroundColor: currentBand.phase === 'teardown' ? '#f6ad55' : '#4a5568',
          transition: 'all 0.3s'
        }} title="Desmontaje"></div>
      </div>

      {/* Band Info */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: isMobile ? '8px' : '12px',
        fontSize: isMobile ? '12px' : '14px',
        color: '#a0aec0'
      }}>
        <div>
          <strong>Tiempo asignado:</strong><br />
          {currentBand.phase === 'setup' ? currentBand.setupTime :
           currentBand.phase === 'show' ? currentBand.showTime :
           currentBand.teardownTime} minutos
        </div>
        <div>
          <strong>Estado:</strong><br />
          {currentBand.status === 'waiting' ? 'Esperando' :
           currentBand.status === 'active' ? 'EN VIVO' : 'Finalizada'}
        </div>
        <div>
          <strong>Banda:</strong><br />
          {currentBandIndex + 1} de {bands.length}
        </div>
      </div>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
};

export default TimerDisplay;