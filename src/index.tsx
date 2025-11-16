import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ServiceProvider } from './lib/contexts/ServiceContext';
import { WidgetProvider } from './contexts/WidgetContext';


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
