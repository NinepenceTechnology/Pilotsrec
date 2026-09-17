// Official Tidal Predictions for Port of Beira, Mozambique (Year 2026)
// Reference: Mozambique Hydrographic Service / INAHINA
// Coordinates: LAT 19°49'S, LONG 34°50'E | TIME ZONE: UTC+2 (-0200 in chart notation)
// Chart Datum: Zero Hidrográfico (ZH)

export interface TideExtreme {
  time: string; // "HH:mm"
  height: number; // in meters (e.g. 6.3)
  type: 'HW' | 'LW'; // High Water (Preamar) | Low Water (Baixa-mar)
}

export interface DayTidePrediction {
  day: number;
  month: number; // 9 = Sep, 10 = Oct, 11 = Nov, 12 = Dec
  year: number; // 2026
  dayOfWeek: string;
  extrema: TideExtreme[];
}

export const BEIRA_PORT_METADATA = {
  portName: 'Porto da Beira',
  country: 'Moçambique',
  coordinates: "LAT 19°49'S | LONG 34°50'E",
  timeZone: 'UTC+2 (CAT - Central Africa Time)',
  datum: 'Zero Hidrográfico (ZH da Beira)',
  year: 2026,
  sourceDocument: 'Tabela Oficial de Marés - Porto da Beira 2026 (Setembro a Dezembro)'
};

