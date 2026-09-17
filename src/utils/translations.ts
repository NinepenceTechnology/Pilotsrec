export type Language = 'pt' | 'en';

export interface Translations {
  // Navigation & Buttons
  nav_dashboard: string;
  nav_operations: string;
  nav_health: string;
  nav_alerts: string;
  nav_documents: string;
  nav_tides: string;
  nav_archive: string;
  nav_pilots: string;
  nav_safety: string;
  nav_tests: string;

  // Short labels for clean, non-overlapping responsive buttons
  nav_op_short: string;
  nav_health_short: string;
  nav_alerts_short: string;
  nav_docs_short: string;
  nav_tides_short: string;
  nav_archive_short: string;

  // Aliases for compatibility (without 'btn' in values)
  btnOperationRecord: string;
  btnHealth: string;
  btnAlerts: string;
  btnDocuments: string;
  btnTidesAndCalculations: string;
  btnArchive: string;
  
  // 6 Primary Action Buttons (Tela Inicial)
  btn_operation_registration: string;
  btn_operation_registration_desc: string;
  btn_health: string;
  btn_health_desc: string;
  btn_alert: string;
  btn_alert_desc: string;
  btn_documents: string;
  btn_documents_desc: string;
  btn_tides: string;
  btn_tides_desc: string;
  btn_archive: string;
  btn_archive_desc: string;

  // Header & Status
  header_vts_active: string;
  header_wind: string;
  header_tide: string;
  header_quick_hud: string;
  header_new_maneuver: string;
  header_channel_open: string;
  header_futuristic_subtitle: string;

  // Search & Vessel suggestions
  vessel_search_placeholder: string;
  vessel_search_hint: string;
  source_marine_traffic: string;
  source_vessel_finder: string;
  source_internal_backup: string;

  // Archive & Excel
  archive_title: string;
  archive_subtitle: string;
  export_vessels_excel: string;
  import_vessels_excel: string;
  export_maneuvers_excel: string;
  import_maneuvers_excel: string;
  export_json_backup: string;
  restore_json_backup: string;

  // Health & Fatigue Management
  health_title: string;
  health_subtitle: string;
  health_fit_for_duty: string;
  health_rest_compliance: string;
  health_fatigue_score: string;
  health_vitals: string;
  health_alcohol_zero: string;
  health_certify_duty: string;
  fatigue_management: string;
  fatigue_workload_title: string;
  fatigue_workload_desc: string;
  fatigue_pilot_matrix: string;

  // General terms
  pilot: string;
  pilots: string;
  pilotage: string;
  vessel: string;
  maneuver: string;
  terminal: string;
  berth: string;
  draft: string;
  length_overall: string;
  beam: string;
  active: string;
  completed: string;
  scheduled: string;
  cancelled: string;
  // Maritime Technical Milestones & Operational Terms
  pilot_on_board: string;
  first_line: string;
  all_fast: string;
  last_line: string;
  pilot_disembarked: string;
  berthing_model: string;
  maneuver_date: string;
  maneuver_date_hint: string;
  tugs_made_fast: string;
  tugs_dismissed: string;
  tugs_operating_hours: string;
  pilot_duty_duration: string;
  type_atracacao: string;
  type_mudanca: string;
  type_puxanca: string;
  type_desatracacao: string;
  save: string;
  cancel: string;
  close: string;
  edit: string;
  delete: string;
  export: string;
  import: string;
  print: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  pt: {
    nav_dashboard: 'Centro de Comando',
    nav_operations: 'Registo de Operações',
    nav_health: 'Saúde & Gestão de Fadiga',
    nav_alerts: 'Alertas Portuários',
    nav_documents: 'Documentos & Certificados',
    nav_tides: 'Marés & Cálculos',
    nav_archive: 'Arquivo & Dados',
    nav_pilots: 'Escala de Pilotos',
    nav_safety: 'Segurança & SOLAS',
    nav_tests: 'Testes Dispositivos',

    nav_op_short: 'Operações',
    nav_health_short: 'Saúde & Fadiga',
    nav_alerts_short: 'Alertas',
    nav_docs_short: 'Documentos',
    nav_tides_short: 'Marés & Calc',
    nav_archive_short: 'Arquivo',

    btnOperationRecord: 'Registo de Operações',
    btnHealth: 'Saúde & Gestão de Fadiga',
    btnAlerts: 'Alertas Portuários',
    btnDocuments: 'Documentos & Certificados',
    btnTidesAndCalculations: 'Marés & Cálculos',
    btnArchive: 'Arquivo & Dados',

    btn_operation_registration: 'REGISTO DE OPERAÇÃO',
    btn_operation_registration_desc: 'Entrada, saída, atracação, desatracação e puxança',
    btn_health: 'SAÚDE & GESTÃO DE FADIGA',
    btn_health_desc: 'Fadiga calculada pelo trabalho do piloto, descanso STCW e biometria',
    btn_alert: 'ALERTAS PORTUÁRIOS',
    btn_alert_desc: 'Avisos aos navegantes, calado, ventos e canal',
    btn_documents: 'DOCUMENTOS',
    btn_documents_desc: 'Folhas oficiais de pilotagem, certidões e relatórios PDF',
    btn_tides: 'MARÉS E CÁLCULOS',
    btn_tides_desc: 'Cálculo de marés minuto a minuto, UKC e janelas de trânsito',
    btn_archive: 'ARQUIVO',
    btn_archive_desc: 'Importar e exportar Excel (.xlsx) de navios e manobras',

    header_vts_active: 'VTS & ESTAÇÃO DE PILOTAGEM · BARRA & PORTO',
    header_wind: 'Vento',
    header_tide: 'Maré Beira',
    header_quick_hud: 'Modo a Bordo',
    header_new_maneuver: 'NOVO REGISTO DE MANOBRA',
    header_channel_open: 'Canal de Acesso Operacional',
    header_futuristic_subtitle: 'Sistema de Navegação Marítima, Telemetria & Pilotagem Portuária',

    vessel_search_placeholder: 'Digite o nome do navio ou IMO para autocompletar...',
    vessel_search_hint: 'Vasculha MarineTraffic, VesselFinder e Backup Interno',
    source_marine_traffic: 'MarineTraffic (AIS Live)',
    source_vessel_finder: 'VesselFinder (Base Global)',
    source_internal_backup: 'Backup Interno / Histórico',

    archive_title: 'Central de Arquivo, Importação & Exportação',
    archive_subtitle: 'Gestão de base de dados de navios, manobras em Excel (.xlsx) e cópias de segurança integrais',
    export_vessels_excel: 'Exportar Navios (.xlsx)',
    import_vessels_excel: 'Importar Navios (.xlsx)',
    export_maneuvers_excel: 'Exportar Manobras (.xlsx)',
    import_maneuvers_excel: 'Importar Manobras (.xlsx)',
    export_json_backup: 'Backup Integral (JSON)',
    restore_json_backup: 'Restaurar Backup (JSON)',

    health_title: 'Gestão de Fadiga & Aptidão do Piloto',
    health_subtitle: 'Monitorização contínua de fadiga calculada em função do trabalho do piloto (manobras 24h/7d, horas de passadiço e repouso STCW).',
    health_fit_for_duty: 'Apto para Serviço',
    health_rest_compliance: 'Conformidade de Descanso (STCW)',
    health_fatigue_score: 'Índice de Fadiga Calculado',
    health_vitals: 'Sinais Vitais & Biometria',
    health_alcohol_zero: 'Tolerância Zero a Álcool / Substâncias',
    health_certify_duty: 'Emitir Certificado de Prontidão',
    fatigue_management: 'Gestão de Fadiga do Piloto',
    fatigue_workload_title: 'Fadiga Calculada por Carga de Trabalho',
    fatigue_workload_desc: 'Cálculo algorítmico baseado nas manobras ativas, manobras noturnas, duração e intervalos de repouso.',
    fatigue_pilot_matrix: 'Matriz de Fadiga de Todos os Pilotos',

    pilot: 'Piloto',
    pilots: 'Pilotos',
    pilotage: 'Pilotagem',
    vessel: 'Navio',
    maneuver: 'Manobra',
    terminal: 'Terminal',
    berth: 'Berço',
    draft: 'Calado',
    length_overall: 'Comprimento (LOA)',
    beam: 'Boca',
    active: 'Em Curso',
    completed: 'Concluída',
    scheduled: 'Programada',
    cancelled: 'Cancelada',
    // Maritime Technical Milestones & Operational Terms
    pilot_on_board: 'Piloto a Bordo (POB - Início de Assessoria)',
    first_line: 'Primeiro Cabo em Terra (First Line)',
    all_fast: 'Atracado & Amarrado (All Fast)',
    last_line: 'Último Cabo Largado (All Clear / Desatracado)',
    pilot_disembarked: 'Desembarque do Piloto (Pilot Away)',
    berthing_model: 'Modelo de Atracação',
    maneuver_date: 'Data da Operação / Manobra',
    maneuver_date_hint: 'Possibilidade de registo ou alteração retroativa se a manobra não tiver sido registada no momento',
    tugs_made_fast: 'Rebocadores Encostados / Feitos ao Navio',
    tugs_dismissed: 'Rebocadores Dispensados / Largados',
    tugs_operating_hours: 'Horário de Operação dos Rebocadores (Encostamento à Dispensa)',
    pilot_duty_duration: 'Tempo de Serviço do Piloto (Embarque ao Desembarque - Cálculo de Fadiga)',
    type_atracacao: 'Atracação (Inward / Berthing)',
    type_mudanca: 'Mudança de Cais (Berth-to-Berth / Shifting)',
    type_puxanca: 'Puxança ao Cais (Warping Along Berth)',
    type_desatracacao: 'Desatracação (Outward / Unberthing)',
    save: 'Salvar Registo',
    cancel: 'Cancelar',
    close: 'Fechar',
    edit: 'Editar',
    delete: 'Eliminar',
    export: 'Exportar',
    import: 'Importar',
    print: 'Imprimir'
  },
  en: {
    nav_dashboard: 'Command Center',
    nav_operations: 'Operations Log',
    nav_health: 'Health & Fatigue Management',
    nav_alerts: 'Port Alerts',
    nav_documents: 'Documents & Certificates',
    nav_tides: 'Tides & Calculations',
    nav_archive: 'Archive & Data',
    nav_pilots: 'Pilots Roster',
    nav_safety: 'Safety & SOLAS',
    nav_tests: 'Device Tests',

    nav_op_short: 'Operations',
    nav_health_short: 'Health & Fatigue',
    nav_alerts_short: 'Alerts',
    nav_docs_short: 'Documents',
    nav_tides_short: 'Tides & Calc',
    nav_archive_short: 'Archive',

    btnOperationRecord: 'Operations Log',
    btnHealth: 'Health & Fatigue Management',
    btnAlerts: 'Port Alerts',
    btnDocuments: 'Documents & Certificates',
    btnTidesAndCalculations: 'Tides & Calculations',
    btnArchive: 'Archive & Data',

    btn_operation_registration: 'OPERATIONS LOG',
    btn_operation_registration_desc: 'Inward, outward, berthing, unberthing and shifting',
    btn_health: 'HEALTH & FATIGUE MANAGEMENT',
    btn_health_desc: 'Fatigue calculated from pilot workload, STCW rest hours and biometrics',
    btn_alert: 'PORT ALERTS',
    btn_alert_desc: 'Navigational warnings, draft restriction, weather & channel',
    btn_documents: 'DOCUMENTS',
    btn_documents_desc: 'Official pilotage certificates, sheets and PDF reports',
    btn_tides: 'TIDES & CALCULATIONS',
    btn_tides_desc: 'Minute-by-minute tides, UKC and fairway safe windows',
    btn_archive: 'ARCHIVE',
    btn_archive_desc: 'Import & export Excel (.xlsx) for vessels and maneuvers',

    header_vts_active: 'VTS & HARBOUR PILOTAGE STATION · BAR & FAIRWAY',
    header_wind: 'Wind',
    header_tide: 'Beira Tide',
    header_quick_hud: 'On-Board HUD',
    header_new_maneuver: 'NEW MANEUVER LOG',
    header_channel_open: 'Access Channel Operational',
    header_futuristic_subtitle: 'Maritime Navigation System, Telemetry & Port Pilotage',

    vessel_search_placeholder: 'Type vessel name or IMO to autocomplete...',
    vessel_search_hint: 'Scans MarineTraffic, VesselFinder and Internal Backup',
    source_marine_traffic: 'MarineTraffic (AIS Live)',
    source_vessel_finder: 'VesselFinder (Global Fleet)',
    source_internal_backup: 'Internal Backup / History',

    archive_title: 'Archive, Import & Export Center',
    archive_subtitle: 'Vessel fleet management, Excel (.xlsx) operation logs and full system backups',
    export_vessels_excel: 'Export Vessels (.xlsx)',
    import_vessels_excel: 'Import Vessels (.xlsx)',
    export_maneuvers_excel: 'Export Maneuvers (.xlsx)',
    import_maneuvers_excel: 'Import Maneuvers (.xlsx)',
    export_json_backup: 'Full Backup (JSON)',
    restore_json_backup: 'Restore Backup (JSON)',

    health_title: 'Pilot Fatigue & Readiness Management',
    health_subtitle: 'Continuous fatigue tracking calculated directly from pilot workload (24h/7d maneuvers, bridge hours & STCW rest).',
    health_fit_for_duty: 'Fit for Duty',
    health_rest_compliance: 'Rest Hours Compliance (STCW)',
    health_fatigue_score: 'Calculated Fatigue Index',
    health_vitals: 'Vital Signs & Biometrics',
    health_alcohol_zero: 'Zero Tolerance to Alcohol & Drugs',
    health_certify_duty: 'Issue Fitness Clearance',
    fatigue_management: 'Pilot Fatigue Management',
    fatigue_workload_title: 'Fatigue Calculated from Workload',
    fatigue_workload_desc: 'Algorithmic calculation based on active maneuvers, night maneuvers, bridge duration and rest intervals.',
    fatigue_pilot_matrix: 'All Pilots Fatigue Matrix',

    pilot: 'Pilot',
    pilots: 'Pilots',
    pilotage: 'Pilotage',
    vessel: 'Vessel',
    maneuver: 'Maneuver',
    terminal: 'Terminal',
    berth: 'Berth',
    draft: 'Draft',
    length_overall: 'Length Overall (LOA)',
    beam: 'Beam',
    active: 'In Progress',
    completed: 'Completed',
    scheduled: 'Scheduled',
    cancelled: 'Cancelled',
    // Maritime Technical Milestones & Operational Terms
    pilot_on_board: 'Pilot On Board (POB - Commencement of Pilotage)',
    first_line: 'First Line Ashore (First Line)',
    all_fast: 'All Fast & Berthed (All Lines Secured)',
    last_line: 'All Clear (Last Line Let Go / Unberthed)',
    pilot_disembarked: 'Pilot Disembarked (Pilot Away)',
    berthing_model: 'Berthing Model / Configuration',
    maneuver_date: 'Operation / Maneuver Date',
    maneuver_date_hint: 'Allows retroactive recording or modification if not entered during the maneuver',
    tugs_made_fast: 'Tugs Made Fast / Alongside',
    tugs_dismissed: 'Tugs Dismissed / Cast Off',
    tugs_operating_hours: 'Tug Working Period (From Made Fast to Dismissed)',
    pilot_duty_duration: 'Pilot Service Duration (POB to Disembarkation - Fatigue Engine)',
    type_atracacao: 'Berthing (Inward / Berthing)',
    type_mudanca: 'Shifting (Berth-to-Berth)',
    type_puxanca: 'Warping (Along Berth Shift)',
    type_desatracacao: 'Unberthing (Outward / Sailing)',
    save: 'Save Record',
    cancel: 'Cancel',
    close: 'Close',
    edit: 'Edit',
    delete: 'Delete',
    export: 'Export',
    import: 'Import',
    print: 'Print'
  }
};
