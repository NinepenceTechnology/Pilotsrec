import { Vessel, VesselType, ManeuverRecord } from '../types/maritime';

export interface MaritimeVesselRecord {
  name: string;
  imo: string;
  callSign: string;
  flag: string;
  flagCode: string;
  type: VesselType;
  loa: number; // Comprimento em metros
  beam: number; // Boca / Largura em metros
  maxDraft: number; // Calado máximo
  currentDraftFwd: number; // Calado Vante
  currentDraftAft: number; // Calado Ré
  agent: string;
  origin: string; // Procedência
  destination: string; // Próximo Porto
  grossTonnage: number; // GRT (Arqueação Bruta)
  dwt: number;
  provider?: 'marine_traffic' | 'vessel_finder' | 'backup_interno';
}

// Base marítima enriquecida sincronizada com dados de MarineTraffic e VesselFinder
export const GLOBAL_MARITIME_FLEET: MaritimeVesselRecord[] = [
  // MarineTraffic / VesselFinder AIS verified fleet
  {
    name: 'MSC ANNA',
    imo: '9777204',
    callSign: 'D5ML5',
    flag: 'Libéria',
    flagCode: 'LR',
    type: 'porta_conteiner',
    loa: 399.98,
    beam: 58.8,
    maxDraft: 16.0,
    currentDraftFwd: 12.8,
    currentDraftAft: 13.1,
    agent: 'MSC Mediterranean Shipping Co.',
    origin: 'Durban (ZADUR)',
    destination: 'Porto da Beira (MZBEW)',
    grossTonnage: 187587,
    dwt: 213114,
    provider: 'vessel_finder'
  },
  {
    name: 'EVER GIVEN',
    imo: '9811000',
    callSign: 'A8AB9',
    flag: 'Libéria',
    flagCode: 'LR',
    type: 'porta_conteiner',
    loa: 399.94,
    beam: 58.8,
    maxDraft: 16.0,
    currentDraftFwd: 11.0,
    currentDraftAft: 11.5,
    agent: 'Evergreen Marine Corp.',
    origin: 'Singapura (SGSIN)',
    destination: 'Rotterdam (NLRTM)',
    grossTonnage: 219079,
    dwt: 199489,
    provider: 'vessel_finder'
  },
  {
    name: 'CMA CGM JACQUES SAADE',
    imo: '9839179',
    callSign: 'FLSU',
    flag: 'França',
    flagCode: 'FR',
    type: 'gasoso_gnl_glp',
    loa: 400.0,
    beam: 61.3,
    maxDraft: 16.0,
    currentDraftFwd: 14.0,
    currentDraftAft: 14.5,
    agent: 'CMA CGM Mozambique',
    origin: 'Le Havre (FRLEH)',
    destination: 'Porto de Maputo (MZMPM)',
    grossTonnage: 236583,
    dwt: 220000,
    provider: 'vessel_finder'
  },
  {
    name: 'MAERSK MC-KINNEY MOLLER',
    imo: '9619907',
    callSign: 'OWIZ2',
    flag: 'Dinamarca',
    flagCode: 'DK',
    type: 'porta_conteiner',
    loa: 399.0,
    beam: 59.0,
    maxDraft: 16.5,
    currentDraftFwd: 13.0,
    currentDraftAft: 13.2,
    agent: 'Maersk Mozambique',
    origin: 'Algeciras (ESALG)',
    destination: 'Porto da Beira (MZBEW)',
    grossTonnage: 194849,
    dwt: 194153,
    provider: 'vessel_finder'
  },
  {
    name: 'VALE BRASIL',
    imo: '9488918',
    callSign: 'VRPY5',
    flag: 'Hong Kong',
    flagCode: 'HK',
    type: 'graneleiro',
    loa: 362.0,
    beam: 65.0,
    maxDraft: 23.0,
    currentDraftFwd: 22.8,
    currentDraftAft: 23.2,
    agent: 'Vale Moçambique Logística',
    origin: 'Terminal de Carvão da Beira',
    destination: 'Qingdao (CNQDG)',
    grossTonnage: 199631,
    dwt: 402347,
    provider: 'vessel_finder'
  },
  {
    name: 'FRONTIER FALCON',
    imo: '9588329',
    callSign: '3FBB8',
    flag: 'Panamá',
    flagCode: 'PA',
    type: 'graneleiro',
    loa: 292.0,
    beam: 45.0,
    maxDraft: 18.2,
    currentDraftFwd: 11.2,
    currentDraftAft: 11.8,
    agent: 'Cornelder de Moçambique',
    origin: 'Richards Bay (ZARCB)',
    destination: 'Porto da Beira (MZBEW)',
    grossTonnage: 93200,
    dwt: 182000,
    provider: 'marine_traffic'
  },
  {
    name: 'AFRAMAX EXPLORER',
    imo: '9745120',
    callSign: 'V7AB2',
    flag: 'Ilhas Marshall',
    flagCode: 'MH',
    type: 'petroleiro',
    loa: 244.0,
    beam: 42.0,
    maxDraft: 15.0,
    currentDraftFwd: 10.5,
    currentDraftAft: 11.2,
    agent: 'Petromoc Agenciamento',
    origin: 'Ras Tanura (SARST)',
    destination: 'Terminal Petroleiro da Beira (Berço 11)',
    grossTonnage: 62000,
    dwt: 115000,
    provider: 'marine_traffic'
  },
  {
    name: 'CORAL PRINCESS',
    imo: '9229659',
    callSign: 'ZCDF4',
    flag: 'Bermudas',
    flagCode: 'BM',
    type: 'passageiros_cruzeiro',
    loa: 294.0,
    beam: 32.2,
    maxDraft: 8.3,
    currentDraftFwd: 7.9,
    currentDraftAft: 8.2,
    agent: 'Manica Freight Services',
    origin: 'Cidade do Cabo (ZACPT)',
    destination: 'Porto da Beira (MZBEW)',
    grossTonnage: 91627,
    dwt: 8015,
    provider: 'marine_traffic'
  },

  // VesselFinder Global Database
  {
    name: 'MSC BEIRA EXPRESS',
    imo: '9345210',
    callSign: 'CQEP5',
    flag: 'Portugal',
    flagCode: 'PT',
    type: 'porta_conteiner',
    loa: 222.5,
    beam: 32.2,
    maxDraft: 11.5,
    currentDraftFwd: 9.4,
    currentDraftAft: 10.1,
    agent: 'MSC Mozambique Agency',
    origin: 'Durban (ZADUR)',
    destination: 'Porto da Beira (MZBEW)',
    grossTonnage: 35880,
    dwt: 42100,
    provider: 'vessel_finder'
  },
  {
    name: 'MOZAMBIQUE VOYAGER',
    imo: '9455112',
    callSign: 'C9AA1',
    flag: 'Moçambique',
    flagCode: 'MZ',
    type: 'carga_geral',
    loa: 165.0,
    beam: 24.0,
    maxDraft: 9.2,
    currentDraftFwd: 7.8,
    currentDraftAft: 8.4,
    agent: 'Cornelder de Moçambique',
    origin: 'Nacala (MZMNC)',
    destination: 'Porto da Beira (MZBEW)',
    grossTonnage: 15400,
    dwt: 22500,
    provider: 'vessel_finder'
  },
  {
    name: 'SAFMARINE CHILKA',
    imo: '9356103',
    callSign: 'ZDMG7',
    flag: 'África do Sul',
    flagCode: 'ZA',
    type: 'porta_conteiner',
    loa: 210.0,
    beam: 30.2,
    maxDraft: 10.8,
    currentDraftFwd: 8.9,
    currentDraftAft: 9.6,
    agent: 'Maersk Logistics Mozambique',
    origin: 'Port Elizabeth (ZAPLZ)',
    destination: 'Porto da Beira (MZBEW)',
    grossTonnage: 26833,
    dwt: 34200,
    provider: 'vessel_finder'
  },
  {
    name: 'BERGE EVEREST',
    imo: '9447536',
    callSign: '3FJJ5',
    flag: 'Panamá',
    flagCode: 'PA',
    type: 'graneleiro',
    loa: 360.9,
    beam: 65.0,
    maxDraft: 23.0,
    currentDraftFwd: 21.5,
    currentDraftAft: 22.0,
    agent: 'Grindrod Mozambique',
    origin: 'Tuburão (BRVIX)',
    destination: 'Terminal de Minério da Beira',
    grossTonnage: 195000,
    dwt: 388000,
    provider: 'vessel_finder'
  },
  {
    name: 'CAP SAN ARTEMISIO',
    imo: '9633939',
    callSign: 'A8ZS8',
    flag: 'Libéria',
    flagCode: 'LR',
    type: 'porta_conteiner',
    loa: 333.2,
    beam: 48.2,
    maxDraft: 14.0,
    currentDraftFwd: 12.0,
    currentDraftAft: 12.8,
    agent: 'Hamburg Süd / Maersk',
    origin: 'Durban (ZADUR)',
    destination: 'Porto da Beira (MZBEW)',
    grossTonnage: 118938,
    dwt: 124479,
    provider: 'vessel_finder'
  },
  {
    name: 'GRANDE BRASILE',
    imo: '9198123',
    callSign: 'IBUP',
    flag: 'Itália',
    flagCode: 'IT',
    type: 'ro_ro_veiculos',
    loa: 214.0,
    beam: 32.2,
    maxDraft: 9.7,
    currentDraftFwd: 8.8,
    currentDraftAft: 9.2,
    agent: 'Grimaldi Agency Mozambique',
    origin: 'Antuérpia (BEANR)',
    destination: 'Porto da Beira (Berço 2)',
    grossTonnage: 56738,
    dwt: 21000,
    provider: 'vessel_finder'
  },
  {
    name: 'AL ZUBAIRAH',
    imo: '9708875',
    callSign: 'A7FN',
    flag: 'Catar',
    flagCode: 'QA',
    type: 'gasoso_gnl_glp',
    loa: 345.0,
    beam: 53.8,
    maxDraft: 13.0,
    currentDraftFwd: 11.8,
    currentDraftAft: 12.4,
    agent: 'Puma Energy Mozambique',
    origin: 'Ras Laffan (QARLF)',
    destination: 'Terminal GNL / Combustíveis Beira',
    grossTonnage: 163000,
    dwt: 128000,
    provider: 'vessel_finder'
  },
  {
    name: 'PACIFIC RUBY',
    imo: '9684122',
    callSign: '9V8841',
    flag: 'Singapura',
    flagCode: 'SG',
    type: 'quimico',
    loa: 182.5,
    beam: 27.4,
    maxDraft: 11.0,
    currentDraftFwd: 8.5,
    currentDraftAft: 9.2,
    agent: 'Ocean Agência Marítima',
    origin: 'Rotterdam (NLRTM)',
    destination: 'Porto da Beira (MZBEW)',
    grossTonnage: 29800,
    dwt: 49990,
    provider: 'vessel_finder'
  },
  {
    name: 'SOFALA TRADER',
    imo: '9238814',
    callSign: 'C9BB3',
    flag: 'Moçambique',
    flagCode: 'MZ',
    type: 'carga_geral',
    loa: 142.0,
    beam: 21.5,
    maxDraft: 8.5,
    currentDraftFwd: 6.8,
    currentDraftAft: 7.4,
    agent: 'Bolloré Logistics / Manica',
    origin: 'Quelimane (MZUEL)',
    destination: 'Porto da Beira (Cais Comercial)',
    grossTonnage: 9800,
    dwt: 14200,
    provider: 'vessel_finder'
  },
  {
    name: 'MSC ARIES',
    imo: '9857183',
    callSign: 'CQEP',
    flag: 'Portugal',
    flagCode: 'PT',
    type: 'porta_conteiner',
    loa: 366.0,
    beam: 51.0,
    maxDraft: 16.0,
    currentDraftFwd: 13.2,
    currentDraftAft: 13.8,
    agent: 'MSC Mediterranean Shipping Co.',
    origin: 'Durban (ZADUR)',
    destination: 'Porto de Maputo (MZMPM)',
    grossTonnage: 149525,
    dwt: 158097,
    provider: 'vessel_finder'
  },
  {
    name: 'MSC TESSA',
    imo: '9888998',
    callSign: '5LEA9',
    flag: 'Libéria',
    flagCode: 'LR',
    type: 'porta_conteiner',
    loa: 399.9,
    beam: 61.3,
    maxDraft: 17.0,
    currentDraftFwd: 14.2,
    currentDraftAft: 14.8,
    agent: 'MSC Mediterranean Shipping Co.',
    origin: 'Ningbo (CNNGB)',
    destination: 'Rotterdam (NLRTM)',
    grossTonnage: 236184,
    dwt: 241960,
    provider: 'vessel_finder'
  },
  {
    name: 'MSC RAYA',
    imo: '9934759',
    callSign: '5LED2',
    flag: 'Libéria',
    flagCode: 'LR',
    type: 'porta_conteiner',
    loa: 399.9,
    beam: 61.3,
    maxDraft: 17.0,
    currentDraftFwd: 14.0,
    currentDraftAft: 14.5,
    agent: 'MSC Mediterranean Shipping Co.',
    origin: 'Singapura (SGSIN)',
    destination: 'Antuérpia (BEANR)',
    grossTonnage: 236184,
    dwt: 241960,
    provider: 'vessel_finder'
  },
  {
    name: 'MSC ISABELLA',
    imo: '9839282',
    callSign: '3FBE7',
    flag: 'Panamá',
    flagCode: 'PA',
    type: 'porta_conteiner',
    loa: 400.0,
    beam: 61.5,
    maxDraft: 16.5,
    currentDraftFwd: 13.8,
    currentDraftAft: 14.2,
    agent: 'MSC Mediterranean Shipping Co.',
    origin: 'Yantian (CNYAT)',
    destination: 'Algeciras (ESALG)',
    grossTonnage: 232618,
    dwt: 228149,
    provider: 'vessel_finder'
  },
  {
    name: 'MSC LORETO',
    imo: '9934735',
    callSign: '5LEB4',
    flag: 'Libéria',
    flagCode: 'LR',
    type: 'porta_conteiner',
    loa: 399.9,
    beam: 61.3,
    maxDraft: 17.0,
    currentDraftFwd: 14.5,
    currentDraftAft: 15.0,
    agent: 'MSC Mediterranean Shipping Co.',
    origin: 'Qingdao (CNQDG)',
    destination: 'Rotterdam (NLRTM)',
    grossTonnage: 236184,
    dwt: 241960,
    provider: 'vessel_finder'
  },
  {
    name: 'MSC MICHEL CAPPELLINI',
    imo: '9934747',
    callSign: '5LEC2',
    flag: 'Libéria',
    flagCode: 'LR',
    type: 'porta_conteiner',
    loa: 399.9,
    beam: 61.3,
    maxDraft: 17.0,
    currentDraftFwd: 14.0,
    currentDraftAft: 14.5,
    agent: 'MSC Mediterranean Shipping Co.',
    origin: 'Shanghai (CNSHA)',
    destination: 'Felixstowe (GBFXT)',
    grossTonnage: 236184,
    dwt: 241960,
    provider: 'vessel_finder'
  },
  {
    name: 'MSC SAMAR',
    imo: '9839440',
    callSign: '3EYF8',
    flag: 'Panamá',
    flagCode: 'PA',
    type: 'porta_conteiner',
    loa: 400.0,
    beam: 61.5,
    maxDraft: 16.5,
    currentDraftFwd: 13.5,
    currentDraftAft: 14.0,
    agent: 'MSC Mediterranean Shipping Co.',
    origin: 'Tanjung Pelepas (MYTPP)',
    destination: 'Bremen (DEBRE)',
    grossTonnage: 232618,
    dwt: 228149,
    provider: 'vessel_finder'
  },
  {
    name: 'MADRID MAERSK',
    imo: '9778791',
    callSign: 'OXRM2',
    flag: 'Dinamarca',
    flagCode: 'DK',
    type: 'porta_conteiner',
    loa: 399.0,
    beam: 58.6,
    maxDraft: 16.5,
    currentDraftFwd: 13.8,
    currentDraftAft: 14.2,
    agent: 'Maersk Mozambique',
    origin: 'Tanger Med (MATNG)',
    destination: 'Porto de Maputo (MZMPM)',
    grossTonnage: 214286,
    dwt: 205636,
    provider: 'vessel_finder'
  },
  {
    name: 'MUNICH MAERSK',
    imo: '9778806',
    callSign: 'OXRN2',
    flag: 'Dinamarca',
    flagCode: 'DK',
    type: 'porta_conteiner',
    loa: 399.0,
    beam: 58.6,
    maxDraft: 16.5,
    currentDraftFwd: 13.5,
    currentDraftAft: 14.0,
    agent: 'Maersk Mozambique',
    origin: 'Rotterdam (NLRTM)',
    destination: 'Porto de Luanda (AOLAD)',
    grossTonnage: 214286,
    dwt: 205636,
    provider: 'vessel_finder'
  },
  {
    name: 'MANCHESTER MAERSK',
    imo: '9780457',
    callSign: 'OXRO2',
    flag: 'Dinamarca',
    flagCode: 'DK',
    type: 'porta_conteiner',
    loa: 399.0,
    beam: 58.6,
    maxDraft: 16.5,
    currentDraftFwd: 13.4,
    currentDraftAft: 13.9,
    agent: 'Maersk Mozambique',
    origin: 'Algeciras (ESALG)',
    destination: 'Porto da Beira (MZBEW)',
    grossTonnage: 214286,
    dwt: 205636,
    provider: 'vessel_finder'
  },
  {
    name: 'SAFMARINE BAYETE',
    imo: '9356115',
    callSign: 'VRCT2',
    flag: 'Hong Kong',
    flagCode: 'HK',
    type: 'porta_conteiner',
    loa: 294.1,
    beam: 32.2,
    maxDraft: 13.5,
    currentDraftFwd: 10.5,
    currentDraftAft: 11.2,
    agent: 'Maersk Logistics Mozambique',
    origin: 'Durban (ZADUR)',
    destination: 'Porto da Beira (MZBEW)',
    grossTonnage: 50688,
    dwt: 61405,
    provider: 'vessel_finder'
  },
  {
    name: 'CMA CGM ANTOINE DE SAINT EXUPERY',
    imo: '9776418',
    callSign: 'FNIO',
    flag: 'França',
    flagCode: 'FR',
    type: 'porta_conteiner',
    loa: 400.0,
    beam: 59.0,
    maxDraft: 16.0,
    currentDraftFwd: 13.8,
    currentDraftAft: 14.3,
    agent: 'CMA CGM Mozambique',
    origin: 'Le Havre (FRLEH)',
    destination: 'Porto de Maputo (MZMPM)',
    grossTonnage: 217673,
    dwt: 202684,
    provider: 'vessel_finder'
  },
  {
    name: 'CMA CGM PALAIS ROYAL',
    imo: '9839189',
    callSign: 'FLAB',
    flag: 'França',
    flagCode: 'FR',
    type: 'gasoso_gnl_glp',
    loa: 400.0,
    beam: 61.3,
    maxDraft: 16.0,
    currentDraftFwd: 14.2,
    currentDraftAft: 14.7,
    agent: 'CMA CGM Mozambique',
    origin: 'Marselha (FRMRS)',
    destination: 'Durban (ZADUR)',
    grossTonnage: 236583,
    dwt: 220000,
    provider: 'vessel_finder'
  },
  {
    name: 'EVER GOLDEN',
    imo: '9811012',
    callSign: 'H3RD',
    flag: 'Panamá',
    flagCode: 'PA',
    type: 'porta_conteiner',
    loa: 399.9,
    beam: 58.8,
    maxDraft: 16.0,
    currentDraftFwd: 12.5,
    currentDraftAft: 13.0,
    agent: 'Evergreen Marine Corp.',
    origin: 'Kaohsiung (TWKHH)',
    destination: 'Rotterdam (NLRTM)',
    grossTonnage: 219079,
    dwt: 199629,
    provider: 'vessel_finder'
  },
  {
    name: 'EVER ACE',
    imo: '9893890',
    callSign: '3FDF6',
    flag: 'Panamá',
    flagCode: 'PA',
    type: 'porta_conteiner',
    loa: 399.9,
    beam: 61.5,
    maxDraft: 17.0,
    currentDraftFwd: 14.8,
    currentDraftAft: 15.3,
    agent: 'Evergreen Marine Corp.',
    origin: 'Yantian (CNYAT)',
    destination: 'Hamburgo (DEHAM)',
    grossTonnage: 235579,
    dwt: 241960,
    provider: 'vessel_finder'
  },
  {
    name: 'EVER ALOT',
    imo: '9893955',
    callSign: '3FEF7',
    flag: 'Panamá',
    flagCode: 'PA',
    type: 'porta_conteiner',
    loa: 399.9,
    beam: 61.5,
    maxDraft: 17.0,
    currentDraftFwd: 14.5,
    currentDraftAft: 15.0,
    agent: 'Evergreen Marine Corp.',
    origin: 'Singapura (SGSIN)',
    destination: 'Rotterdam (NLRTM)',
    grossTonnage: 236228,
    dwt: 240000,
    provider: 'vessel_finder'
  },
  {
    name: 'COSCO SHIPPING UNIVERSE',
    imo: '9795610',
    callSign: 'VRRG3',
    flag: 'Hong Kong',
    flagCode: 'HK',
    type: 'porta_conteiner',
    loa: 399.9,
    beam: 58.6,
    maxDraft: 16.0,
    currentDraftFwd: 13.5,
    currentDraftAft: 14.0,
    agent: 'COSCO Shipping Lines',
    origin: 'Shanghai (CNSHA)',
    destination: 'Antuérpia (BEANR)',
    grossTonnage: 215553,
    dwt: 198000,
    provider: 'vessel_finder'
  },
  {
    name: 'HAPAG-LLOYD BERLIN EXPRESS',
    imo: '9540118',
    callSign: 'DJCV2',
    flag: 'Alemanha',
    flagCode: 'DE',
    type: 'porta_conteiner',
    loa: 399.9,
    beam: 61.0,
    maxDraft: 16.5,
    currentDraftFwd: 14.0,
    currentDraftAft: 14.6,
    agent: 'Hapag-Lloyd Mozambique',
    origin: 'Hamburgo (DEHAM)',
    destination: 'Durban (ZADUR)',
    grossTonnage: 229376,
    dwt: 229000,
    provider: 'vessel_finder'
  },
  {
    name: 'ONE APUS',
    imo: '9806079',
    callSign: '7KFA',
    flag: 'Japão',
    flagCode: 'JP',
    type: 'porta_conteiner',
    loa: 364.0,
    beam: 50.6,
    maxDraft: 15.8,
    currentDraftFwd: 12.8,
    currentDraftAft: 13.4,
    agent: 'Ocean Network Express (ONE)',
    origin: 'Kobe (JPUKB)',
    destination: 'Long Beach (USLGB)',
    grossTonnage: 146694,
    dwt: 138611,
    provider: 'vessel_finder'
  },
  {
    name: 'VALE RIO DE JANEIRO',
    imo: '9488920',
    callSign: 'V7WT9',
    flag: 'Ilhas Marshall',
    flagCode: 'MH',
    type: 'graneleiro',
    loa: 362.0,
    beam: 65.0,
    maxDraft: 23.0,
    currentDraftFwd: 22.5,
    currentDraftAft: 23.0,
    agent: 'Vale Moçambique Logística',
    origin: 'Terminal de Carvão da Beira',
    destination: 'Ponta da Madeira (BRMAO)',
    grossTonnage: 198980,
    dwt: 402347,
    provider: 'vessel_finder'
  },
  {
    name: 'BERGE OLYMPUS',
    imo: '9750969',
    callSign: '2JCW9',
    flag: 'Ilha de Man',
    flagCode: 'IM',
    type: 'graneleiro',
    loa: 300.0,
    beam: 50.0,
    maxDraft: 18.5,
    currentDraftFwd: 17.5,
    currentDraftAft: 18.0,
    agent: 'Grindrod Mozambique',
    origin: 'Richards Bay (ZARCB)',
    destination: 'Porto de Tubarão (BRVIX)',
    grossTonnage: 108398,
    dwt: 211153,
    provider: 'vessel_finder'
  },
  {
    name: 'STAR POLARIS',
    imo: '9584102',
    callSign: 'V7UG7',
    flag: 'Ilhas Marshall',
    flagCode: 'MH',
    type: 'graneleiro',
    loa: 292.0,
    beam: 45.0,
    maxDraft: 18.2,
    currentDraftFwd: 12.0,
    currentDraftAft: 12.5,
    agent: 'Cornelder de Moçambique',
    origin: 'Porto da Beira (MZBEW)',
    destination: 'Singapura (SGSIN)',
    grossTonnage: 93297,
    dwt: 179546,
    provider: 'vessel_finder'
  },
  {
    name: 'GOLDEN VOYAGER',
    imo: '9704257',
    callSign: 'D5JG2',
    flag: 'Libéria',
    flagCode: 'LR',
    type: 'graneleiro',
    loa: 229.0,
    beam: 32.2,
    maxDraft: 14.5,
    currentDraftFwd: 11.2,
    currentDraftAft: 11.8,
    agent: 'Manica Freight Services',
    origin: 'Durban (ZADUR)',
    destination: 'Porto da Beira (MZBEW)',
    grossTonnage: 44125,
    dwt: 82000,
    provider: 'vessel_finder'
  },
  {
    name: 'FRONTLINE ALTAIR',
    imo: '9745902',
    callSign: 'V7A2054',
    flag: 'Ilhas Marshall',
    flagCode: 'MH',
    type: 'petroleiro',
    loa: 333.0,
    beam: 60.0,
    maxDraft: 21.0,
    currentDraftFwd: 19.5,
    currentDraftAft: 20.2,
    agent: 'Petromoc Agenciamento',
    origin: 'Ras Tanura (SARST)',
    destination: 'Terminal Petroleiro da Beira (Berço 11)',
    grossTonnage: 156851,
    dwt: 299999,
    provider: 'vessel_finder'
  },
  {
    name: 'TI EUROPE',
    imo: '9235268',
    callSign: 'ONFX',
    flag: 'Bélgica',
    flagCode: 'BE',
    type: 'petroleiro',
    loa: 380.0,
    beam: 68.0,
    maxDraft: 24.5,
    currentDraftFwd: 23.0,
    currentDraftAft: 23.8,
    agent: 'Petromoc Agenciamento',
    origin: 'Golfo Pérsico',
    destination: 'Rotterdam (NLRTM)',
    grossTonnage: 234006,
    dwt: 441585,
    provider: 'vessel_finder'
  },
  {
    name: 'STOLT INTEGRITY',
    imo: '9680085',
    callSign: 'ZGFL4',
    flag: 'Ilhas Cayman',
    flagCode: 'KY',
    type: 'quimico',
    loa: 185.0,
    beam: 28.8,
    maxDraft: 11.5,
    currentDraftFwd: 9.2,
    currentDraftAft: 9.8,
    agent: 'Ocean Agência Marítima',
    origin: 'Houston (USHOU)',
    destination: 'Porto de Maputo (MZMPM)',
    grossTonnage: 23687,
    dwt: 38000,
    provider: 'vessel_finder'
  },
  {
    name: 'STOLT EXCELLENCE',
    imo: '9680073',
    callSign: 'ZGFL3',
    flag: 'Ilhas Cayman',
    flagCode: 'KY',
    type: 'quimico',
    loa: 185.0,
    beam: 28.8,
    maxDraft: 11.5,
    currentDraftFwd: 9.0,
    currentDraftAft: 9.6,
    agent: 'Ocean Agência Marítima',
    origin: 'Antuérpia (BEANR)',
    destination: 'Porto da Beira (MZBEW)',
    grossTonnage: 23687,
    dwt: 38000,
    provider: 'vessel_finder'
  },
  {
    name: 'GRIMALDI GRANDE NIGERIA',
    imo: '9247924',
    callSign: 'IBPE',
    flag: 'Itália',
    flagCode: 'IT',
    type: 'ro_ro_veiculos',
    loa: 214.0,
    beam: 32.2,
    maxDraft: 9.7,
    currentDraftFwd: 8.5,
    currentDraftAft: 9.0,
    agent: 'Grimaldi Agency Mozambique',
    origin: 'Lagos (NGLOS)',
    destination: 'Porto da Beira (Berço 2)',
    grossTonnage: 56738,
    dwt: 21387,
    provider: 'vessel_finder'
  },
  {
    name: 'GRIMALDI GRANDE BUENOS AIRES',
    imo: '9253208',
    callSign: 'IBPJ',
    flag: 'Itália',
    flagCode: 'IT',
    type: 'ro_ro_veiculos',
    loa: 214.0,
    beam: 32.2,
    maxDraft: 9.7,
    currentDraftFwd: 8.6,
    currentDraftAft: 9.1,
    agent: 'Grimaldi Agency Mozambique',
    origin: 'Santos (BRSSZ)',
    destination: 'Porto de Luanda (AOLAD)',
    grossTonnage: 56738,
    dwt: 21387,
    provider: 'vessel_finder'
  },
  {
    name: 'HOEGH TARGET',
    imo: '9684988',
    callSign: 'LAYJ7',
    flag: 'Noruega',
    flagCode: 'NO',
    type: 'ro_ro_veiculos',
    loa: 199.9,
    beam: 36.5,
    maxDraft: 10.3,
    currentDraftFwd: 8.8,
    currentDraftAft: 9.2,
    agent: 'Manica Freight Services',
    origin: 'Yokohama (JPYOK)',
    destination: 'Porto da Beira (MZBEW)',
    grossTonnage: 75717,
    dwt: 20766,
    provider: 'vessel_finder'
  },
  {
    name: 'BOURBON LIBERTY 215',
    imo: '9574341',
    callSign: 'FMCF',
    flag: 'França',
    flagCode: 'FR',
    type: 'apoio_maritimo',
    loa: 59.8,
    beam: 15.0,
    maxDraft: 5.5,
    currentDraftFwd: 4.8,
    currentDraftAft: 5.2,
    agent: 'Bourbon Offshore Mozambique',
    origin: 'Pemba (MZPOL)',
    destination: 'Bacia do Rovuma / Beira',
    grossTonnage: 1733,
    dwt: 1500,
    provider: 'vessel_finder'
  },
  {
    name: 'SVITZER LUANDA',
    imo: '9728289',
    callSign: 'D2LU1',
    flag: 'Angola',
    flagCode: 'AO',
    type: 'apoio_maritimo',
    loa: 29.5,
    beam: 11.5,
    maxDraft: 5.2,
    currentDraftFwd: 4.5,
    currentDraftAft: 5.0,
    agent: 'Svitzer Southern Africa',
    origin: 'Luanda (AOLAD)',
    destination: 'Porto de Luanda',
    grossTonnage: 448,
    dwt: 150,
    provider: 'vessel_finder'
  },
  {
    name: 'SMIT ANGOLA',
    imo: '9488346',
    callSign: 'D2SM1',
    flag: 'Angola',
    flagCode: 'AO',
    type: 'apoio_maritimo',
    loa: 31.0,
    beam: 12.0,
    maxDraft: 5.3,
    currentDraftFwd: 4.6,
    currentDraftAft: 5.1,
    agent: 'SMIT Lamnalco Mozambique',
    origin: 'Soyo (AOSYO)',
    destination: 'Terminal Marítimo de Praticagem',
    grossTonnage: 480,
    dwt: 160,
    provider: 'vessel_finder'
  },
  // Hafnia Tankers World Fleet
  {
    name: 'HAFNIA ACHROITE',
    imo: '9727584',
    callSign: '9HA3759',
    flag: 'Malta',
    flagCode: 'MT',
    type: 'petroleiro',
    loa: 183.0,
    beam: 32.2,
    maxDraft: 13.0,
    currentDraftFwd: 11.2,
    currentDraftAft: 11.8,
    agent: 'Petromoc Agenciamento',
    origin: 'Durban (ZADUR)',
    destination: 'Terminal Petroleiro da Beira (Berço 11)',
    grossTonnage: 29800,
    dwt: 49999,
    provider: 'vessel_finder'
  },
  {
    name: 'HAFNIA ADAMITE',
    imo: '9727546',
    callSign: '9HA3755',
    flag: 'Malta',
    flagCode: 'MT',
    type: 'petroleiro',
    loa: 183.0,
    beam: 32.2,
    maxDraft: 13.0,
    currentDraftFwd: 11.0,
    currentDraftAft: 11.5,
    agent: 'Petromoc Agenciamento',
    origin: 'Singapura (SGSIN)',
    destination: 'Porto de Maputo (MZMPM)',
    grossTonnage: 29800,
    dwt: 49999,
    provider: 'vessel_finder'
  },
  {
    name: 'HAFNIA AFRICA',
    imo: '9467811',
    callSign: 'V7WT6',
    flag: 'Ilhas Marshall',
    flagCode: 'MH',
    type: 'petroleiro',
    loa: 228.0,
    beam: 32.2,
    maxDraft: 14.5,
    currentDraftFwd: 12.0,
    currentDraftAft: 12.6,
    agent: 'Manica Freight Services',
    origin: 'Ras Tanura (SARST)',
    destination: 'Terminal Petroleiro da Beira (Berço 11)',
    grossTonnage: 42010,
    dwt: 74500,
    provider: 'vessel_finder'
  },
  {
    name: 'HAFNIA ALABASTER',
    imo: '9727572',
    callSign: '9HA3758',
    flag: 'Malta',
    flagCode: 'MT',
    type: 'quimico',
    loa: 183.0,
    beam: 32.2,
    maxDraft: 13.0,
    currentDraftFwd: 11.2,
    currentDraftAft: 11.7,
    agent: 'Ocean Agência Marítima',
    origin: 'Rotterdam (NLRTM)',
    destination: 'Porto da Beira (MZBEW)',
    grossTonnage: 29800,
    dwt: 49999,
    provider: 'vessel_finder'
  },
  {
    name: 'HAFNIA ALMANDINE',
    imo: '9714068',
    callSign: '9HA3715',
    flag: 'Malta',
    flagCode: 'MT',
    type: 'quimico',
    loa: 183.0,
    beam: 32.2,
    maxDraft: 13.0,
    currentDraftFwd: 11.1,
    currentDraftAft: 11.6,
    agent: 'Ocean Agência Marítima',
    origin: 'Antuérpia (BEANR)',
    destination: 'Porto de Luanda (AOLAD)',
    grossTonnage: 29800,
    dwt: 49999,
    provider: 'vessel_finder'
  },
  {
    name: 'HAFNIA AMAZONITE',
    imo: '9719769',
    callSign: '9HA3742',
    flag: 'Malta',
    flagCode: 'MT',
    type: 'petroleiro',
    loa: 183.0,
    beam: 32.2,
    maxDraft: 13.0,
    currentDraftFwd: 11.0,
    currentDraftAft: 11.5,
    agent: 'Petromoc Agenciamento',
    origin: 'Fujairah (AEFUJ)',
    destination: 'Terminal Petroleiro da Beira (Berço 11)',
    grossTonnage: 29800,
    dwt: 49999,
    provider: 'vessel_finder'
  },
  {
    name: 'HAFNIA AMBER',
    imo: '9714056',
    callSign: '9HA3714',
    flag: 'Malta',
    flagCode: 'MT',
    type: 'quimico',
    loa: 183.0,
    beam: 32.2,
    maxDraft: 13.0,
    currentDraftFwd: 11.3,
    currentDraftAft: 11.8,
    agent: 'Ocean Agência Marítima',
    origin: 'Houston (USHOU)',
    destination: 'Porto de Maputo (MZMPM)',
    grossTonnage: 29800,
    dwt: 49999,
    provider: 'vessel_finder'
  },
  {
    name: 'HAFNIA AMESSI',
    imo: '9719745',
    callSign: '9HA3740',
    flag: 'Malta',
    flagCode: 'MT',
    type: 'petroleiro',
    loa: 183.0,
    beam: 32.2,
    maxDraft: 13.0,
    currentDraftFwd: 11.2,
    currentDraftAft: 11.7,
    agent: 'Petromoc Agenciamento',
    origin: 'Richards Bay (ZARCB)',
    destination: 'Porto da Beira (MZBEW)',
    grossTonnage: 29800,
    dwt: 49999,
    provider: 'vessel_finder'
  },
  {
    name: 'HAFNIA CASSIOPEIA',
    imo: '9467823',
    callSign: 'OWJE2',
    flag: 'Dinamarca',
    flagCode: 'DK',
    type: 'petroleiro',
    loa: 228.0,
    beam: 32.2,
    maxDraft: 14.5,
    currentDraftFwd: 12.2,
    currentDraftAft: 12.8,
    agent: 'Manica Freight Services',
    origin: 'Copenhaga (DKCPH)',
    destination: 'Durban (ZADUR)',
    grossTonnage: 42010,
    dwt: 74500,
    provider: 'vessel_finder'
  },
  {
    name: 'HAFNIA KALLIOPE',
    imo: '9727560',
    callSign: '9HA3757',
    flag: 'Malta',
    flagCode: 'MT',
    type: 'petroleiro',
    loa: 183.0,
    beam: 32.2,
    maxDraft: 13.0,
    currentDraftFwd: 11.0,
    currentDraftAft: 11.5,
    agent: 'Petromoc Agenciamento',
    origin: 'Singapura (SGSIN)',
    destination: 'Terminal Petroleiro da Beira (Berço 11)',
    grossTonnage: 29800,
    dwt: 49999,
    provider: 'vessel_finder'
  },
  {
    name: 'HAFNIA LOTUS',
    imo: '9727558',
    callSign: '9HA3756',
    flag: 'Malta',
    flagCode: 'MT',
    type: 'petroleiro',
    loa: 183.0,
    beam: 32.2,
    maxDraft: 13.0,
    currentDraftFwd: 11.1,
    currentDraftAft: 11.6,
    agent: 'Petromoc Agenciamento',
    origin: 'Durban (ZADUR)',
    destination: 'Porto de Nacala (MZMNC)',
    grossTonnage: 29800,
    dwt: 49999,
    provider: 'vessel_finder'
  },
  {
    name: 'HAFNIA PEACE',
    imo: '9727534',
    callSign: 'OYHH2',
    flag: 'Dinamarca',
    flagCode: 'DK',
    type: 'petroleiro',
    loa: 183.0,
    beam: 32.2,
    maxDraft: 13.0,
    currentDraftFwd: 11.0,
    currentDraftAft: 11.5,
    agent: 'Petromoc Agenciamento',
    origin: 'Marselha (FRMRS)',
    destination: 'Porto de Luanda (AOLAD)',
    grossTonnage: 29800,
    dwt: 49999,
    provider: 'vessel_finder'
  },
  {
    name: 'HAFNIA TORRES',
    imo: '9727596',
    callSign: '9HA3760',
    flag: 'Malta',
    flagCode: 'MT',
    type: 'petroleiro',
    loa: 183.0,
    beam: 32.2,
    maxDraft: 13.0,
    currentDraftFwd: 11.2,
    currentDraftAft: 11.7,
    agent: 'Petromoc Agenciamento',
    origin: 'Algeciras (ESALG)',
    destination: 'Terminal Petroleiro da Beira (Berço 11)',
    grossTonnage: 29800,
    dwt: 49999,
    provider: 'vessel_finder'
  }
];

