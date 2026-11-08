// Descarga los precios oficiales (MITECO), genera un JSON compacto para la app
// y mantiene un historial diario de 90 días.
// Uso: node scripts/build-data.mjs --out app/data --hist .datos [--input fichero.json]
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
const DIAS_HIST = 90;
const URL_API =
  'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/';

// clave corta -> campo de la API
export const FUELS = {
  g95: 'Precio Gasolina 95 E5',
  g95p: 'Precio Gasolina 95 E5 Premium',
  e10: 'Precio Gasolina 95 E10',
  g98: 'Precio Gasolina 98 E5',
  dsl: 'Precio Gasoleo A',
  dslp: 'Precio Gasoleo Premium',
  hvo: 'Precio Diésel Renovable',
  glp: 'Precio Gases licuados del petróleo',
  gnc: 'Precio Gas Natural Comprimido',
  adb: 'Precio Adblue',
};
const FUEL_KEYS = Object.keys(FUELS);
const HIST_FUELS = ['g95', 'g98', 'dsl', 'dslp'];

const num = (s) => {
  if (s == null || s === '') return null;
  const n = parseFloat(String(s).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

async function descargar() {
  if (args.input) return JSON.parse((await fs.readFile(args.input, 'utf8')).replace(/^﻿/, ''));
  let ultimoError;
  for (let intento = 1; intento <= 4; intento++) {
    try {
      const r = await fetch(URL_API, {
        headers: { Accept: 'application/json', 'User-Agent': 'gasolineras-pwa (GitHub Actions)' },
        signal: AbortSignal.timeout(120000),
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const txt = (await r.text()).replace(/^﻿/, '');
      const j = JSON.parse(txt);
      if (!Array.isArray(j.ListaEESSPrecio) || j.ListaEESSPrecio.length < 1000)
        throw new Error('Respuesta incompleta');
      return j;
    } catch (e) {
      ultimoError = e;
      console.warn(`Intento ${intento} fallido: ${e.message}`);
      await new Promise((res) => setTimeout(res, 15000 * intento));
    }
  }
  throw ultimoError;
}

async function leerJSON(f, def) {
  try {
    return JSON.parse(await fs.readFile(f, 'utf8'));
  } catch {
    return def;
  }
}

function fechaISO(fechaApi) {
  // "08/11/2026 17:21:26" -> "2026-11-08"
  const m = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(fechaApi || '');
  return m ? `${m[3]}-${m[2]}-${m[1]}` : new Date().toISOString().slice(0, 10);
}

const media = (arr) => {
  const v = arr.filter((x) => x != null);
  return v.length ? Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10 : null;
};

async function main() {
  const api = await descargar();
  const lista = api.ListaEESSPrecio;
  const hoy = fechaISO(api.Fecha);
  const provs = {};
  const est = [];

  for (const e of lista) {
    const lat = num(e['Latitud']);
    const lon = num(e['Longitud (WGS84)']);
    if (lat == null || lon == null) continue;
    const precios = FUEL_KEYS.map((k) => {
      const p = num(e[FUELS[k]]);
      return p ? Math.round(p * 1000) : 0; // milésimas de euro
    });
    if (!precios.some(Boolean)) continue;
    provs[e['IDProvincia']] = e['Provincia'];
    est.push([
      Number(e['IDEESS']),
      (e['Rótulo'] || '').trim(),
      Math.round(lat * 1e5) / 1e5,
      Math.round(lon * 1e5) / 1e5,
      (e['Dirección'] || '').trim(),
      (e['Localidad'] || e['Municipio'] || '').trim(),
      e['C.P.'] || '',
      e['IDProvincia'],
      (e['Horario'] || '').trim(),
      e['Margen'] || '',
      ...precios,
    ]);
  }

  await fs.mkdir(OUT, { recursive: true });
  const salida = {
    fecha: api.Fecha,
    generado: new Date().toISOString(),
    campos: ['id', 'rotulo', 'lat', 'lon', 'dir', 'loc', 'cp', 'prov', 'horario', 'margen', ...FUEL_KEYS],
    fuels: FUEL_KEYS,
    provs,
    est,
  };
  await fs.writeFile(path.join(OUT, 'stations.json'), JSON.stringify(salida));
  console.log(`stations.json: ${est.length} estaciones (${api.Fecha})`);

  // ---------- Historial ----------
  const HDIR = path.join(HIST, 'hist');
  await fs.mkdir(HDIR, { recursive: true });
  const idx = Object.fromEntries(HIST_FUELS.map((k) => [k, 10 + FUEL_KEYS.indexOf(k)]));
  const porProv = {};
  for (const r of est) (porProv[r[7]] ||= []).push(r);

  const resumen = await leerJSON(path.join(HIST, 'resumen.json'), { d: [], nac: {}, prov: {} });
  const nuevoDia = resumen.d[resumen.d.length - 1] !== hoy;
  const recorta = (a) => a.slice(-DIAS_HIST);
  const pon = (arr, v, len) => {
    // asegura longitud len-1 rellenando con null y pone v en la última posición
    arr = arr || [];
    while (arr.length < len - 1) arr.push(null);
    arr = arr.slice(0, len - 1);
    arr.push(v);
    return arr;
  };
  const fechas = nuevoDia ? recorta([...resumen.d, hoy]) : resumen.d;
  const corte = nuevoDia && resumen.d.length + 1 > DIAS_HIST ? 1 : 0;
  const L = fechas.length;
  const ajusta = (arr) => (corte ? (arr || []).slice(corte) : arr || []).slice(0, nuevoDia ? L - 1 : L - 1);

  const nac = {};
  for (const k of HIST_FUELS) nac[k] = [];

  for (const [pid, filas] of Object.entries(porProv)) {
    const f = path.join(HDIR, `p${pid}.json`);
    const h = await leerJSON(f, { d: [], s: {} });
    const s = {};
    const vistos = new Set();
    for (const r of filas) {
      const id = r[0];
      vistos.add(String(id));
      const prev = h.s[id] || {};
      const obj = {};
      for (const k of HIST_FUELS) {
        const v = r[idx[k]] || null;
        if (v == null && !prev[k]) continue;
        obj[k] = pon(ajusta(prev[k]), v, L);
      }
      if (Object.keys(obj).length) s[id] = obj;
    }
    // conservar estaciones que hoy no aparecen (si aún tienen datos en la ventana)
    for (const [id, prev] of Object.entries(h.s)) {
      if (vistos.has(id)) continue;
      const obj = {};
      for (const k of HIST_FUELS) {
        if (!prev[k]) continue;
        const a = pon(ajusta(prev[k]), null, L);
        if (a.some((x) => x != null)) obj[k] = a;
      }
      if (Object.keys(obj).length) s[id] = obj;
    }
    await fs.writeFile(f, JSON.stringify({ d: fechas, s }));

    const pr = (resumen.prov[pid] ||= {});
    for (const k of HIST_FUELS) {
      const vals = filas.map((r) => r[idx[k]] || null);
      pr[k] = pon(ajusta(pr[k]), media(vals), L);
      nac[k].push(...vals);
    }
  }
  for (const k of HIST_FUELS) resumen.nac[k] = pon(ajusta(resumen.nac[k]), media(nac[k]), L);
  resumen.d = fechas;
  await fs.writeFile(path.join(HIST, 'resumen.json'), JSON.stringify(resumen));

  // Copiar historial a la web
  await fs.mkdir(path.join(OUT, 'hist'), { recursive: true });
  await fs.cp(HDIR, path.join(OUT, 'hist'), { recursive: true });
  await fs.copyFile(path.join(HIST, 'resumen.json'), path.join(OUT, 'resumen.json'));
  console.log(`Historial: ${L} días (último ${hoy})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
