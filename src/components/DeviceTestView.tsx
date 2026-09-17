import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Compass, 
  Navigation, 
  Volume2, 
  Battery, 
  BatteryCharging, 
  Wifi, 
  WifiOff, 
  HardDrive, 
  Maximize, 
  Minimize, 
  QrCode, 
  Copy, 
  Check, 
  Share2, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Terminal, 
  Layers, 
  Zap, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Sliders,
  Fingerprint
} from 'lucide-react';
import QRCode from 'qrcode';
import { useMaritime } from '../context/MaritimeContext';
import { PWAInstallButton } from './PWAInstallButton';

interface GPSData {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  altitude: number | null;
  speedKnots: number | null;
  heading: number | null;
  timestamp: string | null;
  status: 'idle' | 'locating' | 'success' | 'error';
  errorMessage?: string;
}

interface StorageTestResult {
  status: 'idle' | 'testing' | 'success' | 'error';
  recordsCount?: number;
  writeTimeMs?: number;
  readTimeMs?: number;
  totalStorageUsed?: string;
}

export const DeviceTestView: React.FC = () => {
  const { setCurrentView } = useMaritime();

  // Platform & Environment state
  const [userAgent, setUserAgent] = useState('');
  const [platformInfo, setPlatformInfo] = useState({
    isCapacitor: false,
    isElectron: false,
    isPWA: false,
    isMobileBrowser: false,
    osName: 'Detectando...',
    touchPoints: 0,
    hasTouch: false
  });

  // Screen metrics
  const [screenMetrics, setScreenMetrics] = useState({
    viewportWidth: 0,
    viewportHeight: 0,
    screenWidth: 0,
    screenHeight: 0,
    pixelRatio: 1,
    orientation: 'portrait'
  });

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Network & Battery state
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean | null>(null);

  // GPS state
  const [gpsData, setGpsData] = useState<GPSData>({
    latitude: null,
    longitude: null,
    accuracy: null,
    altitude: null,
    speedKnots: null,
    heading: null,
    timestamp: null,
    status: 'idle'
  });

  // Haptic / Vibration status
  const [vibrationSupported, setVibrationSupported] = useState(false);
  const [lastVibrationType, setLastVibrationType] = useState<string | null>(null);

  // Audio testing
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null);

  // Storage test
  const [storageTest, setStorageTest] = useState<StorageTestResult>({ status: 'idle' });

  // Touch pad test
  const [touchHistory, setTouchHistory] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const touchCanvasRef = useRef<HTMLDivElement>(null);

  // QR Code state
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [appUrl, setAppUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Active guide tab
  const [activeGuideTab, setActiveGuideTab] = useState<'pwa' | 'android' | 'electron' | 'debug'>('pwa');

  // Detect environment & screen metrics
  useEffect(() => {
    setUserAgent(navigator.userAgent);
    const ua = navigator.userAgent.toLowerCase();
    
    // Check Capacitor native runtime
    const win = window as any;
    const isCap = !!(win.Capacitor && (win.Capacitor.isNativePlatform?.() || win.Capacitor.getPlatform?.() !== 'web'));
    const isElec = !!(win.process && win.process.type);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || !!win.navigator.standalone;
    const isMob = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);

    let os = 'Navegador Web';
    if (/android/i.test(ua)) os = 'Android';
    else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS / iPadOS';
    else if (/windows/i.test(ua)) os = 'Windows';
    else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
    else if (/linux/i.test(ua)) os = 'Linux';

    setPlatformInfo({
      isCapacitor: isCap,
      isElectron: isElec,
      isPWA: isStandalone,
      isMobileBrowser: isMob,
      osName: os,
      touchPoints: navigator.maxTouchPoints || 0,
      hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0
    });

    // Update screen metrics
    const updateMetrics = () => {
      setScreenMetrics({
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        pixelRatio: window.devicePixelRatio || 1,
        orientation: window.innerWidth > window.innerHeight ? 'Paisagem (Landscape)' : 'Retrato (Portrait)'
      });
      setIsFullscreen(!!document.fullscreenElement);
    };

    updateMetrics();
    window.addEventListener('resize', updateMetrics);
    window.addEventListener('orientationchange', updateMetrics);

    // Network listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Battery status
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);

        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging);
        });
      }).catch(() => {});
    }

    // Check Vibration
    setVibrationSupported('vibrate' in navigator);

    // App URL and QR Code
    const currentUrl = window.location.href;
    setAppUrl(currentUrl);

    QRCode.toDataURL(currentUrl, {
      width: 260,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.log('QR Code error', err));

    return () => {
      window.removeEventListener('resize', updateMetrics);
      window.removeEventListener('orientationchange', updateMetrics);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Toggle Fullscreen
  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (e) {
      console.log('Fullscreen error', e);
    }
  };

  // Test GPS / Geolocation
  const handleTestGPS = () => {
    if (!navigator.geolocation) {
      setGpsData({
        ...gpsData,
        status: 'error',
        errorMessage: 'Geolocalização não é suportada por este dispositivo/navegador.'
      });
      return;
    }

    setGpsData(prev => ({ ...prev, status: 'locating', errorMessage: undefined }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const speedKnots = position.coords.speed !== null 
          ? Number((position.coords.speed * 1.94384).toFixed(1)) 
          : null;

        setGpsData({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
          altitude: position.coords.altitude ? Math.round(position.coords.altitude) : null,
          speedKnots,
          heading: position.coords.heading !== null ? Math.round(position.coords.heading) : null,
          timestamp: new Date(position.timestamp).toLocaleTimeString(),
          status: 'success'
        });
      },
      (error) => {
        let msg = 'Falha ao obter sinal de satélite.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Permissão de GPS negada pelo utilizador ou política do dispositivo.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Sinal de GPS indisponível no momento.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Tempo limite esgotado ao buscar sinal de GPS.';
        }
        setGpsData(prev => ({ ...prev, status: 'error', errorMessage: msg }));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  // Distance to Porto da Beira Pilot Station (-19.8333, 34.8389)
  const calculateDistanceToBeiraPilotStation = (lat: number, lon: number): string => {
    const targetLat = -19.8333;
    const targetLon = 34.8389;
    const R = 3440.065; // Nautical miles radius of Earth
    const dLat = ((targetLat - lat) * Math.PI) / 180;
    const dLon = ((targetLon - lon) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((targetLat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distNM = R * c;
    return distNM.toFixed(2);
  };

  // Test Vibration / Haptics
  const triggerHaptic = (pattern: number | number[], label: string) => {
    setLastVibrationType(label);
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        console.log('Vibrate error', e);
      }
    }
  };

  // Web Audio Nautical Horn Synthesizer
  const playNauticalHorn = (pattern: Array<{ duration: number; pause?: number }>, label: string) => {
    setAudioPlaying(label);
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      let currentTime = ctx.currentTime + 0.05;

      pattern.forEach(({ duration, pause }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Deep marine ship horn frequencies: 180Hz fundamental with rich harmonics
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(185, currentTime);

        // Low pass filter for warm ship horn acoustic
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, currentTime);

        // Volume envelope
        gain.gain.setValueAtTime(0, currentTime);
        gain.gain.linearRampToValueAtTime(0.35, currentTime + 0.08);
        gain.gain.setValueAtTime(0.35, currentTime + duration - 0.08);
        gain.gain.linearRampToValueAtTime(0, currentTime + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(currentTime);
        osc.stop(currentTime + duration);

        currentTime += duration + (pause || 0.3);
      });

      const totalDuration = pattern.reduce((acc, p) => acc + p.duration + (p.pause || 0.3), 0);
      setTimeout(() => {
        setAudioPlaying(null);
        ctx.close().catch(() => {});
      }, (totalDuration + 0.2) * 1000);
    } catch (e) {
      console.log('Audio test error', e);
      setAudioPlaying(null);
    }
  };

  // Test Storage Speed & Persistence
  const runStorageStressTest = () => {
    setStorageTest({ status: 'testing' });
    setTimeout(() => {
      try {
        const testKey = 'pilots_records_device_test_temp';
        const sampleRecords = [];
        for (let i = 0; i < 50; i++) {
          sampleRecords.push({
            id: `TEST-${Date.now()}-${i}`,
            vessel: 'MSC BEIRA TESTER',
            imo: '9421234',
            maneuverType: 'atracacao',
            timestamp: new Date().toISOString(),
            status: 'concluida',
            draftFwd: 9.5,
            draftAft: 10.2,
            notes: 'Teste de integridade de armazenamento em dispositivo físico'
          });
        }

        const serialized = JSON.stringify(sampleRecords);

        // Measure write
        const writeStart = performance.now();
        localStorage.setItem(testKey, serialized);
        const writeEnd = performance.now();

        // Measure read
        const readStart = performance.now();
        const readData = localStorage.getItem(testKey);
        const readEnd = performance.now();

        // Cleanup
        localStorage.removeItem(testKey);

        if (!readData || readData.length !== serialized.length) {
          throw new Error('Falha de verificação de integridade');
        }

        // Calculate approximate storage used
        let totalUsed = 0;
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k) totalUsed += (localStorage.getItem(k)?.length || 0) * 2;
        }

        setStorageTest({
          status: 'success',
          recordsCount: 50,
          writeTimeMs: Number((writeEnd - writeStart).toFixed(2)),
          readTimeMs: Number((readEnd - readStart).toFixed(2)),
          totalStorageUsed: (totalUsed / 1024).toFixed(1) + ' KB'
        });
      } catch (err: any) {
        setStorageTest({
          status: 'error'
        });
      }
    }, 200);
  };

  // Copy App URL
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch (e) {
      console.log('Copy error', e);
    }
  };

  // Native Web Share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Pilot's Records - Gestão de Pilotagem",
          text: "Aceda ao sistema de gestão de manobras e relatórios de praticagem.",
          url: appUrl
        });
      } catch (e) {
        console.log('Share canceled or failed', e);
      }
    } else {
      handleCopyUrl();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Top Banner Header */}
      <div className="bg-white border-2 border-black rounded-xl p-5 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <div className="bg-blue-900 text-white p-2 rounded-lg border border-black shadow">
              <Smartphone className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-black">
                  Laboratório & Testes em Dispositivos
                </h1>
                <span className="bg-emerald-500 text-white text-[11px] font-black uppercase px-2 py-0.5 rounded-full border border-black">
                  Pronto para Teste
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Validação de hardware, GPS de bordo, ecrã táctil, persistência offline e guias de instalação para telemóveis, tablets e computadores.
              </p>
            </div>
          </div>
        </div>

        {/* Quick View Switcher & Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          <button
            onClick={handleToggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-black border border-slate-400 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            title="Alternar Ecrã Inteiro"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Sair do Ecrã Inteiro' : 'Modo Ecrã Inteiro'}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-900 hover:bg-blue-800 text-white border border-black rounded-lg text-xs font-bold shadow transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-cyan-300" />
            <span>Partilhar Link</span>
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns - Left: Diagnostics & Tests | Right: QR Code & Mobile Connection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1 & 2: Interactive Hardware Diagnostic Cards */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. Status do Ambiente & Sistema Operativo */}
          <div className="bg-white border-2 border-black rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-900" />
                <h2 className="text-base font-black text-black uppercase tracking-wide">
                  Ambiente & Plataforma Detetada
                </h2>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300">
                {platformInfo.osName}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="text-slate-500 font-semibold block text-[11px]">Runtime Nativo</span>
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1 mt-0.5">
                  {platformInfo.isCapacitor ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Capacitor Nativo
                    </span>
                  ) : platformInfo.isElectron ? (
                    <span className="text-blue-700 flex items-center gap-1">
                      <Monitor className="w-3.5 h-3.5" /> Electron Desktop
                    </span>
                  ) : platformInfo.isPWA ? (
                    <span className="text-purple-700 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> PWA Instalado
                    </span>
                  ) : (
                    <span className="text-slate-700 flex items-center gap-1">
                      <Tablet className="w-3.5 h-3.5" /> Navegador Web
                    </span>
                  )}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="text-slate-500 font-semibold block text-[11px]">Ligação à Rede</span>
                <span className="font-bold text-sm flex items-center gap-1 mt-0.5">
                  {isOnline ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <Wifi className="w-3.5 h-3.5" /> Online
                    </span>
                  ) : (
                    <span className="text-rose-700 flex items-center gap-1">
                      <WifiOff className="w-3.5 h-3.5" /> Offline
                    </span>
                  )}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="text-slate-500 font-semibold block text-[11px]">Suporte ao Toque</span>
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1 mt-0.5">
                  {platformInfo.hasTouch ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <Fingerprint className="w-3.5 h-3.5" /> Sim ({platformInfo.touchPoints} pts)
                    </span>
                  ) : (
                    <span className="text-slate-600">Rato / Teclado</span>
                  )}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="text-slate-500 font-semibold block text-[11px]">Bateria de Bordo</span>
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1 mt-0.5">
                  {batteryLevel !== null ? (
                    <span className="flex items-center gap-1 text-slate-800">
                      {isCharging ? <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" /> : <Battery className="w-3.5 h-3.5 text-blue-600" />}
                      {batteryLevel}% {isCharging && '(A carregar)'}
                    </span>
                  ) : (
                    <span className="text-slate-400">Não disponível</span>
                  )}
                </span>
              </div>
            </div>

            <div className="mt-3 bg-slate-100 p-2.5 rounded-lg border border-slate-300 flex items-center justify-between text-xs text-slate-600 font-mono overflow-hidden">
              <span className="truncate max-w-full">
                <strong>UA:</strong> {userAgent || 'Carregando...'}
              </span>
            </div>
          </div>

          {/* 2. Métricas de Ecrã & Responsividade */}
          <div className="bg-white border-2 border-black rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-blue-900" />
                <h2 className="text-base font-black text-black uppercase tracking-wide">
                  Resolução de Ecrã & Densidade (DPR)
                </h2>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                {screenMetrics.orientation}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <span className="text-blue-700 font-semibold block text-[11px]">Viewport CSS (Px)</span>
                <span className="font-black text-blue-950 text-base">
                  {screenMetrics.viewportWidth} × {screenMetrics.viewportHeight}
                </span>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <span className="text-blue-700 font-semibold block text-[11px]">Resolução Ecrã</span>
                <span className="font-black text-blue-950 text-base">
                  {screenMetrics.screenWidth} × {screenMetrics.screenHeight}
                </span>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <span className="text-blue-700 font-semibold block text-[11px]">Densidade (DPR)</span>
                <span className="font-black text-blue-950 text-base">
                  {screenMetrics.pixelRatio}x
                </span>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <span className="text-blue-700 font-semibold block text-[11px]">Ecrã Inteiro</span>
                <span className="font-black text-blue-950 text-base">
                  {isFullscreen ? 'Ativo' : 'Janela'}
                </span>
              </div>
            </div>

            {/* Touch Test Scratchpad */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Fingerprint className="w-4 h-4 text-blue-700" />
                  Área de Teste de Sensibilidade Táctil (Toque ou arraste o dedo abaixo):
                </span>
                {touchHistory.length > 0 && (
                  <button
                    onClick={() => setTouchHistory([])}
                    className="text-[11px] text-blue-700 hover:underline font-semibold"
                  >
                    Limpar Marcações
                  </button>
                )}
              </div>
              <div
                ref={touchCanvasRef}
                onTouchStart={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const touch = e.touches[0];
                  setTouchHistory(prev => [
                    ...prev.slice(-15),
                    { x: touch.clientX - rect.left, y: touch.clientY - rect.top, id: Date.now() }
                  ]);
                  triggerHaptic(30, 'Toque no ecrã');
                }}
                onTouchMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const touch = e.touches[0];
                  setTouchHistory(prev => [
                    ...prev.slice(-15),
                    { x: touch.clientX - rect.left, y: touch.clientY - rect.top, id: Date.now() }
                  ]);
                }}
                onMouseDown={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTouchHistory(prev => [
                    ...prev.slice(-15),
                    { x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() }
                  ]);
                }}
                className="relative h-24 sm:h-28 bg-slate-900 border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center cursor-crosshair overflow-hidden touch-none select-none"
              >
                {touchHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 font-mono text-center px-4">
                    [ Toque com o dedo neste retângulo para testar a resposta táctil e latência do dispositivo ]
                  </p>
                ) : (
                  touchHistory.map((t, idx) => (
                    <div
                      key={t.id}
                      className="absolute w-6 h-6 rounded-full bg-cyan-400/80 border-2 border-white -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-ping"
                      style={{ left: `${t.x}px`, top: `${t.y}px` }}
                    />
                  ))
                )}
                <div className="absolute bottom-1 right-2 text-[10px] text-slate-400 font-mono">
                  Pontos registados: {touchHistory.length}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Teste de Sensores: GPS Náutico & Barra */}
          <div className="bg-white border-2 border-black rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-900" />
                <h2 className="text-base font-black text-black uppercase tracking-wide">
                  Teste de Sensores: GPS de Bordo (Posicionamento Marítimo)
                </h2>
              </div>
              <button
                onClick={handleTestGPS}
                disabled={gpsData.status === 'locating'}
                className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-black flex items-center gap-1.5 transition-all shadow cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${gpsData.status === 'locating' ? 'animate-spin' : ''}`} />
                <span>{gpsData.status === 'locating' ? 'A sintonizar GPS...' : 'Testar Coordenadas GPS'}</span>
              </button>
            </div>

            {gpsData.status === 'idle' && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                <Compass className="w-8 h-8 text-blue-900 mx-auto mb-2 opacity-70" />
                <p className="text-xs text-slate-700 font-medium">
                  Clique no botão acima para validar a aquisição de sinal de GPS do telemóvel/tablet.
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Permite registar automaticamente a posição de início de manobra na Barra e atracação no cais.
                </p>
              </div>
            )}

            {gpsData.status === 'locating' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <RefreshCw className="w-6 h-6 text-blue-900 mx-auto mb-2 animate-spin" />
                <p className="text-xs font-bold text-blue-950">
                  A consultar satélites e sensores de posicionamento do dispositivo...
                </p>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  Por favor, autorize a permissão de localização quando solicitado pelo navegador.
                </p>
              </div>
            )}

            {gpsData.status === 'error' && (
              <div className="bg-rose-50 border border-rose-300 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-rose-900">Falha de Leitura de GPS</h4>
                  <p className="text-xs text-rose-700 mt-0.5">{gpsData.errorMessage}</p>
                </div>
              </div>
            )}

            {gpsData.status === 'success' && gpsData.latitude !== null && gpsData.longitude !== null && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-2.5">
                    <span className="text-emerald-800 font-semibold block text-[11px]">Latitude</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {gpsData.latitude.toFixed(6)}°
                    </span>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-2.5">
                    <span className="text-emerald-800 font-semibold block text-[11px]">Longitude</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {gpsData.longitude.toFixed(6)}°
                    </span>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-2.5">
                    <span className="text-emerald-800 font-semibold block text-[11px]">Precisão do Sinal</span>
                    <span className="font-bold text-slate-900 text-sm">
                      ±{gpsData.accuracy} metros
                    </span>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-2.5">
                    <span className="text-emerald-800 font-semibold block text-[11px]">Distância Estação Beira</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {calculateDistanceToBeiraPilotStation(gpsData.latitude, gpsData.longitude)} NM
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs bg-slate-100 p-2.5 rounded-lg border border-slate-300 flex-wrap gap-2">
                  <span className="text-slate-600 font-mono">
                    Última leitura: <strong>{gpsData.timestamp}</strong>
                  </span>
                  <a
                    href={`https://www.google.com/maps?q=${gpsData.latitude},${gpsData.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-blue-700 font-bold hover:underline"
                  >
                    <span>Abrir no Mapa Satélite</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* 4. Testes de Feedback Físico: Vibração, Sinais Sonoros e Persistência */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Haptic / Vibration */}
            <div className="bg-white border-2 border-black rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-black text-black uppercase">
                    Feedback Táctil (Vibração)
                  </h3>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${vibrationSupported ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                  {vibrationSupported ? 'Suportado' : 'Não detetado'}
                </span>
              </div>

              <p className="text-xs text-slate-600">
                Teste as respostas de vibração para confirmação de registo e alarmes na ponte de comando:
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => triggerHaptic(50, 'Toque Simples (50ms)')}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-400 rounded-lg font-bold text-left cursor-pointer transition-colors active:scale-95"
                >
                  <div className="font-bold text-black">Toque Curto</div>
                  <div className="text-[10px] text-slate-500">Confirmação de clique</div>
                </button>

                <button
                  onClick={() => triggerHaptic([80, 50, 80], 'Pulso Duplo (80-50-80ms)')}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-400 rounded-lg font-bold text-left cursor-pointer transition-colors active:scale-95"
                >
                  <div className="font-bold text-black">Pulso Duplo</div>
                  <div className="text-[10px] text-slate-500">Marco de manobra</div>
                </button>

                <button
                  onClick={() => triggerHaptic([150, 100, 150, 100, 300], 'Alerta Crítico')}
                  className="p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg font-bold text-left cursor-pointer transition-colors active:scale-95 col-span-2"
                >
                  <div className="font-bold text-amber-900">Alerta de Ocorrência SOLAS</div>
                  <div className="text-[10px] text-amber-700">Padrão de aviso sonoro-vibratório de emergência</div>
                </button>
              </div>

              {lastVibrationType && (
                <div className="text-[11px] font-mono text-emerald-700 bg-emerald-50 p-1.5 rounded border border-emerald-200 text-center">
                  Executado: {lastVibrationType}
                </div>
              )}
            </div>

            {/* Nautical Horn Sound Test */}
            <div className="bg-white border-2 border-black rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-blue-900" />
                  <h3 className="text-sm font-black text-black uppercase">
                    Áudio Náutico (Alto-Falantes)
                  </h3>
                </div>
                {audioPlaying && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 animate-pulse">
                    A emitir sinal...
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600">
                Sintetizador Web Audio de apito de manobra marítima (RIPEAM) para testar volume:
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => playNauticalHorn([{ duration: 0.8 }], '1 Apito Curto (Guinando para Boreste)')}
                  disabled={audioPlaying !== null}
                  className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-lg font-bold text-left cursor-pointer transition-colors active:scale-95 disabled:opacity-50"
                >
                  <div className="font-bold text-blue-950">1 Apito Curto</div>
                  <div className="text-[10px] text-blue-700">Guinar para Boreste</div>
                </button>

                <button
                  onClick={() => playNauticalHorn([{ duration: 0.8, pause: 0.2 }, { duration: 0.8 }], '2 Apitos Curtos (Guinando para Bombordo)')}
                  disabled={audioPlaying !== null}
                  className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-lg font-bold text-left cursor-pointer transition-colors active:scale-95 disabled:opacity-50"
                >
                  <div className="font-bold text-blue-950">2 Apitos Curtos</div>
                  <div className="text-[10px] text-blue-700">Guinar para Bombordo</div>
                </button>

                <button
                  onClick={() => playNauticalHorn([{ duration: 2.5 }], '1 Apito Longo (Canal Estreito / Nevoeiro)')}
                  disabled={audioPlaying !== null}
                  className="p-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-bold text-left cursor-pointer transition-colors active:scale-95 col-span-2 disabled:opacity-50"
                >
                  <div className="font-bold text-white">1 Apito Longo (Buzina de Nevoeiro)</div>
                  <div className="text-[10px] text-cyan-200">Sinal de aviso em canal estreito / curva cega</div>
                </button>
              </div>

              {audioPlaying && (
                <div className="text-[11px] font-mono text-blue-900 bg-blue-50 p-1.5 rounded border border-blue-200 text-center">
                  {audioPlaying}
                </div>
              )}
            </div>

          </div>

          {/* 5. Teste de Persistência Offline (LocalStorage Stress Test) */}
          <div className="bg-white border-2 border-black rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-black text-black uppercase">
                  Teste de Persistência Local (Modo Desconectado em Alto Mar)
                </h3>
              </div>
              <button
                onClick={runStorageStressTest}
                disabled={storageTest.status === 'testing'}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{storageTest.status === 'testing' ? 'A testar...' : 'Executar Teste de Escrita/Leitura'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Verifica a velocidade de gravação e consistência de dados para operações de praticagem sem acesso à internet.
            </p>

            {storageTest.status === 'success' && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Teste Concluído com 100% de Sucesso! Integridade Validada.</span>
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono">
                  <div className="bg-white p-2 rounded border border-emerald-200">
                    <span className="text-[10px] text-slate-500 block">Registos Gravados</span>
                    <span className="font-bold text-slate-900">{storageTest.recordsCount} itens</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-emerald-200">
                    <span className="text-[10px] text-slate-500 block">Velocidade Escrita</span>
                    <span className="font-bold text-slate-900">{storageTest.writeTimeMs} ms</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-emerald-200">
                    <span className="text-[10px] text-slate-500 block">Velocidade Leitura</span>
                    <span className="font-bold text-slate-900">{storageTest.readTimeMs} ms</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Column 3: QR Code & Mobile Fast Access */}
        <div className="space-y-6">

          {/* QR Code Card */}
          <div className="bg-white border-2 border-black rounded-xl p-5 shadow-sm text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <QrCode className="w-5 h-5 text-blue-900" />
              <h2 className="text-base font-black text-black uppercase tracking-wide">
                Acesso Móvel Imediato
              </h2>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Aponte a câmara do seu telemóvel ou tablet para abrir o software diretamente no dispositivo:
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border-2 border-black inline-block shadow-inner mb-4">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code de Acesso ao Software"
                  className="w-48 h-48 mx-auto rounded"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center bg-slate-200 text-slate-500 text-xs">
                  A gerar QR Code...
                </div>
              )}
            </div>

            <div className="space-y-2 text-left">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Endereço Direto (URL):
              </span>
              <div className="flex items-center gap-1.5 bg-slate-100 p-2 rounded-lg border border-slate-300">
                <input
                  type="text"
                  readOnly
                  value={appUrl}
                  className="text-xs font-mono bg-transparent w-full text-slate-800 outline-none truncate"
                />
                <button
                  onClick={handleCopyUrl}
                  className="shrink-0 p-1.5 bg-white hover:bg-slate-200 border border-slate-400 rounded text-slate-700 transition-colors"
                  title="Copiar URL"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              {copiedUrl && (
                <p className="text-[11px] font-bold text-emerald-700 text-center">
                  ✓ Link copiado para a área de transferência!
                </p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <button
                onClick={() => setCurrentView('mobile_quicklog')}
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-black text-xs rounded-lg border border-black shadow flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-cyan-300" />
                <span>Abrir HUD Prático a Bordo</span>
              </button>
            </div>
          </div>

          {/* PWA Manifest & High-Res Icons Specs */}
          <div className="bg-white border-2 border-black rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-900" />
                <h3 className="text-sm font-black text-black uppercase">
                  PWA Manifest & Ícones de Alta Resolução
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300">
                W3C Compliant
              </span>
            </div>

            {/* Visual Icon Grid Previews */}
            <div>
              <span className="text-[11px] font-bold text-slate-700 block mb-2">
                Ícones Gerados no Manifest:
              </span>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="flex flex-col items-center bg-slate-50 p-2 rounded border border-slate-200">
                  <img src="/icon-512.png" alt="512x512" className="w-12 h-12 rounded-xl shadow-xs object-cover" />
                  <span className="text-[10px] font-mono font-bold text-slate-800 mt-1">512×512</span>
                  <span className="text-[9px] text-slate-500">HD Standard</span>
                </div>
                <div className="flex flex-col items-center bg-slate-50 p-2 rounded border border-slate-200">
                  <img src="/icon-maskable-512.png" alt="Maskable" className="w-12 h-12 rounded-full shadow-xs object-cover ring-2 ring-blue-500/50" />
                  <span className="text-[10px] font-mono font-bold text-slate-800 mt-1">Maskable</span>
                  <span className="text-[9px] text-slate-500">Android Safe</span>
                </div>
                <div className="flex flex-col items-center bg-slate-50 p-2 rounded border border-slate-200">
                  <img src="/icon-192.png" alt="192x192" className="w-12 h-12 rounded-xl shadow-xs object-cover" />
                  <span className="text-[10px] font-mono font-bold text-slate-800 mt-1">192×192</span>
                  <span className="text-[9px] text-slate-500">Mobile Home</span>
                </div>
                <div className="flex flex-col items-center bg-slate-50 p-2 rounded border border-slate-200">
                  <img src="/apple-touch-icon.png" alt="Apple Touch" className="w-12 h-12 rounded-xl shadow-xs object-cover" />
                  <span className="text-[10px] font-mono font-bold text-slate-800 mt-1">180×180</span>
                  <span className="text-[9px] text-slate-500">iOS Safari</span>
                </div>
              </div>
            </div>

            {/* Colors & UI Settings */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                <div className="w-6 h-6 rounded-md bg-[#1e3a8a] border border-black shrink-0 shadow-xs" />
                <div className="truncate">
                  <span className="text-[10px] text-slate-500 block font-semibold">Theme Color</span>
                  <span className="font-mono font-bold text-slate-900 text-[11px]">#1e3a8a (Azul)</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                <div className="w-6 h-6 rounded-md bg-[#0f172a] border border-black shrink-0 shadow-xs" />
                <div className="truncate">
                  <span className="text-[10px] text-slate-500 block font-semibold">Background</span>
                  <span className="font-mono font-bold text-slate-900 text-[11px]">#0f172a (Slate)</span>
                </div>
              </div>
            </div>

            {/* Display Mode & Short Name */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Nome Resumido (App Launcher):</span>
                <span className="font-bold text-slate-900">PilotRecords (12 carac.)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Modo de Apresentação:</span>
                <span className="font-bold text-emerald-800">standalone (Ecrã Inteiro)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Atalhos no Ícone (Shortcuts):</span>
                <span className="font-bold text-blue-900">4 Ações Rápidas</span>
              </div>
            </div>

            <div className="pt-1">
              <PWAInstallButton variant="card" className="w-full justify-center py-2" />
            </div>
          </div>

          {/* Device Readiness Checklist */}
          <div className="bg-white border-2 border-black rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <h3 className="text-sm font-black text-black uppercase">
                Checklist de Prontidão do Dispositivo
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 bg-emerald-50 p-2 rounded border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-950">Web App Manifest & PWA:</strong>
                  <p className="text-slate-600 text-[11px]">Configurado com ícones HD 512x512, 192x192, maskables para Android e apple-touch-icon para iOS.</p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-emerald-50 p-2 rounded border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-950">Service Worker Offline (v2):</strong>
                  <p className="text-slate-600 text-[11px]">Precache completo de assets e ícones para navegação sem sinal de rede.</p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-emerald-50 p-2 rounded border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-950">Capacitor Android Sincronizado:</strong>
                  <p className="text-slate-600 text-[11px]">Build Gradle e plugins nativos configurados para compilação no Android Studio.</p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-emerald-50 p-2 rounded border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-950">Permissões de Hardware:</strong>
                  <p className="text-slate-600 text-[11px]">Localização precisa (GPS), vibração e estado de rede declarados.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Complete Step-by-Step Testing Guide Across Platforms */}
      <div className="bg-white border-2 border-black rounded-xl p-5 shadow-md">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-3">
          <Terminal className="w-5 h-5 text-blue-900" />
          <div>
            <h2 className="text-base font-black text-black uppercase tracking-wide">
              Guia Prático de Testes em Dispositivos (Passo a Passo)
            </h2>
            <p className="text-xs text-slate-600">
              Instruções detalhadas para testar em Smartphones (Android/iOS), Tablets e Computadores de secretária.
            </p>
          </div>
        </div>

        {/* Guide Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-4 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveGuideTab('pwa')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeGuideTab === 'pwa'
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1. Teste Móvel Imediato (PWA / Sem Instalação)</span>
          </button>

          <button
            onClick={() => setActiveGuideTab('android')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeGuideTab === 'android'
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>2. Android Nativo (APK / Android Studio)</span>
          </button>

          <button
            onClick={() => setActiveGuideTab('electron')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeGuideTab === 'electron'
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>3. Desktop Executável (Electron)</span>
          </button>

          <button
            onClick={() => setActiveGuideTab('debug')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeGuideTab === 'debug'
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>4. Depuração Remota (Chrome Inspect)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="text-xs text-slate-800 space-y-4">

          {activeGuideTab === 'pwa' && (
            <div className="space-y-3">
              <h4 className="font-black text-sm text-black">
                Como testar agora no telemóvel como aplicativo nativo (sem precisar de cabo ou compilar APK):
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-950">
                    <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-[10px]">A</span>
                    <span>No Android (Google Chrome):</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                    <li>Abra o link do aplicativo ou leia o QR Code acima.</li>
                    <li>Toque no menu de três pontos verticais (canto superior direito).</li>
                    <li>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar ao ecrã inicial"</strong>.</li>
                    <li>O ícone azul com âncora do <strong>Pilot's Records</strong> aparecerá na sua lista de apps.</li>
                    <li>Abra pelo ícone para rodar em tela cheia sem barra de navegador e com suporte offline.</li>
                  </ol>
                </div>

                <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-950">
                    <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-[10px]">B</span>
                    <span>No iPhone / iPad (Safari):</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                    <li>Abra o Safari e aceda ao endereço da aplicação.</li>
                    <li>Toque no botão central de <strong>Partilhar</strong> (ícone de quadrado com seta para cima).</li>
                    <li>Role para baixo e selecione <strong>"Ecrã principal"</strong> (Add to Home Screen).</li>
                    <li>Confirme o nome <strong>"Pilot's Records"</strong> e toque em Adicionar.</li>
                    <li>Pronto! O app abre isolado, em ecrã inteiro sem moldura do Safari.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {activeGuideTab === 'android' && (
            <div className="space-y-3">
              <h4 className="font-black text-sm text-black">
                Como gerar o APK nativo e instalar num telemóvel físico com Android Studio:
              </h4>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs space-y-2">
                <p className="text-slate-400"># 1. No computador, sincronize todos os arquivos atualizados:</p>
                <p className="text-emerald-400">npm run mobile:sync</p>
                
                <p className="text-slate-400 mt-2"># 2. Abra o projeto nativo no Android Studio:</p>
                <p className="text-emerald-400">npx cap open android</p>

                <p className="text-slate-400 mt-2"># 3. No telemóvel Android:</p>
                <p className="text-slate-300">
                  - Vá a Definições &gt; Sobre o Telefone &gt; Toque 7 vezes em "Número de Compilação" para ativar Opções do Desenvolvedor.<br />
                  - Em Opções do Desenvolvedor, ative <strong>"Depuração USB"</strong> (USB Debugging).<br />
                  - Conecte o cabo USB ao computador e autorize a chave RSA no ecrã do telemóvel.
                </p>

                <p className="text-slate-400 mt-2"># 4. No Android Studio, selecione o seu telemóvel no topo e clique no botão verde ▶ (Run 'app') ou gere o APK:</p>
                <p className="text-emerald-400">./gradlew assembleDebug</p>
                <p className="text-slate-400">O arquivo .apk estará gerado em: <strong>android/app/build/outputs/apk/debug/app-debug.apk</strong></p>
              </div>
            </div>
          )}

          {activeGuideTab === 'electron' && (
            <div className="space-y-3">
              <h4 className="font-black text-sm text-black">
                Como executar e compilar a versão desktop nativa (Windows, macOS, Linux):
              </h4>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs space-y-2">
                <p className="text-slate-400"># Iniciar modo de desenvolvimento Desktop com janela Electron:</p>
                <p className="text-emerald-400">npm run desktop:dev</p>

                <p className="text-slate-400 mt-2"># Compilar instalador executável para Windows (.exe / installer):</p>
                <p className="text-emerald-400">npm run desktop:build:win</p>

                <p className="text-slate-400 mt-2"># Compilar instalador para Mac (.dmg):</p>
                <p className="text-emerald-400">npm run desktop:build:mac</p>

                <p className="text-slate-400 mt-2"># Compilar para Linux (.AppImage / .deb):</p>
                <p className="text-emerald-400">npm run desktop:build:linux</p>
              </div>
            </div>
          )}

          {activeGuideTab === 'debug' && (
            <div className="space-y-3">
              <h4 className="font-black text-sm text-black">
                Como ver logs, console e inspecionar erros no telemóvel através do computador:
              </h4>
              <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 space-y-2">
                <ol className="list-decimal list-inside space-y-1.5 text-slate-700 pl-1">
                  <li>Conecte o seu smartphone Android ao computador com o cabo USB (com Depuração USB ativada).</li>
                  <li>No Google Chrome do computador, abra a aba especial: <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-blue-900 font-bold">chrome://inspect/#devices</code></li>
                  <li>O seu telemóvel aparecerá listado. Quando abrir o <strong>Pilot's Records</strong> no telemóvel, clique em <strong>"Inspect"</strong>.</li>
                  <li>Uma janela completa do DevTools abrirá no computador, espelhando a tela do telemóvel e permitindo testar toques, ver console de erros e medir tempo de resposta das manobras em tempo real!</li>
                </ol>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
