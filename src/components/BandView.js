import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { formatTime, getPhaseLabel } from '../utils/helpers';
import styles from '../styles/styles';

const BandView = ({ band, currentBandIndex, totalBands, onBackToAdmin }) => {
  if (!band) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button
            onClick={onBackToAdmin}
            style={{ ...styles.button, ...styles.buttonSecondary }}
          >
            <ArrowLeft size={20} />
            Volver al Admin
          </button>
        </div>
        <div style={styles.displayMain}>
          <div style={{ fontSize: '2rem', color: '#a0aec0' }}>
            No hay banda seleccionada
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>
          <span>🎸 Vista de Banda</span>
        </div>
        <div style={{ ...styles.flex, gap: '16px', alignItems: 'center' }}>
          <div style={{ fontSize: '14px', color: '#a0aec0' }}>
            Banda {currentBandIndex + 1} de {totalBands}
          </div>
          <button
            onClick={onBackToAdmin}
            style={{ ...styles.button, ...styles.buttonSecondary }}
          >
            <ArrowLeft size={20} />
            Admin
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.displayMain}>
        <div style={styles.bandName}>
          {band.name}
        </div>
        
        <div style={{
          ...styles.timer,
          color: band.timeRemaining <= 300 ? '#f56565' : 
                 band.timeRemaining <= 600 ? '#f6ad55' : '#63b3ed'
        }}>
          {formatTime(band.timeRemaining)}
        </div>

        <div style={{
          ...styles.phase,
          backgroundColor: band.status === 'waiting' ? 
            (band.phase === 'setup' ? '#d69e2e' :
             band.phase === 'show' ? '#38a169' :
             '#dd6b20') :
          band.status === 'active' ? '#3182ce' : '#4a5568'
        }}>
          {band.status === 'waiting' ? 
            `ESPERANDO ${getPhaseLabel(band.phase).toUpperCase()}` :
           band.status === 'active' ? 
            getPhaseLabel(band.phase).toUpperCase() : 
            'FINALIZADO'}
        </div>

        {/* Status Info */}
        <div style={{
          marginTop: '32px',
          padding: '24px',
          backgroundColor: '#2d3748',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
            Estado Actual
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: band.status === 'active' ? '#63b3ed' : 
                   band.status === 'finished' ? '#68d391' : '#f6ad55'
          }}>
            {band.status === 'waiting' ? 'ESPERANDO' :
             band.status === 'active' ? 'EN VIVO' : 'FINALIZADA'}
          </div>
        </div>

        {/* Phase Times */}
        <div style={{ 
          marginTop: '32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          width: '100%',
          maxWidth: '600px'
        }}>
          <div style={{
            padding: '16px',
            backgroundColor: band.phase === 'setup' ? 'rgba(214, 158, 46, 0.3)' : 'rgba(214, 158, 46, 0.1)',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#f6ad55', fontWeight: 'bold', fontSize: '18px' }}>
              Montaje
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {band.setupTime} min
            </div>
          </div>
          <div style={{
            padding: '16px',
            backgroundColor: band.phase === 'show' ? 'rgba(56, 161, 105, 0.3)' : 'rgba(56, 161, 105, 0.1)',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#68d391', fontWeight: 'bold', fontSize: '18px' }}>
              Show
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {band.showTime} min
            </div>
          </div>
          <div style={{
            padding: '16px',
            backgroundColor: band.phase === 'teardown' ? 'rgba(221, 107, 32, 0.3)' : 'rgba(221, 107, 32, 0.1)',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#f6ad55', fontWeight: 'bold', fontSize: '18px' }}>
              Desmontaje
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {band.teardownTime} min
            </div>
          </div>
        </div>

        {/* Warning message for low time */}
        {band.timeRemaining <= 300 && band.status === 'active' && (
          <div style={{
            marginTop: '32px',
            padding: '16px',
            backgroundColor: 'rgba(229, 62, 62, 0.2)',
            border: '2px solid #f56565',
            borderRadius: '12px',
            textAlign: 'center',
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#fed7d7'
          }}>
            {band.timeRemaining <= 30 ? '¡TIEMPO CRÍTICO!' :
             band.timeRemaining <= 60 ? '¡ÚLTIMO MINUTO!' :
             band.timeRemaining <= 120 ? '¡2 MINUTOS RESTANTES!' :
             '¡5 MINUTOS RESTANTES!'}
          </div>
        )}
      </div>
    </div>
  );
};

export default BandView;