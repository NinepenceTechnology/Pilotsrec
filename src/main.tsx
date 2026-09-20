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

// PWA: Registo e Atualização Automática Forçada quando Online
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Verificação de versão do servidor para forçar atualização em tempo real
    const checkServerVersionAndRefresh = async () => {
      if (!navigator.onLine) return;
      try {
        // Tenta primeiro /version.json (Netlify & estático)
        let newVersion = '';
        let isForce = false;

        try {
          const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
          if (res.ok) {
            const text = await res.text();
            if (text.trim().startsWith('{')) {
              const data = JSON.parse(text);
              newVersion = data.version;
              isForce = !!data.forceUpdate;
            }
          }
        } catch {}

        if (!newVersion) {
          try {
            const res = await fetch(`/api/version?t=${Date.now()}`, { cache: 'no-store' });
            if (res.ok) {
              const data = await res.json();
              newVersion = data.version;
              isForce = !!data.forceUpdate;
            }
          } catch {}
        }

        if (newVersion) {
          const storedVersion = localStorage.getItem('PILOTS_PWA_BUILD_HASH');
          const isNetlify = window.location.hostname.includes('pilotsrec.netlify.app');
          const netlifyUpdated = localStorage.getItem('PILOTS_NETLIFY_V4_APPLIED') === 'true';

          if ((isNetlify && (!netlifyUpdated || storedVersion !== newVersion)) || (storedVersion && storedVersion !== newVersion) || isForce) {
            await applySoftwareUpdate();
          } else if (!storedVersion) {
            localStorage.setItem('PILOTS_PWA_BUILD_HASH', newVersion);
          }
        }
      } catch {
        // Ignorar se falhar em modo offline
      }
    };

    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        // 1. Forçar verificação de nova versão imediatamente ao carregar se estiver online
        if (navigator.onLine) {
          registration.update().catch(() => {});
          checkServerVersionAndRefresh();
        }

        // 2. Se já existir um worker à espera, força-o a ativar imediatamente
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        // 3. Quando for detetada uma nova versão sendo instalada
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });

        // 4. Verificar periodicamente se há nova versão quando online (a cada 15 segundos)
        setInterval(() => {
          if (navigator.onLine) {
            registration.update().catch(() => {});
            checkServerVersionAndRefresh();
          }
        }, 15000);

        // 5. Verificar atualização sempre que a aplicação ganha foco ou reconecta à internet
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible' && navigator.onLine) {
            registration.update().catch(() => {});
            checkServerVersionAndRefresh();
          }
        });

        window.addEventListener('online', () => {
          registration.update().catch(() => {});
          checkServerVersionAndRefresh();
        });
      })
      .catch((error) => {
        console.error('Erro ao registar Service Worker:', error);
      });

    // 6. Quando o novo Service Worker assume o controlo, recarrega a página automaticamente para a nova versão
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  });
}