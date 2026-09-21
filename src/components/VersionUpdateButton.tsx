import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, Check, ArrowDownCircle } from 'lucide-react';
import { 
  APP_CURRENT_VERSION, 
  subscribeToVersionChanges, 
  checkSoftwareVersion, 
  applySoftwareUpdate 
} from '../utils/versionManager';

interface VersionUpdateButtonProps {
  className?: string;
}

export const VersionUpdateButton: React.FC<VersionUpdateButtonProps> = ({ className = '' }) => {
  const [versionInfo, setVersionInfo] = useState({
    hasUpdate: false,
    latestVersion: APP_CURRENT_VERSION,
    isChecking: false,
    forceUpdate: false,
    message: undefined as string | undefined,
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isUpdatingNow, setIsUpdatingNow] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToVersionChanges((info) => {
      setVersionInfo(info);
    });
    return unsubscribe;
  }, []);

  const handleClick = async () => {
    if (versionInfo.hasUpdate) {
      setIsUpdatingNow(true);
      setFeedback('A actualizar...');
      try {
        sessionStorage.setItem('PILOTS_MANUAL_UPDATE_TRIGGERED', 'true');
      } catch {}
      await applySoftwareUpdate(true);
      return;
    }

    // Verificação manual
    setFeedback('A verificar...');
    const hasNew = await checkSoftwareVersion(true);
    if (!hasNew) {
      setFeedback('Actualizado');
      setTimeout(() => {
        setFeedback(null);
      }, 2500);
    }
  };

  if (versionInfo.hasUpdate || isUpdatingNow) {
    return (
      <button
        id="software-update-available-btn"
        onClick={handleClick}
        disabled={isUpdatingNow}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-[11px] border border-emerald-300 shadow-xs active:scale-95 transition-all cursor-pointer animate-pulse select-none ${className}`}
        title="Nova versão disponível do Pilot's Records. Clique para aplicar e atualizar agora."
      >
        <Sparkles className="w-3.5 h-3.5 text-slate-950" />
        <span>
          {isUpdatingNow ? 'A actualizar...' : `Nova versão (${versionInfo.latestVersion}) · Actualizar`}
        </span>
      </button>
    );
  }

  return (
    <button
      id="software-version-check-btn"
      onClick={handleClick}
      disabled={versionInfo.isChecking}
      className={`flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 font-mono font-medium text-[11px] transition-all cursor-pointer active:scale-95 select-none ${className}`}
      title="Pilot's Records v4.0.0 · Clique para verificar atualizações do software"
    >
      {feedback === 'Actualizado' ? (
        <>
          <Check className="w-3 h-3 text-emerald-400" />
          <span className="text-emerald-300 font-bold">v{APP_CURRENT_VERSION} ✓</span>
        </>
      ) : feedback === 'A verificar...' || versionInfo.isChecking ? (
        <>
          <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />
          <span>A verificar...</span>
        </>
      ) : (
        <>
          <RefreshCw className="w-3 h-3 text-cyan-400" />
          <span>v{APP_CURRENT_VERSION}</span>
        </>
      )}
    </button>
  );
};
