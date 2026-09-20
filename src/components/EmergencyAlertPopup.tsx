import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Bell, X, Volume2, ArrowRight, ShieldAlert } from 'lucide-react';
import { MaritimeAlert } from '../types/maritime';

interface EmergencyAlertPopupProps {
  alert: MaritimeAlert | null;
  onDismiss: () => void;
  onNavigateToAlerts?: () => void;
  onPlaySound?: () => void;
}

export const EmergencyAlertPopup: React.FC<EmergencyAlertPopupProps> = ({
  alert,
  onDismiss,
  onNavigateToAlerts,
  onPlaySound
}) => {
  if (!alert) return null;

  const isCritical = alert.severity === 'critico';
  const isHigh = alert.severity === 'alto';

  const badgeBg = isCritical
    ? 'bg-rose-600 text-white'
    : isHigh
    ? 'bg-amber-500 text-black'
    : 'bg-blue-600 text-white';

  const borderColor = isCritical
    ? 'border-rose-600 ring-4 ring-rose-500/20'
    : isHigh
    ? 'border-amber-500 ring-4 ring-amber-500/20'
    : 'border-blue-600 ring-4 ring-blue-500/20';

  return (
    <AnimatePresence>
      <div 
        id="emergency-alert-overlay"
        className="fixed inset-0 z-50 pointer-events-none flex items-start justify-center p-3 sm:p-5"
      >
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className={`pointer-events-auto w-full max-w-lg bg-white border-2 ${borderColor} rounded-xl shadow-2xl overflow-hidden`}
        >
          {/* Top Banner Alert Bar */}
          <div className={`px-4 py-2 flex items-center justify-between text-xs font-black uppercase tracking-wider ${badgeBg}`}>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 animate-bounce" />
              <span>
                {isCritical ? 'ALERTA CRÍTICO DE PRATICAGEM' : isHigh ? 'ALERTA DE SEGURANÇA PORTUÁRIA' : 'AVISO OPERACIONAL'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {onPlaySound && (
                <button
                  onClick={onPlaySound}
                  title="Ouvir som do alarme"
                  className="p-1 rounded bg-black/20 hover:bg-black/30 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={onDismiss}
                className="p-1 rounded hover:bg-black/20 transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-0.5">
                {alert.location && <span className="font-semibold text-slate-800">📍 {alert.location}</span>}
                {alert.issuedBy && <span>· Emitido por {alert.issuedBy}</span>}
              </div>
              <h3 className="text-base font-black text-slate-900 leading-snug">
                {alert.title}
              </h3>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              {alert.description}
            </p>

            {alert.actionRequired && (
              <div className="text-[11px] bg-amber-50 text-amber-900 px-2.5 py-1.5 rounded border border-amber-200 font-medium">
                <span className="font-bold">Ação recomendada: </span>
                {alert.actionRequired}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
              {onNavigateToAlerts && (
                <button
                  type="button"
                  onClick={() => {
                    onDismiss();
                    onNavigateToAlerts();
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Ver Todos Alertas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={onDismiss}
                className="px-4 py-1.5 rounded-lg text-xs font-black bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm cursor-pointer"
              >
                Ciente
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
