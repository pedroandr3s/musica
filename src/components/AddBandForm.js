import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import styles from '../styles/styles';

const AddBandForm = ({ onAddBand }) => {
  const [newBandName, setNewBandName] = useState('');
  const [newBandSetup, setNewBandSetup] = useState('');
  const [newBandShow, setNewBandShow] = useState('');
  const [newBandTeardown, setNewBandTeardown] = useState('');

  const handleAddBand = () => {
    if (newBandName && newBandSetup && newBandShow && newBandTeardown &&
        !isNaN(newBandSetup) && !isNaN(newBandShow) && !isNaN(newBandTeardown)) {
      
      onAddBand({
        name: newBandName,
        setupTime: parseInt(newBandSetup),
        showTime: parseInt(newBandShow),
        teardownTime: parseInt(newBandTeardown)
      });

      // Clear form
      setNewBandName('');
      setNewBandSetup('');
      setNewBandShow('');
      setNewBandTeardown('');
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
        Agregar Nueva Banda
      </h2>
      <div style={{ ...styles.grid, ...styles.gridCols4, marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Nombre de la banda"
          value={newBandName}
          onChange={(e) => setNewBandName(e.target.value)}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Montaje (min)"
          value={newBandSetup}
          onChange={(e) => setNewBandSetup(e.target.value)}
          style={styles.input}
          min="1"
          max="120"
        />
        <input
          type="number"
          placeholder="Show (min)"
          value={newBandShow}
          onChange={(e) => setNewBandShow(e.target.value)}
          style={styles.input}
          min="1"
          max="180"
        />
        <input
          type="number"
          placeholder="Desmontaje (min)"
          value={newBandTeardown}
          onChange={(e) => setNewBandTeardown(e.target.value)}
          style={styles.input}
          min="1"
          max="60"
        />
      </div>
      <button
        onClick={handleAddBand}
        style={{ ...styles.button, ...styles.buttonPrimary }}
      >
        <Plus size={20} />
        Agregar Banda
      </button>
    </div>
  );
};

export default AddBandForm;