
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global error visualizer for debugging runtime crashes
window.addEventListener('error', (event) => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="background-color: #1a0000; color: #ff3333; padding: 24px; font-family: monospace; border: 2px solid #ff0000; margin: 20px; border-radius: 8px; box-shadow: 0 0 20px rgba(255,0,0,0.5);">
        <h2 style="margin-top: 0; border-bottom: 1px solid #ff3333; padding-bottom: 8px;">⚠️ ERROR DE RUNTIME DETECTADO</h2>
        <p style="font-weight: bold;">${event.message}</p>
        <p><strong>Archivo:</strong> ${event.filename}:${event.lineno}:${event.colno}</p>
        <pre style="background: rgba(0,0,0,0.5); padding: 12px; overflow-x: auto; border-radius: 4px; border: 1px solid rgba(255,50,50,0.2); max-height: 400px;">${event.error?.stack || 'No stack trace available'}</pre>
        <button onclick="localStorage.clear(); location.reload();" style="background: #ff3333; color: white; border: none; padding: 10px 20px; font-weight: bold; cursor: pointer; border-radius: 4px; margin-top: 15px;">Limpiar caché y recargar</button>
      </div>
    `;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="background-color: #1a0000; color: #ff3333; padding: 24px; font-family: monospace; border: 2px solid #ff0000; margin: 20px; border-radius: 8px; box-shadow: 0 0 20px rgba(255,0,0,0.5);">
        <h2 style="margin-top: 0; border-bottom: 1px solid #ff3333; padding-bottom: 8px;">⚠️ ERROR DE PROMESA INCORRECTA</h2>
        <p style="font-weight: bold;">${event.reason?.message || event.reason || 'Unhandled Promise Rejection'}</p>
        <pre style="background: rgba(0,0,0,0.5); padding: 12px; overflow-x: auto; border-radius: 4px; border: 1px solid rgba(255,50,50,0.2); max-height: 400px;">${event.reason?.stack || 'No stack trace available'}</pre>
        <button onclick="localStorage.clear(); location.reload();" style="background: #ff3333; color: white; border: none; padding: 10px 20px; font-weight: bold; cursor: pointer; border-radius: 4px; margin-top: 15px;">Limpiar caché y recargar</button>
      </div>
    `;
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("No se pudo encontrar el elemento raíz para montar la aplicación.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
