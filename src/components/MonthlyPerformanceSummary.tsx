import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Cell,
  Legend
} from 'recharts';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  Award, 
  Ship, 
  TrendingUp,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { useMaritime } from '../context/MaritimeContext';
import { ManeuverRecord, Pilot } from '../types/maritime';

interface MonthlyPerformanceSummaryProps {
  onSelectPilot?: (pilotName: string) => void;
  className?: string;
}

interface PilotPerformanceItem {
  pilotId: string;
  pilotName: string;
  displayName: string;
  totalManeuvers: number;
  completed: number;
  underway: number;
  scheduled: number;
  canceled: number;
  sharePercentage: number;
  rank: number;
}

const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MonthlyPerformanceSummary: React.FC<MonthlyPerformanceSummaryProps> = ({
  onSelectPilot,
  className = ''
}) => {
  const { maneuvers, pilots, language } = useMaritime();
  const isPt = language === 'pt';

  const monthNames = isPt ? MONTH_NAMES_PT : MONTH_NAMES_EN;

  // Find default month and year (either current or latest date in maneuvers)
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    if (maneuvers.length > 0) {
      const dates = maneuvers
        .map(m => new Date(m.maneuverDate || m.scheduledTime || m.createdAt))
        .filter(d => !isNaN(d.getTime()));
      if (dates.length > 0) {
        const latest = new Date(Math.max(...dates.map(d => d.getTime())));
        return latest.getFullYear();
      }
    }
    return today.getFullYear();
  });

  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    if (maneuvers.length > 0) {
      const dates = maneuvers
        .map(m => new Date(m.maneuverDate || m.scheduledTime || m.createdAt))
        .filter(d => !isNaN(d.getTime()));
      if (dates.length > 0) {
        const latest = new Date(Math.max(...dates.map(d => d.getTime())));
        return latest.getMonth();
      }
    }
    return today.getMonth();
  });

  const [statusFilter, setStatusFilter] = useState<'all' | 'completed'>('all');
  const [includeAllPilots, setIncludeAllPilots] = useState<boolean>(false);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  const handleCurrentMonth = () => {
    setSelectedMonth(today.getMonth());
    setSelectedYear(today.getFullYear());
  };

  // Helper to extract date from a maneuver
  const getManeuverDate = (m: ManeuverRecord): Date => {
    if (m.maneuverDate) {
      const d = new Date(m.maneuverDate + 'T00:00:00');
      if (!isNaN(d.getTime())) return d;
    }
    if (m.scheduledTime) {
      const d = new Date(m.scheduledTime);
      if (!isNaN(d.getTime())) return d;
    }
    const d = new Date(m.createdAt);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  // Filter maneuvers belonging to the selected month and year
  const monthManeuvers = useMemo(() => {
    return maneuvers.filter(m => {
      const d = getManeuverDate(m);
      const inMonth = d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
      if (!inMonth) return false;
      if (statusFilter === 'completed') {
        return m.status === 'concluida';
      }
      return true;
    });
  }, [maneuvers, selectedYear, selectedMonth, statusFilter]);

  // Aggregate maneuvers per pilot
  const pilotPerformanceData = useMemo<PilotPerformanceItem[]>(() => {
    const map = new Map<string, {
      pilotId: string;
      pilotName: string;
      totalManeuvers: number;
      completed: number;
      underway: number;
      scheduled: number;
      canceled: number;
    }>();

    // Optionally preload all known registered pilots
    if (includeAllPilots && pilots.length > 0) {
      pilots.forEach(p => {
        const cleanName = p.name.trim();
        if (cleanName) {
          map.set(cleanName.toLowerCase(), {
            pilotId: p.id,
            pilotName: cleanName,
            totalManeuvers: 0,
            completed: 0,
            underway: 0,
            scheduled: 0,
            canceled: 0
          });
        }
      });
    }

    // Process all maneuvers in the month
    monthManeuvers.forEach(m => {
      const rawName = m.pilotName?.trim() || 'Piloto Não Atribuído';
      const key = rawName.toLowerCase();

      if (!map.has(key)) {
        map.set(key, {
          pilotId: m.pilotId || key,
          pilotName: rawName,
          totalManeuvers: 0,
          completed: 0,
          underway: 0,
          scheduled: 0,
          canceled: 0
        });
      }

      const entry = map.get(key)!;
      entry.totalManeuvers += 1;
      if (m.status === 'concluida') entry.completed += 1;
      else if (m.status === 'em_curso') entry.underway += 1;
      else if (m.status === 'programada') entry.scheduled += 1;
      else if (m.status === 'cancelada') entry.canceled += 1;
    });

    const totalInPeriod = monthManeuvers.length;

    // Convert map to array and sort by total maneuvers descending
    const items = Array.from(map.values())
      .map(item => {
        // Create shortened display name (e.g. "C. Silva" or first + last)
        const parts = item.pilotName.split(' ').filter(Boolean);
        const displayName = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1]}` : item.pilotName;
        const sharePercentage = totalInPeriod > 0 
          ? Math.round((item.totalManeuvers / totalInPeriod) * 100) 
          : 0;

        return {
          ...item,
          displayName,
          sharePercentage,
          rank: 0
        };
      })
      .sort((a, b) => b.totalManeuvers - a.totalManeuvers);

    // Assign rank
    return items.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }, [monthManeuvers, pilots, includeAllPilots]);

  // Key metrics
  const totalManeuversCount = monthManeuvers.length;
  const completedManeuversCount = monthManeuvers.filter(m => m.status === 'concluida').length;
  const activePilotsInMonthCount = pilotPerformanceData.filter(p => p.totalManeuvers > 0).length;
  const topPilot = pilotPerformanceData.find(p => p.totalManeuvers > 0);
  const averageManeuversPerPilot = activePilotsInMonthCount > 0 
    ? (totalManeuversCount / activePilotsInMonthCount).toFixed(1) 
    : '0';

  // Palette for chart bars
  const PRIMARY_BAR_COLOR = '#0284c7'; // Sky-600
  const TOP_BAR_COLOR = '#1e3a8a';     // Blue-900
  const COMPLETED_COLOR = '#059669';   // Emerald-600

  // Custom chart tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as PilotPerformanceItem;
      return (
        <div className="bg-slate-900 border border-slate-700 text-white rounded-lg p-3 shadow-xl text-xs font-sans space-y-1.5 z-50">
          <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1.5">
            <span className="font-bold text-cyan-300 text-sm">{data.pilotName}</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold">
              #{data.rank}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-300 pt-0.5">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">{isPt ? 'Total' : 'Total'}</span>
              <strong className="text-white text-sm font-mono">{data.totalManeuvers}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">{isPt ? 'Concluídas' : 'Completed'}</span>
              <strong className="text-emerald-400 text-sm font-mono">{data.completed}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">{isPt ? 'Em Curso' : 'Underway'}</span>
              <strong className="text-amber-400 text-sm font-mono">{data.underway}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">{isPt ? 'Quota do Mês' : 'Month Share'}</span>
              <strong className="text-cyan-400 text-sm font-mono">{data.sharePercentage}%</strong>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white border-2 border-slate-300 rounded-xl p-4 sm:p-5 shadow-xs space-y-4 ${className}`}>
      
      {/* Header with Title and Month Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-900 text-cyan-300 flex items-center justify-center font-bold shadow-xs">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>{isPt ? 'Resumo de Desempenho Mensal' : 'Monthly Performance Summary'}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-900 font-mono font-bold border border-blue-200">
                  {monthNames[selectedMonth]} {selectedYear}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isPt 
                  ? 'Volume total de manobras realizadas por prático no mês selecionado'
                  : 'Total maneuvers performed per pilot during the selected month'}
              </p>
            </div>
          </div>
        </div>

        {/* Month Selector & Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center bg-slate-100 border border-slate-300 rounded-lg p-0.5 shadow-xs">
            <button
              onClick={handlePrevMonth}
              title={isPt ? 'Mês Anterior' : 'Previous Month'}
              className="p-1.5 rounded-md hover:bg-white text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="px-2.5 py-1 text-xs font-bold text-slate-900 font-mono min-w-[120px] text-center">
              {monthNames[selectedMonth]} {selectedYear}
            </div>

            <button
              onClick={handleNextMonth}
              title={isPt ? 'Próximo Mês' : 'Next Month'}
              className="p-1.5 rounded-md hover:bg-white text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleCurrentMonth}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            {isPt ? 'Mês Atual' : 'This Month'}
          </button>

          {/* Filter toggle */}
          <div className="inline-flex rounded-lg border border-slate-300 bg-slate-100 p-0.5 text-xs font-medium">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isPt ? 'Todas' : 'All'}
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                statusFilter === 'completed'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isPt ? 'Concluídas' : 'Completed'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {isPt ? 'Total Manobras' : 'Total Maneuvers'}
            </span>
            <Ship className="w-3.5 h-3.5 text-blue-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {totalManeuversCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {statusFilter === 'completed' ? (isPt ? 'concluídas' : 'completed') : (isPt ? 'registadas' : 'logged')}
            </span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {isPt ? 'Práticos em Ação' : 'Active Pilots'}
            </span>
            <Users className="w-3.5 h-3.5 text-indigo-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {activePilotsInMonthCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {isPt ? 'em operação' : 'engaged'}
            </span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {isPt ? 'Líder do Mês' : 'Month Leader'}
            </span>
            <Award className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="truncate">
            <span className="text-sm sm:text-base font-black text-slate-900 block truncate">
              {topPilot ? topPilot.pilotName : '—'}
            </span>
            <span className="text-xs text-slate-500 font-mono font-semibold">
              {topPilot ? `${topPilot.totalManeuvers} ${isPt ? 'manobras' : 'maneuvers'}` : (isPt ? 'Sem registos' : 'No logs')}
            </span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {isPt ? 'Média por Prático' : 'Avg / Pilot'}
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {averageManeuversPerPilot}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {isPt ? 'manobras/piloto' : 'maneuvers/pilot'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Bar Chart Section */}
      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-900"></span>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
              {isPt 
                ? `Gráfico de Manobras por Prático — ${monthNames[selectedMonth]} ${selectedYear}`
                : `Maneuvers per Pilot Chart — ${monthNames[selectedMonth]} ${selectedYear}`}
            </h4>
          </div>

          <span className="text-[11px] font-mono text-slate-500 font-bold">
            {isPt ? 'Eixo Y: Total de Manobras' : 'Y-Axis: Total Maneuvers'}
          </span>
        </div>

        {pilotPerformanceData.length > 0 && totalManeuversCount > 0 ? (
          <div className="w-full h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={pilotPerformanceData}
                margin={{ top: 15, right: 15, left: -10, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.6} />
                <XAxis 
                  dataKey="displayName" 
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                  stroke="#94a3b8"
                  height={50}
                />
                <YAxis 
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                  stroke="#94a3b8"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  align="right"
                  wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontWeight: 600 }}
                />
                <Bar 
                  dataKey="totalManeuvers" 
                  name={isPt ? 'Total de Manobras' : 'Total Maneuvers'}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={55}
                >
                  {pilotPerformanceData.map((entry, index) => (
                    <Cell 
                      key={`cell-${entry.pilotId}-${index}`} 
                      fill={index === 0 ? TOP_BAR_COLOR : PRIMARY_BAR_COLOR}
                      className="transition-all hover:opacity-85 cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12 px-4 space-y-2.5">
            <Ship className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700">
              {isPt 
                ? `Nenhuma manobra registada para ${monthNames[selectedMonth]} de ${selectedYear}.`
                : `No maneuvers recorded for ${monthNames[selectedMonth]} ${selectedYear}.`}
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {isPt 
                ? 'Navegue entre os meses utilizando as setas acima ou registe uma nova manobra para alimentar as métricas.'
                : 'Navigate between months using the arrows above or log a new maneuver to populate metrics.'}
            </p>
            <button
              onClick={handleCurrentMonth}
              className="mt-2 px-3 py-1.5 rounded-lg bg-blue-900 text-white text-xs font-bold hover:bg-slate-900 transition-colors cursor-pointer"
            >
              {isPt ? 'Voltar ao Mês Atual' : 'Back to Current Month'}
            </button>
          </div>
        )}
      </div>

      {/* Pilot Breakdown Table / Rank Cards */}
      {pilotPerformanceData.length > 0 && totalManeuversCount > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
              {isPt ? 'Classificação e Detalhes dos Práticos' : 'Pilot Rankings & Details'}
            </h4>
            <span className="text-[11px] font-mono text-slate-500">
              {pilotPerformanceData.length} {isPt ? 'práticos listados' : 'pilots listed'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {pilotPerformanceData.map(pilot => {
              const isFirst = pilot.rank === 1;
              const isSecond = pilot.rank === 2;
              const isThird = pilot.rank === 3;

              return (
                <div
                  key={pilot.pilotId || pilot.pilotName}
                  onClick={() => onSelectPilot && onSelectPilot(pilot.pilotName)}
                  className={`p-3 rounded-lg border transition-all ${
                    isFirst
                      ? 'bg-blue-50/70 border-blue-300 hover:border-blue-900'
                      : 'bg-white border-slate-200 hover:border-slate-400'
                  } ${onSelectPilot ? 'cursor-pointer hover:shadow-xs' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 truncate">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black font-mono ${
                        isFirst ? 'bg-amber-400 text-slate-950 shadow-xs' :
                        isSecond ? 'bg-slate-300 text-slate-900' :
                        isThird ? 'bg-amber-700 text-white' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {pilot.rank}
                      </span>
                      <strong className="text-xs font-black text-slate-900 truncate">
                        {pilot.pilotName}
                      </strong>
                    </div>

                    <span className="text-xs font-black font-mono text-blue-900 bg-blue-100/80 px-2 py-0.5 rounded">
                      {pilot.totalManeuvers} {isPt ? 'man.' : 'ops.'}
                    </span>
                  </div>

                  {/* Progress Bar of Monthly Share */}
                  <div className="space-y-1">
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isFirst ? 'bg-blue-900' : 'bg-sky-600'}`}
                        style={{ width: `${Math.max(pilot.sharePercentage, 3)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>{pilot.sharePercentage}% {isPt ? 'do total' : 'of total'}</span>
                      <span className="text-emerald-700 font-bold">
                        {pilot.completed} {isPt ? 'concluídas' : 'done'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
