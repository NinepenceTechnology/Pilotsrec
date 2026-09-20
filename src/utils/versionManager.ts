// Sistema de Verificação e Atualização Forçada de Versão
// Suporte total a Netlify (pilotsrec.netlify.app), PWA e Web Container

export const APP_CURRENT_VERSION = '4.0.0';
export const APP_BUILD_ID = '2026.09.20.400';

interface RemoteVersionInfo {
  version: string;
  build?: string;
  releaseDate?: string;
  forceUpdate?: boolean;
  forceDomains?: string[];
  notes?: string;
}

type VersionListener = (info: {
  hasUpdate: boolean;
  latestVersion: string;
  isChecking: boolean;
  forceUpdate: boolean;
  message?: string;
}) => void;

const listeners: Set<VersionListener> = new Set();

let currentState = {
  hasUpdate: false,
  latestVersion: APP_CURRENT_VERSION,
  isChecking: false,
  forceUpdate: false,
  message: undefined as string | undefined,
};

const notifyListeners = () => {
  listeners.forEach(fn => fn({ ...currentState }));
};

export const subscribeToVersionChanges = (listener: VersionListener) => {
  listeners.add(listener);
  listener({ ...currentState });
  return () => {
    listeners.delete(listener);
  };
};

/**
 * Limpa todos os caches locais e força o recarregamento com a nova versão
 */
export const applySoftwareUpdate = async () => {
  try {
    currentState.isChecking = true;
    notifyListeners();

    // 1. Limpar todo o Cache Storage (Service Worker caches)
    if ('caches' in window) {
      try {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(key => caches.delete(key)));
      } catch (err) {
        console.warn('Erro ao limpar caches:', err);
      }
    }

    // 2. Notificar e atualizar Service Workers
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          await reg.update().catch(() => {});
        }
      } catch (err) {
        console.warn('Erro ao atualizar Service Worker:', err);
      }
    }

    // 3. Atualizar carimbo local de versão
    localStorage.setItem('PILOTS_PWA_BUILD_HASH', currentState.latestVersion || APP_CURRENT_VERSION);
    localStorage.setItem('PILOTS_APP_VERSION', currentState.latestVersion || APP_CURRENT_VERSION);
    localStorage.setItem('PILOTS_NETLIFY_V4_APPLIED', 'true');
    localStorage.setItem('PILOTS_LAST_UPDATE_TIME', Date.now().toString());

    // 4. Recarregar a página forçando bypass de cache
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('v', Date.now().toString());
    window.location.replace(currentUrl.toString());
  } catch (err) {
    console.error('Falha ao aplicar atualização:', err);
    window.location.reload();
  }
};

/**
 * Busca a versão remota no Netlify (version.json estático) ou no backend (/api/version)
 */
export const checkSoftwareVersion = async (manualTrigger = false): Promise<boolean> => {
  if (currentState.isChecking && !manualTrigger) return currentState.hasUpdate;

  currentState.isChecking = true;
  notifyListeners();

  try {
    let remoteData: RemoteVersionInfo | null = null;

    // Tentativa 1: Arquivo estático /version.json (funciona em 100% dos servidores estáticos do Netlify e locais)
    try {
      const resStatic = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      if (resStatic.ok) {
        const text = await resStatic.text();
        // Garantir que é JSON real e não fallback HTML de SPA
        if (text.trim().startsWith('{')) {
          remoteData = JSON.parse(text);
        }
      }
    } catch {
      // Segue para fallback
    }

    // Tentativa 2: Fallback para /api/system/version ou /api/version caso /version.json não responda
    if (!remoteData) {
      try {
        const resApi = await fetch(`/api/system/version?t=${Date.now()}`, {
          cache: 'no-store'
        });
        if (resApi.ok) {
          remoteData = await resApi.json();
        }
      } catch {
        // Ignorar em caso offline
      }
    }

    if (remoteData && remoteData.version) {
      currentState.latestVersion = remoteData.version;
      const isNetlify = window.location.hostname.includes('pilotsrec.netlify.app');
      const netlifyApplied = localStorage.getItem('PILOTS_NETLIFY_V4_APPLIED') === 'true';
      const storedVersion = localStorage.getItem('PILOTS_APP_VERSION');

      const isDifferentVersion = remoteData.version !== APP_CURRENT_VERSION || storedVersion !== remoteData.version;
      const shouldForceNetlify = isNetlify && (!netlifyApplied || isDifferentVersion || remoteData.forceUpdate);
      const shouldForceGeneral = remoteData.forceUpdate && isDifferentVersion;

      if (shouldForceNetlify || shouldForceGeneral) {
        currentState.hasUpdate = true;
        currentState.forceUpdate = true;
        currentState.message = `Nova versão ${remoteData.version} disponível. A atualizar...`;
        notifyListeners();

        // Se estiver em pilotsrec.netlify.app e a atualização for forçada, aplicar de imediato
        if (shouldForceNetlify) {
          console.info('Aplicando atualização forçada para pilotsrec.netlify.app...');
          setTimeout(() => {
            applySoftwareUpdate();
          }, 800);
          return true;
        }
      } else if (isDifferentVersion) {
        currentState.hasUpdate = true;
        currentState.message = `Nova versão ${remoteData.version} disponível`;
        notifyListeners();
        return true;
      } else {
        currentState.hasUpdate = false;
        currentState.message = 'Sistema atualizado';
        notifyListeners();
      }
    }
  } catch (err) {
    console.warn('Verificação de versão concluída sem alteração de estado:', err);
  } finally {
    currentState.isChecking = false;
    notifyListeners();
  }

  return currentState.hasUpdate;
};

/**
 * Inicializador automático para ser chamado na montagem da app
 */
export const initVersionSupervisor = () => {
  // Executar checagem imediata
  checkSoftwareVersion();

  // Se estiver especificamente em pilotsrec.netlify.app, verificar de imediato a flag de versão 4
  if (window.location.hostname.includes('pilotsrec.netlify.app')) {
    const netlifyUpdated = localStorage.getItem('PILOTS_NETLIFY_V4_APPLIED');
    if (!netlifyUpdated) {
      // Primeira execução na v4 para forçar purga de caches antigas da netlify
      applySoftwareUpdate();
      return;
    }
  }

  // Verificar periodicamente a cada 20 segundos
  const interval = setInterval(() => {
    if (navigator.onLine) {
      checkSoftwareVersion();
    }
  }, 20000);

  // Verificar quando a aba volta a ficar visível ou reconecta à rede
  const handleVisibility = () => {
    if (document.visibilityState === 'visible' && navigator.onLine) {
      checkSoftwareVersion();
    }
  };

  const handleOnline = () => {
    checkSoftwareVersion();
  };

  document.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('online', handleOnline);

  return () => {
    clearInterval(interval);
    document.removeEventListener('visibilitychange', handleVisibility);
    window.removeEventListener('online', handleOnline);
  };
};
