import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Vessel, 
  ManeuverRecord, 
  Pilot, 
  PilotShift, 
  PortTerminal, 
  WeatherCondition,
  TimeMilestones,
  IncidentRecord,
  UserPilotProfile,
  PilotRank,
  MaritimeAlert,
  ManeuverAttachment
} from '../types/maritime';
import { 
  INITIAL_VESSELS, 
  INITIAL_MANEUVERS, 
  INITIAL_PILOTS, 
  INITIAL_SHIFTS, 
  INITIAL_TERMINALS, 
  INITIAL_WEATHER,
  INITIAL_ALERTS
} from '../data/initialData';
import { exportManeuversToExcel, exportFullJsonBackup } from '../utils/excelImportExport';
import { Language, Translations, TRANSLATIONS } from '../utils/translations';
import { calculateMinuteTide } from '../utils/tideCalculation';

export type AppView = 
  | 'dashboard' 
  | 'operacoes' 
  | 'saude'
  | 'alertas'
  | 'mares'
  | 'arquivo'
  | 'testes'
  | 'navios' 
  | 'pilotos' 
  | 'cancelamentos' 
  | 'performance' 
  | 'seguranca' 
  | 'relatorios'
  | 'mobile_quicklog';

interface MaritimeContextType {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations) => string;
  vessels: Vessel[];
  maneuvers: ManeuverRecord[];
  pilots: Pilot[];
  shifts: PilotShift[];
  terminals: PortTerminal[];
  weather: WeatherCondition;
  alerts: MaritimeAlert[];
  isMobileHudOpen: boolean;
  setIsMobileHudOpen: (open: boolean) => void;
  selectedManeuverId: string | null;
  setSelectedManeuverId: (id: string | null) => void;
  activePilotId: string;
  setActivePilotId: (id: string) => void;
  currentUser: UserPilotProfile | null;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  registerUser: (profile: Omit<UserPilotProfile, 'id' | 'registeredAt'>) => void;
  updateUserProfile: (updates: Partial<UserPilotProfile>) => void;
  logoutUser: () => void;
  syncStatusMessage: string | null;
  clearSyncStatusMessage: () => void;
  registeredPilotNames: string[];
  checkPilotBackupExists: (name: string) => boolean;
  getPilotBackupSummary: (name: string) => { exists: boolean; maneuverCount: number; lastSync?: string };
  exportPilotBackup: (pilotName?: string) => void;
  restorePilotBackup: (backupData: any) => boolean;
  switchPilotByName: (name: string) => boolean;
  
  // Sincronização em tempo real entre dispositivos
  isOnline: boolean;
  isRealtimeConnected: boolean;
  activeSyncDevices: number;
  lastSyncTime: string | null;
  refreshAlertsNow: () => Promise<void>;

  // Actions
  addManeuver: (maneuver: Omit<ManeuverRecord, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateManeuver: (id: string, updates: Partial<ManeuverRecord>) => void;
  deleteManeuver: (id: string) => void;
  addAttachmentToManeuver: (maneuverId: string, attachment: ManeuverAttachment) => void;
  removeAttachmentFromManeuver: (maneuverId: string, attachmentId: string) => void;
  updateAttachmentInManeuver: (maneuverId: string, attachmentId: string, updates: Partial<ManeuverAttachment>) => void;
  updateMilestone: (maneuverId: string, milestoneKey: keyof TimeMilestones, timeString?: string) => void;
  completeManeuver: (maneuverId: string, remarks?: string) => void;
  cancelManeuverWithIncident: (maneuverId: string, incident: IncidentRecord, remarks?: string) => void;
  addVessel: (vessel: Omit<Vessel, 'id'>) => string;
  updateVessel: (id: string, updates: Partial<Vessel>) => void;
  addPilot: (pilot: Omit<Pilot, 'id' | 'completedManeuversCount'>) => string;
  updatePilotStatus: (pilotId: string, status: Pilot['status']) => void;
  updateWeather: (weather: Partial<WeatherCondition>) => void;
  
  // Alertas
  addAlert: (alert: Omit<MaritimeAlert, 'id' | 'issuedAt'>) => string;
  updateAlert: (id: string, updates: Partial<MaritimeAlert>) => void;
  toggleAlertActive: (id: string) => void;
  deleteAlert: (id: string) => void;

  resetAllData: () => void;
  exportManeuversToCsv: () => void;
  exportIncidentsToCsv: () => void;
  exportManeuversToXlsx: () => void;
  exportFullBackup: () => void;
  importManeuversBatch: (imported: ManeuverRecord[]) => number;
  restoreFullBackup: (data: any) => boolean;
}

const MaritimeContext = createContext<MaritimeContextType | undefined>(undefined);

const STORAGE_KEYS = {
  VESSELS: 'pilots_records_vessels_v2',
  MANEUVERS: 'pilots_records_maneuvers_v2',
  PILOTS: 'pilots_records_pilots_v2',
  SHIFTS: 'pilots_records_shifts_v2',
  WEATHER: 'pilots_records_weather_v2',
  ALERTS: 'pilots_records_alerts_v2',
  USER_PROFILE: 'pilots_records_user_profile_v2'
};

const PILOT_BACKUP_PREFIX = 'pilots_records_pilot_backup_v2_';
const REGISTERED_PILOTS_KEY = 'pilots_records_registered_pilots_list_v2';

export const normalizePilotKey = (name: string): string => {
  return name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_');
};

