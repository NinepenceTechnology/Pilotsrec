import React from 'react';
import { 
  BarChart3, 
  Clock, 
  TrendingUp, 
  Ship, 
  Anchor, 
  Award, 
  Zap, 
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { useMaritime } from '../context/MaritimeContext';
import { formatVesselType, formatManeuverType } from '../utils/formatters';

export const PerformanceView: React.FC = () => {
  const { maneuvers, vessels } = useMaritime();

  const completed = maneuvers.filter(m => m.status === 'concluida');
  const validDurations = completed.filter(m => m.durationMinutes && m.durationMinutes > 0);

  // Overall average
  const globalAvgDuration = validDurations.length > 0 
    ? Math.round(validDurations.reduce((acc, cur) => acc + (cur.durationMinutes || 0), 0) / validDurations.length)
    : 75;

  // Breakdown by Vessel Type
  const statsByType = [
    { type: 'porta_conteiner', label: 'Porta-Contêiner', avgTime: 65, targetTime: 70, maneuvers: 18, efficiency: 94 },
    { type: 'petroleiro', label: 'Petroleiro', avgTime: 92, targetTime: 90, maneuvers: 12, efficiency: 88 },
    { type: 'graneleiro', label: 'Graneleiro (Bulk)', avgTime: 80, targetTime: 85, maneuvers: 15, efficiency: 91 },
    { type: 'gasoso_gnl_glp', label: 'Metaneiro (GNL)', avgTime: 105, targetTime: 100, maneuvers: 6, efficiency: 86 },
    { type: 'ro_ro_veiculos', label: 'Ro-Ro', avgTime: 50, targetTime: 55, maneuvers: 9, efficiency: 96 },
    { type: 'passageiros_cruzeiro', label: 'Cruzeiro', avgTime: 45, targetTime: 50, maneuvers: 8, efficiency: 98 }
  ];

  // Breakdown by Maritime Agent
  const statsByAgent = [
    { agent: 'MSC Mediterranean Shipping', count: 18, avgTime: 64, punctuality: 98 },
    { agent: 'Wilson Sons Agência', count: 14, avgTime: 78, punctuality: 92 },
    { agent: 'LBH Maritime Logistics', count: 11, avgTime: 88, punctuality: 94 },
    { agent: 'Grimaldi Agency Port', count: 9, avgTime: 52, punctuality: 96 },
    { agent: 'Oceanica Marine Agency', count: 7, avgTime: 102, punctuality: 90 }
  ];

  // Tugboat assistance metrics
  const totalTugHours = maneuvers.reduce((acc, cur) => {
    return acc + cur.tugs.reduce((tAcc, t) => tAcc + (t.hoursAssisted || 0), 0);
  }, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            Análise de Desempenho & Cronometragem
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Estatísticas de tempo de manobra, eficiência por tipo de navio, agente marítimo e emprego de rebocadores
          </p>
        </div>
      </div>

      {/* Highlights Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Tempo Médio Geral</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {globalAvgDuration} <span className="text-sm font-normal text-slate-400">min</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            -4 min vs mês anterior
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Índice de Pontualidade</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            96.2%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Embarque dentro da janela da maré
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Horas Totais de Rebocador</span>
            <Anchor className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {totalTugHours.toFixed(1)} <span className="text-sm font-normal text-slate-400">h</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Média de 1.8h por assistência
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Taxa de Segurança</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            99.8%
          </div>
          <p className="text-[11px] text-cyan-400 font-medium mt-1">
            Zero incidentes graves no período
          </p>
        </div>
      </div>

      {/* Grid: By Vessel Type & By Agent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Performance by Vessel Type */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Ship className="w-4 h-4 text-cyan-400" />
              Tempo Médio & Eficiência por Tipo de Navio
            </h3>
            <span className="text-[11px] text-slate-400">Meta Portuária</span>
          </div>

          <div className="space-y-4">
            {statsByType.map((item) => (
              <div key={item.type} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{item.label}</span>
                    <span className="text-slate-500">({item.maneuvers} manobras)</span>
                  </div>
                  <div className="font-mono">
                    <span className="font-bold text-cyan-400">{item.avgTime} min</span>
                    <span className="text-slate-500 text-[11px] ml-1.5">Meta: {item.targetTime}m</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.avgTime <= item.targetTime ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, item.efficiency)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance by Maritime Agency */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" />
              Desempenho por Agência Marítima
            </h3>
            <span className="text-[11px] text-slate-400">Pontualidade & Agilidade</span>
          </div>

          <div className="divide-y divide-slate-800">
            {statsByAgent.map((agent) => (
              <div key={agent.agent} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-white">{agent.agent}</h4>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {agent.count} escalas atendidas no mês
                  </div>
                </div>

                <div className="text-right flex items-center gap-4">
                  <div>
                    <div className="text-[10px] text-slate-500">Tempo Médio</div>
                    <div className="font-mono font-bold text-cyan-400">{agent.avgTime} min</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Pontualidade</div>
                    <div className="font-mono font-bold text-emerald-400">{agent.punctuality}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Operational Milestone Time Breakdown Chart Summary */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          Distribuição Cronológica Típica de uma Manobra Portuária (Benchmark)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block">Lancha → A Bordo</span>
            <span className="text-lg font-black text-cyan-400 font-mono">15-20 min</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Navegação na barra</span>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block">MPX & Briefing</span>
            <span className="text-lg font-black text-white font-mono">10 min</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Troca de dados c/ Comte</span>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block">Conectar Rebocadores</span>
            <span className="text-lg font-black text-white font-mono">12-15 min</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Passar cabos proa/popa</span>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block">Evolução & Encosto</span>
            <span className="text-lg font-black text-cyan-400 font-mono">25-35 min</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Giro e aproximação cais</span>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block">Amarrar & Encapelar</span>
            <span className="text-lg font-black text-emerald-400 font-mono">15-20 min</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Cabos retesados e seguro</span>
          </div>
        </div>
      </div>
    </div>
  );
};
