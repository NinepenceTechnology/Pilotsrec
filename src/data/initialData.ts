import { Vessel, ManeuverRecord, Pilot, PilotShift, PortTerminal, WeatherCondition, MaritimeAlert } from '../types/maritime';

export const INITIAL_WEATHER: WeatherCondition = {
  windSpeedKnots: 16,
  windDirection: 'NE',
  seaState: 'Chop moderado (2-3)',
  tideState: 'enchente',
  tideHeightMeters: 2.85,
  visibilityMiles: 9.5,
  currentKnots: 1.4,
  barometricPressureHpa: 1016,
  weatherSummary: 'Tempo firme, visibilidade boa, maré em enchente com pico previsto para 14:30h (3.1m).'
};

export const INITIAL_TERMINALS: PortTerminal[] = [
  {
    id: 'term-1',
    name: 'Terminal de Contentores (TCON)',
    code: 'TCON',
    berths: ['Berço 101', 'Berço 102', 'Berço 103'],
    maxLoa: 366,
    maxDraft: 15.2,
    handledTypes: ['porta_conteiner']
  },
  {
    id: 'term-2',
    name: 'Terminal de Granéis Líquidos & Óleo (TGL)',
    code: 'TGL',
    berths: ['Pier Petroleiro 1', 'Pier Petroleiro 2', 'Delfim Químico'],
    maxLoa: 330,
    maxDraft: 17.5,
    handledTypes: ['petroleiro', 'gasoso_gnl_glp', 'quimico']
  },
  {
    id: 'term-3',
    name: 'Terminal Graneleiro & Minério (TGM)',
    code: 'TGM',
    berths: ['Cais Graneleiro Norte', 'Cais Carvão & Fertilizantes'],
    maxLoa: 300,
    maxDraft: 16.0,
    handledTypes: ['graneleiro', 'carga_geral']
  },
  {
    id: 'term-4',
    name: 'Cais Comercial e Multiuso (CCM)',
    code: 'CCM',
    berths: ['Cais 01 Multiuso', 'Cais 02 Ro-Ro', 'Terminal de Passageiros'],
    maxLoa: 290,
    maxDraft: 12.0,
    handledTypes: ['carga_geral', 'ro_ro_veiculos', 'passageiros_cruzeiro', 'apoio_maritimo']
  },
  {
    id: 'term-5',
    name: 'Área de Fundeadouro e Barra',
    code: 'FUND',
    berths: ['Fundeadouro Alpha (Interno)', 'Fundeadouro Bravo (Externo)', 'Bóia de Barra'],
    maxLoa: 400,
    maxDraft: 22.0,
    handledTypes: ['porta_conteiner', 'petroleiro', 'graneleiro', 'gasoso_gnl_glp', 'quimico', 'ro_ro_veiculos', 'carga_geral', 'passageiros_cruzeiro', 'apoio_maritimo']
  }
];

// Iniciar do zero: todos os registos limpos
export const INITIAL_VESSELS: Vessel[] = [];

export const INITIAL_PILOTS: Pilot[] = [];

export const INITIAL_SHIFTS: PilotShift[] = [];

export const INITIAL_MANEUVERS: ManeuverRecord[] = [];

export const INITIAL_ALERTS: MaritimeAlert[] = [
  {
    id: 'alt-001',
    title: 'Restrição de Vento - Entrada no Canal da Barra (Canal Macuti)',
    category: 'meteorologico',
    severity: 'alta',
    location: 'Canal de Acesso Macuti / Barra da Beira',
    description: 'Rajadas previstas acima de 25 nós entre as 14:00 e as 19:00. Manobras de navios com LOA > 250m no canal exigem 2 rebocadores ASD de escolta.',
    isActive: true,
    issuedBy: 'INAMAR / Capitania do Porto da Beira',
    issuedAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    actionRequired: 'Verificar prontidão de rebocadores com tração estática > 60T antes do embarque na bóia P.'
  },
  {
    id: 'alt-002',
    title: 'Trabalhos de Dragagem Hidrográfica no Canal',
    category: 'canal_navegacao',
    severity: 'media',
    location: 'Alinhamento do Berço 2 ao Berço 5',
    description: 'Draga autotransportadora da EMODRAGA operando no canal. Velocidade máxima autorizada no canal reduzida para 6 nós.',
    isActive: true,
    issuedBy: 'CFM - Portos e Caminhos de Ferro de Moçambique',
    issuedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    actionRequired: 'Estabelecer contacto de segurança em VHF Ch 12 ou 16 com o serviço de pilotagem.'
  }
];

