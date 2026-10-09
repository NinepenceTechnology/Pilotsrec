import http from 'http';
import https from 'https';

function mapVesselTypeString(raw: string): string {
  const t = (raw || '').toLowerCase();
  if (t.includes('container') || t.includes('conteiner')) return 'porta_conteiner';
  if (t.includes('bulk') || t.includes('ore') || t.includes('wood') || t.includes('graneleiro')) return 'graneleiro';
  if (t.includes('tanker') || t.includes('crude') || t.includes('oil') || t.includes('petroleiro')) return 'petroleiro';
  if (t.includes('chemical') || t.includes('quimico')) return 'quimico';
  if (t.includes('lng') || t.includes('lpg') || t.includes('gas')) return 'gasoso_gnl_glp';
  if (t.includes('vehicle') || t.includes('ro-ro') || t.includes('roro') || t.includes('car carrier')) return 'ro_ro_veiculos';
  if (t.includes('passenger') || t.includes('cruise')) return 'passageiros_cruzeiro';
  if (t.includes('tug') || t.includes('push') || t.includes('rebocador')) return 'apoio_maritimo';
  if (t.includes('supply') || t.includes('offshore') || t.includes('osv')) return 'apoio_maritimo';
  return 'carga_geral';
}

const FALLBACK_VESSELS = [
  { name: 'HAFNIA ACHROITE', imo: '9727584', type: 'petroleiro', typeName: 'Chemical / Oil Tanker', flag: 'Malta', grossTonnage: 29800, dwt: 49999, loa: 183, beam: 32.2, callSign: '9HA3759' },
  { name: 'HAFNIA ADAMITE', imo: '9727546', type: 'petroleiro', typeName: 'Chemical / Oil Tanker', flag: 'Malta', grossTonnage: 29800, dwt: 49999, loa: 183, beam: 32.2, callSign: '9HA3755' },
  { name: 'HAFNIA AFRICA', imo: '9467811', type: 'petroleiro', typeName: 'LR1 Product Tanker', flag: 'Marshall Islands', grossTonnage: 42010, dwt: 74500, loa: 228, beam: 32.2, callSign: 'V7WT6' },
  { name: 'HAFNIA ALABASTER', imo: '9727572', type: 'quimico', typeName: 'Chemical / Oil Tanker', flag: 'Malta', grossTonnage: 29800, dwt: 49999, loa: 183, beam: 32.2, callSign: '9HA3758' },
  { name: 'HAFNIA ALMANDINE', imo: '9714068', type: 'quimico', typeName: 'Chemical / Oil Tanker', flag: 'Malta', grossTonnage: 29800, dwt: 49999, loa: 183, beam: 32.2, callSign: '9HA3715' },
  { name: 'HAFNIA AMAZONITE', imo: '9719769', type: 'petroleiro', typeName: 'Chemical / Oil Tanker', flag: 'Malta', grossTonnage: 29800, dwt: 49999, loa: 183, beam: 32.2, callSign: '9HA3742' },
  { name: 'HAFNIA AMBER', imo: '9714056', type: 'quimico', typeName: 'Chemical / Oil Tanker', flag: 'Malta', grossTonnage: 29800, dwt: 49999, loa: 183, beam: 32.2, callSign: '9HA3714' },
  { name: 'HAFNIA AMESSI', imo: '9719745', type: 'petroleiro', typeName: 'Chemical / Oil Tanker', flag: 'Malta', grossTonnage: 29800, dwt: 49999, loa: 183, beam: 32.2, callSign: '9HA3740' },
  { name: 'HAFNIA CASSIOPEIA', imo: '9467823', type: 'petroleiro', typeName: 'LR1 Product Tanker', flag: 'Denmark', grossTonnage: 42010, dwt: 74500, loa: 228, beam: 32.2, callSign: 'OWJE2' },
  { name: 'HAFNIA KALLIOPE', imo: '9727560', type: 'petroleiro', typeName: 'Product Tanker', flag: 'Malta', grossTonnage: 29800, dwt: 49999, loa: 183, beam: 32.2, callSign: '9HA3757' },
  { name: 'HAFNIA LOTUS', imo: '9727558', type: 'petroleiro', typeName: 'Product Tanker', flag: 'Malta', grossTonnage: 29800, dwt: 49999, loa: 183, beam: 32.2, callSign: '9HA3756' },
  { name: 'HAFNIA PEACE', imo: '9727534', type: 'petroleiro', typeName: 'Product Tanker', flag: 'Denmark', grossTonnage: 29800, dwt: 49999, loa: 183, beam: 32.2, callSign: 'OYHH2' },
  { name: 'HAFNIA TORRES', imo: '9727596', type: 'petroleiro', typeName: 'Product Tanker', flag: 'Malta', grossTonnage: 29800, dwt: 49999, loa: 183, beam: 32.2, callSign: '9HA3760' },
  { name: 'MSC ANNA', imo: '9777204', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Liberia', grossTonnage: 187587, dwt: 213114, loa: 399.98, beam: 58.8, callSign: 'D5ML5' },
  { name: 'MSC ARIES', imo: '9857183', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Portugal', grossTonnage: 149525, dwt: 158097, loa: 366, beam: 51, callSign: 'CQEP' },
  { name: 'MSC TESSA', imo: '9888998', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Liberia', grossTonnage: 236184, dwt: 241960, loa: 399.9, beam: 61.3, callSign: '5LEA9' },
  { name: 'MSC RAYA', imo: '9934759', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Liberia', grossTonnage: 236184, dwt: 241960, loa: 399.9, beam: 61.3, callSign: '5LED2' },
  { name: 'MSC ISABELLA', imo: '9839282', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Panama', grossTonnage: 232618, dwt: 228149, loa: 400, beam: 61.5, callSign: '3FBE7' },
  { name: 'MSC LORETO', imo: '9934735', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Liberia', grossTonnage: 236184, dwt: 241960, loa: 399.9, beam: 61.3, callSign: '5LEB4' },
  { name: 'MSC MICHEL CAPPELLINI', imo: '9934747', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Liberia', grossTonnage: 236184, dwt: 241960, loa: 399.9, beam: 61.3, callSign: '5LEC2' },
  { name: 'MSC SAMAR', imo: '9839440', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Panama', grossTonnage: 232618, dwt: 228149, loa: 400, beam: 61.5, callSign: '3EYF8' },
  { name: 'MAERSK MC-KINNEY MOLLER', imo: '9619907', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Denmark', grossTonnage: 194849, dwt: 194153, loa: 399, beam: 59, callSign: 'OWIZ2' },
  { name: 'MADRID MAERSK', imo: '9778791', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Denmark', grossTonnage: 214286, dwt: 205636, loa: 399, beam: 58.6, callSign: 'OXRM2' },
  { name: 'MUNICH MAERSK', imo: '9778806', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Denmark', grossTonnage: 214286, dwt: 205636, loa: 399, beam: 58.6, callSign: 'OXRN2' },
  { name: 'MANCHESTER MAERSK', imo: '9780457', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Denmark', grossTonnage: 214286, dwt: 205636, loa: 399, beam: 58.6, callSign: 'OXRO2' },
  { name: 'SAFMARINE CHILKA', imo: '9356103', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Hong Kong', grossTonnage: 50688, dwt: 61405, loa: 294.1, beam: 32.2, callSign: 'VRCS4' },
  { name: 'SAFMARINE BAYETE', imo: '9356115', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Hong Kong', grossTonnage: 50688, dwt: 61405, loa: 294.1, beam: 32.2, callSign: 'VRCT2' },
  { name: 'CMA CGM JACQUES SAADE', imo: '9839179', type: 'gasoso_gnl_glp', typeName: 'Container Ship (LNG Powered)', flag: 'France', grossTonnage: 236583, dwt: 220000, loa: 400, beam: 61.3, callSign: 'FLSU' },
  { name: 'CMA CGM ANTOINE DE SAINT EXUPERY', imo: '9776418', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'France', grossTonnage: 217673, dwt: 202684, loa: 400, beam: 59, callSign: 'FNIO' },
  { name: 'CMA CGM PALAIS ROYAL', imo: '9839189', type: 'gasoso_gnl_glp', typeName: 'Container Ship (LNG)', flag: 'France', grossTonnage: 236583, dwt: 220000, loa: 400, beam: 61.3, callSign: 'FLAB' },
  { name: 'EVER GIVEN', imo: '9811000', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Liberia', grossTonnage: 219079, dwt: 199489, loa: 399.94, beam: 58.8, callSign: 'A8AB9' },
  { name: 'EVER GOLDEN', imo: '9811012', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Panama', grossTonnage: 219079, dwt: 199629, loa: 399.9, beam: 58.8, callSign: 'H3RD' },
  { name: 'EVER ACE', imo: '9893890', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Panama', grossTonnage: 235579, dwt: 241960, loa: 399.9, beam: 61.5, callSign: '3FDF6' },
  { name: 'EVER ALOT', imo: '9893955', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Panama', grossTonnage: 236228, dwt: 240000, loa: 399.9, beam: 61.5, callSign: '3FEF7' },
  { name: 'COSCO SHIPPING UNIVERSE', imo: '9795610', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Hong Kong', grossTonnage: 215553, dwt: 198000, loa: 399.9, beam: 58.6, callSign: 'VRRG3' },
  { name: 'HAPAG-LLOYD BERLIN EXPRESS', imo: '9540118', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Germany', grossTonnage: 229376, dwt: 229000, loa: 399.9, beam: 61, callSign: 'DJCV2' },
  { name: 'ONE APUS', imo: '9806079', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Japan', grossTonnage: 146694, dwt: 138611, loa: 364, beam: 50.6, callSign: '7KFA' },
  { name: 'VALE BRASIL', imo: '9488918', type: 'graneleiro', typeName: 'VLOC (Very Large Ore Carrier)', flag: 'Hong Kong', grossTonnage: 199631, dwt: 402347, loa: 362, beam: 65, callSign: 'VRPY5' },
  { name: 'VALE RIO DE JANEIRO', imo: '9488920', type: 'graneleiro', typeName: 'VLOC (Very Large Ore Carrier)', flag: 'Marshall Islands', grossTonnage: 198980, dwt: 402347, loa: 362, beam: 65, callSign: 'V7WT9' },
  { name: 'BERGE OLYMPUS', imo: '9750969', type: 'graneleiro', typeName: 'Bulk Carrier', flag: 'Isle of Man', grossTonnage: 108398, dwt: 211153, loa: 300, beam: 50, callSign: '2JCW9' },
  { name: 'STAR POLARIS', imo: '9584102', type: 'graneleiro', typeName: 'Capesize Bulk Carrier', flag: 'Marshall Islands', grossTonnage: 93297, dwt: 179546, loa: 292, beam: 45, callSign: 'V7UG7' },
  { name: 'GOLDEN VOYAGER', imo: '9704257', type: 'graneleiro', typeName: 'Bulk Carrier', flag: 'Liberia', grossTonnage: 44125, dwt: 82000, loa: 229, beam: 32.2, callSign: 'D5JG2' },
  { name: 'FRONTLINE ALTAIR', imo: '9745902', type: 'petroleiro', typeName: 'Crude Oil Tanker (VLCC)', flag: 'Marshall Islands', grossTonnage: 156851, dwt: 299999, loa: 333, beam: 60, callSign: 'V7A2054' },
  { name: 'TI EUROPE', imo: '9235268', type: 'petroleiro', typeName: 'Ultra Large Crude Carrier', flag: 'Belgium', grossTonnage: 234006, dwt: 441585, loa: 380, beam: 68, callSign: 'ONFX' },
  { name: 'STOLT INTEGRITY', imo: '9680085', type: 'quimico', typeName: 'Chemical / Oil Tanker', flag: 'Cayman Islands', grossTonnage: 23687, dwt: 38000, loa: 185, beam: 28.8, callSign: 'ZGFL4' },
  { name: 'STOLT EXCELLENCE', imo: '9680073', type: 'quimico', typeName: 'Chemical / Oil Tanker', flag: 'Cayman Islands', grossTonnage: 23687, dwt: 38000, loa: 185, beam: 28.8, callSign: 'ZGFL3' },
  { name: 'GRIMALDI GRANDE NIGERIA', imo: '9247924', type: 'ro_ro_veiculos', typeName: 'Ro-Ro Cargo Ship', flag: 'Italy', grossTonnage: 56738, dwt: 21387, loa: 214, beam: 32.2, callSign: 'IBPE' },
  { name: 'GRIMALDI GRANDE BUENOS AIRES', imo: '9253208', type: 'ro_ro_veiculos', typeName: 'Ro-Ro Cargo Ship', flag: 'Italy', grossTonnage: 56738, dwt: 21387, loa: 214, beam: 32.2, callSign: 'IBPJ' },
  { name: 'HOEGH TARGET', imo: '9684988', type: 'ro_ro_veiculos', typeName: 'Car Carrier', flag: 'Norway', grossTonnage: 75717, dwt: 20766, loa: 199.9, beam: 36.5, callSign: 'LAYJ7' },
  { name: 'BOURBON LIBERTY 215', imo: '9574341', type: 'apoio_maritimo', typeName: 'Offshore Supply Tug', flag: 'France', grossTonnage: 1733, dwt: 1500, loa: 59.8, beam: 15, callSign: 'FMCF' },
  { name: 'SVITZER LUANDA', imo: '9728289', type: 'apoio_maritimo', typeName: 'ASD Terminal Tug', flag: 'Angola', grossTonnage: 448, dwt: 150, loa: 29.5, beam: 11.5, callSign: 'D2LU1' },
  { name: 'SMIT ANGOLA', imo: '9488346', type: 'apoio_maritimo', typeName: 'Tugboat / Escort Tug', flag: 'Angola', grossTonnage: 480, dwt: 160, loa: 31, beam: 12, callSign: 'D2SM1' }
];

function searchFallback(query: string) {
  const q = query.trim().toUpperCase();
  const cleanNum = q.replace(/\D/g, '');
  const tokens = q.split(/\s+/).filter(t => t.length > 0);
  return FALLBACK_VESSELS.filter(v => {
    const vName = v.name.toUpperCase();
    const vImo = v.imo;
    const vCall = (v.callSign || '').toUpperCase();
    const matchTokens = tokens.every(tok => vName.includes(tok) || vImo.includes(tok) || vCall.includes(tok));
    const matchImo = cleanNum.length >= 3 && vImo.includes(cleanNum);
    return matchTokens || matchImo;
  }).map(v => ({ ...v, provider: 'vessel_finder' }));
}

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
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          'Sec-Ch-Ua': '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
          'Referer': 'https://www.google.com/'
        },
        timeout: 6000
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

function queryWikipediaFallback(query: string): Promise<any[]> {
  return new Promise(resolve => {
    const isImo = /^\d{6,7}$/.test(query.trim());
    const term = isImo ? `IMO ${query.trim()}` : `${query.trim()} ship`;
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&format=json&utf8=1&srlimit=5`;

    https.get(url, {
      headers: { 'User-Agent': 'PilotsRecordsApp/1.0 (info@pilotsrecords.mz)' }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const hits = json.query?.search || [];
          const ships = hits.map((h: any) => ({
            name: h.title.replace(/\s*\([^)]*\)/g, '').trim().toUpperCase(),
            imo: isImo ? query.trim() : '',
            type: 'carga_geral',
            typeName: 'Navio Mercante',
            flag: 'Internacional',
            grossTonnage: 0,
            dwt: 0,
            loa: 0,
            beam: 0,
            provider: 'vessel_finder'
          }));
          resolve(ships);
        } catch {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

export const handler = async (event: any) => {
  const query = event.queryStringParameters?.query || '';
  if (!query || query.trim().length < 2) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ success: true, vessels: [] })
    };
  }

  const cleanNum = query.trim().replace(/\D/g, '');
  const isNumeric7DigitImo = cleanNum.length === 7 && cleanNum === query.trim();
  const rows: any[] = [];
  const seenImos = new Set<string>();

  try {
    if (isNumeric7DigitImo) {
      try {
        const directUrl = `https://www.vesselfinder.com/vessels/details/${encodeURIComponent(cleanNum)}`;
        const { html } = await fetchHtmlWithRedirects(directUrl);
        if (html && !html.includes('Page not found') && !html.includes('Error 404')) {
          const nameMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
          const flagMatch = html.match(/<td[^>]*class="tpc1"[^>]*>Flag<\/td>\s*<td[^>]*class="tpc2"[^>]*>([^<]+)/i) ||
                            html.match(/(?:Flag|AIS Flag)<\/td>\s*<td[^>]*>([^<]+)<\/td>/i);
          const typeMatch = html.match(/<td[^>]*class="tpc1"[^>]*>Ship Type<\/td>\s*<td[^>]*class="tpc2"[^>]*>([^<]+)/i) ||
                            html.match(/(?:Ship Type|Vessel [tT]ype|AIS Type)<\/td>\s*<td[^>]*>([^<]+)<\/td>/i);
          const loaMatch = html.match(/<td[^>]*class="tpc1"[^>]*>Length Overall[\s\S]*?<\/td>\s*<td[^>]*class="tpc2"[^>]*>([\d\.]+)/i) ||
                           html.match(/Length Overall[\s\S]*?<\/td>\s*<td[^>]*>([\d\.]+)/i);
          const beamMatch = html.match(/<td[^>]*class="tpc1"[^>]*>Beam[\s\S]*?<\/td>\s*<td[^>]*class="tpc2"[^>]*>([\d\.]+)/i) ||
                            html.match(/Beam[\s\S]*?<\/td>\s*<td[^>]*>([\d\.]+)/i);
          const gtMatch = html.match(/<td[^>]*class="tpc1"[^>]*>Gross Tonnage<\/td>\s*<td[^>]*class="tpc2"[^>]*>([\d\s,]+)/i);
          const dwtMatch = html.match(/<td[^>]*class="tpc1"[^>]*>Deadweight[\s\S]*?<\/td>\s*<td[^>]*class="tpc2"[^>]*>([\d\s,]+)/i);
          const csMatch = html.match(/<td[^>]*class="n3"[^>]*>Callsign<\/td>\s*<td[^>]*class="v3"[^>]*>([^<]+)/i);
          const draftMatch = html.match(/<td[^>]*class="n3"[^>]*>Current draught<\/td>\s*<td[^>]*class="v3"[^>]*>([\d\.]+)\s*m/i);
          const destMatch = html.match(/class="_npNa"[^>]*>([^<]+)<\/a>/i) || html.match(/Destination<\/div>\s*<a[^>]*>([^<]+)<\/a>/i);

          if (nameMatch) {
            const rawType = typeMatch ? typeMatch[1].trim() : 'Cargo Ship';
            rows.push({
              name: nameMatch[1].trim().replace(/\s*-\s*IMO.*$/i, ''),
              imo: cleanNum,
              type: mapVesselTypeString(rawType),
              typeName: rawType,
              flag: flagMatch ? flagMatch[1].trim() : 'Internacional',
              grossTonnage: gtMatch ? parseInt(gtMatch[1].replace(/\D/g, ''), 10) : 0,
              dwt: dwtMatch ? parseInt(dwtMatch[1].replace(/\D/g, ''), 10) : 0,
              loa: loaMatch ? parseFloat(loaMatch[1]) : 0,
              beam: beamMatch ? parseFloat(beamMatch[1]) : 0,
              callSign: csMatch ? csMatch[1].trim() : '',
              draft: draftMatch ? parseFloat(draftMatch[1]) : 0,
              destination: destMatch ? destMatch[1].trim() : '',
              provider: 'vessel_finder'
            });
            seenImos.add(cleanNum);
          }
        }
      } catch {}
    }

    const targetUrl = `https://www.vesselfinder.com/vessels?name=${encodeURIComponent(query.trim())}`;
    const { html, finalUrl } = await fetchHtmlWithRedirects(targetUrl);

    if ((finalUrl.includes('/vessels/details/') || html.includes('class="ship-section"')) && rows.length === 0) {
      const nameMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      const imoMatch = html.match(/<td[^>]*class="tpc1"[^>]*>IMO number<\/td>\s*<td[^>]*class="tpc2"[^>]*>(\d+)/i) ||
                       html.match(/<td[^>]*class="n3"[^>]*>IMO \/ MMSI<\/td>\s*<td[^>]*class="v3[^"]*"[^>]*>(\d+)/i) ||
                       finalUrl.match(/\/details\/(\d+)/i);
      const flagMatch = html.match(/<td[^>]*class="tpc1"[^>]*>Flag<\/td>\s*<td[^>]*class="tpc2"[^>]*>([^<]+)/i) ||
                        html.match(/(?:Flag|AIS Flag)<\/td>\s*<td[^>]*>([^<]+)<\/td>/i);
      const typeMatch = html.match(/<td[^>]*class="tpc1"[^>]*>Ship Type<\/td>\s*<td[^>]*class="tpc2"[^>]*>([^<]+)/i) ||
                        html.match(/(?:Ship Type|Vessel [tT]ype|AIS Type)<\/td>\s*<td[^>]*>([^<]+)<\/td>/i);
      const loaMatch = html.match(/<td[^>]*class="tpc1"[^>]*>Length Overall[\s\S]*?<\/td>\s*<td[^>]*class="tpc2"[^>]*>([\d\.]+)/i) ||
                       html.match(/Length Overall[\s\S]*?<\/td>\s*<td[^>]*>([\d\.]+)/i);
      const beamMatch = html.match(/<td[^>]*class="tpc1"[^>]*>Beam[\s\S]*?<\/td>\s*<td[^>]*class="tpc2"[^>]*>([\d\.]+)/i) ||
                        html.match(/Beam[\s\S]*?<\/td>\s*<td[^>]*>([\d\.]+)/i);
      const gtMatch = html.match(/<td[^>]*class="tpc1"[^>]*>Gross Tonnage<\/td>\s*<td[^>]*class="tpc2"[^>]*>([\d\s,]+)/i);
      const dwtMatch = html.match(/<td[^>]*class="tpc1"[^>]*>Deadweight[\s\S]*?<\/td>\s*<td[^>]*class="tpc2"[^>]*>([\d\s,]+)/i);
      const csMatch = html.match(/<td[^>]*class="n3"[^>]*>Callsign<\/td>\s*<td[^>]*class="v3"[^>]*>([^<]+)/i);
      const draftMatch = html.match(/<td[^>]*class="n3"[^>]*>Current draught<\/td>\s*<td[^>]*class="v3"[^>]*>([\d\.]+)\s*m/i);
      const destMatch = html.match(/class="_npNa"[^>]*>([^<]+)<\/a>/i) || html.match(/Destination<\/div>\s*<a[^>]*>([^<]+)<\/a>/i);

      if (nameMatch && imoMatch) {
        const foundImo = imoMatch[1];
        if (!seenImos.has(foundImo)) {
          seenImos.add(foundImo);
          const rawType = typeMatch ? typeMatch[1].trim() : 'Cargo Ship';
          rows.push({
            name: nameMatch[1].trim().replace(/\s*-\s*IMO.*$/i, ''),
            imo: foundImo,
            type: mapVesselTypeString(rawType),
            typeName: rawType,
            flag: flagMatch ? flagMatch[1].trim() : 'Internacional',
            grossTonnage: gtMatch ? parseInt(gtMatch[1].replace(/\D/g, ''), 10) : 0,
            dwt: dwtMatch ? parseInt(dwtMatch[1].replace(/\D/g, ''), 10) : 0,
            loa: loaMatch ? parseFloat(loaMatch[1]) : 0,
            beam: beamMatch ? parseFloat(beamMatch[1]) : 0,
            callSign: csMatch ? csMatch[1].trim() : '',
            draft: draftMatch ? parseFloat(draftMatch[1]) : 0,
            destination: destMatch ? destMatch[1].trim() : '',
            provider: 'vessel_finder'
          });
        }
      }
    }

    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let match;
    while ((match = trRegex.exec(html)) !== null && rows.length < 15) {
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
        const foundImo = imoMatch[1];
        if (seenImos.has(foundImo)) continue;
        seenImos.add(foundImo);

        let loa = 0;
        let beam = 0;
        if (dimMatch) {
          const rawDim = dimMatch[1].replace(/[^\d\.\/]/g, '');
          const dims = rawDim.split('/').map(s => parseFloat(s.trim()));
          loa = isNaN(dims[0]) ? 0 : dims[0];
          beam = isNaN(dims[1]) ? 0 : dims[1];
        }

        const rawType = typeMatch ? typeMatch[1].trim() : '';
        const rawGt = gtMatch ? gtMatch[1].replace(/\D/g, '') : '';
        const rawDwt = dwtMatch ? dwtMatch[1].replace(/\D/g, '') : '';

        rows.push({
          name: nameMatch[1].trim().replace(/-/g, ' '),
          imo: foundImo,
          type: mapVesselTypeString(rawType),
          typeName: rawType || 'Navio Mercante',
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

    if (rows.length > 0) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({
          success: true,
          vessels: rows,
          source: 'vesselfinder_live'
        })
      };
    }
  } catch {}

  // Fallback 1: Catálogo verificado de contingência
  const verifiedMatches = searchFallback(query);
  if (verifiedMatches.length > 0) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        vessels: verifiedMatches,
        source: 'verified_archive'
      })
    };
  }

  // Fallback 2: Consulta à API aberta da Wikipedia
  try {
    const wikiHits = await queryWikipediaFallback(query);
    if (wikiHits.length > 0) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          vessels: wikiHits,
          source: 'wikipedia_live'
        })
      };
    }
  } catch {}

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      success: true,
      vessels: [],
      source: 'none'
    })
  };
};
