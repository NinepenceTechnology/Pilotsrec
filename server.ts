import express from 'express';
import path from 'path';
import fs from 'fs';
import http from 'http';
import https from 'https';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Data storage files
const dataDir = path.resolve(process.cwd(), 'data');
const alertsFile = path.resolve(dataDir, 'shared_alerts.json');
const deletedAlertsFile = path.resolve(dataDir, 'shared_deleted_alert_ids.json');
const maneuversFile = path.resolve(dataDir, 'shared_maneuvers.json');
const vesselsFile = path.resolve(dataDir, 'shared_vessels.json');
const pilotsFile = path.resolve(dataDir, 'shared_pilots.json');
const chatFile = path.resolve(dataDir, 'shared_chat_24h.json');
const metaFile = path.resolve(dataDir, 'shared_system_meta.json');

// Ensure data folder and json files exist
const ensureDataFiles = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(alertsFile)) fs.writeFileSync(alertsFile, '[]', 'utf8');
  if (!fs.existsSync(deletedAlertsFile)) fs.writeFileSync(deletedAlertsFile, '[]', 'utf8');
  if (!fs.existsSync(maneuversFile)) fs.writeFileSync(maneuversFile, '[]', 'utf8');
  if (!fs.existsSync(vesselsFile)) fs.writeFileSync(vesselsFile, '[]', 'utf8');
  if (!fs.existsSync(pilotsFile)) fs.writeFileSync(pilotsFile, '[]', 'utf8');
  if (!fs.existsSync(chatFile)) fs.writeFileSync(chatFile, '[]', 'utf8');
  if (!fs.existsSync(metaFile)) {
    fs.writeFileSync(metaFile, JSON.stringify({
      lastSync: new Date().toISOString(),
      totalSyncs: 0,
      registeredDevices: []
    }, null, 2), 'utf8');
  }
};

ensureDataFiles();

const readJson = (file: string, defaultVal: any = []) => {
  try {
    if (!fs.existsSync(file)) return defaultVal;
    const content = fs.readFileSync(file, 'utf8');
    return JSON.parse(content || JSON.stringify(defaultVal));
  } catch {
    return defaultVal;
  }
};

const writeJson = (file: string, data: any) => {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error(`Erro ao gravar ${file}:`, e);
  }
};

// Real-time SSE Clients
const sseClients: any[] = [];

const notifyAllSseClients = (type: string, payload: any) => {
  const dataString = JSON.stringify({ type, payload, timestamp: Date.now() });
  for (let i = sseClients.length - 1; i >= 0; i--) {
    const client = sseClients[i];
    try {
      client.res.write(`data: ${dataString}\n\n`);
    } catch {
      sseClients.splice(i, 1);
    }
  }
};

// Ping SSE clients every 25 seconds
setInterval(() => {
  const pingPayload = JSON.stringify({ type: 'PING', activeClients: sseClients.length, timestamp: Date.now() });
  for (let i = sseClients.length - 1; i >= 0; i--) {
    try {
      sseClients[i].res.write(`data: ${pingPayload}\n\n`);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}, 25000);

// Fallback verified vessels catalog
const FALLBACK_VESSELS = [
  { name: 'MSC ANNA VICTORIA', imo: '9784521', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Panama', grossTonnage: 192237, dwt: 202684, loa: 399.9, beam: 58.8, callSign: '3FEP9', provider: 'vessel_finder' },
  { name: 'MSC ARIES', imo: '9857183', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Portugal', grossTonnage: 149525, dwt: 158097, loa: 366, beam: 51, callSign: 'CQEP', provider: 'vessel_finder' },
  { name: 'MSC TESSA', imo: '9888998', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Liberia', grossTonnage: 236184, dwt: 241960, loa: 399.9, beam: 61.3, callSign: '5LEA9', provider: 'vessel_finder' },
  { name: 'MSC RAYA', imo: '9934759', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Liberia', grossTonnage: 236184, dwt: 241960, loa: 399.9, beam: 61.3, callSign: '5LED2', provider: 'vessel_finder' },
  { name: 'MSC ISABELLA', imo: '9839282', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Panama', grossTonnage: 232618, dwt: 228149, loa: 400, beam: 61.5, callSign: '3FBE7', provider: 'vessel_finder' },
  { name: 'MSC LORETO', imo: '9934735', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Liberia', grossTonnage: 236184, dwt: 241960, loa: 399.9, beam: 61.3, callSign: '5LEB4', provider: 'vessel_finder' },
  { name: 'MSC MICHEL CAPPELLINI', imo: '9934747', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Liberia', grossTonnage: 236184, dwt: 241960, loa: 399.9, beam: 61.3, callSign: '5LEC2', provider: 'vessel_finder' },
  { name: 'MSC SAMAR', imo: '9839440', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Panama', grossTonnage: 232618, dwt: 228149, loa: 400, beam: 61.5, callSign: '3EYF8', provider: 'vessel_finder' },
  { name: 'MAERSK MC-KINNEY MOLLER', imo: '9619907', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Denmark', grossTonnage: 194849, dwt: 194153, loa: 399, beam: 59, callSign: 'OWIZ2', provider: 'vessel_finder' },
  { name: 'MADRID MAERSK', imo: '9778791', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Denmark', grossTonnage: 214286, dwt: 205636, loa: 399, beam: 58.6, callSign: 'OXRM2', provider: 'vessel_finder' },
  { name: 'MUNICH MAERSK', imo: '9778806', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Denmark', grossTonnage: 214286, dwt: 205636, loa: 399, beam: 58.6, callSign: 'OXRN2', provider: 'vessel_finder' },
  { name: 'MANCHESTER MAERSK', imo: '9780457', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Denmark', grossTonnage: 214286, dwt: 205636, loa: 399, beam: 58.6, callSign: 'OXRO2', provider: 'vessel_finder' },
  { name: 'SAFMARINE CHILKA', imo: '9356103', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Hong Kong', grossTonnage: 50688, dwt: 61405, loa: 294.1, beam: 32.2, callSign: 'VRCS4', provider: 'vessel_finder' },
  { name: 'SAFMARINE BAYETE', imo: '9356115', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Hong Kong', grossTonnage: 50688, dwt: 61405, loa: 294.1, beam: 32.2, callSign: 'VRCT2', provider: 'vessel_finder' },
  { name: 'CMA CGM JACQUES SAADE', imo: '9839177', type: 'gasoso_gnl_glp', typeName: 'Container Ship (LNG Powered)', flag: 'France', grossTonnage: 236583, dwt: 220000, loa: 400, beam: 61.3, callSign: 'FLAA', provider: 'vessel_finder' },
  { name: 'CMA CGM ANTOINE DE SAINT EXUPERY', imo: '9776418', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'France', grossTonnage: 217673, dwt: 202684, loa: 400, beam: 59, callSign: 'FNIO', provider: 'vessel_finder' },
  { name: 'CMA CGM PALAIS ROYAL', imo: '9839189', type: 'gasoso_gnl_glp', typeName: 'Container Ship (LNG)', flag: 'France', grossTonnage: 236583, dwt: 220000, loa: 400, beam: 61.3, callSign: 'FLAB', provider: 'vessel_finder' },
  { name: 'EVER GIVEN', imo: '9811000', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Panama', grossTonnage: 219079, dwt: 199629, loa: 399.9, beam: 58.8, callSign: 'H3RC', provider: 'vessel_finder' },
  { name: 'EVER GOLDEN', imo: '9811012', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Panama', grossTonnage: 219079, dwt: 199629, loa: 399.9, beam: 58.8, callSign: 'H3RD', provider: 'vessel_finder' },
  { name: 'EVER ACE', imo: '9893890', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Panama', grossTonnage: 235579, dwt: 241960, loa: 399.9, beam: 61.5, callSign: '3FDF6', provider: 'vessel_finder' },
  { name: 'EVER ALOT', imo: '9893955', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Panama', grossTonnage: 236228, dwt: 240000, loa: 399.9, beam: 61.5, callSign: '3FEF7', provider: 'vessel_finder' },
  { name: 'COSCO SHIPPING UNIVERSE', imo: '9795610', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Hong Kong', grossTonnage: 215553, dwt: 198000, loa: 399.9, beam: 58.6, callSign: 'VRRG3', provider: 'vessel_finder' },
  { name: 'HAPAG-LLOYD BERLIN EXPRESS', imo: '9540118', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Germany', grossTonnage: 229376, dwt: 229000, loa: 399.9, beam: 61, callSign: 'DJCV2', provider: 'vessel_finder' },
  { name: 'ONE APUS', imo: '9806079', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Japan', grossTonnage: 146694, dwt: 138611, loa: 364, beam: 50.6, callSign: '7KFA', provider: 'vessel_finder' },
  { name: 'VALE BRASIL', imo: '9488918', type: 'graneleiro', typeName: 'VLOC (Very Large Ore Carrier)', flag: 'Marshall Islands', grossTonnage: 198980, dwt: 402347, loa: 362, beam: 65, callSign: 'V7WT8', provider: 'vessel_finder' },
  { name: 'VALE RIO DE JANEIRO', imo: '9488920', type: 'graneleiro', typeName: 'VLOC (Very Large Ore Carrier)', flag: 'Marshall Islands', grossTonnage: 198980, dwt: 402347, loa: 362, beam: 65, callSign: 'V7WT9', provider: 'vessel_finder' },
  { name: 'BERGE OLYMPUS', imo: '9750969', type: 'graneleiro', typeName: 'Bulk Carrier (Wind-Assisted)', flag: 'Isle of Man', grossTonnage: 108398, dwt: 211153, loa: 300, beam: 50, callSign: '2JCW9', provider: 'vessel_finder' },
  { name: 'STAR POLARIS', imo: '9584102', type: 'graneleiro', typeName: 'Capesize Bulk Carrier', flag: 'Marshall Islands', grossTonnage: 93297, dwt: 179546, loa: 292, beam: 45, callSign: 'V7UG7', provider: 'vessel_finder' },
  { name: 'GOLDEN VOYAGER', imo: '9704257', type: 'graneleiro', typeName: 'Bulk Carrier', flag: 'Liberia', grossTonnage: 44125, dwt: 82000, loa: 229, beam: 32.2, callSign: 'D5JG2', provider: 'vessel_finder' },
  { name: 'FRONTLINE ALTAIR', imo: '9745902', type: 'petroleiro', typeName: 'Crude Oil Tanker (VLCC)', flag: 'Marshall Islands', grossTonnage: 156851, dwt: 299999, loa: 333, beam: 60, callSign: 'V7A2054', provider: 'vessel_finder' },
  { name: 'TI EUROPE', imo: '9235268', type: 'petroleiro', typeName: 'Ultra Large Crude Carrier (ULCC)', flag: 'Belgium', grossTonnage: 234006, dwt: 441585, loa: 380, beam: 68, callSign: 'ONFX', provider: 'vessel_finder' },
  { name: 'STOLT INTEGRITY', imo: '9680085', type: 'quimico', typeName: 'Chemical / Oil Tanker', flag: 'Cayman Islands', grossTonnage: 23687, dwt: 38000, loa: 185, beam: 28.8, callSign: 'ZGFL4', provider: 'vessel_finder' },
  { name: 'STOLT EXCELLENCE', imo: '9680073', type: 'quimico', typeName: 'Chemical / Oil Tanker', flag: 'Cayman Islands', grossTonnage: 23687, dwt: 38000, loa: 185, beam: 28.8, callSign: 'ZGFL3', provider: 'vessel_finder' },
  { name: 'GRIMALDI GRANDE NIGERIA', imo: '9247924', type: 'ro_ro_veiculos', typeName: 'Ro-Ro Cargo Ship', flag: 'Italy', grossTonnage: 56738, dwt: 21387, loa: 214, beam: 32.2, callSign: 'IBPE', provider: 'vessel_finder' },
  { name: 'GRIMALDI GRANDE BUENOS AIRES', imo: '9253208', type: 'ro_ro_veiculos', typeName: 'Ro-Ro Cargo Ship', flag: 'Italy', grossTonnage: 56738, dwt: 21387, loa: 214, beam: 32.2, callSign: 'IBPJ', provider: 'vessel_finder' },
  { name: 'HOEGH TARGET', imo: '9684988', type: 'ro_ro_veiculos', typeName: 'Pure Car and Truck Carrier (PCTC)', flag: 'Norway', grossTonnage: 75717, dwt: 20766, loa: 199.9, beam: 36.5, callSign: 'LAYJ7', provider: 'vessel_finder' },
  { name: 'BOURBON LIBERTY 215', imo: '9574341', type: 'rebocador', typeName: 'Offshore Supply Tug', flag: 'France', grossTonnage: 1733, dwt: 1500, loa: 59.8, beam: 15, callSign: 'FMCF', provider: 'vessel_finder' },
  { name: 'SVITZER LUANDA', imo: '9728289', type: 'rebocador', typeName: 'ASD Terminal Tug (Bollard Pull 70T)', flag: 'Angola', grossTonnage: 448, dwt: 150, loa: 29.5, beam: 11.5, callSign: 'D2LU1', provider: 'vessel_finder' },
  { name: 'SMIT ANGOLA', imo: '9488346', type: 'rebocador', typeName: 'Tugboat / Escort Tug', flag: 'Angola', grossTonnage: 480, dwt: 160, loa: 31, beam: 12, callSign: 'D2SM1', provider: 'vessel_finder' }
];

const searchFallback = (query: string) => {
  const q = query.trim().toUpperCase();
  const cleanNum = q.replace(/\D/g, '');
  return FALLBACK_VESSELS.filter(v => {
    const matchName = v.name.toUpperCase().includes(q);
    const matchImo = cleanNum.length >= 3 && v.imo.includes(cleanNum);
    const matchCall = v.callSign && v.callSign.toUpperCase().includes(q);
    return matchName || matchImo || matchCall;
  });
};

// Helper to fetch HTML following redirects (VesselFinder often 301/302 redirects)
function fetchHtmlWithRedirects(initialUrl: string, maxRedirects = 4): Promise<{ html: string; finalUrl: string }> {
  return new Promise((resolve, reject) => {
    let redirectCount = 0;

    const doRequest = (urlStr: string) => {
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(urlStr);
      } catch (e) {
        return reject(new Error('URL inválida: ' + urlStr));
      }

      const client = parsedUrl.protocol === 'http:' ? http : https;
      const req = client.get(urlStr, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none'
        },
        timeout: 5500
      }, (res) => {
        if (res.statusCode && [301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          redirectCount++;
          if (redirectCount > maxRedirects) {
            return reject(new Error('Muitos redirecionamentos'));
          }
          const nextUrl = new URL(res.headers.location, urlStr).toString();
          return doRequest(nextUrl);
        }

        if (res.statusCode && res.statusCode >= 400) {
          return reject(new Error(`HTTP ${res.statusCode}`));
        }

        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          resolve({ html: data, finalUrl: urlStr });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
    };

    doRequest(initialUrl);
  });
}

// API: VesselFinder Search (by Name or IMO)
app.get('/api/vesselfinder', async (req, res) => {
  const query = (req.query.query as string) || '';
  if (!query || query.trim().length < 2) {
    return res.json({ success: true, vessels: [] });
  }

  const fallbackMatches = searchFallback(query);

  try {
    const cleanNum = query.trim().replace(/\D/g, '');
    const isNumericImo = cleanNum.length >= 5 && cleanNum === query.trim();
    const targetUrl = isNumericImo
      ? `https://www.vesselfinder.com/vessels?imo=${encodeURIComponent(cleanNum)}`
      : `https://www.vesselfinder.com/vessels?name=${encodeURIComponent(query.trim())}`;

    const { html, finalUrl } = await fetchHtmlWithRedirects(targetUrl);
    const rows: any[] = [];

    // Se redirecionou para uma página de detalhe do navio direto
    if (finalUrl.includes('/vessels/details/') || html.includes('class="ship-section"')) {
      const nameMatch = html.match(/<h1 class="title">([^<]+)<\/h1>/i) || html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      const imoMatch = html.match(/IMO<\/td>\s*<td[^>]*>(\d+)<\/td>/i) || finalUrl.match(/\/details\/(\d+)/i) || (isNumericImo ? [null, cleanNum] : null);
      const flagMatch = html.match(/Flag<\/td>\s*<td[^>]*>([^<]+)<\/td>/i);
      const typeMatch = html.match(/Vessel [tT]ype<\/td>\s*<td[^>]*>([^<]+)<\/td>/i);
      const loaMatch = html.match(/Length Overall[^<]*<\/td>\s*<td[^>]*>([\d\.]+)/i);
      const beamMatch = html.match(/Beam[^<]*<\/td>\s*<td[^>]*>([\d\.]+)/i);
      const gtMatch = html.match(/Gross Tonnage<\/td>\s*<td[^>]*>([\d\s,]+)<\/td>/i);
      const dwtMatch = html.match(/Deadweight<\/td>\s*<td[^>]*>([\d\s,]+)<\/td>/i);

      if (nameMatch && imoMatch) {
        const rawType = typeMatch ? typeMatch[1].trim().toLowerCase() : '';
        let mappedType = 'carga_geral';
        if (rawType.includes('container')) mappedType = 'porta_conteiner';
        else if (rawType.includes('bulk') || rawType.includes('ore')) mappedType = 'graneleiro';
        else if (rawType.includes('tanker') || rawType.includes('oil') || rawType.includes('crude')) mappedType = 'petroleiro';
        else if (rawType.includes('chemical')) mappedType = 'quimico';
        else if (rawType.includes('lng') || rawType.includes('lpg') || rawType.includes('gas')) mappedType = 'gasoso_gnl_glp';
        else if (rawType.includes('vehicle') || rawType.includes('ro-ro') || rawType.includes('roro')) mappedType = 'ro_ro_veiculos';
        else if (rawType.includes('tug')) mappedType = 'rebocador';

        rows.push({
          name: nameMatch[1].trim().replace(/\s*-\s*IMO.*$/i, ''),
          imo: imoMatch[1],
          type: mappedType,
          typeName: typeMatch ? typeMatch[1].trim() : 'Navio Mercante',
          flag: flagMatch ? flagMatch[1].trim() : 'Internacional',
          grossTonnage: gtMatch ? parseInt(gtMatch[1].replace(/\D/g, ''), 10) : 0,
          dwt: dwtMatch ? parseInt(dwtMatch[1].replace(/\D/g, ''), 10) : 0,
          loa: loaMatch ? parseFloat(loaMatch[1]) : 0,
          beam: beamMatch ? parseFloat(beamMatch[1]) : 0,
          provider: 'vessel_finder'
        });
      }
    }

    // Processar tabela padrão de resultados
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let match;
    while ((match = trRegex.exec(html)) !== null && rows.length < 12) {
      const trContent = match[1];
      const imoMatch = trContent.match(/href="\/vessels\/details\/(\d+)"/i) || trContent.match(/href="\/vessels\/(\d+)"/i);
      const nameMatch = trContent.match(/<div class="slna">([^<]+)<\/div>/i) || trContent.match(/alt="([^"]+)"/i);
      const typeMatch = trContent.match(/<div class="slty">([^<]+)<\/div>/i);
      const flagMatch = trContent.match(/title="([^"]+)"/i);
      const gtMatch = trContent.match(/<td class="v4[^"]*">([^<]+)<\/td>/i);
      const dwtMatch = trContent.match(/<td class="v5[^"]*">([^<]+)<\/td>/i);
      const dimMatch = trContent.match(/<td class="v6[^"]*">([^<]+)<\/td>/i);
      const photoMatch = trContent.match(/data-src="([^"]+)"/i) || trContent.match(/src="([^"]+)"/i);

      if (imoMatch && nameMatch) {
        let loa = 0;
        let beam = 0;
        if (dimMatch) {
          const rawDim = dimMatch[1].replace(/[^\d\.\/]/g, '');
          const dims = rawDim.split('/').map(s => parseFloat(s.trim()));
          loa = isNaN(dims[0]) ? 0 : dims[0];
          beam = isNaN(dims[1]) ? 0 : dims[1];
        }

        const rawType = typeMatch ? typeMatch[1].trim().toLowerCase() : '';
        let mappedType = 'carga_geral';
        if (rawType.includes('container')) mappedType = 'porta_conteiner';
        else if (rawType.includes('bulk') || rawType.includes('ore')) mappedType = 'graneleiro';
        else if (rawType.includes('tanker') || rawType.includes('oil') || rawType.includes('crude')) mappedType = 'petroleiro';
        else if (rawType.includes('chemical')) mappedType = 'quimico';
        else if (rawType.includes('lng') || rawType.includes('lpg') || rawType.includes('gas')) mappedType = 'gasoso_gnl_glp';
        else if (rawType.includes('vehicle') || rawType.includes('ro-ro') || rawType.includes('roro')) mappedType = 'ro_ro_veiculos';
        else if (rawType.includes('tug')) mappedType = 'rebocador';

        const rawGt = gtMatch ? gtMatch[1].replace(/\D/g, '') : '';
        const rawDwt = dwtMatch ? dwtMatch[1].replace(/\D/g, '') : '';

        rows.push({
          name: nameMatch[1].trim().replace(/-/g, ' '),
          imo: imoMatch[1],
          type: mappedType,
          typeName: typeMatch ? typeMatch[1].trim() : 'Navio Mercante',
          flag: flagMatch ? flagMatch[1].trim() : 'Internacional',
          grossTonnage: rawGt ? parseInt(rawGt, 10) : 0,
          dwt: rawDwt ? parseInt(rawDwt, 10) : 0,
          loa,
          beam,
          photoUrl: photoMatch ? photoMatch[1] : undefined,
          provider: 'vessel_finder'
        });
      }
    }

    const combined = [...rows];
    const seenImos = new Set(rows.map(r => r.imo));
    for (const fb of fallbackMatches) {
      if (!seenImos.has(fb.imo)) {
        seenImos.add(fb.imo);
        combined.push(fb);
      }
    }

    return res.json({
      success: true,
      vessels: combined.length > 0 ? combined : fallbackMatches,
      source: rows.length > 0 ? 'vesselfinder_live' : 'vesselfinder_verified_archive'
    });
  } catch {
    return res.json({
      success: true,
      vessels: fallbackMatches,
      source: 'vesselfinder_verified_archive'
    });
  }
});

// API: VesselFinder Technical Details (Draught, Callsign, Destination)
app.get('/api/vesselfinder-details', async (req, res) => {
  const imo = (req.query.imo as string) || '';
  if (!imo || imo.trim().length < 4) {
    return res.json({ success: false, error: 'IMO inválido' });
  }

  const cleanImo = imo.trim().replace(/\D/g, '');
  const fallback = FALLBACK_VESSELS.find(v => v.imo === cleanImo);

  try {
    const targetUrl = `https://www.vesselfinder.com/vessels/details/${encodeURIComponent(cleanImo)}`;
    const fetchPromise = new Promise<string>((resolve, reject) => {
      const request = https.get(
        targetUrl,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          },
          timeout: 4500
        },
        (response) => {
          let data = '';
          response.on('data', chunk => data += chunk);
          response.on('end', () => resolve(data));
        }
      );
      request.on('error', reject);
      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Timeout'));
      });
    });

    const html = await fetchPromise;
    const csMatch = html.match(/Callsign<\/td>\s*<td[^>]*>([^<]+)<\/td>/i);
    const draftMatch = html.match(/Draught<\/td>\s*<td[^>]*>([\d\.]+)\s*m/i);
    const destMatch = html.match(/Destination<\/td>\s*<td[^>]*>([^<]+)<\/td>/i);

    return res.json({
      success: true,
      callSign: csMatch ? csMatch[1].trim() : (fallback?.callSign || ''),
      draft: draftMatch ? parseFloat(draftMatch[1]) : 11.5,
      destination: destMatch ? destMatch[1].trim() : 'Porto Comercial'
    });
  } catch {
    return res.json({
      success: true,
      callSign: fallback?.callSign || '',
      draft: 11.5,
      destination: 'Porto Comercial',
      isFallback: true
    });
  }
});

// Helper: Merges maneuver records
const mergeManeuverRecords = (existingList: any[], incomingList: any[]) => {
  const map = new Map<string, any>();
  existingList.forEach((m: any) => {
    if (m && m.id) map.set(m.id, m);
  });

  incomingList.forEach((incoming: any) => {
    if (!incoming || !incoming.id) return;
    const existing = map.get(incoming.id);
    if (!existing) {
      map.set(incoming.id, incoming);
    } else {
      const earliestCreated = (existing.createdAt && incoming.createdAt)
        ? (new Date(existing.createdAt).getTime() <= new Date(incoming.createdAt).getTime() ? existing.createdAt : incoming.createdAt)
        : (existing.createdAt || incoming.createdAt || new Date().toISOString());

      const latestUpdated = (existing.updatedAt && incoming.updatedAt)
        ? (new Date(existing.updatedAt).getTime() >= new Date(incoming.updatedAt).getTime() ? existing.updatedAt : incoming.updatedAt)
        : (incoming.updatedAt || existing.updatedAt || new Date().toISOString());

      const attMap = new Map();
      (existing.attachments || []).forEach((a: any) => a && a.id && attMap.set(a.id, a));
      (incoming.attachments || []).forEach((a: any) => a && a.id && attMap.set(a.id, a));

      const mergedMilestones = {
        ...(existing.milestones || {}),
        ...(incoming.milestones || {})
      };

      map.set(incoming.id, {
        ...existing,
        ...incoming,
        createdAt: earliestCreated,
        updatedAt: latestUpdated,
        milestones: mergedMilestones,
        attachments: Array.from(attMap.values())
      });
    }
  });

  return Array.from(map.values()).sort((a, b) => 
    new Date(b.scheduledTime || b.createdAt || 0).getTime() - new Date(a.scheduledTime || a.createdAt || 0).getTime()
  );
};

// API: Unified Sync Database (Push & Pull)
app.all('/api/shared/sync-unified', (req, res) => {
  const isPost = req.method === 'POST';
  const body = req.body || {};

  let currentManeuvers = readJson(maneuversFile, []);
  let currentAlerts = readJson(alertsFile, []);
  let currentVessels = readJson(vesselsFile, []);
  let currentPilots = readJson(pilotsFile, []);
  let currentDeletedAlertIds = readJson(deletedAlertsFile, []);

  if (isPost) {
    if (Array.isArray(body.deletedAlertIds)) {
      currentDeletedAlertIds = Array.from(new Set([...currentDeletedAlertIds, ...body.deletedAlertIds]));
      writeJson(deletedAlertsFile, currentDeletedAlertIds);
    }

    if (Array.isArray(body.maneuvers) && body.maneuvers.length > 0) {
      currentManeuvers = mergeManeuverRecords(currentManeuvers, body.maneuvers);
      writeJson(maneuversFile, currentManeuvers);
    }

    if (Array.isArray(body.alerts) && body.alerts.length > 0) {
      const alertMap = new Map();
      currentAlerts.forEach((a: any) => {
        if (!currentDeletedAlertIds.includes(a.id)) alertMap.set(a.id, a);
      });
      body.alerts.forEach((a: any) => {
        if (a && a.id && !currentDeletedAlertIds.includes(a.id)) {
          alertMap.set(a.id, a);
        }
      });
      currentAlerts = Array.from(alertMap.values());
      writeJson(alertsFile, currentAlerts);
    }

    if (Array.isArray(body.vessels) && body.vessels.length > 0) {
      const vMap = new Map();
      currentVessels.forEach((v: any) => {
        const key = v.imo ? `IMO_${v.imo.trim()}` : (v.id || v.name);
        if (key) vMap.set(key, v);
      });
      body.vessels.forEach((v: any) => {
        if (v) {
          const key = v.imo ? `IMO_${v.imo.trim()}` : (v.id || v.name);
          if (key) vMap.set(key, { ...(vMap.get(key) || {}), ...v });
        }
      });
      currentVessels = Array.from(vMap.values());
      writeJson(vesselsFile, currentVessels);
    }

    if (Array.isArray(body.pilots) && body.pilots.length > 0) {
      const pMap = new Map();
      currentPilots.forEach((p: any) => { if (p && p.id) pMap.set(p.id, p); });
      body.pilots.forEach((p: any) => { if (p && p.id) pMap.set(p.id, { ...(pMap.get(p.id) || {}), ...p }); });
      currentPilots = Array.from(pMap.values());
      writeJson(pilotsFile, currentPilots);
    }

    notifyAllSseClients('UNIFIED_SYNC', {
      maneuvers: currentManeuvers,
      alerts: currentAlerts,
      vessels: currentVessels,
      pilots: currentPilots,
      deletedAlertIds: currentDeletedAlertIds,
      sender: body.pilotName || 'device',
      timestamp: Date.now()
    });
  }

  const nowIso = new Date().toISOString();
  return res.json({
    success: true,
    message: 'Base de dados unificada sincronizada com sucesso',
    database: {
      maneuvers: currentManeuvers,
      alerts: currentAlerts,
      vessels: currentVessels,
      pilots: currentPilots,
      deletedAlertIds: currentDeletedAlertIds
    },
    stats: {
      totalManeuvers: currentManeuvers.length,
      totalAlerts: currentAlerts.length,
      totalVessels: currentVessels.length,
      totalPilots: currentPilots.length,
      activeDevices: Math.max(1, sseClients.length),
      serverTimestamp: nowIso
    }
  });
});

// API: Verificação de Versões Disponíveis do Software (Silenciosa)
app.get('/api/system/version', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  return res.json({
    success: true,
    version: '4.0.0',
    buildDate: '2026-09-20',
    timestamp: Date.now(),
    latestStable: '4.0.0',
    updateAvailable: false,
    forceUpdate: true,
    forceDomains: ['pilotsrec.netlify.app'],
    environment: process.env.NODE_ENV || 'production'
  });
});

// API: Alerts CRUD
app.get('/api/shared/alerts', (req, res) => {
  const deletedAlertIds: string[] = readJson(deletedAlertsFile, []);
  const alertsList = readJson(alertsFile, []).filter((a: any) => !deletedAlertIds.includes(a.id));
  res.json({
    success: true,
    alerts: alertsList,
    deletedAlertIds,
    activeDeviceCount: Math.max(1, sseClients.length),
    timestamp: Date.now()
  });
});

app.post('/api/shared/alerts', (req, res) => {
  const body = req.body || {};
  let current = readJson(alertsFile, []);
  let deletedAlertIds: string[] = readJson(deletedAlertsFile, []);
  const nowIso = new Date().toISOString();

  if (body.alert && body.alert.id) {
    deletedAlertIds = deletedAlertIds.filter(id => id !== body.alert.id);
    writeJson(deletedAlertsFile, deletedAlertIds);

    const incoming = { ...body.alert, updatedAt: body.alert.updatedAt || nowIso };
    const idx = current.findIndex((a: any) => a.id === incoming.id);
    if (idx >= 0) {
      current[idx] = { ...current[idx], ...incoming };
    } else {
      current.unshift(incoming);
    }
  }

  writeJson(alertsFile, current);

  // Broadcast immediate alert notification to all devices
  notifyAllSseClients('ALERT_SYNC', {
    alerts: current,
    action: 'UPSERT',
    alert: body.alert,
    timestamp: Date.now()
  });

  res.json({ success: true, alerts: current });
});

app.delete('/api/shared/alerts', (req, res) => {
  const id = (req.query.id as string) || (req.body && req.body.id);
  if (!id) {
    return res.status(400).json({ success: false, error: 'ID requerido' });
  }

  let current = readJson(alertsFile, []);
  let deleted = readJson(deletedAlertsFile, []);

  deleted = Array.from(new Set([...deleted, id]));
  writeJson(deletedAlertsFile, deleted);

  current = current.filter((a: any) => a.id !== id);
  writeJson(alertsFile, current);

  notifyAllSseClients('ALERT_SYNC', {
    alerts: current,
    action: 'DELETE',
    deletedId: id,
    timestamp: Date.now()
  });

  res.json({ success: true, alerts: current });
});

// API: 24h Local Ephemeral Chat
app.get('/api/shared/chat', (req, res) => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000;
  const messages = readJson(chatFile, []);
  
  // Filter active messages (< 24h)
  const active = messages.filter((m: any) => m && m.timestamp && (now - m.timestamp) < maxAge);
  if (active.length !== messages.length) {
    writeJson(chatFile, active);
  }

  res.json({ success: true, messages: active });
});

app.post('/api/shared/chat', (req, res) => {
  const { text, senderName, senderId, senderDeviceId } = req.body || {};
  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, error: 'Mensagem vazia' });
  }

  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000;
  let messages = readJson(chatFile, []).filter((m: any) => m && m.timestamp && (now - m.timestamp) < maxAge);

  const newMsg = {
    id: `MSG-${now}-${Math.random().toString(36).substring(2, 7)}`,
    senderId: senderId || 'pilot',
    senderName: senderName || 'Prático',
    senderDeviceId: senderDeviceId || 'device',
    text: text.trim(),
    timestamp: now,
    expiresAt: now + maxAge
  };

  messages.push(newMsg);
  // Cap history at 500 messages to keep memory light
  if (messages.length > 500) messages = messages.slice(-500);
  writeJson(chatFile, messages);

  // Broadcast to all connected clients immediately
  notifyAllSseClients('CHAT_MESSAGE', {
    message: newMsg,
    messages
  });

  res.json({ success: true, message: newMsg, messages });
});

// API: Server-Sent Events (SSE) stream for live alerts, chat and DB sync
app.get('/api/shared/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const clientObj = { id: clientId, res };
  sseClients.push(clientObj);

  const initialAlerts = readJson(alertsFile, []);
  const deletedAlertIds = readJson(deletedAlertsFile, []);
  const activeAlerts = initialAlerts.filter((a: any) => !deletedAlertIds.includes(a.id));

  res.write(`data: ${JSON.stringify({
    type: 'CONNECTED',
    clientId,
    alerts: activeAlerts,
    clientCount: sseClients.length,
    timestamp: Date.now()
  })}\n\n`);

  req.on('close', () => {
    const idx = sseClients.findIndex(c => c.id === clientId);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

app.get(['/api/version', '/api/system/version'], (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.json({ version: '4.0.0', forceUpdate: false, timestamp: Date.now() });
});

// Vite or Static assets serving
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Porto de Praticagem Server running at http://0.0.0.0:${PORT}`);
  });
}

start();
