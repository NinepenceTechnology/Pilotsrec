import React, { useState, useMemo } from 'react';
import { 
  Anchor, 
  Search, 
  Plus, 
  Download, 
  Clock, 
  Ship, 
  FileText, 
  Camera, 
  CheckCircle2, 
  ArrowRight,
  Filter,
  Eye,
  Edit3,
  Trash2
} from 'lucide-react';
import { useMaritime } from '../context/MaritimeContext';
import { ManeuverStatus, ManeuverRecord } from '../types/maritime';
import { generatePilotageManeuverPDF } from '../utils/pdfGenerator';

interface OperationsViewProps {
  onOpenNewManeuverModal: () => void;
  onViewManeuverDetail: (id: string) => void;
  onOpenCertificate: (id: string) => void;
  onEditManeuver?: (maneuver: ManeuverRecord) => void;
}

export const OperationsView: React.FC<OperationsViewProps> = ({
  onOpenNewManeuverModal,
  onViewManeuverDetail,
  onOpenCertificate,
  onEditManeuver
}) => {
  const { maneuvers, exportManeuversToCsv, deleteManeuver } = useMaritime();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ManeuverStatus>('all');

  const filteredManeuvers = useMemo(() => {
    return maneuvers.filter(m => {
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (typeFilter !== 'all' && m.maneuverType !== typeFilter) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = m.vesselSnapshot.name.toLowerCase().includes(q);
        const matchImo = m.vesselSnapshot.imo.includes(q);
        const matchId = m.id.toLowerCase().includes(q);
        const matchPilot = m.pilotName.toLowerCase().includes(q);
        const matchPort = (m.vesselSnapshot.destination || '').toLowerCase().includes(q);

        if (!matchName && !matchImo && !matchId && !matchPilot && !matchPort) {
          return false;
        }
      }
      return true;
    });
  }, [maneuvers, statusFilter, typeFilter, searchTerm]);

  const handleDownloadPdfForRecord = async (record: typeof maneuvers[0], e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await generatePilotageManeuverPDF(record, { downloadImmediately: true });
    } catch (err) {
      console.error('Erro ao descarregar PDF:', err);
    }
  };

  return (
    <div className="space-y-5 text-slate-900">
      
      {/* Top Banner - White & Blue Theme */}
      <div className="bg-white border-2 border-black rounded-xl p-4 sm:p-5 shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-900 text-white font-bold px-2 py-0.5 rounded border border-black uppercase">
              Livro de Manobras
            </span>
            <span className="text-xs font-mono font-bold text-slate-600">
              {maneuvers.length} Manobras Registadas
            </span>
          </div>
          <h1 className="text-2xl font-black text-black tracking-tight mt-1 flex items-center gap-2">
            <Anchor className="w-6 h-6 text-blue-900" />
            REGISTO DE OPERAÇÕES DE PILOTAGEM
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Acompanhamento centralizado de Atracações, Mudanças, Puxanças e Desatracações com exportação em PDF e anexo de fotos.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportManeuversToCsv}
            className="px-3.5 py-2 rounded-lg border-2 border-black bg-white hover:bg-slate-100 font-bold text-xs text-black flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={onOpenNewManeuverModal}
            className="px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-black text-xs sm:text-sm tracking-wide border-2 border-black shadow flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>NOVO REGISTO</span>
          </button>
        </div>
      </div>

      {/* Quick Filters Bar - Clean, No Nested Tabs */}
      <div className="bg-slate-50 border-2 border-slate-300 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Procurar navio, IMO, piloto..."
            className="w-full bg-white border border-black rounded-md pl-9 pr-3 py-1.5 text-xs font-semibold text-black placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-900"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-start sm:justify-end">
          <span className="text-[11px] font-bold uppercase text-slate-600 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Tipo:
          </span>

          {[
            { id: 'all', label: 'Todos' },
            { id: 'atracacao', label: 'Atracação' },
            { id: 'mudanca', label: 'Mudança' },
            { id: 'puxanca', label: 'Puxança' },
            { id: 'desatracacao', label: 'Desatracação' }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setTypeFilter(type.id)}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-colors border ${
                typeFilter === type.id
                  ? 'bg-blue-900 text-white border-black shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Maneuver Records Cards List */}
      <div className="space-y-3">
        {filteredManeuvers.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-10 text-center space-y-3">
            <Anchor className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-base text-black">Nenhum registo encontrado</h3>
            <p className="text-xs text-slate-500">
              Não existem manobras correspondentes aos filtros selecionados.
            </p>
            <button
              onClick={onOpenNewManeuverModal}
              className="px-4 py-2 bg-blue-900 text-white font-bold text-xs rounded-lg border border-black inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Novo Registo Agora</span>
            </button>
          </div>
        ) : (
          filteredManeuvers.map((m) => {
            const v = m.vesselSnapshot;
            const tugsDisplayCount = m.tugCount !== undefined ? m.tugCount : (m.tugs?.length || 2);
            const timings = m.tugTimings || {
              arranque: '13:00',
              inicio: '13:25',
              fim: '14:45'
            };

            return (
              <div
                key={m.id}
                onClick={() => onViewManeuverDetail(m.id)}
                className="bg-white border-2 border-slate-300 hover:border-black rounded-xl p-4 sm:p-5 transition-all shadow-xs hover:shadow-md cursor-pointer space-y-3"
              >
                {/* Top Row: ID, Tipo de Manobra, Status, Ações */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black bg-black text-white px-2.5 py-0.5 rounded border border-black">
                      {m.id}
                    </span>

                    <span className="text-xs font-black px-2.5 py-0.5 rounded bg-blue-900 text-white uppercase tracking-wider">
                      {m.maneuverType.toUpperCase()}
                    </span>

                    {m.maneuverType !== 'desatracacao' && m.berthingModel && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                        {m.berthingModel}
                      </span>
                    )}

                    {m.photoUrl && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Foto Anexada</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* Botão Direto: Descarregar PDF Oficial com Foto */}
                    <button
                      type="button"
                      onClick={(e) => handleDownloadPdfForRecord(m, e)}
                      title="Descarregar PDF Oficial de Manobra com Anexo Fotográfico"
                      className="px-2.5 py-1.5 rounded-lg bg-black hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors border border-black"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-300" />
                      <span className="hidden sm:inline">PDF</span>
                    </button>

                    {onEditManeuver && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditManeuver(m);
                        }}
                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300"
                        title="Editar Registo da Manobra"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Tem a certeza que deseja eliminar a manobra ${m.id} (${m.vesselSnapshot.name})?`)) {
                          deleteManeuver(m.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                      title="Eliminar Manobra"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewManeuverDetail(m.id);
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-black border border-slate-300"
                      title="Ver Detalhes da Manobra"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Main Row: Vessel Particulars (LOA, BEAM, CALADO, PROCEDÊNCIA, PRÓXIMO PORTO) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Coluna 1: Nome do Navio e Especificações */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-black">
                        {v.name}
                      </h3>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 border border-slate-300 rounded text-slate-700">
                        IMO {v.imo}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 flex flex-wrap gap-x-3">
                      <span>Bandeira: <strong>{v.flag}</strong></span>
                      <span>·</span>
                      <span>LOA: <strong className="text-blue-900">{v.loa}m</strong></span>
                      <span>·</span>
                      <span>Boca: <strong className="text-blue-900">{v.beam}m</strong></span>
                      <span>·</span>
                      <span>GRT: <strong>{(v.grossTonnage || Math.round(v.loa * v.beam * 8)).toLocaleString()}</strong></span>
                    </div>

                    <div className="text-xs text-slate-600">
                      Calado: <strong>Vte {v.draftFwd}m / Ré {v.draftAft}m</strong>
                    </div>
                  </div>

                  {/* Coluna 2: Procedência, Destino & Horários */}
                  <div className="text-xs space-y-1 bg-slate-50 p-2.5 rounded border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">Procedência:</span>
                      <strong className="text-black">{v.origin || 'Porto Anterior'}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">Próximo Porto:</span>
                      <strong className="text-black">{v.destination || 'Próximo Porto'}</strong>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-blue-900">
                      <span className="font-bold">Piloto Responsável:</span>
                      <strong className="font-black">{m.pilotName}</strong>
                    </div>
                  </div>

                  {/* Coluna 3: Horários Operacionais (Primeiro Cabo, Desatracação, Atracação, Rebocadores) */}
                  <div className="text-xs space-y-1 bg-blue-50/70 p-2.5 rounded border border-blue-200">
                    <div className="grid grid-cols-3 gap-1 text-center font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 block font-sans font-bold">DESATRAC.</span>
                        <span className="font-bold text-black text-xs">
                          {m.unmooringTime || m.milestones.commenceManeuver || '13:20'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-sans font-bold">1º CABO</span>
                        <span className="font-bold text-black text-xs">
                          {m.firstLineAshored || m.milestones.firstLineAshored || '14:15'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-sans font-bold">ATRAC.</span>
                        <span className="font-bold text-black text-xs">
                          {m.berthingTime || m.milestones.allFastCompleted || '14:40'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-blue-200 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-700">
                        Rebocadores: <strong>{tugsDisplayCount} TBs</strong>
                      </span>
                      <span className="font-mono font-bold text-blue-900">
                        {m.maneuverDurationFormatted || `${m.durationMinutes || 80} min`}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-600 flex justify-between">
                      <span>Assistência:</span>
                      <span className="font-mono">
                        Arranque: {timings.arranque || '13:00'} · Início: {timings.inicio || '13:25'} · Fim: {timings.fim || '14:45'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Observações do Piloto se existirem */}
                {m.pilotRemarks && (
                  <div className="text-xs text-slate-700 bg-slate-50 px-3 py-1.5 rounded border border-slate-200 italic">
                    <span className="font-bold not-italic text-blue-900 mr-1">Observação:</span>
                    "{m.pilotRemarks}"
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
