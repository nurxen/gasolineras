// Descarga los puntos de recarga de España desde OpenStreetMap (Overpass)
// una vez al día y los guarda compactos. Si falla, se conserva el fichero anterior.
// Uso: node scripts/build-chargers.mjs --out app/data --hist .datos
import fs from 'node:fs/promises';
import path from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1]]);
    return acc;
  }, [])
);
const OUT = args.out || 'app/data';
const HIST = args.hist || '.datos';
const CACHE = path.join(HIST, 'chargers.json');
const MAX_EDAD_H = 20;

const SERVIDORES = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];
// Dos rectángulos (península + Baleares, y Canarias): más rápido que buscar por área
const QUERY = `[out:json][timeout:300];
(
  nwr["amenity"="charging_station"](35.8,-9.6,43.9,4.5);
  nwr["amenity"="charging_station"](27.5,-18.4,29.5,-13.3);
  nwr["amenity"="charging_station"](35.2,-5.5,35.95,-2.8);
);
out center tags;`;

// tipo corto -> etiqueta OSM
export const SOCKETS = {
  ccs: 'type2_combo',
  t2: 'type2',
  t2c: 'type2_cable',
  chademo: 'chademo',
  schuko: 'schuko',
  tesla: 'tesla_supercharger',
};

const kw = (v) => {
  if (!v) return 0;
  const m = /([\d.,]+)\s*(kw|w|kva)?/i.exec(String(v));
  if (!m) return 0;
  let n = parseFloat(m[1].replace(',', '.'));
  if (m[2] && m[2].toLowerCase() === 'w') n /= 1000;
  if (!m[2] && n > 1000) n /= 1000; // valores en W sin unidad
  return Math.round(n * 10) / 10;
};

// etiqueta charge de OSM, p. ej. "0.49 EUR/kWh" o "0,45 €/kWh"
function precioOSM(t) {
  const m = /([\d]+[.,]?\d*)\s*(?:€|eur)\s*\/\s*kwh/i.exec(t.charge || t['charge:conditional'] || '');
  const v = m ? parseFloat(m[1].replace(',', '.')) : null;
  return v > 0 && v < 3 ? v : null;
}

export function compactar(elements) {
  const out = [];
  for (const el of elements) {
    const t = el.tags || {};
    if (['private', 'no'].includes(t.access)) continue;
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (lat == null) continue;
    const sockets = [];
    for (const [k, osm] of Object.entries(SOCKETS)) {
      const v = t['socket:' + osm];
      if (!v || v === 'no' || v === '0') continue;
      const n = parseInt(v, 10) || 1;
      sockets.push([k, n, kw(t[`socket:${osm}:output`])]);
    }
    const maxKw = Math.max(0, ...sockets.map((s) => s[2]), kw(t['charging_station:output']), kw(t.maxpower));
    const fee = t.fee === 'no' ? 0 : t.fee === 'yes' ? 1 : null;
    out.push([
      Math.round(lat * 1e5) / 1e5,
      Math.round(lon * 1e5) / 1e5,
      t.name || '',
      t.operator || t.network || t.brand || '',
      sockets,
      maxKw,
      fee,
      t.opening_hours || '',
      parseInt(t.capacity, 10) || 0,
      el.type[0] + el.id,
      precioOSM(t),
    ]);
  }
  return out;
}

async function descargar() {
  for (const url of SERVIDORES) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(QUERY),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'gasolineras-pwa (GitHub Actions)' },
        signal: AbortSignal.timeout(330000),
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      if (!j.elements || j.elements.length < 1000) throw new Error('Respuesta incompleta');
      return j.elements;
    } catch (e) {
      console.warn(`Overpass ${url}: ${e.message}`);
    }
  }
  return null;
}

async function main() {
  let cache = null;
  try {
    cache = JSON.parse(await fs.readFile(CACHE, 'utf8'));
  } catch {}
  const edadH = cache ? (Date.now() - Date.parse(cache.generado)) / 36e5 : Infinity;
  if (edadH > MAX_EDAD_H || args.force) {
    const el = await descargar();
    if (el) {
      cache = { generado: new Date().toISOString(), fuente: 'OpenStreetMap', pts: compactar(el) };
      await fs.mkdir(HIST, { recursive: true });
      await fs.writeFile(CACHE, JSON.stringify(cache));
      console.log(`chargers.json: ${cache.pts.length} puntos`);
    } else console.warn('No se pudieron actualizar los puntos de recarga; se usa la copia anterior');
  } else console.log(`chargers.json reciente (${edadH.toFixed(1)} h), no se descarga`);
  if (cache) {
    await fs.mkdir(OUT, { recursive: true });
    await fs.writeFile(path.join(OUT, 'chargers.json'), JSON.stringify(cache));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(0); // no romper el despliegue por los cargadores
});
