import React, { useState, useRef, useEffect } from 'react';
import { 
  Anchor, 
  Wind, 
  Waves, 
  Plus, 
  Ship, 
  Users, 
  AlertOctagon, 
  BarChart3, 
  ShieldCheck, 
  ChevronDown, 
  FileText, 
  Globe, 
  RotateCcw,
  Smartphone,
  BookOpen,
  User,
  Heart,
  Bell,
  FileSpreadsheet,
  FolderArchive,
  LayoutDashboard
} from 'lucide-react';
import { useMaritime, AppView } from '../context/MaritimeContext';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onOpenNewManeuverModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewManeuverModal }) => {
  const { 
    currentView, 
    setCurrentView, 
    weather, 
    isMobileHudOpen, 
    setIsMobileHudOpen, 
    maneuvers, 
    alerts,
    resetAllData,
    currentUser,
    setIsProfileModalOpen,
    language,
    setLanguage,
    t
  } = useMaritime();

  const [isManagementDropdownOpen, setIsManagementDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsManagementDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeCount = maneuvers.filter(m => m.status === 'em_curso').length;
  const completedCount = maneuvers.filter(m => m.status === 'concluida').length;
  const activeAlertsCount = alerts.filter(a => a.isActive).length;

  const isGroupActive = ['pilotos', 'cancelamentos', 'performance', 'seguranca', 'navios', 'testes'].includes(currentView);
  const isPt = language === 'pt';

  return (
    <header className="bg-white border-b-2 border-slate-900 sticky top-0 z-40 shadow-md text-slate-900">
      
      {/* Top Telemetry & Pilot Status Ribbon - Deep Naval Blue */}
      <div className="bg-slate-950 text-white px-3 sm:px-4 py-1.5 text-xs flex items-center justify-between gap-3 border-b border-cyan-900/40">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="hidden xs:inline">VTS &amp; ESTAÇÃO DE PILOTAGEM</span>
            <span className="xs:hidden">VTS PILOT</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-slate-300 font-mono text-xs">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            <span>Vento: <strong>{weather.windSpeedKnots} kts</strong> ({weather.windDirection})</span>
          </div>
          <button
            onClick={() => setCurrentView('mares')}
            className="flex items-center gap-1.5 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800 text-xs transition-colors cursor-pointer font-mono"
            title={isPt ? 'Abrir Tábua de Marés e Cálculos UKC' : 'Open Tide Table & UKC Calculation'}
          >
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span>Maré: <strong>{weather.tideHeightMeters}m</strong></span>
            <span className="text-[9px] bg-cyan-400 text-slate-950 px-1 rounded font-black uppercase ml-0.5">
              Calc
            </span>
          </button>
        </div>

        {/* Right Corner: Prominent Bilingual Toggle, Pilot Profile & Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Top-Right Language Switcher Button (PT <-> EN) */}
          <button
            id="top-language-switcher"
            onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 active:scale-95 text-cyan-300 border-2 border-cyan-400 font-mono font-bold text-xs transition-all shadow-sm cursor-pointer select-none touch-manipulation"
            title={language === 'pt' ? 'Alterar para Inglês (Switch to English)' : 'Mudar para Português (Switch to Portuguese)'}
          >
            <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-black text-white text-xs">{language === 'pt' ? '🇵🇹 PT' : '🇬🇧 EN'}</span>
            <span className="text-[10px] text-cyan-300 font-bold bg-cyan-900/90 px-1.5 py-0.5 rounded border border-cyan-700/60 hidden xs:inline">
              {language === 'pt' ? 'MUDAR' : 'SWITCH'}
            </span>
          </button>

          {/* Active Logged-in Pilot Profile */}
          {currentUser ? (
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-2 sm:px-2.5 py-1 rounded border border-cyan-700/60 text-xs transition-colors cursor-pointer"
              title={isPt ? 'Perfil do Piloto' : 'Pilot Profile'}
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold text-white max-w-[100px] sm:max-w-[150px] truncate">
                {currentUser.name}
              </span>
              <span className="hidden md:inline bg-cyan-950 text-[10px] text-cyan-300 px-1.5 py-0.2 rounded font-mono font-bold border border-cyan-800 uppercase">
                {currentUser.rank}
              </span>
            </button>
          ) : (
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-1 bg-cyan-400 hover:bg-cyan-300 text-slate-950 px-2.5 py-1 rounded text-xs font-black transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>{isPt ? 'Piloto' : 'Pilot'}</span>
            </button>
          )}

          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono">
            <span className="bg-slate-900 text-emerald-400 px-2 py-0.5 rounded border border-cyan-900/60 font-bold">
              {activeCount} {isPt ? 'Em Curso' : 'Underway'}
            </span>
          </div>

          <button
            onClick={() => {
              if (confirm(isPt ? 'Deseja repor todos os registos do sistema e reiniciar de zero?' : 'Reset all system data and reboot to fresh state?')) {
                resetAllData();
              }
            }}
            title={isPt ? 'Reiniciar todos os registos do sistema' : 'Reset system'}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Bar - Clean Brand Identity & Primary Operations Navigation */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-4">
        
        {/* Brand Logo & Name (No repetitive long subtitles) */}
        <div className="flex items-center justify-between">
          <div 
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-950 border-2 border-slate-900 flex items-center justify-center text-white shadow group-hover:border-cyan-500 transition-colors shrink-0">
              <Anchor className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg sm:text-xl tracking-tight text-slate-950 font-sans">
                PILOT'S RECORDS
              </span>
              <span className="text-[10px] bg-slate-950 text-cyan-400 px-1.5 py-0.5 rounded font-mono font-black tracking-widest uppercase border border-cyan-900/60">
                PRO 2026
              </span>
            </div>
          </div>

          {/* Mobile Right Actions: New maneuver button on small screens */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={() => setIsMobileHudOpen(true)}
              className="p-2 rounded-lg bg-slate-900 text-cyan-400 border border-cyan-800"
              title="HUD a Bordo"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenNewManeuverModal}
              className="px-3 py-1.5 rounded-lg bg-blue-900 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{isPt ? 'Registo' : 'Record'}</span>
            </button>
          </div>
        </div>

        {/* Primary Navigation Buttons (Responsive: works smoothly on Tablets, Computers and Large screens without overlapping) */}
        <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 -mx-1 px-1">
          {/* Tela Inicial / Dashboard */}
          <button
            id="nav-dashboard"
            onClick={() => setCurrentView('dashboard')}
            className={`min-h-[42px] px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 border whitespace-nowrap transition-all shrink-0 cursor-pointer touch-manipulation active:scale-95 ${
              currentView === 'dashboard'
                ? 'bg-slate-950 text-cyan-400 border-slate-950 shadow-sm ring-2 ring-cyan-500/40'
                : 'bg-white text-slate-800 border-slate-300 hover:border-slate-500 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-cyan-500 shrink-0" />
            <span>{isPt ? 'Início' : 'Home'}</span>
          </button>

          {/* 1. REGISTO DE OPERAÇÃO (Clean without btn) */}
          <button
            id="nav-operacoes"
            onClick={() => setCurrentView('operacoes')}
            className={`min-h-[42px] px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 border whitespace-nowrap transition-all shrink-0 cursor-pointer touch-manipulation active:scale-95 ${
              currentView === 'operacoes'
                ? 'bg-slate-950 text-white border-slate-950 shadow-sm ring-2 ring-blue-500/50'
                : 'bg-white text-slate-800 border-slate-300 hover:border-slate-500 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{isPt ? 'Operações' : 'Operations'}</span>
            {activeCount > 0 && (
              <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {activeCount}
              </span>
            )}
          </button>

          {/* 2. SAÚDE & FADIGA (Clean without btn) */}
          <button
            id="nav-saude"
            onClick={() => setCurrentView('saude')}
            className={`min-h-[42px] px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 border whitespace-nowrap transition-all shrink-0 cursor-pointer touch-manipulation active:scale-95 ${
              currentView === 'saude'
                ? 'bg-slate-950 text-rose-300 border-slate-950 shadow-sm ring-2 ring-rose-500/50'
                : 'bg-white text-slate-800 border-slate-300 hover:border-slate-500 hover:bg-slate-100'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{isPt ? 'Saúde & Fadiga' : 'Health & Fatigue'}</span>
          </button>

          {/* 3. ALERTA (Clean without btn) */}
          <button
            id="nav-alertas"
            onClick={() => setCurrentView('alertas')}
            className={`min-h-[42px] px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 border whitespace-nowrap transition-all shrink-0 cursor-pointer touch-manipulation active:scale-95 ${
              currentView === 'alertas'
                ? 'bg-slate-950 text-amber-300 border-slate-950 shadow-sm ring-2 ring-amber-500/50'
                : 'bg-white text-slate-800 border-slate-300 hover:border-slate-500 hover:bg-slate-100'
            }`}
          >
            <Bell className={`w-4 h-4 shrink-0 ${activeAlertsCount > 0 ? 'text-amber-500 animate-bounce' : 'text-amber-500'}`} />
            <span>{isPt ? 'Alertas' : 'Alerts'}</span>
            {activeAlertsCount > 0 && (
              <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                {activeAlertsCount}
              </span>
            )}
          </button>

          {/* 4. DOCUMENTOS (Clean without btn) */}
          <button
            id="nav-documentos"
            onClick={() => setCurrentView('relatorios')}
            className={`min-h-[42px] px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 border whitespace-nowrap transition-all shrink-0 cursor-pointer touch-manipulation active:scale-95 ${
              currentView === 'relatorios'
                ? 'bg-slate-950 text-emerald-300 border-slate-950 shadow-sm ring-2 ring-emerald-500/50'
                : 'bg-white text-slate-800 border-slate-300 hover:border-slate-500 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{isPt ? 'Documentos' : 'Documents'}</span>
          </button>

          {/* 5. MARÉS E CÁLCULOS (Clean without btn) */}
          <button
            id="nav-mares"
            onClick={() => setCurrentView('mares')}
            className={`min-h-[42px] px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 border whitespace-nowrap transition-all shrink-0 cursor-pointer touch-manipulation active:scale-95 ${
              currentView === 'mares'
                ? 'bg-slate-950 text-cyan-300 border-slate-950 shadow-sm ring-2 ring-cyan-500/50'
                : 'bg-white text-slate-800 border-slate-300 hover:border-slate-500 hover:bg-slate-100'
            }`}
          >
            <Waves className="w-4 h-4 text-cyan-600 shrink-0" />
            <span>{isPt ? 'Marés & Cálculos' : 'Tides & Calc'}</span>
          </button>

          {/* 6. ARQUIVO (Clean without btn) */}
          <button
            id="nav-arquivo"
            onClick={() => setCurrentView('arquivo')}
            className={`min-h-[42px] px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 border whitespace-nowrap transition-all shrink-0 cursor-pointer touch-manipulation active:scale-95 ${
              currentView === 'arquivo'
                ? 'bg-slate-950 text-purple-300 border-slate-950 shadow-sm ring-2 ring-purple-500/50'
                : 'bg-white text-slate-800 border-slate-300 hover:border-slate-500 hover:bg-slate-100'
            }`}
          >
            <FolderArchive className="w-4 h-4 text-purple-600 shrink-0" />
            <span>{isPt ? 'Arquivo' : 'Archive'}</span>
          </button>

          {/* Dropdown: Módulos Adicionais de Apoio */}
          <div ref={dropdownRef} className="relative shrink-0">
            <button
              id="nav-extra-modules"
              onClick={() => setIsManagementDropdownOpen(prev => !prev)}
              className={`min-h-[42px] px-3 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 border transition-all cursor-pointer touch-manipulation active:scale-95 ${
                isGroupActive
                  ? 'bg-slate-950 text-cyan-300 border-slate-950'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
              title={isPt ? 'Módulos Adicionais' : 'More Modules'}
            >
              <span>+</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isManagementDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isManagementDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border-2 border-slate-900 rounded-xl shadow-2xl py-1.5 z-50 divide-y divide-slate-100">
                <div className="px-3 py-1 bg-slate-50 text-[10px] font-mono font-black uppercase text-slate-500">
                  {isPt ? 'Módulos Operacionais' : 'Operational Modules'}
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { setCurrentView('pilotos'); setIsManagementDropdownOpen(false); }}
                    className="w-full text-left px-3.5 py-2 text-xs font-bold flex items-center gap-2.5 text-slate-800 hover:bg-cyan-50"
                  >
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>{isPt ? 'Pilotos & Escalas' : 'Pilots & Rosters'}</span>
                  </button>

                  <button
                    onClick={() => { setCurrentView('seguranca'); setIsManagementDropdownOpen(false); }}
                    className="w-full text-left px-3.5 py-2 text-xs font-bold flex items-center gap-2.5 text-slate-800 hover:bg-cyan-50"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{isPt ? 'Segurança & MPX SOLAS' : 'Safety & MPX SOLAS'}</span>
                  </button>

                  <button
                    onClick={() => { setCurrentView('performance'); setIsManagementDropdownOpen(false); }}
                    className="w-full text-left px-3.5 py-2 text-xs font-bold flex items-center gap-2.5 text-slate-800 hover:bg-cyan-50"
                  >
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    <span>{isPt ? 'Desempenho & Estatísticas' : 'Analytics & Stats'}</span>
                  </button>

                  <button
                    onClick={() => { setCurrentView('cancelamentos'); setIsManagementDropdownOpen(false); }}
                    className="w-full text-left px-3.5 py-2 text-xs font-bold flex items-center gap-2.5 text-slate-800 hover:bg-cyan-50"
                  >
                    <AlertOctagon className="w-4 h-4 text-rose-600" />
                    <span>{isPt ? 'Ocorrências & Cancelamentos' : 'Incidents & Aborts'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Primary Action Button: + REGISTAR MANOBRA (Desktop/Tablet) */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <PWAInstallButton />

          <button
            onClick={() => setIsMobileHudOpen(true)}
            className="min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-cyan-400 hover:bg-black font-mono font-bold text-xs border border-cyan-800/40 transition-colors shadow-sm"
            title="Painel Piloto a Bordo"
          >
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>{isPt ? 'HUD a Bordo' : 'Boarding HUD'}</span>
          </button>

          <button
            onClick={onOpenNewManeuverModal}
            className="min-h-[38px] px-4 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-black text-xs sm:text-sm tracking-wide border-2 border-slate-950 flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{isPt ? 'NOVO REGISTO DE MANOBRA' : 'NEW MANEUVER RECORD'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
