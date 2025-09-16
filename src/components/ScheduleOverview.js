import React, { useState, useEffect } from 'react';
import { RefreshCw, Database } from 'lucide-react';
import { getPhaseLabel } from '../utils/helpers';
import { useFirebase } from '../hooks/useFirebase';
import styles from '../styles/styles';

const ScheduleOverview = ({ 
  bands, 
  currentBandIndex, 
  onSelectBand, 
  onReorderBands, 
  getTotalTime,
  onBandsLoaded // Nueva prop para notificar cuando se cargan las bandas
}) => {
  const { loadFromFirebase, loading, error } = useFirebase();
  const [localBands, setLocalBands] = useState(bands || []);
  const [localCurrentBandIndex, setLocalCurrentBandIndex] = useState(currentBandIndex || 0);

  // Cargar datos desde Firebase
  const handleLoadFromFirebase = async () => {
    const result = await loadFromFirebase();
    if (result.success && result.data) {
      if (result.data.bands) {
        setLocalBands(result.data.bands);
        // Notificar al componente padre sobre las nuevas bandas
        if (onBandsLoaded) {
          onBandsLoaded(result.data.bands);
        }
      }
      if (result.data.currentBandIndex !== undefined) {
        setLocalCurrentBandIndex(result.data.currentBandIndex);
      }
    }
  };

  // Cargar automáticamente al montar el componente
  useEffect(() => {
    handleLoadFromFirebase();
  }, []);

  // Sincronizar con las props cuando cambien
  useEffect(() => {
    if (bands) {
      setLocalBands(bands);
    }
  }, [bands]);

  useEffect(() => {
    if (currentBandIndex !== undefined) {
      setLocalCurrentBandIndex(currentBandIndex);
    }
  }, [currentBandIndex]);

  // Calcular tiempo total local
  const calculateTotalTime = () => {
    if (getTotalTime) {
      return getTotalTime();
    }
    return localBands.reduce((total, band) => {
      return total + band.setupTime + band.showTime + band.teardownTime;
    }, 0);
  };

  const totalTime = calculateTotalTime();

  return (
    <div style={styles.card}>
      <div style={styles.flexBetween}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 16px 0' }}>
          Resumen del Cronograma ({localBands.length} bandas)
        </h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ fontSize: '14px', color: '#a0aec0' }}>
            Tiempo total: {Math.floor(totalTime / 60)}h {totalTime % 60}m
          </div>
          {error && (
            <span style={{ color: '#f56565', fontSize: '12px' }}>
              Error: {error}
            </span>
          )}
          <button
            onClick={handleLoadFromFirebase}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              backgroundColor: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '11px',
              opacity: loading ? 0.6 : 1
            }}
            title="Cargar desde base de datos"
          >
            {loading ? (
              <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Database size={12} />
            )}
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {localBands.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#a0aec0',
          fontSize: '16px'
        }}>
          {loading ? 'Cargando cronograma...' : 'No hay bandas en el cronograma'}
          <br />
          <span style={{ fontSize: '14px' }}>
            {loading ? '' : 'Agrega bandas o carga desde la base de datos'}
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {localBands.map((band, index) => (
            <div
              key={band.id}
              style={{
                ...styles.bandItem,
                ...(index === localCurrentBandIndex ? styles.bandItemCurrent :
                    band.status === 'finished' ? styles.bandItemFinished : {}),
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => onSelectBand && onSelectBand(index)}
            >
              <div style={styles.flexBetween}>
                <div style={{ ...styles.flex, ...styles.gap, alignItems: 'center' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: band.status === 'finished' ? '#38a169' :
                                   band.status === 'active' ? '#3182ce' : '#718096',
                    transition: 'all 0.2s ease'
                  }} />
                  <span style={{ 
                    fontWeight: '500',
                    color: band.status === 'finished' ? '#38a169' : 
                           index === localCurrentBandIndex ? '#3182ce' : '#2d3748'
                  }}>
                    {band.name}
                  </span>
                  <div style={{
                    ...styles.status,
                    backgroundColor: band.phase === 'setup' ? '#d69e2e' :
                                   band.phase === 'show' ? '#38a169' : '#dd6b20'
                  }}>
                    {getPhaseLabel(band.phase)}
                  </div>
                  {band.status === 'active' && (
                    <div style={{
                      fontSize: '11px',
                      color: '#3182ce',
                      fontWeight: 'bold',
                      backgroundColor: '#ebf8ff',
                      padding: '2px 6px',
                      borderRadius: '12px'
                    }}>
                      EN VIVO
                    </div>
                  )}
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px' 
                }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#a0aec0',
                    display: 'flex',
                    gap: '4px'
                  }}>
                    <span>M:{band.setupTime}m</span>
                    <span>S:{band.showTime}m</span>
                    <span>D:{band.teardownTime}m</span>
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#4a5568',
                    fontWeight: 'bold',
                    minWidth: '40px',
                    textAlign: 'right'
                  }}>
                    {band.setupTime + band.showTime + band.teardownTime}min
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer con estadísticas */}
      {localBands.length > 0 && (
        <div style={{
          marginTop: '16px',
          fontSize: '12px',
          color: '#a0aec0',
          textAlign: 'center',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '12px'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr 1fr', 
            gap: '16px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 'bold', color: '#4a5568' }}>
                {localBands.filter(b => b.status === 'waiting').length}
              </div>
              <div>Esperando</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', color: '#3182ce' }}>
                {localBands.filter(b => b.status === 'active').length}
              </div>
              <div>Activa</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', color: '#38a169' }}>
                {localBands.filter(b => b.status === 'finished').length}
              </div>
              <div>Terminadas</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleOverview;