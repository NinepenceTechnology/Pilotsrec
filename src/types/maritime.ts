export type VesselType = 
  | 'porta_conteiner'
  | 'petroleiro'
  | 'graneleiro'
  | 'gasoso_gnl_glp'
  | 'quimico'
  | 'ro_ro_veiculos'
  | 'carga_geral'
  | 'passageiros_cruzeiro'
  | 'apoio_maritimo';

export interface Vessel {
  id: string;
  name: string;
  imo: string;
  callSign: string;
  flag: string;
  flagCode: string;
  type: VesselType;
  loa: number; // Length Overall in meters (Comprimento)
  beam: number; // Boca / Largura in meters
  maxDraft: number; // Calado máximo in meters
  currentDraftFwd: number; // Calado Vante
  currentDraftAft: number; // Calado Ré
  agent: string; // Agente Marítimo
  origin: string; // Procedência
  destination: string; // Próximo Porto
  dwt: number; // Deadweight tonnage
  grossTonnage: number; // GRT (Arqueação Bruta)
  terminalPreference?: string;
  yearBuilt?: number;
  remarks?: string;
}

// User requested exact types: ATRACAÇÃO, MUDANÇA, PUXANÇA, DESATRACAÇÃO
export type ManeuverType = 
  | 'atracacao'
  | 'mudanca'
  | 'puxanca'
  | 'desatracacao'
  | 'entrada'
  | 'saida'
  | 'mudanca_cais'
  | 'fundeio'
  | 'desfundeio'
  | 'barra_entrada'
  | 'barra_saida';

export type ManeuverStatus = 'programada' | 'em_curso' | 'concluida' | 'cancelada';

export type BerthingModel = 
  | 'Costado Bombordo (BB)'
  | 'Costado Boreste (BE)'
  | 'Mediterrânea (Popa)'
  | 'Amarras / Bóias'
  | 'Dolphin / Terminal';

export interface TugAssistanceTimings {
  arranque?: string; // Horário de saída / mobilização
  inicio?: string;   // Horário em que os rebocadores encostam / feitos ao navio (Tugs Made Fast)
  fim?: string;      // Horário em que os rebocadores são dispensados / largados (Tugs Dismissed)
  tugsMadeFast?: string; // Horário de encostamento (Tugs Made Fast)
  tugsDismissed?: string; // Horário de dispensa (Tugs Dismissed)
  operatingHours?: number; // Horário de operações (duração desde que encostam até serem dispensados)
}

export interface TugAssistance {
  tugId: string;
  tugName: string;
  bollardPullTons: number;
  linePassedTime?: string;
  lineReleasedTime?: string;
  hoursAssisted: number;
  position: 'proa' | 'popa' | 'costado_bb' | 'costado_be' | 'escolta';
  timings?: TugAssistanceTimings;
}

export interface WeatherCondition {
  windSpeedKnots: number;
  windDirection: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
  seaState: 'Calmo (1)' | 'Chop moderado (2-3)' | 'Mar agitado (4-5)' | 'Mar muito grosso (6+)';
  tideState: 'enchente' | 'vazante' | 'estofo_alta' | 'estofo_baixa';
  tideHeightMeters: number;
  visibilityMiles: number;
  currentKnots: number;
  barometricPressureHpa: number;
  weatherSummary: string;
}

export interface SafetyChecklist {
  pilotLadderCompliant: boolean; // Escada de Piloto IMO/SOLAS
  steeringGearTested: boolean; // Máquina do leme testada
  bowThrusterOperational: boolean; // Propulsor de proa
  mainEngineTested: boolean; // Máquina principal avante/ré
  anchorsCleared: boolean; // Ferros prontos a largar
  radarEcdisOperational: boolean; // Radares e Carta Eletrônica
  vhfChannelsConfirmed: boolean; // VHF Ch 12/16 operacionais
  masterPilotExchangeDone: boolean; // MPX preenchido
  deckCrewAssisting: boolean; // Tripulação a postos nos cabos
}

export interface TimeMilestones {
  boardingPilotBoat?: string; // Saída da lancha / Embarque
  pilotOnBoard?: string; // Piloto a bordo (Início de assessoria / POB)
  lastLineCastOff?: string; // Último cabo largado / Desamarrado (All Clear)
  commenceManeuver?: string; // Largar ferro ou soltar amarras
  tugsConnected?: string; // Rebocadores encostados / feitos (Tugs Made Fast)
  tugsReleased?: string; // Rebocadores dispensados / largados (Tugs Dismissed)
  firstLineAshored?: string; // Primeiro cabo em terra
  allFastCompleted?: string; // Amarrado e finalizado (Atracado / All Fast)
  pilotDisembarked?: string; // Desembarque do piloto (Pilot Away)
}

export interface IncidentRecord {
  cause: 
    | 'mau_tempo_vento'
    | 'mar_grosso_ressaca'
    | 'falta_espaco_cais'
    | 'avaria_maquinas'
    | 'avaria_leme'
    | 'restricao_calado_mare'
    | 'falta_rebocadores'
    | 'seguranca_recusa_tecnica'
    | 'acidente_toque'
    | 'outro';
  causeTitle: string;
  description: string;
  delayHours: number;
  estimatedExtraCost: number;
  vhfChannelUsed: string;
  reportedToAuthority: boolean;
  loggedAt: string;
}

export interface ManeuverRecord {
  id: string; // e.g. "PR-2026-0042"
  vesselId: string;
  vesselSnapshot: {
    name: string;
    imo: string;
    flag: string;
    type: VesselType;
    loa: number;
    beam: number;
    draftFwd: number;
    draftAft: number;
    grossTonnage?: number; // GRT
    agent: string;
    origin: string; // Procedência
    destination: string; // Próximo Porto
  };
  maneuverType: ManeuverType;
  status: ManeuverStatus;
  scheduledTime: string; // ISO string
  berthFrom?: string;
  berthTo: string;
  pilotId: string;
  pilotName: string;
  secondPilotId?: string;
  secondPilotName?: string;
  milestones: TimeMilestones;
  durationMinutes?: number;
  maneuverDurationFormatted?: string; // e.g. "1h 35m"
  
  // Pilot Specific Inputs & Operational Milestones
  maneuverDate?: string;      // DATA DA MANOBRA (Permite registo e alteração retroativa)
  pilotOnBoardTime?: string;  // PILOTO A BORDO (POB)
  lastLineCastOffTime?: string; // ÚLTIMO CABO LARGADO (ALL CLEAR)
  firstLineAshored?: string;  // PRIMEIRO CABO EM TERRA (FIRST LINE)
  berthingTime?: string;      // ATRACAÇÃO / AMARRADO (ALL FAST)
  pilotDisembarkedTime?: string; // DESEMBARQUE DO PILOTO (PILOT AWAY)
  unmooringTime?: string;     // DESATRACAÇÃO
  berthingModel?: BerthingModel; // MODELO DE ATRACAÇÃO
  tugCount?: number;          // NÚMERO DE REBOCADORES
  tugsMadeFastTime?: string;  // REBOCADORES ENCOSTADOS AO NAVIO
  tugsDismissedTime?: string; // REBOCADORES DISPENSADOS
  tugOperationalHours?: number; // HORÁRIO OPERACIONAL DOS REBOCADORES (ENCOSTADOS ATÉ DISPENSADOS)
  pilotDutyHours?: number;    // TEMPO DE SERVIÇO DO PILOTO (EMBARQUE AO DESEMBARQUE PARA FADIGA)
  tugTimings?: TugAssistanceTimings; // TEMPO DE ASSISTÊNCIA (ARRANQUE, INÍCIO, FIM)
  
  tugs: TugAssistance[];
  weather: WeatherCondition;
  safetyChecklist: SafetyChecklist;
  incident?: IncidentRecord;
  pilotRemarks?: string; // OBSERVAÇÃO
  masterName?: string;
  pilotageCertificateSigned?: boolean;
  
  // Foto que vira PDF anexado (compatibilidade legada)
  photoUrl?: string; // Base64 or ObjectURL of photo
  photoTimestamp?: string;
  photoTitle?: string;

  // Centro de Anexos Ampliado (Multi-anexos: fotos, bilhetes, calados, relatórios e PDFs)
  attachments?: ManeuverAttachment[];
  
  createdAt: string;
  updatedAt: string;
}

export type AttachmentCategory = 
  | 'photo_vessel'       // Foto do Navio / Costado / Proa / Popa
  | 'photo_maneuver'     // Manobra / Atracação / Rebocadores
  | 'pilot_slip'         // Bilhete de Praticagem Assinado / Certificado
  | 'draft_survey'       // Folha de Calados / Leituras de Calado
  | 'berth_condition'    // Condição do Berço / Defensas / Cabeços
  | 'checklist_doc'      // Checklist de Segurança / Passagem de Informações
  | 'incident_report'    // Registo de Avaria / Ocorrência / Incidente
  | 'weather_radar'      // Boletim Meteorológico / Radar / Carta Náutica
  | 'other_doc';         // Outro Documento / Arquivo

export interface ManeuverAttachment {
  id: string;
  name: string;
  category: AttachmentCategory;
  dataUrl: string; // Base64 de imagem ou documento
  fileType: 'image' | 'pdf' | 'document';
  mimeType: string;
  sizeBytes?: number;
  uploadedAt: string;
  caption?: string; // Legenda ou anotação do prático
}

export type PilotRank = 
  | 'Piloto Sênior' 
  | 'Piloto Efetivo' 
  | 'Piloto Praticante' 
  | 'Piloto em Treinamento' 
  | 'Piloto Chefe / Coordenador'
  | 'Prático Sênior' 
  | 'Prático Efetivo' 
  | 'Praticante de Prático';

export interface UserPilotProfile {
  id: string;
  name: string;
  rank: PilotRank;
  licenseNumber: string; // CIR Marítima / Licença
  phone?: string;
  vhfCallSign?: string;
  registeredAt: string;
}

export interface Pilot {
  id: string;
  name: string;
  licenseNumber: string; // CIR Marítima
  category: PilotRank | 'Piloto Sênior' | 'Piloto Efetivo' | 'Piloto em Treinamento';
  phone: string;
  vhfCallSign: string;
  status: 'de_servico' | 'prevencao' | 'folga' | 'em_manobra';
  currentShift: string;
  completedManeuversCount: number;
  avatarColor: string;
}

export interface PilotShift {
  id: string;
  pilotId: string;
  pilotName: string;
  date: string;
  shiftName: 'Madrugada (00h-08h)' | 'Manhã/Tarde (08h-16h)' | 'Noite (16h-24h)' | 'Plantão 24h';
  role: 'Serviço Ativo' | 'Prevenção / Reserva' | 'Descanso Obrigatório';
}

export interface PortTerminal {
  id: string;
  name: string;
  code: string;
  berths: string[];
  maxLoa: number;
  maxDraft: number;
  handledTypes: VesselType[];
}

export type AlertSeverity = 'critica' | 'alta' | 'media' | 'baixa';
export type AlertCategory = 'meteorologico' | 'canal_navegacao' | 'berco_porto' | 'operacional' | 'seguranca';

export interface MaritimeAlert {
  id: string;
  title: string;
  category: AlertCategory;
  severity: AlertSeverity;
  location?: string; // e.g. "Canal da Barra", "Cais Comercial 3", "Terminal Petroleiro"
  description: string;
  isActive: boolean; // acionamento (ativar/desativar)
  issuedBy: string; // e.g. "Capitania dos Portos", "VTS Porto", "Coordenação de Pilotagem"
  issuedAt: string; // ISO datetime
  updatedAt?: string; // ISO datetime para sincronização exata entre dispositivos
  validUntil?: string; // ISO datetime or date
  actionRequired?: string;
  syncDeviceId?: string;
}

