import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { formatTime, getPhaseLabel } from '../utils/helpers';
import styles from '../styles/styles';

const BandsList = ({ bands, currentBandIndex, onSelectBand, onEditBand, onDeleteBand, onReorderBands }) => {
  return (
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
            onClick={() => onSelectBand(index)}
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
                  onClick={(e) => {e.stopPropagation(); onEditBand(band);}}
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
                  onClick={(e) => {e.stopPropagation(); onDeleteBand(band.id, band.name);}}
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
  );
};

export default BandsList;