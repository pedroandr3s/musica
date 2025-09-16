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
  onNextBand
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
      marginBottom: '20px'
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
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: isRunning ? '#f56565' : '#48bb78',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
          }}
        >
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
          {isRunning ? 'Pausar' : 'Iniciar'}
        </button>

        {/* Reset Button */}
        <button
          onClick={onResetCurrentBand}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: '#ed8936',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <RotateCcw size={16} />
          Reiniciar
        </button>

        {/* Next Phase Button */}
        <button
          onClick={onNextPhase}
          disabled={currentBand.status === 'finished'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: currentBand.status === 'finished' ? '#4a5568' : '#4299e1',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: currentBand.status === 'finished' ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            opacity: currentBand.status === 'finished' ? 0.6 : 1,
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            if (currentBand.status !== 'finished') {
              e.target.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <SkipForward size={16} />
          Siguiente Fase
        </button>

        {/* Next Band Button */}
        <button
          onClick={onNextBand}
          disabled={!hasNextBand}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: hasNextBand ? '#9f7aea' : '#4a5568',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: hasNextBand ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: 'bold',
            opacity: hasNextBand ? 1 : 0.6,
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            if (hasNextBand) {
              e.target.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <ChevronRight size={16} />
          Siguiente Banda
        </button>
      </div>
    </div>
  );
};

export default TimerControls;