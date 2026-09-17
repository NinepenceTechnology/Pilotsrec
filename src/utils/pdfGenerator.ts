import { jsPDF } from 'jspdf';
import { ManeuverRecord } from '../types/maritime';

/**
 * Gera um documento PDF oficial de manobra de praticagem contendo todos os dados técnicos
 * e a imagem fotográfica anexada (comprimida e ajustada no documento).
 */
export async function generatePilotageManeuverPDF(
  record: ManeuverRecord,
  options?: { downloadImmediately?: boolean }
): Promise<{ pdfBlob: Blob; pdfUrl: string; fileName: string }> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Paleta de Cores Estrita: Branco (#FFF), Azul (#0f3460 / #1e40af), Preto (#111)
  const NAVAL_BLUE: [number, number, number] = [15, 52, 96]; // #0f3460
  const LIGHT_BLUE: [number, number, number] = [238, 242, 255]; // #eef2ff
  const DEEP_BLACK: [number, number, number] = [17, 24, 39];
  const BORDER_GRAY: [number, number, number] = [203, 213, 225];

  let currentY = 16;

  // --- CABEÇALHO OFICIAL (Azul Marinho e Branco) ---
  doc.setFillColor(...NAVAL_BLUE);
  doc.rect(margin, currentY, contentWidth, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("PILOT'S RECORDS - CERTIFICADO OFICIAL DE MANOBRA", margin + 6, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`REGISTO N.º: ${record.id}   |   EMISSÃO: ${new Date().toLocaleDateString('pt-PT')} ${new Date().toLocaleTimeString('pt-PT')}`, margin + 6, currentY + 16);

  currentY += 28;

  // --- SEÇÃO 1: DADOS DO NAVIO ---
  doc.setFillColor(...LIGHT_BLUE);
  doc.rect(margin, currentY, contentWidth, 7, 'F');
  doc.setDrawColor(...NAVAL_BLUE);
  doc.setLineWidth(0.4);
  doc.rect(margin, currentY, contentWidth, 7, 'S');

  doc.setTextColor(...NAVAL_BLUE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('1. DADOS DO NAVIO / VESSEL PARTICULARS', margin + 4, currentY + 5);

  currentY += 10;

  // Tabela de Dados do Navio
  doc.setDrawColor(...BORDER_GRAY);
  doc.setLineWidth(0.2);

  const v = record.vesselSnapshot;
  const shipData = [
    [
      { label: 'NOME DO NAVIO:', val: v.name || 'N/A' },
      { label: 'IMO N.º:', val: v.imo || 'N/A' },
      { label: 'NACIONALIDADE / BANDEIRA:', val: v.flag || 'N/A' }
    ],
    [
      { label: 'LOA (COMPRIMENTO):', val: `${v.loa} metros` },
      { label: 'BEAM (LARGURA / BOCA):', val: `${v.beam} metros` },
      { label: 'GRT (ARQUEAÇÃO BRUTA):', val: `${(v.grossTonnage || Math.round(v.loa * v.beam * 8)).toLocaleString()} Ton` }
    ],
    [
      { label: 'CALADO OPERACIONAL:', val: `Vte: ${v.draftFwd}m / Ré: ${v.draftAft}m (Máx: ${Math.max(v.draftFwd, v.draftAft)}m)` },
      { label: 'PROCEDÊNCIA (ORIGEM):', val: v.origin || 'Porto Anterior' },
      { label: 'PRÓXIMO PORTO (DESTINO):', val: v.destination || 'Próximo Porto' }
    ]
  ];

  doc.setFontSize(8.5);
  shipData.forEach(row => {
    const colWidth = contentWidth / 3;
    row.forEach((item, colIdx) => {
      const x = margin + colIdx * colWidth;
      doc.setTextColor(75, 85, 99);
      doc.setFont('helvetica', 'bold');
      doc.text(item.label, x + 2, currentY + 4);
      doc.setTextColor(...DEEP_BLACK);
      doc.setFont('helvetica', 'normal');
      doc.text(String(item.val), x + 2, currentY + 8);
    });
    currentY += 11;
  });

  currentY += 3;

  // --- SEÇÃO 2: DADOS DA MANOBRA DE PRATICAGEM ---
  doc.setFillColor(...LIGHT_BLUE);
  doc.rect(margin, currentY, contentWidth, 7, 'F');
  doc.setDrawColor(...NAVAL_BLUE);
  doc.rect(margin, currentY, contentWidth, 7, 'S');

  doc.setTextColor(...NAVAL_BLUE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('2. REGISTO DE MANOBRA / PILOTAGE OPERATION', margin + 4, currentY + 5);

  currentY += 10;

  const isDesatracacao = record.maneuverType === 'desatracacao';
  const tipoLabel = (record.maneuverType || 'ATRACAÇÃO').toUpperCase();
  const modeloAtracacao = record.berthingModel || 'Costado Bombordo (BB)';
  const primeiroCabo = record.firstLineAshored || record.milestones.firstLineAshored || 'N/A';
  const desatracacao = record.unmooringTime || record.milestones.commenceManeuver || 'N/A';
  const atracacao = record.berthingTime || record.milestones.allFastCompleted || record.scheduledTime || 'N/A';
  const tempoManobra = record.maneuverDurationFormatted || `${record.durationMinutes || 75} minutos`;

  const maneuverData = [
    [
      { label: 'TIPO DE MANOBRA:', val: tipoLabel },
      isDesatracacao
        ? { label: 'CAIS DE DESATRACAÇÃO:', val: record.berthTo || 'Cais do Porto' }
        : { label: 'MODELO DE ATRACAÇÃO:', val: modeloAtracacao },
      { label: 'TEMPO DE MANOBRAS:', val: tempoManobra }
    ],
    [
      { label: 'PRIMEIRO CABO:', val: primeiroCabo },
      { label: 'DESATRACAÇÃO:', val: desatracacao },
      { label: 'ATRACAÇÃO:', val: atracacao }
    ],
    [
      { label: 'BERÇO / CAIS:', val: `${record.berthFrom ? `${record.berthFrom} ➔ ` : ''}${record.berthTo || 'Cais'}` },
      { label: 'PILOTO RESPONSÁVEL:', val: record.pilotName },
      { label: 'STATUS DA OPERAÇÃO:', val: (record.status || 'CONCLUÍDA').toUpperCase() }
    ]
  ];

  maneuverData.forEach(row => {
    const colWidth = contentWidth / 3;
    row.forEach((item, colIdx) => {
      const x = margin + colIdx * colWidth;
      doc.setTextColor(75, 85, 99);
      doc.setFont('helvetica', 'bold');
      doc.text(item.label, x + 2, currentY + 4);
      doc.setTextColor(...DEEP_BLACK);
      doc.setFont('helvetica', 'normal');
      doc.text(String(item.val), x + 2, currentY + 8);
    });
    currentY += 11;
  });

  currentY += 3;

  // --- SEÇÃO 3: REBOCADORES & TEMPO DE ASSISTÊNCIA ---
  doc.setFillColor(...LIGHT_BLUE);
  doc.rect(margin, currentY, contentWidth, 7, 'F');
  doc.setDrawColor(...NAVAL_BLUE);
  doc.rect(margin, currentY, contentWidth, 7, 'S');

  doc.setTextColor(...NAVAL_BLUE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('3. ASSISTÊNCIA DE REBOCADORES / TUG ASSISTANCE', margin + 4, currentY + 5);

  currentY += 10;

  const numTugs = record.tugCount !== undefined ? record.tugCount : (record.tugs?.length || 2);
  const timings = record.tugTimings || {
    arranque: '13:10',
    inicio: '13:30',
    fim: '14:45'
  };

  const tugGrid = [
    [
      { label: 'NÚMERO DE REBOCADORES:', val: `${numTugs} Rebocador(es)` },
      { label: 'TEMPO ARRANQUE (SAÍDA BASE):', val: timings.arranque || 'N/A' },
      { label: 'TEMPO INÍCIO (EMPUXO / CABOS):', val: timings.inicio || 'N/A' },
      { label: 'TEMPO FIM (LIBERAÇÃO):', val: timings.fim || 'N/A' }
    ]
  ];

  tugGrid.forEach(row => {
    const colWidth = contentWidth / 4;
    row.forEach((item, colIdx) => {
      const x = margin + colIdx * colWidth;
      doc.setTextColor(75, 85, 99);
      doc.setFont('helvetica', 'bold');
      doc.text(item.label, x + 2, currentY + 4);
      doc.setTextColor(...DEEP_BLACK);
      doc.setFont('helvetica', 'normal');
      doc.text(String(item.val), x + 2, currentY + 8);
    });
    currentY += 11;
  });

  currentY += 3;

  // --- SEÇÃO 4: OBSERVAÇÕES DO PILOTO ---
  doc.setFillColor(...LIGHT_BLUE);
  doc.rect(margin, currentY, contentWidth, 7, 'F');
  doc.setDrawColor(...NAVAL_BLUE);
  doc.rect(margin, currentY, contentWidth, 7, 'S');

  doc.setTextColor(...NAVAL_BLUE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('4. OBSERVAÇÃO / REMARKS', margin + 4, currentY + 5);

  currentY += 10;
  doc.setTextColor(...DEEP_BLACK);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  const obsText = record.pilotRemarks || 'Manobra executada com plena segurança e conformidade operacional com as normas da Capitania dos Portos e Pilotagem.';
  const splitRemarks = doc.splitTextToSize(obsText, contentWidth - 4);
  doc.text(splitRemarks, margin + 2, currentY + 3);

  currentY += Math.max(16, splitRemarks.length * 5 + 6);

  // --- SEÇÃO 5: ASSINATURAS OFICIAIS ---
  doc.setDrawColor(...BORDER_GRAY);
  doc.line(margin + 10, currentY + 12, margin + 70, currentY + 12);
  doc.line(margin + 110, currentY + 12, margin + 170, currentY + 12);

  doc.setFontSize(8);
  doc.setTextColor(75, 85, 99);
  doc.text(`Piloto: ${record.pilotName}`, margin + 10, currentY + 16);
  doc.text('Comandante do Navio (Master)', margin + 110, currentY + 16);

  // --- SEÇÃO 6: ANEXOS OPERACIONAIS (FOTOGRAFIAS, BILHETES, CALADOS E DOCUMENTOS) ---
  const attachments = record.attachments && record.attachments.length > 0
    ? record.attachments
    : (record.photoUrl ? [{
        id: 'legacy-photo',
        name: record.photoTitle || 'Foto Oficial da Manobra',
        category: 'pilot_slip' as const,
        dataUrl: record.photoUrl,
        fileType: 'image' as const,
        mimeType: 'image/jpeg',
        uploadedAt: record.createdAt,
        caption: record.photoTitle
      }] : []);

  if (attachments.length > 0) {
    attachments.forEach((att, attIdx) => {
      doc.addPage();
      let photoY = 16;

      const categoryLabels: Record<string, string> = {
        pilot_slip: 'BILHETE DE PRATICAGEM ASSINADO (SLIP / TIMESHEET)',
        draft_survey: 'FOLHA DE CALADOS (DRAFT SURVEY / LEITURAS)',
        photo_vessel: 'FOTOGRAFIA DO NAVIO (COSTADO / PROA / POPA / ESCADA)',
        photo_maneuver: 'MANOBRA EM CURSO (REBOCADORES / ATRACAÇÃO)',
        berth_condition: 'CONDIÇÕES DO BERÇO (DEFENSAS / CABEÇOS / CAIS)',
        checklist_doc: 'CHECKLIST DE SEGURANÇA / TROCA DE INFORMAÇÕES (MPX)',
        incident_report: 'REGISTO DE AVARIA / OCORRÊNCIA / INCIDENTE',
        weather_radar: 'BOLETIM METEOROLÓGICO / CARTA NÁUTICA / RADAR',
        other_doc: 'DOCUMENTO / ANEXO OPERACIONAL'
      };

      const catLabel = categoryLabels[att.category] || 'ANEXO OFICIAL DE PRATICAGEM';

      // Header Banner da Página de Anexo
      doc.setFillColor(...NAVAL_BLUE);
      doc.rect(margin, photoY, contentWidth, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`ANEXO #${attIdx + 1}: ${catLabel}`, margin + 6, photoY + 8);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Navio: ${v.name} | Registo: ${record.id} | Ficheiro: ${att.name}`,
        margin + 6,
        photoY + 15
      );

      photoY += 26;

      if (att.fileType === 'image') {
        try {
          const imgWidth = contentWidth;
          const imgHeight = 150; // altura máxima
          doc.setDrawColor(...BORDER_GRAY);
          doc.rect(margin, photoY, imgWidth, imgHeight);
          doc.addImage(att.dataUrl, 'JPEG', margin + 1, photoY + 1, imgWidth - 2, imgHeight - 2, undefined, 'FAST');

          photoY += imgHeight + 8;
          doc.setTextColor(75, 85, 99);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text('LEGENDA E OBSERVAÇÕES DO ANEXO:', margin, photoY);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.text(
            att.caption ||
              `Comprovante fotográfico anexado digitalmente à folha oficial de manobra pelo Prático ${record.pilotName}.`,
            margin,
            photoY + 5,
            { maxWidth: contentWidth }
          );
        } catch (e) {
          console.warn('Erro ao embutir imagem no PDF:', e);
          doc.setTextColor(220, 38, 38);
          doc.setFontSize(9);
          doc.text(`[Fotografia anexada digitalmente no sistema - Ficheiro: ${att.name}]`, margin, photoY + 10);
        }
      } else {
        // Documento PDF / Documento Técnico
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(...BORDER_GRAY);
        doc.roundedRect(margin, photoY, contentWidth, 80, 3, 3, 'FD');

        doc.setTextColor(...NAVAL_BLUE);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('DOCUMENTO PDF ANEXADO AO REGISTO', margin + 10, photoY + 20);

        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.text(`Nome do Ficheiro: ${att.name}`, margin + 10, photoY + 32);
        doc.text(`Categoria: ${catLabel}`, margin + 10, photoY + 40);
        if (att.uploadedAt) {
          doc.text(`Data de Registo: ${new Date(att.uploadedAt).toLocaleString('pt-PT')}`, margin + 10, photoY + 48);
        }
        if (att.caption) {
          doc.text(`Anotações: ${att.caption}`, margin + 10, photoY + 56, { maxWidth: contentWidth - 20 });
        }
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(8.5);
        doc.text(
          'O documento original encontra-se preservado no sistema do Piloto para consulta e auditoria.',
          margin + 10,
          photoY + 70
        );
      }
    });
  }

  const fileName = `Manobra_${record.vesselSnapshot.name.replace(/[^a-zA-Z0-9]/g, '_')}_${record.id}.pdf`;
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);

  if (options?.downloadImmediately) {
    doc.save(fileName);
  }

  return { pdfBlob, pdfUrl, fileName };
}
