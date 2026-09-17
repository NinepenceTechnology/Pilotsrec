import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Anchor, 
  X, 
  Ship, 
  Clock, 
  Check, 
  Camera, 
  Upload, 
  FileText, 
  Download, 
  Wifi, 
  WifiOff, 
  Globe, 
  Search,
  Compass,
  Layers,
  Sparkles,
  AlertCircle,
  Calendar,
  Activity
} from 'lucide-react';
import { useMaritime } from '../context/MaritimeContext';
import { 
  ManeuverType, 
  BerthingModel, 
  Vessel, 
  VesselType, 
  TugAssistance,
  ManeuverRecord,
  ManeuverAttachment
} from '../types/maritime';
import { AttachmentManager } from './AttachmentManager';
import { 
  searchVesselsWithSuggestions, 
  fetchVesselFinderOnline,
  fetchVesselDetailsOnline,
  VesselSearchResult 
} from '../utils/vesselDatabase';
import { generatePilotageManeuverPDF } from '../utils/pdfGenerator';

interface ManeuverFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVessel?: Vessel | null;
  editManeuver?: ManeuverRecord | null;
}

export const ManeuverFormModal: React.FC<ManeuverFormModalProps> = ({ 
  isOpen, 
  onClose, 
  initialVessel,
  editManeuver
}) => {
  const { vessels, maneuvers, pilots, addManeuver, updateManeuver, addVessel, addPilot, weather, currentUser, language } = useMaritime();

  if (!isOpen) return null;

  // Online status detection
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Form states - Exactly requested by user:
  // 1. NOME DO NAVIO, LOA, BEAM, CALADO, PROCEDENCIA, PROXIMO PORTO
  const [shipName, setShipName] = useState<string>(editManeuver?.vesselSnapshot.name || initialVessel?.name || '');
  const [imoNumber, setImoNumber] = useState<string>(editManeuver?.vesselSnapshot.imo || initialVessel?.imo || '');
  const [nationality, setNationality] = useState<string>(editManeuver?.vesselSnapshot.flag || initialVessel?.flag || '');
  const [vesselType, setVesselType] = useState<VesselType>(editManeuver?.vesselSnapshot.type || initialVessel?.type || 'porta_conteiner');
  const [loa, setLoa] = useState<number>(editManeuver?.vesselSnapshot.loa || initialVessel?.loa || 0);
  const [beam, setBeam] = useState<number>(editManeuver?.vesselSnapshot.beam || initialVessel?.beam || 0);
  const [grt, setGrt] = useState<number>(editManeuver?.vesselSnapshot.grossTonnage || initialVessel?.grossTonnage || 0);
  const [draftFwd, setDraftFwd] = useState<number>(editManeuver?.vesselSnapshot.draftFwd || initialVessel?.currentDraftFwd || 0);
  const [draftAft, setDraftAft] = useState<number>(editManeuver?.vesselSnapshot.draftAft || initialVessel?.currentDraftAft || 0);
  const [origin, setOrigin] = useState<string>(editManeuver?.vesselSnapshot.origin || initialVessel?.origin || '');
  const [nextPort, setNextPort] = useState<string>(editManeuver?.vesselSnapshot.destination || initialVessel?.destination || '');

  // Data da Manobra (Permite registo e alteração retroativa)
  const [maneuverDate, setManeuverDate] = useState<string>(() => {
    if (editManeuver?.maneuverDate) return editManeuver.maneuverDate;
    if (editManeuver?.scheduledTime) return editManeuver.scheduledTime.slice(0, 10);
    return new Date().toISOString().slice(0, 10);
  });

  // 2. HORÁRIOS OPERACIONAIS (ATRACAÇÃO, MUDANÇA, PUXANÇA, DESATRACAÇÃO)
  // Piloto a bordo (POB)
  const [pilotOnBoardTime, setPilotOnBoardTime] = useState<string>(
    editManeuver?.pilotOnBoardTime || editManeuver?.milestones?.pilotOnBoard || ''
  );
  // Último cabo (Mudança / Puxança / Desatracação)
  const [lastLineTime, setLastLineTime] = useState<string>(
    editManeuver?.lastLineCastOffTime || editManeuver?.milestones?.lastLineCastOff || editManeuver?.unmooringTime || ''
  );
  // Primeiro cabo (Atracação / Mudança / Puxança)
  const [firstLineTime, setFirstLineTime] = useState<string>(
    editManeuver?.firstLineAshored || editManeuver?.milestones?.firstLineAshored || ''
  );
  // Atracado (Atracação / Mudança / Puxança)
  const [berthingTime, setBerthingTime] = useState<string>(
    editManeuver?.allFastBerthingTime || editManeuver?.berthingTime || editManeuver?.milestones?.allFastCompleted || ''
  );
  // Desembarque do piloto (Todas as manobras)
  const [pilotDisembarkedTime, setPilotDisembarkedTime] = useState<string>(
    editManeuver?.pilotDisembarkedTime || editManeuver?.milestones?.pilotDisembarked || ''
  );
  // Modelo de atracação
  const [berthingModel, setBerthingModel] = useState<BerthingModel>(
    editManeuver?.berthingModel || 'Costado Bombordo (BB)'
  );

  // 3. NÚMERO DE REBOCADORES, TEMPO DE ASSISTÊNCIA DE REBOCADORES (ARRANQUE, INICIO / ENCOSTAM, FIM / DISPENSADOS)
  const [tugsCount, setTugsCount] = useState<number>(editManeuver?.tugCount ?? editManeuver?.tugs?.length ?? 0);
  const [tugArranque, setTugArranque] = useState<string>(editManeuver?.tugTimings?.arranque || '');
  const [tugInicio, setTugInicio] = useState<string>(
    editManeuver?.tugsMadeFastTime || editManeuver?.tugTimings?.inicio || ''
  );
  const [tugFim, setTugFim] = useState<string>(
    editManeuver?.tugsDismissedTime || editManeuver?.tugTimings?.fim || ''
  );

  // Helper de cálculo de duração entre dois horários
  const calculateDuration = (start: string, end: string): { formatted: string; minutes: number; hours: number } => {
    if (!start || !end) return { formatted: '--', minutes: 0, hours: 0 };
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return { formatted: '--', minutes: 0, hours: 0 };
    let diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff < 0) diff += 24 * 60;
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    const hoursDecimal = Math.round((diff / 60) * 10) / 10;
    return {
      formatted: `${hrs > 0 ? `${hrs}h ` : ''}${mins}m`,
      minutes: diff,
      hours: hoursDecimal
    };
  };

  // Cálculo de fadiga: desde embarque até desembarque do piloto
  const pilotDuty = calculateDuration(pilotOnBoardTime, pilotDisembarkedTime);

  // Horário de operações de rebocadores: desde que encostam até serem dispensados
  const tugOperations = calculateDuration(tugInicio, tugFim);

  // 4. TEMPO DE MANOBRAS (Calculado ou manual)
  const [maneuverDuration, setManeuverDuration] = useState<string>(
    editManeuver?.maneuverDurationFormatted || (editManeuver?.durationMinutes ? `${editManeuver.durationMinutes} min` : '')
  );

  // 5. TIPO DE MANOBRAS: ATRACAÇÃO, MUDANÇA, PUXANÇA, DESATRACAÇÃO
  const [maneuverType, setManeuverType] = useState<ManeuverType>(editManeuver?.maneuverType || 'atracacao');

  // 6. OBSERVAÇÃO
  const [remarks, setRemarks] = useState<string>(editManeuver?.pilotRemarks || '');

  // Piloto responsável e berço
  const [pilotId, setPilotId] = useState<string>(() => {
    if (editManeuver?.pilotId) return editManeuver.pilotId;
    if (currentUser?.id) return currentUser.id;
    return pilots[0]?.id || '';
  });
  const [customPilotName, setCustomPilotName] = useState<string>(editManeuver?.pilotName || currentUser?.name || '');
  const [berthTo, setBerthTo] = useState<string>(editManeuver?.berthTo || '');

  // 5. CENTRO DE ANEXOS DA MANOBRA (MULTI-FONTES: CÂMERA, ARQUIVOS, COLAR CTR+V, PDF)
  const [attachments, setAttachments] = useState<ManeuverAttachment[]>(() => {
    if (editManeuver?.attachments && editManeuver.attachments.length > 0) {
      return editManeuver.attachments;
    }
    if (editManeuver?.photoUrl) {
      return [{
        id: 'legacy-photo-0',
        name: editManeuver.photoTitle || 'Foto da Manobra',
        category: 'pilot_slip',
        dataUrl: editManeuver.photoUrl,
        fileType: 'image',
        mimeType: 'image/jpeg',
        uploadedAt: editManeuver.createdAt || new Date().toISOString(),
        caption: editManeuver.photoTitle
      }];
    }
    return [];
  });
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(editManeuver?.photoUrl || null);
  const [photoFileName, setPhotoFileName] = useState<string>(editManeuver?.photoTitle || '');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);

  const handleAttachmentsChange = (newAtts: ManeuverAttachment[]) => {
    setAttachments(newAtts);
    const firstImg = newAtts.find(a => a.fileType === 'image');
    if (firstImg) {
      setPhotoDataUrl(firstImg.dataUrl);
      setPhotoFileName(firstImg.name);
    } else {
      setPhotoDataUrl(null);
      setPhotoFileName('');
    }
  };

  // Backup e Resgate Automático de Rascunho (Document Draft Persistence)
  const DRAFT_MANEUVER_KEY = 'pilots_records_maneuver_form_draft_v2';
  const getEditDraftKey = (id: string) => `pilots_records_maneuver_edit_draft_${id}`;

  const [hasRestoredDraft, setHasRestoredDraft] = useState<boolean>(false);
  const [draftSavedToast, setDraftSavedToast] = useState<string | null>(null);
  const [draftTimestamp, setDraftTimestamp] = useState<string | null>(null);

  // Resgate automático de rascunho anterior não finalizado
  useEffect(() => {
    if (initialVessel) return;
    const draftKey = editManeuver ? getEditDraftKey(editManeuver.id) : DRAFT_MANEUVER_KEY;
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft && (draft.shipName || draft.origin || draft.lastLineTime || draft.berthingTime || draft.remarks || draft.pilotOnBoardTime || draft.customPilotName)) {
          if (draft.shipName !== undefined) setShipName(draft.shipName);
          if (draft.imoNumber !== undefined) setImoNumber(draft.imoNumber);
          if (draft.nationality !== undefined) setNationality(draft.nationality);
          if (draft.vesselType !== undefined) setVesselType(draft.vesselType);
          if (draft.loa !== undefined) setLoa(draft.loa);
          if (draft.beam !== undefined) setBeam(draft.beam);
          if (draft.grt !== undefined) setGrt(draft.grt);
          if (draft.draftFwd !== undefined) setDraftFwd(draft.draftFwd);
          if (draft.draftAft !== undefined) setDraftAft(draft.draftAft);
          if (draft.origin !== undefined) setOrigin(draft.origin);
          if (draft.nextPort !== undefined) setNextPort(draft.nextPort);
          if (draft.maneuverDate !== undefined) setManeuverDate(draft.maneuverDate);
          if (draft.pilotOnBoardTime !== undefined) setPilotOnBoardTime(draft.pilotOnBoardTime);
          if (draft.lastLineTime !== undefined) setLastLineTime(draft.lastLineTime);
          if (draft.firstLineTime !== undefined) setFirstLineTime(draft.firstLineTime);
          if (draft.berthingTime !== undefined) setBerthingTime(draft.berthingTime);
          if (draft.pilotDisembarkedTime !== undefined) setPilotDisembarkedTime(draft.pilotDisembarkedTime);
          if (draft.berthingModel !== undefined) setBerthingModel(draft.berthingModel);
          if (draft.tugsCount !== undefined) setTugsCount(draft.tugsCount);
          if (draft.tugArranque !== undefined) setTugArranque(draft.tugArranque);
          if (draft.tugInicio !== undefined) setTugInicio(draft.tugInicio);
          if (draft.tugFim !== undefined) setTugFim(draft.tugFim);
          if (draft.maneuverDuration !== undefined) setManeuverDuration(draft.maneuverDuration);
          if (draft.maneuverType !== undefined) setManeuverType(draft.maneuverType);
          if (draft.remarks !== undefined) setRemarks(draft.remarks);
          if (draft.pilotId !== undefined) setPilotId(draft.pilotId);
          if (draft.customPilotName !== undefined) setCustomPilotName(draft.customPilotName);
          if (draft.berthTo !== undefined) setBerthTo(draft.berthTo);
          if (draft.photoDataUrl !== undefined) setPhotoDataUrl(draft.photoDataUrl);
          if (draft.photoFileName !== undefined) setPhotoFileName(draft.photoFileName);
          if (draft.attachments && Array.isArray(draft.attachments)) setAttachments(draft.attachments);
          setHasRestoredDraft(true);
          setDraftTimestamp(draft.savedAt ? new Date(draft.savedAt).toLocaleTimeString('pt-PT') : null);
        }
      }
    } catch {}
  }, []);

  // Salvamento automático contínuo em background (debounce)
  useEffect(() => {
    if (!shipName && !origin && !nextPort && !remarks && !pilotOnBoardTime && !lastLineTime && !berthingTime) {
      return;
    }
    const draftKey = editManeuver ? getEditDraftKey(editManeuver.id) : DRAFT_MANEUVER_KEY;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify({
          shipName, imoNumber, nationality, vesselType, loa, beam, grt, draftFwd, draftAft,
          origin, nextPort, maneuverDate, pilotOnBoardTime, lastLineTime, firstLineTime,
          berthingTime, pilotDisembarkedTime, berthingModel, tugsCount, tugArranque,
          tugInicio, tugFim, maneuverDuration, maneuverType, remarks, pilotId,
          customPilotName, berthTo, photoDataUrl, photoFileName, attachments,
          savedAt: new Date().toISOString()
        }));
      } catch {}
    }, 500);
    return () => clearTimeout(timer);
  }, [
    shipName, imoNumber, nationality, vesselType, loa, beam, grt, draftFwd, draftAft,
    origin, nextPort, maneuverDate, pilotOnBoardTime, lastLineTime, firstLineTime,
    berthingTime, pilotDisembarkedTime, berthingModel, tugsCount, tugArranque,
    tugInicio, tugFim, maneuverDuration, maneuverType, remarks, pilotId,
    customPilotName, berthTo, photoDataUrl, photoFileName, attachments, editManeuver
  ]);

  // Salvar backup antes de descarregar a página / fechar app
  useEffect(() => {
    const handleBeforeUnload = () => {
      const draftKey = editManeuver ? getEditDraftKey(editManeuver.id) : DRAFT_MANEUVER_KEY;
      if (shipName || origin || remarks || pilotOnBoardTime || lastLineTime || berthingTime) {
        try {
          localStorage.setItem(draftKey, JSON.stringify({
            shipName, imoNumber, nationality, vesselType, loa, beam, grt, draftFwd, draftAft,
            origin, nextPort, maneuverDate, pilotOnBoardTime, lastLineTime, firstLineTime,
            berthingTime, pilotDisembarkedTime, berthingModel, tugsCount, tugArranque,
            tugInicio, tugFim, maneuverDuration, maneuverType, remarks, pilotId,
            customPilotName, berthTo, photoDataUrl, photoFileName,
            savedAt: new Date().toISOString()
          }));
        } catch {}
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [shipName, imoNumber, nationality, vesselType, loa, beam, grt, draftFwd, draftAft, origin, nextPort, maneuverDate, pilotOnBoardTime, lastLineTime, firstLineTime, berthingTime, pilotDisembarkedTime, berthingModel, tugsCount, tugArranque, tugInicio, tugFim, maneuverDuration, maneuverType, remarks, pilotId, customPilotName, berthTo, photoDataUrl, photoFileName, editManeuver]);

  const discardDraft = () => {
    const draftKey = editManeuver ? getEditDraftKey(editManeuver.id) : DRAFT_MANEUVER_KEY;
    try {
      localStorage.removeItem(draftKey);
    } catch {}
    setHasRestoredDraft(false);
    setDraftSavedToast('Rascunho descartado com sucesso.');
    setTimeout(() => setDraftSavedToast(null), 3000);

    if (!editManeuver) {
      setShipName('');
      setImoNumber('');
      setNationality('');
      setLoa(0);
      setBeam(0);
      setGrt(0);
      setDraftFwd(0);
      setDraftAft(0);
      setOrigin('');
      setNextPort('');
      setPilotOnBoardTime('');
      setLastLineTime('');
      setFirstLineTime('');
      setBerthingTime('');
      setPilotDisembarkedTime('');
      setTugArranque('');
      setTugInicio('');
      setTugFim('');
      setRemarks('');
      setBerthTo('');
      setPhotoDataUrl(null);
      setPhotoFileName('');
    }
  };

  const handleManualSaveDraft = () => {
    const draftKey = editManeuver ? getEditDraftKey(editManeuver.id) : DRAFT_MANEUVER_KEY;
    try {
      localStorage.setItem(draftKey, JSON.stringify({
        shipName, imoNumber, nationality, vesselType, loa, beam, grt, draftFwd, draftAft,
        origin, nextPort, maneuverDate, pilotOnBoardTime, lastLineTime, firstLineTime,
        berthingTime, pilotDisembarkedTime, berthingModel, tugsCount, tugArranque,
        tugInicio, tugFim, maneuverDuration, maneuverType, remarks, pilotId,
        customPilotName, berthTo, photoDataUrl, photoFileName,
        savedAt: new Date().toISOString()
      }));
      setDraftSavedToast('Backup / Rascunho guardado! Mesmo saindo do aplicativo, suas alterações estão protegidas.');
      setTimeout(() => setDraftSavedToast(null), 4000);
    } catch {}
  };

  // Suggestions & Auto-fetching states
  const [isSearchingOnline, setIsSearchingOnline] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<VesselSearchResult[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [dataSourceNotification, setDataSourceNotification] = useState<{
    source: 'local' | 'online';
    message: string;
  } | null>(null);

  const searchAbortControllerRef = useRef<AbortController | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-calculate maneuver duration based on appropriate operational start and finish
  useEffect(() => {
    let start = '';
    let finish = '';

    if (maneuverType === 'atracacao') {
      start = firstLineTime || pilotOnBoardTime;
      finish = berthingTime || pilotDisembarkedTime;
    } else if (maneuverType === 'mudanca' || maneuverType === 'puxanca') {
      start = lastLineTime || pilotOnBoardTime;
      finish = berthingTime || pilotDisembarkedTime;
    } else if (maneuverType === 'desatracacao') {
      start = lastLineTime || pilotOnBoardTime;
      finish = pilotDisembarkedTime;
    }

    if (start && finish) {
      const dur = calculateDuration(start, finish);
      if (dur.minutes > 0) {
        setManeuverDuration(`${dur.formatted} (${dur.minutes} min)`);
      }
    }
  }, [maneuverType, pilotOnBoardTime, lastLineTime, firstLineTime, berthingTime, pilotDisembarkedTime]);

  const onlineSearchTimeoutRef = useRef<any>(null);

  // Handle Ship Name typing with Local Database + Live VesselFinder.com Suggestions
  const handleShipNameChange = (query: string) => {
    setShipName(query);
    setDataSourceNotification(null);

    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      setIsSearchingOnline(false);
      if (onlineSearchTimeoutRef.current) clearTimeout(onlineSearchTimeoutRef.current);
      return;
    }

    // 1. Instant search from LOCAL DATABASE (registered vessels and past maneuvers)
    const localMatches = searchVesselsWithSuggestions(query, vessels, maneuvers);
    setSuggestions(localMatches);
    setIsDropdownOpen(localMatches.length > 0);

    // 2. Query VesselFinder.com via backend proxy with debouncing
    if (onlineSearchTimeoutRef.current) clearTimeout(onlineSearchTimeoutRef.current);

    if (isOnline) {
      setIsSearchingOnline(true);
      onlineSearchTimeoutRef.current = setTimeout(async () => {
        try {
          const onlineResults = await fetchVesselFinderOnline(query);
          if (onlineResults && onlineResults.length > 0) {
            setSuggestions(prev => {
              const seenImos = new Set(prev.map(p => p.vessel.imo));
              const merged = [...prev];
              for (const item of onlineResults) {
                if (!seenImos.has(item.vessel.imo)) {
                  seenImos.add(item.vessel.imo);
                  merged.push(item);
                }
              }
              return merged;
            });
            setIsDropdownOpen(true);
          }
        } catch (err) {
          console.warn('Erro ao carregar dados do VesselFinder:', err);
        } finally {
          setIsSearchingOnline(false);
        }
      }, 400);
    }
  };

  // Busca forçada imediata online no VesselFinder.com
  const handleSearchOnlineNow = async () => {
    const q = shipName.trim() || imoNumber.trim();
    if (!q) return;
    setIsSearchingOnline(true);
    try {
      const onlineResults = await fetchVesselFinderOnline(q);
      const localMatches = searchVesselsWithSuggestions(q, vessels, maneuvers);
      const merged = [...localMatches];
      const seen = new Set(merged.map(m => m.vessel.imo));
      (onlineResults || []).forEach(item => {
        if (!seen.has(item.vessel.imo)) {
          seen.add(item.vessel.imo);
          merged.push(item);
        }
      });
      setSuggestions(merged);
      setIsDropdownOpen(true);
      if (merged.length === 1) {
        applyVesselData(merged[0]);
      }
    } catch (err) {
      console.warn('Erro ao consultar VesselFinder:', err);
    } finally {
      setIsSearchingOnline(false);
    }
  };

  // Busca rápida na Frota Local registada
  const handleSearchLocalNow = () => {
    const q = shipName.trim() || imoNumber.trim();
    const localMatches = searchVesselsWithSuggestions(q || '', vessels, maneuvers);
    setSuggestions(localMatches);
    setIsDropdownOpen(true);
    if (localMatches.length === 1) {
      applyVesselData(localMatches[0]);
    }
  };

  // Consulta e auto-preenchimento direto pelo Número IMO
  const handleLookupByImo = async () => {
    const cleanImo = imoNumber.replace(/\D/g, '');
    if (!cleanImo || cleanImo.length < 5) return;
    setIsSearchingOnline(true);
    try {
      // 1. Procurar primeiro na base local
      const localMatches = searchVesselsWithSuggestions(cleanImo, vessels, maneuvers);
      const exactLocal = localMatches.find(m => m.vessel.imo.replace(/\D/g, '') === cleanImo);
      if (exactLocal) {
        applyVesselData(exactLocal);
        setIsSearchingOnline(false);
        return;
      }

      // 2. Consultar online no VesselFinder
      const onlineResults = await fetchVesselFinderOnline(cleanImo);
      if (onlineResults && onlineResults.length > 0) {
        applyVesselData(onlineResults[0]);
      } else {
        const details = await fetchVesselDetailsOnline(cleanImo);
        if (details) {
          if (details.draft && details.draft > 0) {
            setDraftAft(details.draft);
            setDraftFwd(Math.max(0, parseFloat((details.draft - 0.4).toFixed(1))));
          }
          if (details.destination && !nextPort) setNextPort(details.destination);
          setDataSourceNotification({
            source: 'online',
            message: `🌐 VesselFinder.com: IMO ${cleanImo} (Calado ${details.draft ? details.draft + 'm' : '___'} · Destino: ${details.destination || 'Em rota'})`
          });
        }
      }
    } catch (e) {
      console.warn('Erro ao consultar por IMO:', e);
    } finally {
      setIsSearchingOnline(false);
    }
  };

  // When a vessel is selected from suggestions or auto-fetched
  const applyVesselData = async (result: VesselSearchResult) => {
    const v = result.vessel;
    setShipName(v.name);
    setImoNumber(v.imo);
    setNationality(v.flag || 'Internacional');
    setVesselType(v.type);
    setLoa(v.loa || 0);
    setBeam(v.beam || 0);
    setGrt(v.grossTonnage || 0);
    setDraftFwd(v.currentDraftFwd || 0);
    setDraftAft(v.currentDraftAft || 0);
    if (v.origin) setOrigin(v.origin);
    if (v.destination) setNextPort(v.destination);

    setIsDropdownOpen(false);

    setDataSourceNotification({
      source: result.source === 'backup_interno' ? 'local' : 'online',
      message: `${result.sourceLabel}: ${v.name} (${v.flag || 'Internacional'} · LOA ${v.loa || '___'}m · Boca ${v.beam || '___'}m · Calado ${v.currentDraftAft ? v.currentDraftAft + 'm' : '___'} · GRT ${v.grossTonnage ? v.grossTonnage.toLocaleString() : '___'})`
    });

    // If IMO is valid, consult VesselFinder for live draft & destination
    if (v.imo && v.imo.length >= 4 && isOnline) {
      try {
        const details = await fetchVesselDetailsOnline(v.imo);
        if (details) {
          if (details.draft && details.draft > 0) {
            setDraftAft(details.draft);
            setDraftFwd(Math.max(0, parseFloat((details.draft - 0.4).toFixed(1))));
          }
          if (details.destination && !nextPort) {
            setNextPort(details.destination);
          }
        }
      } catch (e) {
        console.warn('Erro ao buscar detalhes adicionais do navio:', e);
      }
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Photo Upload (Convert into base64 & prepare automatic PDF attachment)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFileName(file.name);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target?.result as string;
      setPhotoDataUrl(base64Data);
    };
    reader.readAsDataURL(file);
  };

  // Quick Action: Generate and download the official PDF directly from the form with the attached photo
  const handleQuickDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const selectedPilot = pilots.find(p => p.id === pilotId) || pilots[0];
      const pilotDisplayName = selectedPilot?.name || customPilotName.trim() || 'Prático em Serviço';
      const tempRecord = {
        id: `PREVIEW-${Date.now().toString().slice(-4)}`,
        vesselId: 'preview-vessel',
        vesselSnapshot: {
          name: shipName.toUpperCase().trim() || 'NAVIO SEM NOME',
          imo: imoNumber || 'IMO 9000000',
          flag: nationality || 'Internacional',
          type: vesselType,
          loa: loa,
          beam: beam,
          draftFwd: draftFwd,
          draftAft: draftAft,
          grossTonnage: grt,
          agent: 'Agência Marítima Oficial',
          origin: origin || 'Porto de Origem',
          destination: nextPort || 'Próximo Porto'
        },
        maneuverType: maneuverType,
        status: 'concluida' as const,
        scheduledTime: new Date().toISOString(),
        berthFrom: origin || 'Fundeio',
        berthTo: berthTo || 'Cais de Atracação',
        pilotId: selectedPilot?.id || 'plt-01',
        pilotName: pilotDisplayName,
        maneuverDate: maneuverDate,
        pilotOnBoardTime: pilotOnBoardTime,
        lastLineCastOffTime: lastLineTime,
        firstLineAshored: firstLineTime,
        allFastBerthingTime: berthingTime,
        pilotDisembarkedTime: pilotDisembarkedTime,
        tugsMadeFastTime: tugInicio,
        tugsDismissedTime: tugFim,
        tugOperationalHours: tugOperations.hours,
        pilotDutyHours: pilotDuty.hours,
        milestones: {
          pilotOnBoard: pilotOnBoardTime,
          lastLineCastOff: lastLineTime,
          firstLineAshored: firstLineTime,
          allFastCompleted: berthingTime,
          pilotDisembarked: pilotDisembarkedTime,
          commenceManeuver: lastLineTime || pilotOnBoardTime,
        },
        durationMinutes: pilotDuty.minutes || 80,
        maneuverDurationFormatted: maneuverDuration || pilotDuty.formatted,
        unmooringTime: lastLineTime,
        berthingTime: berthingTime,
        berthingModel: maneuverType === 'desatracacao' ? undefined : berthingModel,
        tugCount: tugsCount,
        tugTimings: {
          arranque: tugArranque,
          inicio: tugInicio,
          fim: tugFim
        },
        tugs: [],
        weather: weather,
        safetyChecklist: {
          pilotLadderCompliant: true,
          steeringGearTested: true,
          bowThrusterOperational: true,
          mainEngineTested: true,
          anchorsCleared: true,
          radarEcdisOperational: true,
          vhfChannelsConfirmed: true,
          masterPilotExchangeDone: true,
          deckCrewAssisting: true
        },
        pilotRemarks: remarks,
        photoUrl: attachments.find(a => a.fileType === 'image')?.dataUrl || photoDataUrl || undefined,
        photoTitle: attachments[0]?.name || photoFileName || 'Foto oficial da manobra e cabos de atracação',
        attachments: attachments,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = await generatePilotageManeuverPDF(tempRecord, { downloadImmediately: true });
      setGeneratedPdfUrl(result.pdfUrl);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Submit complete or partial maneuver record (Aceita salvar mesmo sem preenchimento total)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Aceita salvar/guardar informações mesmo quando não estão preenchidas no total
    const effectiveShipName = shipName.trim()
      ? shipName.toUpperCase().trim()
      : (imoNumber.trim() ? `NAVIO IMO ${imoNumber.trim()}` : `NAVIO EM REGISTO (${new Date().toLocaleDateString('pt-PT')})`);

    const selectedPilot = pilots.find(p => p.id === pilotId) || (currentUser && (pilotId === currentUser.id || !pilotId) ? { id: currentUser.id, name: currentUser.name } : pilots[0]);
    let finalPilotId = selectedPilot?.id || currentUser?.id;
    let finalPilotName = selectedPilot?.name || currentUser?.name;

    if (!finalPilotId || !finalPilotName) {
      finalPilotName = customPilotName.trim() || 'Prático Responsável';
      finalPilotId = addPilot({
        name: finalPilotName,
        licenseNumber: `CIR-${Date.now().toString().slice(-4)}`,
        category: 'Prático Efetivo',
        phone: '+351 900 000 000',
        vhfCallSign: `Prático ${finalPilotName.split(' ')[1] || 'Manobra'}`,
        status: 'em_manobra',
        currentShift: 'Manhã/Tarde (08h-16h)',
        avatarColor: 'bg-blue-900'
      });
    }

    // Ensure vessel is in system
    let vesselId = '';
    const existingVessel = vessels.find(
      v => v.name.toLowerCase() === effectiveShipName.toLowerCase() || (imoNumber && v.imo === imoNumber)
    );

    if (existingVessel) {
      vesselId = existingVessel.id;
    } else {
      vesselId = addVessel({
        name: effectiveShipName,
        imo: imoNumber || `9${Math.floor(100000 + Math.random() * 900000)}`,
        callSign: 'PPXZ',
        flag: nationality || 'Internacional',
        flagCode: 'UN',
        type: vesselType,
        loa: Number(loa) || 0,
        beam: Number(beam) || 0,
        maxDraft: Math.max(Number(draftFwd) || 0, Number(draftAft) || 0) + 1.5,
        currentDraftFwd: Number(draftFwd) || 0,
        currentDraftAft: Number(draftAft) || 0,
        agent: 'Agência Marítima do Porto',
        origin: origin || 'Não especificada',
        destination: nextPort || 'Não especificado',
        dwt: Math.round((Number(grt) || 10000) * 1.15),
        grossTonnage: Number(grt) || 0
      });
    }

    const tugsData: TugAssistance[] = [];
    for (let i = 1; i <= tugsCount; i++) {
      tugsData.push({
        tugId: `tug-${i}`,
        tugName: `REBOCADOR DE ASSISTÊNCIA ${i}`,
        bollardPullTons: 70,
        hoursAssisted: 1.5,
        position: i === 1 ? 'proa' : i === 2 ? 'popa' : 'costado_bb',
        timings: {
          arranque: tugArranque,
          inicio: tugInicio,
          fim: tugFim
        }
      });
    }

    const maneuverPayload = {
      vesselId: vesselId,
      vesselSnapshot: {
        name: effectiveShipName,
        imo: imoNumber || 'IMO 9000000',
        flag: nationality || 'Internacional',
        type: vesselType,
        loa: Number(loa),
        beam: Number(beam),
        draftFwd: Number(draftFwd),
        draftAft: Number(draftAft),
        grossTonnage: Number(grt),
        agent: 'Agência Marítima Oficial',
        origin: origin,
        destination: nextPort
      },
      maneuverType: maneuverType,
      berthFrom: origin || 'Fundeio',
      berthTo: berthTo || 'Cais de Atracação',
      pilotId: finalPilotId,
      pilotName: finalPilotName,
      maneuverDate: maneuverDate,
      pilotOnBoardTime: pilotOnBoardTime,
      lastLineCastOffTime: lastLineTime,
      firstLineAshored: firstLineTime,
      allFastBerthingTime: berthingTime,
      pilotDisembarkedTime: pilotDisembarkedTime,
      tugsMadeFastTime: tugInicio,
      tugsDismissedTime: tugFim,
      tugOperationalHours: tugOperations.hours,
      pilotDutyHours: pilotDuty.hours,
      scheduledTime: `${maneuverDate}T${pilotOnBoardTime || lastLineTime || '08:00'}:00.000Z`,
      completedTime: `${maneuverDate}T${pilotDisembarkedTime || berthingTime || '10:00'}:00.000Z`,
      durationMinutes: pilotDuty.minutes || 80,
      milestones: {
        ...(editManeuver?.milestones || {}),
        pilotOnBoard: pilotOnBoardTime,
        lastLineCastOff: lastLineTime,
        firstLineAshored: firstLineTime,
        allFastCompleted: berthingTime,
        pilotDisembarked: pilotDisembarkedTime,
        commenceManeuver: lastLineTime || pilotOnBoardTime,
      },
      maneuverDurationFormatted: maneuverDuration || pilotDuty.formatted,
      unmooringTime: lastLineTime,
      berthingTime: berthingTime,
      berthingModel: maneuverType === 'desatracacao' ? undefined : berthingModel,
      tugCount: tugsCount,
      tugTimings: {
        arranque: tugArranque,
        inicio: tugInicio,
        fim: tugFim
      },
      tugs: tugsData,
      pilotRemarks: remarks,
      photoUrl: attachments.find(a => a.fileType === 'image')?.dataUrl || photoDataUrl || undefined,
      photoTitle: attachments[0]?.name || photoFileName || 'Registo Fotográfico da Manobra',
      attachments: attachments
    };

    if (editManeuver) {
      updateManeuver(editManeuver.id, maneuverPayload);
    } else {
      const isComplete = Boolean(pilotDisembarkedTime || berthingTime);
      addManeuver({
        ...maneuverPayload,
        status: isComplete ? 'concluida' : 'em_curso',
        scheduledTime: new Date().toISOString(),
        durationMinutes: pilotDuty.minutes || 80,
        weather: weather,
        safetyChecklist: {
          pilotLadderCompliant: true,
          steeringGearTested: true,
          bowThrusterOperational: true,
          mainEngineTested: true,
          anchorsCleared: true,
          radarEcdisOperational: true,
          vhfChannelsConfirmed: true,
          masterPilotExchangeDone: true,
          deckCrewAssisting: true
        },
        pilotageCertificateSigned: true
      });
    }

    // Limpar o rascunho de backup após gravação com sucesso
    const draftKey = editManeuver ? getEditDraftKey(editManeuver.id) : DRAFT_MANEUVER_KEY;
    try {
      localStorage.removeItem(draftKey);
    } catch {}

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto transition-opacity duration-200">
      {/* Container in White, Deep Naval Blue and Black */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-white border-2 border-black rounded-xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]"
      >
        
        {/* Top Header - Deep Blue with White & Black Accents */}
        <div className="bg-blue-900 text-white px-5 py-4 border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-black border border-blue-400 flex items-center justify-center text-white font-black shadow-inner">
              <Anchor className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                {editManeuver ? `EDITAR MANOBRA: ${editManeuver.id}` : (language === 'pt' ? 'REGISTO DE MANOBRA DO PILOTO' : 'PILOT MANEUVER LOG')}
                <span className="text-xs bg-black text-blue-300 px-2 py-0.5 rounded border border-blue-800 font-mono">
                  {editManeuver ? (language === 'pt' ? 'EDIÇÃO' : 'EDIT') : (language === 'pt' ? 'SISTEMA OFICIAL' : 'OFFICIAL')}
                </span>
              </h2>
              <p className="text-xs text-blue-200">
                {editManeuver 
                  ? (language === 'pt' ? 'Atualização de dados de bordo, rebocadores, tempos e observações técnicas.' : 'Updating on-board telemetry, tugs, timeline and pilot remarks.')
                  : (language === 'pt' ? 'Preenchimento direto de dados de bordo, rebocadores, cabos e anexo fotográfico em PDF.' : 'Vessel data entry, tug telemetry, mooring cables and PDF report.')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Online / Offline badge */}
            <div 
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                isOnline 
                  ? 'bg-blue-950/80 text-blue-200 border-blue-400' 
                  : 'bg-black text-slate-300 border-slate-700'
              }`}
              title={isOnline ? 'Conectado: Busca automática ativa pela internet' : 'Sem conexão: Usando base local'}
            >
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <Globe className="w-3.5 h-3.5 text-blue-300" />
                  <span className="hidden sm:inline">Online (Busca Automática)</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Modo Local</span>
                </>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-black hover:bg-slate-800 text-white flex items-center justify-center transition-colors border border-blue-400"
              title="Fechar formulário"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-900">
          
          {/* BANNER DE RESGATE DE BACKUP / RASCUNHO */}
          {hasRestoredDraft && (
            <div className="bg-amber-50 border-2 border-amber-500 rounded-lg p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-amber-950 uppercase tracking-wide flex items-center gap-2">
                    <span>Backup / Rascunho Resgatado do Armazenamento</span>
                    {draftTimestamp && (
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-mono">
                        Última edição: {draftTimestamp}
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-amber-900 mt-0.5">
                    As informações que você começou a editar foram recuperadas automaticamente para você não perder dados ao sair do app.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={discardDraft}
                className="px-3 py-1.5 text-xs font-bold bg-white hover:bg-amber-100 text-amber-950 border border-amber-400 rounded shadow-xs whitespace-nowrap self-end sm:self-auto"
              >
                Descartar Rascunho
              </button>
            </div>
          )}

          {/* NOTIFICAÇÃO TEMPORÁRIA DE BACKUP SALVO */}
          {draftSavedToast && (
            <div className="p-3 bg-emerald-50 border-2 border-emerald-500 rounded-lg text-emerald-950 text-xs font-bold flex items-center gap-2.5 shadow-xs">
              <Check className="w-4 h-4 text-emerald-700 shrink-0 stroke-[3]" />
              <span>{draftSavedToast}</span>
            </div>
          )}

          {/* DATA DA OPERAÇÃO / REGISTO RETROATIVO */}
          <div className="bg-amber-50/80 border-2 border-amber-400 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-amber-950 flex items-center gap-1.5">
                  <span>{language === 'pt' ? 'Data da Operação / Manobra' : 'Operation / Maneuver Date'} *</span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                    {language === 'pt' ? 'Registo Retroativo' : 'Retroactive Entry'}
                  </span>
                </label>
                <p className="text-[11px] text-amber-800 leading-tight mt-0.5">
                  {language === 'pt' 
                    ? 'Possibilidade de registo ou alteração da data para quando a manobra foi realizada anteriormente.'
                    : 'Log or change the operation date if the maneuver was conducted prior to registration.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="date"
                value={maneuverDate}
                onChange={(e) => setManeuverDate(e.target.value)}
                className="bg-white border-2 border-black rounded-md px-3 py-2 text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-blue-900 w-full sm:w-auto"
              />
              <button
                type="button"
                onClick={() => setManeuverDate(new Date().toISOString().slice(0, 10))}
                className="text-xs px-3 py-2 bg-white hover:bg-amber-100 border-2 border-amber-500 rounded-md font-bold text-amber-950 whitespace-nowrap shadow-xs"
              >
                {language === 'pt' ? 'Hoje' : 'Today'}
              </button>
            </div>
          </div>

          {/* SELEÇÃO DO TIPO DE MANOBRA (4 opções exatas requeridas pelo usuário) */}
          <div className="bg-slate-50 border-2 border-slate-300 rounded-lg p-3 sm:p-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 mb-2">
              TIPO DE MANOBRA *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'atracacao', label: 'ATRACAÇÃO' },
                { id: 'mudanca', label: 'MUDANÇA' },
                { id: 'puxanca', label: 'PUXANÇA' },
                { id: 'desatracacao', label: 'DESATRACAÇÃO' }
              ].map(opt => {
                const isSelected = maneuverType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setManeuverType(opt.id as ManeuverType)}
                    className={`py-2.5 px-3 rounded-md font-bold text-xs sm:text-sm tracking-wide border-2 transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-900 text-white border-black shadow-md'
                        : 'bg-white text-slate-800 border-slate-300 hover:border-blue-700 hover:bg-blue-50'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 text-blue-300 stroke-[3]" />}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DADOS DO NAVIO COM BUSCA AUTOMÁTICA PELA INTERNET E SUGESTÃO */}
          <div className="border-2 border-slate-300 rounded-lg p-4 bg-white space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-2">
              <h3 className="text-sm font-black uppercase text-blue-900 flex items-center gap-2">
                <Ship className="w-4 h-4 text-blue-700" />
                1. DADOS DO NAVIO & IDENTIFICAÇÃO (Auto-Preenchimento Online & Local)
              </h3>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleSearchLocalNow}
                  className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px] flex items-center gap-1 transition-colors"
                  title="Buscar na base de navios já cadastrados e manobras anteriores"
                >
                  <span>💾</span>
                  <span>Frota Local</span>
                </button>
                <button
                  type="button"
                  onClick={handleSearchOnlineNow}
                  disabled={isSearchingOnline}
                  className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 font-bold text-[11px] flex items-center gap-1 transition-colors"
                  title="Buscar ao vivo dados técnicos do navio no site VesselFinder.com"
                >
                  <span>🌐</span>
                  <span>{isSearchingOnline ? 'Buscando...' : 'VesselFinder.com'}</span>
                </button>
              </div>
            </div>

            {/* Campo NOME DO NAVIO com autocomplete inteligente */}
            <div ref={searchContainerRef} className="relative">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase text-black">
                  NOME DO NAVIO *
                </label>
                <span className="text-[11px] text-slate-500 font-medium">
                  {isOnline ? '🌐 Conectado ao VesselFinder' : '💾 Busca local offline'}
                </span>
              </div>
              <div className="relative flex items-center gap-1.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={shipName}
                    onChange={(e) => handleShipNameChange(e.target.value)}
                    onFocus={() => {
                      if (suggestions.length > 0) setIsDropdownOpen(true);
                    }}
                    placeholder="Digite o nome do navio (ex: MSC ANNA VICTORIA, EVER GIVEN, PETROBRAS...)"
                    className="w-full bg-white border-2 border-black rounded-md px-3.5 py-2.5 text-sm font-bold text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800 uppercase pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {isSearchingOnline && (
                      <span className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></span>
                    )}
                    <Search className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSearchOnlineNow}
                  disabled={isSearchingOnline || !shipName.trim()}
                  className="px-3 py-2.5 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white rounded-md font-bold text-xs border border-black shadow-xs flex items-center gap-1 shrink-0"
                  title="Consultar dados deste navio no VesselFinder agora"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Pesquisar</span>
                </button>
              </div>

              {/* Feedback badge if auto-filled */}
              {dataSourceNotification && (
                <div className={`mt-2 text-xs p-2 rounded border flex items-center gap-2 ${
                  dataSourceNotification.source === 'online'
                    ? 'bg-blue-50 text-blue-900 border-blue-300'
                    : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                }`}>
                  <Sparkles className="w-4 h-4 shrink-0 text-blue-700" />
                  <span className="font-semibold">{dataSourceNotification.message}</span>
                </div>
              )}

              {/* Suggestions Dropdown (Local + Online) */}
              {isDropdownOpen && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border-2 border-black rounded-lg shadow-xl z-30 max-h-64 overflow-y-auto divide-y divide-slate-100">
                  <div className="px-3 py-1.5 bg-blue-900 text-white text-[11px] font-bold uppercase tracking-wider flex justify-between">
                    <span>Sugestões Encontradas ({suggestions.length})</span>
                    <span>Clique para preencher todos os dados</span>
                  </div>
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyVesselData(item)}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50 transition-colors flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-bold text-sm text-black flex items-center gap-2">
                          <span>{item.vessel.name}</span>
                          <span className="text-[11px] font-mono px-1.5 py-0.2 bg-slate-100 border border-slate-300 rounded text-slate-700">
                            IMO {item.vessel.imo}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 flex items-center gap-2 mt-0.5 flex-wrap">
                          <span>Bandeira: <strong>{item.vessel.flag}</strong></span>
                          <span>·</span>
                          <span>LOA: <strong>{item.vessel.loa}m</strong></span>
                          <span>·</span>
                          <span>Largura: <strong>{item.vessel.beam}m</strong></span>
                          <span>·</span>
                          <span>GRT: <strong>{item.vessel.grossTonnage.toLocaleString()}</strong></span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${item.sourceBadgeColor}`}>
                        {item.sourceLabel}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Grid dos dados técnicos do navio requeridos pelo usuário: IMO, TIPO, LOA, BEAM, GRT, NACIONALIDADE, CALADOS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold uppercase text-black">
                    NÚMERO IMO *
                  </label>
                  {imoNumber.trim().length >= 5 && (
                    <button
                      type="button"
                      onClick={handleLookupByImo}
                      disabled={isSearchingOnline}
                      className="text-[10px] font-bold text-blue-800 hover:text-blue-900 underline flex items-center gap-0.5"
                      title="Consultar e preencher dados deste IMO no VesselFinder"
                    >
                      <span>🌐 Consultar IMO</span>
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={imoNumber}
                    onChange={(e) => setImoNumber(e.target.value)}
                    placeholder="___"
                    className="w-full bg-white border border-black rounded px-2.5 py-2 text-sm font-bold text-black placeholder:text-slate-400 font-mono"
                  />
                  {imoNumber.trim().length >= 6 && (
                    <button
                      type="button"
                      onClick={handleLookupByImo}
                      disabled={isSearchingOnline}
                      className="absolute right-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 text-[10px] font-bold rounded border border-blue-300"
                    >
                      Auto-Preencher
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-black mb-1">
                  LOA (COMP.)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={loa === 0 ? '' : loa}
                    onChange={(e) => setLoa(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                    placeholder="___"
                    className="w-full bg-white border border-black rounded px-2.5 py-2 text-sm font-bold text-black placeholder:text-slate-400"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-semibold">m</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-black mb-1">
                  BOCA (LARG.)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={beam === 0 ? '' : beam}
                    onChange={(e) => setBeam(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                    placeholder="___"
                    className="w-full bg-white border border-black rounded px-2.5 py-2 text-sm font-bold text-black placeholder:text-slate-400"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-semibold">m</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-black mb-1">
                  GRT (ARQ.)
                </label>
                <input
                  type="number"
                  value={grt === 0 ? '' : grt}
                  onChange={(e) => setGrt(e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                  placeholder="___"
                  className="w-full bg-white border border-black rounded px-2.5 py-2 text-sm font-bold text-black placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-black mb-1">
                  BANDEIRA
                </label>
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  placeholder="___"
                  className="w-full bg-white border border-black rounded px-2.5 py-2 text-sm font-bold text-black placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-black mb-1">
                  CALADO VTE
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={draftFwd === 0 ? '' : draftFwd}
                    onChange={(e) => setDraftFwd(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                    placeholder="___"
                    className="w-full bg-white border border-black rounded px-2.5 py-2 text-sm font-bold text-black placeholder:text-slate-400"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-semibold">m</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-black mb-1">
                  CALADO RÉ
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={draftAft === 0 ? '' : draftAft}
                    onChange={(e) => setDraftAft(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                    placeholder="___"
                    className="w-full bg-white border border-black rounded px-2.5 py-2 text-sm font-bold text-black placeholder:text-slate-400"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-semibold">m</span>
                </div>
              </div>
            </div>

            {/* PROCEDENCIA & PROXIMO PORTO COM EXEMPLOS DE MOÇAMBIQUE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold uppercase text-black mb-1">
                  PROCEDÊNCIA (PORTO DE ORIGEM) *
                </label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="___ (Ex: Porto de Maputo, Beira ou Durban)"
                  className="w-full bg-white border border-black rounded px-3 py-2 text-sm font-semibold text-black placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-black mb-1">
                  PRÓXIMO PORTO (DESTINO)
                </label>
                <input
                  type="text"
                  value={nextPort}
                  onChange={(e) => setNextPort(e.target.value)}
                  placeholder="___ (Ex: Porto de Nacala, Pemba ou Richards Bay)"
                  className="w-full bg-white border border-black rounded px-3 py-2 text-sm font-semibold text-black placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* HORÁRIOS DA MANOBRA CONFORME O TIPO: ATRACAÇÃO, MUDANÇA, PUXANÇA, DESATRACAÇÃO */}
          <div className="border-2 border-slate-300 rounded-lg p-4 bg-white space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <h3 className="text-sm font-black uppercase text-blue-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-700" />
                2. {language === 'pt' 
                  ? (maneuverType === 'desatracacao' ? 'HORÁRIOS OPERACIONAIS DA DESATRACAÇÃO' : 'HORÁRIOS OPERACIONAIS & MODELO DE ATRACAÇÃO') 
                  : (maneuverType === 'desatracacao' ? 'OPERATIONAL MILESTONES (UNBERTHING)' : 'OPERATIONAL MILESTONES & BERTHING MODEL')}
              </h3>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-300 self-start sm:self-auto">
                {language === 'pt' ? 'Campos dinâmicos para:' : 'Fields configured for:'} <strong className="text-blue-900">{maneuverType.toUpperCase()}</strong>
              </span>
            </div>

            {/* CAMPOS DINÂMICOS CONFORME O TIPO DE MANOBRA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* PILOTO A BORDO (Embarque) - Requerido em ATRACAÇÃO, MUDANÇA, PUXANÇA, DESATRACAÇÃO */}
              <div>
                <label className="block text-xs font-bold uppercase text-black mb-1">
                  {language === 'pt' ? 'Piloto a Bordo (POB)' : 'Pilot On Board (POB)'} *
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="time"
                    value={pilotOnBoardTime}
                    onChange={(e) => setPilotOnBoardTime(e.target.value)}
                    className="flex-1 bg-white border-2 border-black rounded px-2.5 py-2 text-sm font-bold text-black focus:ring-2 focus:ring-blue-900"
                  />
                  <button
                    type="button"
                    onClick={() => setPilotOnBoardTime(new Date().toTimeString().slice(0, 5))}
                    className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 border border-slate-400 rounded font-semibold text-black"
                    title={language === 'pt' ? 'Definir horário atual' : 'Set current time'}
                  >
                    {language === 'pt' ? 'Agora' : 'Now'}
                  </button>
                </div>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  {language === 'pt' ? 'Início do serviço de assessoria' : 'Pilot boarding time'}
                </p>
              </div>

              {/* ÚLTIMO CABO - Requerido em MUDANÇA, PUXANÇA, DESATRACAÇÃO */}
              {(maneuverType === 'mudanca' || maneuverType === 'puxanca' || maneuverType === 'desatracacao') && (
                <div>
                  <label className="block text-xs font-bold uppercase text-black mb-1">
                    {language === 'pt' ? 'Último Cabo (Largado)' : 'Last Line (Cast Off)'}
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="time"
                      value={lastLineTime}
                      onChange={(e) => setLastLineTime(e.target.value)}
                      className="flex-1 bg-white border-2 border-black rounded px-2.5 py-2 text-sm font-bold text-black focus:ring-2 focus:ring-blue-900"
                    />
                    <button
                      type="button"
                      onClick={() => setLastLineTime(new Date().toTimeString().slice(0, 5))}
                      className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 border border-slate-400 rounded font-semibold text-black"
                    >
                      {language === 'pt' ? 'Agora' : 'Now'}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    {language === 'pt' ? 'Navio desatracado / livre (All clear)' : 'All lines cast off'}
                  </p>
                </div>
              )}

              {/* PRIMEIRO CABO - Requerido em ATRACAÇÃO, MUDANÇA, PUXANÇA */}
              {(maneuverType === 'atracacao' || maneuverType === 'mudanca' || maneuverType === 'puxanca') && (
                <div>
                  <label className="block text-xs font-bold uppercase text-black mb-1">
                    {language === 'pt' ? 'Primeiro Cabo em Terra' : 'First Line Ashore'}
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="time"
                      value={firstLineTime}
                      onChange={(e) => setFirstLineTime(e.target.value)}
                      className="flex-1 bg-white border-2 border-black rounded px-2.5 py-2 text-sm font-bold text-black focus:ring-2 focus:ring-blue-900"
                    />
                    <button
                      type="button"
                      onClick={() => setFirstLineTime(new Date().toTimeString().slice(0, 5))}
                      className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 border border-slate-400 rounded font-semibold text-black"
                    >
                      {language === 'pt' ? 'Agora' : 'Now'}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    {language === 'pt' ? 'Passagem do 1º cabo ao cabeço' : 'First mooring line ashore'}
                  </p>
                </div>
              )}

              {/* ATRACADO - Requerido em ATRACAÇÃO, MUDANÇA, PUXANÇA */}
              {(maneuverType === 'atracacao' || maneuverType === 'mudanca' || maneuverType === 'puxanca') && (
                <div>
                  <label className="block text-xs font-bold uppercase text-black mb-1">
                    {language === 'pt' ? 'Atracado (All Fast)' : 'All Fast Completed'}
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="time"
                      value={berthingTime}
                      onChange={(e) => setBerthingTime(e.target.value)}
                      className="flex-1 bg-white border-2 border-black rounded px-2.5 py-2 text-sm font-bold text-black focus:ring-2 focus:ring-blue-900"
                    />
                    <button
                      type="button"
                      onClick={() => setBerthingTime(new Date().toTimeString().slice(0, 5))}
                      className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 border border-slate-400 rounded font-semibold text-black"
                    >
                      {language === 'pt' ? 'Agora' : 'Now'}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    {language === 'pt' ? 'Todos os cabos encapelados e tesados' : 'Vessel safely moored'}
                  </p>
                </div>
              )}

              {/* DESEMBARQUE DO PILOTO - Requerido em ATRACAÇÃO, MUDANÇA, PUXANÇA, DESATRACAÇÃO */}
              <div>
                <label className="block text-xs font-bold uppercase text-black mb-1">
                  {language === 'pt' ? 'Desembarque do Piloto' : 'Pilot Disembarked (Away)'}
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="time"
                    value={pilotDisembarkedTime}
                    onChange={(e) => setPilotDisembarkedTime(e.target.value)}
                    className="flex-1 bg-white border-2 border-black rounded px-2.5 py-2 text-sm font-bold text-black focus:ring-2 focus:ring-blue-900"
                  />
                  <button
                    type="button"
                    onClick={() => setPilotDisembarkedTime(new Date().toTimeString().slice(0, 5))}
                    className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 border border-slate-400 rounded font-semibold text-black"
                  >
                    {language === 'pt' ? 'Agora' : 'Now'}
                  </button>
                </div>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  {language === 'pt' ? 'Término do serviço / Lancha' : 'Pilot ladder disembarkation'}
                </p>
              </div>

              {/* TEMPO DE MANOBRA (Formato resumido) */}
              <div>
                <label className="block text-xs font-bold uppercase text-black mb-1">
                  {language === 'pt' ? 'Tempo de Manobra' : 'Maneuver Duration'}
                </label>
                <input
                  type="text"
                  value={maneuverDuration}
                  onChange={(e) => setManeuverDuration(e.target.value)}
                  placeholder="Ex: 1h 20m"
                  className="w-full bg-blue-50 border border-blue-800 rounded px-2.5 py-2 text-sm font-bold text-blue-900"
                />
                <p className="text-[10px] text-slate-600 mt-0.5">
                  {language === 'pt' ? 'Calculado automaticamente' : 'Auto-calculated'}
                </p>
              </div>
            </div>

            {/* GESTÃO DE FADIGA DO PILOTO (Cálculo desde embarque até desembarque do piloto) */}
            <div className="bg-blue-50/70 border border-blue-300 rounded-lg p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-900 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Activity className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-blue-950">
                      {language === 'pt' ? 'Gestão de Fadiga do Piloto' : 'Pilot Fatigue Tracking'}
                    </span>
                    <span className="text-[10px] bg-blue-200 text-blue-900 font-bold px-2 py-0.5 rounded">
                      {language === 'pt' ? 'Cálculo: Embarque → Desembarque' : 'Boarding → Disembarkation'}
                    </span>
                  </div>
                  <p className="text-xs text-blue-800 mt-0.5">
                    {pilotOnBoardTime && pilotDisembarkedTime ? (
                      <>
                        {language === 'pt' 
                          ? `Período em serviço de passadiço: das ${pilotOnBoardTime} às ${pilotDisembarkedTime}.`
                          : `Bridge duty span: from ${pilotOnBoardTime} to ${pilotDisembarkedTime}.`}
                      </>
                    ) : (
                      <>
                        {language === 'pt'
                          ? 'Preencha os horários de "Piloto a Bordo" e "Desembarque do Piloto" para alimentar a escala de fadiga.'
                          : 'Fill in Pilot On Board and Disembarkation times to feed fatigue algorithms.'}
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    {language === 'pt' ? 'Tempo de Serviço' : 'Duty Hours'}
                  </span>
                  <span className="text-base sm:text-lg font-black text-blue-950">
                    {pilotDuty.formatted !== '--' ? pilotDuty.formatted : '--'}
                  </span>
                </div>
                <div className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                  pilotDuty.hours <= 4
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : pilotDuty.hours <= 6
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-red-100 text-red-900 border-red-300'
                }`}>
                  {pilotDuty.hours === 0 ? (language === 'pt' ? 'Aguardando horários' : 'Awaiting times') :
                    pilotDuty.hours <= 4 ? (language === 'pt' ? 'Fadiga Baixa' : 'Low Fatigue') :
                    pilotDuty.hours <= 6 ? (language === 'pt' ? 'Fadiga Moderada' : 'Moderate Fatigue') :
                    (language === 'pt' ? 'Fadiga Elevada (STCW)' : 'High Fatigue (STCW)')}
                </div>
              </div>
            </div>

            {/* BERÇO & PRÁTICO RESPONSÁVEL (MODELO DE ATRACAÇÃO APENAS PARA ATRACAÇÃO / MUDANÇA / PUXANÇA) */}
            <div className={`grid grid-cols-1 ${maneuverType === 'desatracacao' ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-3 pt-2 border-t border-slate-100`}>
              {maneuverType !== 'desatracacao' && (
                <div>
                  <label className="block text-xs font-bold uppercase text-black mb-1">
                    {language === 'pt' ? 'MODELO DE ATRACAÇÃO *' : 'BERTHING MODEL *'}
                  </label>
                  <select
                    value={berthingModel}
                    onChange={(e) => setBerthingModel(e.target.value as BerthingModel)}
                    className="w-full bg-white border-2 border-black rounded px-3 py-2 text-sm font-bold text-black"
                  >
                    <option value="Costado Bombordo (BB)">{language === 'pt' ? 'Costado de Bombordo (BB)' : 'Port Side (BB)'}</option>
                    <option value="Costado Boreste (BE)">{language === 'pt' ? 'Costado de Boreste (BE)' : 'Starboard Side (BE)'}</option>
                    <option value="Mediterrânea (Popa)">{language === 'pt' ? 'Mediterrânea (Popa ao Cais)' : 'Mediterranean (Stern-to)'}</option>
                    <option value="Amarras / Bóias">{language === 'pt' ? 'Amarras / Bóias de Amarração' : 'Buoy / Mooring Lines'}</option>
                    <option value="Dolphin / Terminal">{language === 'pt' ? 'Dolphin / Terminal Flutuante' : 'Dolphin / Offshore'}</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-black mb-1">
                  {maneuverType === 'desatracacao'
                    ? (language === 'pt' ? 'BERÇO / CAIS DE SAÍDA (DESATRACADO)' : 'DEPARTURE BERTH / QUAY')
                    : (language === 'pt' ? 'BERÇO / CAIS DESTINADO' : 'ASSIGNED BERTH / QUAY')}
                </label>
                <input
                  type="text"
                  value={berthTo}
                  onChange={(e) => setBerthTo(e.target.value)}
                  placeholder={maneuverType === 'desatracacao'
                    ? (language === 'pt' ? 'Ex: Berço 101 ou Cais Norte' : 'e.g. Berth 101 or North Quay')
                    : (language === 'pt' ? 'Ex: Berço 101 ou Cais Norte' : 'e.g. Berth 101 or North Quay')}
                  className="w-full bg-white border border-black rounded px-3 py-2 text-sm font-semibold text-black placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-black mb-1 flex items-center justify-between">
                  <span>{language === 'pt' ? 'PRÁTICO RESPONSÁVEL *' : 'LEAD PILOT *'}</span>
                  {currentUser && pilotId === currentUser.id && (
                    <span className="text-[10px] text-blue-800 font-bold bg-blue-100 px-1.5 py-0.2 rounded">
                      {language === 'pt' ? 'Seu Perfil Ativo' : 'Active Profile'}
                    </span>
                  )}
                </label>
                <select
                  value={pilotId}
                  onChange={(e) => {
                    setPilotId(e.target.value);
                    const p = pilots.find(item => item.id === e.target.value);
                    if (p) setCustomPilotName(p.name);
                  }}
                  className="w-full bg-white border-2 border-black rounded px-3 py-2 text-sm font-bold text-black focus:ring-2 focus:ring-blue-900"
                >
                  {currentUser && (
                    <option value={currentUser.id}>
                      ★ {currentUser.name} ({currentUser.rank}) [{language === 'pt' ? 'Você' : 'You'}]
                    </option>
                  )}
                  {pilots
                    .filter(p => !currentUser || p.id !== currentUser.id)
                    .map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.licenseNumber || p.category})
                      </option>
                    ))}
                  {pilots.length === 0 && !currentUser && (
                    <option value="">{language === 'pt' ? 'Nenhum prático registado' : 'No pilot registered'}</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* REBOCADORES & HORÁRIO DE OPERAÇÕES (DESDE QUE ENCOSTAM ATÉ SEREM DISPENSADOS) */}
          <div className="border-2 border-slate-300 rounded-lg p-4 bg-white space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <h3 className="text-sm font-black uppercase text-blue-900 flex items-center gap-2">
                <Anchor className="w-4 h-4 text-blue-700" />
                3. {language === 'pt' ? 'REBOCADORES & HORÁRIO DE OPERAÇÕES' : 'TUGS & OPERATIONAL TIMINGS'}
              </h3>
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                {language === 'pt' ? 'Operações: Encostamento até Dispensa' : 'Operations: Made Fast to Dismissal'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-xs font-bold uppercase text-black mb-1">
                  {language === 'pt' ? 'NÚMERO DE REBOCADORES' : 'NUMBER OF TUGS'}
                </label>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setTugsCount(num)}
                      className={`flex-1 py-2 rounded font-black text-sm border-2 transition-all ${
                        tugsCount === num
                          ? 'bg-blue-900 text-white border-black shadow-xs'
                          : 'bg-white text-slate-800 border-slate-300 hover:bg-blue-50'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-black mb-1">
                  {language === 'pt' ? 'ARRANQUE (SAÍDA DA BASE)' : 'DEPARTURE (BASE OUT)'}
                </label>
                <input
                  type="time"
                  value={tugArranque}
                  onChange={(e) => setTugArranque(e.target.value)}
                  className="w-full bg-white border border-black rounded px-2.5 py-2 text-sm font-bold text-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-black mb-1">
                  {language === 'pt' ? 'ENCOSTAM (FEITOS AO NAVIO) *' : 'MADE FAST (TUGS IN) *'}
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="time"
                    value={tugInicio}
                    onChange={(e) => setTugInicio(e.target.value)}
                    className="flex-1 bg-white border-2 border-black rounded px-2.5 py-2 text-sm font-bold text-black focus:ring-2 focus:ring-blue-900"
                  />
                  <button
                    type="button"
                    onClick={() => setTugInicio(new Date().toTimeString().slice(0, 5))}
                    className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 border border-slate-400 rounded font-semibold text-black"
                  >
                    {language === 'pt' ? 'Agora' : 'Now'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-black mb-1">
                  {language === 'pt' ? 'DISPENSADOS (LARGADOS) *' : 'DISMISSED (CAST OFF) *'}
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="time"
                    value={tugFim}
                    onChange={(e) => setTugFim(e.target.value)}
                    className="flex-1 bg-white border-2 border-black rounded px-2.5 py-2 text-sm font-bold text-black focus:ring-2 focus:ring-blue-900"
                  />
                  <button
                    type="button"
                    onClick={() => setTugFim(new Date().toTimeString().slice(0, 5))}
                    className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 border border-slate-400 rounded font-semibold text-black"
                  >
                    {language === 'pt' ? 'Agora' : 'Now'}
                  </button>
                </div>
              </div>
            </div>

            {/* CÁLCULO DE HORÁRIO DE OPERAÇÕES DE REBOCADORES */}
            <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-slate-800 text-white flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-blue-300" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase text-slate-900 block">
                    {language === 'pt' ? 'Horário de Operações de Rebocadores' : 'Tug Operational Period'}
                  </span>
                  <span className="text-[11px] text-slate-600">
                    {language === 'pt' 
                      ? 'Cálculo desde o encostamento ao navio até serem dispensados'
                      : 'Calculated from tugs made fast until dismissed'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs text-slate-600 font-semibold">
                  {tugInicio && tugFim ? `${tugInicio} → ${tugFim}` : '--:-- → --:--'}
                </span>
                <span className="bg-blue-900 text-white font-black text-xs px-2.5 py-1 rounded shadow-xs">
                  {tugOperations.formatted !== '--' ? tugOperations.formatted : (language === 'pt' ? 'Sem registro' : 'No record')}
                </span>
              </div>
            </div>
          </div>

          {/* OBSERVAÇÃO */}
          <div className="border-2 border-slate-300 rounded-lg p-4 bg-white space-y-2">
            <label className="block text-xs font-bold uppercase text-blue-900">
              4. OBSERVAÇÃO DO PRÁTICO
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Anotações operacionais, condição de mar, vento, defensas, amarras ou ocorrências..."
              className="w-full bg-white border-2 border-black rounded-md p-3 text-sm text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-800"
            />
          </div>

          {/* 5. CENTRO DE ANEXOS DA MANOBRA (MULTI-FONTES: CÂMERA, ARQUIVOS, COLAR CTR+V, PDF) */}
          <div className="space-y-3">
            <AttachmentManager
              attachments={attachments}
              onChange={handleAttachmentsChange}
              title="5. CENTRO DE ANEXOS DA MANOBRA (CÂMERA, FICHEIROS, COLAR OU PDF)"
            />

            {/* Ação Rápida de Download do Relatório com Anexos */}
            <div className="bg-slate-900 text-white rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 border-2 border-black shadow">
              <div className="text-xs text-slate-300">
                <span className="font-bold text-white">Relatório Oficial de Manobra:</span> Todos os {attachments.length} anexo(s) serão incorporados nas páginas seguintes do documento oficial.
              </div>
              <button
                type="button"
                onClick={handleQuickDownloadPdf}
                disabled={isGeneratingPdf}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-blue-400 shrink-0"
              >
                {isGeneratingPdf ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Gerando PDF Completo...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-white" />
                    <span>Descarregar PDF Oficial com Anexos</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* BOTÕES DE AÇÃO DO FORMULÁRIO */}
          <div className="pt-4 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-auto flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg border-2 border-slate-400 font-bold text-sm text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleManualSaveDraft}
                className="px-4 py-2.5 rounded-lg border-2 border-amber-600 bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-xs"
                title="Salva um rascunho de backup deste documento sem fechar"
              >
                <Clock className="w-4 h-4 text-amber-700" />
                <span>Guardar Rascunho / Backup</span>
              </button>
            </div>

            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={handleQuickDownloadPdf}
                disabled={isGeneratingPdf}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg border-2 border-black bg-white hover:bg-blue-50 text-blue-900 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Exportar PDF</span>
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg border-2 border-black bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm tracking-wide shadow-md flex items-center justify-center gap-2 transition-colors"
                title="Guarda a manobra no sistema (aceita preenchimento parcial)"
              >
                <Check className="w-4 h-4 text-blue-300 stroke-[3]" />
                <span>GUARDAR MANOBRA (ACEITA PARCIAL)</span>
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
