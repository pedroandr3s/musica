import React from 'react';
import { Play, Pause, RotateCcw, SkipForward, ChevronRight } from 'lucide-react';
import { getPhaseLabel } from '../utils/helpers';

const TimerControls = ({
  bands,
  currentBandIndex,
  isRunning,
  onStartTimer,
  onPauseTimer,
  onResetCurrentBand,
  onNextPhase,
  onNextBand,
  disabled = false
}) => {
  const currentBand = bands[currentBandIndex];
  const hasNextBand = currentBandIndex < bands.length - 1;

  if (!currentBand) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#a0aec0',
        backgroundColor: '#2d3748',
        borderRadius: '8px'
      }}>
        No hay bandas disponibles
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#2d3748',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px',
      opacity: disabled ? 0.6 : 1
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <div>
          <h3 style={{
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
            margin: 0
          }}>
            {currentBand.name}
            {disabled && (
              <span style={{
                fontSize: '12px',
                color: '#f6ad55',
                marginLeft: '8px'
              }}>
                (Solo dispositivo principal)
              </span>
            )}
          </h3>
          <p style={{
            color: '#a0aec0',
            fontSize: '14px',
            margin: '4px 0 0 0'
          }}>
            {getPhaseLabel(currentBand.phase)} - {currentBand.status === 'active' ? 'En vivo' : 'Esperando'}
          </p>
        </div>
        <div style={{
          color: '#a0aec0',
          fontSize: '14px'
        }}>
          Banda {currentBandIndex + 1} de {bands.length}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '12px'
      }}>
        {/* Play/Pause Button */}
        <button
          onClick={isRunning ? onPauseTimer : onStartTimer}
          disabled={disabled}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: disabled ? '#4a5568' : 
                           isRunning ? '#f56565' : '#48bb78',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            if (!disabled) {
              e.target.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseOut={(e) => {
            if (!disabled) {
              e.target.style.transform = 'translateY(0)';
            }
          }}
        >
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
          {isRunning ? 'Pausar' : 'Iniciar'}
        </button>

        {/* Reset Button */}
        <button
          onClick={onResetCurrentBand}
          disabled={disabled}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: disabled ? '#4a5568' : '#ed8936',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            if (!disabled) {
              e.target.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseOut={(e) => {
            if (!disabled) {
              e.target.style.transform = 'translateY(0)';
            }
          }}
        >
          <RotateCcw size={16} />
          Reiniciar
        </button>

        {/* Next Phase Button */}
        <button
          onClick={onNextPhase}
          disabled={disabled || currentBand.status === 'finished'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: (disabled || currentBand.status === 'finished') ? '#4a5568' : '#4299e1',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: (disabled || currentBand.status === 'finished') ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            opacity: (disabled || currentBand.status === 'finished') ? 0.6 : 1,
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            if (!disabled && currentBand.status !== 'finished') {
              e.target.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseOut={(e) => {
            if (!disabled) {
              e.target.style.transform = 'translateY(0)';
            }
          }}
        >
          <SkipForward size={16} />
          Siguiente Fase
        </button>

        {/* Next Band Button */}
        <button
          onClick={onNextBand}
          disabled={disabled || !hasNextBand}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: (disabled || !hasNextBand) ? '#4a5568' : '#9f7aea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: (disabled || !hasNextBand) ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            opacity: (disabled || !hasNextBand) ? 0.6 : 1,
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            if (!disabled && hasNextBand) {
              e.target.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseOut={(e) => {
            if (!disabled) {
              e.target.style.transform = 'translateY(0)';
            }
          }}
        >
          <ChevronRight size={16} />
          Siguiente Banda
        </button>
      </div>

      {disabled && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          backgroundColor: '#f6ad55',
          color: '#1a1a1a',
          borderRadius: '6px',
          fontSize: '12px',
          textAlign: 'center',
          fontWeight: '600'
        }}>
          Los controles están deshabilitados. Solo el dispositivo principal puede controlar el timer.
        </div>
      )}
    </div>
  );
};

export default TimerControls;