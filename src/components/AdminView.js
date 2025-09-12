import React, { useState } from 'react';
import { Settings, Monitor, Volume2, VolumeX, Download, Upload } from 'lucide-react';
import ScheduleOverview from './ScheduleOverview';
import CurrentBandControl from './CurrentBandControl';
import AddBandForm from './AddBandForm';
import BandsList from './BandsList';
import EditBandModal from './EditBandModal';
import styles from '../styles/styles';

const AdminView = ({
  bands,
  currentBandIndex,
  isRunning,
  soundEnabled,
  setSoundEnabled,
  onStartTimer,
  onPauseTimer,
  onResetCurrentBand,
  onNextPhase,
  onNextBand,
  onSelectBand,
  onAddBand,
  onDeleteBand,
  onUpdateBand,
  onOpenDisplayWindow,
  onExportSchedule,
  onImportSchedule,
  getTotalTime
}) => {
  const [editingBand, setEditingBand] = useState(null);

  const handleEditBand = (band) => {
    setEditingBand({
      ...band,
      newName: band.name,
      newSetupTime: band.setupTime,
      newShowTime: band.showTime,
      newTeardownTime: band.teardownTime
    });
  };

  const handleSaveBandEdit = () => {
    if (editingBand) {
      onUpdateBand({
        id: editingBand.id,
        name: editingBand.newName,
        setupTime: parseInt(editingBand.newSetupTime),
        showTime: parseInt(editingBand.newShowTime),
        teardownTime: parseInt(editingBand.newTeardownTime)
      });
      setEditingBand(null);
    }
  };

  return (
    <div style={styles.adminContainer}>
      <div style={styles.maxWidth}>
        {/* Header */}
        <div style={{ ...styles.flexBetween, marginBottom: '32px' }}>
          <div style={styles.title}>
            <Settings size={32} color="#63b3ed" />
            <h1>Panel de Administración</h1>
          </div>
          <div style={{ ...styles.flex, gap: '8px' }}>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={{
                ...styles.button,
                backgroundColor: soundEnabled ? '#38a169' : '#4a5568'
              }}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              {soundEnabled ? 'Sonido On' : 'Sonido Off'}
            </button>
            <button
              onClick={onExportSchedule}
              style={{ ...styles.button, ...styles.buttonSecondary }}
              title="Exportar cronograma"
            >
              <Download size={20} />
            </button>
            <label 
              style={{ ...styles.button, ...styles.buttonSecondary, cursor: 'pointer' }} 
              title="Importar cronograma"
            >
              <Upload size={20} />
              <input
                type="file"
                accept=".json"
                onChange={onImportSchedule}
                style={{ display: 'none' }}
              />
            </label>
            <button
              onClick={onOpenDisplayWindow}
              style={{ ...styles.button, ...styles.buttonSuccess }}
            >
              <Monitor size={20} />
              Vista Visualizador
            </button>
          </div>
        </div>

        {/* Schedule Overview */}
        <ScheduleOverview 
          bands={bands}
          currentBandIndex={currentBandIndex}
          onSelectBand={onSelectBand}
          getTotalTime={getTotalTime}
        />

        {/* Current Band Control */}
        {bands.length > 0 && currentBandIndex < bands.length && (
          <CurrentBandControl
            band={bands[currentBandIndex]}
            isRunning={isRunning}
            onStartTimer={onStartTimer}
            onPauseTimer={onPauseTimer}
            onResetCurrentBand={onResetCurrentBand}
            onNextPhase={onNextPhase}
            onNextBand={onNextBand}
            canNextBand={currentBandIndex < bands.length - 1}
          />
        )}

        {/* Add New Band */}
        <AddBandForm onAddBand={onAddBand} />

        {/* Bands List */}
        <BandsList
          bands={bands}
          currentBandIndex={currentBandIndex}
          onSelectBand={onSelectBand}
          onEditBand={handleEditBand}
          onDeleteBand={onDeleteBand}
        />

        {/* Edit Modal */}
        {editingBand && (
          <EditBandModal
            editingBand={editingBand}
            setEditingBand={setEditingBand}
            onSave={handleSaveBandEdit}
            onCancel={() => setEditingBand(null)}
          />
        )}
      </div>
    </div>
  );
};

export default AdminView;