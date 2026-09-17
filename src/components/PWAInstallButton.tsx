import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'badge' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  className = '',
  variant = 'header'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already installed, don't display unless in card debug mode
  if (isInstalled) {
    if (variant === 'card') {
      return (
        <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold">
          <Check className="w-4 h-4" />
          <span>PWA Instalado em Modo Standalone</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  // If not installable and not iOS (e.g. standard browser where prompt hasn't fired or not supported),
  // on card mode we show how to install
  if (!isInstallable && !isIOS && variant === 'header') {
    return null;
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all border shadow-sm cursor-pointer ${
          variant === 'header'
            ? 'bg-gradient-to-r from-cyan-700 to-blue-900 text-white border-black hover:brightness-110'
            : 'bg-blue-900 text-white border-black hover:bg-blue-800'
        } ${className}`}
        title="Instalar Pilot's Records no dispositivo"
      >
        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Instalar App PWA</span>
      </button>

      {/* iOS Installation Instruction Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl border-2 border-black text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5 text-cyan-300" />
                </div>
                <h3 className="text-sm font-black uppercase text-blue-950">
                  Instalar no iPhone / iPad
                </h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-start gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 font-black flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div>
                  No navegador Safari da Apple, toque no botão <strong>Partilhar</strong> (ícone <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-700" /> na barra inferior).
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 font-black flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div>
                  Deslize para baixo e selecione a opção <strong className="flex items-center gap-1 mt-0.5"><PlusSquare className="w-3.5 h-3.5 text-slate-800" /> Ecrã principal</strong> (Add to Home Screen).
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 font-black flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div>
                  Toque em <strong>Adicionar</strong> no canto superior direito. O ícone de alta resolução com a âncora surgirá no seu ecrã!
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-2 w-full rounded-lg bg-blue-900 py-2.5 text-xs font-black text-white hover:bg-blue-800 border border-black shadow"
            >
              Compreendi, Voltar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
