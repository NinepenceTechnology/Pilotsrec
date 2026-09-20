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
  LayoutDashboard,
  MessageSquare
} from 'lucide-react';
import { useMaritime, AppView } from '../context/MaritimeContext';
import { PWAInstallButton } from './PWAInstallButton';
import { VersionUpdateButton } from './VersionUpdateButton';

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
    t,
    isOnline,
    setIsChatOpen,
    unreadChatCount
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
    <header className="bg-white border-b-2 border-slate-900 sticky top-0 z-40 shadow-sm text-slate-900">
      
      {/* Top Telemetry & Pilot Status Ribbon - Deep Naval Blue */}
      <div className="bg-slate-950 text-white px-3 sm:px-4 py-1.5 text-xs flex items-center justify-between gap-2.5 border-b border-cyan-900/40">
        <div className="flex items-center gap-2.5 sm:gap-3.5 flex-wrap text-xs">
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
            className="flex items-center gap-1 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800 text-xs transition-colors cursor-pointer font-mono"
            title={isPt ? 'Tábua de Marés e Cálculos UKC' : 'Tide Table & UKC Calculation'}
          >
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span>Maré: <strong>{weather.tideHeightMeters}m</strong></span>
          </button>
        </div>

        {/* Right Corner: Chat Local, Idioma, Perfil e Reset */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Chat Local 24 Horas entre Usuários */}
          <button
            id="top-chat-button"
            onClick={() => setIsChatOpen(true)}
            className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 active:scale-95 text-cyan-300 border border-cyan-700/80 text-xs font-mono font-bold transition-all cursor-pointer select-none"
            title={isPt ? 'Chat Marítimo Local (24 Horas)' : 'Local Maritime Chat (24h)'}
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{isPt ? 'Chat Local' : 'Chat'}</span>
            {unreadChatCount > 0 && (
              <span className="bg-emerald-500 text-slate-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-sm">
                {unreadChatCount}
              </span>
            )}
          </button>

          {/* Top-Right Language Switcher Button (PT <-> EN) */}
          <button
            id="top-language-switcher"
            onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 active:scale-95 text-cyan-300 border border-cyan-500/80 font-mono font-bold text-xs transition-all cursor-pointer select-none"
            title={language === 'pt' ? 'Switch to English' : 'Mudar para Português'}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-black text-white text-xs">{language === 'pt' ? '🇵🇹 PT' : '🇬🇧 EN'}</span>
          </button>

          {/* Botão Discreto de Versão e Atualização */}
          <VersionUpdateButton />

          {/* Active Logged-in Pilot Profile */}
          {currentUser ? (
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-2 py-1 rounded border border-cyan-700/60 text-xs transition-colors cursor-pointer"
              title={isPt ? 'Perfil do Piloto' : 'Pilot Profile'}
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold text-white max-w-[100px] sm:max-w-[140px] truncate">
                {currentUser.name}
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

          <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono">
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
            title={isPt ? 'Reiniciar registos' : 'Reset system'}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Navigation Bar - Compact, Responsive and Clean */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 sm:gap-3">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center justify-between">
          <div 
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2 cursor-pointer group select-none"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-950 border-2 border-slate-900 flex items-center justify-center text-white shadow-xs group-hover:border-cyan-500 transition-colors shrink-0">
              <Anchor className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base sm:text-lg tracking-tight text-slate-950 font-sans">
                PILOT'S RECORDS
              </span>
              <span className="text-[9px] bg-slate-950 text-cyan-400 px-1.5 py-0.2 rounded font-mono font-black tracking-wider uppercase border border-cyan-900/60">
                PRO
              </span>
            </div>
          </div>

          {/* Mobile Right Actions */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={() => setIsChatOpen(true)}
              className="relative p-1.5 rounded-lg bg-slate-900 text-cyan-400 border border-cyan-800"
              title="Chat Local 24h"
            >
              <MessageSquare className="w-4 h-4" />
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 font-black text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {unreadChatCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMobileHudOpen(true)}
              className="p-1.5 rounded-lg bg-slate-900 text-cyan-400 border border-cyan-800"
              title="HUD a Bordo"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenNewManeuverModal}
              className="px-2.5 py-1.5 rounded-lg bg-blue-900 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>{isPt ? 'Registo' : 'Record'}</span>
            </button>
          </div>
        </div>

        {/* Primary Navigation Buttons (Clean, Compact, Height 36px) */}
        <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 -mx-1 px-1">
          {/* Tela Inicial / Dashboard */}
          <button
            id="nav-dashboard"
            onClick={() => setCurrentView('dashboard')}
            className={`h-8 px-2.5 rounded-md font-bold text-xs flex items-center gap-1.5 border whitespace-nowrap transition-all shrink-0 cursor-pointer touch-manipulation active:scale-95 ${
              currentView === 'dashboard'
                ? 'bg-slate-950 text-cyan-400 border-slate-950 shadow-xs ring-1 ring-cyan-500/40'
                : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
            <span>{isPt ? 'Início' : 'Home'}</span>
          </button>

          {/* 1. OPERAÇÕES */}
          <button
            id="nav-operacoes"
            onClick={() => setCurrentView('operacoes')}
            className={`h-8 px-2.5 rounded-md font-bold text-xs flex items-center gap-1.5 border whitespace-nowrap transition-all shrink-0 cursor-pointer touch-manipulation active:scale-95 ${
              currentView === 'operacoes'
                ? 'bg-slate-950 text-white border-slate-950 shadow-xs ring-1 ring-blue-500/50'
                : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{isPt ? 'Operações' : 'Operations'}</span>
            {activeCount > 0 && (
              <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {activeCount}
              </span>
            )}
          </button>

          {/* 2. SAÚDE & FADIGA */}
          <button
            id="nav-saude"
            onClick={() => setCurrentView('saude')}
            className={`h-8 px-2.5 rounded-md font-bold text-xs flex items-center gap-1.5 border whitespace-nowrap transition-all shrink-0 cursor-pointer touch-manipulation active:scale-95 ${
              currentView === 'saude'
                ? 'bg-slate-950 text-rose-300 border-slate-950 shadow-xs ring-1 ring-rose-500/50'
                : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 hover:bg-slate-100'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>{isPt ? 'Saúde' : 'Health'}</span>
          </button>

          {/* 3. ALERTA */}
          <button
            id="nav-alertas"
            onClick={() => setCurrentView('alertas')}
            className={`h-8 px-2.5 rounded-md font-bold text-xs flex items-center gap-1.5 border whitespace-nowrap transition-all shrink-0 cursor-pointer touch-manipulation active:scale-95 ${
              currentView === 'alertas'
                ? 'bg-slate-950 text-amber-300 border-slate-950 shadow-xs ring-1 ring-amber-500/50'
                : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 hover:bg-slate-100'
            }`}
          >
            <Bell className={`w-3.5 h-3.5 shrink-0 ${activeAlertsCount > 0 ? 'text-amber-500 animate-bounce' : 'text-amber-500'}`} />
            <span>{isPt ? 'Alertas' : 'Alerts'}</span>
            {activeAlertsCount > 0 && (
              <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                {activeAlertsCount}
              </span>
            )}
          </button>

          {/* 4. DOCUMENTOS */}
          <button
            id="nav-documentos"
            onClick={() => setCurrentView('relatorios')}
            className={`h-8 px-2.5 rounded-md font-bold text-xs flex items-center gap-1.5 border whitespace-nowrap transition-all shrink-0 cursor-pointer touch-manipulation active:scale-95 ${
              currentView === 'relatorios'
                ? 'bg-slate-950 text-emerald-300 border-slate-950 shadow-xs ring-1 ring-emerald-500/50'
                : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{isPt ? 'Documentos' : 'Documents'}</span>
          </button>

          {/* 5. MARÉS E CÁLCULOS */}
          <button
            id="nav-mares"
            onClick={() => setCurrentView('mares')}
            className={`h-8 px-2.5 rounded-md font-bold text-xs flex items-center gap-1.5 border whitespace-nowrap transition-all shrink-0 cursor-pointer touch-manipulation active:scale-95 ${
              currentView === 'mares'
                ? 'bg-slate-950 text-cyan-300 border-slate-950 shadow-xs ring-1 ring-cyan-500/50'
                : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 hover:bg-slate-100'
            }`}
          >
            <Waves className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
            <span>{isPt ? 'Marés' : 'Tides'}</span>
          </button>

          {/* 6. ARQUIVO */}
          <button
            id="nav-arquivo"
            onClick={() => setCurrentView('arquivo')}
            className={`h-8 px-2.5 rounded-md font-bold text-xs flex items-center gap-1.5 border whitespace-nowrap transition-all shrink-0 cursor-pointer touch-manipulation active:scale-95 ${
              currentView === 'arquivo'
                ? 'bg-slate-950 text-purple-300 border-slate-950 shadow-xs ring-1 ring-purple-500/50'
                : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 hover:bg-slate-100'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>{isPt ? 'Arquivo' : 'Archive'}</span>
          </button>

          {/* Dropdown: Módulos Adicionais de Apoio */}
          <div ref={dropdownRef} className="relative shrink-0">
            <button
              id="nav-extra-modules"
              onClick={() => setIsManagementDropdownOpen(prev => !prev)}
              className={`h-8 px-2 rounded-md font-bold text-xs flex items-center gap-1 border transition-all cursor-pointer touch-manipulation active:scale-95 ${
                isGroupActive
                  ? 'bg-slate-950 text-cyan-300 border-slate-950'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
              title={isPt ? 'Mais Módulos' : 'More Modules'}
            >
              <span>+</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isManagementDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isManagementDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-800 rounded-xl shadow-xl py-1 z-50 divide-y divide-slate-100">
                <div className="px-3 py-1 bg-slate-50 text-[10px] font-mono font-bold uppercase text-slate-500">
                  {isPt ? 'Módulos' : 'Modules'}
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { setCurrentView('pilotos'); setIsManagementDropdownOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center gap-2 text-slate-800 hover:bg-cyan-50"
                  >
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isPt ? 'Pilotos & Escalas' : 'Pilots & Rosters'}</span>
                  </button>

                  <button
                    onClick={() => { setCurrentView('seguranca'); setIsManagementDropdownOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center gap-2 text-slate-800 hover:bg-cyan-50"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isPt ? 'Segurança & SOLAS' : 'Safety & SOLAS'}</span>
                  </button>

                  <button
                    onClick={() => { setCurrentView('performance'); setIsManagementDropdownOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center gap-2 text-slate-800 hover:bg-cyan-50"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
                    <span>{isPt ? 'Estatísticas' : 'Analytics'}</span>
                  </button>

                  <button
                    onClick={() => { setCurrentView('cancelamentos'); setIsManagementDropdownOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center gap-2 text-slate-800 hover:bg-cyan-50"
                  >
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                    <span>{isPt ? 'Ocorrências' : 'Incidents'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Primary Action Button: + NOVO REGISTO (Desktop/Tablet) */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <PWAInstallButton className="text-xs px-2.5 py-1.5" />

          <button
            onClick={() => setIsMobileHudOpen(true)}
            className="h-8 flex items-center gap-1.5 px-2.5 rounded-md bg-slate-900 text-cyan-400 hover:bg-black font-mono font-bold text-xs border border-cyan-800/40 transition-colors shadow-xs"
            title="Painel HUD a Bordo"
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span>HUD</span>
          </button>

          <button
            onClick={onOpenNewManeuverModal}
            className="h-8 px-3 rounded-md bg-blue-900 hover:bg-blue-800 text-white font-black text-xs tracking-wide border border-slate-950 flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>{isPt ? 'NOVO REGISTO' : 'NEW RECORD'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
