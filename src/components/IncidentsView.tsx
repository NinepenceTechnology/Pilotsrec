import React, { useState } from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Radio, 
  Plus, 
  Download, 
  ShieldAlert, 
  Check, 
  X
} from 'lucide-react';
import { useMaritime } from '../context/MaritimeContext';
import { IncidentRecord } from '../types/maritime';
import { formatDateTime } from '../utils/formatters';

export const IncidentsView: React.FC = () => {
  const { maneuvers, cancelManeuverWithIncident, exportIncidentsToCsv } = useMaritime();

  const [isLoggingModalOpen, setIsLoggingModalOpen] = useState(false);
  const [selectedManeuverId, setSelectedManeuverId] = useState<string>('');
  
  const [incidentForm, setIncidentForm] = useState<IncidentRecord>({
    cause: 'mau_tempo_vento',
    causeTitle: 'Condições Meteorológicas Adversas (Vento/Ondas)',
    description: '',
    delayHours: 4,
    estimatedExtraCost: 6500,
    vhfChannelUsed: 'VHF Ch 12 (VTS) / Ch 16',
    reportedToAuthority: true,
    loggedAt: new Date().toISOString()
  });

  const incidentRecords = maneuvers.filter(m => m.incident);

  const totalLostHours = incidentRecords.reduce((acc, m) => acc + (m.incident?.delayHours || 0), 0);
  const totalExtraCosts = incidentRecords.reduce((acc, m) => acc + (m.incident?.estimatedExtraCost || 0), 0);

  const eligibleManeuvers = maneuvers.filter(m => m.status !== 'cancelada');

  const handleSaveIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedManeuverId || !incidentForm.description.trim()) {
      alert('Por favor selecione a manobra e descreva a ocorrência.');
      return;
    }
    cancelManeuverWithIncident(selectedManeuverId, {
      ...incidentForm,
      loggedAt: new Date().toISOString()
    }, incidentForm.description);

    setIsLoggingModalOpen(false);
    setSelectedManeuverId('');
  };

  const getCauseTitle = (cause: IncidentRecord['cause']): string => {
    switch (cause) {
      case 'mau_tempo_vento': return 'Ventos Fortes / Rajadas Acima do Limite';
      case 'mar_grosso_ressaca': return 'Ressaca / Ondulação Excessiva na Barra';
      case 'falta_espaco_cais': return 'Cais Ocupado / Atraso na Desatracação Anterior';
      case 'avaria_maquinas': return 'Avaria de Máquinas / Perda de Propulsão do Navio';
      case 'avaria_leme': return 'Falha no Sistema do Leme / Direção';
      case 'restricao_calado_mare': return 'Restrição de Maré / Calado Crítico';
      case 'falta_rebocadores': return 'Indisponibilidade de Rebocadores Portuários';
      case 'seguranca_recusa_tecnica': return 'Recusa Técnica do Prático por Segurança (SOLAS)';
      case 'acidente_toque': return 'Toque em Defensas / Incidente Operacional';
      default: return 'Outra Ocorrência Operacional';
    }
  };

  return (
    <div className="space-y-6 pb-12 text-slate-900">
      {/* Header */}
      <div className="bg-white border-2 border-black rounded-xl p-5 shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-black text-white font-bold px-2 py-0.5 rounded border border-black uppercase">
              Segurança Operacional
            </span>
          </div>
          <h2 className="text-2xl font-black text-black tracking-tight mt-1 flex items-center gap-2.5">
            <AlertOctagon className="w-6 h-6 text-rose-700" />
            Cancelamentos, Avarias & Ocorrências
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Registo de causas técnicas, interrupções por mau tempo, recusas de segurança e relatórios à Autoridade Portuária
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportIncidentsToCsv}
            className="px-3.5 py-2 rounded-lg border-2 border-black bg-white hover:bg-slate-100 font-bold text-xs text-black flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Relatório</span>
          </button>

          <button
            onClick={() => {
              if (eligibleManeuvers.length > 0) {
                setSelectedManeuverId(eligibleManeuvers[0].id);
              }
              setIsLoggingModalOpen(true);
            }}
            className="px-4 py-2 rounded-lg bg-black hover:bg-slate-800 text-white font-black text-xs flex items-center gap-2 transition-all border-2 border-black shadow"
          >
            <Plus className="w-4 h-4 text-rose-400 stroke-[3]" />
            <span>Registar Ocorrência / Cancelamento</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-black rounded-xl p-4 shadow">
          <span className="text-[10px] font-black uppercase text-slate-500 block">Total Ocorrências Registadas</span>
          <span className="text-2xl font-black text-black">{incidentRecords.length} Casos</span>
        </div>
        <div className="bg-white border-2 border-black rounded-xl p-4 shadow">
          <span className="text-[10px] font-black uppercase text-slate-500 block">Horas de Espera / Atraso</span>
          <span className="text-2xl font-black text-blue-900">{totalLostHours} Horas</span>
        </div>
        <div className="bg-white border-2 border-black rounded-xl p-4 shadow">
          <span className="text-[10px] font-black uppercase text-slate-500 block">Demurrage Estimado</span>
          <span className="text-2xl font-black text-black">${totalExtraCosts.toLocaleString()} USD</span>
        </div>
      </div>

      {/* Incidents List */}
      <div className="space-y-3">
        <h3 className="font-black text-sm uppercase text-blue-900 border-b border-slate-300 pb-2">
          Histórico de Ocorrências e Cancelamentos
        </h3>

        {incidentRecords.length === 0 ? (
          <div className="p-8 bg-white border-2 border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-500">
            Nenhuma ocorrência ou cancelamento registrado no período.
          </div>
        ) : (
          incidentRecords.map(m => {
            const inc = m.incident!;
            return (
              <div
                key={m.id}
                className="bg-white border-2 border-slate-300 hover:border-black rounded-xl p-4 sm:p-5 shadow transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black bg-black text-white px-2 py-0.5 rounded">
                      {m.id}
                    </span>
                    <span className="font-black text-sm text-black">
                      {m.vesselSnapshot.name}
                    </span>
                    <span className="text-xs bg-rose-100 text-rose-900 font-bold px-2 py-0.5 rounded border border-rose-300 uppercase">
                      Cancelamento / Atraso
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    Registado em: {formatDateTime(inc.loggedAt)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 font-bold block text-[10px]">Causa Declarada</span>
                    <strong className="text-black text-xs">{inc.causeTitle}</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 font-bold block text-[10px]">Impacto em Horas</span>
                    <strong className="text-blue-900 text-xs">{inc.delayHours} Horas de Espera</strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 font-bold block text-[10px]">Comunicação</span>
                    <strong className="text-black text-xs">{inc.vhfChannelUsed}</strong>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs text-slate-800">
                  <span className="font-bold text-black block mb-0.5">Descrição da Ocorrência:</span>
                  {inc.description}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Registrar Ocorrência */}
      {isLoggingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h3 className="font-black text-base text-black uppercase flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                Registar Ocorrência / Interrupção
              </h3>
              <button
                onClick={() => setIsLoggingModalOpen(false)}
                className="p-1 rounded bg-black text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveIncident} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold uppercase text-black mb-1">
                  Selecione a Manobra Afetada *
                </label>
                <select
                  value={selectedManeuverId}
                  onChange={(e) => setSelectedManeuverId(e.target.value)}
                  className="w-full bg-white border border-black rounded p-2 font-bold text-black"
                  required
                >
                  <option value="">-- Selecione uma manobra --</option>
                  {eligibleManeuvers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.id} · {m.vesselSnapshot.name} ({m.maneuverType.toUpperCase()})
                    </option>
                  ))}
                  {eligibleManeuvers.length === 0 && (
                    <option value="" disabled>Nenhuma manobra disponível no sistema</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase text-black mb-1">
                  Causa Principal da Ocorrência *
                </label>
                <select
                  value={incidentForm.cause}
                  onChange={(e) => {
                    const c = e.target.value as IncidentRecord['cause'];
                    setIncidentForm({
                      ...incidentForm,
                      cause: c,
                      causeTitle: getCauseTitle(c)
                    });
                  }}
                  className="w-full bg-white border border-black rounded p-2 font-bold text-black"
                >
                  <option value="mau_tempo_vento">Ventos Fortes / Rajadas Acima do Limite</option>
                  <option value="mar_grosso_ressaca">Ressaca / Ondulação Excessiva na Barra</option>
                  <option value="falta_espaco_cais">Cais Ocupado / Atraso na Desatracação</option>
                  <option value="avaria_maquinas">Avaria de Máquinas / Perda de Propulsão</option>
                  <option value="avaria_leme">Falha no Sistema do Leme / Direção</option>
                  <option value="restricao_calado_mare">Restrição de Maré / Calado Crítico</option>
                  <option value="falta_rebocadores">Indisponibilidade de Rebocadores</option>
                  <option value="seguranca_recusa_tecnica">Recusa Técnica do Prático (SOLAS)</option>
                  <option value="acidente_toque">Toque em Defensas / Incidente Operacional</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase text-black mb-1">
                  Horas de Atraso Estimadas
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={incidentForm.delayHours}
                  onChange={(e) => setIncidentForm({ ...incidentForm, delayHours: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-black rounded p-2 font-bold text-black"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-black mb-1">
                  Relatório e Descrição Detalhada *
                </label>
                <textarea
                  rows={3}
                  value={incidentForm.description}
                  onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                  placeholder="Descreva as circunstâncias técnicas, comunicações com o comandante e autoridade portuária..."
                  className="w-full bg-white border border-black rounded p-2 font-semibold text-black"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsLoggingModalOpen(false)}
                  className="px-4 py-2 rounded border-2 border-black font-bold hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-black hover:bg-slate-800 text-white font-bold border-2 border-black"
                >
                  Salvar Ocorrência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
