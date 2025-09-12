// Constants and configuration for the Stage Timer app

// Default band data
export const DEFAULT_BANDS = [
  { id: 1, name: 'Osyan', setupTime: 30, showTime: 45, teardownTime: 15, status: 'waiting', phase: 'setup', timeRemaining: 30 * 60 },
  { id: 2, name: 'Wofo', setupTime: 45, showTime: 60, teardownTime: 20, status: 'waiting', phase: 'setup', timeRemaining: 45 * 60 },
  { id: 3, name: 'Carnada', setupTime: 25, showTime: 30, teardownTime: 10, status: 'waiting', phase: 'setup', timeRemaining: 25 * 60 }
];

// Timer warning thresholds (in seconds)
export const WARNING_THRESHOLDS = {
  FIVE_MINUTES: 300,
  TWO_MINUTES: 120,
  ONE_MINUTE: 60,
  THIRTY_SECONDS: 30,
  TEN_SECONDS: 10
};

// Sound frequencies for different warnings
export const SOUND_FREQUENCIES = {
  FIVE_MINUTES: 600,
  TWO_MINUTES: 700,
  ONE_MINUTE: 800,
  THIRTY_SECONDS: 900,
  COUNTDOWN: 1000,
  PHASE_END: 400
};

// Phase types
export const PHASES = {
  SETUP: 'setup',
  SHOW: 'show',
  TEARDOWN: 'teardown'
};

// Band status types
export const BAND_STATUS = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  FINISHED: 'finished'
};

// Time limits (in minutes)
export const TIME_LIMITS = {
  MIN_TIME: 1,
  MAX_SETUP: 120,
  MAX_SHOW: 180,
  MAX_TEARDOWN: 60
};

// Display window configuration
export const DISPLAY_WINDOW_CONFIG = {
  width: 1920,
  height: 1080,
  features: 'width=1920,height=1080,fullscreen=yes'
};

// Notification auto-hide duration (in milliseconds)
export const NOTIFICATION_DURATION = 5000;