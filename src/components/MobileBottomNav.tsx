import React from 'react';
import { 
  LayoutDashboard,
  BookOpen, 
  Heart,
  Bell,
  Waves, 
  FolderArchive,
  Plus
} from 'lucide-react';
import { useMaritime } from '../context/MaritimeContext';

interface MobileBottomNavProps {
  onOpenNewManeuver: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenNewManeuver }) => {
  const { currentView, setCurrentView, alerts, language, t } = useMaritime();
  const isPt = language === 'pt';
  const activeAlertsCount = alerts.filter(a => a.isActive).length;

  return (
    <nav 
      aria-label="Navegação Móvel"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-cyan-900/50 px-2 py-1.5 shadow-2xl flex items-center justify-around safe-area-bottom text-white"
    >
      {/* 1. Início / Dashboard */}
      <button
        id="mobile-nav-dashboard"
        onClick={() => setCurrentView('dashboard')}
        className={`flex flex-col items-center justify-center p-1 rounded-lg min-w-[50px] transition-colors cursor-pointer touch-manipulation active:scale-95 ${
          currentView === 'dashboard'
            ? 'text-cyan-400 font-black'
            : 'text-slate-400 hover:text-white font-medium'
        }`}
      >
        <LayoutDashboard className={`w-5 h-5 ${currentView === 'dashboard' ? 'stroke-[2.5]' : ''}`} />
        <span className="text-[9px] mt-0.5 tracking-tight font-mono">{isPt ? 'Início' : 'Home'}</span>
      </button>

      {/* 2. Registo de Operação */}
      <button
        id="mobile-nav-operacoes"
        onClick={() => setCurrentView('operacoes')}
        className={`flex flex-col items-center justify-center p-1 rounded-lg min-w-[50px] transition-colors cursor-pointer touch-manipulation active:scale-95 ${
          currentView === 'operacoes'
            ? 'text-cyan-400 font-black'
            : 'text-slate-400 hover:text-white font-medium'
        }`}
      >
        <BookOpen className={`w-5 h-5 ${currentView === 'operacoes' ? 'stroke-[2.5]' : ''}`} />
        <span className="text-[9px] mt-0.5 tracking-tight font-mono">{isPt ? 'Operação' : 'Ops'}</span>
      </button>

      {/* 3. Botão Central: + Novo Registo */}
      <button
        id="mobile-nav-new-maneuver"
        onClick={onOpenNewManeuver}
        className="flex flex-col items-center justify-center -mt-5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 w-12 h-12 rounded-full border-2 border-slate-900 shadow-xl active:scale-90 transition-transform cursor-pointer touch-manipulation"
        title="Novo Registo de Manobra"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
      </button>

      {/* 4. Saúde */}
      <button
        id="mobile-nav-saude"
        onClick={() => setCurrentView('saude')}
        className={`flex flex-col items-center justify-center p-1 rounded-lg min-w-[50px] transition-colors cursor-pointer touch-manipulation active:scale-95 ${
          currentView === 'saude'
            ? 'text-rose-400 font-black'
            : 'text-slate-400 hover:text-white font-medium'
        }`}
        title="Saúde & Prontidão do Piloto"
      >
        <Heart className={`w-5 h-5 ${currentView === 'saude' ? 'stroke-[2.5]' : ''}`} />
        <span className="text-[9px] mt-0.5 tracking-tight font-mono">{isPt ? 'Saúde' : 'Health'}</span>
      </button>

      {/* 5. Alertas ou Arquivo */}
      <button
        id="mobile-nav-arquivo"
        onClick={() => setCurrentView('arquivo')}
        className={`flex flex-col items-center justify-center p-1 rounded-lg min-w-[50px] transition-colors cursor-pointer touch-manipulation active:scale-95 ${
          currentView === 'arquivo'
            ? 'text-purple-400 font-black'
            : 'text-slate-400 hover:text-white font-medium'
        }`}
        title="Arquivo & Excel"
      >
        <FolderArchive className={`w-5 h-5 ${currentView === 'arquivo' ? 'stroke-[2.5]' : ''}`} />
        <span className="text-[9px] mt-0.5 tracking-tight font-mono">{isPt ? 'Arquivo' : 'Archive'}</span>
      </button>
    </nav>
  );
};
