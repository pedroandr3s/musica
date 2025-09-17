import React, { useState } from 'react';
import { Plus, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useFirebase } from '../hooks/useFirebase';

const AddBandForm = ({ onBandAdded, disabled = false }) => {
  const [newBandName, setNewBandName] = useState('');
  const [newBandSetup, setNewBandSetup] = useState('');
  const [newBandShow, setNewBandShow] = useState('');
  const [newBandTeardown, setNewBandTeardown] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const { saveToFirebase, loadFromFirebase } = useFirebase();

  // Validar formulario
  const validateForm = async () => {
    const errors = [];

    if (!newBandName.trim()) {
      errors.push('El nombre de la banda es requerido');
    } else if (newBandName.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    } else {
      // Verificar nombres duplicados en Firebase
      const currentData = await loadFromFirebase();
      if (currentData.success && currentData.data?.bands) {
        const nameExists = currentData.data.bands.some(band => 
          band.name.toLowerCase() === newBandName.trim().toLowerCase()
        );
        if (nameExists) {
          errors.push('Ya existe una banda con ese nombre');
        }
      }
    }

    if (!newBandSetup || isNaN(newBandSetup) || parseInt(newBandSetup) < 1) {
      errors.push('El tiempo de montaje debe ser un número mayor a 0');
    } else if (parseInt(newBandSetup) > 120) {
      errors.push('El tiempo de montaje no puede ser mayor a 120 minutos');
    }

    if (!newBandShow || isNaN(newBandShow) || parseInt(newBandShow) < 1) {
      errors.push('El tiempo de show debe ser un número mayor a 0');
    } else if (parseInt(newBandShow) > 180) {
      errors.push('El tiempo de show no puede ser mayor a 180 minutos');
    }

    if (!newBandTeardown || isNaN(newBandTeardown) || parseInt(newBandTeardown) < 1) {
      errors.push('El tiempo de desmontaje debe ser un número mayor a 0');
    } else if (parseInt(newBandTeardown) > 60) {
      errors.push('El tiempo de desmontaje no puede ser mayor a 60 minutos');
    }

    return errors;
  };

  // Generar ID único para la banda
  const generateBandId = () => {
    return `band_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Manejar envío del formulario - GUARDA EN FIREBASE Y NOTIFICA AL PADRE
  const handleAddBand = async () => {
    if (disabled) return;
    
    setMessage({ type: '', text: '' });
    setIsSubmitting(true);

    try {
      const validationErrors = await validateForm();
      if (validationErrors.length > 0) {
        setMessage({ 
          type: 'error', 
          text: validationErrors.join('. ') 
        });
        setIsSubmitting(false);
        return;
      }

      // Crear nueva banda
      const newBand = {
        id: generateBandId(),
        name: newBandName.trim(),
        setupTime: parseInt(newBandSetup),
        showTime: parseInt(newBandShow),
        teardownTime: parseInt(newBandTeardown),
        status: 'waiting',
        phase: 'setup',
        timeRemaining: parseInt(newBandSetup) * 60, // Convertir a segundos
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Cargar datos actuales de Firebase
      const currentData = await loadFromFirebase();
      const currentBands = currentData.success && currentData.data?.bands ? 
        currentData.data.bands : [];

      // Agregar nueva banda
      const updatedBands = [...currentBands, newBand];

      // Preparar datos para guardar - preservar datos existentes
      const dataToSave = {
        bands: updatedBands,
        lastUpdated: new Date().toISOString(),
        totalBands: updatedBands.length,
        // Mantener TODOS los datos existentes
        currentBandIndex: currentData.success && currentData.data?.currentBandIndex !== undefined ? 
          currentData.data.currentBandIndex : 0,
        autoMode: currentData.success && currentData.data?.autoMode !== undefined ? 
          currentData.data.autoMode : true,
        // Preservar cualquier otro campo que pueda existir
        ...currentData.data
      };

      // Actualizar solo el array de bandas y timestamp, manteniendo el resto
      dataToSave.bands = updatedBands;
      dataToSave.lastUpdated = new Date().toISOString();
      dataToSave.totalBands = updatedBands.length;

      // Guardar en Firebase
      const result = await saveToFirebase(dataToSave);

      if (result.success) {
        // Limpiar formulario
        setNewBandName('');
        setNewBandSetup('');
        setNewBandShow('');
        setNewBandTeardown('');

        // Mostrar mensaje de éxito
        setMessage({ 
          type: 'success', 
          text: `Banda "${newBand.name}" guardada exitosamente en Firebase.` 
        });

        // Notificar al componente padre si existe el callback
        if (onBandAdded) {
          onBandAdded(newBand);
        }

        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);

      } else {
        throw new Error(result.error || 'Error al guardar la banda en Firebase');
      }

    } catch (error) {
      console.error('Error adding band to Firebase:', error);
      setMessage({ 
        type: 'error', 
        text: `Error al guardar en Firebase: ${error.message}` 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar Enter en los inputs
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isSubmitting && !disabled) {
      handleAddBand();
    }
  };

  // Limpiar mensaje cuando el usuario empiece a escribir
  const handleInputChange = (setter) => (e) => {
    if (disabled) return;
    
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
    setter(e.target.value);
  };

  // Calcular tiempo total
  const calculateTotalTime = () => {
    const setup = parseInt(newBandSetup) || 0;
    const show = parseInt(newBandShow) || 0;
    const teardown = parseInt(newBandTeardown) || 0;
    return setup + show + teardown;
  };

  const totalTime = calculateTotalTime();
  const isFormValid = newBandName.trim() && newBandSetup && newBandShow && newBandTeardown &&
                     !isNaN(newBandSetup) && !isNaN(newBandShow) && !isNaN(newBandTeardown);

  return (
    <div style={{
      backgroundColor: '#2d3748',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px',
      opacity: disabled ? 0.6 : 1
    }}>
      <h2 style={{ 
        fontSize: '18px', 
        fontWeight: 'bold', 
        marginBottom: '16px',
        color: 'white',
        margin: '0 0 16px 0'
      }}>
        Agregar Nueva Banda
        {disabled && (
          <span style={{
            fontSize: '12px',
            color: '#f6ad55',
            marginLeft: '8px',
            fontWeight: 'normal'
          }}>
            (Solo dispositivo principal)
          </span>
        )}
      </h2>

      {/* Mensaje de estado */}
      {message.text && (
        <div style={{
          padding: '12px',
          marginBottom: '16px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: message.type === 'error' ? '#fed7d7' : '#c6f6d5',
          color: message.type === 'error' ? '#c53030' : '#2f855a',
          border: `1px solid ${message.type === 'error' ? '#fc8181' : '#68d391'}`
        }}>
          {message.type === 'error' ? 
            <AlertCircle size={16} /> : 
            <CheckCircle size={16} />
          }
          <span style={{ fontSize: '14px', flex: 1 }}>{message.text}</span>
          <button
            onClick={() => setMessage({ type: '', text: '' })}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '18px',
              lineHeight: 1,
              padding: '0',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
      )}

      {disabled && (
        <div style={{
          padding: '12px',
          marginBottom: '16px',
          backgroundColor: '#f6ad55',
          color: '#1a1a1a',
          borderRadius: '6px',
          fontSize: '14px',
          textAlign: 'center',
          fontWeight: '600'
        }}>
          Solo el dispositivo principal puede agregar bandas
        </div>
      )}

      {/* Formulario */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '16px' 
      }}>
        <input
          type="text"
          placeholder="Nombre de la banda"
          value={newBandName}
          onChange={handleInputChange(setNewBandName)}
          onKeyPress={handleKeyPress}
          style={{
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #4a5568',
            backgroundColor: disabled ? '#2a2a2a' : '#4a5568',
            color: disabled ? '#666' : 'white',
            fontSize: '14px'
          }}
          disabled={disabled || isSubmitting}
          maxLength={50}
        />
        <input
          type="number"
          placeholder="Montaje (min)"
          value={newBandSetup}
          onChange={handleInputChange(setNewBandSetup)}
          onKeyPress={handleKeyPress}
          style={{
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #4a5568',
            backgroundColor: disabled ? '#2a2a2a' : '#4a5568',
            color: disabled ? '#666' : 'white',
            fontSize: '14px'
          }}
          min="1"
          max="120"
          disabled={disabled || isSubmitting}
        />
        <input
          type="number"
          placeholder="Show (min)"
          value={newBandShow}
          onChange={handleInputChange(setNewBandShow)}
          onKeyPress={handleKeyPress}
          style={{
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #4a5568',
            backgroundColor: disabled ? '#2a2a2a' : '#4a5568',
            color: disabled ? '#666' : 'white',
            fontSize: '14px'
          }}
          min="1"
          max="180"
          disabled={disabled || isSubmitting}
        />
        <input
          type="number"
          placeholder="Desmontaje (min)"
          value={newBandTeardown}
          onChange={handleInputChange(setNewBandTeardown)}
          onKeyPress={handleKeyPress}
          style={{
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #4a5568',
            backgroundColor: disabled ? '#2a2a2a' : '#4a5568',
            color: disabled ? '#666' : 'white',
            fontSize: '14px'
          }}
          min="1"
          max="60"
          disabled={disabled || isSubmitting}
        />
      </div>

      {/* Información adicional */}
      {totalTime > 0 && !disabled && (
        <div style={{
          backgroundColor: '#4a5568',
          padding: '8px 12px',
          borderRadius: '6px',
          marginBottom: '16px',
          fontSize: '14px',
          color: '#e2e8f0'
        }}>
          <strong>Tiempo total estimado:</strong> {totalTime} minutos
          {totalTime > 90 && (
            <span style={{ color: '#f6ad55', marginLeft: '8px' }}>
              (⚠️ Más de 1.5 horas por banda)
            </span>
          )}
        </div>
      )}

      {/* Botón de envío */}
      <button
        onClick={handleAddBand}
        disabled={!isFormValid || isSubmitting || disabled}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px 20px',
          backgroundColor: (!isFormValid || isSubmitting || disabled) ? '#4a5568' : '#48bb78',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: (!isFormValid || isSubmitting || disabled) ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          width: '100%',
          transition: 'all 0.2s',
          opacity: (!isFormValid || isSubmitting || disabled) ? 0.6 : 1
        }}
        onMouseOver={(e) => {
          if (isFormValid && !isSubmitting && !disabled) {
            e.target.style.backgroundColor = '#38a169';
            e.target.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseOut={(e) => {
          if (isFormValid && !isSubmitting && !disabled) {
            e.target.style.backgroundColor = '#48bb78';
            e.target.style.transform = 'translateY(0)';
          }
        }}
      >
        {isSubmitting ? (
          <>
            <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
            Guardando en Firebase...
          </>
        ) : (
          <>
            <Plus size={20} />
            Agregar Banda
          </>
        )}
      </button>

      {/* Información de ayuda */}
      {!disabled && (
        <div style={{
          marginTop: '12px',
          fontSize: '12px',
          color: '#a0aec0',
          lineHeight: 1.4
        }}>
          <p style={{ margin: '0 0 4px 0' }}>
            • El nombre debe ser único y tener al menos 2 caracteres
          </p>
          <p style={{ margin: '0 0 4px 0' }}>
            • Tiempos: Montaje (1-120min), Show (1-180min), Desmontaje (1-60min)
          </p>
          <p style={{ margin: '0' }}>
            • Presiona Enter para agregar rápidamente
          </p>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default AddBandForm;