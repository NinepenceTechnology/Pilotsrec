import * as XLSX from 'xlsx';
import { ManeuverRecord, Vessel, Pilot, MaritimeAlert, PilotShift, ManeuverType, ManeuverStatus, BerthingModel } from '../types/maritime';

export interface ImportResult {
  success: boolean;
  importedCount: number;
  errors: string[];
  maneuvers: ManeuverRecord[];
}

/**
 * Exporta os registos de manobras para uma folha de cálculo Excel (.xlsx) profissional
 */
export function exportManeuversToExcel(
  maneuvers: ManeuverRecord[],
  filenamePrefix = 'Pilot_Records_Manobras'
): void {
  const wb = XLSX.utils.book_new();

  // 1. Tabela Principal: Manobras
  const maneuversData = maneuvers.map(m => ({
    'ID Manobra': m.id,
    'Data/Hora Agendada': m.scheduledTime ? new Date(m.scheduledTime).toLocaleString('pt-PT') : '',
    'Status': m.status.toUpperCase(),
    'Tipo de Manobra': m.maneuverType.toUpperCase(),
    'Navio': m.vesselSnapshot.name,
    'IMO': m.vesselSnapshot.imo,
    'Bandeira': m.vesselSnapshot.flag,
    'Tipo Navio': m.vesselSnapshot.type,
    'LOA (m)': m.vesselSnapshot.loa,
    'Boca (m)': m.vesselSnapshot.beam,
    'Calado Vante (m)': m.vesselSnapshot.draftFwd,
    'Calado Ré (m)': m.vesselSnapshot.draftAft,
    'GRT': m.vesselSnapshot.grossTonnage || '',
    'Agente Marítimo': m.vesselSnapshot.agent || '',
    'Procedência': m.vesselSnapshot.origin || '',
    'Próximo Porto': m.vesselSnapshot.destination || '',
    'Berço / Local': m.berthTo,
    'Piloto Responsável': m.pilotName,
    '2º Piloto': m.secondPilotName || '',
    'Modelo Atracação': m.berthingModel || '',
    'Primeiro Cabo': m.firstLineAshored || '',
    'Hora Desatracação': m.unmooringTime || '',
    'Hora Atracação': m.berthingTime || '',
    'Duração Registada': m.maneuverDurationFormatted || (m.durationMinutes ? `${m.durationMinutes} min` : ''),
    'Qtd Rebocadores': m.tugCount ?? m.tugs.length,
    'Arranque Rebocadores': m.tugTimings?.arranque || '',
    'Início Trab. Rebocadores': m.tugTimings?.inicio || '',
    'Fim Trab. Rebocadores': m.tugTimings?.fim || '',
    'Observações do Piloto': m.pilotRemarks || '',
    'Ocorrência / Incidente': m.incident ? m.incident.causeTitle : 'NENHUMA',
    'Data de Registo': new Date(m.createdAt).toLocaleString('pt-PT')
  }));

  const wsManeuvers = XLSX.utils.json_to_sheet(maneuversData);
  // Auto width calculation for sheets
  const colWidths = [
    { wch: 14 }, { wch: 20 }, { wch: 12 }, { wch: 16 }, { wch: 24 },
    { wch: 10 }, { wch: 14 }, { wch: 16 }, { wch: 10 }, { wch: 10 },
    { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 22 }, { wch: 20 },
    { wch: 20 }, { wch: 18 }, { wch: 22 }, { wch: 18 }, { wch: 20 },
    { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 14 },
    { wch: 18 }, { wch: 20 }, { wch: 18 }, { wch: 30 }, { wch: 22 },
    { wch: 20 }
  ];
  wsManeuvers['!cols'] = colWidths;
  XLSX.utils.book_append_sheet(wb, wsManeuvers, 'Manobras');

  // 2. Tabela Secundária: Assistência de Rebocadores
  const tugsData: Array<{
    'ID Manobra': string;
    'Navio': string;
    'Rebocador': string;
    'Tração Estática (Bollard Pull T)': number;
    'Posição Operacional': string;
    'Hora Lançamento Cabo': string;
    'Hora Largada Cabo': string;
    'Horas de Assistência': number;
  }> = [];

  maneuvers.forEach(m => {
    m.tugs.forEach(t => {
      tugsData.push({
        'ID Manobra': m.id,
        'Navio': m.vesselSnapshot.name,
        'Rebocador': t.tugName,
        'Tração Estática (Bollard Pull T)': t.bollardPullTons,
        'Posição Operacional': t.position.toUpperCase(),
        'Hora Lançamento Cabo': t.linePassedTime || '',
        'Hora Largada Cabo': t.lineReleasedTime || '',
        'Horas de Assistência': t.hoursAssisted
      });
    });
  });

  if (tugsData.length > 0) {
    const wsTugs = XLSX.utils.json_to_sheet(tugsData);
    wsTugs['!cols'] = [
      { wch: 14 }, { wch: 24 }, { wch: 22 }, { wch: 22 },
      { wch: 18 }, { wch: 20 }, { wch: 20 }, { wch: 18 }
    ];
    XLSX.utils.book_append_sheet(wb, wsTugs, 'Rebocadores');
  }

  // 3. Tabela de Ocorrências & Cancelamentos
  const incidentsData = maneuvers
    .filter(m => m.incident)
    .map(m => ({
      'ID Manobra': m.id,
      'Navio': m.vesselSnapshot.name,
      'IMO': m.vesselSnapshot.imo,
      'Data Ocorrência': m.incident?.loggedAt ? new Date(m.incident.loggedAt).toLocaleString('pt-PT') : '',
      'Causa Oficial': m.incident?.causeTitle || '',
      'Descrição Detalhada': m.incident?.description || '',
      'Atraso (Horas)': m.incident?.delayHours || 0,
      'Custo Adicional Estimado': m.incident?.estimatedExtraCost || 0,
      'Canal VHF': m.incident?.vhfChannelUsed || '',
      'Autoridade Notificada': m.incident?.reportedToAuthority ? 'SIM' : 'NÃO'
    }));

  if (incidentsData.length > 0) {
    const wsIncidents = XLSX.utils.json_to_sheet(incidentsData);
    wsIncidents['!cols'] = [
      { wch: 14 }, { wch: 24 }, { wch: 10 }, { wch: 18 },
      { wch: 24 }, { wch: 36 }, { wch: 14 }, { wch: 20 },
      { wch: 12 }, { wch: 18 }
    ];
    XLSX.utils.book_append_sheet(wb, wsIncidents, 'Ocorrências');
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${filenamePrefix}_${dateStr}.xlsx`);
}

/**
 * Importa manobras a partir de um ficheiro Excel (.xlsx / .xls)
 */
export async function importManeuversFromExcel(file: File): Promise<ImportResult> {
  const errors: string[] = [];
  const importedManeuvers: ManeuverRecord[] = [];

  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

    if (!workbook.SheetNames.length) {
      return { success: false, importedCount: 0, errors: ['O ficheiro Excel não contém folhas válidas.'], maneuvers: [] };
    }

    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (rawRows.length === 0) {
      return { success: false, importedCount: 0, errors: ['A folha do Excel está vazia.'], maneuvers: [] };
    }

    rawRows.forEach((row, index) => {
      try {
        const rowNum = index + 2; // +2 considering 1-based index and header row
        
        // Identificar campos por nomes flexíveis (português / inglês)
        const shipName = (row['Navio'] || row['Nome do Navio'] || row['Vessel'] || row['Ship'] || '').toString().trim();
        const imo = (row['IMO'] || row['Numero IMO'] || '0000000').toString().trim();
        const pilotName = (row['Piloto Responsável'] || row['Piloto'] || row['Prático Responsável'] || row['Prático'] || row['Pilot'] || 'Piloto Local').toString().trim();
        const berth = (row['Berço / Local'] || row['Berço'] || row['Berth'] || row['Cais'] || 'Cais Comercial').toString().trim();

        if (!shipName) {
          errors.push(`Linha ${rowNum}: Navio não especificado. Ignorada.`);
          return;
        }

        const id = (row['ID Manobra'] || row['ID'] || `PR-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}_${index}`).toString().trim();
        
        // Determinar status
        const rawStatus = (row['Status'] || 'concluida').toString().toLowerCase();
        let status: ManeuverStatus = 'concluida';
        if (rawStatus.includes('prog')) status = 'programada';
        else if (rawStatus.includes('curs') || rawStatus.includes('and')) status = 'em_curso';
        else if (rawStatus.includes('canc')) status = 'cancelada';

        // Determinar tipo de manobra
        const rawType = (row['Tipo de Manobra'] || row['Tipo'] || 'atracacao').toString().toLowerCase();
        let maneuverType: ManeuverType = 'atracacao';
        if (rawType.includes('desatrac')) maneuverType = 'desatracacao';
        else if (rawType.includes('puxan')) maneuverType = 'puxanca';
        else if (rawType.includes('mudan')) maneuverType = 'mudanca';
        else if (rawType.includes('fund')) maneuverType = 'fundeio';
        else if (rawType.includes('barr')) maneuverType = 'barra_entrada';

        // Data / Hora
        let scheduledTime = new Date().toISOString();
        const rawDate = row['Data/Hora Agendada'] || row['Data'] || row['Date'];
        if (rawDate) {
          const parsed = new Date(rawDate);
          if (!isNaN(parsed.getTime())) {
            scheduledTime = parsed.toISOString();
          }
        }

        const loa = parseFloat(row['LOA (m)'] || row['LOA'] || row['Comprimento'] || '180') || 180;
        const beam = parseFloat(row['Boca (m)'] || row['Boca'] || row['Beam'] || '28') || 28;
        const draftFwd = parseFloat(row['Calado Vante (m)'] || row['Calado Vante'] || '8.5') || 8.5;
        const draftAft = parseFloat(row['Calado Ré (m)'] || row['Calado Ré'] || '9.0') || 9.0;
        const flag = (row['Bandeira'] || row['Flag'] || 'Internacional').toString().trim();
        const agent = (row['Agente Marítimo'] || row['Agente'] || 'Agência Local').toString().trim();
        const origin = (row['Procedência'] || row['Origem'] || 'Porto Anterior').toString().trim();
        const destination = (row['Próximo Porto'] || row['Destino'] || 'Próximo Porto').toString().trim();
        const remarks = (row['Observações do Piloto'] || row['Observações Piloto'] || row['Observações Prático'] || row['Observações'] || row['Remarks'] || '').toString().trim();

        const firstLineAshored = (row['Primeiro Cabo'] || '').toString().trim();
        const unmooringTime = (row['Hora Desatracação'] || row['Desatracação'] || '').toString().trim();
        const berthingTime = (row['Hora Atracação'] || row['Atracação'] || '').toString().trim();
        const berthingModel = (row['Modelo Atracação'] || 'Costado Bombordo (BB)') as BerthingModel;
        const tugCount = parseInt(row['Qtd Rebocadores'] || '0', 10) || 0;

        const record: ManeuverRecord = {
          id,
          vesselId: `vsl-imp-${id}`,
          vesselSnapshot: {
            name: shipName,
            imo,
            flag,
            type: 'porta_conteiner',
            loa,
            beam,
            draftFwd,
            draftAft,
            agent,
            origin,
            destination,
            grossTonnage: Math.round(loa * beam * 8)
          },
          maneuverType,
          status,
          scheduledTime,
          berthTo: berth,
          pilotId: 'pilot-imported',
          pilotName,
          secondPilotName: (row['2º Piloto'] || row['2º Prático'] || '').toString().trim() || undefined,
          milestones: {},
          firstLineAshored: firstLineAshored || undefined,
          unmooringTime: unmooringTime || undefined,
          berthingTime: berthingTime || undefined,
          berthingModel,
          tugCount,
          tugTimings: {
            arranque: (row['Arranque Rebocadores'] || '').toString().trim() || undefined,
            inicio: (row['Início Trab. Rebocadores'] || '').toString().trim() || undefined,
            fim: (row['Fim Trab. Rebocadores'] || '').toString().trim() || undefined,
          },
          tugs: [],
          weather: {
            windSpeedKnots: 12,
            windDirection: 'NE',
            seaState: 'Calmo (1)',
            tideState: 'enchente',
            tideHeightMeters: 2.5,
            visibilityMiles: 10,
            currentKnots: 1.0,
            barometricPressureHpa: 1013,
            weatherSummary: 'Condição importada de registo arquivado.'
          },
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
          pilotRemarks: remarks || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        importedManeuvers.push(record);
      } catch (err) {
        errors.push(`Erro ao processar linha ${index + 2}: ${err instanceof Error ? err.message : String(err)}`);
      }
    });

    return {
      success: importedManeuvers.length > 0,
      importedCount: importedManeuvers.length,
      errors,
      maneuvers: importedManeuvers
    };
  } catch (err) {
    return {
      success: false,
      importedCount: 0,
      errors: [`Falha na leitura do ficheiro Excel: ${err instanceof Error ? err.message : String(err)}`],
      maneuvers: []
    };
  }
}

/**
 * Exporta Backup JSON completo do sistema (Manobras, Navios, Pilotos, Alertas)
 */
export function exportFullJsonBackup(data: {
  maneuvers: ManeuverRecord[];
  vessels: Vessel[];
  pilots: Pilot[];
  alerts?: MaritimeAlert[];
  shifts?: PilotShift[];
}): void {
  const backupObject = {
    version: '2.0.0',
    app: "Pilot's Records - Gestão de Pilotagem Portuária",
    exportedAt: new Date().toISOString(),
    statistics: {
      totalManeuvers: data.maneuvers.length,
      totalVessels: data.vessels.length,
      totalPilots: data.pilots.length,
      totalAlerts: data.alerts?.length || 0
    },
    data
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupObject, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `Pilot_Records_Backup_Completo_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Lê e valida um ficheiro de backup JSON do Pilot's Records
 */
export async function readJsonBackup(file: File): Promise<{
  success: boolean;
  data?: {
    maneuvers?: ManeuverRecord[];
    vessels?: Vessel[];
    pilots?: Pilot[];
    alerts?: MaritimeAlert[];
    shifts?: PilotShift[];
  };
  error?: string;
}> {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);

    if (parsed.data && typeof parsed.data === 'object') {
      return { success: true, data: parsed.data };
    }

    // Direct data format
    if (Array.isArray(parsed.maneuvers)) {
      return { success: true, data: parsed };
    }

    return { success: false, error: 'O ficheiro JSON não possui a estrutura de backup do Pilot\'s Records.' };
  } catch (err) {
    return { success: false, error: `Erro ao analisar JSON: ${err instanceof Error ? err.message : String(err)}` };
  }
}

/**
 * Exporta o catálogo de Navios Registados para uma folha de cálculo Excel (.xlsx)
 */
export function exportVesselsToExcel(
  vessels: Vessel[],
  filenamePrefix = 'Pilot_Records_Navios'
): void {
  const wb = XLSX.utils.book_new();

  const vesselsData = vessels.map(v => ({
    'Nome do Navio': v.name,
    'Número IMO': v.imo,
    'Indicativo de Chamada (Call Sign)': v.callSign || '',
    'Bandeira': v.flag,
    'Tipo de Embarcação': v.type,
    'Comprimento (LOA m)': v.loa,
    'Boca (m)': v.beam,
    'Calado Máximo (m)': v.maxDraft,
    'Calado Vante (m)': v.currentDraftFwd,
    'Calado Ré (m)': v.currentDraftAft,
    'Arqueação Bruta (GRT)': v.grossTonnage || '',
    'Porte Bruto (DWT)': v.dwt || '',
    'Agente Marítimo': v.agent || '',
    'Procedência': v.origin || '',
    'Próximo Porto': v.destination || '',
    'Ano de Construção': v.yearBuilt || '',
    'Observações': v.remarks || ''
  }));

  const ws = XLSX.utils.json_to_sheet(vesselsData);
  ws['!cols'] = [
    { wch: 26 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 20 },
    { wch: 18 }, { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 18 },
    { wch: 20 }, { wch: 16 }, { wch: 26 }, { wch: 22 }, { wch: 22 },
    { wch: 18 }, { wch: 30 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Navios');
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${filenamePrefix}_${dateStr}.xlsx`);
}

/**
 * Importa catálogo de Navios a partir de um ficheiro Excel (.xlsx / .xls)
 */
export async function importVesselsFromExcel(file: File): Promise<{
  success: boolean;
  importedCount: number;
  errors: string[];
  vessels: Vessel[];
}> {
  const errors: string[] = [];
  const importedVessels: Vessel[] = [];

  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

    if (!workbook.SheetNames.length) {
      return { success: false, importedCount: 0, errors: ['O ficheiro Excel não contém folhas válidas.'], vessels: [] };
    }

    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (rawRows.length === 0) {
      return { success: false, importedCount: 0, errors: ['A folha do Excel está vazia.'], vessels: [] };
    }

    rawRows.forEach((row, index) => {
      try {
        const rowNum = index + 2;
        const name = (row['Nome do Navio'] || row['Nome'] || row['Navio'] || row['Vessel Name'] || row['Ship'] || '').toString().trim();
        const imo = (row['Número IMO'] || row['Numero IMO'] || row['IMO'] || '').toString().trim();

        if (!name) {
          errors.push(`Linha ${rowNum}: Nome do navio não especificado.`);
          return;
        }

        const flag = (row['Bandeira'] || row['Flag'] || 'Internacional').toString().trim();
        const callSign = (row['Indicativo de Chamada (Call Sign)'] || row['Call Sign'] || row['Indicativo'] || 'N/A').toString().trim();
        const loa = parseFloat(row['Comprimento (LOA m)'] || row['LOA'] || row['Comprimento'] || '180') || 180;
        const beam = parseFloat(row['Boca (m)'] || row['Boca'] || row['Beam'] || '28') || 28;
        const maxDraft = parseFloat(row['Calado Máximo (m)'] || row['Max Draft'] || '12') || 12;
        const currentDraftFwd = parseFloat(row['Calado Vante (m)'] || row['Draft Fwd'] || '9') || 9;
        const currentDraftAft = parseFloat(row['Calado Ré (m)'] || row['Draft Aft'] || '9.5') || 9.5;
        const grt = parseInt(row['Arqueação Bruta (GRT)'] || row['GRT'] || '25000', 10) || Math.round(loa * beam * 7);
        const dwt = parseInt(row['Porte Bruto (DWT)'] || row['DWT'] || '35000', 10) || Math.round(loa * beam * 9);
        const agent = (row['Agente Marítimo'] || row['Agente'] || row['Agent'] || 'Agência Portuária').toString().trim();
        const origin = (row['Procedência'] || row['Origem'] || row['Origin'] || 'Porto Anterior').toString().trim();
        const destination = (row['Próximo Porto'] || row['Destino'] || row['Destination'] || 'Próximo Porto').toString().trim();

        // Determinar tipo
        const rawType = (row['Tipo de Embarcação'] || row['Tipo'] || row['Type'] || 'carga_geral').toString().toLowerCase();
        let type: Vessel['type'] = 'carga_geral';
        if (rawType.includes('contein') || rawType.includes('container')) type = 'porta_conteiner';
        else if (rawType.includes('petrol') || rawType.includes('tanker')) type = 'petroleiro';
        else if (rawType.includes('granel') || rawType.includes('bulk')) type = 'graneleiro';
        else if (rawType.includes('gas') || rawType.includes('gnl') || rawType.includes('lng')) type = 'gasoso_gnl_glp';
        else if (rawType.includes('quimic') || rawType.includes('chemical')) type = 'quimico';
        else if (rawType.includes('ro-ro') || rawType.includes('veicul')) type = 'ro_ro_veiculos';
        else if (rawType.includes('passag') || rawType.includes('cruzei')) type = 'passageiros_cruzeiro';
        else if (rawType.includes('apoio') || rawType.includes('rebocador') || rawType.includes('tug')) type = 'apoio_maritimo';

        const vessel: Vessel = {
          id: `vessel_${imo || Date.now()}_${index}`,
          name: name.toUpperCase(),
          imo: imo || `IMO-${Date.now()}-${index}`,
          callSign,
          flag,
          flagCode: flag.slice(0, 2).toUpperCase(),
          type,
          loa,
          beam,
          maxDraft,
          currentDraftFwd,
          currentDraftAft,
          grossTonnage: grt,
          dwt,
          agent,
          origin,
          destination,
          remarks: row['Observações'] ? row['Observações'].toString() : undefined
        };

        importedVessels.push(vessel);
      } catch (err) {
        errors.push(`Linha ${index + 2}: Erro ao processar dados (${err instanceof Error ? err.message : String(err)})`);
      }
    });

    return {
      success: importedVessels.length > 0,
      importedCount: importedVessels.length,
      errors,
      vessels: importedVessels
    };
  } catch (err) {
    return {
      success: false,
      importedCount: 0,
      errors: [`Erro ao ler ficheiro Excel de navios: ${err instanceof Error ? err.message : String(err)}`],
      vessels: []
    };
  }
}
