// Hydrographic Tide Calculation Engine for Port of Beira (Sinusoidal Harmonic Interpolation)
// Implements standard Admiralty / Rule of Twelfths continuous equivalent

import { BEIRA_TIDES_2026, DayTidePrediction, TideExtreme } from '../data/beiraTides2026';

export interface MinuteTideData {
  minuteOfDay: number; // 0 to 1439
  time: string; // "HH:mm"
  height: number; // meters (e.g. 5.14)
  trend: 'enchente' | 'vazante' | 'estofo_alta' | 'estofo_baixa';
  trendLabel: string;
  rateCmMin: number; // cm/min
  rateMetersHour: number; // m/hour
  previousExtreme: { time: string; height: number; type: 'HW' | 'LW' };
  nextExtreme: { time: string; height: number; type: 'HW' | 'LW' };
  isExtreme?: boolean;
  extremeType?: 'HW' | 'LW';
}

export interface DayTideSummary {
  day: number;
  month: number;
  year: number;
  dayOfWeek: string;
  maxHeight: number;
  minHeight: number;
  rangeMeters: number; // Amplitude de maré (Preamar - Baixa-mar)
  tideType: 'Vivas (Spring)' | 'Mortas (Neap)' | 'Médias (Intermediate)';
  extrema: TideExtreme[];
  minutePoints: MinuteTideData[];
}

// Convert "HH:mm" to minutes from 00:00 (0..1439)
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

