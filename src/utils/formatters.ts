import { VesselType, ManeuverType, ManeuverStatus } from '../types/maritime';

export const formatVesselType = (type: VesselType): string => {
  switch (type) {
    case 'porta_conteiner': return 'Porta-Contêiner';
    case 'petroleiro': return 'Petroleiro (Crude/Produtos)';
    case 'graneleiro': return 'Graneleiro (Bulk)';
    case 'gasoso_gnl_glp': return 'Metaneiro (GNL/GLP)';
    case 'quimico': return 'Químico';
    case 'ro_ro_veiculos': return 'Ro-Ro (Veículos/Carga)';
    case 'carga_geral': return 'Carga Geral';
    case 'passageiros_cruzeiro': return 'Navio de Cruzeiro';
    case 'apoio_maritimo': return 'Apoio Marítimo (OSV)';
    default: return type;
  }
};

export const formatManeuverType = (type: ManeuverType): string => {
  switch (type) {
    case 'entrada': return 'Entrada (Inward)';
    case 'saida': return 'Saída (Outward)';
    case 'mudanca_cais': return 'Mudança de Cais (Shifting)';
    case 'fundeio': return 'Fundeio';
    case 'desfundeio': return 'Desfundeio (Suspender)';
    case 'barra_entrada': return 'Pilotagem de Barra (Entrada)';
    case 'barra_saida': return 'Pilotagem de Barra (Saída)';
    default: return type;
  }
};

export const formatManeuverStatus = (status: ManeuverStatus): { label: string; color: string; bg: string; border: string } => {
  switch (status) {
    case 'em_curso':
      return { 
        label: 'Em Curso', 
        color: 'text-emerald-300', 
        bg: 'bg-emerald-950/80', 
        border: 'border-emerald-500/50' 
      };
    case 'programada':
      return { 
        label: 'Agendada', 
        color: 'text-amber-300', 
        bg: 'bg-amber-950/80', 
        border: 'border-amber-500/50' 
      };
    case 'concluida':
      return { 
        label: 'Concluída', 
        color: 'text-cyan-300', 
        bg: 'bg-cyan-950/80', 
        border: 'border-cyan-500/50' 
      };
    case 'cancelada':
      return { 
        label: 'Cancelada', 
        color: 'text-rose-300', 
        bg: 'bg-rose-950/80', 
        border: 'border-rose-500/50' 
      };
    default:
      return { 
        label: status, 
        color: 'text-slate-300', 
        bg: 'bg-slate-800', 
        border: 'border-slate-700' 
      };
  }
};

export const formatDateTime = (isoString?: string): string => {
  if (!isoString) return '--';
  // Parse directly to preserve user-entered hours strictly without timezone shifting
  const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})(?:T|\s+)(\d{2}):(\d{2})/);
  if (match) {
    const [, y, m, d, hh, mm] = match;
    return `${d}/${m}/${y}, ${hh}:${mm}`;
  }
  const dateOnly = isoString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) {
    const [, y, m, d] = dateOnly;
    return `${d}/${m}/${y}`;
  }
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoString;
  }
};

export const formatTimeOnly = (isoString?: string): string => {
  if (!isoString) return '--:--';
  const match = isoString.match(/(?:T|\s+)(\d{2}):(\d{2})/);
  if (match) {
    return `${match[1]}:${match[2]}`;
  }
  const timeOnly = isoString.match(/^(\d{2}):(\d{2})/);
  if (timeOnly) {
    return `${timeOnly[1]}:${timeOnly[2]}`;
  }
  return isoString;
};

export const formatDateOnly = (isoString?: string): string => {
  if (!isoString) return '--/--/----';
  const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, y, m, d] = match;
    return `${d}/${m}/${y}`;
  }
  return isoString;
};
