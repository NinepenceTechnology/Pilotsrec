import React, { useState, useEffect, useMemo } from 'react';
import { 
  Heart, 
  Activity, 
  Moon, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  FileText, 
  Zap, 
  Calendar,
  BatteryCharging,
  Stethoscope,
  Users,
  AlertTriangle,
  Ship,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Sliders
} from 'lucide-react';
import { useMaritime } from '../context/MaritimeContext';
import { Pilot, ManeuverRecord } from '../types/maritime';

interface PilotFitnessRecord {
  id: string;
  pilotId: string;
  pilotName: string;
  timestamp: string;
  status: 'apto' | 'atencao' | 'inapto';
  sleepHours: number;
  restHours24h: number;
  bloodPressureSys: number;
  bloodPressureDia: number;
  heartRate: number;
  alcoholZeroConfirmed: boolean;
  calculatedFatigueIndex: number; // 0-100
  notes: string;
}

export const HealthView: React.FC = () => {
  const { pilots, activePilotId, maneuvers, language } = useMaritime();
  const isPt = language === 'pt';

  // Selected pilot for individual workload & fatigue analysis
  const [selectedPilotId, setSelectedPilotId] = useState<string>(activePilotId || pilots[0]?.id || 'pilot-1');

  // Interactive self-reported rest adjustment (which feeds into the calculation)
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [restHours24h, setRestHours24h] = useState<number>(11);
  const [bpSys, setBpSys] = useState<number>(120);
  const [bpDia, setBpDia] = useState<number>(80);
  const [heartRate, setHeartRate] = useState<number>(68);
  const [alcoholConfirmed, setAlcoholConfirmed] = useState<boolean>(true);
  const [pilotNotes, setPilotNotes] = useState<string>('');
  const [justCertified, setJustCertified] = useState<boolean>(false);

  // Local storage persistence for fitness certification records
  const [history, setHistory] = useState<PilotFitnessRecord[]>(() => {
    try {
      const saved = localStorage.getItem('pilots_records_health_logs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'HLTH-2026-001',
        pilotId: 'pilot-1',
        pilotName: 'Comte. Silva',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        status: 'apto',
        sleepHours: 7.5,
        restHours24h: 11,
        bloodPressureSys: 120,
        bloodPressureDia: 78,
        heartRate: 68,
        alcoholZeroConfirmed: true,
        calculatedFatigueIndex: 14,
        notes: 'Prontidão física e cognitiva excelente para manobras diurnas e noturnas.'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('pilots_records_health_logs', JSON.stringify(history));
  }, [history]);

  // Selected Pilot Object
  const selectedPilot: Pilot = useMemo(() => {
    return pilots.find(p => p.id === selectedPilotId) || pilots[0] || {
      id: 'pilot-1',
      name: 'Comte. Silva',
      licenseNumber: 'PIL-MZ-041',
      category: 'Piloto Sênior',
      status: 'disponivel',
      experienceYears: 18,
      totalManeuvers: 1420
    };
  }, [pilots, selectedPilotId]);

  // Workload calculation engine for ANY pilot based on maneuver history
  const computeWorkloadAndFatigue = (pilot: Pilot, customSleepHours?: number, customRestHours?: number) => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 3600000;
    const sevenDaysAgo = now - 7 * 24 * 3600000;

    // Filter maneuvers involving this pilot
    const pilotManeuvers = maneuvers.filter(m => 
      m.pilotId === pilot.id || 
      m.pilotName.toLowerCase().includes(pilot.name.toLowerCase()) ||
      (m.secondPilotName && m.secondPilotName.toLowerCase().includes(pilot.name.toLowerCase()))
    );

    // Active maneuvers underway right now
    const activeManeuvers = pilotManeuvers.filter(m => m.status === 'em_curso');

    // Maneuvers in last 24h
    const maneuvers24h = pilotManeuvers.filter(m => {
      const maneuverTime = new Date(m.scheduledTime || m.createdAt).getTime();
      return maneuverTime >= oneDayAgo;
    });

    // Maneuvers in last 7 days
    const maneuvers7d = pilotManeuvers.filter(m => {
      const maneuverTime = new Date(m.scheduledTime || m.createdAt).getTime();
      return maneuverTime >= sevenDaysAgo;
    });

    // Night maneuvers (between 20:00 and 06:00) in last 24h
    const nightManeuvers24h = maneuvers24h.filter(m => {
      const timeStr = m.unmooringTime || m.berthingTime || (m.scheduledTime ? m.scheduledTime.split('T')[1]?.slice(0, 5) : null);
      if (!timeStr) return false;
      const hour = parseInt(timeStr.split(':')[0], 10);
      return hour >= 20 || hour < 6;
    });

    // Calculate bridge duty hours in last 24h: from pilot boarding (POB) to disembarkation
    let bridgeHours24h = 0;
    maneuvers24h.forEach(m => {
      if (typeof m.pilotDutyHours === 'number' && m.pilotDutyHours > 0) {
        bridgeHours24h += m.pilotDutyHours;
      } else if (m.pilotOnBoardTime && m.pilotDisembarkedTime) {
        const [sh, sm] = m.pilotOnBoardTime.split(':').map(Number);
        const [eh, em] = m.pilotDisembarkedTime.split(':').map(Number);
        let diffHours = (eh * 60 + em - (sh * 60 + sm)) / 60;
        if (diffHours < 0) diffHours += 24;
        bridgeHours24h += diffHours;
      } else if (m.durationMinutes) {
        bridgeHours24h += m.durationMinutes / 60;
      } else if (m.unmooringTime && m.berthingTime) {
        const [sh, sm] = m.unmooringTime.split(':').map(Number);
        const [eh, em] = m.berthingTime.split(':').map(Number);
        let diffHours = (eh * 60 + em - (sh * 60 + sm)) / 60;
        if (diffHours < 0) diffHours += 24;
        bridgeHours24h += Math.max(0.5, diffHours);
      } else {
        bridgeHours24h += 2.0;
      }
    });

    // Time since last completed maneuver
    const completedManeuvers = pilotManeuvers.filter(m => m.status === 'concluida');
    let hoursSinceLastManeuver = 24; // default fully rested
    let lastManeuver: ManeuverRecord | null = null;

    if (completedManeuvers.length > 0) {
      const sorted = [...completedManeuvers].sort((a, b) => {
        const timeA = new Date(a.scheduledTime || a.createdAt).getTime();
        const timeB = new Date(b.scheduledTime || b.createdAt).getTime();
        return timeB - timeA;
      });
      lastManeuver = sorted[0];
      const lastTime = new Date(lastManeuver.scheduledTime || lastManeuver.createdAt).getTime();
      hoursSinceLastManeuver = Math.max(0, Math.round(((now - lastTime) / 3600000) * 10) / 10);
    }

    // Algorithmic Fatigue Index (IMO MSC/Circ.1598 & STCW fatigue modeling)
    // Workload factors:
    let fatigue = 10; // Baseline natural metabolic fatigue

    // 1. Manobras nas últimas 24h
    fatigue += maneuvers24h.length * 16;

    // 2. Horas ativas no passadiço
    fatigue += Math.round(bridgeHours24h * 5);

    // 3. Fator Noturno (ritmo circadiano)
    fatigue += nightManeuvers24h.length * 14;

    // 4. Manobras acumuladas em 7 dias
    if (maneuvers7d.length > 6) {
      fatigue += (maneuvers7d.length - 6) * 3.5;
    }

    // 5. Se estiver em manobra ativa agora, adiciona carga cognitiva imediata
    if (activeManeuvers.length > 0) {
      fatigue += 18;
    }

    // 6. Crédito de repouso decorrido desde o último desembarque
    const restRecovery = Math.min(45, hoursSinceLastManeuver * 4);
    fatigue -= restRecovery;

    // 7. Ajuste de sono (se fornecido)
    const effectiveSleep = customSleepHours !== undefined ? customSleepHours : 7.5;
    const sleepDelta = (8 - effectiveSleep) * 4;
    fatigue += sleepDelta;

    // Clamp between 5% and 98%
    const fatigueScore = Math.max(5, Math.min(98, Math.round(fatigue)));

    // Risk categorization
    let category: 'baixo' | 'moderado' | 'elevado' | 'critico' = 'baixo';
    let labelPt = 'Baixo Risco (Ótimo)';
    let labelEn = 'Low Risk (Optimal)';
    let colorClass = 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30';
    let statusBg = 'bg-emerald-500';

    if (fatigueScore > 75) {
      category = 'critico';
      labelPt = 'Crítico / Inapto Temporário';
      labelEn = 'Critical / Temporarily Unfit';
      colorClass = 'text-rose-400 border-rose-500/40 bg-rose-950/40';
      statusBg = 'bg-rose-500';
    } else if (fatigueScore > 50) {
      category = 'elevado';
      labelPt = 'Fadiga Elevada (Repouso Exigido)';
      labelEn = 'High Fatigue (Rest Required)';
      colorClass = 'text-amber-400 border-amber-500/40 bg-amber-950/40';
      statusBg = 'bg-amber-500';
    } else if (fatigueScore > 28) {
      category = 'moderado';
      labelPt = 'Risco Moderado (Atenção)';
      labelEn = 'Moderate Risk (Attention)';
      colorClass = 'text-yellow-300 border-yellow-500/40 bg-yellow-950/30';
      statusBg = 'bg-yellow-500';
    }

    return {
      pilot,
      maneuvers24h: maneuvers24h.length,
      recentManeuversList: maneuvers24h,
      maneuvers7d: maneuvers7d.length,
      nightManeuvers24h: nightManeuvers24h.length,
      activeManeuversCount: activeManeuvers.length,
      bridgeHours24h: Math.round(bridgeHours24h * 10) / 10,
      hoursSinceLastManeuver,
      lastManeuver,
      fatigueScore,
      category,
      labelPt,
      labelEn,
      colorClass,
      statusBg
    };
  };

  // Compute workload & fatigue for all pilots in team
  const fleetFatigueData = useMemo(() => {
    return pilots.map(p => computeWorkloadAndFatigue(p));
  }, [pilots, maneuvers]);

  // Current selected pilot fatigue data with current interactive sleep values
  const activeFatigueData = useMemo(() => {
    return computeWorkloadAndFatigue(selectedPilot, sleepHours, restHours24h);
  }, [selectedPilot, maneuvers, sleepHours, restHours24h]);

  // STCW compliance
  const isRestCompliant = restHours24h >= 10;
  const isBpNormal = bpSys <= 135 && bpDia <= 88;
  const isHeartRateNormal = heartRate >= 50 && heartRate <= 100;
  const isFit = isRestCompliant && alcoholConfirmed && isBpNormal && isHeartRateNormal && activeFatigueData.fatigueScore < 55;

  const handleRegisterClearance = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: PilotFitnessRecord = {
      id: `HLTH-${Date.now().toString().slice(-6)}`,
      pilotId: selectedPilot.id,
      pilotName: selectedPilot.name,
      timestamp: new Date().toISOString(),
      status: isFit ? 'apto' : (activeFatigueData.fatigueScore < 70 ? 'atencao' : 'inapto'),
      sleepHours,
      restHours24h,
      bloodPressureSys: bpSys,
      bloodPressureDia: bpDia,
      heartRate,
      alcoholZeroConfirmed: alcoholConfirmed,
      calculatedFatigueIndex: activeFatigueData.fatigueScore,
      notes: pilotNotes || (isFit 
        ? (isPt ? 'Atestado emitido: piloto com índice de fadiga controlado e prontidão STCW verificada.' : 'Fitness clearance issued: controlled fatigue index and verified STCW readiness.')
        : (isPt ? 'Período obrigatório de repouso recomendado devido à carga de manobras prévia.' : 'Mandatory rest period advised due to previous maneuver workload.'))
    };

    setHistory([newRecord, ...history]);
    setJustCertified(true);
    setTimeout(() => setJustCertified(false), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner - FRMS Cockpit */}
      <div className="bg-slate-900 border border-cyan-800/40 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden text-white">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                FRMS · IMO MSC/CIRC.1598 &amp; STCW 2010
              </span>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                {isPt ? 'SISTEMA DE GESTÃO DE FADIGA POR CARGA DE TRABALHO' : 'PILOT WORKLOAD FATIGUE RISK MANAGEMENT'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Stethoscope className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400" />
              <span>{isPt ? 'Saúde & Gestão de Fadiga do Piloto' : 'Pilot Health & Fatigue Management'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl font-sans leading-relaxed">
              {isPt
                ? 'Cálculo algorítmico contínuo da fadiga em função do trabalho individual de cada piloto: manobras em 24h, horas de passadiço, operações noturnas e intervalos de repouso STCW.'
                : 'Continuous algorithmic calculation of fatigue based on each pilot\'s workload: 24h maneuvers, bridge hours, night operations and STCW rest intervals.'}
            </p>
          </div>

          {/* Quick Pilot Selector */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-cyan-800/40 flex flex-col gap-2 min-w-[240px]">
            <label className="text-[11px] font-mono text-cyan-300 font-bold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isPt ? 'Selecionar Piloto:' : 'Select Pilot:'}</span>
            </label>
            <select
              value={selectedPilotId}
              onChange={(e) => setSelectedPilotId(e.target.value)}
              className="bg-slate-900 border border-cyan-700/60 text-white text-xs rounded-lg px-3 py-2 font-bold focus:ring-2 focus:ring-cyan-500 focus:outline-none cursor-pointer"
            >
              {pilots.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.category}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 font-mono">
              {isPt ? 'Escala ativa na barra do Porto da Beira' : 'Active roster at Port of Beira bar'}
            </span>
          </div>
        </div>
      </div>

      {/* 1. Fleet Fatigue Risk Matrix (All Pilots Overview) */}
      <div className="bg-white border-2 border-slate-300 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-900" />
              <span>{isPt ? 'Matriz de Gestão de Fadiga da Frota de Pilotos' : 'Pilot Fleet Workload & Fatigue Matrix'}</span>
            </h2>
            <p className="text-xs text-slate-500">
              {isPt 
                ? 'Monitorização comparativa de todos os pilotos para escalamento seguro e prevenção de sobrecarga' 
                : 'Comparative monitoring across all pilots for safe roster dispatch and overload mitigation'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono font-bold">
            <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              0-28% {isPt ? 'Ótimo' : 'Optimal'}
            </span>
            <span className="px-2 py-1 rounded bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              29-50% {isPt ? 'Moderado' : 'Moderate'}
            </span>
            <span className="px-2 py-1 rounded bg-rose-50 text-rose-800 border border-rose-300 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              &gt;50% {isPt ? 'Atenção' : 'Caution'}
            </span>
          </div>
        </div>

        {/* Responsive Pilot Cards / Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
          {fleetFatigueData.map(item => {
            const isSelected = item.pilot.id === selectedPilot.id;
            return (
              <div
                key={item.pilot.id}
                onClick={() => setSelectedPilotId(item.pilot.id)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                  isSelected 
                    ? 'border-blue-900 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20' 
                    : 'border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-xs font-black text-slate-900 block truncate">
                      {item.pilot.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 block">
                      {item.pilot.licenseNumber} · {item.pilot.category}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black border ${item.colorClass}`}>
                    {item.fatigueScore}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden border border-slate-200">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      item.fatigueScore > 75 
                        ? 'bg-rose-600' 
                        : item.fatigueScore > 50 
                        ? 'bg-amber-500' 
                        : item.fatigueScore > 28 
                        ? 'bg-yellow-500' 
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${item.fatigueScore}%` }}
                  />
                </div>

                {/* Workload Metrics */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-slate-100 pt-2 text-slate-600">
                  <div>
                    <span className="text-slate-400 block">{isPt ? 'MANOBRAS 24H' : 'MANEUVERS 24H'}</span>
                    <strong className="text-slate-900 font-bold text-xs">{item.maneuvers24h} man</strong>
                    {item.nightManeuvers24h > 0 && (
                      <span className="text-purple-700 block text-[9px]">({item.nightManeuvers24h} noturnas)</span>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 block">{isPt ? 'HORAS PASSADIÇO' : 'BRIDGE HOURS'}</span>
                    <strong className="text-slate-900 font-bold text-xs">{item.bridgeHours24h} h</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block">{isPt ? 'REPOUSO PÓS-MAN' : 'REST INTERVAL'}</span>
                    <strong className="text-slate-900 font-bold text-xs">{item.hoursSinceLastManeuver} h</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block">{isPt ? 'TOTAL 7 DIAS' : '7-DAY LOAD'}</span>
                    <strong className="text-slate-900 font-bold text-xs">{item.maneuvers7d} man</strong>
                  </div>
                </div>

                {/* Bottom Status */}
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold">
                  <span className={item.category === 'baixo' ? 'text-emerald-700' : item.category === 'moderado' ? 'text-amber-700' : 'text-rose-700'}>
                    {isPt ? item.labelPt : item.labelEn}
                  </span>
                  {isSelected && (
                    <span className="text-blue-900 font-black flex items-center gap-0.5">
                      {isPt ? 'Selecionado' : 'Selected'} &rarr;
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Detailed Workload & Biometric Cockpit for Selected Pilot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Workload Breakdown & Readiness Certification Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Workload Telemetry Card */}
          <div className="bg-white border-2 border-slate-300 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-cyan-700" />
                  <span>{isPt ? `Carga de Trabalho & Análise de Fadiga: ${selectedPilot.name}` : `Workload & Fatigue Telemetry: ${selectedPilot.name}`}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {isPt ? 'Fatores determinantes calculados das manobras registadas no sistema' : 'Deterministic factors computed from maneuver logs'}
                </p>
              </div>

              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-300">
                {selectedPilot.licenseNumber}
              </span>
            </div>

            {/* 4 Factor Telemetry Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">{isPt ? 'Manobras (24h)' : 'Maneuvers (24h)'}</span>
                <div className="text-xl font-black text-slate-900 font-mono">{activeFatigueData.maneuvers24h}</div>
                <span className="text-[10px] text-slate-500">
                  {activeFatigueData.nightManeuvers24h > 0 ? `${activeFatigueData.nightManeuvers24h} noturnas` : 'Diurnas'}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">{isPt ? 'Passadiço Ativo' : 'Active Bridge'}</span>
                <div className="text-xl font-black text-blue-900 font-mono">{activeFatigueData.bridgeHours24h} h</div>
                <span className="text-[10px] text-slate-500">{isPt ? 'Últimas 24 horas' : 'Past 24 hours'}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">{isPt ? 'Intervalo Repouso' : 'Rest Interval'}</span>
                <div className="text-xl font-black text-emerald-800 font-mono">{activeFatigueData.hoursSinceLastManeuver} h</div>
                <span className="text-[10px] text-slate-500">{isPt ? 'Desde última manobra' : 'Since last disembark'}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">{isPt ? 'Manobras (7d)' : 'Maneuvers (7d)'}</span>
                <div className="text-xl font-black text-purple-900 font-mono">{activeFatigueData.maneuvers7d}</div>
                <span className="text-[10px] text-slate-500">&lt; 14 recomendado</span>
              </div>
            </div>

            {/* List of Recent Contributing Maneuvers */}
            {activeFatigueData.recentManeuversList.length > 0 && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Ship className="w-4 h-4 text-cyan-800" />
                  {isPt ? 'Manobras do Piloto nas Últimas 24 Horas (Tempo de Embarque a Desembarque):' : 'Pilot Maneuvers in Last 24 Hours (Boarding to Disembarkation Time):'}
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {activeFatigueData.recentManeuversList.map(m => (
                    <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-slate-200 font-mono gap-1.5">
                      <div>
                        <span className="font-bold text-blue-900 block">{m.vesselSnapshot?.name || m.vesselId}</span>
                        <span className="text-[11px] text-slate-600">
                          {m.maneuverType.toUpperCase()} {m.maneuverDate ? `· ${m.maneuverDate}` : ''} {m.berthingModel ? `· ${m.berthingModel}` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {m.pilotOnBoardTime && m.pilotDisembarkedTime ? (
                          <span className="text-[11px] bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200 font-bold">
                            POB {m.pilotOnBoardTime} &rarr; Desembarque {m.pilotDisembarkedTime} {m.pilotDutyHours ? `(${m.pilotDutyHours}h)` : ''}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500">
                            {m.unmooringTime || m.berthingTime || 'Horário de Escala'} {m.durationMinutes ? `(${m.durationMinutes} min)` : ''}
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">{m.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Biometric & STCW Clearance Form */}
          <form onSubmit={handleRegisterClearance} className="bg-white border-2 border-slate-300 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-600" />
                  <span>{isPt ? 'Registo de Prontidão & Indicadores de Descanso' : 'Readiness Certification & Rest Input'}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {isPt ? 'Ajuste as horas de sono e descanso individual para emissão do certificado' : 'Adjust sleep & rest hours to issue official boarding clearance'}
                </p>
              </div>

              <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                isFit ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}>
                {isFit ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
                <span>{isFit ? (isPt ? 'APTO PARA SERVIÇO' : 'FIT FOR DUTY') : (isPt ? 'ATENÇÃO AO DESCANSO' : 'ATTENTION REQUIRED')}</span>
              </div>
            </div>

            {/* Input Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Horas de Sono */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Moon className="w-4 h-4 text-blue-700" />
                    {isPt ? 'Horas de Sono Contínuo' : 'Continuous Sleep Hours'}
                  </span>
                  <span className="font-mono text-base font-black text-blue-900">{sleepHours} h</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                  className="w-full accent-blue-900 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Mín. 6h</span>
                  <span>Ideal 8h</span>
                  <span>12h Máx</span>
                </div>
              </div>

              {/* Horas de Descanso em 24h (STCW: Mínimo 10h) */}
              <div className={`p-4 rounded-xl border space-y-2 ${
                isRestCompliant ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-300'
              }`}>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-slate-800">
                    <Clock className="w-4 h-4 text-emerald-700" />
                    {isPt ? 'Descanso em 24h (STCW A-VIII/1)' : '24h Rest Period (STCW)'}
                  </span>
                  <span className={`font-mono text-base font-black ${isRestCompliant ? 'text-emerald-800' : 'text-rose-700'}`}>
                    {restHours24h} h
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="20"
                  step="0.5"
                  value={restHours24h}
                  onChange={(e) => setRestHours24h(parseFloat(e.target.value))}
                  className="w-full accent-emerald-700 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                  <span>Mínimo STCW: 10h</span>
                  <span>{isRestCompliant ? '✓ Conforme STCW' : '⚠️ Violação de Descanso'}</span>
                </div>
              </div>

              {/* Pressão Arterial */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-rose-600" />
                    {isPt ? 'Pressão Arterial (Sist / Diast)' : 'Blood Pressure (Syst / Diast)'}
                  </span>
                  <span className="font-mono text-base font-black text-slate-900">{bpSys} / {bpDia} mmHg</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={bpSys}
                    onChange={(e) => setBpSys(parseInt(e.target.value) || 120)}
                    placeholder="Sistólica"
                    className="px-3 py-1.5 text-xs font-mono rounded border border-slate-300 bg-white"
                  />
                  <input
                    type="number"
                    value={bpDia}
                    onChange={(e) => setBpDia(parseInt(e.target.value) || 80)}
                    placeholder="Diastólica"
                    className="px-3 py-1.5 text-xs font-mono rounded border border-slate-300 bg-white"
                  />
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {isBpNormal ? '✓ Normotenso' : '⚠️ Pressão elevada'}
                </div>
              </div>

              {/* Frequência Cardíaca */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-500" />
                    {isPt ? 'Frequência Cardíaca' : 'Heart Rate'}
                  </span>
                  <span className="font-mono text-base font-black text-slate-900">{heartRate} BPM</span>
                </div>
                <input
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(parseInt(e.target.value) || 70)}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded border border-slate-300 bg-white"
                />
                <div className="text-[10px] text-slate-500 font-mono">
                  Ritmo normal de repouso (50-100 BPM)
                </div>
              </div>
            </div>

            {/* Declaração de Tolerância Zero */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={alcoholConfirmed}
                onChange={(e) => setAlcoholConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-blue-900 rounded"
              />
              <div className="text-xs text-slate-800">
                <strong className="block text-blue-950 font-bold">
                  {isPt ? 'Declaração de Tolerância Zero a Álcool e Substâncias (OCIMF / IMO)' : 'Zero Tolerance Alcohol & Drug Declaration (OCIMF / IMO)'}
                </strong>
                <span>
                  {isPt 
                    ? `Declaro sob fé profissional de pilotagem estar com 0,00 g/l de álcool e sem medicamentos que comprometam os reflexos de navegação.`
                    : `I declare under professional pilot oath zero blood alcohol concentration (0.00 g/l) and free from cognitive impairing medication.`}
                </span>
              </div>
            </label>

            {/* Observações */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isPt ? 'Observações Clínicas / Parecer do Piloto' : 'Clinical Notes / Pilot Remarks'}
              </label>
              <textarea
                value={pilotNotes}
                onChange={(e) => setPilotNotes(e.target.value)}
                placeholder={isPt ? 'Ex.: Sem queixas de fadiga, teste visual verificado, hidratação adequada.' : 'E.g.: Fully rested, adequate hydration, clear vision.'}
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
              />
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-600">
                {isFit ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    {isPt ? 'Critérios de descanso, carga de trabalho e biometria validados.' : 'Rest, workload and biometric criteria satisfied.'}
                  </span>
                ) : (
                  <span className="text-amber-700 font-bold flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {isPt ? 'Aviso: Avalie o descanso e a carga de trabalho antes da manobra.' : 'Warning: Review rest & workload prior to boarding.'}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-slate-950 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-cyan-300" />
                <span>{isPt ? 'Emitir Certificado de Prontidão Diária' : 'Issue Daily Fitness Clearance'}</span>
              </button>
            </div>

            {justCertified && (
              <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>{isPt ? 'Certificado de Prontidão emitido e gravado no arquivo do piloto!' : 'Fitness clearance issued and logged in pilot archive!'}</span>
              </div>
            )}
          </form>
        </div>

        {/* Right Col: Telemetry Gauge & Historical Clearances */}
        <div className="space-y-6">
          {/* Futuristic FRMS Gauge Widget for Selected Pilot */}
          <div className="bg-slate-900 border border-cyan-800/40 rounded-2xl p-5 shadow-xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <BatteryCharging className="w-4 h-4" />
                FRMS TELEMETRY HUD
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                {selectedPilot.name}
              </span>
            </div>

            <div className="flex flex-col items-center py-3">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={
                      activeFatigueData.fatigueScore < 28 
                        ? 'text-emerald-400' 
                        : activeFatigueData.fatigueScore < 50 
                        ? 'text-yellow-400' 
                        : activeFatigueData.fatigueScore < 75 
                        ? 'text-amber-500' 
                        : 'text-rose-500'
                    }
                    strokeDasharray={`${100 - activeFatigueData.fatigueScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black font-mono tracking-tight text-white">
                    {100 - activeFatigueData.fatigueScore}%
                  </span>
                  <span className="text-[9px] font-mono uppercase text-slate-400">
                    {isPt ? 'PRONTIDÃO' : 'READINESS'}
                  </span>
                </div>
              </div>

              <div className="mt-2 text-center">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${activeFatigueData.colorClass}`}>
                  {isPt ? activeFatigueData.labelPt : activeFatigueData.labelEn}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  {isPt 
                    ? `Índice de fadiga calculado em ${activeFatigueData.fatigueScore}% com base na carga real.` 
                    : `Calculated fatigue index at ${activeFatigueData.fatigueScore}% based on real workload.`}
                </p>
              </div>
            </div>

            {/* Pilot Status Tiles */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">{isPt ? 'ÚLTIMA MANOBRA' : 'LAST MANEUVER'}</span>
                <strong className="text-cyan-300 text-xs truncate block">
                  {activeFatigueData.lastManeuver ? activeFatigueData.lastManeuver.vesselName : (isPt ? 'Nenhuma hoje' : 'None today')}
                </strong>
                <span className="text-[9px] text-slate-400 block">
                  {activeFatigueData.hoursSinceLastManeuver}h {isPt ? 'atrás' : 'ago'}
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">{isPt ? 'DESPACHO ESCALA' : 'DISPATCH'}</span>
                <strong className="text-emerald-400 text-xs block">
                  {activeFatigueData.fatigueScore < 50 ? (isPt ? 'AUTORIZADO' : 'CLEARED') : (isPt ? 'CONDICIONADO' : 'RESTRICTED')}
                </strong>
                <span className="text-[9px] text-slate-400 block">Porto da Beira</span>
              </div>
            </div>
          </div>

          {/* Recent Health Clearances History */}
          <div className="bg-white border-2 border-slate-300 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-sm font-black text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-900" />
                {isPt ? 'Histórico de Certificados Emitidos' : 'Fitness Clearance History'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-bold">
                {history.length} {isPt ? 'registos' : 'records'}
              </span>
            </h4>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {history.map(item => (
                <div key={item.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-900">{item.pilotName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.status === 'apto' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600 text-[11px] font-mono">
                    <span>{new Date(item.timestamp).toLocaleString(isPt ? 'pt-PT' : 'en-US')}</span>
                    <span>{item.bloodPressureSys}/{item.bloodPressureDia} mmHg · {item.heartRate} BPM</span>
                  </div>

                  <p className="text-[11px] text-slate-700 italic">
                    "{item.notes}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
