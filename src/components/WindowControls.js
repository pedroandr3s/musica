import React from 'react';

const WindowControls = ({
  soundEnabled,
  autoMode,
  setSoundEnabled,
  setAutoMode,
  onOpenDisplayWindow, // Mantener para compatibilidad hacia atrás
  onOpenBandWindow,
  onExportSchedule,
  onImportSchedule,
  onSwitchToBandView,
  onReloadBands,
  hideDisplayButton = false, // Nueva prop para ocultar el botón de display
  disabled = false // Nueva prop para deshabilitar controles
}) => {
return (
    <div style={{
      backgroundColor: '#2d3748',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '20px'
    }}>
      <h3 style={{
        margin: '0 0 15px 0',
        color: '#e2e8f0',
        fontSize: '1.2rem'
      }}>
        Controles de Ventana
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px'
      }}>
        {/* Botón Abrir Display - Solo mostrar si hideDisplayButton es false */}
        {!hideDisplayButton && onOpenDisplayWindow && (
          <button
            onClick={onOpenDisplayWindow}
            style={{
              padding: '12px 20px',
              backgroundColor: '#4299e1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#3182ce';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#4299e1';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <span>📺</span>
            Abrir Display
          </button>
        )}

        <button
          onClick={onOpenBandWindow}
          style={{
            padding: '12px 20px',
            backgroundColor: '#38a169',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#2f855a';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#38a169';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <span>🎸</span>
          Vista Banda
        </button>

        <button
          onClick={onSwitchToBandView}
          style={{
            padding: '12px 20px',
            backgroundColor: '#9f7aea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#805ad5';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#9f7aea';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <span>📱</span>
          Modo Banda
        </button>
      </div>

      {/* Configuración */}
      <div style={{
        marginTop: '20px',
        paddingTop: '20px',
        borderTop: '1px solid #4a5568'
      }}>
        <h4 style={{
          margin: '0 0 12px 0',
          color: '#e2e8f0',
          fontSize: '1rem'
        }}>
          Configuración
        </h4>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '15px',
          alignItems: 'center'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            color: '#e2e8f0'
          }}>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                cursor: 'pointer'
              }}
            />
            🔊 Sonido
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            color: '#e2e8f0'
          }}>
            <input
              type="checkbox"
              checked={autoMode}
              onChange={(e) => setAutoMode(e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                cursor: 'pointer'
              }}
            />
            ⚡ Modo Automático
          </label>
        </div>
      </div>

      {/* Controles de Archivo */}
      <div style={{
        marginTop: '20px',
        paddingTop: '20px',
        borderTop: '1px solid #4a5568'
      }}>
        <h4 style={{
          margin: '0 0 12px 0',
          color: '#e2e8f0',
          fontSize: '1rem'
        }}>
          Datos
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '10px'
        }}>
          <button
            onClick={onExportSchedule}
            style={{
              padding: '10px 16px',
              backgroundColor: '#d69e2e',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#b7791f';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#d69e2e';
            }}
          >
            📤 Exportar
          </button>

          <label style={{
            padding: '10px 16px',
            backgroundColor: '#805ad5',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textAlign: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#6b46c1';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#805ad5';
          }}>
            📥 Importar
            <input
              type="file"
              accept=".json"
              onChange={onImportSchedule}
              style={{ display: 'none' }}
            />
          </label>

          <button
            onClick={onReloadBands}
            style={{
              padding: '10px 16px',
              backgroundColor: '#319795',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#2c7a7b';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#319795';
            }}
          >
            🔄 Recargar
          </button>
        </div>
      </div>
    </div>
  );
};
export default WindowControls;