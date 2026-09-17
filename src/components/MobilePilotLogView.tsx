import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  Radio, 
  Anchor, 
  RotateCcw, 
  ArrowRight,
  Send,
  AlertTriangle,
  X,
  Compass,
  Check
} from 'lucide-react';
import { useMaritime } from '../context/MaritimeContext';
import { TimeMilestones } from '../types/maritime';
import { formatManeuverType } from '../utils/formatters';

interface MobilePilotLogViewProps {
  onClose?: () => void;
}

export const MobilePilotLogView: React.FC<MobilePilotLogViewProps> = ({ onClose }) => {
  const { 
    maneuvers, 
    updateMilestone, 
    completeManeuver, 
    updateManeuver, 
    weather,
    pilots,
    currentUser
  } = useMaritime();

  // Find active maneuver or default to first
  const activeManeuvers = maneuvers.filter(m => m.status === 'em_curso');
  const [selectedManeuverId, setSelectedManeuverId] = useState<string>(
    activeManeuvers[0]?.id || maneuvers[0]?.id || ''
  );

  const currentManeuver = maneuvers.find(m => m.id === selectedManeuverId) || maneuvers[0];

  // Live Timer simulation
  const [seconds, setSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [quickRemark, setQuickRemark] = useState('');

  useEffect(() => {
    if (currentManeuver?.status === 'em_curso') {
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(false);
    }
  }, [currentManeuver?.status]);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatElapsedTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const recordTimeNow = () => {
    const now = new Date();
    return now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  };

  if (!currentManeuver) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 mx-auto">
            <Smartphone className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white">Nenhuma Manobra Registada</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Para utilizar o Cockpit de Bordo, deve primeiro registar uma manobra no <strong>Livro de Manobras</strong>.
          </p>
          {currentUser && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
              Piloto Identificado: <strong>{currentUser.name}</strong> ({currentUser.rank})
            </div>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg transition-colors"
            >
              Fechar Cockpit
            </button>
          )}
        </div>
      </div>
    );
  }

  const milestones = currentManeuver.milestones;

  const milestoneButtons: { 
    key: keyof TimeMilestones; 
    label: string; 
    hint: string; 
    color: string 
  }[] = [
    { key: 'boardingPilotBoat', label: '1. Embarque Lancha', hint: 'Saída da estação de pilotagem', color: 'border-cyan-600 hover:bg-cyan-950/50' },
    { key: 'pilotOnBoard', label: '2. Piloto a Bordo', hint: 'Escada de quebra-peito & MPX', color: 'border-blue-600 hover:bg-blue-950/50' },
    { key: 'commenceManeuver', label: '3. Início da Manobra', hint: 'Comandos ao leme / desamarrar', color: 'border-emerald-600 hover:bg-emerald-950/50' },
    { key: 'tugsConnected', label: '4. Rebocadores Passados', hint: 'Cabos passados proa/popa', color: 'border-amber-600 hover:bg-amber-950/50' },
    { key: 'firstLineAshored', label: '5. 1º Cabo em Terra', hint: 'Primeiro cabo no cabeço do cais', color: 'border-purple-600 hover:bg-purple-950/50' },
    { key: 'allFastCompleted', label: '6. Navio Amarrado / Concluído', hint: 'Todos os cabos encapelados', color: 'border-emerald-500 hover:bg-emerald-950/80' },
    { key: 'pilotDisembarked', label: '7. Desembarque Piloto', hint: 'Retorno à lancha de pilotos', color: 'border-slate-500 hover:bg-slate-800' }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-16">
      {/* Mobile Top Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-600 flex items-center justify-center text-white font-bold">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Cockpit de Bordo · Pilotagem
            </div>
            <h2 className="text-sm font-extrabold text-white">
              Registo Tátil em Tempo Real
            </h2>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Maneuver Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3">
        <label className="text-[11px] text-slate-400 font-medium block mb-1.5">
          Selecionar Manobra Ativa para Registo:
        </label>
        <select
          value={selectedManeuverId}
          onChange={(e) => setSelectedManeuverId(e.target.value)}
          className="w-full bg-slate-950 text-white border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-cyan-500"
        >
          {maneuvers.map(m => (
            <option key={m.id} value={m.id}>
              [{m.status.toUpperCase()}] {m.vesselSnapshot.name} - {formatManeuverType(m.maneuverType)} ({m.berthTo})
            </option>
          ))}
        </select>
      </div>

      {/* Active Vessel HUD Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border-2 border-cyan-500/40 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-700/50">
              {currentManeuver.id}
            </span>
            <h3 className="text-xl font-black text-white mt-1">
              {currentManeuver.vesselSnapshot.name}
            </h3>
            <div className="text-xs text-slate-300 flex flex-wrap gap-x-3 gap-y-1 mt-1 font-mono">
              <span>LOA: <strong>{currentManeuver.vesselSnapshot.loa}m</strong></span>
              <span>Boca: <strong>{currentManeuver.vesselSnapshot.beam}m</strong></span>
              <span>Calado: <strong>{currentManeuver.vesselSnapshot.draftAft}m</strong></span>
            </div>
            <div className="text-xs text-cyan-300 font-semibold mt-1 flex flex-wrap items-center gap-x-2">
              <span>Cais/Berço: {currentManeuver.berthTo} · {formatManeuverType(currentManeuver.maneuverType)}</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-200">Prático: <strong>{currentManeuver.pilotName || (currentUser?.name)}</strong></span>
            </div>
          </div>

          {/* Big Live Digital Stopwatch */}
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Cronômetro</div>
            <div className="font-mono text-2xl sm:text-3xl font-black text-emerald-400 tracking-wider">
              {formatElapsedTime(seconds)}
            </div>
            <div className="flex items-center gap-1 justify-end mt-1">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`p-1.5 rounded-lg text-xs font-bold ${
                  isTimerRunning ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setSeconds(0)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 1-Touch Milestones Button Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-400" />
            Marcos da Manobra (Toque para Gravar Horário)
          </h4>
          <span className="text-[10px] text-slate-400">Hora atual: {recordTimeNow()}h</span>
        </div>

        <div className="space-y-2.5">
          {milestoneButtons.map((btn) => {
            const recordedTime = milestones[btn.key];
            const isDone = !!recordedTime;

            return (
              <div
                key={btn.key}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  isDone 
                    ? 'bg-emerald-950/40 border-emerald-500/80 text-white' 
                    : `bg-slate-950 ${btn.color} text-slate-200`
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    isDone ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isDone ? <Check className="w-4 h-4" /> : '•'}
                  </div>
                  <div>
                    <div className="text-sm font-bold">{btn.label}</div>
                    <div className="text-[11px] text-slate-400">{btn.hint}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isDone ? (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-300 font-black text-sm bg-emerald-950 px-2 py-1 rounded border border-emerald-800">
                        {recordedTime}h
                      </span>
                      <button
                        onClick={() => updateMilestone(currentManeuver.id, btn.key, '')}
                        className="text-[10px] text-slate-500 hover:text-rose-400 p-1"
                        title="Limpar"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => updateMilestone(currentManeuver.id, btn.key, recordTimeNow())}
                      className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow active:scale-95 transition-all"
                    >
                      Gravar Agora
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Master-Pilot Checklist (SOLAS) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Checklist Rápido de Passadiço (MPX)
        </h4>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
            <input 
              type="checkbox" 
              checked={currentManeuver.safetyChecklist.steeringGearTested}
              onChange={(e) => updateManeuver(currentManeuver.id, {
                safetyChecklist: { ...currentManeuver.safetyChecklist, steeringGearTested: e.target.checked }
              })}
              className="w-4 h-4 accent-cyan-500 rounded" 
            />
            <span className="text-slate-300 text-[11px] font-medium">Leme testado</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
            <input 
              type="checkbox" 
              checked={currentManeuver.safetyChecklist.bowThrusterOperational}
              onChange={(e) => updateManeuver(currentManeuver.id, {
                safetyChecklist: { ...currentManeuver.safetyChecklist, bowThrusterOperational: e.target.checked }
              })}
              className="w-4 h-4 accent-cyan-500 rounded" 
            />
            <span className="text-slate-300 text-[11px] font-medium">Bow Thruster OK</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
            <input 
              type="checkbox" 
              checked={currentManeuver.safetyChecklist.pilotLadderCompliant}
              onChange={(e) => updateManeuver(currentManeuver.id, {
                safetyChecklist: { ...currentManeuver.safetyChecklist, pilotLadderCompliant: e.target.checked }
              })}
              className="w-4 h-4 accent-cyan-500 rounded" 
            />
            <span className="text-slate-300 text-[11px] font-medium">Escada SOLAS OK</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
            <input 
              type="checkbox" 
              checked={currentManeuver.safetyChecklist.vhfChannelsConfirmed}
              onChange={(e) => updateManeuver(currentManeuver.id, {
                safetyChecklist: { ...currentManeuver.safetyChecklist, vhfChannelsConfirmed: e.target.checked }
              })}
              className="w-4 h-4 accent-cyan-500 rounded" 
            />
            <span className="text-slate-300 text-[11px] font-medium">VHF Ch 12/16 OK</span>
          </label>
        </div>
      </div>

      {/* Quick Remarks / Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
        <label className="text-xs font-bold text-white uppercase tracking-wider block">
          Anotações do Prático (Tempo, Corrente, Ocorrência)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={quickRemark}
            onChange={(e) => setQuickRemark(e.target.value)}
            placeholder="Ex: Velocidade 0.4 kts, 2 rebocadores amarrados..."
            className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => {
              if (quickRemark.trim()) {
                const updated = currentManeuver.pilotRemarks 
                  ? `${currentManeuver.pilotRemarks} | ${quickRemark}`
                  : quickRemark;
                updateManeuver(currentManeuver.id, { pilotRemarks: updated });
                setQuickRemark('');
              }
            }}
            className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Salvar</span>
          </button>
        </div>
        {currentManeuver.pilotRemarks && (
          <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 mt-2">
            <strong>Histórico:</strong> {currentManeuver.pilotRemarks}
          </div>
        )}
      </div>

      {/* Complete Maneuver Final Button */}
      {currentManeuver.status !== 'concluida' && (
        <button
          onClick={() => {
            if (confirm('Deseja encerrar e assinar a manobra com sucesso?')) {
              completeManeuver(currentManeuver.id);
            }
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <CheckCircle className="w-5 h-5" />
          <span>CONCLUIR E ASSINAR FOLHA DE MANOBRA</span>
        </button>
      )}
    </div>
  );
};
