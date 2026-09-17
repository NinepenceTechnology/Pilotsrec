import React, { useState, useRef } from 'react';
import { 
  Ship, 
  Search, 
  Plus, 
  Anchor, 
  X,
  ExternalLink,
  ChevronRight,
  Globe,
  Loader2
} from 'lucide-react';
import { useMaritime } from '../context/MaritimeContext';
import { Vessel, VesselType } from '../types/maritime';
import { formatVesselType, formatDateTime } from '../utils/formatters';
import { 
  searchVesselsWithSuggestions, 
  fetchVesselFinderOnline, 
  fetchVesselDetailsOnline,
  VesselSearchResult 
} from '../utils/vesselDatabase';

interface VesselsViewProps {
  onSelectVesselForManeuver: (vessel: Vessel) => void;
}

export const VesselsView: React.FC<VesselsViewProps> = ({ onSelectVesselForManeuver }) => {
  const { vessels, maneuvers, addVessel, isOnline } = useMaritime();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(vessels[0] || null);
  const [isAddingVessel, setIsAddingVessel] = useState(false);

  // Auto-suggestion state for vessel creation modal
  const [vesselSuggestions, setVesselSuggestions] = useState<VesselSearchResult[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchTimeoutRef = useRef<any>(null);

  // Form state initialized with blank/zero fields (no hardcoded fake vessel data)
  const [formData, setFormData] = useState<Omit<Vessel, 'id'>>({
    name: '',
    imo: '',
    callSign: '',
    flag: '',
    flagCode: '',
    type: 'porta_conteiner',
    loa: 0,
    beam: 0,
    maxDraft: 0,
    currentDraftFwd: 0,
    currentDraftAft: 0,
    agent: '',
    origin: '',
    destination: '',
    dwt: 0,
    grossTonnage: 0,
    terminalPreference: '',
    yearBuilt: 0
  });

  const handleShipNameInput = (nameQuery: string) => {
    setFormData(prev => ({ ...prev, name: nameQuery }));

    if (nameQuery.trim().length < 2) {
      setVesselSuggestions([]);
      setIsDropdownOpen(false);
      setIsSearchingOnline(false);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      return;
    }

    // 1. Search local database
    const local = searchVesselsWithSuggestions(nameQuery, vessels, maneuvers);
    setVesselSuggestions(local);
    setIsDropdownOpen(local.length > 0);

    // 2. Search VesselFinder.com
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (isOnline) {
      setIsSearchingOnline(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const online = await fetchVesselFinderOnline(nameQuery);
          if (online && online.length > 0) {
            setVesselSuggestions(prev => {
              const seenImos = new Set(prev.map(p => p.vessel.imo));
              const merged = [...prev];
              for (const item of online) {
                if (!seenImos.has(item.vessel.imo)) {
                  seenImos.add(item.vessel.imo);
                  merged.push(item);
                }
              }
              return merged;
            });
            setIsDropdownOpen(true);
          }
        } catch {
        } finally {
          setIsSearchingOnline(false);
        }
      }, 400);
    }
  };

  const applySuggestionToForm = async (res: VesselSearchResult) => {
    const v = res.vessel;
    setFormData({
      name: v.name,
      imo: v.imo,
      callSign: v.callSign || '',
      flag: v.flag || 'Internacional',
      flagCode: v.flagCode || '',
      type: v.type,
      loa: v.loa || 0,
      beam: v.beam || 0,
      maxDraft: v.maxDraft || 0,
      currentDraftFwd: v.currentDraftFwd || 0,
      currentDraftAft: v.currentDraftAft || 0,
      agent: v.agent || '',
      origin: v.origin || '',
      destination: v.destination || '',
      dwt: (v as any).dwt || 0,
      grossTonnage: v.grossTonnage || 0,
      terminalPreference: (v as any).terminalPreference || '',
      yearBuilt: (v as any).yearBuilt || 0
    });
    setIsDropdownOpen(false);

    // If IMO present, fetch live details
    if (v.imo && v.imo.length >= 4 && isOnline) {
      try {
        const details = await fetchVesselDetailsOnline(v.imo);
        if (details) {
          setFormData(prev => ({
            ...prev,
            maxDraft: details.draft || prev.maxDraft,
            destination: details.destination || prev.destination
          }));
        }
      } catch {}
    }
  };

  const filteredVessels = vessels.filter(v => {
    if (typeFilter !== 'all' && v.type !== typeFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        v.imo.includes(q) ||
        v.flag.toLowerCase().includes(q) ||
        v.callSign.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateVessel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.imo.trim()) return;

    addVessel({
      ...formData,
      name: formData.name.toUpperCase().trim()
    });

    setIsAddingVessel(false);
  };

  const vesselManeuvers = selectedVessel 
    ? maneuvers.filter(m => m.vesselId === selectedVessel.id || m.vesselSnapshot.imo === selectedVessel.imo)
    : [];

  return (
    <div className="space-y-6 pb-12 text-slate-900">
      {/* Header */}
      <div className="bg-white border-2 border-black rounded-xl p-5 shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-900 text-white font-bold px-2 py-0.5 rounded border border-black uppercase">
              Frota de Navios Cadastrados
            </span>
          </div>
          <h2 className="text-2xl font-black text-black tracking-tight mt-1 flex items-center gap-2.5">
            <Ship className="w-6 h-6 text-blue-900" />
            Registo Técnico de Embarcações
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Especificações de engenharia naval (LOA, Boca, Calados, GRT) e histórico de manobras
          </p>
        </div>

        <button
          onClick={() => setIsAddingVessel(true)}
          className="px-4 py-2.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-2 transition-all border-2 border-black shadow"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Cadastrar Novo Navio</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-50 border-2 border-slate-300 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por nome, IMO, bandeira..."
            className="w-full bg-white border border-black rounded-md pl-9 pr-3 py-1.5 text-xs font-semibold text-black placeholder:text-slate-400"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-700">Tipo:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white border border-black rounded px-2.5 py-1 text-xs font-bold text-black"
          >
            <option value="all">Todos os Tipos</option>
            <option value="porta_conteiner">Porta-Contêiner</option>
            <option value="petroleiro">Petroleiro</option>
            <option value="graneleiro">Graneleiro</option>
            <option value="gasoso_gnl_glp">GNL / GLP</option>
            <option value="quimico">Químico</option>
            <option value="ro_ro_veiculos">Ro-Ro Veículos</option>
          </select>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List */}
        <div className="bg-white border-2 border-black rounded-xl p-4 shadow space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-black text-sm uppercase text-blue-900">
              Navios no Sistema ({filteredVessels.length})
            </h3>
            <span className="text-xs text-slate-500">Clique para inspecionar</span>
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredVessels.map(v => {
              const isSelected = selectedVessel?.id === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVessel(v)}
                  className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-900 text-white border-black shadow'
                      : 'bg-white text-black border-slate-200 hover:border-black hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-sm">{v.name}</h4>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                      isSelected ? 'bg-black text-white border-blue-600' : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}>
                      IMO {v.imo}
                    </span>
                  </div>

                  <div className={`text-xs mt-1 flex items-center justify-between ${
                    isSelected ? 'text-blue-100' : 'text-slate-600'
                  }`}>
                    <span>Bandeira: <strong>{v.flag}</strong></span>
                    <span>LOA: <strong>{v.loa}m</strong> · Boca: <strong>{v.beam}m</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Details */}
        <div className="lg:col-span-2 bg-white border-2 border-black rounded-xl p-5 shadow space-y-5">
          {selectedVessel ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-black text-white px-2 py-0.5 rounded font-mono font-bold">
                      IMO {selectedVessel.imo}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded border border-blue-300 uppercase">
                      {formatVesselType(selectedVessel.type)}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-black mt-1">
                    {selectedVessel.name}
                  </h2>
                  <p className="text-xs text-slate-600">
                    Bandeira: <strong>{selectedVessel.flag}</strong> · Indicativo CallSign: <strong>{selectedVessel.callSign}</strong>
                  </p>
                </div>

                <button
                  onClick={() => onSelectVesselForManeuver(selectedVessel)}
                  className="px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-black text-xs border-2 border-black shadow flex items-center gap-1.5"
                >
                  <Anchor className="w-4 h-4" />
                  <span>REGISTAR MANOBRA DESTE NAVIO</span>
                </button>
              </div>

              {/* Dimensions Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-300 p-3 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">LOA (Comprimento)</span>
                  <span className="text-lg font-black text-blue-900">{selectedVessel.loa ? `${selectedVessel.loa} m` : '___'}</span>
                </div>

                <div className="bg-slate-50 border border-slate-300 p-3 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Beam (Largura / Boca)</span>
                  <span className="text-lg font-black text-blue-900">{selectedVessel.beam ? `${selectedVessel.beam} m` : '___'}</span>
                </div>

                <div className="bg-slate-50 border border-slate-300 p-3 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Calado Operacional</span>
                  <span className="text-lg font-black text-black">
                    {(selectedVessel.currentDraftFwd || selectedVessel.currentDraftAft) 
                      ? `Vte ${selectedVessel.currentDraftFwd || '___'}m / Ré ${selectedVessel.currentDraftAft || '___'}m`
                      : '___'}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-300 p-3 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">GRT (Arqueação Bruta)</span>
                  <span className="text-lg font-black text-black">{selectedVessel.grossTonnage ? `${selectedVessel.grossTonnage.toLocaleString()} Ton` : '___'}</span>
                </div>
              </div>

              {/* Voyage Info */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg text-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-500 block font-bold text-[10px]">PROCEDÊNCIA</span>
                  <span className="font-bold text-black text-sm">{selectedVessel.origin || '___'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-bold text-[10px]">PRÓXIMO PORTO</span>
                  <span className="font-bold text-black text-sm">{selectedVessel.destination || '___'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-bold text-[10px]">AGÊNCIA MARÍTIMA</span>
                  <span className="font-bold text-black text-sm">{selectedVessel.agent || '___'}</span>
                </div>
              </div>

              {/* Maneuver History for this vessel */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-blue-900 flex items-center gap-2 border-b border-slate-200 pb-1.5">
                  <Anchor className="w-4 h-4 text-blue-700" />
                  Histórico de Manobras Desta Embarcação ({vesselManeuvers.length})
                </h4>

                {vesselManeuvers.length === 0 ? (
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-500">
                    Nenhuma manobra registrada anteriormente para este navio.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {vesselManeuvers.map(m => (
                      <div 
                        key={m.id}
                        className="p-3 bg-white border border-slate-300 rounded-lg flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold uppercase text-blue-900">{m.maneuverType}</span>
                            <span className="font-mono text-slate-500">({m.id})</span>
                            <span className="text-slate-600 font-semibold">· {m.berthTo}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Prático: <strong>{m.pilotName}</strong> · Desatracação: <strong>{m.unmooringTime || '13:20'}</strong> · Atracação: <strong>{m.berthingTime || '14:40'}</strong>
                          </div>
                        </div>

                        <span className="font-mono text-xs font-bold text-black">
                          {formatDateTime(m.scheduledTime)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-10 text-center text-slate-400">
              Selecione um navio para ver especificações.
            </div>
          )}
        </div>
      </div>

      {/* Modal Add Vessel */}
      {isAddingVessel && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h3 className="font-black text-base text-blue-900 uppercase">
                Cadastrar Novo Navio
              </h3>
              <button
                onClick={() => setIsAddingVessel(false)}
                className="p-1 rounded bg-black text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateVessel} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className="block font-bold uppercase text-black mb-1 flex items-center justify-between">
                    <span>Nome do Navio *</span>
                    {isSearchingOnline && (
                      <span className="text-[10px] text-blue-700 flex items-center gap-1 font-normal">
                        <Loader2 className="w-3 h-3 animate-spin" /> Buscando VesselFinder...
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleShipNameInput(e.target.value)}
                    placeholder="___ (Digite para autocompletar)"
                    className="w-full bg-white border border-black rounded p-2 font-bold uppercase text-black placeholder:text-slate-400"
                    required
                  />

                  {/* Suggestions dropdown */}
                  {isDropdownOpen && vesselSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border-2 border-black rounded-lg shadow-2xl z-50 max-h-48 overflow-y-auto divide-y divide-slate-100">
                      <div className="px-3 py-1 bg-blue-900 text-white text-[10px] font-bold uppercase flex justify-between">
                        <span>Sugestões Encontradas ({vesselSuggestions.length})</span>
                        <span>Clique para preencher</span>
                      </div>
                      {vesselSuggestions.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => applySuggestionToForm(item)}
                          className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center justify-between gap-2"
                        >
                          <div>
                            <div className="font-bold text-black flex items-center gap-1.5">
                              <span>{item.vessel.name}</span>
                              <span className="text-[10px] font-mono text-slate-500">IMO {item.vessel.imo}</span>
                            </div>
                            <div className="text-[10px] text-slate-600">
                              {item.vessel.flag || 'Internacional'} · LOA {item.vessel.loa || '___'}m · Boca {item.vessel.beam || '___'}m
                            </div>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${item.sourceBadgeColor}`}>
                            {item.sourceLabel}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold uppercase text-black mb-1">Número IMO *</label>
                  <input
                    type="text"
                    value={formData.imo}
                    onChange={(e) => setFormData({ ...formData, imo: e.target.value })}
                    placeholder="___"
                    className="w-full bg-white border border-black rounded p-2 font-bold text-black placeholder:text-slate-400 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold uppercase text-black mb-1">LOA (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.loa === 0 ? '' : formData.loa}
                    onChange={(e) => setFormData({ ...formData, loa: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
                    placeholder="___"
                    className="w-full bg-white border border-black rounded p-2 font-bold text-black placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-black mb-1">Boca / Largura (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.beam === 0 ? '' : formData.beam}
                    onChange={(e) => setFormData({ ...formData, beam: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
                    placeholder="___"
                    className="w-full bg-white border border-black rounded p-2 font-bold text-black placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-black mb-1">GRT</label>
                  <input
                    type="number"
                    value={formData.grossTonnage === 0 ? '' : formData.grossTonnage}
                    onChange={(e) => setFormData({ ...formData, grossTonnage: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 })}
                    placeholder="___"
                    className="w-full bg-white border border-black rounded p-2 font-bold text-black placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-black mb-1">Nacionalidade / Bandeira</label>
                  <input
                    type="text"
                    value={formData.flag}
                    onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                    placeholder="___"
                    className="w-full bg-white border border-black rounded p-2 font-bold text-black placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-black mb-1">Tipo de Navio</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as VesselType })}
                    className="w-full bg-white border border-black rounded p-2 font-bold text-black"
                  >
                    <option value="porta_conteiner">Porta-Contêiner</option>
                    <option value="petroleiro">Petroleiro</option>
                    <option value="graneleiro">Graneleiro</option>
                    <option value="gasoso_gnl_glp">GNL / GLP</option>
                    <option value="quimico">Químico</option>
                    <option value="ro_ro_veiculos">Ro-Ro Veículos</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-black mb-1">Procedência</label>
                  <input
                    type="text"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    placeholder="___ (Ex: Porto de Maputo ou Beira)"
                    className="w-full bg-white border border-black rounded p-2 font-bold text-black placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-black mb-1">Próximo Porto</label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    placeholder="___ (Ex: Porto de Nacala ou Durban)"
                    className="w-full bg-white border border-black rounded p-2 font-bold text-black placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddingVessel(false)}
                  className="px-4 py-2 rounded border-2 border-black font-bold hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-900 hover:bg-blue-800 text-white font-bold border-2 border-black"
                >
                  Salvar Navio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
