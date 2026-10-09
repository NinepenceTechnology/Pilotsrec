import http from 'http';
import https from 'https';

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
  { name: 'EVER GIVEN', imo: '9811000', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Liberia', grossTonnage: 219079, dwt: 199489, loa: 399.94, beam: 58.8, callSign: 'A8AB9' },
  { name: 'EVER ACE', imo: '9893890', type: 'porta_conteiner', typeName: 'Container Ship', flag: 'Panama', grossTonnage: 235579, dwt: 241960, loa: 399.9, beam: 61.5, callSign: '3FDF6' },
  { name: 'VALE BRASIL', imo: '9488918', type: 'graneleiro', typeName: 'VLOC', flag: 'Hong Kong', grossTonnage: 199631, dwt: 402347, loa: 362, beam: 65, callSign: 'VRPY5' }
];

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

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const imo = (req.query?.imo as string) || '';
  if (!imo || imo.trim().length < 4) {
    return res.status(200).json({ success: false, error: 'IMO inválido' });
  }

  const cleanImo = imo.trim().replace(/\D/g, '');
  const fallback = FALLBACK_VESSELS.find(v => v.imo === cleanImo);

  try {
    const targetUrl = `https://www.vesselfinder.com/vessels/details/${encodeURIComponent(cleanImo)}`;
    const { html } = await fetchHtmlWithRedirects(targetUrl);

    const nameMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const csMatch = html.match(/<td[^>]*class="n3"[^>]*>Callsign<\/td>\s*<td[^>]*class="v3"[^>]*>([^<]+)/i) ||
                    html.match(/(?:Callsign|Call Sign)<\/td>\s*<td[^>]*>([^<]+)<\/td>/i);
    const draftMatch = html.match(/<td[^>]*class="n3"[^>]*>Current draught<\/td>\s*<td[^>]*class="v3"[^>]*>([\d\.]+)\s*m/i) ||
                       html.match(/Current draught<\/td>\s*<td[^>]*>([\d\.]+)\s*m/i);
    const destMatch = html.match(/class="_npNa"[^>]*>([^<]+)<\/a>/i) ||
                      html.match(/Destination<\/div>\s*<a[^>]*>([^<]+)<\/a>/i);
    const loaMatch = html.match(/<td[^>]*class="tpc1"[^>]*>Length Overall[\s\S]*?<\/td>\s*<td[^>]*class="tpc2"[^>]*>([\d\.]+)/i) ||
                     html.match(/Length Overall[\s\S]*?<\/td>\s*<td[^>]*>([\d\.]+)/i);
    const beamMatch = html.match(/<td[^>]*class="tpc1"[^>]*>Beam[\s\S]*?<\/td>\s*<td[^>]*class="tpc2"[^>]*>([\d\.]+)/i) ||
                      html.match(/Beam[\s\S]*?<\/td>\s*<td[^>]*>([\d\.]+)/i);
    const gtMatch = html.match(/<td[^>]*class="tpc1"[^>]*>Gross Tonnage<\/td>\s*<td[^>]*class="tpc2"[^>]*>([\d\s,]+)/i);
    const dwtMatch = html.match(/<td[^>]*class="tpc1"[^>]*>Deadweight[\s\S]*?<\/td>\s*<td[^>]*class="tpc2"[^>]*>([\d\s,]+)/i);
    const flagMatch = html.match(/<td[^>]*class="tpc1"[^>]*>Flag<\/td>\s*<td[^>]*class="tpc2"[^>]*>([^<]+)/i) ||
                      html.match(/(?:Flag|AIS Flag)<\/td>\s*<td[^>]*>([^<]+)<\/td>/i);
    const typeMatch = html.match(/<td[^>]*class="tpc1"[^>]*>Ship Type<\/td>\s*<td[^>]*class="tpc2"[^>]*>([^<]+)/i) ||
                      html.match(/(?:Ship Type|Vessel [tT]ype|AIS Type)<\/td>\s*<td[^>]*>([^<]+)<\/td>/i);

    return res.status(200).json({
      success: true,
      name: nameMatch ? nameMatch[1].trim() : (fallback?.name || ''),
      callSign: csMatch ? csMatch[1].trim() : (fallback?.callSign || ''),
      draft: draftMatch ? parseFloat(draftMatch[1]) : null,
      destination: destMatch ? destMatch[1].trim() : '',
      loa: loaMatch ? parseFloat(loaMatch[1]) : (fallback?.loa || 0),
      beam: beamMatch ? parseFloat(beamMatch[1]) : (fallback?.beam || 0),
      grossTonnage: gtMatch ? parseInt(gtMatch[1].replace(/\D/g, ''), 10) : (fallback?.grossTonnage || 0),
      dwt: dwtMatch ? parseInt(dwtMatch[1].replace(/\D/g, ''), 10) : (fallback?.dwt || 0),
      flag: flagMatch ? flagMatch[1].trim() : (fallback?.flag || ''),
      typeName: typeMatch ? typeMatch[1].trim() : (fallback?.typeName || '')
    });
  } catch (err: any) {
    if (fallback) {
      return res.status(200).json({
        success: true,
        name: fallback.name,
        callSign: fallback.callSign || '',
        draft: null,
        destination: '',
        loa: fallback.loa || 0,
        beam: fallback.beam || 0,
        grossTonnage: fallback.grossTonnage || 0,
        dwt: fallback.dwt || 0,
        flag: fallback.flag || '',
        typeName: fallback.typeName || ''
      });
    }
    return res.status(200).json({
      success: false,
      error: err.message
    });
  }
}