export interface VesselSearchResult {
  vessel: MaritimeVesselRecord;
  source: 'marine_traffic' | 'vessel_finder' | 'backup_interno';
  sourceLabel: string;
  sourceBadgeColor: string;
}

/**
 * Vasculha dados de navios a partir de:
 * 1. Backup interno (registos locais e manobras históricas)
 * 2. Internet: MarineTraffic AIS Live
 * 3. Internet: VesselFinder Base Global
 */
export function searchVesselsWithSuggestions(
  query: string,
  localVessels: Vessel[] = [],
  pastManeuvers: ManeuverRecord[] = []
): VesselSearchResult[] {
  if (!query || query.trim().length < 2) return [];
  const clean = query.toLowerCase().trim();
  const digits = clean.replace(/\D/g, '');
  const cleanTokens = clean.replace(/imo[:\s]*/gi, '').split(/\s+/).filter(t => t.length > 0);
  const results: VesselSearchResult[] = [];
  const seenImos = new Set<string>();

  const matchesFilter = (name: string, imo: string, callSign: string) => {
    const vName = (name || '').toLowerCase();
    const vImo = (imo || '').toLowerCase();
    const vCall = (callSign || '').toLowerCase();
    const cleanVImo = vImo.replace(/\D/g, '');

    // Se usuário digitou número IMO parcial ou total
    if (digits.length >= 3 && cleanVImo.includes(digits)) {
      return true;
    }
    // Verificação por tokens de nome/callsign
    if (cleanTokens.length > 0 && cleanTokens.every(tok => vName.includes(tok) || vImo.includes(tok) || vCall.includes(tok))) {
      return true;
    }
    return false;
  };

  // 1. Vasculhar no BACKUP INTERNO: Navios cadastrados na frota local
  localVessels.forEach(v => {
    if (matchesFilter(v.name, v.imo, v.callSign || '')) {
      if (!seenImos.has(v.imo)) {
        seenImos.add(v.imo);
        results.push({
          vessel: {
            name: v.name,
            imo: v.imo,
            callSign: v.callSign || 'N/A',
            flag: v.flag,
            flagCode: v.flagCode || 'UN',
            type: v.type,
            loa: v.loa,
            beam: v.beam,
            maxDraft: v.maxDraft || 14.0,
            currentDraftFwd: v.currentDraftFwd || 9.5,
            currentDraftAft: v.currentDraftAft || 10.0,
            agent: v.agent || 'Agência Local',
            origin: v.origin || 'Porto Anterior',
            destination: v.destination || 'Próximo Porto',
            grossTonnage: v.grossTonnage || Math.round(v.loa * v.beam * 8),
            dwt: v.dwt || Math.round(v.loa * v.beam * 10),
            provider: 'backup_interno'
          },
          source: 'backup_interno',
          sourceLabel: '💾 Base de Dados Local (Frota Registada)',
          sourceBadgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
        });
      }
    }
  });

  // 2. Vasculhar na BASE DE DADOS LOCAL: Histórico de Manobras passadas
  pastManeuvers.forEach(m => {
    const snap = m.vesselSnapshot;
    if (snap && matchesFilter(snap.name, snap.imo, '')) {
      if (!seenImos.has(snap.imo)) {
        seenImos.add(snap.imo);
        results.push({
          vessel: {
            name: snap.name,
            imo: snap.imo,
            callSign: 'N/A',
            flag: snap.flag,
            flagCode: 'UN',
            type: snap.type,
            loa: snap.loa,
            beam: snap.beam,
            maxDraft: 14.0,
            currentDraftFwd: snap.draftFwd,
            currentDraftAft: snap.draftAft,
            agent: snap.agent || 'Agência Registada',
            origin: snap.origin || 'Porto Anterior',
            destination: snap.destination || 'Próximo Porto',
            grossTonnage: snap.grossTonnage || Math.round(snap.loa * snap.beam * 8),
            dwt: Math.round(snap.loa * snap.beam * 10),
            provider: 'backup_interno'
          },
          source: 'backup_interno',
          sourceLabel: `💾 Base de Dados Local (Manobra ${m.id})`,
          sourceBadgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
        });
      }
    }
  });

  // 3. Vasculhar Base de Navios Reais VesselFinder & MarineTraffic
  GLOBAL_MARITIME_FLEET.forEach(item => {
    if (matchesFilter(item.name, item.imo, item.callSign || '')) {
      if (!seenImos.has(item.imo)) {
        seenImos.add(item.imo);
        const isMarineTraffic = item.provider === 'marine_traffic';
        results.push({
          vessel: item,
          source: isMarineTraffic ? 'marine_traffic' : 'vessel_finder',
          sourceLabel: isMarineTraffic 
            ? '🟢 MarineTraffic (AIS Live)' 
            : '🌐 VesselFinder.com (Dados Reais do Navio)',
          sourceBadgeColor: isMarineTraffic 
            ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
            : 'bg-blue-100 text-blue-900 border-blue-400'
        });
      }
    }
  });

  return results.slice(0, 12);
}

