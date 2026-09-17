import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Anchor, 
  User, 
  Award, 
  Radio, 
  Phone, 
  FileBadge, 
  Check, 
  AlertCircle,
  LogOut,
  X
} from 'lucide-react';
import { useMaritime } from '../context/MaritimeContext';
import { PilotRank } from '../types/maritime';
import { RefreshCw, Database, Sparkles } from 'lucide-react';

export const PilotRegistrationModal: React.FC = () => {
  const { 
    currentUser, 
    registerUser, 
    updateUserProfile, 
    logoutUser, 
    isProfileModalOpen, 
    setIsProfileModalOpen,
    checkPilotBackupExists,
    getPilotBackupSummary,
    registeredPilotNames,
    switchPilotByName,
    syncStatusMessage,
    clearSyncStatusMessage,
    restoreFullBackup
  } = useMaritime();

  // If there's no currentUser, the modal MUST be open and cannot be dismissed
  const isMandatory = !currentUser;
  const isOpen = isMandatory || isProfileModalOpen;

  const [name, setName] = useState('');
  const [rank, setRank] = useState<PilotRank>('Piloto Sênior');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [vhfCallSign, setVhfCallSign] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isExactBackupFound = name.trim().length > 1 && checkPilotBackupExists(name);
  const backupSummary = isExactBackupFound ? getPilotBackupSummary(name) : null;

  // Synchronize initial values when editing profile
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setRank(currentUser.rank);
      setLicenseNumber(currentUser.licenseNumber || '');
      setVhfCallSign(currentUser.vhfCallSign || '');
      setPhone(currentUser.phone || '');
    } else {
      setName('');
      setRank('Piloto Sênior');
      setLicenseNumber('');
      setVhfCallSign('');
      setPhone('');
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor insira o Nome Completo do Piloto.');
      return;
    }
    if (!rank) {
      setError('Por favor selecione o Escalão como Piloto.');
      return;
    }

    const cleanedLicense = licenseNumber.trim() || `CIR-${Math.floor(10000 + Math.random() * 90000)}`;
    const cleanedVhf = vhfCallSign.trim() || `Piloto ${name.trim().split(' ').pop() || 'Barra'}`;

    if (currentUser) {
      updateUserProfile({
        name: name.trim(),
        rank: rank,
        licenseNumber: cleanedLicense,
        vhfCallSign: cleanedVhf,
        phone: phone.trim()
      });
    } else {
      registerUser({
        name: name.trim(),
        rank: rank,
        licenseNumber: cleanedLicense,
        vhfCallSign: cleanedVhf,
        phone: phone.trim()
      });
    }

    setError(null);
    setIsProfileModalOpen(false);
  };

  const handleLogout = () => {
    if (confirm('Deseja terminar a sessão deste piloto para registar um novo utilizador?')) {
      logoutUser();
      setName('');
      setLicenseNumber('');
      setVhfCallSign('');
      setPhone('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto transition-opacity duration-200">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-white border-2 border-black rounded-xl max-w-xl w-full shadow-2xl overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-blue-900 text-white p-5 border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-black border-2 border-blue-400 flex items-center justify-center text-white">
              <Anchor className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest bg-black text-cyan-300 px-2 py-0.5 rounded border border-blue-800">
                {isMandatory ? 'REGISTO OBRIGATÓRIO' : 'PERFIL DO PILOTO'}
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                {isMandatory ? 'Identificação do Piloto' : 'Gerir Perfil de Piloto'}
              </h2>
            </div>
          </div>

          {!isMandatory && (
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800 transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Mandatory Information Banner */}
        <div className="bg-blue-50 border-b border-blue-200 px-5 py-3 text-xs text-blue-950 flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-blue-900 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            <strong>Requisito Operacional:</strong> Todo o utilizador deve registar o seu <strong>Nome completo</strong> e <strong>Escalão como Piloto</strong> antes de utilizar as funções de manobras, certificados oficiais e registros no software.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border-2 border-rose-600 rounded-lg text-xs font-bold text-rose-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Status Message from previous sync */}
          {syncStatusMessage && (
            <div className="p-3 bg-emerald-50 border-2 border-emerald-600 rounded-lg text-xs font-bold text-emerald-900 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{syncStatusMessage}</span>
              </div>
              <button 
                type="button" 
                onClick={clearSyncStatusMessage}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-black px-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Funcionalidade de Restauro de Cópia de Segurança */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-300 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-900 shrink-0" />
              <span className="text-xs font-semibold text-slate-700">
                Possui um ficheiro de cópia de segurança (.json)?
              </span>
            </div>
            <label className="px-3 py-1 bg-white hover:bg-slate-100 text-blue-900 border border-black rounded text-xs font-bold cursor-pointer transition-colors shrink-0">
              <span>Restaurar Ficheiro</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    try {
                      const data = JSON.parse(ev.target?.result as string);
                      const ok = restoreFullBackup(data);
                      if (ok) {
                        setIsProfileModalOpen(false);
                      }
                    } catch {
                      setError('Ficheiro de cópia de segurança inválido.');
                    }
                  };
                  reader.readAsText(file);
                }}
              />
            </label>
          </div>

          {/* 1. Nome Completo */}
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1.5 flex items-center justify-between">
              <span>1. Nome Completo do Piloto *</span>
              <span className="text-[11px] font-semibold text-blue-900">Obrigatório</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Nome Completo do Prático"
                required
                autoFocus
                className="w-full bg-white border-2 border-black rounded-lg pl-9 pr-3 py-2.5 text-sm font-bold text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>

            {/* Dynamic Backup Match Feedback */}
            {isExactBackupFound && backupSummary && (
              <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-500 rounded-lg text-xs text-emerald-950 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                <div className="leading-tight">
                  <strong className="text-emerald-900">Piloto Reconhecido Taxativamente:</strong> Cópia de segurança localizada ({backupSummary.maneuverCount} manobras). Ao confirmar, todos os dados serão sincronizados e restaurados!
                </div>
              </div>
            )}

            {!isExactBackupFound && name.trim().length > 3 && (
              <div className="mt-2 p-2.5 bg-blue-50 border border-blue-300 rounded-lg text-xs text-blue-950 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-800 shrink-0" />
                <div className="leading-tight">
                  <strong>Novo Utilizador:</strong> Se o nome for diferente em outro dispositivo, é considerado outro utilizador com registos e backup isolados.
                </div>
              </div>
            )}
          </div>

          {/* 2. Escalão como Piloto */}
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1.5 flex items-center justify-between">
              <span>2. Escalão como Piloto *</span>
              <span className="text-[11px] font-semibold text-blue-900">Obrigatório</span>
            </label>
            <div className="relative">
              <Award className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <select
                value={rank}
                onChange={(e) => setRank(e.target.value as PilotRank)}
                className="w-full bg-white border-2 border-black rounded-lg pl-9 pr-3 py-2.5 text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-blue-900"
                required
              >
                <option value="Piloto Sênior">Piloto Sênior (Capitão de Manobras)</option>
                <option value="Piloto Efetivo">Piloto Efetivo / Pleno</option>
                <option value="Piloto Praticante">Piloto Praticante (Em Estágio)</option>
                <option value="Piloto Chefe / Coordenador">Piloto Chefe / Coordenador Operacional</option>
              </select>
            </div>
          </div>

          {/* 3. Cédula de Inscrição Marítima (CIR) / Licença */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-black mb-1.5">
                3. Cédula Marítima (CIR) / Licença
              </label>
              <div className="relative">
                <FileBadge className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="Ex: CIR-84920 ou Nº Licença"
                  className="w-full bg-white border-2 border-black rounded-lg pl-9 pr-3 py-2.5 text-sm font-semibold text-black placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-black mb-1.5">
                4. Canal VHF / Indicativo
              </label>
              <div className="relative">
                <Radio className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={vhfCallSign}
                  onChange={(e) => setVhfCallSign(e.target.value)}
                  placeholder="Ex: VHF Ch 12 / Piloto Alfa"
                  className="w-full bg-white border-2 border-black rounded-lg pl-9 pr-3 py-2.5 text-sm font-semibold text-black placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* 5. Telefone de Contato Operacional */}
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1.5">
              5. Telefone de Contato Operacional
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: +258 84 123 4567 ou Ramal VTS"
                className="w-full bg-white border-2 border-black rounded-lg pl-9 pr-3 py-2.5 text-sm font-semibold text-black placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-3">
            {!isMandatory ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full sm:w-auto px-4 py-2 text-rose-700 hover:bg-rose-50 border border-rose-300 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Trocar de Piloto</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-500 italic">
                Registo obrigatório antes de prosseguir.
              </span>
            )}

            <div className="w-full sm:w-auto flex items-center gap-2">
              {!isMandatory && (
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg border-2 border-black font-bold text-xs text-black hover:bg-slate-100"
                >
                  Cancelar
                </button>
              )}

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg border-2 border-black bg-blue-900 hover:bg-blue-800 text-white font-black text-sm tracking-wide shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Check className="w-4 h-4 stroke-[3] text-cyan-300" />
                <span>{currentUser ? 'GUARDAR ALTERAÇÕES' : 'CONFIRMAR E ENTRAR'}</span>
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
