import React from 'react';
import styles from '../styles/styles';

const NotificationSystem = ({ notifications }) => {
  return (
    <div style={styles.notificationContainer}>
      {notifications.map(notification => (
        <div
          key={notification.id}
          style={{
            ...styles.notification,
            ...(notification.type === 'error' ? styles.notificationError :
                notification.type === 'warning' ? styles.notificationWarning :
                notification.type === 'success' ? styles.notificationSuccess :
                styles.notificationInfo)
          }}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;