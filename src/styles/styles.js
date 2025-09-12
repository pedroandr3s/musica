// Styles object for the Stage Timer app

const styles = {
  // Base styles
  container: {
    minHeight: '100vh',
    backgroundColor: '#1a1a1a',
    color: 'white',
    fontFamily: 'Arial, sans-serif'
  },
  adminContainer: {
    minHeight: '100vh',
    backgroundColor: '#1a1a1a',
    color: 'white',
    padding: '24px'
  },
  maxWidth: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  
  // Header styles
  header: {
    backgroundColor: '#2d3748',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '24px',
    fontWeight: 'bold'
  },
  
  // Button styles
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  buttonPrimary: {
    backgroundColor: '#3182ce',
    color: 'white'
  },
  buttonSuccess: {
    backgroundColor: '#38a169',
    color: 'white'
  },
  buttonWarning: {
    backgroundColor: '#d69e2e',
    color: 'white'
  },
  buttonDanger: {
    backgroundColor: '#e53e3e',
    color: 'white'
  },
  buttonSecondary: {
    backgroundColor: '#4a5568',
    color: 'white'
  },
  
  // Card styles
  card: {
    backgroundColor: '#2d3748',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '24px'
  },
  cardBordered: {
    backgroundColor: '#2d3748',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '24px',
    border: '2px solid #3182ce'
  },
  
  // Input styles
  input: {
    backgroundColor: '#4a5568',
    border: '1px solid #718096',
    borderRadius: '8px',
    padding: '12px 16px',
    color: 'white',
    fontSize: '14px'
  },
  
  // Grid styles
  grid: {
    display: 'grid',
    gap: '16px'
  },
  gridCols4: {
    gridTemplateColumns: 'repeat(4, 1fr)'
  },
  gridCols3: {
    gridTemplateColumns: 'repeat(3, 1fr)'
  },
  
  // Flex styles
  flex: {
    display: 'flex'
  },
  flexBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  flexCol: {
    display: 'flex',
    flexDirection: 'column'
  },
  gap: {
    gap: '12px'
  },
  
  // Display view styles
  displayMain: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px'
  },
  bandName: {
    fontSize: '4rem',
    fontWeight: 'bold',
    marginBottom: '32px',
    textAlign: 'center'
  },
  timer: {
    fontSize: '8rem',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginBottom: '32px'
  },
  timerCritical: {
    fontSize: '8rem',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginBottom: '32px',
    color: '#f56565',
    animation: 'pulse 1s infinite'
  },
  timerWarning: {
    fontSize: '8rem',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginBottom: '32px',
    color: '#f6ad55'
  },
  phase: {
    fontSize: '3rem',
    fontWeight: 'bold',
    padding: '16px 32px',
    borderRadius: '50px',
    marginBottom: '32px'
  },
  phaseSetup: {
    backgroundColor: '#d69e2e'
  },
  phaseShow: {
    backgroundColor: '#38a169'
  },
  phaseTeardown: {
    backgroundColor: '#dd6b20'
  },
  phaseActive: {
    backgroundColor: '#3182ce'
  },
  
  // Progress bar
  progressContainer: {
    width: '100%',
    maxWidth: '800px',
    marginTop: '32px'
  },
  progressBar: {
    width: '100%',
    height: '24px',
    backgroundColor: '#4a5568',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: '12px',
    transition: 'width 1s ease'
  },
  
  // Notifications
  notificationContainer: {
    position: 'fixed',
    top: '16px',
    right: '16px',
    zIndex: 1000
  },
  notification: {
    padding: '12px 16px',
    marginBottom: '8px',
    borderRadius: '8px',
    maxWidth: '300px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    animation: 'slideIn 0.3s ease'
  },
  notificationInfo: {
    backgroundColor: '#3182ce'
  },
  notificationSuccess: {
    backgroundColor: '#38a169'
  },
  notificationWarning: {
    backgroundColor: '#d69e2e'
  },
  notificationError: {
    backgroundColor: '#e53e3e'
  },
  
  // Band list
  bandItem: {
    padding: '16px',
    borderRadius: '8px',
    border: '2px solid #4a5568',
    backgroundColor: '#4a5568',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  bandItemCurrent: {
    border: '2px solid #3182ce',
    backgroundColor: 'rgba(49, 130, 206, 0.1)'
  },
  bandItemFinished: {
    border: '2px solid #38a169',
    backgroundColor: 'rgba(56, 161, 105, 0.1)'
  },
  
  // Status indicators
  status: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  statusWaiting: {
    backgroundColor: '#d69e2e'
  },
  statusActive: {
    backgroundColor: '#3182ce'
  },
  statusFinished: {
    backgroundColor: '#38a169'
  },
  
  // Modal
  modal: {
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
  },
  modalContent: {
    backgroundColor: '#2d3748',
    padding: '24px',
    borderRadius: '12px',
    width: '400px'
  }
};

export default styles;