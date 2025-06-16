
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx'; // Ensure .tsx extension is used for local TS/TSX modules
// No global CSS import needed as Tailwind is via CDN

console.log('[index.tsx] Script execution started. Attempting to render App...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('[index.tsx] CRITICAL: Root element with ID "root" not found in HTML. App cannot be mounted.');
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
console.log('[index.tsx] React App rendering initiated.');