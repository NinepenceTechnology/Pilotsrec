import React from 'react';
import { 
  BookOpen, 
  Heart, 
  Bell, 
  FileSpreadsheet, 
  Waves, 
  FolderArchive, 
  Plus, 
  Anchor, 
  Ship, 
  Activity, 
  ArrowRight, 
  ShieldCheck, 
  Compass, 
  Radio, 
  Wind, 
  Clock,
  ChevronRight,
  Database,
  FileCheck
} from 'lucide-react';
import { useMaritime } from '../context/MaritimeContext';
import { formatManeuverStatus, formatManeuverType } from '../utils/formatters';

interface DashboardViewProps {
  onOpenNewManeuverModal: () => void;
  onViewManeuverDetail: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  onOpenNewManeuverModal, 
  onViewManeuverDetail 
}) => {
  const { 
    maneuvers, 
    vessels, 
    pilots, 
    weather, 
    alerts, 
    setCurrentView,
    activePilotId,
    language,
    t
  } = useMaritime();

  const isPt = language === 'pt';

  const activeManeuvers = maneuvers.filter(m => m.status === 'em_curso');
  const scheduledManeuvers = maneuvers.filter(m => m.status === 'programada');
  const activeAlertsCount = alerts.filter(a => a.isActive).length;
  const activePilot = pilots.find(p => p.id === activePilotId) || pilots[0];

  // 6 Primary Navigation Buttons defined strictly by User Specification
  const MAIN_FUNCTION_BUTTONS = [
    {
      id: 'modulo-operacoes',
      title: isPt ? 'REGISTO DE OPERAÇÃO' : 'OPERATIONS LOG',
      description: isPt 
        ? 'Abertura, acompanhamento de marcos (milestones) e encerramento de manobras' 
        : 'Open, track time milestones and close vessel pilotage maneuvers',
      icon: BookOpen,
      color: 'from-blue-900 to-indigo-950 text-cyan-300 border-blue-700/60',
      badge: activeManeuvers.length > 0 
        ? `${activeManeuvers.length} ${isPt ? 'Em Curso' : 'Underway'}` 
        : `${maneuvers.length} ${isPt ? 'Total' : 'Total'}`,
      badgeColor: activeManeuvers.length > 0 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      action: () => setCurrentView('operacoes')
    },
    {
      id: 'modulo-saude',
      title: isPt ? 'SAÚDE & GESTÃO DE FADIGA' : 'HEALTH & FATIGUE',
      description: isPt 
        ? 'Fadiga calculada em função do trabalho do piloto, descanso STCW e prontidão' 
        : 'Fatigue calculated from pilot workload, STCW rest compliance and readiness',
      icon: Heart,
      color: 'from-rose-950 to-slate-950 text-rose-300 border-rose-800/60',
      badge: isPt ? 'FRMS STCW' : 'FRMS FIT',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      action: () => setCurrentView('saude')
    },
    {
      id: 'modulo-alertas',
      title: isPt ? 'ALERTAS PORTUÁRIOS' : 'PORT ALERTS',
      description: isPt 
        ? 'Alertas de assoreamento, avisos aos navegantes, vento forte e restrições de calado' 
        : 'Channel silting notices, navigators warnings, wind alarms and draft restrictions',
      icon: Bell,
      color: 'from-amber-950 to-slate-950 text-amber-300 border-amber-800/60',
      badge: activeAlertsCount > 0 
        ? `${activeAlertsCount} ${isPt ? 'Ativos' : 'Active'}` 
        : (isPt ? 'Normal' : 'Normal'),
      badgeColor: activeAlertsCount > 0 ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      action: () => setCurrentView('alertas')
    },
    {
      id: 'modulo-documentos',
      title: isPt ? 'DOCUMENTOS & RELATÓRIOS' : 'DOCUMENTS & CERTIFICATES',
      description: isPt 
        ? 'Folhas oficiais de manobra, certificados para a capitania e relatórios em Excel' 
        : 'Official maneuver certificates, harbor master sign-offs and Excel reports',
      icon: FileSpreadsheet,
      color: 'from-emerald-950 to-slate-950 text-emerald-300 border-emerald-800/60',
      badge: isPt ? 'Certificados .XLSX' : 'Certificates .XLSX',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      action: () => setCurrentView('relatorios')
    },
    {
      id: 'modulo-mares',
      title: isPt ? 'MARÉS E CÁLCULOS' : 'TIDES & CALCULATIONS',
      description: isPt 
        ? 'Cálculo de maré minuto a minuto, janela de calado e folga sob a quilha (UKC)' 
        : 'Minute-by-minute tide solver, tidal draft window and under-keel clearance (UKC)',
      icon: Waves,
      color: 'from-cyan-950 to-slate-950 text-cyan-300 border-cyan-800/60',
      badge: `${weather.tideHeightMeters}m (${weather.tideState})`,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      action: () => setCurrentView('mares')
    },
    {
      id: 'modulo-arquivo',
      title: isPt ? 'ARQUIVO & EXCEL' : 'ARCHIVE & EXCEL',
      description: isPt 
        ? 'Importação e exportação em Excel (.xlsx) de dados dos navios e backup integral' 
        : 'Import & export Excel (.xlsx) spreadsheets of registered vessels and full database',
      icon: FolderArchive,
      color: 'from-purple-950 to-slate-950 text-purple-300 border-purple-800/60',
      badge: `${vessels.length} ${isPt ? 'Navios' : 'Vessels'}`,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      action: () => setCurrentView('arquivo')
    }
  ];

  return (
    <div className="space-y-6 pb-10">
      
      {/* Futuristic Tactical Command HUD */}
      <div className="bg-slate-950 border-2 border-cyan-900/50 rounded-xl p-4 sm:p-5 shadow-xl relative overflow-hidden text-white">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-700/60 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                TACTICAL COMMAND HUD &bull; PILOTAGE CORE
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                PORT OF BEIRA &bull; MOZAMBIQUE
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Anchor className="w-6 h-6 text-cyan-400" />
              <span>PILOT'S RECORDS &bull; SISTEMA DE PILOTAGEM</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenNewManeuverModal}
              className="h-8 px-3 rounded-md bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-black text-xs tracking-wide border border-cyan-300 flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{isPt ? 'NOVA MANOBRA' : 'NEW MANEUVER'}</span>
            </button>
          </div>
        </div>

        {/* Real-time telemetry strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 mt-4 pt-4 border-t border-slate-800/80 text-xs font-mono">
          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">CANAL DE ACESSO</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {isPt ? 'OPERACIONAL' : 'OPEN & CLEAR'}
            </span>
            <span className="text-[9px] text-slate-500 block truncate">Draga Macuti ativa</span>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">MARÉ LIVE BEIRA</span>
            <span className="text-cyan-300 font-bold flex items-center gap-1 mt-0.5 text-xs">
              <Waves className="w-3 h-3 text-cyan-400" />
              {weather.tideHeightMeters}m ({weather.tideState})
            </span>
            <span className="text-[9px] text-slate-500 block truncate">Zero Hidrográfico</span>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">VENTO & VTS</span>
            <span className="text-white font-bold flex items-center gap-1 mt-0.5 text-xs">
              <Wind className="w-3 h-3 text-cyan-400" />
              {weather.windSpeedKnots} kts ({weather.windDirection})
            </span>
            <span className="text-[9px] text-slate-500 block truncate">VHF Ch 12 / 16</span>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">PILOTO EM TURNO</span>
            <span className="text-cyan-400 font-bold block truncate mt-0.5 text-xs">
              {activePilot?.name || 'Piloto Escalado'}
            </span>
            <span className="text-[9px] text-slate-500 block truncate">{activePilot?.category || 'Sênior'}</span>
          </div>
        </div>

        {/* Quick Tactical Action Buttons Row */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-800/60 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-mono text-slate-400 uppercase mr-1 shrink-0">ATALHOS:</span>
          <button
            onClick={() => setCurrentView('mares')}
            className="h-6 px-2 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-900/60 text-[10px] font-mono font-medium flex items-center gap-1 shrink-0 transition-all active:scale-95 cursor-pointer"
          >
            <Waves className="w-2.5 h-2.5 text-cyan-400" />
            <span>Tábua de Marés</span>
          </button>
          <button
            onClick={() => setCurrentView('pilotos')}
            className="h-6 px-2 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-900/60 text-[10px] font-mono font-medium flex items-center gap-1 shrink-0 transition-all active:scale-95 cursor-pointer"
          >
            <Compass className="w-2.5 h-2.5 text-cyan-400" />
            <span>Escala de Pilotos</span>
          </button>
          <button
            onClick={() => setCurrentView('alertas')}
            className="h-6 px-2 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-900/60 text-[10px] font-mono font-medium flex items-center gap-1 shrink-0 transition-all active:scale-95 cursor-pointer"
          >
            <Bell className="w-2.5 h-2.5 text-amber-400" />
            <span>Avisos ({activeAlertsCount})</span>
          </button>
          <button
            onClick={() => setCurrentView('cancelamentos')}
            className="h-6 px-2 rounded bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-900/60 text-[10px] font-mono font-medium flex items-center gap-1 shrink-0 transition-all active:scale-95 cursor-pointer"
          >
            <Activity className="w-2.5 h-2.5 text-rose-400" />
            <span>Ocorrências</span>
          </button>
        </div>
      </div>

      {/* 6 Primary Functional Buttons - Grid Layout */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-blue-900"></span>
            <span>{isPt ? 'Funções Principais de Pilotagem' : 'Primary Pilotage Functions'}</span>
          </h2>
          <span className="text-xs font-mono text-slate-500 font-bold">
            {isPt ? 'SELECIONE O MÓDULO OPERACIONAL' : 'SELECT OPERATIONAL MODULE'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {MAIN_FUNCTION_BUTTONS.map(btn => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.id}
                onClick={btn.action}
                className="group text-left bg-white border-2 border-slate-300 hover:border-slate-900 rounded-xl p-3.5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden active:scale-[0.99] cursor-pointer"
              >
                {/* Top Accent Strip */}
                <div className="flex items-center justify-between w-full mb-2.5">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${btn.color} border flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${btn.badgeColor}`}>
                    {btn.badge}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-900 transition-colors flex items-center justify-between">
                    <span>{btn.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans line-clamp-2">
                    {btn.description}
                  </p>
                </div>

                {/* Bottom Interactive Prompt */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 group-hover:text-black">
                  <span>{isPt ? 'ABRIR' : 'OPEN'}</span>
                  <span className="text-cyan-600 font-black">&rarr;</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Underway Maneuvers Operational Section */}
      <div className="bg-white border-2 border-slate-300 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <Ship className="w-4 h-4 text-blue-900" />
              <span>{isPt ? 'Manobras em Execução no Porto da Beira' : 'Active Port Pilotage Operations'}</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('operacoes')}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1"
            >
              <span>{isPt ? 'Livro Completo' : 'Full Log'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {activeManeuvers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeManeuvers.map(m => (
              <div 
                key={m.id}
                onClick={() => onViewManeuverDetail(m.id)}
                className="p-3 rounded-lg bg-blue-50/60 border border-blue-200 hover:border-blue-900 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <strong className="text-xs font-black text-slate-900">{m.vesselSnapshot.name}</strong>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                    EM CURSO
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-700">
                  <div>
                    <span className="text-[9px] text-slate-500 block">TIPO / LOCAL</span>
                    <span className="font-bold">{formatManeuverType(m.type)} &bull; Berço {m.berthNumber}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">PILOTO</span>
                    <span className="font-bold text-blue-900">{m.pilotName}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-blue-200/80 text-[10px] text-slate-600">
                  <span>LOA: {m.vesselSnapshot.loa}m &bull; Calado: {m.vesselSnapshot.draftAft}m</span>
                  <span className="font-bold text-blue-900 hover:underline flex items-center gap-0.5">
                    {isPt ? 'Ficha' : 'Sheet'} &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-300 space-y-2">
            <Anchor className="w-6 h-6 text-slate-400 mx-auto" />
            <div className="text-xs text-slate-600 font-medium">
              {isPt ? 'Nenhuma manobra em curso neste momento.' : 'No active maneuvers underway at this moment.'}
            </div>
            <button
              onClick={onOpenNewManeuverModal}
              className="px-3 py-1.5 rounded-md bg-blue-900 text-white text-xs font-bold hover:bg-black transition-colors"
            >
              {isPt ? '+ Nova Manobra' : '+ New Maneuver'}
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
