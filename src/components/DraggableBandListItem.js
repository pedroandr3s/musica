import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Edit3, Trash2, GripVertical } from 'lucide-react';
import { formatTime, getPhaseLabel } from '../utils/helpers';
import styles from '../styles/styles';

const DraggableBandListItem = ({ 
  band, 
  index, 
  currentBandIndex, 
  onSelectBand, 
  onEditBand, 
  onDeleteBand, 
  onReorderBands 
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'BAND_LIST_ITEM',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'BAND_LIST_ITEM',
    hover: (item) => {
      if (item.index !== index) {
        onReorderBands(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      style={{
        ...styles.bandItem,
        ...(index === currentBandIndex ? styles.bandItemCurrent :
            band.status === 'finished' ? styles.bandItemFinished : {}),
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move'
      }}
      onClick={() => onSelectBand(index)}
    >
      <div style={styles.flexBetween}>
        <div style={{ ...styles.flex, gap: '16px', alignItems: 'center' }}>
          <GripVertical size={16} color="#718096" style={{ cursor: 'grab' }} />
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
  );
};

export default DraggableBandListItem;