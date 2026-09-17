import React, { useState, useMemo, useEffect } from 'react';
import { 
  Waves, 
  Clock, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus, 
  Download, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Compass, 
  Anchor, 
  Sliders, 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight,
  Info,
  Maximize2,
  Table as TableIcon,
  TrendingUp,
  FileSpreadsheet,
  CalendarRange,
  CalendarDays,
  Filter,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { 
  BEIRA_PORT_METADATA, 
  BEIRA_TIDES_2026, 
  DayTidePrediction 
} from '../data/beiraTides2026';
import { 
  calculateDayTideSummary, 
  calculateMinuteTide, 
  calculateUKC, 
  exportMinuteTideToCSV, 
  minutesToTime, 
  timeToMinutes,
  getDaysInMonth,
  getFutureTidesList,
  exportFutureTidesToCSV,
  FutureDayTideOverview,
  MinuteTideData
} from '../utils/tideCalculation';
import { useMaritime } from '../context/MaritimeContext';

export const TideCalculatorView: React.FC = () => {
  const { weather } = useMaritime();

  // Navigation tab: 'calculator' (Minute by Minute curve + UKC) vs 'future_search' (Search & Horizon Planner)
  const [activeTab, setActiveTab] = useState<'calculator' | 'future_search'>('calculator');

  // Selected date state - Defaults dynamically to today's date
  const now = useMemo(() => new Date(), []);
  const [selectedYear, setSelectedYear] = useState<number>(() => now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(() => now.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number>(() => now.getDate());
  const [selectedMinute, setSelectedMinute] = useState<number>(() => {
    return (now.getHours() * 60) + now.getMinutes();
  });

  // Real-time animation / tick
  const [isLiveClock, setIsLiveClock] = useState<boolean>(false);

  // Table filter state
  const [hourFilter, setHourFilter] = useState<string>('all');
  const [minuteSearch, setMinuteSearch] = useState<string>('');
  
  // UKC parameters
  const [chartDepth, setChartDepth] = useState<number>(6.5); // meters (e.g. Macuti channel or Berth)
  const [vesselDraft, setVesselDraft] = useState<number>(9.8); // meters
  const [squatMargin, setSquatMargin] = useState<number>(0.3); // meters

  // Future Search & Horizon Planner state
  const [futureHorizonDays, setFutureHorizonDays] = useState<number>(30);
  const [futureMinHWFilter, setFutureMinHWFilter] = useState<number>(0);
  const [futureTypeFilter, setFutureTypeFilter] = useState<'all' | 'vivas' | 'mortas'>('all');
  const [futureSearchQuery, setFutureSearchQuery] = useState<string>('');

  // Days in selected month
  const maxDaysInMonth = useMemo(() => {
    return getDaysInMonth(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  // Ensure day is valid when month/year changes
  useEffect(() => {
    if (selectedDay > maxDaysInMonth) {
      setSelectedDay(maxDaysInMonth);
    }
  }, [selectedYear, selectedMonth, maxDaysInMonth, selectedDay]);

  // Live timer tick
  useEffect(() => {
    if (!isLiveClock) return;
    const interval = setInterval(() => {
      setSelectedMinute(prev => (prev + 1) % 1440);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLiveClock]);

  // Calculate day summary (1440 minutes + extrema + range)
  const daySummary = useMemo(() => {
    return calculateDayTideSummary(selectedYear, selectedMonth, selectedDay);
  }, [selectedYear, selectedMonth, selectedDay]);

  // Current active minute prediction
  const currentMinuteData: MinuteTideData = useMemo(() => {
    return calculateMinuteTide(selectedYear, selectedMonth, selectedDay, selectedMinute);
  }, [selectedYear, selectedMonth, selectedDay, selectedMinute]);

  // UKC calculation for current active minute
  const ukcResult = useMemo(() => {
    return calculateUKC(chartDepth, currentMinuteData.height, vesselDraft, squatMargin);
  }, [chartDepth, currentMinuteData.height, vesselDraft, squatMargin]);

  // Filtered minute records for the table
  const displayedMinutes = useMemo(() => {
    return daySummary.minutePoints.filter(m => {
      if (minuteSearch.trim()) {
        const query = minuteSearch.trim().toLowerCase();
        if (!m.time.includes(query) && !m.height.toFixed(2).includes(query)) {
          return false;
        }
      }
      if (hourFilter !== 'all') {
        const hour = Math.floor(m.minuteOfDay / 60);
        if (hour !== Number(hourFilter)) {
          return false;
        }
      }
      return true;
    });
  }, [daySummary.minutePoints, minuteSearch, hourFilter]);

  // Export CSV handler
  const handleExportCSV = () => {
    const csvContent = exportMinuteTideToCSV(daySummary);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MARE_BEIRA_${selectedYear}_${selectedMonth.toString().padStart(2, '0')}_${selectedDay.toString().padStart(2, '0')}_MINUTO_A_MINUTO.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // List of available months
  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  // Available Years
  const availableYears = [2025, 2026, 2027, 2028, 2029, 2030];

  // Helper to format ISO date string YYYY-MM-DD
  const currentDateStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`;

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const parts = e.target.value.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      setSelectedYear(parts[0]);
      setSelectedMonth(parts[1]);
      setSelectedDay(parts[2]);
    }
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth() + 1);
    setSelectedDay(today.getDate());
    setSelectedMinute(today.getHours() * 60 + today.getMinutes());
  };

  const handleJumpDays = (daysOffset: number) => {
    const current = new Date(selectedYear, selectedMonth - 1, selectedDay);
    const target = new Date(current.getTime() + daysOffset * 86400000);
    setSelectedYear(target.getFullYear());
    setSelectedMonth(target.getMonth() + 1);
    setSelectedDay(target.getDate());
  };

  // Check if viewing today
  const isViewingToday = useMemo(() => {
    const today = new Date();
    return today.getFullYear() === selectedYear &&
           (today.getMonth() + 1) === selectedMonth &&
           today.getDate() === selectedDay;
  }, [selectedYear, selectedMonth, selectedDay]);

  // Days offset from today
  const daysOffsetFromToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(selectedYear, selectedMonth - 1, selectedDay);
    target.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / 86400000);
  }, [selectedYear, selectedMonth, selectedDay]);

  // Future tides data for the horizon planner
  const futureTidesList = useMemo(() => {
    const start = new Date(selectedYear, selectedMonth - 1, selectedDay);
    return getFutureTidesList(start, futureHorizonDays);
  }, [selectedYear, selectedMonth, selectedDay, futureHorizonDays]);

  const filteredFutureTides = useMemo(() => {
    return futureTidesList.filter(item => {
      if (futureTypeFilter === 'vivas' && !item.tideType.includes('Vivas')) return false;
      if (futureTypeFilter === 'mortas' && !item.tideType.includes('Mortas')) return false;
      if (futureMinHWFilter > 0) {
        const hasHW = item.extrema.some(e => e.type === 'HW' && e.height >= futureMinHWFilter);
        if (!hasHW) return false;
      }
      if (futureSearchQuery.trim()) {
        const q = futureSearchQuery.toLowerCase();
        const match = item.dateStr.includes(q) ||
                      item.dayOfWeek.toLowerCase().includes(q) ||
                      item.tideType.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [futureTidesList, futureTypeFilter, futureMinHWFilter, futureSearchQuery]);

  const handleExportFutureCSV = () => {
    const csvContent = exportFutureTidesToCSV(filteredFutureTides);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PREVISAO_MARES_FUTURAS_BEIRA_${selectedYear}_${selectedMonth}_${selectedDay}_${futureHorizonDays}DIAS.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectFutureDayInGraph = (dayItem: FutureDayTideOverview) => {
    setSelectedYear(dayItem.year);
    setSelectedMonth(dayItem.month);
    setSelectedDay(dayItem.day);
    setActiveTab('calculator');
    const firstHW = dayItem.extrema.find(e => e.type === 'HW');
    if (firstHW) {
      setSelectedMinute(timeToMinutes(firstHW.time));
    }
  };

  // SVG Chart Geometry Constants
  const svgWidth = 1000;
  const svgHeight = 260;
  const paddingX = 50;
  const paddingY = 35;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingY * 2;

  // Height scale: from 0m to 7.2m (covering all Beira heights)
  const minPlotHeight = 0;
  const maxPlotHeight = 7.2;

  const getY = (h: number) => {
    const normalized = (h - minPlotHeight) / (maxPlotHeight - minPlotHeight);
    return svgHeight - paddingY - normalized * plotHeight;
  };

  const getX = (minute: number) => {
    return paddingX + (minute / 1440) * plotWidth;
  };

  // Build SVG Path
  const svgPath = useMemo(() => {
    if (!daySummary.minutePoints.length) return '';
    return daySummary.minutePoints.reduce((acc, pt, idx) => {
      const x = getX(pt.minuteOfDay);
      const y = getY(pt.height);
      return idx === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }, '');
  }, [daySummary]);

  // Build filled area under curve
  const svgAreaPath = useMemo(() => {
    if (!svgPath) return '';
    const startX = getX(0);
    const endX = getX(1440);
    const bottomY = getY(0);
    return `${svgPath} L ${endX.toFixed(1)} ${bottomY.toFixed(1)} L ${startX.toFixed(1)} ${bottomY.toFixed(1)} Z`;
  }, [svgPath]);

  // Click on chart to jump to minute
  const handleChartClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const svgRelativeX = (clickX / rect.width) * svgWidth;
    if (svgRelativeX < paddingX || svgRelativeX > svgWidth - paddingX) return;
    const minute = Math.round(((svgRelativeX - paddingX) / plotWidth) * 1440);
    setSelectedMinute(Math.max(0, Math.min(1439, minute)));
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Nautical Citation */}
      <div className="bg-white border-2 border-black rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-900 text-white rounded-lg border border-black shadow">
                <Waves className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight flex items-center gap-2">
                  Tábua de Marés do Porto da Beira
                  <span className="text-xs font-bold uppercase bg-cyan-400 text-black px-2 py-0.5 rounded border border-black">
                    Minuto a Minuto
                  </span>
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  {BEIRA_PORT_METADATA.portName} ({BEIRA_PORT_METADATA.country}) · {BEIRA_PORT_METADATA.coordinates} · Fuso {BEIRA_PORT_METADATA.timeZone}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Info Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-800">
              Datum: <strong className="text-black">{BEIRA_PORT_METADATA.datum}</strong>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-black hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-lg text-xs border border-black shadow transition-all active:scale-95"
              title="Descarregar todos os 1.440 minutos do dia em formato CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Exportar Minuto a Minuto (CSV)</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation: Minute Curve vs Future Date Search */}
        <div className="mt-5 border-t-2 border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border-2 border-black">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-black transition-all ${
                activeTab === 'calculator'
                  ? 'bg-blue-900 text-white shadow'
                  : 'text-slate-700 hover:text-black hover:bg-white/60'
              }`}
            >
              <Waves className="w-4 h-4" />
              <span>Curva Minuto a Minuto & UKC</span>
            </button>
            <button
              onClick={() => setActiveTab('future_search')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-black transition-all ${
                activeTab === 'future_search'
                  ? 'bg-blue-900 text-white shadow'
                  : 'text-slate-700 hover:text-black hover:bg-white/60'
              }`}
            >
              <CalendarRange className="w-4 h-4 text-cyan-300" />
              <span>Pesquisa de Datas Futuras</span>
              <span className="text-[10px] bg-cyan-400 text-black px-1.5 py-0.2 rounded font-bold uppercase">
                Agenda
              </span>
            </button>
          </div>

          {/* Current Date Status Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            {isViewingToday ? (
              <div className="flex items-center gap-1.5 bg-emerald-100 border border-emerald-400 text-emerald-900 px-3 py-1.5 rounded-lg text-xs font-black">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
                <span>AO VIVO · Hoje ({selectedDay.toString().padStart(2, '0')}/{selectedMonth.toString().padStart(2, '0')}/{selectedYear})</span>
              </div>
            ) : daysOffsetFromToday > 0 ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-blue-100 border border-blue-400 text-blue-950 px-3 py-1.5 rounded-lg text-xs font-black">
                  <CalendarDays className="w-3.5 h-3.5 text-blue-900" />
                  <span>Data Futura: +{daysOffsetFromToday} {daysOffsetFromToday === 1 ? 'dia' : 'dias'} à frente ({selectedDay.toString().padStart(2, '0')}/{selectedMonth.toString().padStart(2, '0')}/{selectedYear})</span>
                </div>
                <button
                  onClick={handleJumpToToday}
                  className="bg-black hover:bg-slate-800 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg border border-black transition-all"
                  title="Voltar para a maré de hoje"
                >
                  Voltar a Hoje
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-400 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-black">
                  <Clock className="w-3.5 h-3.5 text-slate-600" />
                  <span>Histórico ({Math.abs(daysOffsetFromToday)} dias atrás)</span>
                </div>
                <button
                  onClick={handleJumpToToday}
                  className="bg-black hover:bg-slate-800 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg border border-black transition-all"
                  title="Voltar para a maré de hoje"
                >
                  Voltar a Hoje
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Unified Dynamic Date Selector Strip */}
        <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Quick Date Input (Direct calendar picker) */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-900" />
              <span>Data Calendário</span>
            </label>
            <input
              type="date"
              value={currentDateStr}
              onChange={handleDateInputChange}
              className="w-full bg-white border-2 border-black rounded-lg px-3 py-2 text-sm font-bold text-black focus:ring-2 focus:ring-blue-900"
            />
          </div>

          {/* Year Selector */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
              Ano
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full bg-white border-2 border-black rounded-lg px-3 py-2 text-sm font-bold text-black focus:ring-2 focus:ring-blue-900"
            >
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
              Mês
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full bg-white border-2 border-black rounded-lg px-3 py-2 text-sm font-bold text-black focus:ring-2 focus:ring-blue-900"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Day Selector */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
              Dia (1 a {maxDaysInMonth})
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleJumpDays(-1)}
                className="p-2 border-2 border-black rounded-lg bg-white hover:bg-slate-100"
                title="Dia anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(Number(e.target.value))}
                className="flex-1 bg-white border-2 border-black rounded-lg px-3 py-2 text-sm font-bold text-black focus:ring-2 focus:ring-blue-900"
              >
                {Array.from({ length: maxDaysInMonth }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>
                    Dia {d.toString().padStart(2, '0')} ({daySummary.day === d ? daySummary.dayOfWeek : ''})
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleJumpDays(1)}
                className="p-2 border-2 border-black rounded-lg bg-white hover:bg-slate-100"
                title="Dia seguinte"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
              Atalhos Rápidos
            </label>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={handleJumpToToday}
                className="py-2 px-1 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-black uppercase tracking-wider border border-black shadow text-center"
                title="Hoje"
              >
                Hoje
              </button>
              <button
                onClick={() => handleJumpDays(1)}
                className="py-2 px-1 bg-white hover:bg-slate-100 text-black rounded-lg text-xs font-black uppercase tracking-wider border-2 border-black text-center"
                title="Amanhã"
              >
                +1d
              </button>
              <button
                onClick={() => handleJumpDays(7)}
                className="py-2 px-1 bg-white hover:bg-slate-100 text-black rounded-lg text-xs font-black uppercase tracking-wider border-2 border-black text-center"
                title="+7 Dias"
              >
                +7d
              </button>
            </div>
          </div>
        </div>

        {/* Day Regime Characteristics Strip */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-600">Regime deste dia:</span>
            <span className={`px-2.5 py-1 rounded-md font-black border ${
              daySummary.tideType.includes('Vivas')
                ? 'bg-blue-100 text-blue-900 border-blue-300'
                : daySummary.tideType.includes('Mortas')
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-slate-100 text-slate-800 border-slate-300'
            }`}>
              {daySummary.tideType}
            </span>
            <span className="bg-slate-900 text-cyan-300 px-2.5 py-1 rounded-md font-mono font-bold">
              Amplitude Δ: {daySummary.rangeMeters.toFixed(2)}m (Max: {daySummary.maxHeight.toFixed(2)}m / Min: {daySummary.minHeight.toFixed(2)}m)
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Info className="w-3.5 h-3.5 text-blue-900" />
            <span>Dados astronómicos contínuos calculados automaticamente para qualquer data</span>
          </div>
        </div>
      </div>

      {/* Main Content: Either Minute-by-Minute Calculator or Future Dates Search Planner */}
      {activeTab === 'calculator' ? (
        <>
          {/* Main Interactive Minute Gauge & Extrema Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Minute-by-Minute Realtime Calculator Gauge (2 Cols) */}
        <div className="lg:col-span-2 bg-white border-2 border-black rounded-xl p-5 shadow-sm space-y-5">
          
          <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-900" />
              <span className="text-sm font-black text-black uppercase tracking-wider">
                Leitura Instantânea de Minuto a Minuto
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLiveClock(!isLiveClock)}
                className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 border transition-all ${
                  isLiveClock 
                    ? 'bg-emerald-500 text-white border-black animate-pulse' 
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:border-black'
                }`}
                title="Avançar automaticamente de minuto a minuto"
              >
                {isLiveClock ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isLiveClock ? 'Simulação em Tempo Real' : 'Simulação Pausada'}</span>
              </button>
            </div>
          </div>

          {/* Massive Display: Time & Height */}
          <div className="bg-slate-900 text-white rounded-xl p-5 border-2 border-black shadow-inner flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            
            {/* Height Display */}
            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-widest text-cyan-400">
                ALTURA CALCULADA DA MARÉ (ZH)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tight">
                  {currentMinuteData.height.toFixed(2)}
                </span>
                <span className="text-2xl font-black text-cyan-300">metros</span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1.5">
                <span>Cota sobre o Zero Hidrográfico de Beira</span>
              </p>
            </div>

            {/* Selected Minute & Trend Status */}
            <div className="sm:text-right space-y-2">
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400">Horário Selecionado</span>
                <div className="text-3xl sm:text-4xl font-black font-mono text-cyan-400 tracking-wider">
                  {currentMinuteData.time}
                  <span className="text-xs font-normal text-slate-400 ml-1.5">h</span>
                </div>
              </div>

              {/* Trend Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold text-xs bg-slate-800 border-slate-700">
                {currentMinuteData.trend === 'enchente' && (
                  <>
                    <ArrowUpRight className="w-4 h-4 text-emerald-400 stroke-[3]" />
                    <span className="text-emerald-400">Enchente (A Subir)</span>
                  </>
                )}
                {currentMinuteData.trend === 'vazante' && (
                  <>
                    <ArrowDownRight className="w-4 h-4 text-amber-400 stroke-[3]" />
                    <span className="text-amber-400">Vazante (A Descer)</span>
                  </>
                )}
                {currentMinuteData.trend.startsWith('estofo') && (
                  <>
                    <Minus className="w-4 h-4 text-cyan-400 stroke-[3]" />
                    <span className="text-cyan-400">{currentMinuteData.trendLabel}</span>
                  </>
                )}
                <span className="text-slate-400 font-mono text-[11px] ml-1">
                  ({currentMinuteData.rateCmMin > 0 ? '+' : ''}{currentMinuteData.rateCmMin.toFixed(1)} cm/min)
                </span>
              </div>
            </div>

          </div>

          {/* Interactive Minute Slider (00:00 to 23:59) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>00:00 (Início do Dia)</span>
              <span className="text-blue-900 font-black bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Minuto {selectedMinute} de 1.440 ({currentMinuteData.time})
              </span>
              <span>23:59 (Fim do Dia)</span>
            </div>

            <input
              type="range"
              min="0"
              max="1439"
              step="1"
              value={selectedMinute}
              onChange={(e) => setSelectedMinute(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-900 border border-slate-400"
            />

            {/* Quick Step Buttons */}
            <div className="flex items-center justify-between gap-1 flex-wrap pt-1">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedMinute(prev => Math.max(0, prev - 60))}
                  className="px-2 py-1 bg-white border border-black rounded text-[11px] font-bold hover:bg-slate-100"
                >
                  -1 Hora
                </button>
                <button
                  onClick={() => setSelectedMinute(prev => Math.max(0, prev - 10))}
                  className="px-2 py-1 bg-white border border-black rounded text-[11px] font-bold hover:bg-slate-100"
                >
                  -10 Min
                </button>
                <button
                  onClick={() => setSelectedMinute(prev => Math.max(0, prev - 1))}
                  className="px-2 py-1 bg-white border border-black rounded text-[11px] font-bold hover:bg-slate-100"
                >
                  -1 Min
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedMinute(prev => Math.min(1439, prev + 1))}
                  className="px-2 py-1 bg-white border border-black rounded text-[11px] font-bold hover:bg-slate-100"
                >
                  +1 Min
                </button>
                <button
                  onClick={() => setSelectedMinute(prev => Math.min(1439, prev + 10))}
                  className="px-2 py-1 bg-white border border-black rounded text-[11px] font-bold hover:bg-slate-100"
                >
                  +10 Min
                </button>
                <button
                  onClick={() => setSelectedMinute(prev => Math.min(1439, prev + 60))}
                  className="px-2 py-1 bg-white border border-black rounded text-[11px] font-bold hover:bg-slate-100"
                >
                  +1 Hora
                </button>
              </div>
            </div>
          </div>

          {/* Surrounding Extrema Transition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-500">Último Extremo Atingido</span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">
                  {currentMinuteData.previousExtreme.type === 'HW' ? 'Preamar (Alta)' : 'Baixa-mar (Baixa)'}
                </span>
                <span className="font-mono font-bold text-blue-900">
                  {currentMinuteData.previousExtreme.time} · {currentMinuteData.previousExtreme.height.toFixed(1)}m
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-500">Próximo Extremo Previsto</span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">
                  {currentMinuteData.nextExtreme.type === 'HW' ? 'Preamar (Alta)' : 'Baixa-mar (Baixa)'}
                </span>
                <span className="font-mono font-bold text-blue-900">
                  {currentMinuteData.nextExtreme.time} · {currentMinuteData.nextExtreme.height.toFixed(1)}m
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right: Official Extrema of the Day from Document + UKC Card */}
        <div className="space-y-6">
          
          {/* Extrema from Document */}
          <div className="bg-white border-2 border-black rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-2.5">
              <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <TableIcon className="w-4 h-4 text-blue-900" />
                Preamar & Baixa-mar ({selectedYear === 2026 && selectedMonth >= 9 ? 'Doc. Oficial' : 'Harmónica Calibrada'})
              </h3>
              <span className="text-[10px] font-bold text-slate-500">
                Dia {selectedDay}/{selectedMonth}/{selectedYear}
              </span>
            </div>

            <div className="space-y-2">
              {daySummary.extrema.map((ext, idx) => {
                const isHW = ext.type === 'HW';
                const extMinute = timeToMinutes(ext.time);
                const isCurrent = Math.abs(selectedMinute - extMinute) <= 15;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedMinute(extMinute)}
                    className={`p-2.5 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-blue-900 text-white border-black shadow'
                        : isHW
                        ? 'bg-blue-50 border-blue-200 hover:border-black text-black'
                        : 'bg-amber-50 border-amber-200 hover:border-black text-black'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded flex items-center justify-center font-black text-xs ${
                        isHW ? 'bg-blue-800 text-white' : 'bg-amber-500 text-black'
                      }`}>
                        {isHW ? 'PM' : 'BM'}
                      </span>
                      <div>
                        <div className="font-bold text-xs">
                          {isHW ? 'Preamar (Preia-mar)' : 'Baixa-mar'}
                        </div>
                        <div className={`text-[10px] ${isCurrent ? 'text-blue-200' : 'text-slate-500'}`}>
                          {ext.time} horas
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black font-mono">
                        {ext.height.toFixed(1)}m
                      </div>
                      <div className="text-[10px] font-bold opacity-75">
                        Clique p/ saltar
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>Amplitude do dia:</span>
              <strong className="text-black font-mono">{daySummary.rangeMeters.toFixed(2)} metros</strong>
            </div>
          </div>

          {/* Real-time Under-Keel Clearance (UKC) Calculator */}
          <div className="bg-white border-2 border-black rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-2">
              <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <Anchor className="w-4 h-4 text-blue-900" />
                Cálculo de Folga Sob a Quilha (UKC)
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-700 font-semibold">Prof. Carta (Canal/Berço):</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="25"
                    value={chartDepth}
                    onChange={(e) => setChartDepth(Number(e.target.value))}
                    className="w-16 bg-white border border-black rounded px-1.5 py-0.5 font-bold font-mono text-right"
                  />
                  <span className="font-bold">m</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-700 font-semibold">Calado do Navio:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="22"
                    value={vesselDraft}
                    onChange={(e) => setVesselDraft(Number(e.target.value))}
                    className="w-16 bg-white border border-black rounded px-1.5 py-0.5 font-bold font-mono text-right"
                  />
                  <span className="font-bold">m</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-700 font-semibold">Margem Squat / Dinâmica:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="2"
                    value={squatMargin}
                    onChange={(e) => setSquatMargin(Number(e.target.value))}
                    className="w-16 bg-white border border-black rounded px-1.5 py-0.5 font-bold font-mono text-right"
                  />
                  <span className="font-bold">m</span>
                </div>
              </div>
            </div>

            {/* UKC Dynamic Result */}
            <div className={`p-3 rounded-lg border-2 text-xs space-y-1 ${
              ukcResult.isSafe 
                ? 'bg-emerald-50 border-emerald-500 text-emerald-950' 
                : 'bg-rose-50 border-rose-500 text-rose-950'
            }`}>
              <div className="flex items-center justify-between font-black">
                <span>Profundidade Total de Água:</span>
                <span className="font-mono text-sm">{ukcResult.totalWaterDepth.toFixed(2)}m</span>
              </div>
              <div className="flex items-center justify-between font-black">
                <span>Folga Líquida (Net UKC):</span>
                <span className="font-mono text-base">{ukcResult.netUKC.toFixed(2)}m</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold pt-1 text-[11px]">
                {ukcResult.isSafe ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{ukcResult.statusMessage}</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 24-Hour Continuous Hydrographic Tide Wave (SVG Chart) */}
      <div className="bg-white border-2 border-black rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-black uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-900" />
              Curva Harmónica Contínua das 24 Horas (00:00 às 23:59)
            </h3>
            <p className="text-xs text-slate-500">
              Clique em qualquer ponto da curva para calcular instantaneamente a altura da maré desse minuto
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-900 inline-block"></span> Preamar (HW)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> Baixa-mar (LW)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span> Minuto Ativo
            </span>
          </div>
        </div>

        {/* SVG Container */}
        <div className="w-full overflow-x-auto bg-slate-950 rounded-xl p-2 border border-black shadow-inner">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-w-[650px] cursor-crosshair select-none"
            onClick={handleChartClick}
          >
            {/* Background Grid Lines for Heights (1m, 2m, 3m, 4m, 5m, 6m, 7m) */}
            {[1, 2, 3, 4, 5, 6, 7].map(h => {
              const y = getY(h);
              return (
                <g key={h}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="#334155"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 4}
                    fill="#94a3b8"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="end"
                    fontFamily="monospace"
                  >
                    {h.toFixed(1)}m
                  </text>
                </g>
              );
            })}

            {/* Time Grid Lines (every 3 hours: 00h, 03h, 06h, 09h, 12h, 15h, 18h, 21h, 24h) */}
            {[0, 3, 6, 9, 12, 15, 18, 21, 24].map(h => {
              const minute = Math.min(1439, h * 60);
              const x = getX(minute);
              return (
                <g key={h}>
                  <line
                    x1={x}
                    y1={paddingY}
                    x2={x}
                    y2={svgHeight - paddingY}
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={svgHeight - paddingY + 18}
                    fill="#94a3b8"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {h.toString().padStart(2, '0')}:00
                  </text>
                </g>
              );
            })}

            {/* Filled water area gradient */}
            <defs>
              <linearGradient id="tideGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            <path
              d={svgAreaPath}
              fill="url(#tideGradient)"
            />

            {/* Harmonic Tide Wave Line */}
            <path
              d={svgPath}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Official Extrema Marker Pins */}
            {daySummary.extrema.map((ext, idx) => {
              const m = timeToMinutes(ext.time);
              const x = getX(m);
              const y = getY(ext.height);
              const isHW = ext.type === 'HW';

              return (
                <g key={idx}>
                  {/* Vertical dashed line */}
                  <line
                    x1={x}
                    y1={y}
                    x2={x}
                    y2={svgHeight - paddingY}
                    stroke={isHW ? '#38bdf8' : '#f59e0b'}
                    strokeDasharray="2 2"
                    strokeWidth="1"
                    opacity="0.6"
                  />
                  {/* Dot */}
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    fill={isHW ? '#0284c7' : '#f59e0b'}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  {/* Badge */}
                  <rect
                    x={x - 30}
                    y={isHW ? y - 26 : y + 8}
                    width="60"
                    height="18"
                    rx="4"
                    fill={isHW ? '#0369a1' : '#b45309'}
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={isHW ? y - 13 : y + 21}
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {ext.time} ({ext.height.toFixed(1)}m)
                  </text>
                </g>
              );
            })}

            {/* Current Selected Minute Scrub Indicator */}
            {(() => {
              const curX = getX(selectedMinute);
              const curY = getY(currentMinuteData.height);
              return (
                <g>
                  {/* Full height scrub line */}
                  <line
                    x1={curX}
                    y1={paddingY}
                    x2={curX}
                    y2={svgHeight - paddingY}
                    stroke="#f43f5e"
                    strokeWidth="2"
                  />
                  {/* Current point target */}
                  <circle
                    cx={curX}
                    cy={curY}
                    r="6"
                    fill="#f43f5e"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                  />
                  {/* Floating tooltip badge */}
                  <rect
                    x={Math.max(paddingX, Math.min(svgWidth - paddingX - 90, curX - 45))}
                    y={paddingY - 5}
                    width="90"
                    height="22"
                    rx="5"
                    fill="#f43f5e"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <text
                    x={Math.max(paddingX + 45, Math.min(svgWidth - paddingX - 45, curX))}
                    y={paddingY + 11}
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="900"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {currentMinuteData.time} · {currentMinuteData.height.toFixed(2)}m
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>
      </div>

      {/* Complete Minute-by-Minute Searchable Table (1,440 Minutes) */}
      <div className="bg-white border-2 border-black rounded-xl p-5 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-black text-black uppercase tracking-wider flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-blue-900" />
              Tabela Completa de Minuto em Minuto (00:00 a 23:59)
            </h3>
            <p className="text-xs text-slate-500">
              Total de 1.440 pontos calculados com interpolação contínua harmónica oficial
            </p>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Minute */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={minuteSearch}
                onChange={(e) => setMinuteSearch(e.target.value)}
                placeholder="Pesquisar hora (ex: 14:30)..."
                className="pl-8 pr-3 py-1.5 bg-white border border-black rounded-lg text-xs font-bold w-48 focus:ring-2 focus:ring-blue-900"
              />
            </div>

            {/* Hour Filter */}
            <select
              value={hourFilter}
              onChange={(e) => setHourFilter(e.target.value)}
              className="bg-white border border-black rounded-lg px-2.5 py-1.5 text-xs font-bold text-black"
            >
              <option value="all">Todas as Horas (24h)</option>
              {Array.from({ length: 24 }, (_, i) => i).map(h => (
                <option key={h} value={h.toString()}>
                  Hora {h.toString().padStart(2, '0')}:00 - {h.toString().padStart(2, '0')}:59
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scrollable Table View */}
        <div className="max-h-96 overflow-y-auto border-2 border-black rounded-lg shadow-inner">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-blue-900 text-white font-black uppercase text-[11px] sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3 border-b border-black">Horário</th>
                <th className="py-2.5 px-3 border-b border-black">Altura da Maré</th>
                <th className="py-2.5 px-3 border-b border-black">Estado / Tendência</th>
                <th className="py-2.5 px-3 border-b border-black">Taxa (cm/min)</th>
                <th className="py-2.5 px-3 border-b border-black">Taxa Horária (m/h)</th>
                <th className="py-2.5 px-3 border-b border-black text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {displayedMinutes.map((row) => {
                const isSelected = row.minuteOfDay === selectedMinute;
                return (
                  <tr
                    key={row.minuteOfDay}
                    onClick={() => setSelectedMinute(row.minuteOfDay)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-950 text-white font-bold'
                        : row.isExtreme
                        ? 'bg-amber-50 font-bold hover:bg-amber-100 text-black'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    {/* Time */}
                    <td className="py-2 px-3 font-mono font-bold flex items-center gap-1.5">
                      {row.time}
                      {row.isExtreme && (
                        <span className={`text-[9px] px-1 py-0.2 rounded font-black uppercase ${
                          row.extremeType === 'HW' ? 'bg-blue-600 text-white' : 'bg-amber-500 text-black'
                        }`}>
                          {row.extremeType === 'HW' ? 'Preamar' : 'Baixa-mar'}
                        </span>
                      )}
                      {isSelected && (
                        <span className="text-[9px] bg-rose-500 text-white px-1 py-0.2 rounded font-black">
                          ATIVO
                        </span>
                      )}
                    </td>

                    {/* Tide Height */}
                    <td className="py-2 px-3 font-mono font-black text-sm">
                      <span className={isSelected ? 'text-cyan-300' : 'text-blue-900'}>
                        {row.height.toFixed(2)} m
                      </span>
                    </td>

                    {/* Trend */}
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center gap-1">
                        {row.trend === 'enchente' && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />}
                        {row.trend === 'vazante' && <ArrowDownRight className="w-3.5 h-3.5 text-amber-500" />}
                        {row.trend.startsWith('estofo') && <Minus className="w-3.5 h-3.5 text-cyan-400" />}
                        <span>{row.trendLabel}</span>
                      </span>
                    </td>

                    {/* Rate (cm/min) */}
                    <td className="py-2 px-3 font-mono">
                      {row.rateCmMin > 0 ? `+${row.rateCmMin.toFixed(1)}` : row.rateCmMin.toFixed(1)} cm/min
                    </td>

                    {/* Rate (m/h) */}
                    <td className="py-2 px-3 font-mono">
                      {row.rateMetersHour > 0 ? `+${row.rateMetersHour.toFixed(2)}` : row.rateMetersHour.toFixed(2)} m/h
                    </td>

                    {/* Action */}
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMinute(row.minuteOfDay);
                          navigator.clipboard?.writeText(`${row.time} - ${row.height.toFixed(2)}m (Porto da Beira)`);
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded font-bold border transition-colors ${
                          isSelected 
                            ? 'bg-white text-black border-white hover:bg-slate-200' 
                            : 'bg-slate-100 text-slate-800 border-slate-300 hover:border-black'
                        }`}
                        title="Copiar altura da maré"
                      >
                        Copiar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Mostrando {displayedMinutes.length} de 1.440 minutos calculados para o Porto da Beira</span>
          <button
            onClick={handleExportCSV}
            className="text-blue-900 font-bold hover:underline flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descarregar Tabela Completa (CSV)</span>
          </button>
        </div>
      </div>
      </>
    ) : (
      /* Tab 2: Future Dates Search & Nautical Horizon Planner */
      <div className="space-y-6">
        
        {/* Banner & Horizon Selection Card */}
        <div className="bg-white border-2 border-black rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b-2 border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-900 text-white rounded-lg border border-black shadow">
                <CalendarRange className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-black">
                  Pesquisa e Agenda de Marés Futuras
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  Planeamento operacional e previsão harmónica contínua para o Porto da Beira a partir de {selectedDay.toString().padStart(2, '0')}/{selectedMonth.toString().padStart(2, '0')}/{selectedYear}
                </p>
              </div>
            </div>

            <button
              onClick={handleExportFutureCSV}
              className="flex items-center gap-1.5 bg-black hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-lg text-xs border border-black shadow transition-all active:scale-95"
              title="Descarregar tabela de marés futuras em formato CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Exportar Agenda Futura ({futureHorizonDays} Dias)</span>
            </button>
          </div>

          {/* Horizon Selection Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 mr-1">
                Horizonte Temporal:
              </span>
              {[7, 14, 30, 60, 90].map(days => (
                <button
                  key={days}
                  onClick={() => setFutureHorizonDays(days)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all ${
                    futureHorizonDays === days
                      ? 'bg-blue-900 text-white border-black shadow'
                      : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                  }`}
                >
                  {days} Dias
                </button>
              ))}
            </div>

            <div className="text-xs font-bold text-slate-500">
              Período: {filteredFutureTides.length > 0 ? `${filteredFutureTides[0].dateStr} até ${filteredFutureTides[filteredFutureTides.length - 1].dateStr}` : '—'}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Filter by High Water (PM) */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-blue-900" />
                <span>Preamar Mínima (Janela Operacional)</span>
              </label>
              <select
                value={futureMinHWFilter}
                onChange={(e) => setFutureMinHWFilter(Number(e.target.value))}
                className="w-full bg-white border-2 border-black rounded-lg px-3 py-1.5 text-xs font-bold text-black focus:ring-2 focus:ring-blue-900"
              >
                <option value={0}>Todas as Alturas de Maré</option>
                <option value={5.0}>PM ≥ 5.0 metros (Operação Normal)</option>
                <option value={5.5}>PM ≥ 5.5 metros (Navios Médios/Grandes)</option>
                <option value={6.0}>PM ≥ 6.0 metros (Calado Crítico / PanMax)</option>
              </select>
            </div>

            {/* Filter by Tide Regime */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
                Regime Lunar / Tipo de Maré
              </label>
              <select
                value={futureTypeFilter}
                onChange={(e) => setFutureTypeFilter(e.target.value as 'all' | 'vivas' | 'mortas')}
                className="w-full bg-white border-2 border-black rounded-lg px-3 py-1.5 text-xs font-bold text-black focus:ring-2 focus:ring-blue-900"
              >
                <option value="all">Todos os Regimes (Vivas, Mortas e Médias)</option>
                <option value="vivas">Apenas Marés Vivas (Spring Tides)</option>
                <option value="mortas">Apenas Marés Mortas (Neap Tides)</option>
              </select>
            </div>

            {/* Free Search */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
                <Search className="w-3 h-3 text-blue-900" />
                <span>Pesquisar por Dia ou Data</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Segunda, 2027, 15..."
                value={futureSearchQuery}
                onChange={(e) => setFutureSearchQuery(e.target.value)}
                className="w-full bg-white border-2 border-black rounded-lg px-3 py-1.5 text-xs font-bold text-black placeholder:text-slate-400 focus:ring-2 focus:ring-blue-900"
              />
            </div>
          </div>
        </div>

        {/* Statistical KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border-2 border-black rounded-xl p-3 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Dias Encontrados</span>
            <div className="text-2xl font-black text-black font-mono mt-1">
              {filteredFutureTides.length}
              <span className="text-xs font-normal text-slate-500 ml-1">dias</span>
            </div>
          </div>

          <div className="bg-white border-2 border-black rounded-xl p-3 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-900">Marés Vivas (Spring)</span>
            <div className="text-2xl font-black text-blue-900 font-mono mt-1">
              {filteredFutureTides.filter(t => t.tideType.includes('Vivas')).length}
              <span className="text-xs font-normal text-slate-500 ml-1">dias</span>
            </div>
          </div>

          <div className="bg-white border-2 border-black rounded-xl p-3 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">Marés Mortas (Neap)</span>
            <div className="text-2xl font-black text-amber-700 font-mono mt-1">
              {filteredFutureTides.filter(t => t.tideType.includes('Mortas')).length}
              <span className="text-xs font-normal text-slate-500 ml-1">dias</span>
            </div>
          </div>

          <div className="bg-white border-2 border-black rounded-xl p-3 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Maior Preamar (Pico)</span>
            <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
              {filteredFutureTides.length > 0 
                ? `${Math.max(...filteredFutureTides.map(t => t.maxHeight)).toFixed(2)}m`
                : '—'}
            </div>
          </div>
        </div>

        {/* Future Days List */}
        {filteredFutureTides.length === 0 ? (
          <div className="bg-white border-2 border-black rounded-xl p-10 text-center space-y-3 shadow-sm">
            <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-black text-black">Nenhum dia encontrado para estes filtros</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Nenhuma data no horizonte de {futureHorizonDays} dias atende aos critérios selecionados. Tente reduzir o limite de preamar ou remover a pesquisa.
            </p>
            <button
              onClick={() => {
                setFutureMinHWFilter(0);
                setFutureTypeFilter('all');
                setFutureSearchQuery('');
              }}
              className="px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-bold border border-black"
            >
              Redefinir Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFutureTides.map((dayItem) => {
              const isToday = dayItem.year === now.getFullYear() &&
                              dayItem.month === (now.getMonth() + 1) &&
                              dayItem.day === now.getDate();
              const isSelected = dayItem.year === selectedYear &&
                                 dayItem.month === selectedMonth &&
                                 dayItem.day === selectedDay;

              const isSpring = dayItem.tideType.includes('Vivas');
              const isNeap = dayItem.tideType.includes('Mortas');

              return (
                <div
                  key={dayItem.dateStr}
                  className={`bg-white border-2 rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-3 transition-all ${
                    isSelected 
                      ? 'border-blue-900 ring-2 ring-blue-900 bg-blue-50/20' 
                      : 'border-black hover:border-blue-900 hover:shadow-md'
                  }`}
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-base text-black">
                          {dayItem.day.toString().padStart(2, '0')}/{dayItem.month.toString().padStart(2, '0')}/{dayItem.year}
                        </span>
                        <span className="text-xs font-bold text-slate-600">
                          ({dayItem.dayOfWeek})
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {isToday && (
                          <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
                            Hoje
                          </span>
                        )}
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                          isSpring 
                            ? 'bg-blue-100 text-blue-900 border-blue-300' 
                            : isNeap 
                            ? 'bg-amber-100 text-amber-900 border-amber-300' 
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}>
                          {dayItem.tideType}
                        </span>
                      </div>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Amplitude Δ: <strong className="text-black">{dayItem.rangeMeters.toFixed(2)}m</strong></span>
                      <span>Min: {dayItem.minHeight.toFixed(2)}m · Max: {dayItem.maxHeight.toFixed(2)}m</span>
                    </div>
                  </div>

                  {/* Extrema Details */}
                  <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 space-y-1.5">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Eventos de Maré (ZH)
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {dayItem.extrema.map((ext, idx) => (
                        <div
                          key={idx}
                          className={`p-1.5 rounded flex items-center justify-between text-xs font-mono font-bold ${
                            ext.type === 'HW'
                              ? 'bg-blue-100/70 text-blue-950 border border-blue-200'
                              : 'bg-amber-100/70 text-amber-950 border border-amber-200'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            {ext.type === 'HW' ? (
                              <ArrowUpRight className="w-3 h-3 text-blue-900 stroke-[3]" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3 text-amber-700 stroke-[3]" />
                            )}
                            <span className="text-[10px] uppercase">{ext.type}</span>
                            <span>{ext.time}</span>
                          </div>
                          <span className="font-black">{ext.height.toFixed(1)}m</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button: Jump to Calculator */}
                  <button
                    onClick={() => handleSelectFutureDayInGraph(dayItem)}
                    className="w-full py-2 px-3 bg-black hover:bg-blue-900 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow"
                  >
                    <span>Abrir Curva Minuto a Minuto</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    )}

    </div>
  );
};