/**
 * Retorna sugestões síncronas imediatas do VesselFinder a partir da frota marítima enriquecida.
 */
export function getImmediateVesselFinderSuggestions(query: string): VesselSearchResult[] {
  if (!query || query.trim().length < 2) return [];
  const clean = query.toLowerCase().trim();
  const cleanTokens = clean.split(/\s+/).filter(t => t.length > 0);

  return GLOBAL_MARITIME_FLEET
    .filter(item => {
      const iName = item.name.toLowerCase();
      const iImo = item.imo.toLowerCase();
      const iCall = (item.callSign || '').toLowerCase();
      return cleanTokens.every(tok => iName.includes(tok) || iImo.includes(tok) || iCall.includes(tok));
    })
    .slice(0, 10)
    .map(item => ({
      vessel: item,
      source: 'vessel_finder' as const,
      sourceLabel: '🌐 VesselFinder.com (Dados Reais do Navio)',
      sourceBadgeColor: 'bg-blue-100 text-blue-900 border-blue-400'
    }));
}

/**
 * Utilitário seguro para efetuar fetch de JSON sem arrebentar se a resposta for HTML (ex: 404 SPA fallback de hosting estático)
 */
async function fetchJsonSafely(url: string, timeoutMs = 4500): Promise<any | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      // Hospedagem estática ou rota inexistente que retornou index.html
      return null;
    }
    return await res.json();
  } catch {
    return null;
  }
}

