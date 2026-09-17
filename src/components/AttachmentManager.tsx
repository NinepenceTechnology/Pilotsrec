import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Paperclip, 
  Clipboard, 
  FileText, 
  Trash2, 
  Eye, 
  Download, 
  X, 
  Plus, 
  Check, 
  FileCheck,
  Ship,
  Anchor,
  AlertTriangle,
  CloudRain,
  Ruler,
  Maximize2
} from 'lucide-react';
import { ManeuverAttachment, AttachmentCategory } from '../types/maritime';

export interface AttachmentCategoryMeta {
  key: AttachmentCategory;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  badgeClass: string;
  description: string;
}

export const ATTACHMENT_CATEGORIES: AttachmentCategoryMeta[] = [
  {
    key: 'pilot_slip',
    label: 'Bilhete de Praticagem Assinado (Timesheet / Slip)',
    shortLabel: 'Bilhete de Praticagem',
    icon: <FileCheck className="w-3.5 h-3.5 text-blue-700" />,
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
    description: 'Comprovativo assinado pelo Comandante com horários operacionais'
  },
  {
    key: 'draft_survey',
    label: 'Folha de Calados (Draft Survey / Leituras)',
    shortLabel: 'Folha de Calados',
    icon: <Ruler className="w-3.5 h-3.5 text-cyan-700" />,
    badgeClass: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    description: 'Marcas de calado avistadas à proa, meia-nau e popa'
  },
  {
    key: 'photo_vessel',
    label: 'Fotografia do Navio (Costado, Proa, Popa, Escada)',
    shortLabel: 'Foto do Navio',
    icon: <Ship className="w-3.5 h-3.5 text-emerald-700" />,
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    description: 'Identificação visual, costado, escada de prático ou estado do casco'
  },
  {
    key: 'photo_maneuver',
    label: 'Manobra em Curso (Rebocadores / Atracação)',
    shortLabel: 'Manobra / Rebocadores',
    icon: <Anchor className="w-3.5 h-3.5 text-indigo-700" />,
    badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    description: 'Rebocadores passados, posicionamento e aproximação ao berço'
  },
  {
    key: 'berth_condition',
    label: 'Condições do Berço (Defensas / Cabeços / Cais)',
    shortLabel: 'Condição do Berço',
    icon: <FileText className="w-3.5 h-3.5 text-amber-700" />,
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    description: 'Estado das defensas, cabeços de amarração ou restrições de cais'
  },
  {
    key: 'checklist_doc',
    label: 'Checklist de Segurança / Troca de Informações (MPX)',
    shortLabel: 'Checklist / MPX',
    icon: <Check className="w-3.5 h-3.5 text-teal-700" />,
    badgeClass: 'bg-teal-100 text-teal-900 border-teal-300',
    description: 'Formulário MPX, teste de máquinas e leme preenchido a bordo'
  },
  {
    key: 'incident_report',
    label: 'Registo de Avaria / Ocorrência / Incidente',
    shortLabel: 'Avaria / Ocorrência',
    icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />,
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
    description: 'Registo fotográfico de cabo partido, avaria ou avistamento relevante'
  },
  {
    key: 'weather_radar',
    label: 'Boletim Meteorológico / Carta Náutica / Radar / Marés',
    shortLabel: 'Meteorologia / Carta',
    icon: <CloudRain className="w-3.5 h-3.5 text-purple-700" />,
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
    description: 'Imagem de radar, previsão de ventos, rajadas ou carta local'
  },
  {
    key: 'other_doc',
    label: 'Outro Documento / Relatório em PDF',
    shortLabel: 'Outro Documento',
    icon: <Paperclip className="w-3.5 h-3.5 text-slate-700" />,
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    description: 'Qualquer outro comprovativo ou nota relevante da faina'
  }
];

export const getCategoryMeta = (cat: AttachmentCategory): AttachmentCategoryMeta => {
  return ATTACHMENT_CATEGORIES.find(c => c.key === cat) || ATTACHMENT_CATEGORIES[ATTACHMENT_CATEGORIES.length - 1];
};

interface AttachmentManagerProps {
  attachments: ManeuverAttachment[];
  onChange: (attachments: ManeuverAttachment[]) => void;
  title?: string;
  readOnly?: boolean;
}

