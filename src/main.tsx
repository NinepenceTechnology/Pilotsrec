import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initVersionSupervisor, checkSoftwareVersion, applySoftwareUpdate, APP_CURRENT_VERSION } from './utils/versionManager.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Iniciar o supervisor de versão com verificação para pilotsrec.netlify.app
initVersionSupervisor();

// PWA: Registo e Atualização Segura do Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        // Se já existir um worker à espera e o utilizador ainda não tiver sido notificado
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        // Quando for detetada uma nova versão sendo instalada
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Notifica que há nova versão para atualização manual segura
                checkSoftwareVersion();
              }
            });
          }
        });

        // Verificação silenciosa periódica da cache do Service Worker (a cada 30 minutos)
        setInterval(() => {
          if (navigator.onLine) {
            registration.update().catch(() => {});
          }
        }, 30 * 60 * 1000);
      })
      .catch((error) => {
        console.error('Erro ao registar Service Worker:', error);
      });

    // Recarregamento seguro com proteção rigorosa anti-loop
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Apenas recarrega se o recarregamento tiver sido solicitado explicitamente e com cooldown de 1 minuto
      const lastSwReload = parseInt(sessionStorage.getItem('PILOTS_SW_RELOAD_TIME') || '0', 10);
      const isManualUpdate = sessionStorage.getItem('PILOTS_MANUAL_UPDATE_TRIGGERED') === 'true';
      if (!refreshing && isManualUpdate && Date.now() - lastSwReload > 60000) {
        refreshing = true;
        sessionStorage.removeItem('PILOTS_MANUAL_UPDATE_TRIGGERED');
        sessionStorage.setItem('PILOTS_SW_RELOAD_TIME', Date.now().toString());
        window.location.reload();
      }
    });
  });
}