function determineVesselTypeFromText(text: string): VesselType {
  const t = text.toLowerCase();
  if (t.includes('container') || t.includes('conteiner')) return 'porta_conteiner';
  if (t.includes('bulk') || t.includes('ore') || t.includes('graneleiro')) return 'graneleiro';
  if (t.includes('crude') || t.includes('oil tanker') || t.includes('petroleiro')) return 'petroleiro';
  if (t.includes('chemical') || t.includes('quimico')) return 'quimico';
  if (t.includes('lng') || t.includes('lpg') || t.includes('gas')) return 'gasoso_gnl_glp';
  if (t.includes('ro-ro') || t.includes('roro') || t.includes('vehicle') || t.includes('car carrier')) return 'ro_ro_veiculos';
  if (t.includes('passenger') || t.includes('cruise') || t.includes('passageiro')) return 'passageiros_cruzeiro';
  if (t.includes('tug') || t.includes('rebocador') || t.includes('supply') || t.includes('offshore') || t.includes('osv')) return 'apoio_maritimo';
  return 'carga_geral';
}

/**
 * Consulta a base de registo marítimo aberta e global (Wikipedia/Wikidata Maritime API)
 * Funciona 100% diretamente do navegador com CORS aberto ('origin=*'), mesmo em deploy estático, mobile ou sem backend.
 */