export const AttachmentManager: React.FC<AttachmentManagerProps> = ({
  attachments,
  onChange,
  title = 'CENTRO DE ANEXOS DA MANOBRA (MULTIFONTE)',
  readOnly = false
}) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDefaultCategory, setSelectedDefaultCategory] = useState<AttachmentCategory>('pilot_slip');
  const [activePreview, setActivePreview] = useState<ManeuverAttachment | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Auto-clear notification
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFiles = (files: FileList | File[], defaultCategory: AttachmentCategory) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    let addedCount = 0;
    fileArray.forEach((file) => {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isImage = file.type.startsWith('image/');

      if (!isPdf && !isImage) {
        setStatusMessage(`Aviso: O ficheiro "${file.name}" não é imagem nem PDF.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) return;

        // Deduzir categoria a partir do nome do arquivo se relevante
        let guessedCategory = defaultCategory;
        const lower = file.name.toLowerCase();
        if (lower.includes('calado') || lower.includes('draft')) guessedCategory = 'draft_survey';
        else if (lower.includes('bilhete') || lower.includes('slip') || lower.includes('ticket')) guessedCategory = 'pilot_slip';
        else if (lower.includes('avaria') || lower.includes('dano') || lower.includes('incidente')) guessedCategory = 'incident_report';
        else if (lower.includes('mpx') || lower.includes('checklist')) guessedCategory = 'checklist_doc';
        else if (lower.includes('berco') || lower.includes('cais') || lower.includes('defensa')) guessedCategory = 'berth_condition';
        else if (lower.includes('rebocador') || lower.includes('tug')) guessedCategory = 'photo_maneuver';
        else if (lower.includes('navio') || lower.includes('vessel') || lower.includes('ship')) guessedCategory = 'photo_vessel';

        const newAttachment: ManeuverAttachment = {
          id: `ATT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          category: guessedCategory,
          dataUrl,
          fileType: isPdf ? 'pdf' : 'image',
          mimeType: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
          sizeBytes: file.size,
          uploadedAt: new Date().toISOString(),
          caption: ''
        };

        onChange([...attachments, newAttachment]);
        addedCount++;
        setStatusMessage(`Anexo "${file.name}" adicionado com sucesso!`);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files, selectedDefaultCategory);
      e.target.value = '';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files, selectedDefaultCategory);
      e.target.value = '';
    }
  };

  // Clipboard Paste handler (Ctrl+V)
  const handlePasteFromClipboard = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.read) {
        // Fallback info
        setStatusMessage('Pressione Ctrl+V diretamente no teclado para colar imagens da área de transferência.');
        return;
      }

      const clipboardItems = await navigator.clipboard.read();
      let foundImage = false;

      for (const item of clipboardItems) {
        const imageType = item.types.find(type => type.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const file = new File([blob], `Colagem_${new Date().toISOString().slice(11, 19).replace(/:/g, '-')}.png`, { type: imageType });
          processFiles([file], selectedDefaultCategory);
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        setStatusMessage('Nenhuma imagem encontrada na área de transferência. Copie uma imagem primeiro (PrintScreen ou copiar).');
      }
    } catch {
      setStatusMessage('Dica: Use Ctrl+V no teclado sobre esta janela para colar a imagem copiada.');
    }
  };

  // Global paste event listener when modal is open
  useEffect(() => {
    if (readOnly) return;
    const handleWindowPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFiles([file], selectedDefaultCategory);
            e.preventDefault();
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handleWindowPaste);
    return () => window.removeEventListener('paste', handleWindowPaste);
  }, [attachments, selectedDefaultCategory, readOnly]);

  const handleRemoveAttachment = (id: string) => {
    onChange(attachments.filter(a => a.id !== id));
  };

  const handleUpdateCaption = (id: string, caption: string) => {
    onChange(attachments.map(a => a.id === id ? { ...a, caption } : a));
  };

  const handleUpdateCategory = (id: string, category: AttachmentCategory) => {
    onChange(attachments.map(a => a.id === id ? { ...a, category } : a));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!readOnly) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (readOnly) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files, selectedDefaultCategory);
    }
  };

  const downloadAttachmentFile = (att: ManeuverAttachment) => {
    const link = document.createElement('a');
    link.href = att.dataUrl;
    link.download = att.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="border-2 border-black rounded-xl p-4 bg-slate-50/80 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Paperclip className="w-5 h-5 text-blue-900" />
          <h3 className="text-sm font-black uppercase text-blue-950 tracking-tight">
            {title}
          </h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-black bg-blue-900 text-white">
            {attachments.length} {attachments.length === 1 ? 'anexo' : 'anexos'}
          </span>
        </div>

        <div className="text-xs text-slate-600 font-medium">
          Fotos e PDFs incorporados automaticamente no relatório oficial
        </div>
      </div>

      {statusMessage && (
        <div className="p-2.5 rounded-lg bg-emerald-100 border border-emerald-400 text-emerald-900 text-xs font-bold flex items-center justify-between">
          <span>{statusMessage}</span>
          <button 
            type="button" 
            onClick={() => setStatusMessage(null)}
            className="text-emerald-800 hover:text-emerald-950"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Controls & Actions */}
      {!readOnly && (
        <div className="space-y-3">
          {/* Default category picker when uploading */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-700">Classificação padrão para novos anexos:</span>
            <select
              value={selectedDefaultCategory}
              onChange={(e) => setSelectedDefaultCategory(e.target.value as AttachmentCategory)}
              className="bg-white border-2 border-black rounded-md px-2.5 py-1 text-xs font-bold text-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-700"
            >
              {ATTACHMENT_CATEGORIES.map(cat => (
                <option key={cat.key} value={cat.key}>
                  {cat.shortLabel}
                </option>
              ))}
            </select>
          </div>

          {/* Hidden Inputs */}
          <input
            type="file"
            ref={cameraInputRef}
            accept="image/*"
            capture="environment"
            onChange={handleCameraCapture}
            className="hidden"
          />
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*,application/pdf"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Opção 1: Tirar foto pela Câmera */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="p-3 bg-white hover:bg-blue-50 text-blue-950 border-2 border-black rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95 group"
            >
              <div className="p-1.5 rounded-md bg-blue-100 text-blue-900 group-hover:bg-blue-200">
                <Camera className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-black">1. Tirar Foto (Câmera)</div>
                <div className="text-[10px] text-slate-500 font-normal">Captura ao vivo no navio/cais</div>
              </div>
            </button>

            {/* Opção 2: Carregar Ficheiros do Dispositivo */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-white hover:bg-emerald-50 text-emerald-950 border-2 border-black rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95 group"
            >
              <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-900 group-hover:bg-emerald-200">
                <Upload className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-black">2. Carregar Ficheiros</div>
                <div className="text-[10px] text-slate-500 font-normal">Fotos (JPG/PNG) ou PDFs</div>
              </div>
            </button>

            {/* Opção 3: Colar da Área de Transferência */}
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="p-3 bg-white hover:bg-amber-50 text-amber-950 border-2 border-black rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95 group"
            >
              <div className="p-1.5 rounded-md bg-amber-100 text-amber-900 group-hover:bg-amber-200">
                <Clipboard className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-black">3. Colar Imagem (Ctrl+V)</div>
                <div className="text-[10px] text-slate-500 font-normal">PrintScreen / Área de Transferência</div>
              </div>
            </button>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
              isDragOver 
                ? 'border-blue-700 bg-blue-100/70 text-blue-900 scale-[1.01]' 
                : 'border-slate-400 bg-white hover:bg-slate-50 text-slate-600'
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-1.5">
              <Plus className="w-5 h-5 text-blue-800" />
              <p className="text-xs font-bold text-black">
                Arraste ficheiros para aqui ou clique para selecionar múltiplos anexos
              </p>
              <p className="text-[11px] text-slate-500">
                Suporta: Fotografias de calado, bilhete assinado, avarias, radar meteorológico e relatórios em PDF
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista / Galeria de Anexos */}
      {attachments.length === 0 ? (
        <div className="p-6 bg-white border border-dashed border-slate-300 rounded-xl text-center">
          <Paperclip className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-600">Nenhum anexo adicionado a este registo</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Use os botões acima para fotografar com a câmera, carregar do dispositivo ou colar com Ctrl+V.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {attachments.map((att, idx) => {
              const meta = getCategoryMeta(att.category);
              const isImage = att.fileType === 'image';

              return (
                <div
                  key={att.id || idx}
                  className="bg-white border-2 border-black rounded-lg p-3 shadow-xs space-y-2 relative flex flex-col justify-between"
                >
                  {/* Top Bar of Card */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${meta.badgeClass}`}>
                        {meta.icon}
                        <span className="truncate">{meta.shortLabel}</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        #{idx + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setActivePreview(att)}
                        className="p-1 rounded hover:bg-slate-100 text-slate-700 hover:text-blue-800"
                        title="Visualizar em tamanho grande"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadAttachmentFile(att)}
                        className="p-1 rounded hover:bg-slate-100 text-slate-700 hover:text-emerald-800"
                        title="Descarregar ficheiro original"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="p-1 rounded hover:bg-rose-100 text-slate-400 hover:text-rose-700"
                          title="Remover anexo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail and Details */}
                  <div className="flex items-center gap-3">
                    <div 
                      onClick={() => setActivePreview(att)}
                      className="w-20 h-16 rounded-md bg-slate-900 border border-slate-300 shrink-0 overflow-hidden cursor-pointer flex items-center justify-center relative group"
                    >
                      {isImage ? (
                        <img 
                          src={att.dataUrl} 
                          alt={att.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-rose-300">
                          <FileText className="w-6 h-6" />
                          <span className="text-[9px] font-bold mt-0.5">PDF</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-black truncate" title={att.name}>
                        {att.name}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {att.fileType.toUpperCase()} {att.sizeBytes ? `· ${formatFileSize(att.sizeBytes)}` : ''}
                      </p>
                      {att.uploadedAt && (
                        <p className="text-[10px] text-slate-400">
                          {new Date(att.uploadedAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Editable / Viewable Caption & Category */}
                  {!readOnly ? (
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                        <div className="col-span-1">
                          <select
                            value={att.category}
                            onChange={(e) => handleUpdateCategory(att.id, e.target.value as AttachmentCategory)}
                            className="w-full bg-slate-50 border border-slate-300 rounded px-1.5 py-1 text-[11px] font-bold text-slate-800"
                          >
                            {ATTACHMENT_CATEGORIES.map(cat => (
                              <option key={cat.key} value={cat.key}>
                                {cat.shortLabel}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={att.caption || ''}
                            onChange={(e) => handleUpdateCaption(att.id, e.target.value)}
                            placeholder="Legenda / Anotação (ex: calado lido à ré, assinado comandante...)"
                            className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-[11px] text-black placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-700"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    att.caption && (
                      <div className="pt-1.5 border-t border-slate-100 text-[11px] text-slate-700 italic">
                        "{att.caption}"
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>

          {!readOnly && attachments.length > 1 && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Tem a certeza que deseja remover todos os anexos deste registo?')) {
                    onChange([]);
                  }
                }}
                className="text-[11px] font-bold text-rose-700 hover:text-rose-900 underline"
              >
                Limpar todos os anexos ({attachments.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal de Pré-visualização Ampliada */}
      {activePreview && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setActivePreview(null)}
        >
          <div 
            className="bg-white border-2 border-black rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-3 bg-blue-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Paperclip className="w-4 h-4 text-blue-300" />
                <span className="text-xs sm:text-sm font-bold truncate">{activePreview.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-800 text-blue-200 border border-blue-600 font-bold uppercase">
                  {getCategoryMeta(activePreview.category).shortLabel}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadAttachmentFile(activePreview)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreview(null)}
                  className="p-1 rounded hover:bg-white/20 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-4 bg-slate-900 flex items-center justify-center min-h-[300px]">
              {activePreview.fileType === 'image' ? (
                <img
                  src={activePreview.dataUrl}
                  alt={activePreview.name}
                  className="max-h-[70vh] max-w-full object-contain rounded shadow"
                />
              ) : (
                <div className="bg-white p-6 rounded-xl text-center space-y-3 max-w-md">
                  <FileText className="w-12 h-12 text-rose-600 mx-auto" />
                  <div>
                    <p className="font-bold text-sm text-black">{activePreview.name}</p>
                    <p className="text-xs text-slate-500 mt-1">Documento PDF incorporado ao registo</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadAttachmentFile(activePreview)}
                    className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 mx-auto"
                  >
                    <Download className="w-4 h-4" />
                    <span>Abrir / Descarregar Documento PDF</span>
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer Caption */}
            {activePreview.caption && (
              <div className="p-3 bg-slate-100 border-t border-slate-300 text-xs text-slate-800">
                <span className="font-bold">Legenda:</span> {activePreview.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