// Raw tide tables transcribed directly from the official document
export const BEIRA_TIDES_2026: DayTidePrediction[] = [
  // ==========================================
  // SEPTEMBER 2026
  // ==========================================
  { day: 1, month: 9, year: 2026, dayOfWeek: 'TU', extrema: [
    { time: '00:45', height: 0.7, type: 'LW' },
    { time: '06:41', height: 6.3, type: 'HW' },
    { time: '13:02', height: 0.6, type: 'LW' },
    { time: '18:54', height: 6.4, type: 'HW' }
  ]},
  { day: 2, month: 9, year: 2026, dayOfWeek: 'W', extrema: [
    { time: '01:04', height: 0.9, type: 'LW' },
    { time: '07:09', height: 6.1, type: 'HW' },
    { time: '13:26', height: 0.9, type: 'LW' },
    { time: '19:26', height: 6.0, type: 'HW' }
  ]},
  { day: 3, month: 9, year: 2026, dayOfWeek: 'TH', extrema: [
    { time: '01:26', height: 1.2, type: 'LW' },
    { time: '07:40', height: 5.6, type: 'HW' },
    { time: '13:53', height: 1.3, type: 'LW' },
    { time: '20:04', height: 5.4, type: 'HW' }
  ]},
  { day: 4, month: 9, year: 2026, dayOfWeek: 'F', extrema: [
    { time: '01:53', height: 1.6, type: 'LW' },
    { time: '08:20', height: 5.0, type: 'HW' },
    { time: '14:28', height: 1.9, type: 'LW' },
    { time: '20:58', height: 4.7, type: 'HW' }
  ]},
  { day: 5, month: 9, year: 2026, dayOfWeek: 'SA', extrema: [
    { time: '02:27', height: 2.3, type: 'LW' },
    { time: '09:37', height: 4.4, type: 'HW' },
    { time: '15:36', height: 2.6, type: 'LW' },
    { time: '22:38', height: 4.1, type: 'HW' }
  ]},
  { day: 6, month: 9, year: 2026, dayOfWeek: 'SU', extrema: [
    { time: '03:35', height: 2.9, type: 'LW' },
    { time: '12:12', height: 4.2, type: 'HW' },
    { time: '19:16', height: 2.6, type: 'LW' }
  ]},
  { day: 7, month: 9, year: 2026, dayOfWeek: 'M', extrema: [
    { time: '00:56', height: 4.2, type: 'HW' },
    { time: '08:16', height: 2.5, type: 'LW' },
    { time: '14:04', height: 4.7, type: 'HW' },
    { time: '20:37', height: 2.0, type: 'LW' }
  ]},
  { day: 8, month: 9, year: 2026, dayOfWeek: 'TU', extrema: [
    { time: '02:25', height: 4.8, type: 'HW' },
    { time: '09:12', height: 1.9, type: 'LW' },
    { time: '15:02', height: 5.4, type: 'HW' },
    { time: '21:28', height: 1.5, type: 'LW' }
  ]},
  { day: 9, month: 9, year: 2026, dayOfWeek: 'W', extrema: [
    { time: '03:14', height: 5.4, type: 'HW' },
    { time: '09:55', height: 1.4, type: 'LW' },
    { time: '15:43', height: 5.9, type: 'HW' },
    { time: '22:11', height: 1.1, type: 'LW' }
  ]},
  { day: 10, month: 9, year: 2026, dayOfWeek: 'TH', extrema: [
    { time: '03:52', height: 5.9, type: 'HW' },
    { time: '10:34', height: 1.0, type: 'LW' },
    { time: '16:19', height: 6.3, type: 'HW' },
    { time: '22:50', height: 0.8, type: 'LW' }
  ]},
  { day: 11, month: 9, year: 2026, dayOfWeek: 'F', extrema: [
    { time: '04:26', height: 6.3, type: 'HW' },
    { time: '11:11', height: 0.7, type: 'LW' },
    { time: '16:53', height: 6.6, type: 'HW' },
    { time: '23:25', height: 0.6, type: 'LW' }
  ]},
  { day: 12, month: 9, year: 2026, dayOfWeek: 'SA', extrema: [
    { time: '04:59', height: 6.5, type: 'HW' },
    { time: '11:43', height: 0.6, type: 'LW' },
    { time: '17:24', height: 6.6, type: 'HW' },
    { time: '23:57', height: 0.6, type: 'LW' }
  ]},
  { day: 13, month: 9, year: 2026, dayOfWeek: 'SU', extrema: [
    { time: '05:30', height: 6.6, type: 'HW' },
    { time: '12:12', height: 0.6, type: 'LW' },
    { time: '17:54', height: 6.6, type: 'HW' }
  ]},
  { day: 14, month: 9, year: 2026, dayOfWeek: 'M', extrema: [
    { time: '00:25', height: 0.7, type: 'LW' },
    { time: '05:59', height: 6.5, type: 'HW' },
    { time: '12:35', height: 0.8, type: 'LW' },
    { time: '18:21', height: 6.4, type: 'HW' }
  ]},
  { day: 15, month: 9, year: 2026, dayOfWeek: 'TU', extrema: [
    { time: '00:50', height: 0.8, type: 'LW' },
    { time: '06:27', height: 6.3, type: 'HW' },
    { time: '12:54', height: 1.0, type: 'LW' },
    { time: '18:46', height: 6.0, type: 'HW' }
  ]},
  { day: 16, month: 9, year: 2026, dayOfWeek: 'W', extrema: [
    { time: '01:10', height: 1.1, type: 'LW' },
    { time: '06:52', height: 6.0, type: 'HW' },
    { time: '13:08', height: 1.3, type: 'LW' },
    { time: '19:09', height: 5.6, type: 'HW' }
  ]},
  { day: 17, month: 9, year: 2026, dayOfWeek: 'TH', extrema: [
    { time: '01:26', height: 1.5, type: 'LW' },
    { time: '07:18', height: 5.5, type: 'HW' },
    { time: '13:18', height: 1.7, type: 'LW' },
    { time: '19:29', height: 5.1, type: 'HW' }
  ]},
  { day: 18, month: 9, year: 2026, dayOfWeek: 'F', extrema: [
    { time: '01:40', height: 1.9, type: 'LW' },
    { time: '07:45', height: 5.0, type: 'HW' },
    { time: '13:32', height: 2.1, type: 'LW' },
    { time: '19:49', height: 4.6, type: 'HW' }
  ]},
  { day: 19, month: 9, year: 2026, dayOfWeek: 'SA', extrema: [
    { time: '01:57', height: 2.3, type: 'LW' },
    { time: '08:23', height: 4.4, type: 'HW' },
    { time: '13:52', height: 2.6, type: 'LW' },
    { time: '20:11', height: 3.9, type: 'HW' }
  ]},
  { day: 20, month: 9, year: 2026, dayOfWeek: 'SU', extrema: [
    { time: '02:24', height: 2.9, type: 'LW' },
    { time: '10:07', height: 3.9, type: 'HW' },
    { time: '14:28', height: 3.1, type: 'LW' }
  ]},
  { day: 21, month: 9, year: 2026, dayOfWeek: 'M', extrema: [
    { time: '00:16', height: 3.7, type: 'HW' },
    { time: '07:29', height: 3.0, type: 'LW' },
    { time: '12:50', height: 4.0, type: 'HW' },
    { time: '20:45', height: 2.7, type: 'LW' }
  ]},
  { day: 22, month: 9, year: 2026, dayOfWeek: 'TU', extrema: [
    { time: '02:05', height: 4.2, type: 'HW' },
    { time: '08:47', height: 2.4, type: 'LW' },
    { time: '14:12', height: 4.6, type: 'HW' },
    { time: '21:10', height: 2.2, type: 'LW' }
  ]},
  { day: 23, month: 9, year: 2026, dayOfWeek: 'W', extrema: [
    { time: '02:47', height: 4.8, type: 'HW' },
    { time: '09:04', height: 1.8, type: 'LW' },
    { time: '14:52', height: 5.2, type: 'HW' },
    { time: '21:37', height: 1.7, type: 'LW' }
  ]},
  { day: 24, month: 9, year: 2026, dayOfWeek: 'TH', extrema: [
    { time: '03:18', height: 5.4, type: 'HW' },
    { time: '09:38', height: 1.4, type: 'LW' },
    { time: '15:25', height: 5.8, type: 'HW' },
    { time: '22:06', height: 1.4, type: 'LW' }
  ]},
  { day: 25, month: 9, year: 2026, dayOfWeek: 'F', extrema: [
    { time: '03:49', height: 5.9, type: 'HW' },
    { time: '10:12', height: 1.0, type: 'LW' },
    { time: '15:57', height: 6.3, type: 'HW' },
    { time: '22:36', height: 1.1, type: 'LW' }
  ]},
  { day: 26, month: 9, year: 2026, dayOfWeek: 'SA', extrema: [
    { time: '04:19', height: 6.3, type: 'HW' },
    { time: '10:46', height: 0.8, type: 'LW' },
    { time: '16:28', height: 6.6, type: 'HW' },
    { time: '23:05', height: 0.9, type: 'LW' }
  ]},
  { day: 27, month: 9, year: 2026, dayOfWeek: 'SU', extrema: [
    { time: '04:49', height: 6.6, type: 'HW' },
    { time: '11:18', height: 0.6, type: 'LW' },
    { time: '16:59', height: 6.8, type: 'HW' },
    { time: '23:34', height: 0.8, type: 'LW' }
  ]},
  { day: 28, month: 9, year: 2026, dayOfWeek: 'M', extrema: [
    { time: '05:19', height: 6.7, type: 'HW' },
    { time: '11:49', height: 0.5, type: 'LW' },
    { time: '17:30', height: 6.9, type: 'HW' }
  ]},
  { day: 29, month: 9, year: 2026, dayOfWeek: 'TU', extrema: [
    { time: '00:00', height: 0.7, type: 'LW' },
    { time: '05:49', height: 6.7, type: 'HW' },
    { time: '12:17', height: 0.5, type: 'LW' },
    { time: '18:02', height: 6.8, type: 'HW' }
  ]},
  { day: 30, month: 9, year: 2026, dayOfWeek: 'W', extrema: [
    { time: '00:24', height: 0.8, type: 'LW' },
    { time: '06:19', height: 6.5, type: 'HW' },
    { time: '12:45', height: 0.7, type: 'LW' },
    { time: '18:33', height: 6.4, type: 'HW' }
  ]},

  // ==========================================
  // OCTOBER 2026
  // ==========================================
  { day: 1, month: 10, year: 2026, dayOfWeek: 'TH', extrema: [
    { time: '00:47', height: 1.0, type: 'LW' },
    { time: '06:49', height: 6.1, type: 'HW' },
    { time: '13:11', height: 1.0, type: 'LW' },
    { time: '19:06', height: 5.9, type: 'HW' }
  ]},
  { day: 2, month: 10, year: 2026, dayOfWeek: 'F', extrema: [
    { time: '01:10', height: 1.4, type: 'LW' },
    { time: '07:21', height: 5.6, type: 'HW' },
    { time: '13:40', height: 1.5, type: 'LW' },
    { time: '19:44', height: 5.3, type: 'HW' }
  ]},
  { day: 3, month: 10, year: 2026, dayOfWeek: 'SA', extrema: [
    { time: '01:34', height: 1.9, type: 'LW' },
    { time: '08:02', height: 4.9, type: 'HW' },
    { time: '14:15', height: 2.2, type: 'LW' },
    { time: '20:38', height: 4.6, type: 'HW' }
  ]},
  { day: 4, month: 10, year: 2026, dayOfWeek: 'SU', extrema: [
    { time: '02:06', height: 2.5, type: 'LW' },
    { time: '09:38', height: 4.3, type: 'HW' },
    { time: '15:39', height: 2.9, type: 'LW' },
    { time: '22:34', height: 4.1, type: 'HW' }
  ]},
  { day: 5, month: 10, year: 2026, dayOfWeek: 'M', extrema: [
    { time: '06:11', height: 3.1, type: 'LW' },
    { time: '12:15', height: 4.2, type: 'HW' },
    { time: '19:18', height: 2.7, type: 'LW' }
  ]},
  { day: 6, month: 10, year: 2026, dayOfWeek: 'TU', extrema: [
    { time: '00:49', height: 4.2, type: 'HW' },
    { time: '08:05', height: 2.8, type: 'LW' },
    { time: '13:55', height: 4.8, type: 'HW' },
    { time: '20:21', height: 2.1, type: 'LW' }
  ]},
  { day: 7, month: 10, year: 2026, dayOfWeek: 'W', extrema: [
    { time: '02:07', height: 4.9, type: 'HW' },
    { time: '08:51', height: 2.2, type: 'LW' },
    { time: '14:44', height: 5.5, type: 'HW' },
    { time: '21:03', height: 1.5, type: 'LW' }
  ]},
  { day: 8, month: 10, year: 2026, dayOfWeek: 'TH', extrema: [
    { time: '02:51', height: 5.5, type: 'HW' },
    { time: '09:28', height: 1.3, type: 'LW' },
    { time: '15:20', height: 6.0, type: 'HW' },
    { time: '21:41', height: 1.0, type: 'LW' }
  ]},
  { day: 9, month: 10, year: 2026, dayOfWeek: 'F', extrema: [
    { time: '03:26', height: 6.1, type: 'HW' },
    { time: '10:04', height: 1.0, type: 'LW' },
    { time: '15:53', height: 6.4, type: 'HW' },
    { time: '22:17', height: 0.9, type: 'LW' }
  ]},
  { day: 10, month: 10, year: 2026, dayOfWeek: 'SA', extrema: [
    { time: '03:59', height: 6.4, type: 'HW' },
    { time: '10:39', height: 0.8, type: 'LW' },
    { time: '16:25', height: 6.6, type: 'HW' },
    { time: '22:53', height: 0.8, type: 'LW' }
  ]},
  { day: 11, month: 10, year: 2026, dayOfWeek: 'SU', extrema: [
    { time: '04:31', height: 6.6, type: 'HW' },
    { time: '11:12', height: 0.7, type: 'LW' },
    { time: '16:55', height: 6.6, type: 'HW' },
    { time: '23:27', height: 0.7, type: 'LW' }
  ]},
  { day: 12, month: 10, year: 2026, dayOfWeek: 'M', extrema: [
    { time: '05:01', height: 6.6, type: 'HW' },
    { time: '11:43', height: 0.7, type: 'LW' },
    { time: '17:25', height: 6.5, type: 'HW' },
    { time: '23:58', height: 0.8, type: 'LW' }
  ]},
  { day: 13, month: 10, year: 2026, dayOfWeek: 'TU', extrema: [
    { time: '05:31', height: 6.5, type: 'HW' },
    { time: '12:09', height: 1.0, type: 'LW' },
    { time: '17:52', height: 6.3, type: 'HW' }
  ]},
  { day: 14, month: 10, year: 2026, dayOfWeek: 'W', extrema: [
    { time: '00:24', height: 1.0, type: 'LW' },
    { time: '05:59', height: 6.3, type: 'HW' },
    { time: '12:30', height: 1.2, type: 'LW' },
    { time: '18:18', height: 6.0, type: 'HW' }
  ]},
  { day: 15, month: 10, year: 2026, dayOfWeek: 'TH', extrema: [
    { time: '00:47', height: 1.2, type: 'LW' },
    { time: '06:25', height: 6.0, type: 'HW' },
    { time: '12:45', height: 1.5, type: 'LW' },
    { time: '18:41', height: 5.6, type: 'HW' }
  ]},
  { day: 16, month: 10, year: 2026, dayOfWeek: 'F', extrema: [
    { time: '01:04', height: 1.6, type: 'LW' },
    { time: '06:50', height: 5.5, type: 'HW' },
    { time: '12:55', height: 1.8, type: 'LW' },
    { time: '19:00', height: 5.1, type: 'HW' }
  ]},
  { day: 17, month: 10, year: 2026, dayOfWeek: 'SA', extrema: [
    { time: '01:18', height: 1.9, type: 'LW' },
    { time: '07:16', height: 5.1, type: 'HW' },
    { time: '13:08', height: 2.1, type: 'LW' },
    { time: '19:17', height: 4.6, type: 'HW' }
  ]},
  { day: 18, month: 10, year: 2026, dayOfWeek: 'SU', extrema: [
    { time: '01:33', height: 2.3, type: 'LW' },
    { time: '07:49', height: 4.6, type: 'HW' },
    { time: '13:29', height: 2.5, type: 'LW' },
    { time: '19:36', height: 4.1, type: 'HW' }
  ]},
  { day: 19, month: 10, year: 2026, dayOfWeek: 'M', extrema: [
    { time: '02:00', height: 2.8, type: 'LW' },
    { time: '09:10', height: 4.1, type: 'HW' },
    { time: '14:06', height: 3.0, type: 'LW' },
    { time: '23:03', height: 3.7, type: 'HW' }
  ]},
  { day: 20, month: 10, year: 2026, dayOfWeek: 'TU', extrema: [
    { time: '06:08', height: 3.1, type: 'LW' },
    { time: '11:45', height: 4.0, type: 'HW' },
    { time: '19:56', height: 3.0, type: 'LW' }
  ]},
  { day: 21, month: 10, year: 2026, dayOfWeek: 'W', extrema: [
    { time: '01:05', height: 4.1, type: 'HW' },
    { time: '07:36', height: 2.6, type: 'LW' },
    { time: '13:18', height: 4.5, type: 'HW' },
    { time: '20:22', height: 2.5, type: 'LW' }
  ]},
  { day: 22, month: 10, year: 2026, dayOfWeek: 'TH', extrema: [
    { time: '02:01', height: 4.7, type: 'HW' },
    { time: '08:19', height: 2.0, type: 'LW' },
    { time: '14:09', height: 5.1, type: 'HW' },
    { time: '20:50', height: 2.0, type: 'LW' }
  ]},
  { day: 23, month: 10, year: 2026, dayOfWeek: 'F', extrema: [
    { time: '02:39', height: 5.4, type: 'HW' },
    { time: '08:55', height: 1.5, type: 'LW' },
    { time: '14:48', height: 5.8, type: 'HW' },
    { time: '21:20', height: 1.5, type: 'LW' }
  ]},
  { day: 24, month: 10, year: 2026, dayOfWeek: 'SA', extrema: [
    { time: '03:14', height: 5.9, type: 'HW' },
    { time: '09:31', height: 1.1, type: 'LW' },
    { time: '15:24', height: 6.3, type: 'HW' },
    { time: '21:54', height: 1.2, type: 'LW' }
  ]},
  { day: 25, month: 10, year: 2026, dayOfWeek: 'SU', extrema: [
    { time: '03:48', height: 6.3, type: 'HW' },
    { time: '10:09', height: 0.8, type: 'LW' },
    { time: '15:59', height: 6.6, type: 'HW' },
    { time: '22:30', height: 1.0, type: 'LW' }
  ]},
  { day: 26, month: 10, year: 2026, dayOfWeek: 'M', extrema: [
    { time: '04:22', height: 6.6, type: 'HW' },
    { time: '10:48', height: 0.7, type: 'LW' },
    { time: '16:35', height: 6.8, type: 'HW' },
    { time: '23:06', height: 0.9, type: 'LW' }
  ]},
  { day: 27, month: 10, year: 2026, dayOfWeek: 'TU', extrema: [
    { time: '04:56', height: 6.7, type: 'HW' },
    { time: '11:26', height: 0.6, type: 'LW' },
    { time: '17:10', height: 6.8, type: 'HW' },
    { time: '23:41', height: 0.9, type: 'LW' }
  ]},
  { day: 28, month: 10, year: 2026, dayOfWeek: 'W', extrema: [
    { time: '05:30', height: 6.6, type: 'HW' },
    { time: '12:03', height: 0.6, type: 'LW' },
    { time: '17:45', height: 6.6, type: 'HW' }
  ]},
  { day: 29, month: 10, year: 2026, dayOfWeek: 'TH', extrema: [
    { time: '00:13', height: 1.0, type: 'LW' },
    { time: '06:03', height: 6.4, type: 'HW' },
    { time: '12:37', height: 0.8, type: 'LW' },
    { time: '18:21', height: 6.3, type: 'HW' }
  ]},
  { day: 30, month: 10, year: 2026, dayOfWeek: 'F', extrema: [
    { time: '00:43', height: 1.3, type: 'LW' },
    { time: '06:40', height: 6.0, type: 'HW' },
    { time: '13:11', height: 1.2, type: 'LW' },
    { time: '18:57', height: 5.8, type: 'HW' }
  ]},
  { day: 31, month: 10, year: 2026, dayOfWeek: 'SA', extrema: [
    { time: '01:11', height: 1.6, type: 'LW' },
    { time: '07:19', height: 5.5, type: 'HW' },
    { time: '13:45', height: 1.7, type: 'LW' },
    { time: '19:40', height: 5.2, type: 'HW' }
  ]},

  // ==========================================
  // NOVEMBER 2026
  // ==========================================
  { day: 1, month: 11, year: 2026, dayOfWeek: 'SU', extrema: [
    { time: '01:40', height: 2.1, type: 'LW' },
    { time: '08:12', height: 4.9, type: 'HW' },
    { time: '14:28', height: 2.3, type: 'LW' },
    { time: '20:41', height: 4.6, type: 'HW' }
  ]},
  { day: 2, month: 11, year: 2026, dayOfWeek: 'M', extrema: [
    { time: '02:20', height: 2.6, type: 'LW' },
    { time: '09:44', height: 4.4, type: 'HW' },
    { time: '16:01', height: 2.8, type: 'LW' },
    { time: '22:21', height: 4.3, type: 'HW' }
  ]},
  { day: 3, month: 11, year: 2026, dayOfWeek: 'TU', extrema: [
    { time: '05:25', height: 3.0, type: 'LW' },
    { time: '11:47', height: 4.4, type: 'HW' },
    { time: '18:35', height: 2.7, type: 'LW' }
  ]},
  { day: 4, month: 11, year: 2026, dayOfWeek: 'W', extrema: [
    { time: '00:07', height: 4.4, type: 'HW' },
    { time: '07:29', height: 2.5, type: 'LW' },
    { time: '13:16', height: 4.8, type: 'HW' },
    { time: '19:44', height: 2.2, type: 'LW' }
  ]},
  { day: 5, month: 11, year: 2026, dayOfWeek: 'TH', extrema: [
    { time: '01:25', height: 4.9, type: 'HW' },
    { time: '08:17', height: 1.9, type: 'LW' },
    { time: '14:11', height: 5.3, type: 'HW' },
    { time: '20:28', height: 1.8, type: 'LW' }
  ]},
  { day: 6, month: 11, year: 2026, dayOfWeek: 'F', extrema: [
    { time: '02:15', height: 5.4, type: 'HW' },
    { time: '08:55', height: 1.5, type: 'LW' },
    { time: '14:50', height: 5.8, type: 'HW' },
    { time: '21:06', height: 1.4, type: 'LW' }
  ]},
  { day: 7, month: 11, year: 2026, dayOfWeek: 'SA', extrema: [
    { time: '02:55', height: 5.9, type: 'HW' },
    { time: '09:31', height: 1.2, type: 'LW' },
    { time: '15:25', height: 6.1, type: 'HW' },
    { time: '21:44', height: 1.1, type: 'LW' }
  ]},
  { day: 8, month: 11, year: 2026, dayOfWeek: 'SU', extrema: [
    { time: '03:30', height: 6.2, type: 'HW' },
    { time: '10:08', height: 1.0, type: 'LW' },
    { time: '15:58', height: 6.3, type: 'HW' },
    { time: '22:23', height: 1.0, type: 'LW' }
  ]},
  { day: 9, month: 11, year: 2026, dayOfWeek: 'M', extrema: [
    { time: '04:04', height: 6.4, type: 'HW' },
    { time: '10:45', height: 1.0, type: 'LW' },
    { time: '16:31', height: 6.4, type: 'HW' },
    { time: '23:01', height: 1.0, type: 'LW' }
  ]},
  { day: 10, month: 11, year: 2026, dayOfWeek: 'TU', extrema: [
    { time: '04:38', height: 6.4, type: 'HW' },
    { time: '11:21', height: 1.1, type: 'LW' },
    { time: '17:03', height: 6.3, type: 'HW' },
    { time: '23:38', height: 1.0, type: 'LW' }
  ]},
  { day: 11, month: 11, year: 2026, dayOfWeek: 'W', extrema: [
    { time: '05:10', height: 6.3, type: 'HW' },
    { time: '11:53', height: 1.2, type: 'LW' },
    { time: '17:34', height: 6.1, type: 'HW' }
  ]},
  { day: 12, month: 11, year: 2026, dayOfWeek: 'TH', extrema: [
    { time: '00:10', height: 1.2, type: 'LW' },
    { time: '05:41', height: 6.1, type: 'HW' },
    { time: '12:20', height: 1.4, type: 'LW' },
    { time: '18:03', height: 5.8, type: 'HW' }
  ]},
  { day: 13, month: 11, year: 2026, dayOfWeek: 'F', extrema: [
    { time: '00:37', height: 1.4, type: 'LW' },
    { time: '06:10', height: 5.8, type: 'HW' },
    { time: '12:40', height: 1.6, type: 'LW' },
    { time: '18:29', height: 5.5, type: 'HW' }
  ]},
  { day: 14, month: 11, year: 2026, dayOfWeek: 'SA', extrema: [
    { time: '00:59', height: 1.6, type: 'LW' },
    { time: '06:38', height: 5.5, type: 'HW' },
    { time: '12:53', height: 1.8, type: 'LW' },
    { time: '18:52', height: 5.2, type: 'HW' }
  ]},
  { day: 15, month: 11, year: 2026, dayOfWeek: 'SU', extrema: [
    { time: '01:16', height: 1.9, type: 'LW' },
    { time: '07:07', height: 5.2, type: 'HW' },
    { time: '13:06', height: 2.1, type: 'LW' },
    { time: '19:16', height: 4.8, type: 'HW' }
  ]},
  { day: 16, month: 11, year: 2026, dayOfWeek: 'M', extrema: [
    { time: '01:34', height: 2.2, type: 'LW' },
    { time: '07:43', height: 4.8, type: 'HW' },
    { time: '13:29', height: 2.3, type: 'LW' },
    { time: '19:51', height: 4.5, type: 'HW' }
  ]},
  { day: 17, month: 11, year: 2026, dayOfWeek: 'TU', extrema: [
    { time: '02:04', height: 2.5, type: 'LW' },
    { time: '08:42', height: 4.5, type: 'HW' },
    { time: '14:07', height: 2.7, type: 'LW' },
    { time: '21:26', height: 4.1, type: 'HW' }
  ]},
  { day: 18, month: 11, year: 2026, dayOfWeek: 'W', extrema: [
    { time: '03:08', height: 2.8, type: 'LW' },
    { time: '10:22', height: 4.3, type: 'HW' },
    { time: '15:25', height: 3.0, type: 'LW' },
    { time: '23:26', height: 4.2, type: 'HW' }
  ]},
  { day: 19, month: 11, year: 2026, dayOfWeek: 'TH', extrema: [
    { time: '06:02', height: 2.7, type: 'LW' },
    { time: '11:59', height: 4.5, type: 'HW' },
    { time: '18:54', height: 2.6, type: 'LW' }
  ]},
  { day: 20, month: 11, year: 2026, dayOfWeek: 'F', extrema: [
    { time: '00:53', height: 4.6, type: 'HW' },
    { time: '07:17', height: 2.3, type: 'LW' },
    { time: '13:11', height: 4.9, type: 'HW' },
    { time: '19:49', height: 2.3, type: 'LW' }
  ]},
  { day: 21, month: 11, year: 2026, dayOfWeek: 'SA', extrema: [
    { time: '01:51', height: 5.1, type: 'HW' },
    { time: '08:06', height: 1.8, type: 'LW' },
    { time: '14:06', height: 5.5, type: 'HW' },
    { time: '20:32', height: 1.8, type: 'LW' }
  ]},
  { day: 22, month: 11, year: 2026, dayOfWeek: 'SU', extrema: [
    { time: '02:37', height: 5.6, type: 'HW' },
    { time: '08:52', height: 1.4, type: 'LW' },
    { time: '14:52', height: 5.9, type: 'HW' },
    { time: '21:16', height: 1.5, type: 'LW' }
  ]},
  { day: 23, month: 11, year: 2026, dayOfWeek: 'M', extrema: [
    { time: '03:19', height: 6.0, type: 'HW' },
    { time: '09:38', height: 1.1, type: 'LW' },
    { time: '15:35', height: 6.3, type: 'HW' },
    { time: '22:03', height: 1.3, type: 'LW' }
  ]},
  { day: 24, month: 11, year: 2026, dayOfWeek: 'TU', extrema: [
    { time: '04:00', height: 6.3, type: 'HW' },
    { time: '10:27', height: 0.9, type: 'LW' },
    { time: '16:16', height: 6.5, type: 'HW' },
    { time: '22:50', height: 1.2, type: 'LW' }
  ]},
  { day: 25, month: 11, year: 2026, dayOfWeek: 'W', extrema: [
    { time: '04:40', height: 6.4, type: 'HW' },
    { time: '11:15', height: 0.8, type: 'LW' },
    { time: '16:57', height: 6.5, type: 'HW' },
    { time: '23:35', height: 1.1, type: 'LW' }
  ]},
  { day: 26, month: 11, year: 2026, dayOfWeek: 'TH', extrema: [
    { time: '05:20', height: 6.4, type: 'HW' },
    { time: '11:59', height: 0.8, type: 'LW' },
    { time: '17:37', height: 6.4, type: 'HW' }
  ]},
  { day: 27, month: 11, year: 2026, dayOfWeek: 'F', extrema: [
    { time: '00:16', height: 1.2, type: 'LW' },
    { time: '06:01', height: 6.3, type: 'HW' },
    { time: '12:40', height: 0.9, type: 'LW' },
    { time: '18:17', height: 6.1, type: 'HW' }
  ]},
  { day: 28, month: 11, year: 2026, dayOfWeek: 'SA', extrema: [
    { time: '00:53', height: 1.3, type: 'LW' },
    { time: '06:43', height: 6.0, type: 'HW' },
    { time: '13:17', height: 1.2, type: 'LW' },
    { time: '18:58', height: 5.8, type: 'HW' }
  ]},
  { day: 29, month: 11, year: 2026, dayOfWeek: 'SU', extrema: [
    { time: '01:26', height: 1.5, type: 'LW' },
    { time: '07:27', height: 5.6, type: 'HW' },
    { time: '13:54', height: 1.6, type: 'LW' },
    { time: '19:42', height: 5.4, type: 'HW' }
  ]},
  { day: 30, month: 11, year: 2026, dayOfWeek: 'M', extrema: [
    { time: '01:59', height: 1.9, type: 'LW' },
    { time: '08:20', height: 5.2, type: 'HW' },
    { time: '14:34', height: 2.1, type: 'LW' },
    { time: '20:35', height: 5.0, type: 'HW' }
  ]},

  // ==========================================
  // DECEMBER 2026
  // ==========================================
  { day: 1, month: 12, year: 2026, dayOfWeek: 'TU', extrema: [
    { time: '02:39', height: 2.3, type: 'LW' },
    { time: '09:29', height: 4.8, type: 'HW' },
    { time: '15:31', height: 2.5, type: 'LW' },
    { time: '21:44', height: 4.7, type: 'HW' }
  ]},
  { day: 2, month: 12, year: 2026, dayOfWeek: 'W', extrema: [
    { time: '03:54', height: 2.6, type: 'LW' },
    { time: '10:51', height: 4.6, type: 'HW' },
    { time: '17:11', height: 2.7, type: 'LW' },
    { time: '23:05', height: 4.6, type: 'HW' }
  ]},
  { day: 3, month: 12, year: 2026, dayOfWeek: 'TH', extrema: [
    { time: '06:13', height: 2.6, type: 'LW' },
    { time: '12:14', height: 4.6, type: 'HW' },
    { time: '18:45', height: 2.5, type: 'LW' }
  ]},
  { day: 4, month: 12, year: 2026, dayOfWeek: 'F', extrema: [
    { time: '00:24', height: 4.8, type: 'HW' },
    { time: '07:30', height: 2.3, type: 'LW' },
    { time: '13:23', height: 4.9, type: 'HW' },
    { time: '19:45', height: 2.1, type: 'LW' }
  ]},
  { day: 5, month: 12, year: 2026, dayOfWeek: 'SA', extrema: [
    { time: '01:30', height: 5.1, type: 'HW' },
    { time: '08:19', height: 1.9, type: 'LW' },
    { time: '14:15', height: 5.3, type: 'HW' },
    { time: '20:32', height: 1.8, type: 'LW' }
  ]},
  { day: 6, month: 12, year: 2026, dayOfWeek: 'SU', extrema: [
    { time: '02:22', height: 5.5, type: 'HW' },
    { time: '09:03', height: 1.6, type: 'LW' },
    { time: '14:58', height: 5.7, type: 'HW' },
    { time: '21:17', height: 1.5, type: 'LW' }
  ]},
  { day: 7, month: 12, year: 2026, dayOfWeek: 'M', extrema: [
    { time: '03:05', height: 5.8, type: 'HW' },
    { time: '09:40', height: 1.4, type: 'LW' },
    { time: '15:37', height: 5.9, type: 'HW' },
    { time: '22:02', height: 1.3, type: 'LW' }
  ]},
  { day: 8, month: 12, year: 2026, dayOfWeek: 'TU', extrema: [
    { time: '03:45', height: 6.0, type: 'HW' },
    { time: '10:20', height: 1.3, type: 'LW' },
    { time: '16:14', height: 6.0, type: 'HW' },
    { time: '22:46', height: 1.2, type: 'LW' }
  ]},
  { day: 9, month: 12, year: 2026, dayOfWeek: 'W', extrema: [
    { time: '04:22', height: 6.1, type: 'HW' },
    { time: '11:12', height: 1.3, type: 'LW' },
    { time: '16:50', height: 6.0, type: 'HW' },
    { time: '23:28', height: 1.2, type: 'LW' }
  ]},
  { day: 10, month: 12, year: 2026, dayOfWeek: 'TH', extrema: [
    { time: '04:58', height: 6.1, type: 'HW' },
    { time: '11:49', height: 1.3, type: 'LW' },
    { time: '17:24', height: 5.9, type: 'HW' }
  ]},
  { day: 11, month: 12, year: 2026, dayOfWeek: 'F', extrema: [
    { time: '00:04', height: 1.2, type: 'LW' },
    { time: '05:32', height: 6.0, type: 'HW' },
    { time: '12:20', height: 1.4, type: 'LW' },
    { time: '17:57', height: 5.8, type: 'HW' }
  ]},
  { day: 12, month: 12, year: 2026, dayOfWeek: 'SA', extrema: [
    { time: '00:34', height: 1.3, type: 'LW' },
    { time: '06:01', height: 5.9, type: 'HW' },
    { time: '12:44', height: 1.5, type: 'LW' },
    { time: '18:26', height: 5.6, type: 'HW' }
  ]},
  { day: 13, month: 12, year: 2026, dayOfWeek: 'SU', extrema: [
    { time: '00:59', height: 1.5, type: 'LW' },
    { time: '06:33', height: 5.7, type: 'HW' },
    { time: '13:01', height: 1.7, type: 'LW' },
    { time: '18:52', height: 5.5, type: 'HW' }
  ]},
  { day: 14, month: 12, year: 2026, dayOfWeek: 'M', extrema: [
    { time: '01:18', height: 1.6, type: 'LW' },
    { time: '07:02', height: 5.6, type: 'HW' },
    { time: '13:13', height: 1.8, type: 'LW' },
    { time: '19:17', height: 5.3, type: 'HW' }
  ]},
  { day: 15, month: 12, year: 2026, dayOfWeek: 'TU', extrema: [
    { time: '01:36', height: 1.8, type: 'LW' },
    { time: '07:35', height: 5.4, type: 'HW' },
    { time: '13:31', height: 1.9, type: 'LW' },
    { time: '19:49', height: 5.1, type: 'HW' }
  ]},
  { day: 16, month: 12, year: 2026, dayOfWeek: 'W', extrema: [
    { time: '01:59', height: 1.9, type: 'LW' },
    { time: '08:16', height: 5.1, type: 'HW' },
    { time: '14:00', height: 2.1, type: 'LW' },
    { time: '20:35', height: 4.8, type: 'HW' }
  ]},
  { day: 17, month: 12, year: 2026, dayOfWeek: 'TH', extrema: [
    { time: '02:38', height: 2.2, type: 'LW' },
    { time: '09:15', height: 4.9, type: 'HW' },
    { time: '14:45', height: 2.4, type: 'LW' },
    { time: '21:51', height: 4.6, type: 'HW' }
  ]},
  { day: 18, month: 12, year: 2026, dayOfWeek: 'F', extrema: [
    { time: '03:46', height: 2.4, type: 'LW' },
    { time: '10:34', height: 4.7, type: 'HW' },
    { time: '16:03', height: 2.6, type: 'LW' },
    { time: '23:26', height: 4.6, type: 'HW' }
  ]},
  { day: 19, month: 12, year: 2026, dayOfWeek: 'SA', extrema: [
    { time: '05:46', height: 2.5, type: 'LW' },
    { time: '12:02', height: 4.8, type: 'HW' },
    { time: '18:22', height: 2.6, type: 'LW' }
  ]},
  { day: 20, month: 12, year: 2026, dayOfWeek: 'SU', extrema: [
    { time: '00:54', height: 4.8, type: 'HW' },
    { time: '07:15', height: 2.1, type: 'LW' },
    { time: '13:21', height: 5.1, type: 'HW' },
    { time: '19:47', height: 2.3, type: 'LW' }
  ]},
  { day: 21, month: 12, year: 2026, dayOfWeek: 'M', extrema: [
    { time: '02:03', height: 5.2, type: 'HW' },
    { time: '08:21', height: 1.8, type: 'LW' },
    { time: '14:25', height: 5.5, type: 'HW' },
    { time: '20:52', height: 1.9, type: 'LW' }
  ]},
  { day: 22, month: 12, year: 2026, dayOfWeek: 'TU', extrema: [
    { time: '02:59', height: 5.7, type: 'HW' },
    { time: '09:21', height: 1.4, type: 'LW' },
    { time: '15:19', height: 5.9, type: 'HW' },
    { time: '21:53', height: 1.6, type: 'LW' }
  ]},
  { day: 23, month: 12, year: 2026, dayOfWeek: 'W', extrema: [
    { time: '03:48', height: 6.0, type: 'HW' },
    { time: '10:20', height: 1.1, type: 'LW' },
    { time: '16:06', height: 6.1, type: 'HW' },
    { time: '22:49', height: 1.4, type: 'LW' }
  ]},
  { day: 24, month: 12, year: 2026, dayOfWeek: 'TH', extrema: [
    { time: '04:33', height: 6.3, type: 'HW' },
    { time: '11:13', height: 0.9, type: 'LW' },
    { time: '16:51', height: 6.3, type: 'HW' },
    { time: '23:38', height: 1.2, type: 'LW' }
  ]},
  { day: 25, month: 12, year: 2026, dayOfWeek: 'F', extrema: [
    { time: '05:18', height: 6.4, type: 'HW' },
    { time: '11:59', height: 0.8, type: 'LW' },
    { time: '17:33', height: 6.3, type: 'HW' }
  ]},
  { day: 26, month: 12, year: 2026, dayOfWeek: 'SA', extrema: [
    { time: '00:19', height: 1.1, type: 'LW' },
    { time: '06:01', height: 6.4, type: 'HW' },
    { time: '12:39', height: 0.8, type: 'LW' },
    { time: '18:14', height: 6.3, type: 'HW' }
  ]},
  { day: 27, month: 12, year: 2026, dayOfWeek: 'SU', extrema: [
    { time: '00:55', height: 1.1, type: 'LW' },
    { time: '06:42', height: 6.2, type: 'HW' },
    { time: '13:15', height: 1.0, type: 'LW' },
    { time: '18:53', height: 6.1, type: 'HW' }
  ]},
  { day: 28, month: 12, year: 2026, dayOfWeek: 'M', extrema: [
    { time: '01:27', height: 1.2, type: 'LW' },
    { time: '07:23', height: 6.0, type: 'HW' },
    { time: '13:47', height: 1.3, type: 'LW' },
    { time: '19:31', height: 5.9, type: 'HW' }
  ]},
  { day: 29, month: 12, year: 2026, dayOfWeek: 'TU', extrema: [
    { time: '01:56', height: 1.5, type: 'LW' },
    { time: '08:04', height: 5.6, type: 'HW' },
    { time: '14:17', height: 1.7, type: 'LW' },
    { time: '20:11', height: 5.6, type: 'HW' }
  ]},
  { day: 30, month: 12, year: 2026, dayOfWeek: 'W', extrema: [
    { time: '02:24', height: 1.8, type: 'LW' },
    { time: '08:49', height: 5.2, type: 'HW' },
    { time: '14:50', height: 2.1, type: 'LW' },
    { time: '20:57', height: 5.2, type: 'HW' }
  ]},
  { day: 31, month: 12, year: 2026, dayOfWeek: 'TH', extrema: [
    { time: '02:57', height: 2.2, type: 'LW' },
    { time: '09:45', height: 4.8, type: 'HW' },
    { time: '15:37', height: 2.5, type: 'LW' },
    { time: '21:56', height: 4.9, type: 'HW' }
  ]}
];