// Convert minutes from 00:00 to "HH:mm"
export function minutesToTime(totalMinutes: number): string {
  const normalized = ((Math.floor(totalMinutes) % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// Port of Beira calibrated astronomical harmonic constituents
const C0_BEIRA = 3.4902;
const CONSTITUENTS_BEIRA = [
  { name: 'M2', A: -0.7453, B: 1.6245 },
  { name: 'S2', A: -1.0017, B: 0.4923 },
  { name: 'N2', A: -0.0467, B: 0.2145 },
  { name: 'K2', A: -0.2655, B: 0.1426 },
  { name: 'K1', A: -0.0035, B: -0.0052 },
  { name: 'O1', A: 0.0693, B: 0.0060 },
  { name: 'M4', A: -0.0458, B: -0.1010 }
];

function getAstroArgs(dateUtc: Date): number[] {
  const d = (dateUtc.getTime() - Date.UTC(2000, 0, 1, 12, 0, 0)) / 86400000;
  const T = d / 36525;
  const s = (218.3164477 + 481267.88128 * T) * (Math.PI / 180);
  const h = (280.46646 + 36000.76983 * T) * (Math.PI / 180);
  const p = (83.3532465 + 4069.0137287 * T) * (Math.PI / 180);
  const localHours = dateUtc.getUTCHours() + dateUtc.getUTCMinutes() / 60 + 2; // Beira CAT UTC+2
  const tau = (15 * localHours * (Math.PI / 180)) - s + h;
  return [
    2 * tau,
    2 * (15 * localHours * (Math.PI / 180)),
    2 * tau - s + p,
    2 * (15 * localHours * (Math.PI / 180)) + 2 * h,
    (15 * localHours * (Math.PI / 180)) + h + Math.PI / 2,
    (15 * localHours * (Math.PI / 180)) - 2 * s + h - Math.PI / 2,
    4 * tau
  ];
}

/**
 * Synthesizes a realistic hydrographic day prediction for any date outside the official table
 */
export function synthesizeDayPrediction(year: number, month: number, day: number): DayTidePrediction {
  const calcHeightAtMinute = (minuteOfDay: number) => {
    // UTC time for Beira (CAT UTC+2): minuteOfDay - 120
    const d = new Date(Date.UTC(year, month - 1, day, 0, minuteOfDay - 120, 0));
    const args = getAstroArgs(d);
    let h = C0_BEIRA;
    for (let i = 0; i < CONSTITUENTS_BEIRA.length; i++) {
      h += CONSTITUENTS_BEIRA[i].A * Math.cos(args[i]) + CONSTITUENTS_BEIRA[i].B * Math.sin(args[i]);
    }
    return h;
  };

  const extrema: TideExtreme[] = [];
  let prevSlope: number | null = null;

  for (let m = -30; m < 1440 + 30; m++) {
    const h1 = calcHeightAtMinute(m);
    const h2 = calcHeightAtMinute(m + 1);
    const slope = h2 - h1;

    if (prevSlope !== null) {
      if (prevSlope > 0 && slope <= 0 && m >= 0 && m < 1440) {
        extrema.push({
          time: minutesToTime(m),
          height: Math.round(h1 * 10) / 10,
          type: 'HW'
        });
      } else if (prevSlope < 0 && slope >= 0 && m >= 0 && m < 1440) {
        extrema.push({
          time: minutesToTime(m),
          height: Math.round(h1 * 10) / 10,
          type: 'LW'
        });
      }
    }
    prevSlope = slope;
  }

  const DOW = ['SU', 'M', 'TU', 'W', 'TH', 'F', 'SA'];
  const dayOfWeek = DOW[new Date(year, month - 1, day).getDay()] || '---';

  return {
    day,
    month,
    year,
    dayOfWeek,
    extrema
  };
}

// Find day prediction in table, or synthesize for any future or unrecorded date
export function getDayPrediction(year: number, month: number, day: number): DayTidePrediction {
  const official = BEIRA_TIDES_2026.find(d => d.year === year && d.month === month && d.day === day);
  if (official) return official;
  return synthesizeDayPrediction(year, month, day);
}

// Get flattened continuous timestamp points for continuous boundary interpolation
interface AbsoluteExtreme {
  absMinute: number; // relative to target day start (can be negative for previous day, > 1440 for next day)
  height: number;
  type: 'HW' | 'LW';
  timeLabel: string;
}

function getNearbyExtrema(year: number, month: number, day: number): AbsoluteExtreme[] {
  const result: AbsoluteExtreme[] = [];
  
  const currDt = new Date(year, month - 1, day);
  const prevDt = new Date(currDt.getTime() - 86400000);
  const nextDt = new Date(currDt.getTime() + 86400000);

  // Previous day
  const prevData = getDayPrediction(prevDt.getFullYear(), prevDt.getMonth() + 1, prevDt.getDate());
  if (prevData && prevData.extrema.length) {
    prevData.extrema.forEach(e => {
      result.push({
        absMinute: timeToMinutes(e.time) - 1440,
        height: e.height,
        type: e.type,
        timeLabel: `${e.time} (-1d)`
      });
    });
  }

  // Current day
  const currData = getDayPrediction(year, month, day);
  if (currData && currData.extrema.length) {
    currData.extrema.forEach(e => {
      result.push({
        absMinute: timeToMinutes(e.time),
        height: e.height,
        type: e.type,
        timeLabel: e.time
      });
    });
  }

  // Next day
  const nextData = getDayPrediction(nextDt.getFullYear(), nextDt.getMonth() + 1, nextDt.getDate());
  if (nextData && nextData.extrema.length) {
    nextData.extrema.forEach(e => {
      result.push({
        absMinute: timeToMinutes(e.time) + 1440,
        height: e.height,
        type: e.type,
        timeLabel: `${e.time} (+1d)`
      });
    });
  }

  // Fallback synthesis if boundary extremes missing (e.g. at edges of dataset)
  if (result.length > 0 && currData && currData.extrema.length) {
    const first = result[0];
    if (first.absMinute > 0) {
      const oppType = currData.extrema[0].type === 'HW' ? 'LW' : 'HW';
      const avgOppHeight = oppType === 'HW' ? 5.8 : 1.2;
      result.unshift({
        absMinute: timeToMinutes(currData.extrema[0].time) - 372,
        height: avgOppHeight,
        type: oppType,
        timeLabel: 'Extrapolado Ant.'
      });
    }

    const last = result[result.length - 1];
    if (last.absMinute < 1440) {
      const oppType = last.type === 'HW' ? 'LW' : 'HW';
      const avgOppHeight = oppType === 'HW' ? 5.8 : 1.2;
      result.push({
        absMinute: last.absMinute + 372,
        height: avgOppHeight,
        type: oppType,
        timeLabel: 'Extrapolado Seg.'
      });
    }
  }

  return result.sort((a, b) => a.absMinute - b.absMinute);
}

/**
 * Calculates continuous sinusoidal tide height for a single minute
 * Using Admiralty harmonic formula:
 * h(t) = (H1 + H2)/2 + (H1 - H2)/2 * cos(pi * (t - T1) / (T2 - T1))
 */
export function calculateMinuteTide(
  year: number,
  month: number,
  day: number,
  minuteOfDay: number
): MinuteTideData {
  const normMinute = ((minuteOfDay % 1440) + 1440) % 1440;
  const timeStr = minutesToTime(normMinute);
  const extrema = getNearbyExtrema(year, month, day);

  if (extrema.length < 2) {
    return {
      minuteOfDay: normMinute,
      time: timeStr,
      height: 3.5,
      trend: 'estofo_alta',
      trendLabel: 'Estofo',
      rateCmMin: 0,
      rateMetersHour: 0,
      previousExtreme: { time: '00:00', height: 3.5, type: 'HW' },
      nextExtreme: { time: '12:00', height: 3.5, type: 'LW' }
    };
  }

  // Find bounding extrema: e1.absMinute <= normMinute <= e2.absMinute
  let e1 = extrema[0];
  let e2 = extrema[1];

  for (let i = 0; i < extrema.length - 1; i++) {
    if (normMinute >= extrema[i].absMinute && normMinute <= extrema[i + 1].absMinute) {
      e1 = extrema[i];
      e2 = extrema[i + 1];
      break;
    }
  }

  // Handle case if before first extreme or after last
  if (normMinute < extrema[0].absMinute) {
    e1 = extrema[0];
    e2 = extrema[1];
  } else if (normMinute > extrema[extrema.length - 1].absMinute) {
    e1 = extrema[extrema.length - 2];
    e2 = extrema[extrema.length - 1];
  }

  const T1 = e1.absMinute;
  const T2 = e2.absMinute;
  const H1 = e1.height;
  const H2 = e2.height;

  const duration = Math.max(1, T2 - T1);
  const elapsed = normMinute - T1;
  const phase = (Math.PI * elapsed) / duration;

  // Harmonic sinusoidal interpolation (Admiralty continuous formula)
  const meanLevel = (H1 + H2) / 2;
  const amplitude = (H1 - H2) / 2;
  const height = meanLevel + amplitude * Math.cos(phase);

  // Derivative: dh/dt = -amplitude * (pi / duration) * sin(phase)
  // (Note: amplitude = (H1-H2)/2, so if H2 > H1 (rising), amplitude < 0, derivative > 0)
  const rateMetersPerMinute = -amplitude * (Math.PI / duration) * Math.sin(phase);
  const rateCmMin = rateMetersPerMinute * 100;
  const rateMetersHour = rateMetersPerMinute * 60;

  // Determine trend
  let trend: 'enchente' | 'vazante' | 'estofo_alta' | 'estofo_baixa';
  let trendLabel: string;

  if (Math.abs(rateCmMin) < 0.15) {
    // Slack water
    if (H1 > H2) {
      // was ebbing, reached low
      trend = elapsed > duration / 2 ? 'estofo_baixa' : 'estofo_alta';
      trendLabel = elapsed > duration / 2 ? 'Estofo Baixa-mar' : 'Estofo Preamar';
    } else {
      // was flooding, reached high
      trend = elapsed > duration / 2 ? 'estofo_alta' : 'estofo_baixa';
      trendLabel = elapsed > duration / 2 ? 'Estofo Preamar' : 'Estofo Baixa-mar';
    }
  } else if (rateCmMin > 0) {
    trend = 'enchente';
    trendLabel = 'Enchente (A Subir)';
  } else {
    trend = 'vazante';
    trendLabel = 'Vazante (A Descer)';
  }

  // Check if exactly an extreme minute
  const exactMatch = extrema.find(e => e.absMinute === normMinute);

  return {
    minuteOfDay: normMinute,
    time: timeStr,
    height: Math.round(height * 100) / 100,
    trend,
    trendLabel,
    rateCmMin: Math.round(rateCmMin * 10) / 10,
    rateMetersHour: Math.round(rateMetersHour * 100) / 100,
    previousExtreme: {
      time: e1.timeLabel,
      height: e1.height,
      type: e1.type
    },
    nextExtreme: {
      time: e2.timeLabel,
      height: e2.height,
      type: e2.type
    },
    isExtreme: !!exactMatch,
    extremeType: exactMatch?.type
  };
}

/**
 * Calculates all 1,440 minutes of a specific day
 */
export function calculateDayTideSummary(year: number, month: number, day: number): DayTideSummary {
  const dayPrediction = getDayPrediction(year, month, day);
  const extrema = dayPrediction?.extrema || [];

  const minutePoints: MinuteTideData[] = [];
  let maxHeight = 0;
  let minHeight = 999;

  for (let m = 0; m < 1440; m++) {
    const minData = calculateMinuteTide(year, month, day, m);
    minutePoints.push(minData);
    if (minData.height > maxHeight) maxHeight = minData.height;
    if (minData.height < minHeight) minHeight = minData.height;
  }

  const rangeMeters = Math.round((maxHeight - minHeight) * 100) / 100;

  // Classify tide range for Beira (Springs can exceed 6m range; Neaps ~2-3m)
  let tideType: 'Vivas (Spring)' | 'Mortas (Neap)' | 'Médias (Intermediate)';
  if (rangeMeters >= 4.5) {
    tideType = 'Vivas (Spring)';
  } else if (rangeMeters <= 2.8) {
    tideType = 'Mortas (Neap)';
  } else {
    tideType = 'Médias (Intermediate)';
  }

  return {
    day,
    month,
    year,
    dayOfWeek: dayPrediction?.dayOfWeek || '---',
    maxHeight,
    minHeight,
    rangeMeters,
    tideType,
    extrema,
    minutePoints
  };
}

/**
 * Calculates Under-Keel Clearance (Folga Sob a Quilha)
 */
export function calculateUKC(
  chartDepth: number,
  tideHeight: number,
  vesselDraft: number,
  squatMargin: number = 0.3
): {
  totalWaterDepth: number;
  grossUKC: number;
  netUKC: number;
  isSafe: boolean;
  statusMessage: string;
} {
  const totalWaterDepth = Math.round((chartDepth + tideHeight) * 100) / 100;
  const grossUKC = Math.round((totalWaterDepth - vesselDraft) * 100) / 100;
  const netUKC = Math.round((grossUKC - squatMargin) * 100) / 100;

  let isSafe = netUKC >= 1.0; // Standard 1.0m minimum safety UKC for Beira access channels
  let statusMessage = '';

  if (netUKC >= 1.5) {
    statusMessage = 'Navegação Segura (UKC Adequada)';
  } else if (netUKC >= 1.0) {
    statusMessage = 'Atenção: Margem Mínima Regulamentar';
  } else if (netUKC >= 0) {
    statusMessage = 'Crítico: Risco Elevado de Toque no Fundo';
    isSafe = false;
  } else {
    statusMessage = 'Impraticável: Calado Excede Altura de Água (Encalhe Certo)';
    isSafe = false;
  }

  return {
    totalWaterDepth,
    grossUKC,
    netUKC,
    isSafe,
    statusMessage
  };
}

/**
 * Exports minute-by-minute tidal height data to CSV
 */
export function exportMinuteTideToCSV(summary: DayTideSummary): string {
  const headers = [
    'Porto',
    'Data',
    'Hora (HH:mm)',
    'Minuto do Dia',
    'Altura Maré (m)',
    'Estado Maré',
    'Variação (cm/min)',
    'Taxa Horária (m/h)',
    'Extremo Anterior',
    'Próximo Extremo'
  ];

  const dateStr = `${summary.year}-${summary.month.toString().padStart(2, '0')}-${summary.day.toString().padStart(2, '0')}`;

  const rows = summary.minutePoints.map(m => [
    'Porto da Beira (ZH)',
    dateStr,
    m.time,
    m.minuteOfDay,
    m.height.toFixed(2),
    m.trendLabel,
    m.rateCmMin.toFixed(1),
    m.rateMetersHour.toFixed(2),
    `${m.previousExtreme.type} ${m.previousExtreme.height}m (${m.previousExtreme.time})`,
    `${m.nextExtreme.type} ${m.nextExtreme.height}m (${m.nextExtreme.time})`
  ]);

  return [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
}

export interface FutureDayTideOverview {
  date: Date;
  dateStr: string; // "YYYY-MM-DD"
  day: number;
  month: number;
  year: number;
  dayOfWeek: string;
  tideType: 'Vivas (Spring)' | 'Mortas (Neap)' | 'Médias (Intermediate)';
  rangeMeters: number;
  maxHeight: number;
  minHeight: number;
  extrema: TideExtreme[];
  isToday?: boolean;
}

export function getFutureDayOverview(year: number, month: number, day: number): FutureDayTideOverview {
  const prediction = getDayPrediction(year, month, day);
  const extrema = prediction.extrema || [];
  
  let maxHeight = 0;
  let minHeight = 99;
  extrema.forEach(e => {
    if (e.height > maxHeight) maxHeight = e.height;
    if (e.height < minHeight) minHeight = e.height;
  });
  if (minHeight === 99) minHeight = 1.0;
  if (maxHeight === 0) maxHeight = 6.0;

  const rangeMeters = Math.round((maxHeight - minHeight) * 100) / 100;
  let tideType: 'Vivas (Spring)' | 'Mortas (Neap)' | 'Médias (Intermediate)';
  if (rangeMeters >= 4.5) {
    tideType = 'Vivas (Spring)';
  } else if (rangeMeters <= 2.8) {
    tideType = 'Mortas (Neap)';
  } else {
    tideType = 'Médias (Intermediate)';
  }

  const dateObj = new Date(year, month - 1, day);
  const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

  const now = new Date();
  const isToday = now.getFullYear() === year && (now.getMonth() + 1) === month && now.getDate() === day;

  return {
    date: dateObj,
    dateStr,
    day,
    month,
    year,
    dayOfWeek: prediction.dayOfWeek,
    tideType,
    rangeMeters,
    maxHeight,
    minHeight,
    extrema,
    isToday
  };
}

export function getFutureTidesList(startDate: Date, daysCount: number = 30): FutureDayTideOverview[] {
  const results: FutureDayTideOverview[] = [];
  const cur = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

  for (let i = 0; i < daysCount; i++) {
    const d = new Date(cur.getTime() + i * 86400000);
    results.push(getFutureDayOverview(d.getFullYear(), d.getMonth() + 1, d.getDate()));
  }

  return results;
}

export function exportFutureTidesToCSV(days: FutureDayTideOverview[]): string {
  const headers = [
    'Data',
    'Dia da Semana',
    'Regime',
    'Amplitude (m)',
    'Preamar 1 (Hora / Altura)',
    'Baixa-mar 1 (Hora / Altura)',
    'Preamar 2 (Hora / Altura)',
    'Baixa-mar 2 (Hora / Altura)',
    'Todos os Extremos'
  ];

  const rows = days.map(d => {
    const hwList = d.extrema.filter(e => e.type === 'HW');
    const lwList = d.extrema.filter(e => e.type === 'LW');

    const hw1 = hwList[0] ? `${hwList[0].time} (${hwList[0].height}m)` : '---';
    const lw1 = lwList[0] ? `${lwList[0].time} (${lwList[0].height}m)` : '---';
    const hw2 = hwList[1] ? `${hwList[1].time} (${hwList[1].height}m)` : '---';
    const lw2 = lwList[1] ? `${lwList[1].time} (${lwList[1].height}m)` : '---';
    const allExt = d.extrema.map(e => `${e.type === 'HW' ? 'PM' : 'BM'} ${e.time} ${e.height}m`).join(' | ');

    return [
      d.dateStr,
      d.dayOfWeek,
      d.tideType,
      d.rangeMeters.toFixed(2),
      hw1,
      lw1,
      hw2,
      lw2,
      allExt
    ];
  });

  return [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
}
