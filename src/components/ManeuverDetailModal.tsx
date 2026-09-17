import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Anchor, 
  Clock, 
  Ship, 
  FileText, 
  Download, 
  Camera, 
  Compass, 
  Layers, 
  Check, 
  MapPin, 
  ExternalLink,
  Edit3
} from 'lucide-react';
import { useMaritime } from '../context/MaritimeContext';
import { formatDateTime } from '../utils/formatters';
import { generatePilotageManeuverPDF } from '../utils/pdfGenerator';
import { ManeuverRecord, ManeuverAttachment } from '../types/maritime';
import { AttachmentManager } from './AttachmentManager';

interface ManeuverDetailModalProps {
  maneuverId: string | null;
  onClose: () => void;
  onOpenCertificate: (id: string) => void;
  onEditManeuver?: (maneuver: ManeuverRecord) => void;
}

export const ManeuverDetailModal: React.FC<ManeuverDetailModalProps> = ({
  maneuverId,
  onClose,
  onOpenCertificate,
  onEditManeuver
}) => {
  const { maneuvers, updateManeuver } = useMaritime();

  if (!maneuverId) return null;

  const maneuver = maneuvers.find(m => m.id === maneuverId);
  if (!maneuver) return null;

  const [remarks, setRemarks] = useState(maneuver.pilotRemarks || '');
  const [isEditingRemarks, setIsEditingRemarks] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Normalizar anexos existentes ou foto legada
  const currentAttachments: ManeuverAttachment[] = maneuver.attachments && maneuver.attachments.length > 0
    ? maneuver.attachments
    : (maneuver.photoUrl ? [{
        id: 'legacy-photo-view',
        name: maneuver.photoTitle || 'Foto Oficial da Manobra',
        category: 'pilot_slip' as const,
        dataUrl: maneuver.photoUrl,
        fileType: 'image' as const,
        mimeType: 'image/jpeg',
        uploadedAt: maneuver.createdAt,
        caption: maneuver.photoTitle
      }] : []);

  const handleAttachmentsChange = (newAtts: ManeuverAttachment[]) => {
    const firstImg = newAtts.find(a => a.fileType === 'image');
    updateManeuver(maneuver.id, {
      attachments: newAtts,
      photoUrl: firstImg?.dataUrl || undefined,
      photoTitle: newAtts[0]?.name || undefined
    });
  };

  const handleSaveRemarks = () => {
    updateManeuver(maneuver.id, { pilotRemarks: remarks });
    setIsEditingRemarks(false);
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      await generatePilotageManeuverPDF(maneuver, { downloadImmediately: true });
    } catch (e) {
      console.error('Erro ao gerar PDF da manobra:', e);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const v = maneuver.vesselSnapshot;
  const timings = maneuver.tugTimings || {
    arranque: '13:00',
    inicio: '13:25',
    fim: '14:45'
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto transition-opacity duration-200">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-white border-2 border-black rounded-xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] text-slate-900"
      >
        
        {/* Header - White & Naval Blue with Black Accents */}
        <div className="bg-blue-900 text-white px-5 py-4 border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-black border border-blue-400 flex items-center justify-center text-white">
              <Anchor className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-white bg-black px-2 py-0.5 rounded border border-blue-800">
                  {maneuver.id}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-800 text-blue-100 border border-blue-600 uppercase">
                  {maneuver.maneuverType.toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white mt-0.5">
                {v.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-3.5 py-1.5 rounded-lg bg-black hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 border border-blue-400 transition-colors"
            >
              <Download className="w-4 h-4 text-blue-300" />
              <span>{isDownloadingPdf ? 'Gerando...' : 'Descarregar PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-black hover:bg-slate-800 text-white flex items-center justify-center transition-colors border border-blue-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-900">
          
          {/* Seção 1: Dados do Navio Requeridos */}
          <div className="border-2 border-slate-300 rounded-lg p-4 bg-slate-50 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-2 border-b border-slate-200 pb-1.5">
              <Ship className="w-4 h-4 text-blue-700" />
              1. DADOS DO NAVIO (LOA, BEAM, CALADO, PROCEDÊNCIA, PRÓXIMO PORTO)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded border border-slate-300">
                <span className="text-[10px] text-slate-500 font-bold block">NOME DO NAVIO</span>
                <span className="font-bold text-black text-sm">{v.name}</span>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-300">
                <span className="text-[10px] text-slate-500 font-bold block">NACIONALIDADE / BANDEIRA</span>
                <span className="font-bold text-black">{v.flag}</span>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-300">
                <span className="text-[10px] text-slate-500 font-bold block">LOA (COMPRIMENTO)</span>
                <span className="font-bold text-blue-900">{v.loa} metros</span>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-300">
                <span className="text-[10px] text-slate-500 font-bold block">BEAM (LARGURA / BOCA)</span>
                <span className="font-bold text-blue-900">{v.beam} metros</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded border border-slate-300">
                <span className="text-[10px] text-slate-500 font-bold block">CALADO VANTE / RÉ</span>
                <span className="font-bold text-black">{v.draftFwd}m / {v.draftAft}m</span>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-300">
                <span className="text-[10px] text-slate-500 font-bold block">GRT (ARQUEAÇÃO)</span>
                <span className="font-bold text-black">{(v.grossTonnage || Math.round(v.loa * v.beam * 8)).toLocaleString()} Ton</span>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-300">
                <span className="text-[10px] text-slate-500 font-bold block">PROCEDÊNCIA</span>
                <span className="font-bold text-black">{v.origin || 'Porto Anterior'}</span>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-300">
                <span className="text-[10px] text-slate-500 font-bold block">PRÓXIMO PORTO</span>
                <span className="font-bold text-black">{v.destination || 'Próximo Porto'}</span>
              </div>
            </div>
          </div>

          {/* Seção 2: Horários Operacionais e Modelo de Atracação */}
          <div className="border-2 border-slate-300 rounded-lg p-4 bg-white space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-2 border-b border-slate-200 pb-1.5">
              <Clock className="w-4 h-4 text-blue-700" />
              {maneuver.maneuverType === 'desatracacao'
                ? '2. HORÁRIOS DA OPERAÇÃO DE DESATRACAÇÃO & TEMPO DE MANOBRA'
                : '2. HORÁRIOS DA OPERAÇÃO, MODELO DE ATRACAÇÃO & TEMPO DE MANOBRA'}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-blue-50/70 p-2.5 rounded border border-blue-200">
                <span className="text-[10px] text-blue-900 font-bold block">DESATRACAÇÃO</span>
                <span className="font-mono font-black text-sm text-black">
                  {maneuver.unmooringTime || maneuver.milestones.commenceManeuver || '13:20'}
                </span>
              </div>
              <div className="bg-blue-50/70 p-2.5 rounded border border-blue-200">
                <span className="text-[10px] text-blue-900 font-bold block">PRIMEIRO CABO</span>
                <span className="font-mono font-black text-sm text-black">
                  {maneuver.firstLineAshored || maneuver.milestones.firstLineAshored || '14:15'}
                </span>
              </div>
              <div className="bg-blue-50/70 p-2.5 rounded border border-blue-200">
                <span className="text-[10px] text-blue-900 font-bold block">ATRACAÇÃO</span>
                <span className="font-mono font-black text-sm text-black">
                  {maneuver.berthingTime || maneuver.milestones.allFastCompleted || '14:40'}
                </span>
              </div>
              <div className="bg-blue-900 text-white p-2.5 rounded border border-black">
                <span className="text-[10px] text-blue-200 font-bold block">TEMPO DE MANOBRAS</span>
                <span className="font-mono font-black text-sm">
                  {maneuver.maneuverDurationFormatted || `${maneuver.durationMinutes || 80} min`}
                </span>
              </div>
            </div>

            <div className={`grid grid-cols-1 ${maneuver.maneuverType === 'desatracacao' ? '' : 'sm:grid-cols-2'} gap-3 text-xs pt-1`}>
              {maneuver.maneuverType !== 'desatracacao' && (
                <div className="p-2 bg-slate-50 rounded border border-slate-300">
                  <span className="text-[10px] text-slate-500 font-bold block">MODELO DE ATRACAÇÃO</span>
                  <span className="font-bold text-black text-sm">
                    {maneuver.berthingModel || 'Costado Bombordo (BB)'}
                  </span>
                </div>
              )}
              <div className="p-2 bg-slate-50 rounded border border-slate-300">
                <span className="text-[10px] text-slate-500 font-bold block">PILOTO RESPONSÁVEL</span>
                <span className="font-bold text-black text-sm">{maneuver.pilotName}</span>
              </div>
            </div>
          </div>

          {/* Seção 3: Rebocadores & Tempos de Assistência */}
          <div className="border-2 border-slate-300 rounded-lg p-4 bg-slate-50 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-2 border-b border-slate-200 pb-1.5">
              <Anchor className="w-4 h-4 text-blue-700" />
              3. REBOCADORES & TEMPO DE ASSISTÊNCIA (ARRANQUE, INÍCIO, FIM)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded border border-slate-300">
                <span className="text-[10px] text-slate-500 font-bold block">NÚMERO DE REBOCADORES</span>
                <span className="font-black text-base text-blue-900">
                  {maneuver.tugCount !== undefined ? maneuver.tugCount : (maneuver.tugs?.length || 2)} Rebocadores
                </span>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-300">
                <span className="text-[10px] text-slate-500 font-bold block">ARRANQUE (SAÍDA BASE)</span>
                <span className="font-mono font-bold text-black text-sm">{timings.arranque || '13:00'}</span>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-300">
                <span className="text-[10px] text-slate-500 font-bold block">INÍCIO (EMPUXO / CABOS)</span>
                <span className="font-mono font-bold text-black text-sm">{timings.inicio || '13:25'}</span>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-300">
                <span className="text-[10px] text-slate-500 font-bold block">FIM (LIBERAÇÃO)</span>
                <span className="font-mono font-bold text-black text-sm">{timings.fim || '14:45'}</span>
              </div>
            </div>
          </div>

          {/* Seção 4: Observação */}
          <div className="border-2 border-slate-300 rounded-lg p-4 bg-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-blue-900">4. OBSERVAÇÃO DO PILOTO</span>
              {!isEditingRemarks ? (
                <button
                  type="button"
                  onClick={() => setIsEditingRemarks(true)}
                  className="text-xs text-blue-700 hover:underline font-bold"
                >
                  Editar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveRemarks}
                  className="text-xs bg-blue-900 text-white px-2 py-0.5 rounded font-bold"
                >
                  Salvar
                </button>
              )}
            </div>

            {isEditingRemarks ? (
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-black rounded p-2 text-xs font-semibold text-black"
              />
            ) : (
              <p className="text-xs text-slate-800 leading-relaxed italic bg-slate-50 p-2.5 rounded border border-slate-200">
                "{remarks || 'Nenhuma observação registrada.'}"
              </p>
            )}
          </div>

          {/* Seção 5: Centro de Anexos Oficiais da Manobra */}
          <AttachmentManager
            attachments={currentAttachments}
            onChange={handleAttachmentsChange}
            title="5. ANEXOS OFICIAIS DA MANOBRA (BILHETES, CALADOS, FOTOS E DOCUMENTOS)"
          />

        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 font-mono">
            Registado em: {formatDateTime(maneuver.createdAt)}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onEditManeuver && (
              <button
                onClick={() => {
                  onClose();
                  onEditManeuver(maneuver);
                }}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-lg border border-black shadow flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-4 h-4 text-black" />
                <span>Editar Registo</span>
              </button>
            )}

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-lg border border-black shadow flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4 text-blue-300" />
              <span>Certificado PDF</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-200 border-2 border-black font-bold text-xs rounded-lg text-black"
            >
              Fechar
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
