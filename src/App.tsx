import React from 'react';
import { Dashboard } from './components/Dashboard/Dashboard';
import { LanguageProvider } from './context/LanguageContext';
import { ErrorProvider } from './context/ErrorContext';
import { ErrorNotifications } from './components/ErrorNotifications/ErrorNotifications';
import './i18n'; // Initialize i18n
import './styles/main.scss'; // Import our base styles

function App() {
  return (
    <div className="App">
      <ErrorProvider>
        <LanguageProvider>
          <Dashboard />
          <ErrorNotifications />
        </LanguageProvider>
      </ErrorProvider>
    </div>
  );
}

export default App;
