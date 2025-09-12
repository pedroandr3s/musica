import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { GripVertical } from 'lucide-react';
import { getPhaseLabel } from '../utils/helpers';
import styles from '../styles/styles';

const DraggableBandItem = ({ band, index, currentBandIndex, onSelectBand, onReorderBands }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'BAND_ITEM',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'BAND_ITEM',
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
        <div style={{ ...styles.flex, ...styles.gap, alignItems: 'center' }}>
          <GripVertical size={16} color="#718096" style={{ cursor: 'grab' }} />
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
  );
};

export default DraggableBandItem;