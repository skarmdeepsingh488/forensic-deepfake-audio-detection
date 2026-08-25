import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Handle and suppress benign Vite HMR / WebSocket reconnection noise in sandboxed cloud container environments
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = (reason?.message || (typeof reason === 'string' ? reason : '') || '').toString();
    
    // Catch WebSocket closed or Vite HMR disconnect rejections
    if (
      message.includes('WebSocket') ||
      message.includes('websocket') ||
      message.includes('closed without opened') ||
      message.includes('vite')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation?.();
      return;
    }
  });

  window.addEventListener('error', (event) => {
    const message = (event.message || '').toString();
    if (
      message.includes('WebSocket') ||
      message.includes('websocket') ||
      message.includes('closed without opened') ||
      message.includes('failed to connect')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation?.();
      return;
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

