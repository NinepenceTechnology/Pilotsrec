import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckSquare, 
  FileCheck, 
  AlertTriangle, 
  Anchor, 
  Radio, 
  Compass, 
  Save, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { useMaritime } from '../context/MaritimeContext';
import { SafetyChecklist } from '../types/maritime';

export const SafetyChecklistView: React.FC = () => {
  const { maneuvers, updateManeuver } = useMaritime();

  const [selectedManeuverId, setSelectedManeuverId] = useState<string>(
    maneuvers[0]?.id || ''
  );

  const currentManeuver = maneuvers.find(m => m.id === selectedManeuverId) || maneuvers[0];

  const [checklist, setChecklist] = useState<SafetyChecklist>(
    currentManeuver?.safetyChecklist || {
      pilotLadderCompliant: true,
      steeringGearTested: true,
      bowThrusterOperational: true,
      mainEngineTested: true,
      anchorsCleared: true,
      radarEcdisOperational: true,
      vhfChannelsConfirmed: true,
      masterPilotExchangeDone: true,
      deckCrewAssisting: true
    }
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync checklist when maneuver select changes
  const handleSelectManeuver = (id: string) => {
    setSelectedManeuverId(id);
    const m = maneuvers.find(item => item.id === id);
    if (m) {
      setChecklist(m.safetyChecklist);
    }
    setSavedSuccess(false);
  };

  const handleToggle = (key: keyof SafetyChecklist) => {
    setChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setSavedSuccess(false);
  };

  const handleSaveAudit = () => {
    if (!currentManeuver) return;
    updateManeuver(currentManeuver.id, {
      safetyChecklist: checklist
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const items: { 
    key: keyof SafetyChecklist; 
    title: string; 
    desc: string; 
    standard: string 
  }[] = [
    {
      key: 'pilotLadderCompliant',
      title: 'Escada de Piloto Conforme Convenção SOLAS (Reg. V/23)',
      desc: 'Degraus limpos, sem nós nos cabos laterais, iluminação noturna adequada e cabo de segurança com boia salva-vidas.',
      standard: 'IMO Res. A.1045(27)'
    },
    {
      key: 'steeringGearTested',
      title: 'Teste de Máquina do Leme (Steering Gear Check)',
      desc: 'Teste de leme bombordo/boreste realizado a menos de 2 horas da entrada no canal balizado.',
      standard: 'SOLAS Reg. V/26'
    },
    {
      key: 'bowThrusterOperational',
      title: 'Propulsor de Proa (Bow Thruster) Testado e Operacional',
      desc: 'Verificação de resposta do motor e resposta imediata nos comandos no passadiço.',
      standard: 'Requisito Portuário'
    },
    {
      key: 'mainEngineTested',
      title: 'Máquina Principal Testada em Marcha a Ré (Astern Test)',
      desc: 'Confirmação com a praça de máquinas de que a propulsão para trás está 100% disponível.',
      standard: 'Norma de Pilotagem'
    },
    {
      key: 'anchorsCleared',
      title: 'Ferros de Proa Desapegados e Prontos a Largar',
      desc: 'Freios destravados, tripulação a postos no castelo de proa para largar ferro em emergência.',
      standard: 'Regulamento de Barra'
    },
    {
      key: 'radarEcdisOperational',
      title: 'Cartas Náuticas Eletrônicas (ECDIS) e Radares Operacionais',
      desc: 'Radares Banda X e S operacionais com linha de proa estabilizada no norte.',
      standard: 'SOLAS Reg. V/19'
    },
    {
      key: 'vhfChannelsConfirmed',
      title: 'Comunicação VHF Sintonizada (Canais 12 e 16)',
      desc: 'Escuta permanente em Canal 16 (Socorro) e Canal 12 (VTS / Pilotagem / Rebocadores).',
      standard: 'GMDSS / VTS'
    },
    {
      key: 'masterPilotExchangeDone',
      title: 'Troca de Informações Piloto-Comandante (MPX Assinado)',
      desc: 'Discussão do plano de manobra, uso de rebocadores, velocidades e restrições do berço.',
      standard: 'IMO Res. A.960'
    },
    {
      key: 'deckCrewAssisting',
      title: 'Tripulação a Postos nas Estações de Manobra (Proa e Popa)',
      desc: 'Oficiais e marinheiros equipados com EPI e rádios portáteis prontos para passar cabos.',
      standard: 'Segurança Ocupacional'
    }
  ];

  const totalChecks = items.length;
  const compliantCount = Object.values(checklist).filter(Boolean).length;
  const compliancePercentage = Math.round((compliantCount / totalChecks) * 100);

  if (maneuvers.length === 0) {
    return (
      <div className="space-y-6 pb-12">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            Segurança Náutica, MPX & Auditoria de Conformidade
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Checklist obrigatório de passadiço, escada de piloto (SOLAS V/23), equipamentos de navegação e troca MPX
          </p>
        </div>

        <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3 shadow-xl">
          <ShieldCheck className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">Nenhuma manobra registada para auditoria</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Para realizar a auditoria de segurança SOLAS e MPX, crie primeiro um registo de manobra no <strong>Livro de Manobras</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            Segurança Náutica, MPX & Auditoria de Conformidade
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Checklist obrigatório de passadiço, escada de prático (SOLAS V/23), equipamentos de navegação e troca MPX
          </p>
        </div>

        <button
          onClick={handleSaveAudit}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Auditoria na Manobra</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-600 rounded-xl text-emerald-300 text-xs flex items-center gap-2 font-bold animate-fadeIn">
          <Check className="w-4 h-4" />
          Auditoria de conformidade marítima salva com sucesso no registo oficial da manobra!
        </div>
      )}

      {/* Maneuver Selector */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <Anchor className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-slate-300 font-semibold">Manobra Selecionada para Auditoria:</span>
        </div>

        <select
          value={selectedManeuverId}
          onChange={(e) => handleSelectManeuver(e.target.value)}
          className="bg-slate-950 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-cyan-500 min-w-[280px]"
        >
          {maneuvers.map(m => (
            <option key={m.id} value={m.id}>
              {m.id} - {m.vesselSnapshot.name} ({m.berthTo})
            </option>
          ))}
        </select>
      </div>

      {/* Compliance Score Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Navio Auditado: {currentManeuver?.vesselSnapshot.name} (IMO {currentManeuver?.vesselSnapshot.imo})
          </div>
          <h3 className="text-xl font-black text-white mt-1">
            Índice de Conformidade de Segurança: {compliancePercentage}%
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {compliancePercentage === 100 
              ? 'Todos os requisitos SOLAS e regulamentares atendidos para manobra.' 
              : 'Atenção: existem itens não conformes assinalados abaixo que demandam parecer técnico do piloto.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-slate-950 border-2 border-emerald-500/60 flex items-center justify-center font-mono text-xl font-black text-emerald-400 shadow-inner">
            {compliantCount}/{totalChecks}
          </div>
        </div>
      </div>

      {/* Checklist Items Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 mb-2">
          <CheckSquare className="w-4 h-4 text-cyan-400" />
          Verificação Detalhada dos 9 Pilares de Segurança SOLAS & Pilotagem
        </h3>

        <div className="space-y-3">
          {items.map((item) => {
            const isChecked = checklist[item.key];
            return (
              <div
                key={item.key}
                onClick={() => handleToggle(item.key)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-4 ${
                  isChecked 
                    ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700' 
                    : 'bg-rose-950/30 border-rose-900/60 hover:border-rose-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded mt-0.5 flex items-center justify-center border transition-all ${
                    isChecked 
                      ? 'bg-emerald-600 border-emerald-500 text-white' 
                      : 'bg-slate-900 border-rose-700 text-rose-400'
                  }`}>
                    {isChecked ? <Check className="w-3.5 h-3.5" /> : '✕'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">
                        {item.title}
                      </h4>
                      <span className="text-[10px] px-2 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                        {item.standard}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                  isChecked 
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                    : 'bg-rose-950 text-rose-300 border-rose-800'
                }`}>
                  {isChecked ? 'CONFORME' : 'NÃO CONFORME'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Master-Pilot Information Exchange (MPX) Card */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-cyan-400" />
            Declaração de Troca de Informações Piloto-Comandante (MPX)
          </h3>
          <span className="text-xs text-emerald-400 font-bold">Resolução IMO A.960</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-cyan-400 font-bold block uppercase tracking-wider text-[11px]">
              Dados Fornecidos pelo Comandante do Navio
            </span>
            <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
              <li>Calado real à chegada: Vante {currentManeuver?.vesselSnapshot.draftFwd}m / Ré {currentManeuver?.vesselSnapshot.draftAft}m</li>
              <li>Velocidade mínima de governo: 4.5 nós</li>
              <li>Tempo para reversão de máquina (Full Ahead → Full Astern): 35 segundos</li>
              <li>Potência do Bow Thruster: 1.800 kW operacional</li>
            </ul>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-cyan-400 font-bold block uppercase tracking-wider text-[11px]">
              Orientações Fornecidas pelo Piloto
            </span>
            <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
              <li>Plano de manobra: aproximação pelo canal sul a 6 nós, redução na bóia 4</li>
              <li>Emprego de {currentManeuver?.tugs.length || 2} rebocadores com cabos pelo bico e popa</li>
              <li>Condição de maré: enchente, correnteza de 1.2 kts no sentido do cais</li>
              <li>Lado de atracação: costado de Boreste (Starboard side to)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
