import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// PWA: Registo e Atualização Automática Forçada quando Online
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Verificação de versão do servidor para forçar atualização em tempo real
    const checkServerVersionAndRefresh = async () => {
      if (!navigator.onLine) return;
      try {
        const res = await fetch(`/api/version?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const storedVersion = localStorage.getItem('PILOTS_PWA_BUILD_HASH');
          if (storedVersion && storedVersion !== data.version) {
            localStorage.setItem('PILOTS_PWA_BUILD_HASH', data.version);
            // Limpa todas as caches do browser e recarrega imediatamente
            if ('caches' in window) {
              const keys = await caches.keys();
              await Promise.all(keys.map(k => caches.delete(k)));
            }
            window.location.reload();
          } else if (!storedVersion) {
            localStorage.setItem('PILOTS_PWA_BUILD_HASH', data.version);
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