/* GasoCerca — gasolineras y puntos de recarga cerca de ti.
   Datos: MITECO (precios oficiales) y OpenStreetMap (recarga). Sin servidor propio. */
'use strict';

// ---------------------------------------------------------------- Constantes
const APP_VERSION = '1.1.0';
const NOVEDADES = {
  '1.1.0': [
    '🔄 Aviso de <b>nueva versión</b>: cuando publiques cambios en GitHub, la app te lo dirá y se actualiza con un toque.',
    '📉 <b>Subidas y bajadas</b>: cada gasolinera muestra si su precio ha subido o bajado desde ayer (aparece a partir del segundo día de historial).',
    '↻ Botón para <b>actualizar</b> ubicación y precios, y aviso de cuánto hace que se actualizaron.',
    '📤 <b>Compartir</b> una gasolinera o un cargador por WhatsApp, Telegram, etc.',
    '⛽ <b>Calculadora de importe</b>: cuántos litros te dan 20, 30 o 50 € en cada gasolinera.',
  ],
};
const FUEL_NAMES = {
  g95: 'Gasolina 95', g95p: 'Gasolina 95 Premium', e10: 'Gasolina 95 E10', g98: 'Gasolina 98',
  dsl: 'Diésel', dslp: 'Diésel Premium', hvo: 'Diésel renovable (HVO)', glp: 'GLP (autogás)',
  gnc: 'Gas natural (GNC)', adb: 'AdBlue',
};
const FUEL_SHORT = { g95: '95', g95p: '95+', e10: 'E10', g98: '98', dsl: 'Diésel', dslp: 'Diésel+', hvo: 'HVO', glp: 'GLP', gnc: 'GNC', adb: 'AdBlue' };
const ES_GASOLINA = (f) => ['g95', 'g95p', 'e10', 'g98'].includes(f);
const SOCKET_NAMES = { ccs: 'CCS2', t2: 'Tipo 2', t2c: 'Tipo 2 (cable)', chademo: 'CHAdeMO', schuko: 'Schuko', tesla: 'Tesla' };
const MITECO_URL = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/';
const MITECO_FUELS = {
  g95: 'Precio Gasolina 95 E5', g95p: 'Precio Gasolina 95 E5 Premium', e10: 'Precio Gasolina 95 E10',
  g98: 'Precio Gasolina 98 E5', dsl: 'Precio Gasoleo A', dslp: 'Precio Gasoleo Premium',
  hvo: 'Precio Diésel Renovable', glp: 'Precio Gases licuados del petróleo', gnc: 'Precio Gas Natural Comprimido', adb: 'Precio Adblue',
};
const MARCAS_CONOCIDAS = ['REPSOL', 'MOEVE', 'CEPSA', 'GALP', 'BP', 'SHELL', 'PETRONOR', 'CAMPSA', 'AVIA', 'Q8', 'ENI', 'DISA',
  'TAMOIL', 'VALCARCE', 'AGLA', 'MEROIL', 'BEROIL', 'NATURGY', 'BALLENOIL', 'PLENERGY', 'PLENOIL', 'PETROPRIX', 'ESCLATOIL',
  'BONAREA', 'CARREFOUR', 'ALCAMPO', 'EROSKI', 'GASEXPRESS', 'EASYGAS', 'PETROCAT', 'AUTONETOIL', 'SUPECO', 'FAST FUEL',
  'COSTCO', 'LECLERC', 'SIMPLY', 'HAM', 'GALP', 'ESSO', 'TOTAL'];
const LOWCOST_DEF = ['BALLENOIL', 'PLENERGY', 'PLENOIL', 'PETROPRIX', 'ESCLATOIL', 'BONAREA', 'CARREFOUR', 'ALCAMPO', 'EROSKI',
  'GASEXPRESS', 'EASYGAS', 'PETROCAT', 'AUTONETOIL', 'AUTONET&OIL', 'SUPECO', 'FAST FUEL', 'COSTCO', 'LECLERC', 'SIMPLY',
  'HAM', 'VALCARCE', 'BEROIL', 'GM OIL', 'GMOIL', 'DST'];

const DEF = {
  modo: 'fuel', vista: 'lista',
  radio: 5, fuel: 'g95', orden: 'precio', lowcost: false, abiertas: false, marcas: [],
  litros: 40, consumo: 5, // híbrido
  evRadio: 10, conectores: ['ccs', 't2', 't2c'], potMin: 0, gratis: false, evOrden: 'dist', sinDatos: true,
  evModelo: 'Leapmotor T03', bat: 37.3, acKw: 6.6, dcKw: 48, evConsumo: 13.5, kwhPrecio: 0.45, kwhCasa: 0.15,
  lowcostList: LOWCOST_DEF,
};

// ---------------------------------------------------------------- Estado
const S = {
  cfg: { ...DEF, ...load('cfg', {}) },
  favs: new Set(load('favs', [])),
  favsEv: new Set(load('favsEv', [])),
  pos: load('pos', null), // {lat, lon, txt, gps}
  est: [], fecha: '', provs: {},
  pts: null, ptsFuente: '', ptsCargando: false,
  resumen: null, hist: {},
  limite: 60,
  installEvt: null,
};
function load(k, d) { try { const v = localStorage.getItem('gc.' + k); return v ? JSON.parse(v) : d; } catch { return d; } }
function save(k, v) { try { localStorage.setItem('gc.' + k, JSON.stringify(v)); } catch {} }
const saveCfg = () => save('cfg', S.cfg);

