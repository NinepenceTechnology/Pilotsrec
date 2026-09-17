import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Calendar, 
  Clock, 
  Anchor, 
  Phone, 
  Radio, 
  Award, 
  CheckCircle2, 
  X, 
  FileText,
  ChevronRight
} from 'lucide-react';
import { useMaritime } from '../context/MaritimeContext';
import { Pilot, PilotShift } from '../types/maritime';
import { formatManeuverType, formatDateTime } from '../utils/formatters';

export const PilotsView: React.FC = () => {
  const { 
    pilots, 
    maneuvers, 
    addPilot, 
    updatePilotStatus, 
    currentUser, 
    setIsProfileModalOpen 
  } = useMaritime();

  const [selectedPilotId, setSelectedPilotId] = useState<string | null>(() => {
    if (currentUser?.id) return currentUser.id;
    return pilots[0]?.id || null;
  });
  const selectedPilot = pilots.find(p => p.id === selectedPilotId) || (currentUser ? pilots.find(p => p.id === currentUser.id) : pilots[0]) || null;
  const [isAddingPilot, setIsAddingPilot] = useState(false);

  // Form for adding pilot
  const [newPilotName, setNewPilotName] = useState('');
  const [newLicense, setNewLicense] = useState('');
  const [newCategory, setNewCategory] = useState<Pilot['category']>('Prático Sênior');
  const [newPhone, setNewPhone] = useState('');
  const [newVhf, setNewVhf] = useState('');

  const handleSavePilot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPilotName.trim() || !newLicense.trim()) return;

    const newId = addPilot({
      name: newPilotName,
      licenseNumber: newLicense,
      category: newCategory,
      phone: newPhone || '+351 900 000 000',
      vhfCallSign: newVhf || `Prático ${newPilotName.split(' ')[1] || 'Novo'}`,
      status: 'de_servico',
      currentShift: 'Manhã/Tarde (08h-16h)',
      avatarColor: 'bg-blue-900'
    });

    setSelectedPilotId(newId);
    setIsAddingPilot(false);
    setNewPilotName('');
    setNewLicense('');
    setNewPhone('');
    setNewVhf('');
  };

  const pilotManeuvers = selectedPilot
    ? maneuvers.filter(m => m.pilotId === selectedPilot.id || m.pilotName === selectedPilot.name)
    : [];

  return (
    <div className="space-y-6 pb-12 text-slate-900">
      {/* Header */}
      <div className="bg-white border-2 border-black rounded-xl p-5 shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-900 text-white font-bold px-2 py-0.5 rounded border border-black uppercase">
              Recursos Humanos & Operações
            </span>
          </div>
          <h2 className="text-2xl font-black text-black tracking-tight mt-1 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-900" />
            Corpo de Pilotos & Escala de Turnos
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Gestão da escala de serviço (ativo/prevenção/folga), CIR marítima e histórico individual de manobras
          </p>
        </div>

        <button
          onClick={() => setIsAddingPilot(true)}
          className="px-4 py-2.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-2 transition-all border-2 border-black shadow"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Cadastrar Novo Piloto</span>
        </button>
      </div>

      {/* Roster & Shifts Overview Bar */}
      <div className="bg-white rounded-xl border-2 border-black p-5 shadow">
        <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
          <h3 className="text-sm font-black text-blue-900 uppercase tracking-tight flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-700" />
            Escala Diária da Estação de Pilotagem
          </h3>
          <span className="text-xs font-semibold text-slate-600">3 Turnos de Guarda</span>
        </div>

        {pilots.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 text-center">
            <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="font-bold text-xs text-black">Nenhum piloto escalado no momento</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Cadastre pilotos para compor as escalas e plantões dos turnos de guarda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-lg border-2 border-slate-300">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-blue-900">Manhã / Tarde (08h - 16h)</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-bold border border-emerald-300">
                  TURNO ATIVO
                </span>
              </div>
              <div className="space-y-1.5 text-slate-800">
                {pilots.filter(p => p.currentShift.includes('Manhã') || p.status === 'de_servico' || p.status === 'em_manobra').length === 0 ? (
                  <span className="text-[11px] text-slate-500 italic">Sem práticos neste turno</span>
                ) : (
                  pilots.filter(p => p.currentShift.includes('Manhã') || p.status === 'de_servico' || p.status === 'em_manobra').map(p => (
                    <div key={p.id} className="flex items-center justify-between">
                      <span className="font-semibold">{p.name}</span>
                      <span className={`text-[10px] font-bold ${p.status === 'em_manobra' ? 'text-emerald-700' : 'text-blue-800'}`}>
                        {p.status === 'em_manobra' ? 'A Bordo' : 'Estação / Pronta'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border-2 border-slate-300">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-blue-900">Noite (16h - 24h)</span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300">
                  PRÓXIMO TURNO
                </span>
              </div>
              <div className="space-y-1.5 text-slate-800">
                {pilots.filter(p => p.currentShift.includes('Noite') || p.status === 'prevencao').length === 0 ? (
                  <span className="text-[11px] text-slate-500 italic">Sem práticos neste turno</span>
                ) : (
                  pilots.filter(p => p.currentShift.includes('Noite') || p.status === 'prevencao').map(p => (
                    <div key={p.id} className="flex items-center justify-between">
                      <span className="font-semibold">{p.name}</span>
                      <span className="text-[10px] text-slate-600 font-bold">Prevenção / Reserva</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border-2 border-slate-300">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-blue-900">Madrugada (00h - 08h)</span>
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-bold border border-slate-400">
                  PLANTÃO NOTURNO
                </span>
              </div>
              <div className="space-y-1.5 text-slate-800">
                {pilots.filter(p => p.currentShift.includes('Madrugada') || p.status === 'folga').length === 0 ? (
                  <span className="text-[11px] text-slate-500 italic">Sem práticos neste turno</span>
                ) : (
                  pilots.filter(p => p.currentShift.includes('Madrugada') || p.status === 'folga').map(p => (
                    <div key={p.id} className="flex items-center justify-between">
                      <span className="font-semibold">{p.name}</span>
                      <span className="text-[10px] text-slate-600 font-bold">{p.status === 'folga' ? 'Descanso Obrigatório' : 'Escalado'}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Pilots Directory on Left, Selected Pilot Dossier on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pilots List */}
        <div className="bg-white border-2 border-black rounded-xl p-4 shadow space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-black text-sm uppercase text-blue-900">
              Práticos Habilitados ({pilots.length})
            </h3>
            <span className="text-xs text-slate-500 font-semibold">Selecione para ver ficha</span>
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {pilots.length === 0 ? (
              <div className="p-6 text-center text-slate-500 border border-dashed border-slate-300 rounded-lg text-xs">
                Nenhum prático registado.
              </div>
            ) : (
              pilots.map(p => {
                const isSelected = selectedPilot?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPilotId(p.id)}
                    className={`p-3 rounded-lg border-2 transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-900 text-white border-black shadow'
                        : 'bg-white text-black border-slate-200 hover:border-black hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                        isSelected ? 'bg-black text-white' : 'bg-blue-100 text-blue-900'
                      }`}>
                        {p.name.split(' ')[1]?.[0] || p.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-xs sm:text-sm leading-tight">
                            {p.name}
                          </h4>
                          {currentUser && p.id === currentUser.id && (
                            <span className="text-[9px] font-black uppercase bg-cyan-400 text-black px-1.5 py-0.2 rounded border border-black">
                              Seu Registo
                            </span>
                          )}
                        </div>
                        <div className={`text-[11px] ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                          CIR: <strong>{p.licenseNumber}</strong> · {p.category}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        p.status === 'de_servico' || p.status === 'em_manobra'
                          ? isSelected ? 'bg-emerald-500 text-white border-white' : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : isSelected ? 'bg-slate-800 text-white border-slate-600' : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        {p.status === 'de_servico' ? 'Em Serviço' : p.status === 'em_manobra' ? 'Em Manobra' : 'Prevenção/Folga'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Pilot Detail & Maneuver Log */}
        <div className="lg:col-span-2">
          {selectedPilot ? (
            <div className="bg-white border-2 border-black rounded-xl p-5 shadow space-y-5">
              {/* Pilot Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-200 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-xl bg-blue-900 text-white border-2 border-black flex items-center justify-center font-black text-xl shadow">
                    {selectedPilot.name.split(' ')[1]?.[0] || selectedPilot.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-black">
                        {selectedPilot.name}
                      </h3>
                      <span className="text-xs bg-black text-white px-2 py-0.5 rounded font-mono font-bold">
                        {selectedPilot.licenseNumber}
                      </span>
                    </div>
                    <p className="text-xs text-blue-900 font-bold mt-0.5">
                      {selectedPilot.category} · Canal VHF: <strong>{selectedPilot.vhfCallSign}</strong>
                    </p>
                  </div>
                </div>

                {/* Status and Edit Profile */}
                <div className="flex items-center gap-2 flex-wrap">
                  {currentUser && selectedPilot.id === currentUser.id && (
                    <button
                      onClick={() => setIsProfileModalOpen(true)}
                      className="px-3 py-1.5 rounded-md bg-black text-white hover:bg-slate-800 text-xs font-bold transition-colors"
                      title="Atualizar seu nome ou escalão"
                    >
                      Editar Meu Registo
                    </button>
                  )}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-700">Estado:</span>
                    <select
                      value={selectedPilot.status}
                      onChange={(e) => updatePilotStatus(selectedPilot.id, e.target.value as Pilot['status'])}
                      className="bg-white border-2 border-black rounded-md px-3 py-1.5 text-xs font-bold text-black"
                    >
                      <option value="de_servico">Serviço Ativo</option>
                      <option value="em_manobra">A Bordo / Em Manobra</option>
                      <option value="prevencao">Prevenção</option>
                      <option value="folga">Descanso Obrigatório</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-50 border border-slate-300 p-3 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Manobras</span>
                  <span className="text-xl font-black text-blue-900">{selectedPilot.completedManeuversCount}</span>
                </div>
                <div className="bg-slate-50 border border-slate-300 p-3 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">No Turno Atual</span>
                  <span className="text-xl font-black text-black">{pilotManeuvers.length}</span>
                </div>
                <div className="bg-slate-50 border border-slate-300 p-3 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Contato Telefônico</span>
                  <span className="text-xs font-bold text-slate-800 block mt-1">{selectedPilot.phone}</span>
                </div>
                <div className="bg-slate-50 border border-slate-300 p-3 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Turno Vinculado</span>
                  <span className="text-xs font-bold text-slate-800 block mt-1">{selectedPilot.currentShift}</span>
                </div>
              </div>

              {/* Manobras deste Prático */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-blue-900 flex items-center gap-2 border-b border-slate-200 pb-1.5">
                  <Anchor className="w-4 h-4 text-blue-700" />
                  Histórico Operacional de Manobras Realizadas
                </h4>

                {pilotManeuvers.length === 0 ? (
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-500">
                    Nenhuma manobra registrada para este prático no período atual.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pilotManeuvers.map(m => (
                      <div 
                        key={m.id}
                        className="p-3 bg-white border border-slate-300 rounded-lg flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-black">{m.vesselSnapshot.name}</strong>
                            <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.2 rounded border border-slate-300">
                              {m.id}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-900 text-white rounded uppercase">
                              {m.maneuverType}
                            </span>
                          </div>
                          <div className="text-slate-600 text-[11px] mt-0.5">
                            Berço: <strong>{m.berthTo}</strong> · LOA: <strong>{m.vesselSnapshot.loa}m</strong> · Calado: <strong>{m.vesselSnapshot.draftFwd}m</strong>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-mono text-slate-500 block">
                            {formatDateTime(m.scheduledTime)}
                          </span>
                          <span className="text-[11px] font-bold text-blue-900">
                            {m.maneuverDurationFormatted || `${m.durationMinutes || 80} min`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border-2 border-black rounded-xl p-12 text-center text-slate-500 shadow flex flex-col items-center justify-center">
              <Users className="w-12 h-12 text-slate-400 mb-3" />
              <h3 className="font-bold text-base text-black">Nenhum prático registado</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                O sistema está iniciado do zero. Registe o primeiro prático da equipa para gerir a escala de turnos e o histórico de manobras.
              </p>
              <button
                onClick={() => setIsAddingPilot(true)}
                className="mt-4 px-4 py-2 bg-blue-900 text-white font-bold text-xs rounded-lg border border-black inline-flex items-center gap-2 hover:bg-blue-800"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Primeiro Prático</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Adicionar Prático */}
      {isAddingPilot && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h3 className="font-black text-base text-blue-900 uppercase">
                Cadastrar Novo Prático
              </h3>
              <button
                onClick={() => setIsAddingPilot(false)}
                className="p-1 rounded bg-black text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePilot} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-black mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={newPilotName}
                  onChange={(e) => setNewPilotName(e.target.value)}
                  placeholder="Ex: Cmte. Fernando Rocha"
                  className="w-full bg-white border border-black rounded px-3 py-2 text-xs font-semibold text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-black mb-1">
                  Número CIR / Habilitação *
                </label>
                <input
                  type="text"
                  value={newLicense}
                  onChange={(e) => setNewLicense(e.target.value)}
                  placeholder="Ex: CIR-2026-PRAT-09"
                  className="w-full bg-white border border-black rounded px-3 py-2 text-xs font-semibold text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-black mb-1">
                  Categoria
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as Pilot['category'])}
                  className="w-full bg-white border border-black rounded px-3 py-2 text-xs font-semibold text-black"
                >
                  <option value="Prático Sênior">Prático Sênior</option>
                  <option value="Prático Efetivo">Prático Efetivo</option>
                  <option value="Praticante de Prático">Praticante de Prático</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-black mb-1">
                  Telefone Operacional
                </label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+351 912 345 678"
                  className="w-full bg-white border border-black rounded px-3 py-2 text-xs font-semibold text-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-black mb-1">
                  Indicativo de Chamada VHF
                </label>
                <input
                  type="text"
                  value={newVhf}
                  onChange={(e) => setNewVhf(e.target.value)}
                  placeholder="Ex: Piloto Rocha (Ch 12/16)"
                  className="w-full bg-white border border-black rounded px-3 py-2 text-xs font-semibold text-black"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddingPilot(false)}
                  className="px-4 py-2 rounded border-2 border-black font-bold text-xs hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs border-2 border-black"
                >
                  Salvar Piloto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
