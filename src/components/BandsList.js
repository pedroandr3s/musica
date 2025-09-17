import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Edit2, Trash2, Clock } from 'lucide-react';
import { formatTime, getPhaseLabel } from '../utils/helpers';

const BandItem = ({ 
  band, 
  index, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete, 
  onReorder,
  disabled = false
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'band',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !disabled
  });

  const [, drop] = useDrop({
    accept: 'band',
    hover: (draggedItem) => {
      if (!disabled && draggedItem.index !== index) {
        onReorder(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
    canDrop: !disabled
  });

  const getStatusColor = () => {
    switch (band.status) {
      case 'active': return '#48bb78';
      case 'finished': return '#4a5568';
      default: return '#ed8936';
    }
  };

  const getPhaseColor = () => {
    switch (band.phase) {
      case 'setup': return '#f6ad55';
      case 'show': return '#68d391';
      case 'teardown': return '#f6ad55';
      default: return '#a0aec0';
    }
  };

  return (
    <div
      ref={(node) => !disabled && drag(drop(node))}
      onClick={() => !disabled && onSelect(index)}
      style={{
        backgroundColor: isSelected ? '#2d3748' : '#4a5568',
        border: isSelected ? '2px solid #4299e1' : '2px solid transparent',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        cursor: disabled ? 'default' : 'pointer',
        opacity: isDragging ? 0.5 : (disabled ? 0.7 : 1),
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
      onMouseOver={(e) => {
        if (!isSelected && !disabled) {
          e.currentTarget.style.backgroundColor = '#2d3748';
        }
      }}
      onMouseOut={(e) => {
        if (!isSelected && !disabled) {
          e.currentTarget.style.backgroundColor = '#4a5568';
        }
      }}
    >
      {/* Band Number */}
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '8px',
        backgroundColor: '#1a1a1a',
        color: 'white',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {index + 1}
      </div>

      {/* Action Buttons */}
      <div style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        display: 'flex',
        gap: '4px'
      }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onEdit(band);
          }}
          disabled={disabled}
          style={{
            padding: '4px',
            backgroundColor: disabled ? '#4a5568' : '#4299e1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            opacity: disabled ? 0.5 : 1
          }}
        >
          <Edit2 size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onDelete(band.id, band.name);
          }}
          disabled={disabled}
          style={{
            padding: '4px',
            backgroundColor: disabled ? '#4a5568' : '#f56565',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            opacity: disabled ? 0.5 : 1
          }}
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Band Name */}
      <div style={{
        color: 'white',
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: '8px',
        marginTop: '8px'
      }}>
        {band.name}
      </div>

      {/* Status and Phase */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px'
      }}>
        <div style={{
          padding: '4px 8px',
          borderRadius: '12px',
          backgroundColor: getStatusColor(),
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {band.status === 'waiting' ? 'Esperando' :
           band.status === 'active' ? 'EN VIVO' : 'Finalizada'}
        </div>
        <div style={{
          padding: '4px 8px',
          borderRadius: '12px',
          backgroundColor: getPhaseColor(),
          color: '#1a1a1a',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {getPhaseLabel(band.phase)}
        </div>
      </div>

      {/* Timer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px'
      }}>
        <Clock size={16} style={{ color: '#a0aec0' }} />
        <span style={{
          color: 'white',
          fontSize: '18px',
          fontFamily: 'monospace',
          fontWeight: 'bold'
        }}>
          {formatTime(band.timeRemaining)}
        </span>
      </div>

      {/* Time Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '8px',
        fontSize: '12px',
        color: '#a0aec0'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', color: '#f6ad55' }}>Montaje</div>
          <div>{band.setupTime}min</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', color: '#68d391' }}>Show</div>
          <div>{band.showTime}min</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', color: '#f6ad55' }}>Desmontaje</div>
          <div>{band.teardownTime}min</div>
        </div>
      </div>

      {/* Drag Indicator */}
      {!disabled && (
        <div style={{
          position: 'absolute',
          right: '8px',
          bottom: '8px',
          color: '#a0aec0',
          fontSize: '12px'
        }}>
          ⋮⋮
        </div>
      )}
    </div>
  );
};

const BandsList = ({
  bands,
  currentBandIndex,
  onSelectBand,
  onDeleteBand,
  onUpdateBand,
  onReorderBands,
  getTotalTime,
  disabled = false
}) => {
  const [editingBand, setEditingBand] = React.useState(null);

  const handleEdit = (band) => {
    if (!disabled) {
      setEditingBand(band);
    }
  };

  const handleSaveEdit = (updatedBand) => {
    if (!disabled) {
      onUpdateBand(updatedBand);
      setEditingBand(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingBand(null);
  };

  if (bands.length === 0) {
    return (
      <div style={{
        backgroundColor: '#2d3748',
        padding: '40px',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎵</div>
        <h3 style={{
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '8px'
        }}>
          No hay bandas programadas
        </h3>
        <p style={{ color: '#a0aec0', fontSize: '14px', margin: 0 }}>
          Agrega bandas usando el formulario o importa un cronograma existente
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#2d3748',
      padding: '20px',
      borderRadius: '8px',
      opacity: disabled ? 0.8 : 1
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold',
          margin: 0
        }}>
          Cronograma de Bandas
          {disabled && (
            <span style={{
              fontSize: '12px',
              color: '#f6ad55',
              marginLeft: '8px',
              fontWeight: 'normal'
            }}>
              (Solo vista)
            </span>
          )}
        </h3>
        <div style={{
          color: '#a0aec0',
          fontSize: '14px'
        }}>
          {bands.length} bandas • {getTotalTime()} min total
        </div>
      </div>

      {disabled && (
        <div style={{
          padding: '8px 12px',
          backgroundColor: '#f6ad55',
          color: '#1a1a1a',
          borderRadius: '6px',
          fontSize: '12px',
          textAlign: 'center',
          fontWeight: '600',
          marginBottom: '16px'
        }}>
          Solo el dispositivo principal puede editar la lista de bandas
        </div>
      )}

      <div style={{
        maxHeight: '500px',
        overflowY: 'auto',
        paddingRight: '4px'
      }}>
        {bands.map((band, index) => (
          <BandItem
            key={band.id}
            band={band}
            index={index}
            isSelected={index === currentBandIndex}
            onSelect={onSelectBand}
            onEdit={handleEdit}
            onDelete={onDeleteBand}
            onReorder={onReorderBands}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Edit Modal */}
      {editingBand && !disabled && (
        <EditBandModal
          band={editingBand}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}

      {/* Help Text */}
      <div style={{
        marginTop: '16px',
        fontSize: '12px',
        color: '#a0aec0',
        lineHeight: 1.4
      }}>
        {!disabled ? (
          <>
            <p style={{ margin: '0 0 4px 0' }}>
              • Arrastra las bandas para reordenar
            </p>
            <p style={{ margin: '0' }}>
              • Haz clic en una banda para seleccionarla
            </p>
          </>
        ) : (
          <p style={{ margin: '0' }}>
            • Los cambios se sincronizan automáticamente desde el dispositivo principal
          </p>
        )}
      </div>
    </div>
  );
};

const EditBandModal = ({ band, onSave, onCancel }) => {
  const [name, setName] = React.useState(band.name);
  const [setupTime, setSetupTime] = React.useState(band.setupTime);
  const [showTime, setShowTime] = React.useState(band.showTime);
  const [teardownTime, setTeardownTime] = React.useState(band.teardownTime);

  const handleSave = () => {
    if (name.trim() && setupTime > 0 && showTime > 0 && teardownTime > 0) {
      onSave({
        ...band,
        name: name.trim(),
        setupTime: parseInt(setupTime),
        showTime: parseInt(showTime),
        teardownTime: parseInt(teardownTime)
      });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#2d3748',
        padding: '24px',
        borderRadius: '8px',
        width: '400px',
        maxWidth: '90vw'
      }}>
        <h3 style={{
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '16px',
          margin: '0 0 16px 0'
        }}>
          Editar Banda
        </h3>

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            color: '#a0aec0',
            fontSize: '14px',
            display: 'block',
            marginBottom: '4px'
          }}>
            Nombre de la banda
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #4a5568',
              backgroundColor: '#4a5568',
              color: 'white',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div>
            <label style={{
              color: '#a0aec0',
              fontSize: '14px',
              display: 'block',
              marginBottom: '4px'
            }}>
              Montaje (min)
            </label>
            <input
              type="number"
              value={setupTime}
              onChange={(e) => setSetupTime(e.target.value)}
              min="1"
              max="120"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #4a5568',
                backgroundColor: '#4a5568',
                color: 'white',
                fontSize: '14px'
              }}
            />
          </div>
          <div>
            <label style={{
              color: '#a0aec0',
              fontSize: '14px',
              display: 'block',
              marginBottom: '4px'
            }}>
              Show (min)
            </label>
            <input
              type="number"
              value={showTime}
              onChange={(e) => setShowTime(e.target.value)}
              min="1"
              max="180"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #4a5568',
                backgroundColor: '#4a5568',
                color: 'white',
                fontSize: '14px'
              }}
            />
          </div>
          <div>
            <label style={{
              color: '#a0aec0',
              fontSize: '14px',
              display: 'block',
              marginBottom: '4px'
            }}>
              Desmontaje (min)
            </label>
            <input
              type="number"
              value={teardownTime}
              onChange={(e) => setTeardownTime(e.target.value)}
              min="1"
              max="60"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #4a5568',
                backgroundColor: '#4a5568',
                color: 'white',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4a5568',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              backgroundColor: '#48bb78',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BandsList;