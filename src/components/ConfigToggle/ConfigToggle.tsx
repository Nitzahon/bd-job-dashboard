import React from 'react';
import { JobServiceFactory } from '../../services/jobServiceFactory';
import { Button } from '../common/Button/Button';
import { useLocalStorage } from '../../hooks';
import styles from './ConfigToggle.module.scss';

export function ConfigToggle(): React.ReactElement {
  const [config] = React.useState(() => JobServiceFactory.getCurrentConfig());
  const [userPreference, setUserPreference] = useLocalStorage('config_service_preference', {
    defaultValue: config.useMockData
  });

  const toggleService = () => {
    // Toggle the environment variable would require a page reload in a real app
    // For demo purposes, we'll just show current state
    const newUseMockData = !config.useMockData;
    
    // Save user preference
    setUserPreference(newUseMockData);
    
    // In a real application, this would update the .env file or use a config service
    console.log(`Would switch to ${newUseMockData ? 'Mock' : 'Real'} API service`);
    
    // For demo purposes, show instructions
    alert(
      `To switch to ${newUseMockData ? 'Mock' : 'Real'} API service:\n\n` +
      `1. Update .env file: REACT_APP_USE_MOCK_DATA=${newUseMockData}\n` +
      `2. Restart the development server\n\n` +
      `Current: ${config.useMockData ? 'Mock' : 'Real'} API\n` +
      `User Preference: ${userPreference ? 'Mock' : 'Real'} API`
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.status}>
        <span className={styles.label}>Service Mode:</span>
        <span className={`${styles.mode} ${config.useMockData ? styles.mock : styles.real}`}>
          {config.useMockData ? 'Mock Data' : 'Real API'}
        </span>
      </div>
      
      <Button
        variant="secondary"
        size="sm"
        onClick={toggleService}
        className={styles.toggleButton}
      >
        Switch to {config.useMockData ? 'Real API' : 'Mock Data'}
      </Button>
      
      <div className={styles.endpoints}>
        <div className={styles.endpoint}>
          <span className={styles.endpointLabel}>API:</span>
          <span className={styles.endpointValue}>{config.apiBaseUrl}</span>
        </div>
        <div className={styles.endpoint}>
          <span className={styles.endpointLabel}>SignalR:</span>
          <span className={styles.endpointValue}>{config.signalRHubUrl}</span>
        </div>
      </div>
    </div>
  );
}