// Global Data Merging Helpers across users and pilots
export const mergeAlerts = (listA: MaritimeAlert[], listB: MaritimeAlert[]): MaritimeAlert[] => {
  const map = new Map<string, MaritimeAlert>();
  (listA || []).forEach(a => { if (a && a.id) map.set(a.id, a); });
  (listB || []).forEach(b => {
    if (!b || !b.id) return;
    const existing = map.get(b.id);
    if (!existing) {
      map.set(b.id, b);
    } else {
      const timeA = new Date(existing.issuedAt || 0).getTime();
      const timeB = new Date(b.issuedAt || 0).getTime();
      if (timeB >= timeA) {
        map.set(b.id, { ...existing, ...b });
      }
    }
  });
  return Array.from(map.values()).sort((a, b) => 
    new Date(b.issuedAt || 0).getTime() - new Date(a.issuedAt || 0).getTime()
  );
};

export const mergeManeuvers = (listA: ManeuverRecord[], listB: ManeuverRecord[]): ManeuverRecord[] => {
  const map = new Map<string, ManeuverRecord>();
  (listA || []).forEach(m => { if (m && m.id) map.set(m.id, m); });
  (listB || []).forEach(m => {
    if (!m || !m.id) return;
    const existing = map.get(m.id);
    if (!existing) {
      map.set(m.id, m);
    } else {
      const timeA = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
      const timeB = new Date(m.updatedAt || m.createdAt || 0).getTime();
      if (timeB >= timeA) {
        map.set(m.id, { ...existing, ...m });
      }
    }
  });
  return Array.from(map.values()).sort((a, b) => 
    new Date(b.scheduledTime || b.createdAt || 0).getTime() - new Date(a.scheduledTime || a.createdAt || 0).getTime()
  );
};

export const mergeVessels = (listA: Vessel[], listB: Vessel[]): Vessel[] => {
  const map = new Map<string, Vessel>();
  (listA || []).forEach(v => { if (v && v.id) map.set(v.id, v); });
  (listB || []).forEach(v => {
    if (!v || !v.id) return;
    if (!map.has(v.id)) {
      map.set(v.id, v);
    }
  });
  return Array.from(map.values());
};

// Broadcast channel for real-time client synchronization
const SYNC_CHANNEL_NAME = 'pilots_records_sync_bus_v2';
let syncChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
    syncChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  }
} catch {}

const broadcastSharedEvent = (type: string, payload: any) => {
  try {
    syncChannel?.postMessage({ type, payload, timestamp: Date.now() });
  } catch {}
};

// Purge any pre-existing v1 mock data from browser localStorage to start cleanly from zero
try {
  ['pilots_records_vessels_v1', 'pilots_records_maneuvers_v1', 'pilots_records_pilots_v1', 'pilots_records_shifts_v1', 'pilots_records_weather_v1'].forEach(k => {
    localStorage.removeItem(k);
  });
} catch {
  // Ignore in SSR/sandbox
}