// ---------------------------------------------------------------- Utilidades
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const eur = (n, d = 2) => n.toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d }) + ' €';
const pr = (m) => (m / 1000).toLocaleString('es-ES', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const km = (d) => (d < 1 ? Math.round(d * 1000) + ' m' : d.toLocaleString('es-ES', { maximumFractionDigits: d < 10 ? 1 : 0 }) + ' km');
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim();
const titulo = (s) => String(s || '').toLowerCase().replace(/(^|[\s(/-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
function dist(a, b, c, d) {
  const R = 6371, r = Math.PI / 180;
  const x = Math.sin(((c - a) * r) / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(((d - b) * r) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600);
}
function percentil(sorted, p) { if (!sorted.length) return 0; return sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))]; }

// Marca normalizada a partir del rótulo
const marcaCache = new Map();
function marca(rot) {
  if (marcaCache.has(rot)) return marcaCache.get(rot);
  const n = norm(rot);
  let m = MARCAS_CONOCIDAS.find((b) => new RegExp('(^|[^A-Z])' + b.replace(/[.*+?^${}()|[\]\\&]/g, '\\$&') + '([^A-Z]|$)').test(n));
  if (m === 'CEPSA') m = 'MOEVE';
  if (m === 'PLENOIL') m = 'PLENERGY';
  if (!m) m = !n || /^N[ºO°]|SIN ROTULO|^\d/.test(n) ? 'SIN MARCA' : n.replace(/\s+(S\.?L\.?|S\.?A\.?)$/, '');
  marcaCache.set(rot, m);
  return m;
}
const nombreMarca = (m) => (m === 'MOEVE' ? 'Moeve (Cepsa)' : m === 'SIN MARCA' ? 'Sin marca' : m === 'BP' || m === 'Q8' || m === 'HAM' || m === 'DST' ? m : titulo(m));
function esLowcost(e) {
  const n = norm(e.rot);
  return S.cfg.lowcostList.some((b) => b && n.includes(norm(b)));
}

// ---------------------------------------------------------------- Horarios
const DIAS = 'LMXJVSD';
function horarioHoy(h, fecha = new Date()) {
  // Devuelve true (abierta), false (cerrada) o null (desconocido)
  if (!h) return null;
  if (/24\s*H/i.test(h) && /^L-D/i.test(h)) return true;
  const segs = h.split(';').map((s) => s.trim()).filter(Boolean);
  const reglas = [];
  for (const s of segs) {
    const m = /^([LMXJVSD])(?:-([LMXJVSD]))?\s*:\s*(.+)$/i.exec(s);
    if (!m) return null;
    const a = DIAS.indexOf(m[1].toUpperCase()), b = m[2] ? DIAS.indexOf(m[2].toUpperCase()) : a;
    const rangos = [];
    if (/24\s*H/i.test(m[3])) rangos.push([0, 1440]);
    for (const r of m[3].matchAll(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/g)) {
      const ini = +r[1] * 60 + +r[2]; let fin = +r[3] * 60 + +r[4];
      if (fin === 0 || fin === 1439) fin = 1440;
      rangos.push([ini, fin <= ini ? fin + 1440 : fin]);
    }
    if (!rangos.length) return null;
    for (let d = a; d <= (b < a ? b + 7 : b); d++) reglas.push([d % 7, rangos]);
  }
  // Rótulo con un único día "L" suele significar todos los días en estos datos
  if (segs.length === 1 && reglas.length === 1) for (let d = 1; d < 7; d++) reglas.push([d, reglas[0][1]]);
  const dia = (fecha.getDay() + 6) % 7, min = fecha.getHours() * 60 + fecha.getMinutes();
  for (const [d, rangos] of reglas) {
    for (const [i, f] of rangos) {
      if (d === dia && min >= i && min < f) return true;
      if (d === (dia + 6) % 7 && f > 1440 && min < f - 1440) return true; // turno de noche de ayer
    }
  }
  return false;
}

// ---------------------------------------------------------------- Carga de datos
function cargarEstaciones(j) {
  const F = j.fuels;
  S.fecha = j.fecha; S.provs = j.provs || {};
  S.est = j.est.map((r) => {
    const p = {};
    F.forEach((f, i) => { if (r[10 + i]) p[f] = r[10 + i]; });
    return { id: r[0], rot: r[1], lat: r[2], lon: r[3], dir: String(r[4] || '').replace(/[\s,]+$/, ''), loc: r[5], cp: r[6], prov: r[7], hor: r[8], p };
  });
}
function mitecoACompacto(api) {
  const n = (s) => { const v = parseFloat(String(s || '').replace(',', '.')); return Number.isFinite(v) ? v : null; };
  const fuels = Object.keys(MITECO_FUELS), provs = {}, est = [];
  for (const e of api.ListaEESSPrecio) {
    const lat = n(e['Latitud']), lon = n(e['Longitud (WGS84)']);
    if (lat == null) continue;
    const pre = fuels.map((k) => { const v = n(e[MITECO_FUELS[k]]); return v ? Math.round(v * 1000) : 0; });
    if (!pre.some(Boolean)) continue;
    provs[e['IDProvincia']] = e['Provincia'];
    est.push([+e['IDEESS'], (e['Rótulo'] || '').trim(), lat, lon, e['Dirección'], e['Localidad'], e['C.P.'], e['IDProvincia'], e['Horario'], e['Margen'], ...pre]);
  }
  return { fecha: api.Fecha, fuels, provs, est };
}
async function datos(forzarDirecto = false) {
  try {
    if (forzarDirecto) throw new Error('directo');
    const r = await fetch('data/stations.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error(r.status);
    cargarEstaciones(await r.json());
  } catch (e) {
    // Sin fichero publicado (o forzado): consulta directa a la API oficial
    try {
      toast('Descargando precios directamente del Ministerio…');
      const r = await fetch(MITECO_URL, { headers: { Accept: 'application/json' } });
      cargarEstaciones(mitecoACompacto(await r.json()));
    } catch (e2) {
      if (!S.est.length) { $('#lista').innerHTML = `<div class="empty"><b>No hay conexión</b>No se pudieron descargar los precios. Inténtalo de nuevo en un momento.</div>`; }
      return;
    }
  }
  S.cargado = Date.now();
  render();
}
async function cargadores() {
  if (S.pts || S.ptsCargando) return;
  S.ptsCargando = true;
  try {
    const r = await fetch('data/chargers.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error(r.status);
    const j = await r.json();
    S.pts = j.pts; S.ptsFuente = 'OpenStreetMap · ' + new Date(j.generado).toLocaleDateString('es-ES');
  } catch {
    await cargadoresDirecto();
  }
  S.ptsCargando = false;
  render();
}
async function cargadoresDirecto() {
  if (!S.pos) return;
  const rad = Math.min(50, Math.max(S.cfg.evRadio, 10)) * 1000;
  const q = `[out:json][timeout:25];nwr["amenity"="charging_station"](around:${rad},${S.pos.lat},${S.pos.lon});out center tags;`;
  try {
    toast('Buscando puntos de recarga en OpenStreetMap…');
    const r = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    const j = await r.json();
    S.pts = compactarOSM(j.elements); S.ptsFuente = 'OpenStreetMap (en directo)';
    S.ptsCentro = { ...S.pos, rad };
  } catch { S.pts = S.pts || []; toast('No se pudieron cargar los puntos de recarga'); }
}
function compactarOSM(elements) {
  const SK = { ccs: 'type2_combo', t2: 'type2', t2c: 'type2_cable', chademo: 'chademo', schuko: 'schuko', tesla: 'tesla_supercharger' };
  const kw = (v) => { const m = /([\d.,]+)\s*(kw|w)?/i.exec(String(v || '')); if (!m) return 0; let n = parseFloat(m[1].replace(',', '.')); if ((m[2] || '').toLowerCase() === 'w' || (!m[2] && n > 1000)) n /= 1000; return Math.round(n * 10) / 10; };
  return elements.filter((el) => !['private', 'no'].includes(el.tags?.access)).map((el) => {
    const t = el.tags || {};
    const s = Object.entries(SK).filter(([, o]) => t['socket:' + o] && !['no', '0'].includes(t['socket:' + o])).map(([k, o]) => [k, parseInt(t['socket:' + o], 10) || 1, kw(t[`socket:${o}:output`])]);
    return [el.lat ?? el.center?.lat, el.lon ?? el.center?.lon, t.name || '', t.operator || t.network || t.brand || '', s,
      Math.max(0, ...s.map((x) => x[2]), kw(t['charging_station:output'])), t.fee === 'no' ? 0 : t.fee === 'yes' ? 1 : null, t.opening_hours || '', parseInt(t.capacity, 10) || 0, el.type[0] + el.id];
  });
}
async function resumen() {
  if (S.resumen) return S.resumen;
  try { const r = await fetch('data/resumen.json', { cache: 'no-cache' }); if (r.ok) S.resumen = await r.json(); } catch {}
  return S.resumen;
}
async function histProv(p) {
  if (S.hist[p]) return S.hist[p];
  try { const r = await fetch(`data/hist/p${p}.json`); if (r.ok) S.hist[p] = await r.json(); } catch {}
  return S.hist[p];
}

// ---------------------------------------------------------------- Ubicación
function localizar(silencioso) {
  if (!navigator.geolocation) { if (!silencioso) toast('Tu navegador no permite la ubicación'); return; }
  $('#locTxt').textContent = 'Buscando tu ubicación…';
  navigator.geolocation.getCurrentPosition(
    (p) => {
      fijarPos({ lat: p.coords.latitude, lon: p.coords.longitude, gps: true, prec: p.coords.accuracy });
    },
    (err) => {
      $('#locTxt').textContent = S.pos ? S.pos.txt || 'Última ubicación' : 'Sin ubicación: busca tu pueblo →';
      if (!silencioso || !S.pos) toast(err.code === 1 ? 'Permiso de ubicación denegado. Puedes buscar un pueblo o CP.' : 'No se pudo obtener la ubicación');
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
  );
}
function fijarPos(p) {
  S.pos = p;
  if (S.ptsCentro && dist(p.lat, p.lon, S.ptsCentro.lat, S.ptsCentro.lon) * 1000 > S.ptsCentro.rad * 0.6) { S.pts = null; S.ptsCentro = null; }
  S.limite = 60;
  render();
}
function textoPos() {
  if (!S.pos) return 'Sin ubicación: busca tu pueblo →';
  if (!S.pos.gps) return '📍 ' + S.pos.txt;
  let cerca = null, dmin = 1e9;
  for (const e of S.est) { const d = dist(S.pos.lat, S.pos.lon, e.lat, e.lon); if (d < dmin) { dmin = d; cerca = e; } }
  const t = cerca && dmin < 15 ? 'Cerca de ' + titulo(cerca.loc) : 'Tu ubicación';
  S.pos.txt = t; S.pos.prov = cerca?.prov;
  save('pos', S.pos);
  return t + (S.pos.prec ? ` (±${Math.round(S.pos.prec)} m)` : '');
}
function buscarLugar(q) {
  const n = norm(q);
  if (!n) return;
  let m = /^\d{5}$/.test(n) ? S.est.filter((e) => e.cp === n) : S.est.filter((e) => norm(e.loc) === n);
  if (!m.length) m = S.est.filter((e) => norm(e.loc).startsWith(n) || norm(e.cp).startsWith(n));
  if (!m.length) m = S.est.filter((e) => norm(e.loc).includes(n) || norm(e.dir).includes(n));
  if (!m.length) { toast('No encuentro ese lugar. Prueba con el nombre del pueblo o el CP.'); return; }
  const lugar = norm(m[0].loc);
  const mismo = m.filter((e) => norm(e.loc) === lugar);
  const lat = mismo.reduce((a, e) => a + e.lat, 0) / mismo.length, lon = mismo.reduce((a, e) => a + e.lon, 0) / mismo.length;
  fijarPos({ lat, lon, gps: false, txt: titulo(m[0].loc), prov: m[0].prov });
  save('pos', S.pos);
  $('#q').value = '';
  $('#q').blur();
}

// ---------------------------------------------------------------- Filtrado
function cercanas() {
  const c = S.cfg;
  if (!S.pos || !S.est.length) return [];
  const ahora = new Date();
  let arr = [];
  for (const e of S.est) {
    if (!e.p[c.fuel]) continue;
    const d = dist(S.pos.lat, S.pos.lon, e.lat, e.lon);
    if (d > c.radio) continue;
    arr.push({ ...e, d, precio: e.p[c.fuel] });
  }
  const todas = arr;
  if (c.lowcost) arr = arr.filter(esLowcost);
  if (c.abiertas) arr = arr.filter((e) => horarioHoy(e.hor, ahora) !== false);
  if (c.marcas.length) arr = arr.filter((e) => c.marcas.includes(marca(e.rot)));
  for (const e of arr) e.total = coste(e);
  const ord = { precio: (a, b) => a.precio - b.precio || a.d - b.d, dist: (a, b) => a.d - b.d, total: (a, b) => a.total.total - b.total.total };
  arr.sort(ord[c.orden] || ord.precio);
  return { lista: arr, todas };
}
function coste(e) {
  // Coste de llenar + ir y volver desde tu posición
  const c = S.cfg;
  const llenar = (e.precio / 1000) * c.litros;
  const viaje = ((e.d * 2 * c.consumo) / 100) * (e.precio / 1000);
  return { llenar, viaje, total: llenar + viaje };
}
function cargadoresCerca() {
  const c = S.cfg;
  if (!S.pos || !S.pts) return [];
  const out = [];
  for (const p of S.pts) {
    const d = dist(S.pos.lat, S.pos.lon, p[0], p[1]);
    if (d > c.evRadio) continue;
    const sk = p[4];
    const compat = sk.filter((s) => c.conectores.includes(s[0]));
    if (sk.length && !compat.length) continue;
    if (!sk.length && !c.sinDatos) continue;
    const kwMax = compat.length ? Math.max(...compat.map((s) => s[2])) : p[5];
    if (c.potMin && !(kwMax >= c.potMin)) continue;
    if (c.gratis && p[6] !== 0) continue;
    out.push({ lat: p[0], lon: p[1], name: p[2], op: p[3], sk, compat, kw: kwMax, fee: p[6], hor: p[7], cap: p[8], id: p[9], d });
  }
  out.sort(c.evOrden === 'kw' ? (a, b) => b.kw - a.kw || a.d - b.d : (a, b) => a.d - b.d);
  return out;
}
function tiempoCarga(pt) {
  const c = S.cfg;
  let mejor = null;
  for (const [t, , k] of pt.compat) {
    let ef, dc = false;
    if (t === 'ccs' || t === 'chademo' || t === 'tesla') { ef = Math.min(k || 50, c.dcKw); dc = true; }
    else if (t === 'schuko') ef = Math.min(k || 2.3, 2.3, c.acKw);
    else ef = Math.min(k || 7.4, c.acKw);
    if (!mejor || ef > mejor.ef) mejor = { t, ef, dc };
  }
  if (!mejor) return null;
  const kwh = 0.7 * c.bat;
  const h = kwh / (mejor.ef * (mejor.dc ? 0.85 : 0.92));
  return { ...mejor, kwh, h, coste: pt.fee === 0 ? 0 : kwh * c.kwhPrecio };
}
const durTxt = (h) => (h < 1 ? Math.round(h * 60) + ' min' : Math.floor(h) + ' h ' + String(Math.round((h % 1) * 60)).padStart(2, '0') + ' min');

// ---------------------------------------------------------------- Render
function render() {
  document.body.classList.toggle('ev', S.cfg.modo === 'ev');
  document.querySelectorAll('.seg button').forEach((b) => b.classList.toggle('on', b.dataset.modo === S.cfg.modo));
  document.querySelectorAll('.bottom button').forEach((b) => b.classList.toggle('on', b.dataset.v === S.cfg.vista));
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('on', v.id === 'v-' + S.cfg.vista));
  $('#locTxt').textContent = textoPos();
  renderChips();
  if (S.cfg.modo === 'ev' && !S.pts) cargadores();
  const v = S.cfg.vista;
  if (v === 'lista') S.cfg.modo === 'ev' ? renderListaEv() : renderLista();
  if (v === 'mapa') renderMapa();
  if (v === 'favs') renderFavs();
  if (v === 'tend') renderTend();
  if (v === 'ajustes') renderAjustes();
}

function chipSel(id, label, valor, opciones) {
  return `<label class="chip sel">${label}<select data-cfg="${id}">${opciones.map(([v, t]) => `<option value="${v}" ${String(v) === String(valor) ? 'selected' : ''}>${t}</option>`).join('')}</select></label>`;
}
function renderChips() {
  const c = S.cfg;
  let h = '';
  if (c.modo === 'fuel') {
    h += chipSel('fuel', '', c.fuel, Object.keys(FUEL_NAMES).map((k) => [k, FUEL_NAMES[k]]));
    h += chipSel('radio', '≤ ', c.radio, [1, 2, 3, 5, 10, 15, 25, 50].map((n) => [n, n + ' km']));
    h += chipSel('orden', '', c.orden, [['precio', 'Más barata'], ['dist', 'Más cerca'], ['total', 'Coste real']]);
    h += `<button class="chip ${c.lowcost ? 'on' : ''}" data-tog="lowcost">💰 Low cost</button>`;
    h += `<button class="chip ${c.abiertas ? 'on' : ''}" data-tog="abiertas">🕐 Abiertas</button>`;
    h += `<button class="chip ${c.marcas.length ? 'on' : ''}" id="chipMarcas">🏷️ Marcas${c.marcas.length ? ' (' + c.marcas.length + ')' : ''}</button>`;
  } else {
    h += chipSel('evRadio', '≤ ', c.evRadio, [2, 5, 10, 15, 25, 50].map((n) => [n, n + ' km']));
    h += chipSel('potMin', '', c.potMin, [[0, 'Cualquier potencia'], [7, '≥ 7 kW'], [22, '≥ 22 kW'], [50, '≥ 50 kW (rápida)'], [100, '≥ 100 kW']]);
    h += chipSel('evOrden', '', c.evOrden, [['dist', 'Más cerca'], ['kw', 'Más potente']]);
    h += `<button class="chip on" id="chipConect">🔌 ${c.conectores.filter((x) => x !== 't2c').map((x) => SOCKET_NAMES[x]).join(' + ') || 'Conector'}</button>`;
    h += `<button class="chip ${c.gratis ? 'on' : ''}" data-tog="gratis">🆓 Gratis</button>`;
  }
  const ch = $('#chips'), sl = ch.scrollLeft;
  ch.innerHTML = h;
  ch.scrollLeft = sl;
}

function claseP(p, cortes) { return p <= cortes[0] ? 'p-ok' : p <= cortes[1] ? 'p-mid' : 'p-bad'; }
function cortesDe(lista) { const s = lista.map((e) => e.precio).sort((a, b) => a - b); return [percentil(s, 0.33), percentil(s, 0.66)]; }

// Variación del precio desde ayer (milésimas de euro), usando el historial de la provincia
function deltaAyer(e, f) {
  const h = S.hist[e.prov];
  const v = h?.s?.[e.id]?.[f];
  if (!v || v.length < 2 || !e.p[f]) return 0;
  const hoy = h.d[h.d.length - 1];
  // si el historial ya incluye hoy comparamos con el penúltimo día; si no, con el último
  const ayer = v[v.length - (hoy === fechaHoy() ? 2 : 1)];
  return ayer ? e.p[f] - ayer : 0;
}
const fechaHoy = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
function cargarHistLista(lista) {
  if (!['g95', 'g98', 'dsl', 'dslp'].includes(S.cfg.fuel)) return;
  const faltan = [...new Set(lista.slice(0, S.limite).map((e) => e.prov))].filter((p) => !S.hist[p] && !S.histPedido?.[p]);
  if (!faltan.length) return;
  S.histPedido = S.histPedido || {};
  faltan.forEach((p) => (S.histPedido[p] = 1));
  Promise.all(faltan.map(histProv)).then(() => { if (S.cfg.vista === 'lista' && S.cfg.modo === 'fuel') renderLista(); });
}
function haceCuanto() {
  const m = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/.exec(S.fecha || '');
  if (!m) return '';
  const min = Math.round((Date.now() - new Date(+m[3], m[2] - 1, +m[1], +m[4], +m[5]).getTime()) / 60000);
  return min < 2 ? 'ahora mismo' : min < 60 ? `hace ${min} min` : min < 1440 ? `hace ${Math.round(min / 60)} h` : `hace ${Math.round(min / 1440)} días`;
}

function tarjeta(e, cortes, ahora = new Date()) {
  const ab = horarioHoy(e.hor, ahora);
  const otro = ES_GASOLINA(S.cfg.fuel) ? 'dsl' : 'g95';
  const extras = [];
  extras.push(`<span class="tag"><b>${km(e.d)}</b></span>`);
  if (e.p[otro]) extras.push(`<span class="tag">${FUEL_SHORT[otro]} <b>${pr(e.p[otro])}</b></span>`);
  const dl = deltaAyer(e, S.cfg.fuel);
  if (dl) extras.push(`<span class="tag ${dl < 0 ? 'baja' : 'sube'}">${dl < 0 ? '▼' : '▲'} ${Math.abs(dl / 10).toLocaleString('es-ES', { maximumFractionDigits: 1 })} cts</span>`);
  if (S.cfg.orden === 'total') extras.push(`<span class="tag">Total <b>${eur(e.total.total)}</b></span>`);
  if (esLowcost(e)) extras.push('<span class="tag lc">Low cost</span>');
  if (ab === false) extras.push('<span class="tag cl">Cerrada ahora</span>');
  else if (/24\s*H/i.test(e.hor)) extras.push('<span class="tag op">24 h</span>');
  return `<div class="card" data-est="${e.id}">
    <div class="nm">${S.favs.has(e.id) ? '<span class="star">★</span>' : ''}<span class="t">${esc(nombreMarca(marca(e.rot)) === 'Sin marca' ? titulo(e.rot) || 'Gasolinera' : nombreMarca(marca(e.rot)))}</span></div>
    <div class="big"><span class="price ${claseP(e.precio, cortes)}">${pr(e.precio)}<small> €</small></span><span class="lbl">${FUEL_SHORT[S.cfg.fuel]}</span></div>
    <div class="sub">${esc(titulo(e.dir))}, ${esc(titulo(e.loc))}</div>
    <div class="row2">${extras.join('')}</div>
  </div>`;
}

function renderLista() {
  if (!S.est.length) { $('#lista').innerHTML = '<div class="empty"><b>Cargando precios…</b>Precios oficiales del Ministerio para la Transición Ecológica</div>'; $('#banner').innerHTML = ''; return; }
  if (!S.pos) { $('#lista').innerHTML = '<div class="empty"><b>¿Dónde estás?</b>Permite la ubicación o escribe tu pueblo o código postal arriba.</div>'; $('#banner').innerHTML = ''; return; }
  const { lista, todas } = cercanas();
  const c = S.cfg;
  if (!lista.length) {
    $('#banner').innerHTML = '';
    $('#lista').innerHTML = `<div class="empty"><b>No hay gasolineras con estos filtros</b>${todas.length ? `Hay ${todas.length} con ${FUEL_NAMES[c.fuel]} a menos de ${c.radio} km, pero ninguna cumple los filtros.` : `Prueba a ampliar la distancia (ahora ${c.radio} km).`}</div>`;
    return;
  }
  const cortes = cortesDe(lista);
  // Banner: mejor opción real vs la más cercana
  const cerca = lista.reduce((a, b) => (b.d < a.d ? b : a));
  const mejor = lista.reduce((a, b) => (b.total.total < a.total.total ? b : a));
  const ahorro = cerca.total.total - mejor.total.total;
  const media = lista.reduce((a, e) => a + e.precio, 0) / lista.length;
  let b = '';
  if (mejor.id === cerca.id) b = `<b>La más cercana es también la que más te conviene</b><small>${esc(nombreMarca(marca(mejor.rot)))} a ${km(mejor.d)} · ${pr(mejor.precio)} €/L · llenar ${c.litros} L: ${eur(mejor.total.llenar)}</small>`;
  else b = `<b>Mejor opción: ${esc(nombreMarca(marca(mejor.rot)))} a ${km(mejor.d)}</b> · ${pr(mejor.precio)} €/L<small>Llenando ${c.litros} L ahorras ${eur(Math.max(0, ahorro))} frente a la más cercana, contando el desplazamiento. <button data-est="${mejor.id}">Ver</button></small>`;
  b += `<small>${lista.length} gasolineras · media ${pr(media)} €/L · precios ${haceCuanto()}</small>`;
  $('#banner').innerHTML = `<div class="banner">${b}</div>`;
  const ahora = new Date();
  let h = lista.slice(0, S.limite).map((e) => tarjeta(e, cortes, ahora)).join('');
  if (lista.length > S.limite) h += `<button class="more" id="mas">Ver más (${lista.length - S.limite})</button>`;
  $('#lista').innerHTML = h;
  cargarHistLista(lista);
}

function tarjetaEv(p) {
  const t = tiempoCarga(p);
  const sk = p.sk.length ? p.sk.map((s) => `<span class="tag ${p.compat.includes(s) ? 'ev' : ''}">${SOCKET_NAMES[s[0]]}${s[1] > 1 ? ' ×' + s[1] : ''}${s[2] ? ' · <b>' + s[2] + ' kW</b>' : ''}</span>`).join('') : '<span class="tag">Conector sin especificar</span>';
  const titulo_ = p.name || p.op || 'Punto de recarga';
  return `<div class="card" data-ev="${p.id}">
    <div class="nm">${S.favsEv.has(p.id) ? '<span class="star">★</span>' : ''}<span class="t">${esc(titulo_)}</span></div>
    <div class="big"><span class="price ${p.kw >= 50 ? 'p-ok' : p.kw >= 22 ? 'p-mid' : ''}" style="${p.kw ? '' : 'color:var(--muted)'}">${p.kw ? p.kw : '?'}<small> kW</small></span><span class="lbl">${km(p.d)}</span></div>
    <div class="sub">${esc(p.name && p.op ? p.op : '')}${p.fee === 0 ? ' · Gratis' : ''}</div>
    <div class="row2">${sk}${t ? `<span class="tag">10→80 % <b>${durTxt(t.h)}</b></span>` : ''}</div>
  </div>`;
}
function renderListaEv() {
  if (!S.pos) { $('#lista').innerHTML = '<div class="empty"><b>¿Dónde estás?</b>Permite la ubicación o escribe tu pueblo o código postal arriba.</div>'; $('#banner').innerHTML = ''; return; }
  if (!S.pts) { $('#lista').innerHTML = '<div class="empty"><b>Cargando puntos de recarga…</b>Datos de OpenStreetMap</div>'; $('#banner').innerHTML = ''; return; }
  const l = cargadoresCerca();
  const c = S.cfg;
  const rapidos = l.filter((p) => p.compat.some((s) => s[0] === 'ccs')).length;
  $('#banner').innerHTML = l.length ? `<div class="banner"><b>${l.length} puntos de recarga compatibles con tu ${esc(c.evModelo)}</b><small>${rapidos} con carga rápida CCS2 · a menos de ${c.evRadio} km · ${esc(S.ptsFuente)}</small></div>` : '';
  if (!l.length) { $('#lista').innerHTML = `<div class="empty"><b>No hay puntos de recarga con estos filtros</b>Prueba a ampliar la distancia (ahora ${c.evRadio} km) o bajar la potencia mínima.</div>`; return; }
  let h = l.slice(0, S.limite).map(tarjetaEv).join('');
  if (l.length > S.limite) h += `<button class="more" id="mas">Ver más (${l.length - S.limite})</button>`;
  $('#lista').innerHTML = h;
}

// ---------------------------------------------------------------- Mapa
let mapa, capa, yo, circulo;
function renderMapa() {
  if (!S.pos) { toast('Necesito tu ubicación para el mapa'); return; }
  if (!mapa) {
    mapa = L.map('map', { zoomControl: false, attributionControl: true }).setView([S.pos.lat, S.pos.lon], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(mapa);
    L.control.zoom({ position: 'bottomright' }).addTo(mapa);
    capa = L.layerGroup().addTo(mapa);
  }
  setTimeout(() => mapa.invalidateSize(), 50);
  capa.clearLayers();
  const ev = S.cfg.modo === 'ev';
  const r = ev ? S.cfg.evRadio : S.cfg.radio;
  if (yo) yo.remove(); if (circulo) circulo.remove();
  yo = L.marker([S.pos.lat, S.pos.lon], { icon: L.divIcon({ className: '', html: '<div class="me"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }), zIndexOffset: 1000 }).addTo(mapa);
  circulo = L.circle([S.pos.lat, S.pos.lon], { radius: r * 1000, color: ev ? '#2563eb' : '#0f766e', weight: 1, fillOpacity: 0.04 }).addTo(mapa);
  if (ev) {
    for (const p of cargadoresCerca().slice(0, 400)) {
      const html = `<div class="pin ev ${S.favsEv.has(p.id) ? 'fav' : ''}">⚡${p.kw ? p.kw : ''}</div>`;
      L.marker([p.lat, p.lon], { icon: L.divIcon({ className: '', html, iconSize: [0, 0] }) }).on('click', () => detalleEv(p.id)).addTo(capa);
    }
  } else {
    const { lista } = cercanas();
    const cortes = cortesDe(lista);
    // las más baratas encima
    const sel = [...lista].sort((a, b) => a.precio - b.precio).slice(0, 400).reverse();
    for (const e of sel) {
      const html = `<div class="pin ${claseP(e.precio, cortes)} ${S.favs.has(e.id) ? 'fav' : ''}">${pr(e.precio)}</div>`;
      L.marker([e.lat, e.lon], { icon: L.divIcon({ className: '', html, iconSize: [0, 0] }) }).on('click', () => detalle(e.id)).addTo(capa);
    }
  }
  if (!S.mapaCentrado || S.mapaCentrado !== `${S.pos.lat},${S.pos.lon},${r}`) {
    mapa.fitBounds(circulo.getBounds(), { padding: [10, 10] });
    S.mapaCentrado = `${S.pos.lat},${S.pos.lon},${r}`;
  }
}

// ---------------------------------------------------------------- Detalle
function abrirHoja(html) {
  $('#sheetBody').innerHTML = html;
  $('#sheet').scrollTop = 0;
  $('#sheet').classList.add('on'); $('#sheetBg').classList.add('on');
}
function cerrarHoja() { $('#sheet').classList.remove('on'); $('#sheetBg').classList.remove('on'); }
async function compartir(titulo_, texto, lat, lon) {
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
  try {
    if (navigator.share) await navigator.share({ title: titulo_, text: texto, url });
    else { await navigator.clipboard.writeText(`${texto}\n${url}`); toast('Copiado al portapapeles'); }
  } catch {}
}
function navLinks(lat, lon) {
  return `<div class="navs">
    <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}" target="_blank" rel="noopener">Google Maps</a>
    <a href="https://waze.com/ul?ll=${lat},${lon}&navigate=yes" target="_blank" rel="noopener">Waze</a>
    <a class="alt" href="https://maps.apple.com/?daddr=${lat},${lon}" target="_blank" rel="noopener">Apple Maps</a>
  </div>`;
}
async function detalle(id) {
  const e0 = S.est.find((x) => x.id == id);
  if (!e0) return;
  const c = S.cfg;
  const d = S.pos ? dist(S.pos.lat, S.pos.lon, e0.lat, e0.lon) : 0;
  const e = { ...e0, d, precio: e0.p[c.fuel] || 0 };
  // medias de la zona para comparar
  const zona = S.pos ? S.est.filter((x) => dist(S.pos.lat, S.pos.lon, x.lat, x.lon) <= Math.max(c.radio, 5)) : [];
  const mediaZ = (f) => { const v = zona.map((x) => x.p[f]).filter(Boolean); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
  const filas = Object.keys(FUEL_NAMES).filter((f) => e.p[f]).map((f) => {
    const m = mediaZ(f); const df = m ? (e.p[f] - m) / 10 : 0;
    const cmp = m && zona.length > 2 ? `<span class="${df > 0.05 ? 'up' : df < -0.05 ? 'down' : 'muted'}">${df > 0 ? '+' : ''}${df.toLocaleString('es-ES', { maximumFractionDigits: 1 })} cts</span>` : '';
    return `<tr class="${f === c.fuel ? 'sel' : ''}"><td>${FUEL_NAMES[f]}</td><td>${pr(e.p[f])} €</td><td>${cmp}</td></tr>`;
  }).join('');
  const ab = horarioHoy(e.hor);
  let calc = '';
  if (e.precio) {
    const t = coste(e);
    const litros = (eu) => (eu / (e.precio / 1000)).toLocaleString('es-ES', { maximumFractionDigits: 1 });
    calc = `<div class="box"><h3>💶 ¿Cuántos litros me dan?</h3>
      <div class="kv"><span>20 €</span><span>${litros(20)} L</span></div>
      <div class="kv"><span>30 €</span><span>${litros(30)} L</span></div>
      <div class="kv"><span>50 €</span><span>${litros(50)} L</span></div></div>`;
    calc += `<div class="box"><h3>🧮 Calculadora (${esc(FUEL_NAMES[c.fuel])})</h3>
      <div class="kv"><span>Repostar ${c.litros} L</span><span>${eur(t.llenar)}</span></div>
      <div class="kv"><span>Ir y volver (${km(d * 2)}, ${c.consumo} L/100 km)</span><span>${eur(t.viaje)}</span></div>
      <div class="kv tot"><span>Coste real</span><span>${eur(t.total)}</span></div>
      <div class="muted" style="margin-top:6px">Puedes cambiar litros y consumo en Ajustes.</div></div>`;
  }
  const fav = S.favs.has(e.id);
  abrirHoja(`<h2><span>${esc(nombreMarca(marca(e.rot)) === 'Sin marca' ? titulo(e.rot) : nombreMarca(marca(e.rot)))}</span><button class="favbtn ${fav ? 'on' : ''}" data-fav="${e.id}" aria-label="Favorita">${fav ? '★' : '☆'}</button></h2>
    <p class="addr">${esc(titulo(e.dir))}, ${esc(titulo(e.loc))} · ${km(d)}<br>
    ${ab === true ? '<span class="down">● Abierta ahora</span>' : ab === false ? '<span class="up">● Cerrada ahora</span>' : ''} <span class="muted">${esc(e.hor)}</span>
    ${esLowcost(e) ? ' · <span class="tag lc">Low cost</span>' : ''}</p>
    ${navLinks(e.lat, e.lon)}
    <button class="btn alt share" data-share="est" data-id="${e.id}">📤 Compartir</button>
    <table class="ptable">${filas}</table>
    <div class="muted">Comparado con la media de la zona (${zona.length} gasolineras). Precios del ${esc(S.fecha)}.</div>
    ${calc}
    <div class="box" id="histBox"><h3>📈 Evolución de precios</h3><div class="muted">Cargando…</div></div>`);
  const h = await histProv(e.prov);
  const box = $('#histBox');
  if (!box) return;
  const serie = h?.s?.[e.id];
  const otro = ES_GASOLINA(c.fuel) ? 'dsl' : 'g95';
  const base = ['g95', 'g98', 'dsl', 'dslp'].includes(c.fuel) ? c.fuel : 'g95';
  if (!h || !serie || h.d.length < 2) {
    box.innerHTML = `<h3>📈 Evolución de precios</h3><div class="muted">El historial se guarda cada día automáticamente${h?.d?.length ? ' desde el ' + new Date(h.d[0]).toLocaleDateString('es-ES') : ''}. En unos días verás aquí la gráfica.</div>`;
    return;
  }
  const series = [{ name: FUEL_NAMES[base], color: 'var(--acc)', vals: serie[base] }];
  if (otro !== base) series.push({ name: FUEL_NAMES[otro], color: '#f59e0b', vals: serie[otro] });
  for (let i = series.length - 1; i >= 0; i--) if (!series[i].vals) series.splice(i, 1);
  const v = (serie[base] || []).filter(Boolean);
  const minV = v.length ? Math.min(...v) : 0, maxV = v.length ? Math.max(...v) : 0;
  box.innerHTML = `<h3>📈 Evolución de precios (${h.d.length} días)</h3>${grafica(h.d, series)}
    ${v.length ? `<div class="muted">${FUEL_NAMES[base]}: mínimo ${pr(minV)} €, máximo ${pr(maxV)} €.</div>` : ''}`;
}
function detalleEv(id) {
  const p = (S.pts || []).find((x) => x[9] === id);
  if (!p) return;
  const d = S.pos ? dist(S.pos.lat, S.pos.lon, p[0], p[1]) : 0;
  const pt = { lat: p[0], lon: p[1], name: p[2], op: p[3], sk: p[4], kw: p[5], fee: p[6], hor: p[7], cap: p[8], id: p[9], d };
  pt.compat = pt.sk.filter((s) => S.cfg.conectores.includes(s[0]));
  if (!pt.sk.length) pt.compat = [['t2', 1, 0]]; // supuesto razonable si no hay datos
  const t = tiempoCarga(pt);
  const fav = S.favsEv.has(id);
  const c = S.cfg;
  const sk = pt.sk.length ? pt.sk.map((s) => `<tr><td>${SOCKET_NAMES[s[0]]}${pt.compat.includes(s) ? ' ✅' : ''}</td><td>${s[2] ? s[2] + ' kW' : '—'}</td><td>${s[1]} toma${s[1] > 1 ? 's' : ''}</td></tr>`).join('') : '<tr><td colspan="3" class="muted">OpenStreetMap no indica los conectores de este punto.</td></tr>';
  abrirHoja(`<h2><span>${esc(pt.name || pt.op || 'Punto de recarga')}</span><button class="favbtn ${fav ? 'on' : ''}" data-favev="${id}" aria-label="Favorito">${fav ? '★' : '☆'}</button></h2>
    <p class="addr">${esc(pt.op)}${pt.op ? ' · ' : ''}${km(d)}${pt.fee === 0 ? ' · <b class="down">Gratis</b>' : pt.fee === 1 ? ' · De pago' : ''}${pt.hor ? '<br><span class="muted">Horario: ' + esc(pt.hor === '24/7' ? '24 horas' : pt.hor) + '</span>' : ''}</p>
    ${navLinks(pt.lat, pt.lon)}
    <button class="btn alt share" data-share="ev" data-id="${id}">📤 Compartir</button>
    <table class="ptable">${sk}</table>
    ${t ? `<div class="box"><h3>🔋 Tu ${esc(c.evModelo)} del 10 % al 80 %</h3>
      <div class="kv"><span>Conector usado</span><span>${SOCKET_NAMES[t.t]} a ${t.ef.toLocaleString('es-ES')} kW</span></div>
      <div class="kv"><span>Energía (${t.kwh.toLocaleString('es-ES', { maximumFractionDigits: 1 })} kWh)</span><span>≈ ${durTxt(t.h)}</span></div>
      <div class="kv tot"><span>Coste estimado</span><span>${t.coste === 0 ? 'Gratis' : '≈ ' + eur(t.coste)}</span></div>
      <div class="muted" style="margin-top:6px">${pt.fee === 0 ? '' : `Con ${eur(c.kwhPrecio)}/kWh orientativo (cámbialo en Ajustes). `}El precio real depende del operador y de tu tarifa.</div></div>` : ''}
    <div class="muted">Datos de OpenStreetMap. <a href="https://www.openstreetmap.org/${{ n: 'node', w: 'way', r: 'relation' }[id[0]]}/${id.slice(1)}" target="_blank" rel="noopener">Ver o corregir</a></div>`);
}

// ---------------------------------------------------------------- Gráfica SVG
function grafica(fechas, series) {
  const W = 340, H = 150, pl = 40, pr_ = 8, pt = 10, pb = 22;
  const vals = series.flatMap((s) => s.vals.filter((v) => v != null));
  if (!vals.length) return '<div class="muted">Sin datos.</div>';
  let mn = Math.min(...vals), mx = Math.max(...vals);
  if (mx - mn < 20) { mn -= 10; mx += 10; }
  const n = fechas.length;
  const x = (i) => pl + (n === 1 ? 0 : (i * (W - pl - pr_)) / (n - 1));
  const y = (v) => pt + ((mx - v) * (H - pt - pb)) / (mx - mn);
  let g = '';
  for (let k = 0; k <= 3; k++) {
    const v = mn + ((mx - mn) * k) / 3;
    g += `<line x1="${pl}" x2="${W - pr_}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${pl - 4}" y="${y(v) + 4}" font-size="10" text-anchor="end" fill="var(--muted)">${(v / 1000).toFixed(3).replace('.', ',')}</text>`;
  }
  const f = (s) => new Date(s).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  g += `<text x="${pl}" y="${H - 6}" font-size="10" fill="var(--muted)">${f(fechas[0])}</text><text x="${W - pr_}" y="${H - 6}" font-size="10" text-anchor="end" fill="var(--muted)">${f(fechas[n - 1])}</text>`;
  for (const s of series) {
    let d = '', pen = false;
    s.vals.forEach((v, i) => { if (v == null) { pen = false; return; } d += (pen ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1); pen = true; });
    g += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`;
    const li = s.vals.length - 1 - [...s.vals].reverse().findIndex((v) => v != null);
    if (li >= 0 && li < s.vals.length) g += `<circle cx="${x(li)}" cy="${y(s.vals[li])}" r="3" fill="${s.color}"/>`;
  }
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">${g}</svg><div class="legend">${series.map((s) => `<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join('')}</div>`;
}

// ---------------------------------------------------------------- Favoritas
function renderFavs() {
  const c = S.cfg;
  const fs = S.est.filter((e) => S.favs.has(e.id)).map((e) => ({ ...e, d: S.pos ? dist(S.pos.lat, S.pos.lon, e.lat, e.lon) : 0, precio: e.p[c.fuel] || 0 }));
  fs.forEach((e) => (e.total = coste(e)));
  fs.sort((a, b) => (a.precio || 9e9) - (b.precio || 9e9));
  let h = '<h3 style="margin:6px 4px">⛽ Gasolineras favoritas</h3>';
  h += fs.length ? fs.map((e) => (e.precio ? tarjeta(e, cortesDe(fs.filter((x) => x.precio))) : '')).join('') : '<div class="empty">Toca ☆ en una gasolinera para guardarla aquí y ver su precio de un vistazo.</div>';
  const evs = (S.pts || []).filter((p) => S.favsEv.has(p[9]));
  if (S.favsEv.size) {
    h += '<h3 style="margin:14px 4px 6px">⚡ Puntos de recarga favoritos</h3>';
    h += evs.map((p) => {
      const pt = { lat: p[0], lon: p[1], name: p[2], op: p[3], sk: p[4], kw: p[5], fee: p[6], hor: p[7], cap: p[8], id: p[9], d: S.pos ? dist(S.pos.lat, S.pos.lon, p[0], p[1]) : 0 };
      pt.compat = pt.sk.filter((s) => c.conectores.includes(s[0]));
      return tarjetaEv(pt);
    }).join('') || '<div class="empty">Cargando…</div>';
    if (!S.pts) cargadores();
  }
  $('#favs').innerHTML = h;
}

// ---------------------------------------------------------------- Tendencia
async function renderTend() {
  const el = $('#tend');
  el.innerHTML = '<div class="muted">Cargando…</div>';
  const r = await resumen();
  const c = S.cfg;
  const prov = S.pos?.prov;
  let h = '';
  // Comparativa coste por 100 km
  const zona = S.pos ? S.est.filter((e) => e.p.g95 && dist(S.pos.lat, S.pos.lon, e.lat, e.lon) <= 10) : [];
  const g95 = zona.length ? zona.reduce((a, e) => a + e.p.g95, 0) / zona.length / 1000 : null;
  h += `<h2 style="margin:0 0 8px">Tus dos coches: coste por 100 km</h2><div class="stat">
    <div><b>${g95 ? eur((c.consumo * g95)) : '—'}</b><span>Híbrido · ${c.consumo} L/100 km${g95 ? ' a ' + g95.toLocaleString('es-ES', { maximumFractionDigits: 3 }) + ' €/L' : ''}</span></div>
    <div><b>${eur(c.evConsumo * c.kwhCasa)}</b><span>${esc(c.evModelo)} en casa · ${c.evConsumo} kWh a ${eur(c.kwhCasa, 2)}</span></div>
    <div><b>${eur(c.evConsumo * c.kwhPrecio)}</b><span>${esc(c.evModelo)} en carga pública · ${eur(c.kwhPrecio)}/kWh</span></div>
    <div><b>${g95 ? eur(c.consumo * g95 - c.evConsumo * c.kwhCasa) : '—'}</b><span>Ahorro cada 100 km usando el eléctrico cargado en casa</span></div></div>`;
  if (!r || !r.d?.length) {
    h += '<div class="box"><h3>📈 Historial</h3><div class="muted">El historial de precios se empieza a guardar en cuanto la app esté publicada en GitHub (una vez al día). Vuelve en unos días.</div></div>';
    el.innerHTML = h; return;
  }
  const n = r.d.length;
  const fuelH = ['g95', 'g98', 'dsl', 'dslp'].includes(c.fuel) ? c.fuel : 'g95';
  const fuente = prov && r.prov[prov] ? r.prov[prov] : r.nac;
  const nombreZona = prov && r.prov[prov] ? titulo(S.provs[prov] || 'tu provincia') : 'España';
  const serie = fuente[fuelH] || [];
  const hoy = serie[n - 1];
  const media30 = (a) => { const v = a.slice(-30).filter((x) => x != null); return v.length ? v.reduce((p, q) => p + q, 0) / v.length : null; };
  const m30 = media30(serie);
  const hace7 = serie[n - 8];
  const cts = (a, b) => (a != null && b != null ? ((a - b) / 10) : null);
  const fmtC = (v) => (v == null ? '—' : `<span class="${v > 0.05 ? 'up' : v < -0.05 ? 'down' : ''}">${v > 0 ? '+' : ''}${v.toLocaleString('es-ES', { maximumFractionDigits: 1 })} cts</span>`);
  h += `<h2 style="margin:18px 0 8px">${esc(FUEL_NAMES[fuelH])} en ${esc(nombreZona)}</h2><div class="stat">
    <div><b>${hoy ? pr(hoy) + ' €' : '—'}</b><span>Media hoy</span></div>
    <div><b>${fmtC(cts(hoy, hace7))}</b><span>vs hace 7 días</span></div>
    <div><b>${fmtC(cts(hoy, m30))}</b><span>vs media de 30 días</span></div>
    <div><b>${n}</b><span>días de historial</span></div></div>`;
  const v = cts(hoy, m30);
  if (v != null && n >= 7) h += `<div class="box">${v < -0.5 ? '✅ <b>Buen momento para repostar:</b> los precios están por debajo de la media del último mes.' : v > 0.5 ? '⚠️ <b>Precios por encima de la media del mes.</b> Si no tienes prisa, quizá compense esperar o ir a una low cost.' : 'ℹ️ Los precios están en la media del último mes.'}</div>`;
  h += `<div class="box"><h3>Evolución (media)</h3>${grafica(r.d, [
    { name: `${FUEL_NAMES[fuelH]} · ${nombreZona}`, color: 'var(--acc)', vals: serie },
    { name: `${FUEL_NAMES[ES_GASOLINA(fuelH) ? 'dsl' : 'g95']} · ${nombreZona}`, color: '#f59e0b', vals: fuente[ES_GASOLINA(fuelH) ? 'dsl' : 'g95'] || [] },
    { name: `${FUEL_NAMES[fuelH]} · España`, color: '#94a3b8', vals: fuente === r.nac ? [] : r.nac[fuelH] || [] },
  ].filter((s) => s.vals.length))}</div>`;
  // Día de la semana más barato
  if (n >= 14) {
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const acc = Array.from({ length: 7 }, () => []);
    serie.forEach((val, i) => {
      if (val == null) return;
      const ref = serie.slice(Math.max(0, i - 3), i + 4).filter((x) => x != null);
      const m = ref.reduce((a, b) => a + b, 0) / ref.length;
      acc[new Date(r.d[i] + 'T12:00:00').getDay()].push(val - m);
    });
    const med = acc.map((a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0));
    const best = med.indexOf(Math.min(...med)), worst = med.indexOf(Math.max(...med));
    h += `<div class="box">📅 En ${esc(nombreZona)}, el día más barato suele ser el <b>${dias[best]}</b> y el más caro el <b>${dias[worst]}</b> (según los últimos ${n} días).</div>`;
  }
  el.innerHTML = h;
}

// ---------------------------------------------------------------- Ajustes
function campo(id, label, tipo = 'number', extra = '') {
  const v = S.cfg[id];
  if (tipo === 'check') return `<div class="field"><label for="f-${id}">${label}</label><input id="f-${id}" type="checkbox" data-set="${id}" ${v ? 'checked' : ''}></div>`;
  return `<div class="field"><label for="f-${id}">${label}</label><input id="f-${id}" type="${tipo}" data-set="${id}" value="${esc(v)}" ${extra} inputmode="decimal"></div>`;
}
function renderAjustes() {
  const c = S.cfg;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const instalada = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  $('#ajustes').innerHTML = `<div class="set">
    ${instalada ? '' : `<div class="box"><h3>📲 Instálala en tu móvil</h3>${S.installEvt ? '<button class="btn" id="instalar">Instalar GasoCerca</button>' : ios ? 'En Safari toca <b>Compartir</b> (□↑) y luego <b>Añadir a pantalla de inicio</b>.' : 'En Chrome abre el menú ⋮ y toca <b>Instalar aplicación</b> o <b>Añadir a pantalla de inicio</b>.'}</div>`}
    <h2>🚗 Coche híbrido (gasolina)</h2>
    <div class="field"><label>Combustible</label><select data-set="fuel">${Object.keys(FUEL_NAMES).map((k) => `<option value="${k}" ${k === c.fuel ? 'selected' : ''}>${FUEL_NAMES[k]}</option>`).join('')}</select></div>
    ${campo('litros', 'Litros que sueles repostar', 'number', 'min="1" max="120" step="1"')}
    ${campo('consumo', 'Consumo (L/100 km)', 'number', 'min="1" max="20" step="0.1"')}
    <h2>⚡ Coche eléctrico</h2>
    ${campo('evModelo', 'Modelo', 'text')}
    ${campo('bat', 'Batería útil (kWh)', 'number', 'step="0.1"')}
    ${campo('acKw', 'Carga AC máx. (kW)', 'number', 'step="0.1"')}
    ${campo('dcKw', 'Carga rápida DC máx. (kW)', 'number', 'step="1"')}
    ${campo('evConsumo', 'Consumo (kWh/100 km)', 'number', 'step="0.1"')}
    ${campo('kwhPrecio', 'Precio carga pública (€/kWh)', 'number', 'step="0.01"')}
    ${campo('kwhCasa', 'Precio luz en casa (€/kWh)', 'number', 'step="0.01"')}
    <div class="field" style="flex-wrap:wrap"><label>Conectores de tu coche</label><div class="brands" style="margin:0">${['ccs', 't2', 'chademo', 'schuko'].map((k) => `<button class="chip ${c.conectores.includes(k) ? 'on' : ''}" data-conect="${k}">${SOCKET_NAMES[k]}</button>`).join('')}</div></div>
    ${campo('sinDatos', 'Mostrar puntos sin datos de conector', 'check')}
    <div class="muted">El Leapmotor T03 usa Tipo 2 (AC, 6,6 kW) y CCS2 (DC, hasta unos 48 kW).</div>
    <h2>💰 Marcas low cost</h2>
    <div class="muted">Una por línea. Se usan para el filtro «Low cost».</div>
    <textarea id="lowcostTxt">${esc(c.lowcostList.join('\n'))}</textarea>
    <div style="display:flex;gap:8px;margin-top:6px"><button class="btn" id="guardarLc">Guardar</button><button class="btn alt" id="resetLc">Restaurar lista</button></div>
    <h2>🔄 Versión</h2>
    <div class="box"><div class="kv"><span>GasoCerca</span><span><b>v${APP_VERSION}</b></span></div>
    <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><button class="btn alt" id="buscarAct">Buscar actualizaciones</button><button class="btn alt" id="verNovedades">Novedades</button></div></div>
    <h2>ℹ️ Datos</h2>
    <div class="box"><div class="kv"><span>Precios</span><span>${esc(S.fecha || '—')}</span></div>
    <div class="kv"><span>Gasolineras</span><span>${S.est.length.toLocaleString('es-ES')}</span></div>
    <div class="kv"><span>Recarga</span><span>${esc(S.ptsFuente || 'sin cargar')}</span></div>
    <div class="muted" style="margin-top:6px">Precios oficiales del Ministerio para la Transición Ecológica (geoportal de carburantes). Puntos de recarga y mapa © colaboradores de OpenStreetMap. Las gasolineras están obligadas a comunicar sus precios, pero puede haber retrasos: confirma en el surtidor.</div></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn alt" id="directo">Actualizar directo del Ministerio</button><button class="btn alt" id="borrar">Borrar ajustes y favoritas</button></div>
  </div>`;
}

// ---------------------------------------------------------------- Hoja de marcas / conectores
function hojaMarcas() {
  const c = S.cfg;
  if (!S.pos) return;
  const cnt = {};
  for (const e of S.est) {
    if (!e.p[c.fuel] || dist(S.pos.lat, S.pos.lon, e.lat, e.lon) > c.radio) continue;
    const m = marca(e.rot); cnt[m] = (cnt[m] || 0) + 1;
  }
  const lista = Object.entries(cnt).sort((a, b) => b[1] - a[1]);
  abrirHoja(`<h2>Marcas a menos de ${c.radio} km</h2><p class="addr">Elige una o varias. Sin selección se muestran todas.</p>
    <div class="brands">${lista.map(([m, n]) => `<button class="chip ${c.marcas.includes(m) ? 'on' : ''}" data-marca="${esc(m)}">${esc(nombreMarca(m))} <span class="muted">${n}</span></button>`).join('') || '<span class="muted">No hay gasolineras en el radio.</span>'}</div>
    <div style="display:flex;gap:8px"><button class="btn" id="okMarcas">Aplicar</button><button class="btn alt" id="limpiarMarcas">Todas</button></div>`);
}

// ---------------------------------------------------------------- Eventos
document.addEventListener('click', (ev) => {
  const t = ev.target.closest('button, .card, a');
  if (!t) return;
  const c = S.cfg;
  if (t.dataset.modo) { c.modo = t.dataset.modo; S.limite = 60; saveCfg(); render(); return; }
  if (t.dataset.v) { c.vista = t.dataset.v; saveCfg(); render(); $('#v-' + c.vista).scrollTop = 0; return; }
  if (t.dataset.tog) { c[t.dataset.tog] = !c[t.dataset.tog]; saveCfg(); render(); return; }
  if (t.dataset.est) { detalle(+t.dataset.est); return; }
  if (t.dataset.ev) { detalleEv(t.dataset.ev); return; }
  if (t.dataset.fav) {
    const id = +t.dataset.fav; S.favs.has(id) ? S.favs.delete(id) : S.favs.add(id); save('favs', [...S.favs]);
    t.classList.toggle('on'); t.textContent = S.favs.has(id) ? '★' : '☆'; toast(S.favs.has(id) ? 'Añadida a favoritas' : 'Quitada de favoritas'); render(); return;
  }
  if (t.dataset.favev) {
    const id = t.dataset.favev; S.favsEv.has(id) ? S.favsEv.delete(id) : S.favsEv.add(id); save('favsEv', [...S.favsEv]);
    t.classList.toggle('on'); t.textContent = S.favsEv.has(id) ? '★' : '☆'; render(); return;
  }
  if (t.dataset.marca) { t.classList.toggle('on'); return; }
  if (t.dataset.share === 'est') {
    const e = S.est.find((x) => x.id == t.dataset.id);
    const precios = ['g95', 'dsl'].filter((f) => e.p[f]).map((f) => `${FUEL_NAMES[f]}: ${pr(e.p[f])} €`).join(' · ');
    compartir(nombreMarca(marca(e.rot)), `⛽ ${nombreMarca(marca(e.rot))} – ${titulo(e.dir)}, ${titulo(e.loc)}\n${precios}`, e.lat, e.lon);
    return;
  }
  if (t.dataset.share === 'ev') {
    const p = S.pts.find((x) => x[9] === t.dataset.id);
    compartir(p[2] || p[3] || 'Punto de recarga', `⚡ ${p[2] || p[3] || 'Punto de recarga'}${p[5] ? ' · hasta ' + p[5] + ' kW' : ''}`, p[0], p[1]);
    return;
  }
  if (t.dataset.conect) {
    const k = t.dataset.conect; const set = new Set(c.conectores);
    if (set.has(k)) { set.delete(k); if (k === 't2') set.delete('t2c'); } else { set.add(k); if (k === 't2') set.add('t2c'); }
    c.conectores = [...set]; saveCfg(); render(); return;
  }
  switch (t.id) {
    case 'btnLoc': localizar(); break;
    case 'refrescar': t.classList.add('gira'); setTimeout(() => t.classList.remove('gira'), 900); if (S.pos?.gps !== false) localizar(true); datos(); comprobarVersion(); break;
    case 'updBtn': location.reload(); break;
    case 'buscarAct': comprobarVersion(true); break;
    case 'cerrarHoja': cerrarHoja(); break;
    case 'mas': S.limite += 60; render(); break;
    case 'chipMarcas': hojaMarcas(); break;
    case 'chipConect': c.vista = 'ajustes'; saveCfg(); render(); setTimeout(() => $('[data-conect]')?.scrollIntoView({ block: 'center' }), 50); break;
    case 'okMarcas': c.marcas = [...document.querySelectorAll('[data-marca].on')].map((b) => b.dataset.marca); saveCfg(); cerrarHoja(); render(); break;
    case 'limpiarMarcas': c.marcas = []; saveCfg(); cerrarHoja(); render(); break;
    case 'guardarLc': c.lowcostList = $('#lowcostTxt').value.split('\n').map((s) => s.trim()).filter(Boolean); saveCfg(); toast('Lista guardada'); break;
    case 'resetLc': c.lowcostList = LOWCOST_DEF; saveCfg(); render(); break;
    case 'directo': datos(true); break;
    case 'verNovedades': mostrarNovedades(APP_VERSION); break;
    case 'instalar': S.installEvt?.prompt(); S.installEvt = null; break;
    case 'borrar': if (confirm('¿Borrar ajustes y favoritas?')) { Object.keys(localStorage).filter((k) => k.startsWith('gc.')).forEach((k) => localStorage.removeItem(k)); location.reload(); } break;
  }
});
document.addEventListener('change', (ev) => {
  const t = ev.target;
  const c = S.cfg;
  const k = t.dataset.cfg || t.dataset.set;
  if (!k) return;
  let v = t.type === 'checkbox' ? t.checked : t.value;
  if (typeof DEF[k] === 'number') { v = parseFloat(String(v).replace(',', '.')); if (!Number.isFinite(v)) return; }
  c[k] = v; S.limite = 60; saveCfg();
  if (t.dataset.cfg) render();
  else toast('Guardado');
});
$('#buscar').addEventListener('submit', (ev) => { ev.preventDefault(); buscarLugar($('#q').value); });
$('#sheetBg').addEventListener('click', cerrarHoja);
// cerrar la hoja deslizando hacia abajo
(() => {
  let y0 = null;
  const sh = $('#sheet');
  sh.addEventListener('touchstart', (e) => { y0 = sh.scrollTop <= 0 ? e.touches[0].clientY : null; }, { passive: true });
  sh.addEventListener('touchmove', (e) => { if (y0 != null && e.touches[0].clientY - y0 > 90) { y0 = null; cerrarHoja(); } }, { passive: true });
})();
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); S.installEvt = e; });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  if (S.pos?.gps !== false) localizar(true);
  if (Date.now() - (S.cargado || 0) > 20 * 60 * 1000) datos();
});

// ---------------------------------------------------------------- Inicio
let swReg = null;
function avisoActualizacion() {
  const u = $('#upd');
  u.innerHTML = '✨ Hay una nueva versión de GasoCerca <button id="updBtn">Actualizar</button>';
  u.classList.add('on');
}
async function comprobarVersion(manual) {
  if (!swReg) { if (manual) toast('Las actualizaciones automáticas solo funcionan en la app publicada'); return; }
  try { await swReg.update(); } catch {}
  if (manual && !swReg.installing && !swReg.waiting) setTimeout(() => { if (!$('#upd').classList.contains('on')) toast(`Tienes la última versión (v${APP_VERSION})`); }, 1500);
}
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  const habiaControlador = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js').then((r) => { swReg = r; }).catch(() => {});
  // el nuevo service worker toma el control en cuanto se instala: avisamos para recargar
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (habiaControlador) avisoActualizacion(); });
}
function mostrarNovedades(v) {
  const items = NOVEDADES[v] || [];
  abrirHoja(`<h2>✨ Novedades de la v${v}</h2><p class="addr">La app se ha actualizado sola desde GitHub.</p>
    <ul class="novedades">${items.map((i) => `<li>${i}</li>`).join('')}</ul>
    <button class="btn" id="cerrarHoja" style="width:100%">¡Entendido!</button>`);
}
(() => {
  const anterior = load('version', null);
  if (anterior !== APP_VERSION) {
    // usuarios que ya tenían la app (tienen ajustes guardados) ven las novedades
    if (anterior || localStorage.getItem('gc.cfg')) setTimeout(() => mostrarNovedades(APP_VERSION), 1200);
    save('version', APP_VERSION);
  }
})();
render();
datos();
if (!S.pos || S.pos.gps) localizar(true);
