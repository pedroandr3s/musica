import React from 'react';
import { Play, Pause, RotateCcw, AlertTriangle } from 'lucide-react';
import { formatTime, getPhaseLabel } from '../utils/helpers';
import styles from '../styles/styles';

const CurrentBandControl = ({ 
  band, 
  isRunning, 
  onStartTimer, 
  onPauseTimer, 
  onResetCurrentBand, 
  onNextPhase, 
  onNextBand,
  canNextBand 
}) => {
  return (
    <div style={styles.cardBordered}>
      <div style={{ ...styles.flexBetween, marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
            Banda Actual: {band.name}
          </h2>
          <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            backgroundColor: band.phase === 'setup' ? '#d69e2e' :
                            band.phase === 'show' ? '#38a169' : '#dd6b20'
          }}>
            {getPhaseLabel(band.phase)}
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
              backgroundColor: band.phase === 'setup' ? '#f6ad55' : '#4a5568'
            }} />
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '4px',
              backgroundColor: band.phase === 'show' ? '#68d391' : '#4a5568'
            }} />
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '4px',
              backgroundColor: band.phase === 'teardown' ? '#f6ad55' : '#4a5568'
            }} />
          </div>
        </div>
      </div>
      
      <div style={{ ...styles.flex, gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{
          fontSize: '4rem',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          color: band.timeRemaining <= 300 ? '#f56565' : 
                 band.timeRemaining <= 600 ? '#f6ad55' : '#63b3ed'
        }}>
          {formatTime(band.timeRemaining)}
        </div>
        <div style={{ ...styles.flex, gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={onStartTimer}
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
            onClick={onPauseTimer}
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
            onClick={onResetCurrentBand}
            style={{ ...styles.button, ...styles.buttonDanger }}
          >
            <RotateCcw size={20} />
            Reset
          </button>
          <button
            onClick={onNextPhase}
            disabled={band.status === 'finished'}
            style={{
              ...styles.button,
              backgroundColor: '#805ad5',
              color: 'white',
              opacity: band.status === 'finished' ? 0.5 : 1
            }}
          >
            {band.phase === 'setup' ? 'Ir a Show' :
             band.phase === 'show' ? 'Ir a Desmontaje' :
             'Finalizar'}
          </button>
          <button
            onClick={onNextBand}
            disabled={!canNextBand}
            style={{
              ...styles.button,
              backgroundColor: '#667eea',
              color: 'white',
              opacity: !canNextBand ? 0.5 : 1
            }}
          >
            Siguiente Banda
          </button>
        </div>
      </div>

      <div style={{ ...styles.grid, ...styles.gridCols3, fontSize: '14px' }}>
        <div style={{ backgroundColor: 'rgba(214, 158, 46, 0.2)', padding: '12px', borderRadius: '8px' }}>
          <div style={{ color: '#f6ad55', fontWeight: 'bold' }}>Montaje</div>
          <div>{band.setupTime} min</div>
        </div>
        <div style={{ backgroundColor: 'rgba(56, 161, 105, 0.2)', padding: '12px', borderRadius: '8px' }}>
          <div style={{ color: '#68d391', fontWeight: 'bold' }}>Show</div>
          <div>{band.showTime} min</div>
        </div>
        <div style={{ backgroundColor: 'rgba(221, 107, 32, 0.2)', padding: '12px', borderRadius: '8px' }}>
          <div style={{ color: '#f6ad55', fontWeight: 'bold' }}>Desmontaje</div>
          <div>{band.teardownTime} min</div>
        </div>
      </div>

      {/* Warning indicators */}
      {band.timeRemaining <= 300 && band.status === 'active' && (
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
            {band.timeRemaining <= 30 ? 'TIEMPO CRITICO!' :
             band.timeRemaining <= 60 ? 'Ultimo minuto' :
             band.timeRemaining <= 120 ? 'Quedan 2 minutos' :
             'Quedan 5 minutos o menos'}
          </span>
        </div>
      )}
    </div>
  );
};

export default CurrentBandControl;