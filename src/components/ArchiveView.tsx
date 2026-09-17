import React, { useState, useRef } from 'react';
import { 
  FolderArchive, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Ship, 
  FileText, 
  Search, 
  ShieldCheck, 
  HardDrive,
  Info
} from 'lucide-react';
import { useMaritime } from '../context/MaritimeContext';
import { 
  exportVesselsToExcel, 
  importVesselsFromExcel, 
  exportManeuversToExcel, 
  importManeuversFromExcel,
  exportFullJsonBackup,
  readJsonBackup
} from '../utils/excelImportExport';
import { Vessel } from '../types/maritime';

export const ArchiveView: React.FC = () => {
  const { 
    vessels, 
    maneuvers, 
    pilots, 
    alerts, 
    shifts, 
    addManeuver, 
    language, 
    t 
  } = useMaritime();

  const isPt = language === 'pt';

  // Excel & File Refs
  const vesselExcelInputRef = useRef<HTMLInputElement>(null);
  const maneuverExcelInputRef = useRef<HTMLInputElement>(null);
  const jsonBackupInputRef = useRef<HTMLInputElement>(null);

  // Status feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [vesselSearch, setVesselSearch] = useState('');

  const showFeedback = (type: 'success' | 'error' | 'info', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 6000);
  };

  // 1. Exportar Navios para Excel (.xlsx)
  const handleExportVessels = () => {
    try {
      exportVesselsToExcel(vessels);
      showFeedback('success', isPt ? `${vessels.length} navios exportados com sucesso para ficheiro Excel (.xlsx)!` : `${vessels.length} vessels successfully exported to Excel (.xlsx)!`);
    } catch (err) {
      showFeedback('error', `Erro ao exportar navios: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // 2. Importar Navios do Excel (.xlsx)
  const handleImportVessels = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const result = await importVesselsFromExcel(file);
      if (result.success && result.vessels.length > 0) {
        // Obter navios existentes no localStorage para mesclar
        const existingKey = 'pilots_records_vessels';
        let currentVessels: Vessel[] = [...vessels];
        try {
          const stored = localStorage.getItem(existingKey);
          if (stored) currentVessels = JSON.parse(stored);
        } catch {}

        const imoMap = new Map<string, Vessel>();
        currentVessels.forEach(v => imoMap.set(v.imo, v));
        result.vessels.forEach(v => imoMap.set(v.imo, v));

        const updated = Array.from(imoMap.values());
        localStorage.setItem(existingKey, JSON.stringify(updated));

        showFeedback('success', isPt 
          ? `Sucesso: ${result.importedCount} navios importados do ficheiro Excel! (Total na frota: ${updated.length})`
          : `Success: ${result.importedCount} vessels imported from Excel sheet! (Total in fleet: ${updated.length})`);
        
        // Recarregar a página suavemente após 1.5s para refletir novos navios
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showFeedback('error', result.errors.join(' | ') || (isPt ? 'Nenhum navio válido encontrado no Excel.' : 'No valid vessel found in Excel.'));
      }
    } catch (err) {
      showFeedback('error', `Erro ao processar Excel: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
      if (vesselExcelInputRef.current) vesselExcelInputRef.current.value = '';
    }
  };

  // 3. Exportar Manobras para Excel (.xlsx)
  const handleExportManeuvers = () => {
    try {
      exportManeuversToExcel(maneuvers);
      showFeedback('success', isPt ? `${maneuvers.length} manobras exportadas com sucesso para ficheiro Excel (.xlsx)!` : `${maneuvers.length} maneuvers successfully exported to Excel (.xlsx)!`);
    } catch (err) {
      showFeedback('error', `Erro ao exportar manobras: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // 4. Importar Manobras do Excel (.xlsx)
  const handleImportManeuvers = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const result = await importManeuversFromExcel(file);
      if (result.success && result.maneuvers.length > 0) {
        let count = 0;
        result.maneuvers.forEach(m => {
          addManeuver(m);
          count++;
        });
        showFeedback('success', isPt ? `Sucesso: ${count} registos de manobras importados com sucesso para o arquivo!` : `Success: ${count} maneuver records imported to archive!`);
      } else {
        showFeedback('error', result.errors.join(' | ') || (isPt ? 'Falha ao importar manobras do Excel.' : 'Failed to import maneuvers from Excel.'));
      }
    } catch (err) {
      showFeedback('error', `Erro ao importar: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
      if (maneuverExcelInputRef.current) maneuverExcelInputRef.current.value = '';
    }
  };

  // 5. Backup JSON Completo
  const handleExportBackup = () => {
    exportFullJsonBackup({
      maneuvers,
      vessels,
      pilots,
      alerts,
      shifts
    });
    showFeedback('success', isPt ? 'Cópia de segurança integral (JSON) descarregada com sucesso!' : 'Full backup (JSON) successfully downloaded!');
  };

  // 6. Restaurar Backup JSON
  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const res = await readJsonBackup(file);
      if (res.success && res.data) {
        if (res.data.vessels) localStorage.setItem('pilots_records_vessels', JSON.stringify(res.data.vessels));
        if (res.data.maneuvers) localStorage.setItem('pilots_records_maneuvers', JSON.stringify(res.data.maneuvers));
        if (res.data.pilots) localStorage.setItem('pilots_records_pilots', JSON.stringify(res.data.pilots));
        if (res.data.alerts) localStorage.setItem('pilots_records_alerts', JSON.stringify(res.data.alerts));
        if (res.data.shifts) localStorage.setItem('pilots_records_shifts', JSON.stringify(res.data.shifts));

        showFeedback('success', isPt ? 'Base de dados restaurada com sucesso! A recarregar...' : 'Database restored successfully! Reloading...');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        showFeedback('error', res.error || (isPt ? 'Formato de ficheiro de backup inválido.' : 'Invalid backup format.'));
      }
    } catch (err) {
      showFeedback('error', `Erro ao restaurar backup: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
      if (jsonBackupInputRef.current) jsonBackupInputRef.current.value = '';
    }
  };

  const filteredVessels = vessels.filter(v => 
    v.name.toLowerCase().includes(vesselSearch.toLowerCase()) ||
    v.imo.includes(vesselSearch) ||
    v.flag.toLowerCase().includes(vesselSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={vesselExcelInputRef}
        onChange={handleImportVessels}
        accept=".xlsx, .xls"
        className="hidden"
      />
      <input
        type="file"
        ref={maneuverExcelInputRef}
        onChange={handleImportManeuvers}
        accept=".xlsx, .xls"
        className="hidden"
      />
      <input
        type="file"
        ref={jsonBackupInputRef}
        onChange={handleRestoreBackup}
        accept=".json"
        className="hidden"
      />

      {/* Header Banner */}
      <div className="bg-slate-900 border border-cyan-800/40 rounded-2xl p-6 shadow-xl relative overflow-hidden text-white">
        <div className="absolute -right-8 -top-8 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-700/60 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5" />
                MARITIME DATA ARCHIVE & EXCEL ENGINE
              </span>
              <span className="text-xs font-mono text-slate-400">
                XLSX · CSV · JSON VAULT
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <FolderArchive className="w-8 h-8 text-cyan-400" />
              <span>{isPt ? 'Arquivo & Intercâmbio de Dados' : 'Archive & Data Interchange'}</span>
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl font-sans">
              {isPt 
                ? 'Importação e exportação de folhas de cálculo Excel (.xlsx) com a informação de registo dos navios, histórico de manobras e cópias integrais de segurança.'
                : 'Import and export of Excel (.xlsx) spreadsheets containing vessel registration data, maneuver logs, and complete system disaster recovery backups.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-cyan-800/40">
              <span className="text-slate-400 block text-[10px]">NAVIOS</span>
              <strong className="text-cyan-400 text-base">{vessels.length}</strong>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-cyan-800/40">
              <span className="text-slate-400 block text-[10px]">MANOBRAS</span>
              <strong className="text-white text-base">{maneuvers.length}</strong>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-cyan-800/40">
              <span className="text-slate-400 block text-[10px]">PILOTOS</span>
              <strong className="text-emerald-400 text-base">{pilots.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between border ${
          feedback.type === 'success' 
            ? 'bg-emerald-100 text-emerald-950 border-emerald-300' 
            : feedback.type === 'error'
            ? 'bg-rose-100 text-rose-950 border-rose-300'
            : 'bg-blue-100 text-blue-950 border-blue-300'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-700" /> : <AlertTriangle className="w-5 h-5 text-rose-700" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-600 hover:text-black">✕</button>
        </div>
      )}

      {/* Action Cards: Vessels Excel (Requested Feature) & Maneuvers Excel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: REGISTO DE NAVIOS (EXCEL) */}
        <div className="bg-white border-2 border-slate-300 rounded-2xl p-6 shadow-sm space-y-4 hover:border-black transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-900">
              <Ship className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
              .XLSX NAVIOS
            </span>
          </div>

          <div>
            <h2 className="text-base font-black text-slate-900">
              {isPt ? 'Registo de Navios (Excel)' : 'Vessels Registry (Excel)'}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              {isPt
                ? 'Exporte o catálogo completo de navios para Excel ou importe novos navios via folha de cálculo (.xlsx).'
                : 'Export complete vessel fleet to Excel or bulk import registered vessels via spreadsheet (.xlsx).'}
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200">
            <button
              onClick={handleExportVessels}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Download className="w-4 h-4 text-cyan-300" />
              <span>{isPt ? 'Exportar Navios (.xlsx)' : 'Export Vessels (.xlsx)'}</span>
            </button>

            <button
              onClick={() => vesselExcelInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-950 font-bold text-xs border border-blue-300 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Upload className="w-4 h-4 text-blue-800" />
              <span>{isPt ? 'Importar Navios (.xlsx)' : 'Import Vessels (.xlsx)'}</span>
            </button>
          </div>
        </div>

        {/* Card 2: REGISTO DE MANOBRAS (EXCEL) */}
        <div className="bg-white border-2 border-slate-300 rounded-2xl p-6 shadow-sm space-y-4 hover:border-black transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-900">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200">
              .XLSX MANOBRAS
            </span>
          </div>

          <div>
            <h2 className="text-base font-black text-slate-900">
              {isPt ? 'Livro de Manobras (Excel)' : 'Maneuver Logs (Excel)'}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              {isPt
                ? 'Exportação oficial de manobras, rebocadores e ocorrências para análise estatística e capitania.'
                : 'Official export of pilotage operations, tug timings and incident sheets for port authorities.'}
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200">
            <button
              onClick={handleExportManeuvers}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              <span>{isPt ? 'Exportar Manobras (.xlsx)' : 'Export Maneuvers (.xlsx)'}</span>
            </button>

            <button
              onClick={() => maneuverExcelInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-bold text-xs border border-emerald-300 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Upload className="w-4 h-4 text-emerald-800" />
              <span>{isPt ? 'Importar Manobras (.xlsx)' : 'Import Maneuvers (.xlsx)'}</span>
            </button>
          </div>
        </div>

        {/* Card 3: BACKUP INTEGRAL DO SISTEMA (JSON) */}
        <div className="bg-white border-2 border-slate-300 rounded-2xl p-6 shadow-sm space-y-4 hover:border-black transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-900">
              <Database className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-200">
              .JSON BACKUP
            </span>
          </div>

          <div>
            <h2 className="text-base font-black text-slate-900">
              {isPt ? 'Cópia de Segurança Integral' : 'Full Disaster Recovery Vault'}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              {isPt
                ? 'Preserve todo o estado local (navios, manobras, pilotos, escalas e alertas) num único ficheiro de segurança.'
                : 'Backup all application state (vessels, operations, pilots and alerts) into a single recovery file.'}
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200">
            <button
              onClick={handleExportBackup}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Download className="w-4 h-4 text-purple-300" />
              <span>{isPt ? 'Baixar Backup Integral (JSON)' : 'Download Full Backup (JSON)'}</span>
            </button>

            <button
              onClick={() => jsonBackupInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-950 font-bold text-xs border border-purple-300 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Upload className="w-4 h-4 text-purple-800" />
              <span>{isPt ? 'Restaurar Ficheiro JSON' : 'Restore JSON File'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fleet Catalog Preview & Search */}
      <div className="bg-white border-2 border-slate-300 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Ship className="w-5 h-5 text-blue-900" />
              <span>{isPt ? 'Catálogo de Navios no Arquivo' : 'Vessels in Archive'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {isPt ? 'Pesquise e consulte as especificações técnicas da frota disponível para pilotagem' : 'Search and inspect registered technical vessel particulars for pilotage'}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={vesselSearch}
              onChange={(e) => setVesselSearch(e.target.value)}
              placeholder={isPt ? 'Filtrar por nome, IMO, bandeira...' : 'Filter by name, IMO, flag...'}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3">NAVIO / SHIP</th>
                <th className="p-3 font-mono">IMO</th>
                <th className="p-3">BANDEIRA</th>
                <th className="p-3">TIPO</th>
                <th className="p-3 font-mono">LOA (m)</th>
                <th className="p-3 font-mono">BOCA (m)</th>
                <th className="p-3 font-mono">CALADOS (m)</th>
                <th className="p-3">AGÊNCIA</th>
                <th className="p-3">PROCEDÊNCIA &rarr; DESTINO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredVessels.slice(0, 15).map(v => (
                <tr key={v.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="p-3 font-black text-slate-900">{v.name}</td>
                  <td className="p-3 font-mono text-slate-700 font-semibold">{v.imo}</td>
                  <td className="p-3 text-slate-800">{v.flag}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-700">
                      {v.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-blue-900">{v.loa}m</td>
                  <td className="p-3 font-mono font-bold text-blue-900">{v.beam}m</td>
                  <td className="p-3 font-mono text-slate-700">Vte {v.currentDraftFwd}m / Ré {v.currentDraftAft}m</td>
                  <td className="p-3 text-slate-700">{v.agent || 'N/A'}</td>
                  <td className="p-3 text-slate-600 text-[11px]">{v.origin || 'N/A'} &rarr; {v.destination || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredVessels.length === 0 && (
          <div className="text-center py-8 text-xs text-slate-500">
            {isPt ? 'Nenhum navio encontrado com os critérios de pesquisa.' : 'No vessel found matching search query.'}
          </div>
        )}
      </div>
    </div>
  );
};
