// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import './styles/globals.css';
import { enableMockApi } from './shared/lib/mockApi';

// Enable entirely fake network intercept for the prototype
if (import.meta.env.VITE_USE_MOCK === 'true') {
  enableMockApi();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);