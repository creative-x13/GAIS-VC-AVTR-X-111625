import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Fix: Replaced incorrect AppProvider with ServiceProvider and WidgetProvider from correct paths.
import { ServiceProvider } from './src/lib/contexts/ServiceContext';
import { WidgetProvider } from './src/contexts/WidgetContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ServiceProvider>
      <WidgetProvider>
        <App />
      </WidgetProvider>
    </ServiceProvider>
  </React.StrictMode>
);