export const MaritimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('pilots_records_lang');
      if (saved === 'en' || saved === 'pt') return saved;
    } catch {}
    return 'pt';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('pilots_records_lang', lang);
    } catch {}
  };

  const t = (key: keyof Translations): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.pt[key] || key;
  };

  const [isMobileHudOpen, setIsMobileHudOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedManeuverId, setSelectedManeuverId] = useState<string | null>(null);
  const [activePilotId, setActivePilotId] = useState<string>('');
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);
  const clearSyncStatusMessage = () => setSyncStatusMessage(null);

  const [registeredPilotNames, setRegisteredPilotNames] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(REGISTERED_PILOTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const addNameToRegisteredPilots = (name: string) => {
    const clean = name.trim();
    if (!clean) return;
    setRegisteredPilotNames(prev => {
      const exists = prev.some(n => normalizePilotKey(n) === normalizePilotKey(clean));
      if (exists) return prev;
      const updated = [...prev, clean];
      try {
        localStorage.setItem(REGISTERED_PILOTS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Load logged-in pilot / user profile
  const [currentUser, setCurrentUser] = useState<UserPilotProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Load from localStorage or default
  const [vessels, setVessels] = useState<Vessel[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VESSELS);
      return saved ? JSON.parse(saved) : INITIAL_VESSELS;
    } catch {
      return INITIAL_VESSELS;
    }
  });

  const [maneuvers, setManeuvers] = useState<ManeuverRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MANEUVERS);
      return saved ? JSON.parse(saved) : INITIAL_MANEUVERS;
    } catch {
      return INITIAL_MANEUVERS;
    }
  });

  const [pilots, setPilots] = useState<Pilot[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PILOTS);
      const parsed: Pilot[] = saved ? JSON.parse(saved) : INITIAL_PILOTS;
      // If user is already registered, ensure user exists in pilots
      const savedUserStr = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (savedUserStr) {
        const u: UserPilotProfile = JSON.parse(savedUserStr);
        if (!parsed.some(p => p.id === u.id || p.name.toLowerCase() === u.name.toLowerCase())) {
          parsed.unshift({
            id: u.id,
            name: u.name,
            licenseNumber: u.licenseNumber,
            category: u.rank,
            phone: u.phone || '',
            vhfCallSign: u.vhfCallSign || `Prático ${u.name.split(' ').pop() || 'Serviço'}`,
            status: 'de_servico',
            currentShift: 'Manhã/Tarde (08h-16h)',
            completedManeuversCount: 0,
            avatarColor: 'bg-blue-900'
          });
        }
      }
      return parsed;
    } catch {
      return INITIAL_PILOTS;
    }
  });

  const [shifts, setShifts] = useState<PilotShift[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHIFTS);
      return saved ? JSON.parse(saved) : INITIAL_SHIFTS;
    } catch {
      return INITIAL_SHIFTS;
    }
  });

  const [weather, setWeather] = useState<WeatherCondition>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WEATHER);
      return saved ? JSON.parse(saved) : INITIAL_WEATHER;
    } catch {
      return INITIAL_WEATHER;
    }
  });

  const [alerts, setAlerts] = useState<MaritimeAlert[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ALERTS);
      return saved ? JSON.parse(saved) : INITIAL_ALERTS;
    } catch {
      return INITIAL_ALERTS;
    }
  });

  // Estado de sincronização em tempo real entre dispositivos
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);
  const [activeSyncDevices, setActiveSyncDevices] = useState<number>(1);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Sinal sonoro suave ao receber alerta urgente de outro utilizador/dispositivo
  const playAlertAudioChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  };

  const [terminals] = useState<PortTerminal[]>(INITIAL_TERMINALS);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    } catch (e) {
      console.error(e);
    }
  }, [alerts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VESSELS, JSON.stringify(vessels));
    } catch (e) {
      console.error(e);
    }
  }, [vessels]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MANEUVERS, JSON.stringify(maneuvers));
    } catch (e) {
      console.error(e);
    }
  }, [maneuvers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PILOTS, JSON.stringify(pilots));
    } catch (e) {
      console.error(e);
    }
  }, [pilots]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
    } catch (e) {
      console.error(e);
    }
  }, [shifts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WEATHER, JSON.stringify(weather));
    } catch (e) {
      console.error(e);
    }
  }, [weather]);

  // Automatic Real-Time Tide Calculation: Updates weather tide height & trend based on current date & minute
  useEffect(() => {
    const updateRealtimeTide = () => {
      try {
        const now = new Date();
        const currentMinute = (now.getHours() * 60) + now.getMinutes();
        const tide = calculateMinuteTide(now.getFullYear(), now.getMonth() + 1, now.getDate(), currentMinute);
        
        setWeather(prev => {
          if (prev.tideHeightMeters === tide.height && prev.tideState === tide.trend) {
            return prev;
          }
          return {
            ...prev,
            tideHeightMeters: tide.height,
            tideState: tide.trend
          };
        });
      } catch (err) {
        console.error('Error computing dynamic tide for current date:', err);
      }
    };

    updateRealtimeTide();
    const timer = setInterval(updateRealtimeTide, 30000); // Re-calculate every 30 seconds
    return () => clearInterval(timer);
  }, []);

  // Função para sincronizar alertas com o servidor (autoritativo para todos os dispositivos)
  const syncAlertsWithServer = async () => {
    try {
      const res = await fetch('/api/shared/alerts', { 
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.alerts)) {
        setAlerts(data.alerts);
        if (data.activeDeviceCount) {
          setActiveSyncDevices(data.activeDeviceCount);
        }
        setLastSyncTime(new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        try {
          localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(data.alerts));
        } catch {}
      }
    } catch (e) {
      console.warn('Falha na sincronização de alertas com servidor:', e);
    }
  };

  const syncManeuversWithServer = async () => {
    try {
      const res = await fetch('/api/shared/maneuvers', { 
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.maneuvers)) {
        setManeuvers(prev => {
          const merged = mergeManeuvers(prev, data.maneuvers);
          try {
            localStorage.setItem(STORAGE_KEYS.MANEUVERS, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    } catch {}
  };

  const refreshAlertsNow = async () => {
    await Promise.all([syncAlertsWithServer(), syncManeuversWithServer()]);
  };

  // 1. Conexão em Tempo Real via Server-Sent Events (SSE) para sincronização instantânea entre dispositivos
  useEffect(() => {
    let sse: EventSource | null = null;
    let reconnectTimer: any = null;
    let isSubscribed = true;

    const connectSseStream = () => {
      if (!isSubscribed) return;
      if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;

      try {
        sse = new EventSource('/api/shared/events');

        sse.onopen = () => {
          if (!isSubscribed) return;
          setIsRealtimeConnected(true);
        };

        sse.onmessage = (event) => {
          if (!isSubscribed) return;
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'CONNECTED') {
              setIsRealtimeConnected(true);
              if (data.clientCount) setActiveSyncDevices(data.clientCount);
              if (Array.isArray(data.alerts)) {
                setAlerts(data.alerts);
                try {
                  localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(data.alerts));
                } catch {}
                setLastSyncTime(new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
              }
            } else if (data.type === 'ALERT_SYNC' && data.payload) {
              if (Array.isArray(data.payload.alerts)) {
                setAlerts(data.payload.alerts);
                try {
                  localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(data.payload.alerts));
                } catch {}
                setLastSyncTime(new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
                
                // Disparar toque suave para avisar o piloto de novo alerta urgente
                if (data.payload.action === 'UPSERT') {
                  playAlertAudioChime();
                }
              }
            } else if (data.type === 'MANEUVER_SYNC' && data.payload) {
              if (Array.isArray(data.payload.maneuvers)) {
                setManeuvers(prev => mergeManeuvers(prev, data.payload.maneuvers));
              }
            } else if (data.type === 'PING') {
              setIsRealtimeConnected(true);
              if (data.activeClients) setActiveSyncDevices(data.activeClients);
            }
          } catch {}
        };

        sse.onerror = () => {
          if (!isSubscribed) return;
          setIsRealtimeConnected(false);
          sse?.close();
          sse = null;
          // Reconectar após 3 segundos
          reconnectTimer = setTimeout(connectSseStream, 3000);
        };
      } catch {
        setIsRealtimeConnected(false);
      }
    };

    connectSseStream();

    return () => {
      isSubscribed = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (sse) sse.close();
    };
  }, []);

  // 2. Fallback Polling & Inter-Tab BroadcastChannel
  useEffect(() => {
    // Sincronização inicial
    syncAlertsWithServer();
    syncManeuversWithServer();

    // Fallback polling a cada 4 segundos caso o dispositivo esteja no telemóvel ou SSE seja interrompido
    const intervalId = setInterval(() => {
      if (typeof navigator === 'undefined' || navigator.onLine) {
        syncAlertsWithServer();
        syncManeuversWithServer();
      }
    }, 4000);

    // Sincronização ao voltar o foco ou reconectar internet
    const handleSyncTrigger = () => {
      setIsOnline(navigator.onLine);
      syncAlertsWithServer();
      syncManeuversWithServer();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsRealtimeConnected(false);
    };

    window.addEventListener('online', handleSyncTrigger);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('focus', handleSyncTrigger);

    // Sincronização com abas locais via storage
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.ALERTS && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setAlerts(parsed);
        } catch {}
      }
      if (e.key === STORAGE_KEYS.MANEUVERS && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setManeuvers(parsed);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    // BroadcastChannel local
    if (syncChannel) {
      syncChannel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'ALERT_UPSERT' && payload) {
          setAlerts(prev => {
            const next = [payload, ...prev.filter(a => a.id !== payload.id)];
            try {
              localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(next));
            } catch {}
            return next;
          });
        } else if (type === 'ALERT_DELETE' && payload) {
          setAlerts(prev => {
            const next = prev.filter(a => a.id !== payload);
            try {
              localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(next));
            } catch {}
            return next;
          });
        } else if (type === 'MANEUVER_UPSERT' && payload) {
          setManeuvers(prev => mergeManeuvers(prev, [payload]));
        } else if (type === 'SYNC_ALL') {
          syncAlertsWithServer();
          syncManeuversWithServer();
        }
      };
    }

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('online', handleSyncTrigger);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('focus', handleSyncTrigger);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Continuous Pilot Backup Synchronization (Specific to Active Pilot)
  useEffect(() => {
    if (!currentUser?.name) return;
    const key = `${PILOT_BACKUP_PREFIX}${normalizePilotKey(currentUser.name)}`;
    const backupData = {
      pilotName: currentUser.name,
      licenseNumber: currentUser.licenseNumber,
      rank: currentUser.rank,
      phone: currentUser.phone,
      vhfCallSign: currentUser.vhfCallSign,
      savedAt: new Date().toISOString(),
      maneuvers,
      vessels,
      alerts,
      shifts
    };
    try {
      localStorage.setItem(key, JSON.stringify(backupData));
    } catch (e) {
      console.error('Auto backup failed', e);
    }
  }, [maneuvers, vessels, alerts, shifts, currentUser]);

  const addManeuver = (maneuverData: Omit<ManeuverRecord, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const sequenceNumber = maneuvers.length + 1;
    const padded = String(sequenceNumber).padStart(4, '0');
    const newId = `MNV-2026-${padded}`;
    const now = new Date().toISOString();

    const newManeuver: ManeuverRecord = {
      ...maneuverData,
      id: newId,
      createdAt: now,
      updatedAt: now
    };

    setManeuvers(prev => [newManeuver, ...prev]);

    // If assigned pilot is in active maneuver, update pilot status
    if (maneuverData.status === 'em_curso') {
      setPilots(prev => prev.map(p => p.id === maneuverData.pilotId ? { ...p, status: 'em_manobra' } : p));
    }

    // Server & Broadcast Synchronization for shared operations
    try {
      fetch('/api/shared/maneuvers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maneuver: newManeuver })
      }).catch(() => {});
    } catch {}
    broadcastSharedEvent('MANEUVER_UPSERT', newManeuver);

    return newId;
  };

  const updateManeuver = (id: string, updates: Partial<ManeuverRecord>) => {
    let updatedItem: ManeuverRecord | null = null;
    setManeuvers(prev => prev.map(m => {
      if (m.id === id) {
        updatedItem = {
          ...m,
          ...updates,
          updatedAt: new Date().toISOString()
        };
        return updatedItem;
      }
      return m;
    }));

    if (updatedItem) {
      try {
        fetch('/api/shared/maneuvers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ maneuver: updatedItem })
        }).catch(() => {});
      } catch {}
      broadcastSharedEvent('MANEUVER_UPSERT', updatedItem);
    }
  };

  const addAttachmentToManeuver = (maneuverId: string, attachment: ManeuverAttachment) => {
    let updatedItem: ManeuverRecord | null = null;
    setManeuvers(prev => prev.map(m => {
      if (m.id === maneuverId) {
        const existing = m.attachments || [];
        const updatedAttachments = [...existing, attachment];
        updatedItem = {
          ...m,
          attachments: updatedAttachments,
          // Compatibilidade com photoUrl caso ainda não exista
          photoUrl: m.photoUrl || (attachment.fileType === 'image' ? attachment.dataUrl : undefined),
          photoTitle: m.photoTitle || attachment.name,
          updatedAt: new Date().toISOString()
        };
        return updatedItem;
      }
      return m;
    }));

    if (updatedItem) {
      try {
        fetch('/api/shared/maneuvers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ maneuver: updatedItem })
        }).catch(() => {});
      } catch {}
      broadcastSharedEvent('MANEUVER_UPSERT', updatedItem);
    }
  };

  const removeAttachmentFromManeuver = (maneuverId: string, attachmentId: string) => {
    let updatedItem: ManeuverRecord | null = null;
    setManeuvers(prev => prev.map(m => {
      if (m.id === maneuverId) {
        const filtered = (m.attachments || []).filter(a => a.id !== attachmentId);
        const firstImage = filtered.find(a => a.fileType === 'image');
        updatedItem = {
          ...m,
          attachments: filtered,
          photoUrl: firstImage ? firstImage.dataUrl : undefined,
          photoTitle: firstImage ? firstImage.name : undefined,
          updatedAt: new Date().toISOString()
        };
        return updatedItem;
      }
      return m;
    }));

    if (updatedItem) {
      try {
        fetch('/api/shared/maneuvers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ maneuver: updatedItem })
        }).catch(() => {});
      } catch {}
      broadcastSharedEvent('MANEUVER_UPSERT', updatedItem);
    }
  };

  const updateAttachmentInManeuver = (maneuverId: string, attachmentId: string, updates: Partial<ManeuverAttachment>) => {
    let updatedItem: ManeuverRecord | null = null;
    setManeuvers(prev => prev.map(m => {
      if (m.id === maneuverId) {
        const updated = (m.attachments || []).map(a => a.id === attachmentId ? { ...a, ...updates } : a);
        updatedItem = {
          ...m,
          attachments: updated,
          updatedAt: new Date().toISOString()
        };
        return updatedItem;
      }
      return m;
    }));

    if (updatedItem) {
      try {
        fetch('/api/shared/maneuvers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ maneuver: updatedItem })
        }).catch(() => {});
      } catch {}
      broadcastSharedEvent('MANEUVER_UPSERT', updatedItem);
    }
  };

  const updateMilestone = (maneuverId: string, milestoneKey: keyof TimeMilestones, timeString?: string) => {
    const timeVal = timeString || new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    setManeuvers(prev => prev.map(m => {
      if (m.id === maneuverId) {
        const updatedMilestones = {
          ...m.milestones,
          [milestoneKey]: timeVal
        };

        let newStatus = m.status;
        if (milestoneKey === 'boardingPilotBoat' || milestoneKey === 'pilotOnBoard' || milestoneKey === 'commenceManeuver') {
          if (m.status === 'programada') newStatus = 'em_curso';
        }

        return {
          ...m,
          status: newStatus,
          milestones: updatedMilestones,
          updatedAt: new Date().toISOString()
        };
      }
      return m;
    }));
  };

  const completeManeuver = (maneuverId: string, remarks?: string) => {
    const nowTime = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    setManeuvers(prev => prev.map(m => {
      if (m.id === maneuverId) {
        return {
          ...m,
          status: 'concluida',
          durationMinutes: m.durationMinutes || 75,
          milestones: {
            ...m.milestones,
            allFastCompleted: m.milestones.allFastCompleted || nowTime,
            pilotDisembarked: m.milestones.pilotDisembarked || nowTime
          },
          pilotRemarks: remarks !== undefined ? remarks : m.pilotRemarks,
          pilotageCertificateSigned: true,
          updatedAt: new Date().toISOString()
        };
      }
      return m;
    }));

    // Update pilot status back to 'de_servico' and increment count
    const maneuver = maneuvers.find(m => m.id === maneuverId);
    if (maneuver) {
      setPilots(prev => prev.map(p => p.id === maneuver.pilotId ? { 
        ...p, 
        status: 'de_servico',
        completedManeuversCount: p.completedManeuversCount + 1 
      } : p));
    }
  };

  const cancelManeuverWithIncident = (maneuverId: string, incident: IncidentRecord, remarks?: string) => {
    setManeuvers(prev => prev.map(m => {
      if (m.id === maneuverId) {
        return {
          ...m,
          status: 'cancelada',
          incident,
          pilotRemarks: remarks || m.pilotRemarks,
          updatedAt: new Date().toISOString()
        };
      }
      return m;
    }));

    const maneuver = maneuvers.find(m => m.id === maneuverId);
    if (maneuver) {
      setPilots(prev => prev.map(p => p.id === maneuver.pilotId ? { ...p, status: 'de_servico' } : p));
    }
  };

  const addVessel = (vesselData: Omit<Vessel, 'id'>): string => {
    const newId = `vess-${Date.now().toString().slice(-4)}`;
    const newVessel: Vessel = {
      ...vesselData,
      id: newId
    };
    setVessels(prev => [newVessel, ...prev]);
    return newId;
  };

  const updateVessel = (id: string, updates: Partial<Vessel>) => {
    setVessels(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const addPilot = (pilotData: Omit<Pilot, 'id' | 'completedManeuversCount'>): string => {
    const newId = `plt-${Date.now().toString().slice(-3)}`;
    const newPilot: Pilot = {
      ...pilotData,
      id: newId,
      completedManeuversCount: 0
    };
    setPilots(prev => [...prev, newPilot]);
    return newId;
  };

  const checkPilotBackupExists = (name: string): boolean => {
    if (!name || !name.trim()) return false;
    const key = `${PILOT_BACKUP_PREFIX}${normalizePilotKey(name)}`;
    return !!localStorage.getItem(key);
  };

  const getPilotBackupSummary = (name: string) => {
    if (!name || !name.trim()) return { exists: false, maneuverCount: 0 };
    const key = `${PILOT_BACKUP_PREFIX}${normalizePilotKey(name)}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          exists: true,
          maneuverCount: Array.isArray(parsed.maneuvers) ? parsed.maneuvers.length : 0,
          lastSync: parsed.savedAt
        };
      }
    } catch {}
    return { exists: false, maneuverCount: 0 };
  };

  const exportPilotBackup = (pilotName?: string) => {
    const targetName = pilotName || currentUser?.name;
    if (!targetName) return;
    const normKey = normalizePilotKey(targetName);
    const key = `${PILOT_BACKUP_PREFIX}${normKey}`;
    let dataToExport: any = null;
    try {
      const raw = localStorage.getItem(key);
      if (raw) dataToExport = JSON.parse(raw);
    } catch {}
    if (!dataToExport) {
      dataToExport = {
        pilotName: targetName,
        licenseNumber: currentUser?.licenseNumber || '',
        rank: currentUser?.rank || 'Piloto Sênior',
        phone: currentUser?.phone || '',
        vhfCallSign: currentUser?.vhfCallSign || '',
        maneuvers: maneuvers.filter(m => normalizePilotKey(m.pilotName) === normKey),
        vessels,
        alerts,
        shifts,
        savedAt: new Date().toISOString()
      };
    }
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Piloto_${targetName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const restorePilotBackup = (backupData: any): boolean => {
    try {
      if (!backupData || !backupData.pilotName) return false;
      const targetName = String(backupData.pilotName).trim();
      const normKey = normalizePilotKey(targetName);
      const key = `${PILOT_BACKUP_PREFIX}${normKey}`;
      localStorage.setItem(key, JSON.stringify(backupData));
      addNameToRegisteredPilots(targetName);

      if (Array.isArray(backupData.maneuvers)) setManeuvers(backupData.maneuvers);
      if (Array.isArray(backupData.vessels) && backupData.vessels.length > 0) setVessels(backupData.vessels);
      if (Array.isArray(backupData.alerts)) setAlerts(backupData.alerts);
      if (Array.isArray(backupData.shifts)) setShifts(backupData.shifts);

      const userProfile: UserPilotProfile = {
        id: `plt-${normKey}`,
        name: targetName,
        rank: backupData.rank || 'Piloto Sênior',
        licenseNumber: backupData.licenseNumber || '',
        phone: backupData.phone || '',
        vhfCallSign: backupData.vhfCallSign || '',
        registeredAt: backupData.savedAt || new Date().toISOString()
      };
      setCurrentUser(userProfile);
      setActivePilotId(userProfile.id);
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userProfile));
      setSyncStatusMessage(`Cópia de segurança do piloto "${targetName}" restaurada e dados sincronizados com sucesso.`);
      return true;
    } catch (e) {
      console.error('Erro ao restaurar backup de piloto:', e);
      return false;
    }
  };

  const switchPilotByName = (targetName: string): boolean => {
    if (!targetName || !targetName.trim()) return false;
    const cleanName = targetName.trim();
    const normKey = normalizePilotKey(cleanName);
    const key = `${PILOT_BACKUP_PREFIX}${normKey}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const backup = JSON.parse(raw);
        if (Array.isArray(backup.maneuvers)) setManeuvers(prev => mergeManeuvers(prev, backup.maneuvers));
        if (Array.isArray(backup.vessels) && backup.vessels.length > 0) setVessels(prev => mergeVessels(prev, backup.vessels));
        if (Array.isArray(backup.alerts)) setAlerts(prev => mergeAlerts(prev, backup.alerts));
        if (Array.isArray(backup.shifts)) setShifts(backup.shifts);

        const profile: UserPilotProfile = {
          id: `plt-${normKey}`,
          name: cleanName,
          rank: backup.rank || 'Piloto Sênior',
          licenseNumber: backup.licenseNumber || '',
          phone: backup.phone || '',
          vhfCallSign: backup.vhfCallSign || '',
          registeredAt: backup.savedAt || new Date().toISOString()
        };
        setCurrentUser(profile);
        setActivePilotId(profile.id);
        localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
        setSyncStatusMessage(`Sessão ativa alterada para o piloto "${cleanName}". Todos os dados foram sincronizados.`);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const registerUser = (profileData: Omit<UserPilotProfile, 'id' | 'registeredAt'>) => {
    const rawName = profileData.name.trim();
    const normKey = normalizePilotKey(rawName);
    const backupKey = `${PILOT_BACKUP_PREFIX}${normKey}`;
    const existingBackupStr = localStorage.getItem(backupKey);

    addNameToRegisteredPilots(rawName);

    if (existingBackupStr) {
      // 1. NOME TAXATIVAMENTE IGUAL: Sincroniza dados e histórico do piloto existente!
      try {
        const backupData = JSON.parse(existingBackupStr);
        if (Array.isArray(backupData.maneuvers)) {
          setManeuvers(prev => mergeManeuvers(prev, backupData.maneuvers));
        }
        if (Array.isArray(backupData.vessels) && backupData.vessels.length > 0) {
          setVessels(prev => mergeVessels(prev, backupData.vessels));
        }
        if (Array.isArray(backupData.alerts) && backupData.alerts.length > 0) {
          setAlerts(prev => mergeAlerts(prev, backupData.alerts));
        }
        if (Array.isArray(backupData.shifts) && backupData.shifts.length > 0) {
          setShifts(backupData.shifts);
        }

        const fullProfile: UserPilotProfile = {
          ...profileData,
          name: rawName,
          id: `plt-${normKey}`,
          licenseNumber: profileData.licenseNumber || backupData.licenseNumber || '',
          rank: profileData.rank || backupData.rank || 'Piloto Sênior',
          phone: profileData.phone || backupData.phone || '',
          vhfCallSign: profileData.vhfCallSign || backupData.vhfCallSign || '',
          registeredAt: backupData.savedAt || new Date().toISOString()
        };
        setCurrentUser(fullProfile);
        setActivePilotId(fullProfile.id);
        localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(fullProfile));
        setSyncStatusMessage(`Piloto reconhecido taxativamente! Dados e histórico de manobras de "${rawName}" sincronizados com sucesso a partir do backup.`);
      } catch (e) {
        console.error('Erro na sincronização de dados do piloto:', e);
      }
    } else {
      // 2. DADOS DIFERENTES / NOVO UTILIZADOR: Perfil isolado e novo backup gerado
      const newId = `plt-${normKey}`;
      const fullProfile: UserPilotProfile = {
        ...profileData,
        name: rawName,
        id: newId,
        registeredAt: new Date().toISOString()
      };
      setCurrentUser(fullProfile);
      setActivePilotId(newId);
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(fullProfile));

      // Guardar backup inicial limpo para este piloto
      const initialBackup = {
        pilotName: rawName,
        licenseNumber: profileData.licenseNumber,
        rank: profileData.rank,
        phone: profileData.phone,
        vhfCallSign: profileData.vhfCallSign,
        maneuvers: [],
        vessels: vessels,
        alerts: alerts,
        shifts: shifts,
        savedAt: new Date().toISOString()
      };
      try {
        localStorage.setItem(backupKey, JSON.stringify(initialBackup));
      } catch (e) {
        console.error(e);
      }
      setSyncStatusMessage(`Novo utilizador detetado. Perfil isolado e cópia de segurança dedicada criada para "${rawName}".`);
    }

    // Atualizar roster de pilotos geral
    setPilots(prev => {
      const existing = prev.find(p => normalizePilotKey(p.name) === normKey);
      if (existing) {
        return prev.map(p => p.id === existing.id ? {
          ...p,
          name: rawName,
          category: profileData.rank,
          licenseNumber: profileData.licenseNumber,
          phone: profileData.phone || p.phone,
          vhfCallSign: profileData.vhfCallSign || p.vhfCallSign
        } : p);
      }
      const newPilotItem: Pilot = {
        id: `plt-${normKey}`,
        name: rawName,
        licenseNumber: profileData.licenseNumber,
        category: profileData.rank,
        phone: profileData.phone || '',
        vhfCallSign: profileData.vhfCallSign || `Prático ${rawName.split(' ').pop() || 'Serviço'}`,
        status: 'de_servico',
        currentShift: 'Manhã/Tarde (08h-16h)',
        completedManeuversCount: 0,
        avatarColor: 'bg-blue-900'
      };
      return [newPilotItem, ...prev];
    });
  };

  const updateUserProfile = (updates: Partial<UserPilotProfile>) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      // Also update pilots roster
      setPilots(pList => pList.map(p => p.id === prev.id ? {
        ...p,
        name: updated.name,
        category: updated.rank,
        licenseNumber: updated.licenseNumber,
        phone: updated.phone !== undefined ? updated.phone : p.phone,
        vhfCallSign: updated.vhfCallSign !== undefined ? updated.vhfCallSign : p.vhfCallSign
      } : p));
      return updated;
    });
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setActivePilotId('');
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    } catch (e) {
      console.error(e);
    }
  };

  const updatePilotStatus = (pilotId: string, status: Pilot['status']) => {
    setPilots(prev => prev.map(p => p.id === pilotId ? { ...p, status } : p));
  };

  const updateWeather = (updates: Partial<WeatherCondition>) => {
    setWeather(prev => ({ ...prev, ...updates }));
  };

  const resetAllData = () => {
    setVessels([]);
    setManeuvers([]);
    setPilots([]);
    setShifts([]);
    setWeather(INITIAL_WEATHER);
    try {
      Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
      ['pilots_records_vessels_v1', 'pilots_records_maneuvers_v1', 'pilots_records_pilots_v1', 'pilots_records_shifts_v1', 'pilots_records_weather_v1'].forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.error(e);
    }
    // Also reset current user registration so clean slate
    setCurrentUser(null);
    setActivePilotId('');
  };

  const exportManeuversToCsv = () => {
    const headers = [
      'ID_Manobra',
      'Navio',
      'IMO',
      'Tipo_Navio',
      'Bandeira',
      'LOA_m',
      'Boca_m',
      'Calado_Vante_m',
      'Calado_Re_m',
      'Agente',
      'Tipo_Operacao',
      'Status',
      'Data_Hora_Agendada',
      'Berco_Destino',
      'Pratico_Responsavel',
      'Duracao_Minutos',
      'Qtd_Rebocadores',
      'Causa_Cancelamento'
    ];

    const rows = maneuvers.map(m => [
      m.id,
      `"${m.vesselSnapshot.name}"`,
      m.vesselSnapshot.imo,
      m.vesselSnapshot.type,
      m.vesselSnapshot.flag,
      m.vesselSnapshot.loa,
      m.vesselSnapshot.beam,
      m.vesselSnapshot.draftFwd,
      m.vesselSnapshot.draftAft,
      `"${m.vesselSnapshot.agent}"`,
      m.maneuverType,
      m.status,
      m.scheduledTime,
      `"${m.berthTo}"`,
      `"${m.pilotName}"`,
      m.durationMinutes || '',
      m.tugs.length,
      m.incident ? `"${m.incident.causeTitle}"` : ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
      + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Pilot_Records_Manobras_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteManeuver = (id: string) => {
    setManeuvers(prev => prev.filter(m => m.id !== id));
  };

  // Alertas Portuários - Compartilhados com TODOS os utilizadores do app
  const addAlert = (alertData: Omit<MaritimeAlert, 'id' | 'issuedAt'>): string => {
    const id = `alt-${Date.now().toString().slice(-6)}`;
    const nowIso = new Date().toISOString();
    const newAlert: MaritimeAlert = {
      ...alertData,
      id,
      issuedAt: nowIso,
      updatedAt: nowIso
    };
    
    setAlerts(prev => {
      const updated = [newAlert, ...prev.filter(a => a.id !== id)];
      try {
        localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Server & Broadcast Synchronization
    broadcastSharedEvent('ALERT_UPSERT', newAlert);
    fetch('/api/shared/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alert: newAlert }),
      keepalive: true
    }).catch(() => {
      // Retry once after 1s
      setTimeout(() => {
        fetch('/api/shared/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ alert: newAlert })
        }).catch(() => {});
      }, 1000);
    });

    return id;
  };

  const updateAlert = (id: string, updates: Partial<MaritimeAlert>) => {
    let updatedItem: MaritimeAlert | null = null;
    const nowIso = new Date().toISOString();
    setAlerts(prev => {
      const next = prev.map(a => {
        if (a.id === id) {
          updatedItem = { ...a, ...updates, updatedAt: nowIso };
          return updatedItem;
        }
        return a;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(next));
      } catch {}
      return next;
    });

    if (updatedItem) {
      broadcastSharedEvent('ALERT_UPSERT', updatedItem);
      fetch('/api/shared/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alert: updatedItem }),
        keepalive: true
      }).catch(() => {});
    }
  };

  const toggleAlertActive = (id: string) => {
    let updatedItem: MaritimeAlert | null = null;
    const nowIso = new Date().toISOString();
    setAlerts(prev => {
      const next = prev.map(a => {
        if (a.id === id) {
          updatedItem = { ...a, isActive: !a.isActive, updatedAt: nowIso };
          return updatedItem;
        }
        return a;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(next));
      } catch {}
      return next;
    });

    if (updatedItem) {
      broadcastSharedEvent('ALERT_UPSERT', updatedItem);
      fetch('/api/shared/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alert: updatedItem }),
        keepalive: true
      }).catch(() => {});
    }
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => {
      const next = prev.filter(a => a.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(next));
      } catch {}
      return next;
    });

    broadcastSharedEvent('ALERT_DELETE', id);
    fetch(`/api/shared/alerts?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      keepalive: true
    }).catch(() => {});
  };

  // Import / Export Excel (.xlsx) & Backup JSON
  const exportManeuversToXlsx = () => {
    exportManeuversToExcel(maneuvers);
  };

  const exportFullBackup = () => {
    exportFullJsonBackup({
      maneuvers,
      vessels,
      pilots,
      alerts,
      shifts
    });
  };

  const importManeuversBatch = (imported: ManeuverRecord[]): number => {
    let addedCount = 0;
    setManeuvers(prev => {
      const existingIds = new Set(prev.map(m => m.id));
      const newItems: ManeuverRecord[] = [];
      imported.forEach(item => {
        let finalItem = item;
        if (existingIds.has(finalItem.id)) {
          finalItem = { ...finalItem, id: `${finalItem.id}_IMP` };
        }
        existingIds.add(finalItem.id);
        newItems.push(finalItem);
        addedCount++;
      });
      return [...newItems, ...prev];
    });
    return addedCount;
  };

  const restoreFullBackup = (data: any): boolean => {
    try {
      if (Array.isArray(data.maneuvers)) setManeuvers(data.maneuvers);
      if (Array.isArray(data.vessels)) setVessels(data.vessels);
      if (Array.isArray(data.pilots)) setPilots(data.pilots);
      if (Array.isArray(data.alerts)) setAlerts(data.alerts);
      if (Array.isArray(data.shifts)) setShifts(data.shifts);
      return true;
    } catch (e) {
      console.error('Erro ao restaurar backup:', e);
      return false;
    }
  };

  const exportIncidentsToCsv = () => {
    const cancelled = maneuvers.filter(m => m.incident);
    const headers = [
      'ID_Manobra',
      'Navio',
      'IMO',
      'Data_Ocorrencia',
      'Causa',
      'Descricao_Impacto',
      'Tempo_Perdido_Horas',
      'Custo_Adicional_EUR',
      'Canal_VHF',
      'Autoridade_Notificada'
    ];

    const rows = cancelled.map(m => [
      m.id,
      `"${m.vesselSnapshot.name}"`,
      m.vesselSnapshot.imo,
      m.incident?.loggedAt || m.scheduledTime,
      `"${m.incident?.causeTitle}"`,
      `"${m.incident?.description.replace(/"/g, '""')}"`,
      m.incident?.delayHours || 0,
      m.incident?.estimatedExtraCost || 0,
      `"${m.incident?.vhfChannelUsed}"`,
      m.incident?.reportedToAuthority ? 'SIM' : 'NÃO'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
      + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Pilot_Records_Ocorrencias_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MaritimeContext.Provider
      value={{
        currentView,
        setCurrentView,
        language,
        setLanguage,
        t,
        vessels,
        maneuvers,
        pilots,
        shifts,
        terminals,
        weather,
        alerts,
        isMobileHudOpen,
        setIsMobileHudOpen,
        selectedManeuverId,
        setSelectedManeuverId,
        activePilotId,
        setActivePilotId,
        currentUser,
        isProfileModalOpen,
        setIsProfileModalOpen,
        registerUser,
        updateUserProfile,
        logoutUser,
        syncStatusMessage,
        clearSyncStatusMessage,
        registeredPilotNames,
        checkPilotBackupExists,
        getPilotBackupSummary,
        exportPilotBackup,
        restorePilotBackup,
        switchPilotByName,
        addManeuver,
        updateManeuver,
        deleteManeuver,
        addAttachmentToManeuver,
        removeAttachmentFromManeuver,
        updateAttachmentInManeuver,
        updateMilestone,
        completeManeuver,
        cancelManeuverWithIncident,
        addVessel,
        updateVessel,
        addPilot,
        updatePilotStatus,
        updateWeather,
        addAlert,
        updateAlert,
        toggleAlertActive,
        deleteAlert,
        resetAllData,
        exportManeuversToCsv,
        exportIncidentsToCsv,
        exportManeuversToXlsx,
        exportFullBackup,
        importManeuversBatch,
        restoreFullBackup,
        isOnline,
        isRealtimeConnected,
        activeSyncDevices,
        lastSyncTime,
        refreshAlertsNow
      }}
    >
      {children}
    </MaritimeContext.Provider>
  );
};

export const useMaritime = () => {
  const context = useContext(MaritimeContext);
  if (!context) {
    throw new Error('useMaritime must be used within a MaritimeProvider');
  }
  return context;
};
