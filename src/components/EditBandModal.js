import React from 'react';
import styles from '../styles/styles';

const EditBandModal = ({ editingBand, setEditingBand, onSave, onCancel }) => {
  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          Editar Banda
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="text"
            placeholder="Nombre"
            value={editingBand.newName}
            onChange={(e) => setEditingBand({...editingBand, newName: e.target.value})}
            style={{ ...styles.input, width: '100%' }}
          />
          <div style={{ ...styles.grid, ...styles.gridCols3 }}>
            <input
              type="number"
              placeholder="Montaje (min)"
              value={editingBand.newSetupTime}
              onChange={(e) => setEditingBand({...editingBand, newSetupTime: e.target.value})}
              style={styles.input}
              min="1"
              max="120"
            />
            <input
              type="number"
              placeholder="Show (min)"
              value={editingBand.newShowTime}
              onChange={(e) => setEditingBand({...editingBand, newShowTime: e.target.value})}
              style={styles.input}
              min="1"
              max="180"
            />
            <input
              type="number"
              placeholder="Desmontaje (min)"
              value={editingBand.newTeardownTime}
              onChange={(e) => setEditingBand({...editingBand, newTeardownTime: e.target.value})}
              style={styles.input}
              min="1"
              max="60"
            />
          </div>
          <div style={{ ...styles.flex, gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={onCancel}
              style={{ ...styles.button, ...styles.buttonSecondary }}
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              style={{ ...styles.button, ...styles.buttonPrimary }}
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBandModal;