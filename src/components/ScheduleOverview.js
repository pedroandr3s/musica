import React from 'react';
import { getPhaseLabel } from '../utils/helpers';
import styles from '../styles/styles';

const ScheduleOverview = ({ bands, currentBandIndex, onSelectBand, onReorderBands, getTotalTime }) => {
  return (
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
            onClick={() => onSelectBand(index)}
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
};

export default ScheduleOverview;