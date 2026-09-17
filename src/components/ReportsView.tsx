import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  FileText, 
  Anchor, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  Ship, 
  ShieldCheck,
  Check,
  Eye,
  Upload,
  FileUp,
  Database,
  AlertCircle,
  RefreshCw,
  Layers
} from 'lucide-react';
import { useMaritime } from '../context/MaritimeContext';
import { ManeuverRecord } from '../types/maritime';
import { 
  formatDateTime, 
  formatManeuverType, 
  formatVesselType, 
  formatManeuverStatus 
} from '../utils/formatters';
import { importManeuversFromExcel, readJsonBackup } from '../utils/excelImportExport';
import { generatePilotageManeuverPDF } from '../utils/pdfGenerator';

export const ReportsView: React.FC = () => {
  const { 
    maneuvers, 
    exportManeuversToCsv, 
    exportIncidentsToCsv,
    exportManeuversToXlsx,
    exportFullBackup,
    importManeuversBatch,
    restoreFullBackup
  } = useMaritime();

  const [selectedManeuverId, setSelectedManeuverId] = useState<string>(
    maneuvers[0]?.id || ''
  );
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Import State
  const fileInputExcelRef = useRef<HTMLInputElement>(null);
  const fileInputJsonRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message: string;
    details?: string[];
  }>({ type: 'idle', message: '' });

  const selectedManeuver = maneuvers.find(m => m.id === selectedManeuverId) || maneuvers[0];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!selectedManeuver) return;
    setIsGeneratingPdf(true);
    try {
      await generatePilotageManeuverPDF(selectedManeuver, { downloadImmediately: true });
    } catch (e) {
      console.error(e);
      alert('Erro ao gerar certificado PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleExcelFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus({ type: 'loading', message: 'A ler ficheiro Excel (.xlsx)...' });

    try {
      const result = await importManeuversFromExcel(file);
      if (result.success && result.maneuvers.length > 0) {
        const added = importManeuversBatch(result.maneuvers);
        setImportStatus({
          type: 'success',
          message: `Importação com sucesso: ${added} manobras adicionadas ao sistema.`,
          details: result.errors.length > 0 ? result.errors : undefined
        });
      } else {
        setImportStatus({
          type: 'error',
          message: 'Não foi possível importar registos válidos da folha Excel.',
          details: result.errors
        });
      }
    } catch (err) {
      setImportStatus({
        type: 'error',
        message: `Erro ao processar ficheiro: ${err instanceof Error ? err.message : String(err)}`
      });
    } finally {
      if (fileInputExcelRef.current) fileInputExcelRef.current.value = '';
    }
  };

  const handleJsonBackupChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus({ type: 'loading', message: 'A restaurar backup JSON...' });

    try {
      const result = await readJsonBackup(file);
      if (result.success && result.data) {
        const ok = restoreFullBackup(result.data);
        if (ok) {
          setImportStatus({
            type: 'success',
            message: 'Backup integral restaurado com sucesso (Manobras, Navios, Práticos, Alertas).'
          });
        } else {
          setImportStatus({
            type: 'error',
            message: 'Falha ao restaurar dados no banco de dados local.'
          });
        }
      } else {
        setImportStatus({
          type: 'error',
          message: result.error || 'Ficheiro JSON de backup inválido.'
        });
      }
    } catch (err) {
      setImportStatus({
        type: 'error',
        message: `Erro ao ler backup: ${err instanceof Error ? err.message : String(err)}`
      });
    } finally {
      if (fileInputJsonRef.current) fileInputJsonRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hidden file inputs */}
      <input
        ref={fileInputExcelRef}
        type="file"
        accept=".xlsx, .xls"
        className="hidden"
        onChange={handleExcelFileChange}
      />
      <input
        ref={fileInputJsonRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleJsonBackupChange}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-blue-900" />
            Central de Relatórios, Certificados & Dados
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Emissão de certificados oficiais (folha de manobra), exportação/importação Excel (.xlsx/CSV) e backup integral
          </p>
        </div>

        {/* Action Buttons Hub */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Export Excel (.xlsx) */}
          <button
            onClick={exportManeuversToXlsx}
            className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 border border-black shadow-xs transition-all"
            title="Exportar todas as manobras e tabelas para folha de cálculo Excel oficial (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel (.xlsx)</span>
          </button>

          {/* Import Excel */}
          <button
            onClick={() => fileInputExcelRef.current?.click()}
            className="px-3.5 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 border border-black shadow-xs transition-all"
            title="Importar manobras a partir de um ficheiro Excel (.xlsx)"
          >
            <Upload className="w-4 h-4" />
            <span>Importar Excel</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={exportManeuversToCsv}
            className="px-3 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1.5 border border-slate-300 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-blue-900" />
            <span>CSV</span>
          </button>

          {/* Backup JSON */}
          <button
            onClick={exportFullBackup}
            className="px-3 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1.5 border border-slate-300 shadow-xs"
            title="Exportar backup completo de todo o sistema em JSON"
          >
            <Database className="w-3.5 h-3.5 text-amber-700" />
            <span>Backup JSON</span>
          </button>

          {/* Restore JSON */}
          <button
            onClick={() => fileInputJsonRef.current?.click()}
            className="px-3 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1.5 border border-slate-300 shadow-xs"
            title="Restaurar backup integral JSON"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
            <span>Restaurar</span>
          </button>
        </div>
      </div>

      {/* Import feedback banner */}
      {importStatus.type !== 'idle' && (
        <div className={`p-4 rounded-xl border-2 ${
          importStatus.type === 'loading' ? 'bg-blue-50 border-blue-400 text-blue-900' :
          importStatus.type === 'success' ? 'bg-emerald-50 border-emerald-600 text-emerald-950' :
          'bg-rose-50 border-rose-500 text-rose-950'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
              {importStatus.type === 'loading' && <RefreshCw className="w-4 h-4 animate-spin" />}
              {importStatus.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
              {importStatus.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-700" />}
              <span>{importStatus.message}</span>
            </div>
            <button
              onClick={() => setImportStatus({ type: 'idle', message: '' })}
              className="text-xs font-bold underline ml-4 hover:opacity-75"
            >
              Fechar
            </button>
          </div>
          {importStatus.details && importStatus.details.length > 0 && (
            <ul className="mt-2 text-xs list-disc list-inside space-y-0.5 opacity-90 font-mono">
              {importStatus.details.slice(0, 5).map((d, i) => (
                <li key={i}>{d}</li>
              ))}
              {importStatus.details.length > 5 && (
                <li>...e mais {importStatus.details.length - 5} alertas/linhas.</li>
              )}
            </ul>
          )}
        </div>
      )}

      {/* Official Certificate Selector & Preview */}
      <div className="bg-white rounded-xl border-2 border-black p-5 sm:p-6 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-900" />
              Certificado Oficial de Pilotagem (Folha de Manobra / Pilotage Certificate)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Documento comprobatório padrão IMO para faturamento, Capitania dos Portos e auditorias de segurança
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={selectedManeuverId}
              onChange={(e) => setSelectedManeuverId(e.target.value)}
              className="bg-slate-50 text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-900"
            >
              {maneuvers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.id} - {m.vesselSnapshot.name} ({m.status.toUpperCase()})
                </option>
              ))}
              {maneuvers.length === 0 && (
                <option value="">Nenhuma manobra registada</option>
              )}
            </select>

            <button
              onClick={handleDownloadPdf}
              disabled={!selectedManeuver || isGeneratingPdf}
              className="px-3.5 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 border border-black shadow-xs active:scale-95 transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-blue-200" />
              <span>{isGeneratingPdf ? 'Gerando...' : 'Descarregar PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={!selectedManeuver}
              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 border border-black shadow-xs active:scale-95 transition-all disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span>Imprimir Certificado</span>
            </button>
          </div>
        </div>

        {/* Official Printable Certificate Layout */}
        {selectedManeuver ? (
          <div className="print-area bg-white text-slate-950 p-6 sm:p-8 rounded-xl shadow-lg border-2 border-black space-y-6 max-w-4xl mx-auto font-sans">
            {/* Header of the certificate */}
            <div className="border-b-2 border-black pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold border border-black">
                  <Anchor className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tight text-slate-950 uppercase">
                    ESTAÇÃO DE PILOTAGEM DE PORTO E BARRA
                  </h1>
                  <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">
                    Pilotage Certificate / Folha Oficial de Manobra Portuária
                  </p>
                </div>
              </div>

              <div className="text-right font-mono text-xs">
                <div className="font-bold text-sm text-blue-900 border border-blue-900 px-2 py-0.5 rounded bg-blue-50">
                  REF: {selectedManeuver.id}
                </div>
                <div className="text-slate-500 mt-1">
                  Data: {formatDateTime(selectedManeuver.scheduledTime)}
                </div>
              </div>
            </div>

            {/* Vessel Information Block */}
            <div className="space-y-1">
              <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                1. Identificação do Navio & Dados Técnicos / Vessel Particulars
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-300 text-xs">
                <div>
                  <span className="text-slate-500 font-bold block text-[10px]">Nome do Navio</span>
                  <span className="font-black text-slate-950 uppercase">{selectedManeuver.vesselSnapshot.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[10px]">Número IMO</span>
                  <span className="font-mono font-bold">{selectedManeuver.vesselSnapshot.imo}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[10px]">Bandeira</span>
                  <span className="font-semibold">{selectedManeuver.vesselSnapshot.flag}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[10px]">Tipo de Navio</span>
                  <span className="font-semibold">{formatVesselType(selectedManeuver.vesselSnapshot.type)}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[10px]">LOA / Boca</span>
                  <span className="font-mono">{selectedManeuver.vesselSnapshot.loa}m / {selectedManeuver.vesselSnapshot.beam}m</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[10px]">Calados (V/R)</span>
                  <span className="font-mono">{selectedManeuver.vesselSnapshot.draftFwd}m / {selectedManeuver.vesselSnapshot.draftAft}m</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[10px]">Arqueação Bruta (GRT)</span>
                  <span className="font-mono">{selectedManeuver.vesselSnapshot.grossTonnage || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[10px]">Agência Marítima</span>
                  <span className="font-medium truncate">{selectedManeuver.vesselSnapshot.agent || 'Agência Local'}</span>
                </div>
              </div>
            </div>

            {/* Maneuver Operations Block */}
            <div className="space-y-1">
              <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                2. Execução da Manobra & Marcos Horários / Maneuver Timestamps
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-300 text-xs">
                <div>
                  <span className="text-slate-500 font-bold block text-[10px]">Tipo de Operação</span>
                  <span className="font-black text-blue-900 uppercase">{formatManeuverType(selectedManeuver.maneuverType)}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[10px]">
                    {selectedManeuver.maneuverType === 'desatracacao' ? 'Local / Berço Saída' : 'Local / Berço Destino'}
                  </span>
                  <span className="font-bold text-slate-900">{selectedManeuver.berthTo || 'Cais'}</span>
                </div>
                {selectedManeuver.maneuverType !== 'desatracacao' && (
                  <div>
                    <span className="text-slate-500 font-bold block text-[10px]">Modelo Atracação</span>
                    <span className="font-medium">{selectedManeuver.berthingModel || 'Bombordo (BB)'}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500 font-bold block text-[10px]">Piloto Responsável</span>
                  <span className="font-black text-slate-900">{selectedManeuver.pilotName}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[10px]">Desatracação / Início</span>
                  <span className="font-mono font-bold">{selectedManeuver.unmooringTime || selectedManeuver.milestones?.commenceManeuver || '--:--'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[10px]">Primeiro Cabo em Terra</span>
                  <span className="font-mono font-bold">{selectedManeuver.firstLineAshored || selectedManeuver.milestones?.firstLineAshored || '--:--'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[10px]">Atracação / Terminado</span>
                  <span className="font-mono font-bold">{selectedManeuver.berthingTime || selectedManeuver.milestones?.allFastCompleted || '--:--'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[10px]">Duração Registada</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {selectedManeuver.maneuverDurationFormatted || (selectedManeuver.durationMinutes ? `${selectedManeuver.durationMinutes} min` : 'Concluída')}
                  </span>
                </div>
              </div>
            </div>

            {/* Tugboats Section */}
            <div className="space-y-1">
              <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                3. Assistência de Rebocadores / Tugboat Assistance
              </div>
              <div className="bg-slate-50 p-3 rounded-lg text-xs border border-slate-300">
                <div className="flex items-center justify-between mb-2 text-[11px] font-bold text-slate-700 pb-1 border-b border-slate-200">
                  <span>Rebocadores Empregados: {selectedManeuver.tugCount ?? selectedManeuver.tugs.length}</span>
                  {selectedManeuver.tugTimings && (
                    <span className="font-mono text-[10px] text-slate-600">
                      Horários: Arranque {selectedManeuver.tugTimings.arranque || '--:--'} | Início {selectedManeuver.tugTimings.inicio || '--:--'} | Fim {selectedManeuver.tugTimings.fim || '--:--'}
                    </span>
                  )}
                </div>
                {selectedManeuver.tugs.length > 0 ? (
                  <div className="space-y-1 font-mono">
                    {selectedManeuver.tugs.map((t, idx) => (
                      <div key={idx} className="flex justify-between border-b border-slate-200 pb-1 last:border-0 last:pb-0">
                        <span className="font-bold">{t.tugName} ({t.bollardPullTons}T BP)</span>
                        <span className="text-slate-600">Posição: {t.position.toUpperCase()} · Tempo: {t.hoursAssisted}h</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-500 italic text-center py-1">
                    Operação executada conforme regras locais de apoio de rebocadores.
                  </div>
                )}
              </div>
            </div>

            {/* Pilot remarks */}
            <div className="space-y-1">
              <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                4. Observações de Pilotagem / Pilot Remarks & Conditions
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-300 text-xs italic text-slate-800 leading-relaxed font-serif">
                "{selectedManeuver.pilotRemarks || 'Manobra conduzida com total observância das regras marítimas internacionais, balizamento e segurança de navegação.'}"
              </div>
            </div>

            {/* Signatures Dual Block */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t-2 border-black text-center">
              <div className="space-y-2">
                <div className="h-10 border-b border-slate-400 mx-6 flex items-end justify-center font-serif italic text-slate-900 text-sm">
                  {selectedManeuver.pilotName}
                </div>
                <div className="text-xs font-black text-slate-950 uppercase">
                  Assinatura do Piloto de Serviço
                </div>
                <div className="text-[10px] text-slate-500">
                  {selectedManeuver.pilotName} · Registo CIR Pilotagem
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-10 border-b border-slate-400 mx-6 flex items-end justify-center font-serif italic text-slate-900 text-sm">
                  {selectedManeuver.masterName || 'Capt. Master of Vessel'}
                </div>
                <div className="text-xs font-black text-slate-950 uppercase">
                  Assinatura & Carimbo do Comandante
                </div>
                <div className="text-[10px] text-slate-500">
                  Master of {selectedManeuver.vesselSnapshot.name}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 border border-dashed border-slate-300 rounded-xl">
            Nenhuma manobra selecionada ou registada no sistema.
          </div>
        )}
      </div>
    </div>
  );
};