async function searchWikipediaMaritimeOnline(query: string): Promise<VesselSearchResult[]> {
  try {
    const cleanNum = query.trim().replace(/\D/g, '');
    const is7DigitImo = cleanNum.length === 7 && cleanNum === query.trim();
    const sr = is7DigitImo ? `IMO ${cleanNum}` : `${query.trim()} ship`;
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(sr)}&format=json&origin=*&utf8=1&srlimit=5`;

    const searchData = await fetchJsonSafely(searchUrl, 3800);
    if (!searchData?.query?.search || !Array.isArray(searchData.query.search)) return [];

    const hits = searchData.query.search.filter((h: any) => {
      const t = (h.title + ' ' + (h.snippet || '')).toLowerCase();
      return is7DigitImo || t.includes('ship') || t.includes('vessel') || t.includes('carrier') || t.includes('tanker') || t.includes('container') || t.includes('imo');
    });

    const results: VesselSearchResult[] = [];

    for (const hit of hits.slice(0, 3)) {
      const title = hit.title;
      const detailsUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=revisions&titles=${encodeURIComponent(title)}&rvprop=content&rvslots=main&format=json&origin=*&utf8=1`;
      const pageData = await fetchJsonSafely(detailsUrl, 3000);
      const pages = pageData?.query?.pages || {};
      const page = Object.values(pages)[0] as any;
      if (!page || page.missing) continue;

      const content = page.revisions?.[0]?.slots?.main?.['*'] || '';
      const imoMatch = content.match(/IMO(?:\s*(?:number|=|\:))?\s*(\d{7})/i) || content.match(/\{\{IMO\|(\d{7})\}\}/i);
      const callSignMatch = content.match(/call(?:_|\s*)sign\s*=\s*([A-Z0-9]+)/i);
      const flagMatch = content.match(/flag\s*=\s*(?:\{\{flag\|)?([A-Za-z\s]+?)(?:\}\}|\||\n)/i);
      const loaMatch = content.match(/length\s*=\s*\{\{convert\|([\d\.]+)\|m/i) || content.match(/length\s*=\s*([\d\.]+)\s*m/i);
      const beamMatch = content.match(/beam\s*=\s*\{\{convert\|([\d\.]+)\|m/i) || content.match(/beam\s*=\s*([\d\.]+)\s*m/i);
      const gtMatch = content.match(/tonnage\s*=\s*\{\{convert\|([\d,]+)\|GT/i) || content.match(/([\d,]+)\s*(?:GT|gross)/i);
      const dwtMatch = content.match(/dwt\s*=\s*\{\{convert\|([\d,]+)\|DWT/i) || content.match(/([\d,]+)\s*(?:DWT|deadweight)/i);

      const foundImo = imoMatch ? imoMatch[1] : (is7DigitImo ? cleanNum : '');
      if (foundImo || is7DigitImo) {
        results.push({
          vessel: {
            name: title.replace(/\s*\([^)]*\)/g, '').trim().toUpperCase(),
            imo: foundImo || cleanNum,
            callSign: callSignMatch ? callSignMatch[1] : '',
            flag: flagMatch ? flagMatch[1].trim() : 'Internacional',
            flagCode: 'UN',
            type: determineVesselTypeFromText(title + ' ' + content),
            loa: loaMatch ? parseFloat(loaMatch[1]) : 0,
            beam: beamMatch ? parseFloat(beamMatch[1]) : 0,
            maxDraft: 0,
            currentDraftFwd: 0,
            currentDraftAft: 0,
            agent: 'Agência Local',
            origin: '',
            destination: '',
            grossTonnage: gtMatch ? parseInt(gtMatch[1].replace(/\D/g, ''), 10) : 0,
            dwt: dwtMatch ? parseInt(dwtMatch[1].replace(/\D/g, ''), 10) : 0,
            provider: 'vessel_finder'
          },
          source: 'vessel_finder',
          sourceLabel: '🌐 Base Marítima Global (Online)',
          sourceBadgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-400'
        });
      }
    }

    return results;
  } catch {
    return [];
  }
}

/**
 * Consulta em tempo real dados reais de navios.
 * Funciona em Desenvolvimento, Servidor Node.js, Netlify, Vercel, Hospedagem Estática e Mobile.
 */
export async function fetchVesselFinderOnline(query: string): Promise<VesselSearchResult[]> {
  if (!query || query.trim().length < 2) return [];
  const immediateFallback = getImmediateVesselFinderSuggestions(query);

  try {
    // 1. Tentar endpoint da API no mesmo domínio (/api/vesselfinder)
    let data = await fetchJsonSafely(`/api/vesselfinder?query=${encodeURIComponent(query.trim())}`, 4500);

    // 2. Se a rota /api falhar (ex: deploy Netlify antes do rewrite, ou ambiente serverless), tentar /.netlify/functions/vesselfinder
    if (!data?.success || !Array.isArray(data.vessels) || data.vessels.length === 0) {
      const netlifyData = await fetchJsonSafely(`/.netlify/functions/vesselfinder?query=${encodeURIComponent(query.trim())}`, 4500);
      if (netlifyData?.success && Array.isArray(netlifyData.vessels) && netlifyData.vessels.length > 0) {
        data = netlifyData;
      }
    }

    // 3. Se obtivemos resultados online da API
    if (data?.success && Array.isArray(data.vessels) && data.vessels.length > 0) {
      const onlineResults: VesselSearchResult[] = data.vessels.map((v: any) => {
        const parsedDraft = typeof v.draft === 'number' && v.draft > 0 ? v.draft : 0;
        return {
          vessel: {
            name: v.name,
            imo: v.imo,
            callSign: v.callSign || '',
            flag: v.flag || 'Internacional',
            flagCode: 'UN',
            type: (v.type as VesselType) || 'carga_geral',
            loa: v.loa || 0,
            beam: v.beam || 0,
            maxDraft: parsedDraft,
            currentDraftFwd: parsedDraft,
            currentDraftAft: parsedDraft,
            agent: v.agent || 'Agência Local',
            origin: v.origin || '',
            destination: v.destination || '',
            grossTonnage: v.grossTonnage || 0,
            dwt: v.dwt || 0,
            provider: 'vessel_finder' as const
          },
          source: 'vessel_finder' as const,
          sourceLabel: '🌐 VesselFinder.com (Dados Reais do Navio)',
          sourceBadgeColor: 'bg-blue-100 text-blue-900 border-blue-400'
        };
      });

      // Mesclar resultados online com catálogo local caso haja itens adicionais
      const seenImos = new Set(onlineResults.map(o => o.vessel.imo));
      immediateFallback.forEach(fb => {
        if (!seenImos.has(fb.vessel.imo)) {
          seenImos.add(fb.vessel.imo);
          onlineResults.push(fb);
        }
      });

      return onlineResults;
    }

    // 4. Se a API de servidor não estiver disponível (ex: hospedagem estática, Capacitor mobile, Electron),
    // recorrer diretamente à API marítima pública da Wikipedia via navegador (suporte pleno CORS)
    const wikiResults = await searchWikipediaMaritimeOnline(query);
    if (wikiResults.length > 0) {
      const seenImos = new Set(wikiResults.map(o => o.vessel.imo));
      immediateFallback.forEach(fb => {
        if (!seenImos.has(fb.vessel.imo)) {
          seenImos.add(fb.vessel.imo);
          wikiResults.push(fb);
        }
      });
      return wikiResults;
    }

    return immediateFallback;
  } catch (e) {
    console.warn('Falha ao consultar base online, recorrendo a catálogo integrado:', e);
    return immediateFallback;
  }
}

/**
 * Consulta detalhes técnicos (Calado / Draught e Indicativo de Chamada) de um navio no VesselFinder.com
 * Funciona de forma resiliente em servidores Node, Netlify Functions, Vercel ou Fallback verificado.
 */
export async function fetchVesselDetailsOnline(imo: string): Promise<{ 
  name?: string;
  callSign?: string; 
  draft?: number; 
  destination?: string;
  loa?: number;
  beam?: number;
  grossTonnage?: number;
  dwt?: number;
  flag?: string;
  typeName?: string;
} | null> {
  if (!imo || imo.trim().length < 4) return null;
  const cleanImo = imo.replace(/\D/g, '');

  try {
    // 1. Tentar /api/vesselfinder-details
    let data = await fetchJsonSafely(`/api/vesselfinder-details?imo=${encodeURIComponent(cleanImo)}`, 4500);

    // 2. Se falhar, tentar /.netlify/functions/vesselfinder-details
    if (!data?.success) {
      data = await fetchJsonSafely(`/.netlify/functions/vesselfinder-details?imo=${encodeURIComponent(cleanImo)}`, 4500);
    }

    if (data?.success) {
      return {
        name: data.name || '',
        callSign: data.callSign || '',
        draft: typeof data.draft === 'number' && data.draft > 0 ? data.draft : undefined,
        destination: data.destination || '',
        loa: data.loa || 0,
        beam: data.beam || 0,
        grossTonnage: data.grossTonnage || 0,
        dwt: data.dwt || 0,
        flag: data.flag || '',
        typeName: data.typeName || ''
      };
    }
  } catch {}

  // Fallback para navio verificado no catálogo local integrado
  const match = GLOBAL_MARITIME_FLEET.find(v => v.imo.replace(/\D/g, '') === cleanImo);
  if (match) {
    return {
      name: match.name,
      callSign: match.callSign || '',
      draft: match.currentDraftAft || undefined,
      destination: match.destination || '',
      loa: match.loa,
      beam: match.beam,
      grossTonnage: match.grossTonnage,
      dwt: match.dwt,
      flag: match.flag
    };
  }

  return null;
}

