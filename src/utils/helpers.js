// Utility functions for the Stage Timer app

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const getPhaseLabel = (phase) => {
  switch(phase) {
    case 'setup': return 'Montaje';
    case 'show': return 'Show';
    case 'teardown': return 'Desmontaje';
    default: return 'Montaje';
  }
};

export const calculateTotalTime = (bands) => {
  return bands.reduce((total, band) => 
    total + band.setupTime + band.showTime + band.teardownTime, 0);
};

export const getPhaseTime = (band, phase) => {
  switch(phase) {
    case 'setup': return band.setupTime;
    case 'show': return band.showTime;
    case 'teardown': return band.teardownTime;
    default: return band.setupTime;
  }
};