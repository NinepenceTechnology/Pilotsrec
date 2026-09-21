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
export const applySoftwareUpdate = async (isManual = true) => {
  // Proteção contra loops de recarregamento contínuo
  const lastReload = parseInt(sessionStorage.getItem('PILOTS_LAST_RELOAD_TIME') || '0', 10);
  const now = Date.now();
  if (!isManual && now - lastReload < 60000) {
    console.warn('Proteção de ciclo ativa: recarregamento automático ignorado para evitar loops.');
    return;
  }
  sessionStorage.setItem('PILOTS_LAST_RELOAD_TIME', now.toString());

  try {
    currentState.isChecking = true;
    notifyListeners();

    // 1. Atualizar carimbo local de versão antes de limpar
    const targetVersion = currentState.latestVersion || APP_CURRENT_VERSION;
    localStorage.setItem('PILOTS_PWA_BUILD_HASH', targetVersion);
    localStorage.setItem('PILOTS_APP_VERSION', targetVersion);
    localStorage.setItem('PILOTS_NETLIFY_V4_APPLIED', 'true');
    localStorage.setItem('PILOTS_LAST_UPDATE_TIME', now.toString());

    // 2. Limpar todo o Cache Storage (Service Worker caches)
    if ('caches' in window) {
      try {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(key => caches.delete(key)));
      } catch (err) {
        console.warn('Erro ao limpar caches:', err);
      }
    }

    // 3. Notificar e atualizar Service Workers
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

    // 4. Recarregar a página forçando bypass de cache
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('v', now.toString());
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
        const resApi = await fetch(`/api/version?t=${Date.now()}`, {
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
      const storedVersion = localStorage.getItem('PILOTS_APP_VERSION');

      // Só há atualização se a versão remota for comprovadamente diferente da versão atualmente em execução
      const isDifferentVersion = remoteData.version !== APP_CURRENT_VERSION;

      if (isDifferentVersion) {
        currentState.hasUpdate = true;
        currentState.forceUpdate = !!remoteData.forceUpdate;
        currentState.message = `Nova versão ${remoteData.version} disponível.`;
        notifyListeners();
        return true;
      } else {
        currentState.hasUpdate = false;
        currentState.forceUpdate = false;
        currentState.message = 'Sistema atualizado';
        if (!storedVersion) {
          localStorage.setItem('PILOTS_APP_VERSION', APP_CURRENT_VERSION);
        }
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
  // Inicializar carimbo local para evitar loops na primeira execução
  try {
    if (!localStorage.getItem('PILOTS_APP_VERSION')) {
      localStorage.setItem('PILOTS_APP_VERSION', APP_CURRENT_VERSION);
    }
    if (!localStorage.getItem('PILOTS_NETLIFY_V4_APPLIED')) {
      localStorage.setItem('PILOTS_NETLIFY_V4_APPLIED', 'true');
    }
  } catch {}

  // Executar checagem de versão inicial após 3 segundos da inicialização (para não concorrer com carregamento inicial)
  setTimeout(() => {
    if (navigator.onLine) {
      checkSoftwareVersion();
    }
  }, 3000);

  // Verificar periodicamente a cada 5 minutos (em vez de loops agressivos de segundos)
  const FIVE_MINUTES = 5 * 60 * 1000;
  const interval = setInterval(() => {
    if (navigator.onLine) {
      checkSoftwareVersion();
    }
  }, FIVE_MINUTES);

  // Verificar quando a aba volta a ficar visível
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
