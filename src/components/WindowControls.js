import React from 'react';
import { Monitor, Users, Download, Upload, Volume2, VolumeX, Settings } from 'lucide-react';

const WindowControls = ({
  soundEnabled,
  autoMode,
  setSoundEnabled,
  setAutoMode,
  onOpenDisplayWindow,
  onOpenBandWindow,
  onExportSchedule,
  onImportSchedule,
  onSwitchToBandView,
  onReloadBands
}) => {
  return (
    <div style={{
      backgroundColor: '#2d3748',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <h3 style={{
        color: 'white',
        fontSize: '18px',
        fontWeight: 'bold',
        marginBottom: '16px',
        margin: '0 0 16px 0'
      }}>
        Controles y Configuración
      </h3>

      {/* Settings Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        {/* Sound Toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px',
          backgroundColor: '#4a5568',
          borderRadius: '6px'
        }}>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              backgroundColor: soundEnabled ? '#48bb78' : '#f56565',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
          <span style={{ color: 'white', fontSize: '14px' }}>
            Sonido {soundEnabled ? 'activado' : 'desactivado'}
          </span>
        </div>

        {/* Auto Mode Toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px',
          backgroundColor: '#4a5568',
          borderRadius: '6px'
        }}>
          <button
            onClick={() => setAutoMode(!autoMode)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              backgroundColor: autoMode ? '#48bb78' : '#f56565',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            <Settings size={14} />
          </button>
          <span style={{ color: 'white', fontSize: '14px' }}>
            Modo {autoMode ? 'automático' : 'manual'}
          </span>
        </div>
      </div>

      {/* Window Controls */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <button
          onClick={onOpenDisplayWindow}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: '#4299e1',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#3182ce';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#4299e1';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <Monitor size={16} />
          Abrir Display
        </button>

        <button
          onClick={onOpenBandWindow}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: '#9f7aea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#805ad5';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#9f7aea';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <Users size={16} />
          Vista Banda
        </button>

        <button
          onClick={onSwitchToBandView}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: '#38a169',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#2f855a';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#38a169';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <Users size={16} />
          Panel Banda
        </button>

        <button
          onClick={onReloadBands}
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
            e.target.style.backgroundColor = '#dd6b20';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#ed8936';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <Settings size={16} />
          Recargar Firebase
        </button>
      </div>

      {/* Import/Export */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px'
      }}>
        <button
          onClick={onExportSchedule}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: '#48bb78',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#38a169';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#48bb78';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <Download size={16} />
          Exportar
        </button>

        <label style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px',
          backgroundColor: '#4299e1',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = '#3182ce';
          e.target.style.transform = 'translateY(-1px)';
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = '#4299e1';
          e.target.style.transform = 'translateY(0)';
        }}
        >
          <Upload size={16} />
          Importar
          <input
            type="file"
            accept=".json"
            onChange={onImportSchedule}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {/* Info Text */}
      <div style={{
        marginTop: '16px',
        fontSize: '12px',
        color: '#a0aec0',
        lineHeight: 1.4
      }}>
        <p style={{ margin: '0 0 4px 0' }}>
          • <strong>Display:</strong> Ventana de proyección para el público
        </p>
        <p style={{ margin: '0 0 4px 0' }}>
          • <strong>Vista Banda:</strong> Panel simplificado para las bandas
        </p>
        <p style={{ margin: '0' }}>
          • <strong>Modo Auto:</strong> Avanza automáticamente entre fases
        </p>
      </div>
    </div>
  );
};

export default WindowControls;