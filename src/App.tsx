import React from 'react';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import CalendarAvailability from './components/CalendarAvailability';
import { msalConfig } from './config/authConfig';

const msalInstance = new PublicClientApplication(msalConfig);

function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Schedule Checker
            </h1>
            <p className="text-lg text-gray-600">
              Check your availability at a glance
            </p>
          </header>
          <CalendarAvailability />
        </div>
      </div>
    </MsalProvider>
  );
}

export default App; 