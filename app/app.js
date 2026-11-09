/* GasoCerca — gasolineras y puntos de recarga cerca de ti.
   Datos: MITECO (precios oficiales) y OpenStreetMap (recarga). Sin servidor propio. */
'use strict';

// ---------------------------------------------------------------- Constantes
const APP_VERSION = '1.8.0';
const NOVEDADES = {
  '1.8.0': [
    '😊 <b>Modo sencillo</b> para quien empieza: solo lo importante (precios cerca, un botón grande para ir y favoritas). Tú sigues con el <b>modo completo</b>; puedes cambiarlo en Ajustes.',
    '🧭 Botón <b>«Ir»</b> en cada gasolinera para que el móvil te lleve directamente.',
    '🔍 Opción de <b>letra grande</b> en Ajustes.',
    '❓ Botón de <b>ayuda</b> arriba con las dudas más habituales explicadas fácil.',
  ],
  '1.7.0': [
    '👋 <b>Lista para compartir</b>: quien abra la app por primera vez verá un <b>asistente</b> que le pregunta su combustible, cuánto reposta, su consumo, cuánto vale su tiempo y, solo si quiere, los datos de su coche eléctrico. Tus ajustes no cambian.',
    '🚗 El coche eléctrico es <b>opcional</b>: si alguien no tiene, no verá nada de recarga. Lo puede activar después en Ajustes.',
    '🔁 En <b>Ajustes → Volver a configurar</b> puedes repetir el asistente cuando quieras.',
  ],
  '1.6.0': [
    '📒 <b>Diario de repostajes y recargas</b>: toca «He repostado aquí» o «He cargado aquí» en cualquier ficha (o añádelo en <b>Gastos</b>) y la app te enseña cuánto gastas al mes, cuánto llevas <b>ahorrado</b> frente a la media de la zona y el <b>consumo real</b> de cada coche.',
    '🔔 <b>Alertas de precio</b>: en la ficha de una gasolinera pon «avísame si baja de…» y cuando abras la app te avisará si ha llegado a ese precio.',
    '💾 <b>Copia de seguridad</b>: guarda o recupera tus favoritas, ajustes, tarifas y diario desde Ajustes (útil si cambias de móvil).',
    '📲 <b>Accesos directos</b> (Android): mantén pulsado el icono para ir directo a Recarga, Ruta o Gastos.',
    '📊 La pestaña «Tendencia» pasa a llamarse <b>Gastos</b> y reúne tu diario y la evolución de precios.',
  ],
  '1.5.0': [
    '⚡ <b>Arranque instantáneo</b>: al abrir la app ves al momento los últimos precios guardados y se actualizan solos por detrás (antes esperaba a descargarlo todo).',
    '🛰️ <b>Ruta en marcha</b>: mientras tienes la Ruta abierta, la app sigue tu GPS y va quitando las gasolineras que ya has pasado y actualizando kilómetros y horas.',
    '🏷️ Arreglado el filtro <b>Low cost</b>: marcaba por error gasolineras como Repsol Alhambra o Shell Schamann (contenían las letras «HAM»).',
    '⏰ Aviso si los precios llevan <b>muchas horas sin actualizarse</b> (por ejemplo, si GitHub pausa las actualizaciones).',
    '📱 En iPhone la pantalla ya no hace zoom al tocar el buscador ni los campos de Ajustes.',
    '🧹 En la Ruta solo se ven los filtros que sirven ahí, y otros detalles pulidos.',
  ],
  '1.4.2': [
    '🛣️ <b>Cálculo correcto en ruta</b>: al abrir una gasolinera o un cargador desde la Ruta, ya no se calcula «ir y volver» desde donde estás. Como vas a pasar por allí igualmente, solo cuenta el <b>desvío</b>, y se compara con las demás paradas de tu ruta: la que más compensa y la primera que te vas a encontrar.',
  ],
  '1.4.1': [
    '📍 <b>Ayuda con la ubicación</b>: si el móvil no deja a la app saber dónde estás, te explica paso a paso cómo darle permiso (iPhone y Android). También en <b>Ajustes → Ubicación</b>.',
    '🛰️ Si el GPS tarda (por ejemplo dentro de casa), la app usa una ubicación aproximada en vez de quedarse esperando.',
  ],
  '1.4.0': [
    '🛣️ <b>Modo Ruta</b>: dime adónde vas y te enseño las gasolineras (o cargadores) <b>de camino</b>, con los minutos de desvío, en qué kilómetro están y a qué hora llegas. Solo las que no te obligan a salirte mucho.',
    '🧭 <b>Parada en el navegador</b>: abre Google Maps con la gasolinera como parada intermedia de tu viaje.',
    '↔️ Te avisa si una gasolinera de autovía puede estar <b>en el sentido contrario</b>.',
    '🔎 <b>Buscador arreglado</b>: ahora encuentra cualquier pueblo, ciudad, dirección o código postal de España, con sugerencias mientras escribes (antes fallaba con nombres como «Las Rozas» o con pueblos sin gasolinera).',
    '🏘️ Los nombres de pueblos se ven bien: «La Roda» en vez de «Roda (la)».',
  ],
  '1.3.0': [
    '⏱️ <b>Ahora cuenta tu tiempo</b>: la app calcula los minutos de ida y vuelta y los valora (10 €/h por defecto). Si ahorras 1 € pero tienes que conducir media hora, ya no te dirá que compensa.',
    '🚗 Cada gasolinera muestra los <b>minutos que tardas</b> en llegar, y en el detalle ves si <b>compensa o no</b> frente a la más cercana.',
    '⚡ <b>Precios de recarga rehechos</b>: los operadores no publican sus tarifas en abierto, así que la app usa <b>tu tarifa</b> si la indicas, el precio de OpenStreetMap cuando lo hay y, si no, una estimación según sea carga lenta, rápida o ultrarrápida (siempre marcada como «estimado»).',
    '💾 Guarda <b>lo que pagas en cada operador</b> (Zunder, Iberdrola, Endesa…) desde el detalle del cargador y la app lo usará siempre.',
    '🔌 Nuevo orden en Recarga: <b>más barata</b> y <b>lo que más compensa</b>.',
  ],
  '1.2.0': [
    '🧭 <b>Tutorial</b> de bienvenida que te enseña dónde está cada cosa. Puedes repetirlo cuando quieras desde <b>Ajustes → Ver tutorial</b>.',
  ],
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
  radio: 5, fuel: 'g95', orden: 'total',
  lowcost: false, abiertas: false, marcas: [],
  rutaDesvio: 5, rutaKm: 0, rutaOrden: 'total',
  velMedia: 25, valorHora: 10, // para valorar el tiempo del desplazamiento
  litros: 40, consumo: 6, // coche de combustión
  tieneComb: true, tieneEV: false, combNombre: '', setupHecho: false,
  sencillo: true, letraGrande: false, // modo sencillo por defecto para quien empieza
  evRadio: 10, conectores: ['ccs', 't2', 't2c'], potMin: 0, gratis: false, evOrden: 'dist', sinDatos: true,
  evModelo: '', bat: 50, acKw: 7.4, dcKw: 50, evConsumo: 15, kwhCasa: 0.15,
  kwhAC: 0.39, kwhDC: 0.49, kwhHPC: 0.59, tarifas: {}, // €/kWh orientativos por tipo de cargador y tarifas propias
  lowcostList: LOWCOST_DEF,
};

// ---------------------------------------------------------------- Estado
const S = {
  cfg: { ...DEF, ...load('cfg', {}) },
  favs: new Set(load('favs', [])),
  favsEv: new Set(load('favsEv', [])),
  diario: load('diario', []), // repostajes y recargas apuntados
  alertas: load('alertas', {}), // id gasolinera -> { f: combustible, p: precio objetivo (milésimas) }
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
(() => {
  // quien ya usaba la app antes de la v1.7 conserva su configuración (y su eléctrico)
  const guardado = load('cfg', null);
  if ((guardado || localStorage.getItem('gc.version')) && !('tieneEV' in (guardado || {}))) {
    const ANTES = { evModelo: 'Leapmotor T03', bat: 37.3, acKw: 6.6, dcKw: 48, evConsumo: 13.5, consumo: 5 };
    for (const [k, v] of Object.entries(ANTES)) if (!guardado || !(k in guardado)) S.cfg[k] = v;
    Object.assign(S.cfg, { tieneEV: true, tieneComb: true, setupHecho: true, sencillo: false });
    saveCfg();
  }
})();
(() => {
  // quien ya tenía la app conserva lo que conoce: modo completo
  const g = load('cfg', null);
  if (g && !('sencillo' in g)) { S.cfg.sencillo = false; saveCfg(); }
})();
const nombreEV = () => S.cfg.evModelo || 'eléctrico';
// enlace para que el móvil te lleve: Apple Maps en iPhone, Google Maps en el resto
const irURL = (lat, lon) => (/iphone|ipad|ipod/i.test(navigator.userAgent) ? `https://maps.apple.com/?daddr=${lat},${lon}&dirflg=d` : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`);
const nombreComb = () => S.cfg.combNombre || 'Coche';

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
// "ROZAS DE MADRID (LAS)" -> "Las Rozas de Madrid"
function nombreLoc(s) {
  const m = /^(.*?)\s*\(([^)]+)\)\s*$/.exec(String(s || '').trim());
  const t = m ? `${m[2]}${/'$/.test(m[2]) ? '' : ' '}${m[1]}` : s;
  return titulo(t).replace(/\b(De|Del|La|Las|Los|El|Y|En)\b/g, (w, _, i) => (i === 0 ? w : w.toLowerCase()));
}
const lcCache = { lista: null, re: null };
function esLowcost(e) {
  // palabra completa: «HAM» no debe coincidir con «ALHAMBRA» ni «SCHAMANN»
  if (lcCache.lista !== S.cfg.lowcostList) {
    const alt = S.cfg.lowcostList.filter(Boolean).map((b) => norm(b).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    lcCache.re = alt.length ? new RegExp('(^|[^A-Z0-9])(' + alt.join('|') + ')(?=[^A-Z0-9]|$)') : null;
    lcCache.lista = S.cfg.lowcostList;
  }
  return !!lcCache.re && lcCache.re.test(norm(e.rot));
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
async function desdeCache(ruta) {
  // última copia guardada por el service worker (para pintar al instante)
  try { const hit = 'caches' in window && (await caches.match(ruta, { ignoreSearch: true })); return hit ? await hit.json() : null; } catch { return null; }
}
async function datos(forzarDirecto = false) {
  if (!S.est.length && !forzarDirecto) {
    const j = await desdeCache('data/stations.json');
    if (j && !S.est.length) { cargarEstaciones(j); render(); }
  }
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
      else toast('Sin conexión: mostrando los últimos precios guardados');
      return;
    }
  }
  S.cargado = Date.now();
  render();
}
async function cargadores() {
  if (S.pts || S.ptsCargando) return;
  S.ptsCargando = true;
  const cj = await desdeCache('data/chargers.json');
  if (cj && !S.pts) { S.pts = cj.pts; S.ptsFuente = 'OpenStreetMap · ' + new Date(cj.generado).toLocaleDateString('es-ES'); S.ptsCargando = false; render(); S.ptsCargando = true; }
  try {
    const r = await fetch('data/chargers.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error(r.status);
    const j = await r.json();
    S.pts = j.pts; S.ptsFuente = 'OpenStreetMap · ' + new Date(j.generado).toLocaleDateString('es-ES');
  } catch {
    await cargadoresDirecto();
  }
  S.ptsCargando = false;
  if (!S.pts && !S.pos) { S.ptsEsperaPos = true; return; } // se reintenta al tener ubicación
  render();
}
async function cargadoresDirecto() {
  if (!S.pos) return;
  const rad = Math.min(50, Math.max(S.cfg.evRadio, 15)) * 1000;
  const q = `[out:json][timeout:25];nwr["amenity"="charging_station"](around:${rad},${S.pos.lat},${S.pos.lon});out center tags;`;
  try {
    toast('Buscando puntos de recarga en OpenStreetMap…');
    const r = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    const j = await r.json();
    S.pts = compactarOSM(j.elements); S.ptsFuente = 'OpenStreetMap (en directo)';
    S.ptsCentro = { ...S.pos, rad };
  } catch { S.pts = S.pts || []; toast('No se pudieron cargar los puntos de recarga'); }
}
function precioOSM(t) {
  // etiqueta charge de OSM, p. ej. "0.49 EUR/kWh" o "0,45 €/kWh"
  const m = /([\d]+[.,]?\d*)\s*(?:€|eur)\s*\/\s*kwh/i.exec(t.charge || t['charge:conditional'] || '');
  const v = m ? parseFloat(m[1].replace(',', '.')) : null;
  return v > 0 && v < 3 ? v : null;
}
function compactarOSM(elements) {
  const SK = { ccs: 'type2_combo', t2: 'type2', t2c: 'type2_cable', chademo: 'chademo', schuko: 'schuko', tesla: 'tesla_supercharger' };
  const kw = (v) => { const m = /([\d.,]+)\s*(kw|w)?/i.exec(String(v || '')); if (!m) return 0; let n = parseFloat(m[1].replace(',', '.')); if ((m[2] || '').toLowerCase() === 'w' || (!m[2] && n > 1000)) n /= 1000; return Math.round(n * 10) / 10; };
  return elements.filter((el) => !['private', 'no'].includes(el.tags?.access)).map((el) => {
    const t = el.tags || {};
    const s = Object.entries(SK).filter(([, o]) => t['socket:' + o] && !['no', '0'].includes(t['socket:' + o])).map(([k, o]) => [k, parseInt(t['socket:' + o], 10) || 1, kw(t[`socket:${o}:output`])]);
    return [el.lat ?? el.center?.lat, el.lon ?? el.center?.lon, t.name || '', t.operator || t.network || t.brand || '', s,
      Math.max(0, ...s.map((x) => x[2]), kw(t['charging_station:output'])), t.fee === 'no' ? 0 : t.fee === 'yes' ? 1 : null, t.opening_hours || '', parseInt(t.capacity, 10) || 0, el.type[0] + el.id, precioOSM(t)];
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
      // si el GPS tarda o falla, segundo intento con ubicación aproximada (wifi/red móvil)
      if (err.code !== 1 && !localizar.reintento) {
        localizar.reintento = true;
        navigator.geolocation.getCurrentPosition(
          (p) => { localizar.reintento = false; S.geoError = 0; fijarPos({ lat: p.coords.latitude, lon: p.coords.longitude, gps: true, prec: p.coords.accuracy }); },
          (e2) => { localizar.reintento = false; falloUbicacion(e2, silencioso); },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 10 * 60000 }
        );
        return;
      }
      falloUbicacion(err, silencioso);
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
}
function falloUbicacion(err, silencioso) {
  S.geoError = err.code || 2;
  $('#locTxt').textContent = S.pos ? S.pos.txt || 'Última ubicación' : 'Sin ubicación: toca aquí';
  if (!silencioso) ayudaUbicacion();
  else if (!S.pos) render();
  else render();
}
const esIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const enPantallaInicio = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
function pasosUbicacion() {
  if (esIOS()) return `<ol class="pasos">
      <li>Abre <b>Ajustes</b> del iPhone → <b>Privacidad y seguridad</b> → <b>Localización</b>. Comprueba que está <b>activada</b>.</li>
      <li>En esa misma lista baja hasta <b>Sitios web de Safari</b> y elige <b>Al usar la app</b>. Activa también <b>Ubicación exacta</b>.</li>
      <li>Vuelve a <b>Ajustes</b> → <b>Apps</b> → <b>Safari</b> → <b>Ubicación</b> y elige <b>Preguntar</b> o <b>Permitir</b>.</li>
      <li>Abre esta web en <b>Safari</b>, toca el botón <b>aA</b> (o ⋯) de la barra de direcciones → <b>Ajustes del sitio web</b> → <b>Ubicación</b> → <b>Permitir</b>.</li>
      ${enPantallaInicio() ? '<li>Si usas el icono de la pantalla de inicio y sigue sin funcionar: bórralo, abre la web en Safari, acepta la ubicación y vuelve a añadirla con <b>Compartir → Añadir a pantalla de inicio</b>.</li>' : ''}
    </ol>`;
  return `<ol class="pasos">
      <li>Desliza desde arriba y comprueba que la <b>Ubicación</b> del móvil está activada.</li>
      <li>En Chrome, toca el icono a la izquierda de la dirección web (🔒 o ⚙) → <b>Permisos</b> → <b>Ubicación</b> → <b>Permitir</b>.</li>
      <li>Si la tienes instalada: mantén pulsado el icono de GasoCerca → <b>Información de la app</b> → <b>Permisos</b> → <b>Ubicación</b> → <b>Permitir</b>.</li>
      <li>Revisa también <b>Ajustes</b> → <b>Ubicación</b> → <b>Permisos de aplicaciones</b> → <b>Chrome</b> → <b>Permitir solo mientras se usa</b>.</li>
    </ol>`;
}
function ayudaUbicacion() {
  const motivo = S.geoError === 1 ? 'Tu móvil <b>no deja</b> a la app saber dónde estás. Cuando se deniega una vez, el móvil ya no vuelve a preguntar: hay que darle permiso a mano.'
    : S.geoError ? 'No se ha podido obtener tu posición (señal GPS débil o ubicación desactivada).' : 'Así le das permiso a la app para saber dónde estás.';
  abrirHoja(`<h2>📍 Activar la ubicación</h2><p class="addr">${motivo}</p>
    <h3 style="margin:10px 0 4px">${esIOS() ? 'En iPhone' : 'En Android'}</h3>
    ${pasosUbicacion()}
    <button class="btn" id="geoReintentar" style="width:100%;margin-top:6px">Ya está, volver a intentarlo</button>
    <p class="muted" style="margin-top:12px">Mientras tanto puedes escribir tu pueblo, una dirección o un código postal en el buscador de arriba.</p>`);
}
function fijarPos(p) {
  S.pos = p;
  S.ptsEsperaPos = false;
  if (p.gps) S.geoError = 0;
  if (S.ptsCentro && dist(p.lat, p.lon, S.ptsCentro.lat, S.ptsCentro.lon) * 1000 > S.ptsCentro.rad * 0.6) { S.pts = null; S.ptsCentro = null; }
  S.limite = 60;
  render();
}
function textoPos() {
  if (!S.pos) return 'Sin ubicación: busca tu pueblo →';
  let cerca = null, dmin = 1e9;
  for (const e of S.est) { const d = dist(S.pos.lat, S.pos.lon, e.lat, e.lon); if (d < dmin) { dmin = d; cerca = e; } }
  if (!S.pos.gps) { if (cerca && !S.pos.prov) S.pos.prov = cerca.prov; return '📍 ' + S.pos.txt; }
  const t = cerca && dmin < 15 ? 'Cerca de ' + nombreLoc(cerca.loc) : 'Tu ubicación';
  S.pos.txt = t; S.pos.prov = cerca?.prov;
  save('pos', S.pos);
  return t + (S.pos.prec ? ` (±${Math.round(S.pos.prec)} m)` : '');
}
// ---------------------------------------------------------------- Buscador de lugares
// 1) pueblos con gasolinera (instantáneo, sin conexión)  2) OpenStreetMap/Nominatim (cualquier sitio de España)
let idxLoc = null;
function indiceLocalidades() {
  if (idxLoc && idxLoc.n === S.est.length) return idxLoc;
  const m = new Map(), cps = new Map();
  for (const e of S.est) {
    const k = norm(nombreLoc(e.loc));
    const o = m.get(k) || { nombre: nombreLoc(e.loc), prov: e.prov, lat: 0, lon: 0, n: 0 };
    o.lat += e.lat; o.lon += e.lon; o.n++; m.set(k, o);
    const c = cps.get(e.cp) || { lat: 0, lon: 0, n: 0, nombre: nombreLoc(e.loc), prov: e.prov };
    c.lat += e.lat; c.lon += e.lon; c.n++; cps.set(e.cp, c);
  }
  idxLoc = { n: S.est.length, m, cps };
  return idxLoc;
}
function buscarLocal(q) {
  const n = norm(q).replace(/[,.]/g, ' ').replace(/\s+/g, ' ').trim();
  if (n.length < 2) return [];
  const { m, cps } = indiceLocalidades();
  const out = [];
  const prov = (o) => titulo(S.provs[o.prov] || '');
  if (/^\d{2,5}$/.test(n)) {
    for (const [cp, o] of cps) if (cp.startsWith(n)) out.push({ nombre: `${cp} · ${o.nombre}`, sub: prov(o), lat: o.lat / o.n, lon: o.lon / o.n, prov: o.prov, txt: `${o.nombre} (${cp})` });
    return out.slice(0, 6);
  }
  const exactos = [], empiezan = [], contienen = [];
  for (const [k, o] of m) {
    const r = { nombre: o.nombre, sub: prov(o), lat: o.lat / o.n, lon: o.lon / o.n, prov: o.prov, txt: o.nombre };
    if (k === n) exactos.push(r);
    else if (k.startsWith(n) || k.split(' ').some((w) => w.startsWith(n))) empiezan.push(r);
    else if (k.includes(n)) contienen.push(r);
  }
  return [...exactos, ...empiezan.sort((a, b) => a.nombre.length - b.nombre.length), ...contienen].slice(0, 6);
}
const cacheGeo = new Map();
async function buscarOSM(q) {
  const t = q.trim();
  if (t.length < 3) return [];
  if (cacheGeo.has(t)) return cacheGeo.get(t);
  const cp = /^\d{5}$/.test(t);
  const url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&accept-language=es&' +
    (cp ? `postalcode=${t}&country=es` : `countrycodes=es&q=${encodeURIComponent(t)}`);
  try {
    const r = await fetch(url, { headers: { Accept: 'application/json' } });
    const j = await r.json();
    const out = j.map((x) => {
      const a = x.address || {};
      const pueblo = a.city || a.town || a.village || a.hamlet || a.municipality || '';
      const nombre = cp ? `${t} · ${pueblo || x.name}` : x.name || pueblo;
      const sub = [pueblo && pueblo !== nombre ? pueblo : '', a.province || a.state || ''].filter(Boolean).join(', ');
      return { nombre, sub, lat: +x.lat, lon: +x.lon, txt: cp ? `${pueblo || t} (${t})` : nombre, osm: true };
    });
    cacheGeo.set(t, out);
    return out;
  } catch { return []; }
}
// Autocompletado reutilizable (cabecera y modo ruta)
function autocompletar(input, caja, alElegir, { gps = true } = {}) {
  let tmr, ultimo = [];
  const pinta = (lista, cargando) => {
    const q = input.value.trim();
    let h = '';
    if (gps) h += `<button type="button" data-i="gps">📍 <b>Usar mi ubicación (GPS)</b></button>`;
    h += lista.map((r, i) => `<button type="button" data-i="${i}">${r.osm ? '🗺️' : '⛽'} <b>${esc(r.nombre)}</b>${r.sub ? `<small>${esc(r.sub)}</small>` : ''}</button>`).join('');
    if (cargando) h += '<div class="sug-info">Buscando en el mapa…</div>';
    else if (q.length >= 2 && !lista.length) h += '<div class="sug-info">No encuentro ese sitio. Prueba con otro nombre o con el código postal.</div>';
    caja.innerHTML = h; caja.classList.toggle('on', !!h);
    ultimo = lista;
  };
  const buscar = async () => {
    const q = input.value.trim();
    const loc = buscarLocal(q);
    if (q.length < 3) return pinta(loc);
    pinta(loc, true);
    const osm = await buscarOSM(q);
    if (input.value.trim() !== q) return;
    const vistos = new Set(loc.map((r) => norm(r.nombre)));
    pinta([...loc, ...osm.filter((r) => !vistos.has(norm(r.nombre)))].slice(0, 8));
  };
  input.addEventListener('input', () => { clearTimeout(tmr); tmr = setTimeout(buscar, 350); pinta(buscarLocal(input.value)); });
  input.addEventListener('focus', () => pinta(buscarLocal(input.value)));
  input.addEventListener('blur', () => setTimeout(() => caja.classList.remove('on'), 250));
  caja.addEventListener('pointerdown', (e) => e.preventDefault()); // que no se pierda el foco al tocar
  caja.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const r = b.dataset.i === 'gps' ? { gps: true } : ultimo[+b.dataset.i];
    caja.classList.remove('on'); input.blur();
    alElegir(r);
  });
  return {
    async elegirPrimero() {
      const q = input.value.trim();
      if (!q) return;
      let r = buscarLocal(q);
      if (!r.length || norm(r[0].nombre) !== norm(q)) { const o = await buscarOSM(q); r = [...r, ...o]; }
      if (!r.length) { toast('No encuentro ese sitio. Prueba con otro nombre o con el código postal.'); return; }
      caja.classList.remove('on'); input.blur();
      alElegir(r[0]);
    },
  };
}
function irALugar(r) {
  if (r.gps) { S.pos = null; localizar(); $('#q').value = ''; return; }
  fijarPos({ lat: r.lat, lon: r.lon, gps: false, txt: r.txt || r.nombre, prov: r.prov });
  save('pos', S.pos);
  $('#q').value = '';
  toast('Mostrando ' + (r.txt || r.nombre));
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
  if (c.abiertas || c.sencillo) arr = arr.filter((e) => horarioHoy(e.hor, ahora) !== false);
  if (c.marcas.length) arr = arr.filter((e) => c.marcas.includes(marca(e.rot)));
  for (const e of arr) e.total = coste(e);
  const ord = { precio: (a, b) => a.precio - b.precio || a.d - b.d, dist: (a, b) => a.d - b.d, total: (a, b) => a.total.total - b.total.total };
  arr.sort(ord[c.orden] || ord.precio);
  return { lista: arr, todas };
}
// La distancia en línea recta se convierte en distancia por carretera con un factor medio
const RUTA = 1.3;
const minutosIda = (d) => ((d * RUTA) / Math.max(5, S.cfg.velMedia)) * 60;
const minTxt = (m) => (m < 1 ? '<1 min' : m < 60 ? Math.round(m) + ' min' : Math.floor(m / 60) + ' h ' + Math.round(m % 60) + ' min');
function coste(e) {
  // Coste de llenar + combustible para ir y volver + tu tiempo en el trayecto
  const c = S.cfg;
  const pl = e.precio / 1000;
  const llenar = pl * c.litros;
  const kmIV = e.d * RUTA * 2;
  const viaje = ((kmIV * c.consumo) / 100) * pl;
  const minutos = minutosIda(e.d) * 2;
  const tiempo = (minutos / 60) * c.valorHora;
  return { llenar, viaje, kmIV, minutos, tiempo, dinero: llenar + viaje, total: llenar + viaje + tiempo };
}
// Explicación de si compensa ir a "e" en vez de a la más cercana
function veredicto(e, cerca) {
  if (!cerca || cerca.id === e.id) return null;
  const a = e.total, b = cerca.total;
  const ahorro = b.dinero - a.dinero, extra = a.minutos - b.minutos;
  const compensa = a.total < b.total - 0.05;
  return { ahorro, extra, compensa, valorExtra: (extra / 60) * S.cfg.valorHora };
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
    const pt = { lat: p[0], lon: p[1], name: p[2], op: p[3], sk, compat, kw: kwMax, fee: p[6], hor: p[7], cap: p[8], id: p[9], osm: p[10] ?? null, d };
    pt.carga = tiempoCarga(pt);
    pt.total = costeEv(pt);
    out.push(pt);
  }
  const ord = {
    kw: (a, b) => b.kw - a.kw || a.d - b.d,
    dist: (a, b) => a.d - b.d,
    precio: (a, b) => (a.carga?.precio ?? 9) - (b.carga?.precio ?? 9) || a.d - b.d,
    total: (a, b) => a.total - b.total || a.d - b.d,
  };
  out.sort(ord[c.evOrden] || ord.dist);
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
    if (!mejor || ef > mejor.ef) mejor = { t, ef, dc, kw: k };
  }
  if (!mejor) return null;
  const kwh = 0.7 * c.bat;
  const h = kwh / (mejor.ef * (mejor.dc ? 0.85 : 0.92));
  const pk = precioKwh(pt, mejor);
  return { ...mejor, kwh, h, precio: pk.p, fuente: pk.fuente, coste: kwh * pk.p };
}
// Precio por kWh: tu tarifa > OpenStreetMap > gratis > estimación por tipo de cargador
const claveOp = (pt) => (pt.op ? 'op:' + norm(pt.op) : 'id:' + pt.id);
function precioKwh(pt, uso) {
  const c = S.cfg;
  const propia = c.tarifas?.[claveOp(pt)] ?? c.tarifas?.['id:' + pt.id];
  if (propia != null) return { p: propia, fuente: 'tu tarifa' };
  if (pt.fee === 0) return { p: 0, fuente: 'gratis' };
  if (pt.osm) return { p: pt.osm, fuente: 'OpenStreetMap' };
  const kwPunto = uso?.kw || pt.kw || 0;
  if (uso?.dc) return kwPunto >= 100 ? { p: c.kwhHPC, fuente: 'estimado (ultrarrápida)' } : { p: c.kwhDC, fuente: 'estimado (rápida)' };
  return { p: c.kwhAC, fuente: 'estimado (lenta)' };
}
function costeEv(pt) {
  // carga del 10 al 80 % + energía para ir y volver + tu tiempo de trayecto
  // + el tiempo de carga a mitad de valor (mientras carga puedes hacer otras cosas)
  const c = S.cfg;
  if (!pt.carga) return 9e9;
  const viaje = ((pt.d * RUTA * 2 * c.evConsumo) / 100) * c.kwhCasa;
  return pt.carga.coste + viaje + ((minutosIda(pt.d) * 2) / 60) * c.valorHora + pt.carga.h * c.valorHora * 0.5;
}
const durTxt = (h) => (h < 1 ? Math.round(h * 60) + ' min' : Math.floor(h) + ' h ' + String(Math.round((h % 1) * 60)).padStart(2, '0') + ' min');

// ---------------------------------------------------------------- Render
function render() {
  if (!S.cfg.tieneEV && S.cfg.modo === 'ev') S.cfg.modo = 'fuel';
  if (S.cfg.sencillo && S.cfg.vista === 'tend') S.cfg.vista = 'lista';
  document.body.classList.toggle('sencillo', !!S.cfg.sencillo);
  document.body.classList.toggle('grande', !!S.cfg.letraGrande);
  $('.seg [data-modo=ev]').hidden = !S.cfg.tieneEV;
  $('.top .seg').hidden = !S.cfg.tieneEV || !S.cfg.tieneComb; // con un solo coche no hace falta elegir modo
  document.body.classList.toggle('ev', S.cfg.modo === 'ev');
  document.querySelectorAll('.seg button').forEach((b) => b.classList.toggle('on', b.dataset.modo === S.cfg.modo));
  document.querySelectorAll('.bottom button').forEach((b) => b.classList.toggle('on', b.dataset.v === S.cfg.vista));
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('on', v.id === 'v-' + S.cfg.vista));
  $('#locTxt').textContent = textoPos();
  renderChips();
  $('.bottom [data-v=favs]').classList.toggle('aviso', alertasCumplidas().length > 0);
  if (S.ptsCentro && S.cfg.evRadio * 1000 > S.ptsCentro.rad) { S.pts = null; S.ptsCentro = null; }
  if (S.cfg.modo === 'ev' && !S.pts && !S.ptsEsperaPos) cargadores();
  const v = S.cfg.vista;
  if (v === 'lista') S.cfg.modo === 'ev' ? renderListaEv() : renderLista();
  if (v === 'mapa') renderMapa();
  if (v === 'favs') renderFavs();
  if (v === 'ruta') renderRuta();
  else seguirRuta(false);
  if (v === 'tend') renderTend();
  if (v === 'ajustes') renderAjustes();
}

function chipSel(id, label, valor, opciones) {
  return `<label class="chip sel">${label}<select data-cfg="${id}">${opciones.map(([v, t]) => `<option value="${v}" ${String(v) === String(valor) ? 'selected' : ''}>${t}</option>`).join('')}</select></label>`;
}
function renderChips() {
  const c = S.cfg;
  let h = '';
  const enRuta = c.vista === 'ruta'; // en la ruta, distancia y orden van dentro de la propia pantalla
  if (c.modo === 'fuel') {
    h += chipSel('fuel', '', c.fuel, Object.keys(FUEL_NAMES).map((k) => [k, FUEL_NAMES[k]]));
    if (!enRuta) h += chipSel('radio', '≤ ', c.radio, [1, 2, 3, 5, 10, 15, 25, 50].map((n) => [n, n + ' km']));
    if (!enRuta && !c.sencillo) h += chipSel('orden', '', c.orden, [['total', 'Lo que más compensa'], ['precio', 'Más barata'], ['dist', 'Más cerca']]);
    if (!c.sencillo) {
      h += `<button class="chip ${c.lowcost ? 'on' : ''}" data-tog="lowcost">💰 Low cost</button>`;
      h += `<button class="chip ${c.abiertas ? 'on' : ''}" data-tog="abiertas">🕐 Abiertas</button>`;
      h += `<button class="chip ${c.marcas.length ? 'on' : ''}" id="chipMarcas">🏷️ Marcas${c.marcas.length ? ' (' + c.marcas.length + ')' : ''}</button>`;
    }
  } else {
    if (!enRuta) h += chipSel('evRadio', '≤ ', c.evRadio, [2, 5, 10, 15, 25, 50].map((n) => [n, n + ' km']));
    if (!c.sencillo) h += chipSel('potMin', '', c.potMin, [[0, 'Cualquier potencia'], [7, '≥ 7 kW'], [22, '≥ 22 kW'], [50, '≥ 50 kW (rápida)'], [100, '≥ 100 kW']]);
    if (!enRuta && !c.sencillo) h += chipSel('evOrden', '', c.evOrden, [['dist', 'Más cerca'], ['total', 'Lo que más compensa'], ['precio', 'Más barata'], ['kw', 'Más potente']]);
    if (!c.sencillo) h += `<button class="chip on" id="chipConect">🔌 ${c.conectores.filter((x) => x !== 't2c').map((x) => SOCKET_NAMES[x]).join(' + ') || 'Conector'}</button>`;
    if (!c.sencillo) h += `<button class="chip ${c.gratis ? 'on' : ''}" data-tog="gratis">🆓 Gratis</button>`;
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
function minutosDatos() {
  const m = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/.exec(S.fecha || '');
  return m ? (Date.now() - new Date(+m[3], m[2] - 1, +m[1], +m[4], +m[5]).getTime()) / 60000 : 0;
}
function avisoDatos() {
  const h = minutosDatos() / 60;
  if (h > 8 && S.cfg.sencillo) return `<div class="geoaviso">⏰ Estos precios son de ${haceCuanto()} y pueden haber cambiado. <button id="directo">Actualizar precios</button></div>`;
  return h > 8 ? `<div class="geoaviso">⏰ Los precios son de ${haceCuanto()}. Puede que las actualizaciones automáticas de GitHub estén pausadas: entra en la pestaña <b>Actions</b> del repositorio y pulsa <b>Enable workflow</b>. <button id="directo">Descargar ahora del Ministerio</button></div>` : '';
}
function haceCuanto() {
  const m = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/.exec(S.fecha || '');
  if (!m) return '';
  const min = Math.round((Date.now() - new Date(+m[3], m[2] - 1, +m[1], +m[4], +m[5]).getTime()) / 60000);
  return min < 2 ? 'ahora mismo' : min < 60 ? `hace ${min} min` : min < 1440 ? `hace ${Math.round(min / 60)} h` : (Math.round(min / 1440) === 1 ? 'hace 1 día' : `hace ${Math.round(min / 1440)} días`);
}

function tarjeta(e, cortes, ahora = new Date()) {
  const ab = horarioHoy(e.hor, ahora);
  if (S.cfg.sencillo) {
    return `<div class="card" data-est="${e.id}">
    <div class="nm">${S.favs.has(e.id) ? '<span class="star">★</span>' : ''}<span class="t">${esc(nombreMarca(marca(e.rot)) === 'Sin marca' ? titulo(e.rot) || 'Gasolinera' : nombreMarca(marca(e.rot)))}</span></div>
    <div class="big"><span class="price ${claseP(e.precio, cortes)}">${pr(e.precio)}<small> €</small></span><span class="lbl">${FUEL_NAMES[S.cfg.fuel]}</span></div>
    <div class="sub">${esc(titulo(e.dir))}, ${esc(nombreLoc(e.loc))}</div>
    <div class="row2"><span class="tag">a <b>${km(e.d)}</b> · ${minTxt(minutosIda(e.d))} en coche</span>${/24\s*H/i.test(e.hor) ? '<span class="tag op">Abierta 24 h</span>' : ''}<a class="ir" href="${irURL(e.lat, e.lon)}" target="_blank" rel="noopener">🧭 Ir</a></div>
  </div>`;
  }
  const otro = ES_GASOLINA(S.cfg.fuel) ? 'dsl' : 'g95';
  const extras = [];
  extras.push(`<span class="tag"><b>${km(e.d)}</b> · ${minTxt(minutosIda(e.d))}</span>`);
  if (e.p[otro]) extras.push(`<span class="tag">${FUEL_SHORT[otro]} <b>${pr(e.p[otro])}</b></span>`);
  const dl = deltaAyer(e, S.cfg.fuel);
  if (dl) extras.push(`<span class="tag ${dl < 0 ? 'baja' : 'sube'}">${dl < 0 ? '▼' : '▲'} ${Math.abs(dl / 10).toLocaleString('es-ES', { maximumFractionDigits: 1 })} cts</span>`);
  if (esLowcost(e)) extras.push('<span class="tag lc">Low cost</span>');
  if (ab === false) extras.push('<span class="tag cl">Cerrada ahora</span>');
  else if (/24\s*H/i.test(e.hor)) extras.push('<span class="tag op">24 h</span>');
  return `<div class="card" data-est="${e.id}">
    <div class="nm">${S.favs.has(e.id) ? '<span class="star">★</span>' : ''}<span class="t">${esc(nombreMarca(marca(e.rot)) === 'Sin marca' ? titulo(e.rot) || 'Gasolinera' : nombreMarca(marca(e.rot)))}</span></div>
    <div class="big"><span class="price ${claseP(e.precio, cortes)}">${pr(e.precio)}<small> €</small></span><span class="lbl">${FUEL_SHORT[S.cfg.fuel]}</span></div>
    <div class="sub">${esc(titulo(e.dir))}, ${esc(nombreLoc(e.loc))}</div>
    <div class="row2">${extras.join('')}</div>
  </div>`;
}

function sinUbicacionHTML() {
  return `<div class="empty"><b>¿Dónde estás?</b>${S.geoError === 1 ? 'El móvil no deja a la app usar tu ubicación.' : 'Necesito tu ubicación para buscar cerca de ti.'}
    <div style="display:flex;flex-direction:column;gap:8px;margin-top:14px"><button class="btn" id="geoReintentar">📍 Usar mi ubicación</button>
    <button class="btn alt" id="geoAyuda">No me la pide: cómo dar permiso</button></div>
    <p class="muted" style="margin-top:12px">O escribe tu pueblo, dirección o código postal arriba.</p></div>`;
}
function avisoGeo() {
  // la última ubicación guardada se sigue usando, pero avisamos de que el GPS no funciona
  return S.geoError === 1 && S.pos ? '<div class="geoaviso">📍 Sin permiso de ubicación: uso la última posición guardada. <button id="geoAyuda">Cómo activarla</button></div>' : '';
}
function renderLista() {
  if (!S.est.length) { $('#lista').innerHTML = '<div class="empty"><b>Cargando precios…</b>Precios oficiales del Ministerio para la Transición Ecológica</div>'; $('#banner').innerHTML = ''; return; }
  if (!S.pos) { $('#lista').innerHTML = sinUbicacionHTML(); $('#banner').innerHTML = ''; return; }
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
  const barata = lista.reduce((a, b) => (b.precio < a.precio || (b.precio === a.precio && b.d < a.d) ? b : a));
  const media = lista.reduce((a, e) => a + e.precio, 0) / lista.length;
  const nom = (e) => esc(nombreMarca(marca(e.rot)) === 'Sin marca' ? titulo(e.rot) : nombreMarca(marca(e.rot)));
  let b = '';
  if (mejor.id === cerca.id) {
    b = `<b>Te compensa la más cercana: ${nom(mejor)}</b> · ${km(mejor.d)}, ${minTxt(minutosIda(mejor.d))}<small>${pr(mejor.precio)} €/L · llenar ${c.litros} L: ${eur(mejor.total.llenar)}</small>`;
    const v = veredicto(barata, cerca);
    if (v && v.ahorro > 0.01) b += `<small>La más barata (${nom(barata)}, a ${km(barata.d)}) te ahorraría ${eur(v.ahorro)}, pero son ${minTxt(v.extra)} más de trayecto: no compensa. <button data-est="${barata.id}">Ver</button></small>`;
  } else {
    const v = veredicto(mejor, cerca);
    b = `<b>Te compensa: ${nom(mejor)} a ${km(mejor.d)}</b> · ${pr(mejor.precio)} €/L<small>Ahorras ${eur(Math.max(0, v.ahorro))} frente a la más cercana${v.extra >= 1 ? ` y son ${minTxt(v.extra)} más de trayecto (ida y vuelta)` : ''}. <button data-est="${mejor.id}">Ver</button></small>`;
  }
  if (c.sencillo) {
    const v = veredicto(mejor, cerca);
    b = `<b>👍 Te recomendamos: ${nom(mejor)}</b><small>${pr(mejor.precio)} € el litro · a ${km(mejor.d)} (${minTxt(minutosIda(mejor.d))})${v && v.ahorro > 0.5 ? ` · ahorras ${eur(v.ahorro)} frente a la más cercana` : ''}</small>
      <div class="bduo"><a class="btn-ir" href="${irURL(mejor.lat, mejor.lon)}" target="_blank" rel="noopener">🧭 Llévame</a><button class="btn-ver" data-est="${mejor.id}">Ver detalles</button></div>`;
  } else
  b += `<small>${lista.length} ${lista.length === 1 ? 'gasolinera' : 'gasolineras'} · media ${pr(media)} €/L · precios ${haceCuanto()}${c.valorHora ? ` · tu tiempo: ${c.valorHora} €/h` : ''}</small>`;
  const sigRadio = [1, 2, 3, 5, 10, 15, 25, 50].find((n) => n > c.radio);
  const ampliar = lista.length < 4 && sigRadio && !c.lowcost && !c.marcas.length
    ? `<div class="geoaviso">Solo hay ${lista.length} ${lista.length === 1 ? 'gasolinera' : 'gasolineras'} a menos de ${c.radio} km. <button data-radio="${Math.max(sigRadio, 15)}">Buscar hasta ${Math.max(sigRadio, 15)} km</button></div>` : '';
  $('#banner').innerHTML = avisosAlertas() + avisoDatos() + avisoGeo() + `<div class="banner">${b}</div>` + ampliar;
  const ahora = new Date();
  let h = lista.slice(0, S.limite).map((e) => tarjeta(e, cortes, ahora)).join('');
  if (lista.length > S.limite) h += `<button class="more" id="mas">Ver más (${lista.length - S.limite})</button>`;
  $('#lista').innerHTML = h;
  cargarHistLista(lista);
}

function tarjetaEv(p) {
  const t = p.carga;
  if (S.cfg.sencillo) {
    const rapida = p.compat.some((s) => ['ccs', 'chademo', 'tesla'].includes(s[0]));
    return `<div class="card" data-ev="${p.id}">
    <div class="nm">${S.favsEv.has(p.id) ? '<span class="star">★</span>' : ''}<span class="t">${esc(p.name || p.op || 'Punto de recarga')}</span></div>
    <div class="big"><span class="price ${rapida ? 'p-ok' : 'p-mid'}" style="font-size:16px">${rapida ? '⚡ Rápida' : '🔌 Lenta'}</span>${t ? `<span class="lbl">carga en ${durTxt(t.h)}</span>` : ''}</div>
    <div class="sub">${esc(p.name && p.op ? p.op : '')}${t ? (t.precio === 0 ? ' · Gratis' : ` · ${t.fuente.startsWith('estimado') ? 'unos ' : ''}${eur(t.coste, 0)} la carga`) : ''}</div>
    <div class="row2"><span class="tag">a <b>${km(p.d)}</b> · ${minTxt(minutosIda(p.d))} en coche</span><a class="ir" href="${irURL(p.lat, p.lon)}" target="_blank" rel="noopener">🧭 Ir</a></div>
  </div>`;
  }
  const sk = p.sk.length ? p.sk.map((s) => `<span class="tag ${p.compat.includes(s) ? 'ev' : ''}">${SOCKET_NAMES[s[0]]}${s[1] > 1 ? ' ×' + s[1] : ''}${s[2] ? ' · <b>' + s[2] + ' kW</b>' : ''}</span>`).join('') : '<span class="tag">Conector sin especificar</span>';
  const titulo_ = p.name || p.op || 'Punto de recarga';
  return `<div class="card" data-ev="${p.id}">
    <div class="nm">${S.favsEv.has(p.id) ? '<span class="star">★</span>' : ''}<span class="t">${esc(titulo_)}</span></div>
    <div class="big"><span class="price ${p.kw >= 50 ? 'p-ok' : p.kw >= 22 ? 'p-mid' : ''}" style="${p.kw ? '' : 'color:var(--muted)'}">${p.kw ? p.kw : '?'}<small> kW</small></span><span class="lbl">${km(p.d)}</span></div>
    <div class="sub">${esc(p.name && p.op ? p.op : '')}</div>
    <div class="row2">${t ? `<span class="tag ${t.precio === 0 ? 'lc' : ''}">${t.precio === 0 ? 'Gratis' : `${t.fuente.startsWith('estimado') ? '~' : ''}<b>${t.precio.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €/kWh</b>`}</span>` : ''}<span class="tag">${minTxt(minutosIda(p.d))}</span>${sk}${t ? `<span class="tag">10→80 % <b>${durTxt(t.h)}</b>${t.coste ? ' · ' + eur(t.coste, 0) : ''}</span>` : ''}</div>
  </div>`;
}
function renderListaEv() {
  if (!S.pos) { $('#lista').innerHTML = sinUbicacionHTML(); $('#banner').innerHTML = ''; return; }
  if (!S.pts) { $('#lista').innerHTML = '<div class="empty"><b>Cargando puntos de recarga…</b>Datos de OpenStreetMap</div>'; $('#banner').innerHTML = ''; return; }
  const l = cargadoresCerca();
  const c = S.cfg;
  const rapidos = l.filter((p) => p.compat.some((s) => s[0] === 'ccs')).length;
  const mejor = l.filter((p) => p.carga).reduce((a, b) => (!a || b.total < a.total ? b : a), null);
  let bn = '';
  if (mejor) {
    const t = mejor.carga;
    bn = `<b>Te compensa: ${esc(mejor.name || mejor.op || 'Punto de recarga')}</b> · ${km(mejor.d)}, ${minTxt(minutosIda(mejor.d))}<small>${t.precio === 0 ? 'Gratis' : (t.fuente.startsWith('estimado') ? '~' : '') + t.precio.toLocaleString('es-ES', { minimumFractionDigits: 2 }) + ' €/kWh · ' + t.fuente} · 10→80 % en ${durTxt(t.h)}${t.coste ? ' por ' + eur(t.coste) : ''} <button data-ev="${mejor.id}">Ver</button></small><small>Cuenta el precio, el trayecto y el tiempo de carga.</small>`;
  }
  if (c.sencillo && mejor) bn = `<b>👍 Te recomendamos: ${esc(mejor.name || mejor.op || 'Punto de recarga')}</b><small>a ${km(mejor.d)} (${minTxt(minutosIda(mejor.d))}) · carga en ${durTxt(mejor.carga.h)}</small>
      <div class="bduo"><a class="btn-ir" href="${irURL(mejor.lat, mejor.lon)}" target="_blank" rel="noopener">🧭 Llévame</a><button class="btn-ver" data-ev="${mejor.id}">Ver detalles</button></div>`;
  if (c.sencillo) { $('#banner').innerHTML = l.length ? `<div class="banner">${bn}</div>` : ''; }
  else $('#banner').innerHTML = l.length ? `<div class="banner">${bn}<small>${l.length} ${l.length === 1 ? 'punto compatible' : 'puntos compatibles'} con tu ${esc(nombreEV())} · ${rapidos} con CCS2 · ${esc(S.ptsFuente)}</small></div>` : '';
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
function litrosHTML(precio) {
  const litros = (eu) => (eu / (precio / 1000)).toLocaleString('es-ES', { maximumFractionDigits: 1 });
  return `<div class="box"><h3>💶 ¿Cuántos litros me dan?</h3>
      <div class="kv"><span>20 €</span><span>${litros(20)} L</span></div>
      <div class="kv"><span>30 €</span><span>${litros(30)} L</span></div>
      <div class="kv"><span>50 €</span><span>${litros(50)} L</span></div></div>`;
}
// Calculadora en ruta: el viaje lo haces igualmente, solo cuesta salir de la ruta y volver a ella
function calcRutaHTML(r) {
  const c = S.cfg, ev = c.modo === 'ev';
  const res = S.rutaRes || [];
  const T = (x) => (ev ? x.total : x.total.total);
  const nom = (x) => esc(ev ? x.name || x.op || 'Punto de recarga' : nombreMarca(marca(x.rot)) === 'Sin marca' ? titulo(x.rot) : nombreMarca(marca(x.rot)));
  const mejor = res.reduce((a, b) => (!a || T(b) < T(a) ? b : a), null);
  const primera = res.reduce((a, b) => (!a || b.along < a.along ? b : a), null);
  const kmDesvio = 2 * r.perp * RUTA;
  let h = `<div class="box"><h3>🧮 ¿Me compensa parar aquí? <small class="muted">(vas de viaje)</small></h3>`;
  if (ev) {
    const t = r.carga;
    h += `<div class="kv"><span>Carga 10→80 % (${durTxt(t.h)})</span><span>${t.coste ? (t.fuente.startsWith('estimado') ? '≈ ' : '') + eur(t.coste) : 'Gratis'}</span></div>
      <div class="kv"><span>Desvío: ${r.perp < 0.05 ? 'ninguno' : minTxt(r.desvio) + ' (≈ ' + km(kmDesvio) + ')'}</span><span>${eur((r.desvio / 60) * c.valorHora)}</span></div>
      <div class="kv"><span>Tu tiempo esperando la carga</span><span>${eur(t.h * c.valorHora)}</span></div>
      <div class="kv tot"><span>Coste total de la parada</span><span>${eur(T(r))}</span></div>`;
  } else {
    h += `<div class="kv"><span>Repostar ${c.litros} L</span><span>${eur(r.total.llenar)}</span></div>
      <div class="kv"><span>Combustible del desvío (≈ ${km(kmDesvio)})</span><span>${eur(r.total.viaje)}</span></div>
      <div class="kv"><span>Tu tiempo de desvío: ${r.perp < 0.05 ? 'ninguno' : minTxt(r.desvio)}</span><span>${eur(r.total.tiempo)}</span></div>
      <div class="kv tot"><span>Coste total de la parada</span><span>${eur(T(r))}</span></div>`;
  }
  if (mejor && mejor.id === r.id) h += `<div class="veredicto si">✅ <b>Es la parada que más te compensa</b> de las ${res.length} de tu ruta.</div>`;
  else if (mejor) {
    const dif = T(r) - T(mejor);
    h += dif < 0.5
      ? `<div class="veredicto si">✅ <b>Compensa.</b> La mejor de tu ruta (${nom(mejor)}, km ${Math.round(mejor.along)}) solo te ahorraría ${eur(dif)}.</div>`
      : `<div class="veredicto no">💡 <b>Hay una mejor en tu ruta:</b> ${nom(mejor)}, en el km ${Math.round(mejor.along)} (${km(mejor.kmFalta)} por delante). Te ahorrarías ${eur(dif)}. <button class="lnk" data-${ev ? 'ev' : 'est'}="${mejor.id}" data-enruta="1">Ver</button></div>`;
  }
  if (primera && primera.id !== r.id) {
    const dif = T(primera) - T(r);
    h += `<div class="muted" style="margin-top:8px">Frente a la primera que te vas a encontrar (${nom(primera)}, km ${Math.round(primera.along)}): ${dif >= 0 ? `parar aquí te ahorra ${eur(dif)}` : `parar aquí te cuesta ${eur(-dif)} más`}.</div>`;
  }
  h += `<div class="muted" style="margin-top:6px">El viaje lo vas a hacer igualmente, así que solo se cuenta el desvío para salir de la ruta y volver a ella. Tu tiempo se valora a ${c.valorHora} €/h (cámbialo en Ajustes).</div></div>`;
  return h;
}
async function detalle(id, enRuta = false) {
  const e0 = S.est.find((x) => x.id == id);
  if (!e0) return;
  const c = S.cfg;
  // abierta desde la Ruta: solo cuenta el desvío, no ir y volver desde donde estás
  const r = enRuta && S.ruta ? (S.rutaRes || []).find((x) => String(x.id) === String(id)) : null;
  const d = S.pos ? dist(S.pos.lat, S.pos.lon, e0.lat, e0.lon) : 0;
  const e = { ...e0, d, precio: e0.p[c.fuel] || 0 };
  // medias de la zona para comparar
  // gasolineras de alrededor de ESTA gasolinera (sirve también para las de la ruta)
  const zona = S.est.filter((x) => dist(e0.lat, e0.lon, x.lat, x.lon) <= 5);
  const mediaZ = (f) => { const v = zona.map((x) => x.p[f]).filter(Boolean); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
  const filas = Object.keys(FUEL_NAMES).filter((f) => e.p[f]).map((f) => {
    const m = mediaZ(f); const df = m ? (e.p[f] - m) / 10 : 0;
    const cmp = m && zona.length > 2 ? `<span class="${df > 0.05 ? 'up' : df < -0.05 ? 'down' : 'muted'}">${df > 0 ? '+' : ''}${df.toLocaleString('es-ES', { maximumFractionDigits: 1 })} cts</span>` : '';
    return `<tr class="${f === c.fuel ? 'sel' : ''}"><td>${FUEL_NAMES[f]}</td><td>${pr(e.p[f])} €</td><td>${cmp}</td></tr>`;
  }).join('');
  // en ruta importa si está abierta a la hora a la que llegas
  const ab = horarioHoy(e.hor, r ? r.eta : new Date());
  const hLleg = r ? r.eta.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';
  let calc = '';
  if (e.precio && r) calc = litrosHTML(e.precio) + calcRutaHTML(r);
  else if (e.precio) {
    const t = coste(e);
    calc = litrosHTML(e.precio);
    // la más cercana con el mismo combustible para comparar
    let cerca = null;
    for (const x of S.est) {
      if (!x.p[c.fuel] || !S.pos) continue;
      const dx = dist(S.pos.lat, S.pos.lon, x.lat, x.lon);
      if (!cerca || dx < cerca.d) cerca = { ...x, d: dx, precio: x.p[c.fuel] };
    }
    if (cerca) cerca.total = coste(cerca);
    e.total = t;
    const v = veredicto(e, cerca);
    calc += `<div class="box"><h3>🧮 ¿Me compensa ir? (${esc(FUEL_NAMES[c.fuel])})</h3>
      <div class="kv"><span>Repostar ${c.litros} L</span><span>${eur(t.llenar)}</span></div>
      <div class="kv"><span>Combustible ida y vuelta (≈ ${km(t.kmIV)})</span><span>${eur(t.viaje)}</span></div>
      <div class="kv"><span>Tu tiempo: ${minTxt(t.minutos)} a ${c.valorHora} €/h</span><span>${eur(t.tiempo)}</span></div>
      <div class="kv tot"><span>Coste total</span><span>${eur(t.total)}</span></div>
      ${v ? `<div class="veredicto ${v.compensa ? 'si' : 'no'}">${v.compensa ? '✅ <b>Compensa</b>' : '❌ <b>No compensa</b>'} frente a la más cercana (${esc(nombreMarca(marca(cerca.rot)))}, ${km(cerca.d)}): ${v.ahorro >= 0 ? `ahorras ${eur(v.ahorro)}` : `pagas ${eur(-v.ahorro)} más`} y son ${minTxt(Math.max(0, v.extra))} más de trayecto${v.extra > 0 && c.valorHora ? ` (para ti valen ${eur(v.valorExtra)})` : ''}.</div>` : cerca && cerca.id === e.id ? '<div class="veredicto si">📍 Es la gasolinera más cercana.</div>' : ''}
      <div class="muted" style="margin-top:6px">Trayecto estimado a ${c.velMedia} km/h de media. Cambia la velocidad, el valor de tu tiempo, los litros y el consumo en Ajustes.</div></div>`;
  }
  const fav = S.favs.has(e.id);
  const sen = c.sencillo;
  const principal = sen ? `<div class="pgrande"><span>${esc(FUEL_NAMES[c.fuel])}</span><b>${e.precio ? pr(e.precio) + ' €' : '—'}</b><small>${e.precio ? `el litro · llenar ${c.litros} L: ${eur((e.precio / 1000) * c.litros)}` : 'No vende este combustible'}</small></div>
    <a class="btn-ir grande" href="${irURL(e.lat, e.lon)}" target="_blank" rel="noopener">🧭 Cómo llegar</a>
    <div class="duo"><button class="btn alt" data-fav="${e.id}" data-lbl="1">${fav ? '★ En favoritas' : '☆ Guardar en favoritas'}</button><button class="btn alt" data-share="est" data-id="${e.id}">📤 Compartir</button></div>` : '';
  abrirHoja(`<h2><span>${esc(nombreMarca(marca(e.rot)) === 'Sin marca' ? titulo(e.rot) : nombreMarca(marca(e.rot)))}</span><button class="favbtn ${fav ? 'on' : ''}" data-fav="${e.id}" aria-label="Favorita">${fav ? '★' : '☆'}</button></h2>
    <p class="addr">${esc(titulo(e.dir))}, ${esc(nombreLoc(e.loc))} · ${r ? `km ${Math.round(r.along)} de tu ruta (${km(r.kmFalta)} por delante)` : km(d)}<br>
    ${ab === true ? `<span class="down">● Abierta ${r ? 'cuando llegues (' + hLleg + ')' : 'ahora'}</span>` : ab === false ? `<span class="up">● Cerrada ${r ? 'cuando llegues (' + hLleg + ')' : 'ahora'}</span>` : ''} <span class="muted">${esc(e.hor)}</span>
    ${esLowcost(e) ? ' · <span class="tag lc">Low cost</span>' : ''}</p>
    ${principal}${sen ? '<details class="mas"><summary>Ver más detalles (todos los precios, calculadora, alertas…)</summary>' : ''}
    ${r ? bloqueRuta(e.id) : ''}
    ${navLinks(e.lat, e.lon)}
    <div class="duo"><button class="btn alt" data-share="est" data-id="${e.id}">📤 Compartir</button><button class="btn" data-apuntar="est" data-id="${e.id}">⛽ He repostado aquí</button></div>
    <table class="ptable">${filas}</table>
    <div class="muted">Comparado con la media de las ${zona.length} gasolineras a menos de 5 km de esta. Precios del ${esc(S.fecha)}.</div>
    ${calc}
    ${alertaHTML(e)}
    <div class="box" id="histBox"><h3>📈 Evolución de precios</h3><div class="muted">Cargando…</div></div>${sen ? '</details>' : ''}`);
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
function detalleEv(id, enRuta = false) {
  const p = (S.pts || []).find((x) => x[9] === id);
  if (!p) return;
  const r = enRuta && S.ruta ? (S.rutaRes || []).find((x) => String(x.id) === String(id)) : null;
  const d = S.pos ? dist(S.pos.lat, S.pos.lon, p[0], p[1]) : 0;
  const pt = { lat: p[0], lon: p[1], name: p[2], op: p[3], sk: p[4], kw: p[5], fee: p[6], hor: p[7], cap: p[8], id: p[9], d };
  pt.osm = p[10] ?? null;
  pt.compat = pt.sk.filter((s) => S.cfg.conectores.includes(s[0]));
  if (!pt.sk.length) pt.compat = [['t2', 1, 0]]; // supuesto razonable si no hay datos
  const t = tiempoCarga(pt);
  const clave = claveOp(pt);
  const propia = S.cfg.tarifas?.[clave];
  const fav = S.favsEv.has(id);
  const sk = pt.sk.length ? pt.sk.map((s) => `<tr><td>${SOCKET_NAMES[s[0]]}${pt.compat.includes(s) ? ' ✅' : ''}</td><td>${s[2] ? s[2] + ' kW' : '—'}</td><td>${s[1]} toma${s[1] > 1 ? 's' : ''}</td></tr>`).join('') : '<tr><td colspan="3" class="muted">OpenStreetMap no indica los conectores de este punto.</td></tr>';
  const sen = S.cfg.sencillo;
  const principalEv = sen && t ? `<div class="pgrande ev"><span>Tu ${esc(nombreEV())} del 10 % al 80 %</span><b>${durTxt(t.h)}</b><small>${t.precio === 0 ? 'Gratis' : (t.fuente.startsWith('estimado') ? 'unos ' : '') + eur(t.coste) + ' la carga'}</small></div>` : '';
  const botonesEv = sen ? `${principalEv}<a class="btn-ir grande" href="${irURL(pt.lat, pt.lon)}" target="_blank" rel="noopener">🧭 Cómo llegar</a><details class="mas"><summary>Ver más detalles (conectores, precio, tarifa…)</summary>` : '';
  abrirHoja(`<h2><span>${esc(pt.name || pt.op || 'Punto de recarga')}</span><button class="favbtn ${fav ? 'on' : ''}" data-favev="${id}" aria-label="Favorito">${fav ? '★' : '☆'}</button></h2>
    <p class="addr">${esc(pt.op)}${pt.op ? ' · ' : ''}${r ? `km ${Math.round(r.along)} de tu ruta (${km(r.kmFalta)} por delante)` : km(d)}${pt.fee === 0 ? ' · <b class="down">Gratis</b>' : pt.fee === 1 ? ' · De pago' : ''}${pt.hor ? '<br><span class="muted">Horario: ' + esc(pt.hor === '24/7' ? '24 horas' : pt.hor) + '</span>' : ''}</p>
    ${botonesEv}
    ${r ? bloqueRuta(id) : ''}
    ${navLinks(pt.lat, pt.lon)}
    <div class="duo"><button class="btn alt" data-share="ev" data-id="${id}">📤 Compartir</button><button class="btn" data-apuntar="ev" data-id="${id}">⚡ He cargado aquí</button></div>
    <table class="ptable">${sk}</table>
    ${t ? `<div class="box"><h3>🔋 Tu ${esc(nombreEV())} del 10 % al 80 %</h3>
      <div class="kv"><span>Conector usado</span><span>${SOCKET_NAMES[t.t]} a ${t.ef.toLocaleString('es-ES')} kW</span></div>
      <div class="kv"><span>Energía (${t.kwh.toLocaleString('es-ES', { maximumFractionDigits: 1 })} kWh)</span><span>≈ ${durTxt(t.h)}</span></div>
      <div class="kv"><span>Precio</span><span>${t.precio === 0 ? 'Gratis' : t.precio.toLocaleString('es-ES', { minimumFractionDigits: 2 }) + ' €/kWh'}</span></div>
      <div class="kv tot"><span>Coste de la carga</span><span>${t.coste === 0 ? 'Gratis' : (t.fuente.startsWith('estimado') ? '≈ ' : '') + eur(t.coste)}</span></div>
      ${r ? '' : `<div class="kv"><span>Trayecto ida y vuelta</span><span>${minTxt(minutosIda(d) * 2)}</span></div>`}
      <div class="muted" style="margin-top:6px">Precio: <b>${esc(t.fuente)}</b>. ${t.fuente.startsWith('estimado') ? 'Los operadores no publican sus tarifas en abierto; consulta el precio exacto en su app o en el mapa oficial Reve y guárdalo aquí abajo.' : ''}</div></div>
    ${r ? calcRutaHTML(r) : ''}
    <div class="box"><h3>💾 ¿Cuánto pagas aquí?</h3>
      <div class="muted">Se guarda para ${pt.op ? 'todos los cargadores de <b>' + esc(pt.op) + '</b>' : 'este cargador'} y se usa en los cálculos.</div>
      <div class="tarifa"><input id="tarifaIn" type="text" inputmode="decimal" autocomplete="off" placeholder="0,49" value="${propia != null ? String(propia).replace('.', ',') : ''}"><span>€/kWh</span>
      <button class="btn" data-tarifa="${esc(clave)}" data-evid="${id}">Guardar</button>${propia != null ? `<button class="btn alt" data-tarifadel="${esc(clave)}" data-evid="${id}">Quitar</button>` : ''}</div>
      <a class="muted" href="https://www.mapareve.es/mapa-puntos-recarga" target="_blank" rel="noopener">Ver precios oficiales en el mapa Reve (Ministerio y Red Eléctrica) ↗</a></div>` : ''}
    <div class="muted">Datos de OpenStreetMap. <a href="https://www.openstreetmap.org/${{ n: 'node', w: 'way', r: 'relation' }[id[0]]}/${id.slice(1)}" target="_blank" rel="noopener">Ver o corregir</a></div>${sen ? '</details>' : ''}`);
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
  let h = avisosAlertas() + '<h3 style="margin:6px 4px">⛽ Gasolineras favoritas</h3>';
  h += fs.length ? fs.map((e) => (e.precio ? tarjeta(e, cortesDe(fs.filter((x) => x.precio))) : '')).join('') : '<div class="empty">Toca ☆ en una gasolinera para guardarla aquí y ver su precio de un vistazo.</div>';
  const evs = (S.pts || []).filter((p) => S.favsEv.has(p[9]));
  if (S.favsEv.size) {
    h += '<h3 style="margin:14px 4px 6px">⚡ Puntos de recarga favoritos</h3>';
    h += evs.map((p) => {
      const pt = { lat: p[0], lon: p[1], name: p[2], op: p[3], sk: p[4], kw: p[5], fee: p[6], hor: p[7], cap: p[8], id: p[9], d: S.pos ? dist(S.pos.lat, S.pos.lon, p[0], p[1]) : 0 };
      pt.compat = pt.sk.filter((s) => c.conectores.includes(s[0]));
      pt.osm = p[10] ?? null; pt.carga = tiempoCarga(pt);
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
  let h = diarioHTML();
  // Comparativa coste por 100 km
  const zona = S.pos ? S.est.filter((e) => e.p.g95 && dist(S.pos.lat, S.pos.lon, e.lat, e.lon) <= 10) : [];
  const g95 = zona.length ? zona.reduce((a, e) => a + e.p.g95, 0) / zona.length / 1000 : null;
  // precio medio de TU combustible en la zona
  const fz = ['g95', 'g98', 'dsl', 'dslp', 'glp', 'e10', 'g95p', 'hvo', 'gnc'].includes(c.fuel) ? c.fuel : 'g95';
  const zf = S.pos ? S.est.filter((e) => e.p[fz] && dist(S.pos.lat, S.pos.lon, e.lat, e.lon) <= 10) : [];
  const pf = zf.length ? zf.reduce((a, e) => a + e.p[fz], 0) / zf.length / 1000 : g95;
  const celdas = [];
  if (c.tieneComb) celdas.push(`<div><b>${pf ? eur(c.consumo * pf) : '—'}</b><span>${esc(nombreComb())} · ${fmtN(c.consumo, 1)} L/100 km${pf ? ' a ' + pf.toLocaleString('es-ES', { maximumFractionDigits: 3 }) + ' €/L' : ''}</span></div>`);
  if (c.tieneEV) celdas.push(`<div><b>${eur(c.evConsumo * c.kwhCasa)}</b><span>${esc(nombreEV())} en casa · ${fmtN(c.evConsumo, 1)} kWh a ${eur(c.kwhCasa, 2)}</span></div>`,
    `<div><b>${eur(c.evConsumo * c.kwhDC)}</b><span>${esc(nombreEV())} en carga rápida pública · ~${eur(c.kwhDC)}/kWh</span></div>`);
  if (c.tieneComb && c.tieneEV) celdas.push(`<div><b>${pf ? eur(c.consumo * pf - c.evConsumo * c.kwhCasa) : '—'}</b><span>Ahorro cada 100 km usando el eléctrico cargado en casa</span></div>`);
  h += `<h2 style="margin:22px 0 8px">${c.tieneComb && c.tieneEV ? 'Tus coches: coste por 100 km' : 'Lo que te cuesta cada 100 km'}</h2><div class="stat">${celdas.join('')}</div>`;
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
  const num = tipo === 'number';
  const val = num ? String(v).replace('.', ',') : v;
  return `<div class="field"><label for="f-${id}">${label}</label><input id="f-${id}" type="text" data-set="${id}" value="${esc(val)}" ${num ? 'inputmode="decimal" autocomplete="off"' : ''}></div>`;
}
function renderAjustes() {
  const c = S.cfg;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const instalada = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  // opciones que pueden agobiar: en modo sencillo van plegadas al final
  const tiempoAv = `${campo('velMedia', 'Velocidad media en tus trayectos (km/h)', 'number')}`;
  const evAv = c.tieneEV ? `<h3 style="margin:14px 0 6px">⚡ Recarga (avanzado)</h3>
    ${campo('acKw', 'Carga lenta máx. del coche (kW)', 'number')}
    ${campo('dcKw', 'Carga rápida máx. del coche (kW)', 'number')}
    <div class="field" style="flex-wrap:wrap"><label>Conectores de tu coche</label><div class="brands" style="margin:0">${['ccs', 't2', 'chademo', 'schuko'].map((k) => `<button class="chip ${c.conectores.includes(k) ? 'on' : ''}" data-conect="${k}">${SOCKET_NAMES[k]}</button>`).join('')}</div></div>
    ${campo('sinDatos', 'Mostrar puntos sin datos de conector', 'check')}
    <div class="muted" style="margin:10px 2px 6px">Precios orientativos de recarga pública cuando no conoces la tarifa:</div>
    ${campo('kwhAC', 'Carga lenta (€/kWh)', 'number')}
    ${campo('kwhDC', 'Carga rápida (€/kWh)', 'number')}
    ${campo('kwhHPC', 'Ultrarrápida ≥100 kW (€/kWh)', 'number')}
    ${Object.keys(c.tarifas || {}).length ? `<div class="box"><h3>💾 Tus tarifas</h3>${Object.entries(c.tarifas).map(([k, v]) => `<div class="kv"><span>${esc(k.startsWith('op:') ? titulo(k.slice(3)) : 'Cargador ' + k.slice(4))}</span><span>${v.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €/kWh <button class="tag" data-tarifadel="${esc(k)}">✕</button></span></div>`).join('')}</div>` : ''}` : '';
  const lcAv = `<h3 style="margin:14px 0 6px">💰 Marcas low cost</h3>
    <div class="muted">Una por línea. Se usan para el filtro «Low cost».</div>
    <textarea id="lowcostTxt">${esc(c.lowcostList.join('\n'))}</textarea>
    <div style="display:flex;gap:8px;margin-top:6px"><button class="btn" id="guardarLc">Guardar</button><button class="btn alt" id="resetLc">Restaurar lista</button></div>`;
  const datosAv = `<h3 style="margin:14px 0 6px">ℹ️ Datos</h3>
    <div class="box"><div class="kv"><span>Precios</span><span>${esc(S.fecha || '—')}</span></div>
    <div class="kv"><span>Gasolineras</span><span>${S.est.length.toLocaleString('es-ES')}</span></div>
    <div class="kv"><span>Recarga</span><span>${esc(S.ptsFuente || 'sin cargar')}</span></div>
    <div class="muted" style="margin-top:6px">Precios oficiales del Ministerio para la Transición Ecológica (geoportal de carburantes). Puntos de recarga y mapa © colaboradores de OpenStreetMap. Las gasolineras están obligadas a comunicar sus precios, pero puede haber retrasos: confirma en el surtidor.</div></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn alt" id="directo">Actualizar directo del Ministerio</button><button class="btn alt" id="borrar">Borrar ajustes y favoritas</button></div>`;
  $('#ajustes').innerHTML = `<div class="set">
    ${instalada ? '' : `<div class="box"><h3>📲 Ponla en la pantalla de inicio</h3>${S.installEvt ? '<button class="btn" id="instalar">Instalar GasoCerca</button>' : ios ? 'En Safari toca <b>Compartir</b> (□↑) y luego <b>Añadir a pantalla de inicio</b>.' : 'En Chrome abre el menú ⋮ y toca <b>Instalar aplicación</b> o <b>Añadir a pantalla de inicio</b>.'}</div>`}
    <h2>👀 Cómo ver la app</h2>
    <div class="seg modoapp"><button data-sencillo="1" class="${c.sencillo ? 'on' : ''}">😊 Sencilla</button><button data-sencillo="0" class="${c.sencillo ? '' : 'on'}">🧰 Completa</button></div>
    <div class="muted" style="margin:6px 2px 8px">${c.sencillo ? 'Ves solo lo importante: precios cerca, cómo llegar y favoritas.' : 'Ves todos los filtros, gastos, alertas y estadísticas.'}</div>
    ${campo('letraGrande', '🔍 Letra más grande', 'check')}
    <h2>🚗 Coche de gasolina, diésel o híbrido</h2>
    ${campo('tieneComb', 'Tengo un coche de gasolina o diésel', 'check')}
    ${c.tieneComb ? `${campo('combNombre', 'Nombre (opcional)', 'text')}
    <div class="field"><label>Combustible</label><select data-set="fuel">${Object.keys(FUEL_NAMES).map((k) => `<option value="${k}" ${k === c.fuel ? 'selected' : ''}>${FUEL_NAMES[k]}</option>`).join('')}</select></div>
    ${campo('litros', 'Litros que sueles echar', 'number')}
    ${campo('consumo', 'Lo que gasta (litros cada 100 km)', 'number')}` : ''}
    <h2>⚡ Coche eléctrico</h2>
    ${campo('tieneEV', 'Tengo un coche eléctrico (o enchufable)', 'check')}
    ${c.tieneEV ? `${campo('evModelo', 'Modelo', 'text')}
    ${campo('bat', 'Batería (kWh)', 'number')}
    ${campo('evConsumo', 'Lo que gasta (kWh cada 100 km)', 'number')}
    ${campo('kwhCasa', 'Precio de la luz en casa (€/kWh)', 'number')}` : ''}
    <h2>⏱️ Tu tiempo</h2>
    ${campo('valorHora', 'Cuánto vale para ti una hora (€)', 'number')}
    <div class="muted">Sirve para no mandarte lejos por ahorrar poco. Con 0 solo se cuenta el dinero.</div>
    ${c.sencillo ? '' : tiempoAv + evAv + lcAv}
    <h2>❓ Ayuda</h2>
    <div class="box"><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn alt" id="ayuda">Preguntas frecuentes</button><button class="btn alt" id="verTour">Ver tutorial</button><button class="btn alt" id="asistente">Volver a configurar</button></div></div>
    <h2>📍 Ubicación</h2>
    <div class="box"><div class="kv"><span>Estado</span><span>${S.geoError === 1 ? '❌ Sin permiso' : S.pos?.gps ? '✅ Funciona' : S.geoError ? '⚠️ Sin señal' : '—'}</span></div>
    <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><button class="btn alt" id="geoReintentar">Probar ubicación</button><button class="btn alt" id="geoAyuda">Cómo dar permiso</button></div></div>
    <h2>💾 Copia de seguridad</h2>
    <div class="box"><div class="muted">Tus favoritas y ajustes se guardan solo en este móvil. Haz una copia para no perderlos si cambias de móvil.</div>
    <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><button class="btn alt" id="exportar">Guardar copia</button><button class="btn alt" id="importar">Recuperar copia</button></div>
    <input type="file" id="importarFich" accept="application/json,.json" hidden></div>
    ${c.sencillo ? `<details class="mas"><summary>Opciones avanzadas</summary>${tiempoAv}${evAv}${lcAv}${datosAv}</details>` : datosAv}
    <h2>🔄 Versión</h2>
    <div class="box"><div class="kv"><span>GasoCerca</span><span><b>v${APP_VERSION}</b></span></div>
    <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><button class="btn alt" id="buscarAct">Buscar actualizaciones</button><button class="btn alt" id="verNovedades">Novedades</button></div></div>
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
  const enRuta = S.cfg.vista === 'ruta' || !!t.dataset.enruta;
  if (t.dataset.est) { detalle(+t.dataset.est, enRuta); return; }
  if (t.dataset.ev) { detalleEv(t.dataset.ev, enRuta); return; }
  if (t.dataset.fav) {
    const id = +t.dataset.fav; S.favs.has(id) ? S.favs.delete(id) : S.favs.add(id); save('favs', [...S.favs]);
    if (t.dataset.lbl) t.textContent = S.favs.has(id) ? '★ En favoritas' : '☆ Guardar en favoritas';
    else { t.classList.toggle('on'); t.textContent = S.favs.has(id) ? '★' : '☆'; }
    toast(S.favs.has(id) ? 'Añadida a favoritas' : 'Quitada de favoritas'); render(); return;
  }
  if (t.dataset.favev) {
    const id = t.dataset.favev; S.favsEv.has(id) ? S.favsEv.delete(id) : S.favsEv.add(id); save('favsEv', [...S.favsEv]);
    t.classList.toggle('on'); t.textContent = S.favsEv.has(id) ? '★' : '☆'; render(); return;
  }
  if (t.dataset.radio) { c.radio = +t.dataset.radio; saveCfg(); render(); return; }
  if (t.dataset.sencillo) { c.sencillo = t.dataset.sencillo === '1'; saveCfg(); render(); toast(c.sencillo ? 'Modo sencillo' : 'Modo completo'); return; }
  if (t.dataset.apuntar) { apuntarDesde(t.dataset.apuntar, t.dataset.id); return; }
  if (t.dataset.dcoche) { document.querySelectorAll('[data-dcoche]').forEach((b) => b.classList.toggle('on', b === t)); ajustaFormCoche(t.dataset.dcoche); return; }
  if (t.dataset.borrarent) { if (confirm('¿Borrar este apunte?')) { S.diario = S.diario.filter((x) => String(x.id) !== t.dataset.borrarent); save('diario', S.diario); render(); } return; }
  if (t.dataset.alerta) {
    const v = parseFloat(String($('#alertaIn').value).replace(',', '.'));
    if (!(v > 0.3 && v < 4)) { toast('Escribe un precio en €/L, por ejemplo 1,49'); return; }
    S.alertas[t.dataset.alerta] = { f: c.fuel, p: Math.round(v * 1000) }; save('alertas', S.alertas);
    const id = +t.dataset.alerta; if (!S.favs.has(id)) { S.favs.add(id); save('favs', [...S.favs]); }
    toast('Alerta guardada (y añadida a favoritas)'); detalle(id); render(); return;
  }
  if (t.dataset.alertadel) { delete S.alertas[t.dataset.alertadel]; save('alertas', S.alertas); toast('Alerta quitada'); detalle(+t.dataset.alertadel); render(); return; }
  if (t.dataset.marca) { t.classList.toggle('on'); return; }
  if (t.dataset.tarifa) {
    const v = parseFloat(String($('#tarifaIn').value).replace(',', '.'));
    if (!(v >= 0 && v < 3)) { toast('Escribe un precio en €/kWh, por ejemplo 0,49'); return; }
    c.tarifas = { ...(c.tarifas || {}), [t.dataset.tarifa]: v }; saveCfg(); toast('Tarifa guardada'); render(); detalleEv(t.dataset.evid, enRuta); return;
  }
  if (t.dataset.tarifadel) {
    const tf = { ...(c.tarifas || {}) }; delete tf[t.dataset.tarifadel]; c.tarifas = tf; saveCfg();
    render(); if (t.dataset.evid) detalleEv(t.dataset.evid, enRuta); return;
  }
  if (t.dataset.share === 'est') {
    const e = S.est.find((x) => x.id == t.dataset.id);
    const precios = ['g95', 'dsl'].filter((f) => e.p[f]).map((f) => `${FUEL_NAMES[f]}: ${pr(e.p[f])} €`).join(' · ');
    compartir(nombreMarca(marca(e.rot)), `⛽ ${nombreMarca(marca(e.rot))} – ${titulo(e.dir)}, ${nombreLoc(e.loc)}\n${precios}`, e.lat, e.lon);
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
    case 'geoReintentar': cerrarHoja(); S.geoError = 0; localizar(); break;
    case 'geoAyuda': ayudaUbicacion(); break;
    case 'refrescar': t.classList.add('gira'); setTimeout(() => t.classList.remove('gira'), 900); if (S.pos?.gps !== false) localizar(true); datos(); comprobarVersion(); break;
    case 'updBtn': location.reload(); break;
    case 'buscarAct': comprobarVersion(true); break;
    case 'cerrarHoja': cerrarHoja(); break;
    case 'mas': S.limite += 60; render(); break;
    case 'rutaCalc': calcularRuta(); break;
    case 'rutaQuitar': S.ruta = null; save('ruta', null); renderRuta(); break;
    case 'rutaCambiar': S.rutaEditar = true; renderRuta(); break;
    case 'rutaInvertir': if (S.ruta) { const o = S.ruta.o; S.rutaO = S.ruta.d; S.rutaD = o; S.rutaEditar = true; renderRuta(); } break;
    case 'chipMarcas': hojaMarcas(); break;
    case 'chipConect': c.vista = 'ajustes'; saveCfg(); render(); setTimeout(() => $('[data-conect]')?.scrollIntoView({ block: 'center' }), 50); break;
    case 'okMarcas': c.marcas = [...document.querySelectorAll('[data-marca].on')].map((b) => b.dataset.marca); saveCfg(); cerrarHoja(); render(); break;
    case 'limpiarMarcas': c.marcas = []; saveCfg(); cerrarHoja(); render(); break;
    case 'guardarLc': c.lowcostList = $('#lowcostTxt').value.split('\n').map((s) => s.trim()).filter(Boolean); saveCfg(); toast('Lista guardada'); break;
    case 'resetLc': c.lowcostList = LOWCOST_DEF; saveCfg(); render(); break;
    case 'directo': datos(true); break;
    case 'verNovedades': mostrarNovedades(APP_VERSION); break;
    case 'verTour': tour.iniciar(); break;
    case 'instalar': S.installEvt?.prompt(); S.installEvt = null; break;
    case 'exportar': exportarCopia(); break;
    case 'importar': $('#importarFich').click(); break;
    case 'nuevoRep': formDiario({ c: 'h', comb: c.fuel }); break;
    case 'asistente': asistente.iniciar(); break;
    case 'ayuda': case 'ayudaBtn': ayuda(); break;
    case 'nuevaCarga': formDiario({ c: 'e', lugar: 'Casa', pu: c.kwhCasa }); break;
    case 'guardarDiario': guardarDiario(); break;
    case 'usarConsumo': c[t.dataset.campo] = +t.dataset.valor; saveCfg(); toast('Consumo actualizado'); render(); break;
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
  else {
    if ((k === 'tieneEV' || k === 'tieneComb') && !c.tieneEV && !c.tieneComb) { c[k] = true; saveCfg(); toast('Necesitas al menos un coche'); render(); return; }
    toast('Guardado');
    if (k === 'fuel') renderChips();
    if (k === 'tieneEV' || k === 'tieneComb' || k === 'letraGrande') render();
  }
});
const acCab = autocompletar($('#q'), $('#sug'), irALugar);
$('#buscar').addEventListener('submit', (ev) => { ev.preventDefault(); acCab.elegirPrimero(); });
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
  if (document.visibilityState !== 'visible') { seguirRuta(false); return; }
  if (S.cfg.vista === 'ruta') seguirRuta(true);
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
if ('serviceWorker' in navigator && isSecureContext) {
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
    // el tutorial tiene prioridad: quien no lo ha visto lo ve una vez (también al actualizar)
    if ((anterior || localStorage.getItem('gc.cfg')) && load('tourVisto', false)) setTimeout(() => mostrarNovedades(APP_VERSION), 1200);
    if (anterior && anterior < '1.3.0' && S.cfg.orden === 'precio') { S.cfg.orden = 'total'; saveCfg(); }
    save('version', APP_VERSION);
  }
})();
// ---------------------------------------------------------------- Tutorial
const tour = (() => {
  // sel: elemento a iluminar (null = mensaje centrado). antes: prepara la pantalla.
  const PASOS = [
    { sel: null, t: '👋 ¡Bienvenido a GasoCerca!', x: () => (S.cfg.sencillo ? 'Te enseño lo básico en 30 segundos. Es muy fácil: <b>abres la app y ves lo que tienes cerca y a qué precio</b>.' : 'Te enseño en un minuto dónde está cada cosa. Puedes saltarlo y repetirlo cuando quieras desde <b>Ajustes</b>.') },
    { sel: '#ayudaBtn', t: '❓ Ayuda', x: 'Si tienes cualquier duda, toca este botón: ahí están las preguntas más habituales explicadas fácil.' },
    { sel: '.seg', t: '⛽ Combustible o ⚡ Recarga', x: () => (S.cfg.tieneEV ? 'Cambia entre las <b>gasolineras</b> y los <b>puntos de recarga</b> para tu eléctrico. Toda la app se adapta al modo elegido.' : 'Aquí verás las <b>gasolineras</b>. Si algún día tienes un eléctrico, actívalo en Ajustes y aparecerá el modo <b>⚡ Recarga</b>.') },
    { sel: '#btnLoc', t: '📍 Tu ubicación', x: 'La app usa tu GPS al abrirse. Toca aquí para volver a localizarte si te has movido.' },
    { sel: '#buscar', t: '🔎 Buscar otro sitio', x: 'Escribe un <b>pueblo</b> o un <b>código postal</b> para ver los precios de otra zona, por ejemplo antes de un viaje.' },
    { sel: '#refrescar', t: '↻ Actualizar', x: 'Recarga tu ubicación y los últimos precios. Los precios oficiales se actualizan cada 30 minutos.' },
    { sel: 'select[data-cfg=fuel]', up: '.chip', t: '⛽ Combustible', x: 'Elige qué combustible quieres comparar: gasolina 95, 98, diésel, GLP… Las tarjetas se ordenan y colorean según este precio.' },
    { sel: 'select[data-cfg=radio]', up: '.chip', t: '📏 Distancia', x: 'Hasta cuántos kilómetros buscar: desde 1 km hasta 50 km.' },
    { sel: 'select[data-cfg=orden]', up: '.chip', t: '↕️ Orden', x: '<b>Lo que más compensa</b> suma el depósito, el combustible para ir y volver y <b>tu tiempo</b>. Así no te manda lejos por ahorrar un euro. También puedes ordenar por <b>más barata</b> o <b>más cerca</b>.' },
    { sel: '[data-tog=lowcost]', t: '💰 Filtros rápidos', x: '<b>Low cost</b> muestra solo las marcas baratas, <b>Abiertas</b> quita las cerradas ahora mismo y <b>Marcas</b> te deja elegir las tuyas. Desliza la fila hacia la izquierda para verlos todos.' },
    { sel: '#banner .banner', t: '⭐ La mejor opción', x: 'Aquí te digo cuál te conviene más y cuánto ahorras frente a la gasolinera más cercana, contando el desplazamiento.' },
    { sel: '#lista .card', t: '🏷️ Cada gasolinera', x: () => S.cfg.sencillo ? 'El precio sale en <b style="color:var(--ok)">verde</b> si es barato, <b style="color:var(--mid)">ámbar</b> si es normal y <b style="color:var(--bad)">rojo</b> si es caro.<br><br>Toca <b>🧭 Ir</b> y el móvil te lleva hasta allí. Toca la tarjeta para ver más y guardarla en ★ favoritas.' : 'El precio sale en <b style="color:var(--ok)">verde</b> si es barato, en <b style="color:var(--mid)">ámbar</b> si es normal y en <b style="color:var(--bad)">rojo</b> si es caro. <b>▼▲</b> indica si ha bajado o subido desde ayer.<br><br><b>Tócala</b> para ver todos los precios, ir con Google Maps o Waze, guardarla en ★ favoritas, compartirla o usar la calculadora.' },
    { sel: '.bottom [data-v=ruta]', t: '🛣️ Ruta', x: '¿Te vas de viaje? Dime adónde vas y te enseño las gasolineras o cargadores <b>de camino</b>, con los minutos de desvío y a qué hora pasas por cada una.' },
    { sel: '.bottom [data-v=mapa]', t: '🗺️ Mapa', x: 'Todas las gasolineras con su precio sobre el mapa. Toca una etiqueta para ver los detalles.' },
    { sel: '.bottom [data-v=favs]', t: '★ Favoritas', x: 'Las gasolineras y cargadores que guardes, con su precio actual, estés donde estés.' },
    { sel: '.bottom [data-v=tend]', t: '📊 Gastos', x: 'Apunta tus repostajes y recargas (con «He repostado aquí» en cada ficha) y verás <b>cuánto gastas al mes</b>, cuánto <b>ahorras</b> y el <b>consumo real</b> de cada coche. También cómo evolucionan los precios.' },
    { sel: '.bottom [data-v=ajustes]', t: '⚙️ Ajustes', x: 'Pon los datos de tus coches (litros, consumo, batería, conectores…), edita la lista de marcas low cost y busca actualizaciones.' },
    { sel: null, t: '🚀 ¡Listo!', x: 'Consejo: <b>añádela a la pantalla de inicio</b> para abrirla como una app más.<br>• iPhone: <b>Compartir → Añadir a pantalla de inicio</b>.<br>• Android: menú <b>⋮ → Instalar aplicación</b>.<br><br>Puedes repetir este tutorial en <b>Ajustes → Ver tutorial</b>.' },
  ];
  let i = 0, capa, foco, caja;

  function crear() {
    capa = document.createElement('div'); capa.className = 'tour';
    capa.innerHTML = '<div class="tour-foco"></div><div class="tour-caja" role="dialog" aria-live="polite"></div>';
    document.body.appendChild(capa);
    foco = capa.querySelector('.tour-foco'); caja = capa.querySelector('.tour-caja');
    capa.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.t === 'sig') ir(i + 1);
      if (b.dataset.t === 'ant') ir(i - 1);
      if (b.dataset.t === 'fin') cerrar();
    });
    window.addEventListener('resize', () => capa && pintar());
  }
  function objetivo(p) {
    if (!p.sel) return null;
    let el = document.querySelector(p.sel);
    if (el && p.up) el = el.closest(p.up) || el;
    if (!el || !el.offsetParent) return null;
    return el;
  }
  function ir(n) {
    if (n >= PASOS.length) return cerrar();
    i = Math.max(0, n);
    const el = objetivo(PASOS[i]);
    // si el elemento no existe (por ejemplo, aún sin ubicación) se salta, salvo los mensajes centrados
    if (PASOS[i].sel && !el) return ir(n >= i ? i + 1 : i - 1);
    if (el) el.scrollIntoView({ block: 'nearest', inline: 'center' });
    setTimeout(pintar, el ? 250 : 0);
  }
  function pintar() {
    const p = PASOS[i], el = objetivo(p);
    const ultimo = i === PASOS.length - 1;
    caja.innerHTML = `<div class="tour-t">${p.t}</div><div class="tour-x">${typeof p.x === 'function' ? p.x() : p.x}</div>
      <div class="tour-pie"><span class="tour-n">${i + 1} / ${PASOS.length}</span>
      ${ultimo ? '' : '<button data-t="fin" class="tour-saltar">Saltar</button>'}
      ${i > 0 ? '<button data-t="ant" class="btn alt">‹</button>' : ''}
      <button data-t="sig" class="btn">${ultimo ? '¡Empezar!' : i === 0 ? 'Empezar' : 'Siguiente ›'}</button></div>`;
    const W = innerWidth, H = innerHeight;
    if (!el) {
      foco.style.cssText = `left:${W / 2}px;top:${H / 2}px;width:0;height:0`;
      caja.style.cssText = `left:50%;top:50%;transform:translate(-50%,-50%)`;
      return;
    }
    const r = el.getBoundingClientRect(), m = 6;
    foco.style.cssText = `left:${r.left - m}px;top:${r.top - m}px;width:${r.width + m * 2}px;height:${r.height + m * 2}px`;
    const cw = Math.min(380, W - 24), ch = caja.offsetHeight;
    const left = Math.min(Math.max(12, r.left + r.width / 2 - cw / 2), W - cw - 12);
    const abajo = r.top + r.height / 2 < H / 2;
    const top = abajo ? Math.min(r.bottom + 16, H - ch - 12) : Math.max(12, r.top - ch - 16);
    caja.style.cssText = `left:${left}px;top:${top}px;width:${cw}px`;
  }
  function cerrar() {
    capa?.remove(); capa = null;
    $('#chips').scrollTo({ left: 0, behavior: 'smooth' });
    save('tourVisto', true);
  }
  function iniciar() {
    cerrarHoja();
    // el tutorial se hace sobre la lista de gasolineras
    S.cfg.modo = S.cfg.tieneComb ? 'fuel' : 'ev'; S.cfg.vista = 'lista'; saveCfg(); render();
    $('#v-lista').scrollTop = 0;
    if (!capa) crear();
    ir(0);
  }
  return { iniciar };
})();
if (!load('tourVisto', false) && S.cfg.setupHecho) setTimeout(() => { if (!$('#sheet').classList.contains('on')) tour.iniciar(); }, 1500);

// ---------------------------------------------------------------- Modo ruta
// Calcula la ruta con OSRM (OpenStreetMap) y busca gasolineras/cargadores a poca distancia del trazado.
S.ruta = load('ruta', null);
const VEL_DESVIO = 40; // km/h al salir de la carretera para repostar
const desvioMin = (perp) => (perp < 0.05 ? 0.5 : 1 + ((2 * perp * RUTA) / VEL_DESVIO) * 60);
function proyector(lat0) {
  const kx = 111.32 * Math.cos((lat0 * Math.PI) / 180), ky = 110.574;
  return (lat, lon) => [lon * kx, lat * ky];
}
function prepararRuta(coords, o, d, durS, distM) {
  // coords: [[lon, lat], ...] -> puntos cada ~250 m con km acumulado
  const P = proyector(coords[0][1]);
  const pts = [];
  let acc = 0, prev = null;
  coords.forEach(([lon, lat], i) => {
    const xy = P(lat, lon);
    if (prev) {
      const dd = Math.hypot(xy[0] - prev[0], xy[1] - prev[1]);
      if (dd < 0.25 && i < coords.length - 1) return;
      acc += dd;
    }
    pts.push([+lat.toFixed(5), +lon.toFixed(5), +acc.toFixed(3)]);
    prev = xy;
  });
  const f = distM / 1000 / (acc || 1); // corrige a la distancia real de la ruta
  pts.forEach((p) => (p[2] = +(p[2] * f).toFixed(3)));
  return { o, d, pts, km: distM / 1000, min: durS / 60, creada: Date.now() };
}
function proyectarEnRuta(ruta, lat, lon) {
  // distancia mínima al trazado (km), km de la ruta en ese punto y lado (izq/der)
  const P = proyector(ruta.pts[0][0]);
  const [px, py] = P(lat, lon);
  let best = { perp: 1e9, along: 0, lado: 0 };
  for (let i = 1; i < ruta.pts.length; i++) {
    const a = ruta.pts[i - 1], b = ruta.pts[i];
    const [ax, ay] = P(a[0], a[1]), [bx, by] = P(b[0], b[1]);
    const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1e-9;
    let t = ((px - ax) * dx + (py - ay) * dy) / L2;
    t = Math.max(0, Math.min(1, t));
    const qx = ax + t * dx, qy = ay + t * dy;
    const dd = Math.hypot(px - qx, py - qy);
    if (dd < best.perp) best = { perp: dd, along: a[2] + t * (b[2] - a[2]), lado: Math.sign(dx * (py - ay) - dy * (px - ax)) };
  }
  return best;
}
function cajaRuta(ruta, margen) {
  let a = 90, b = -90, c = 180, d = -180;
  for (const p of ruta.pts) { a = Math.min(a, p[0]); b = Math.max(b, p[0]); c = Math.min(c, p[1]); d = Math.max(d, p[1]); }
  const mlat = margen / 110.574, mlon = margen / (111.32 * Math.cos((((a + b) / 2) * Math.PI) / 180));
  return [a - mlat, b + mlat, c - mlon, d + mlon];
}
function progresoEnRuta() {
  // si vas por la ruta, en qué km estás (para ocultar lo que ya has pasado)
  if (!S.ruta || !S.pos?.gps) return 0;
  const p = proyectarEnRuta(S.ruta, S.pos.lat, S.pos.lon);
  return p.perp < 2 ? p.along : 0;
}
function resultadosRuta() {
  const r = S.ruta, c = S.cfg;
  if (!r) return [];
  const maxPerp = Math.max(0.1, ((c.rutaDesvio - 1) * VEL_DESVIO) / 60 / (2 * RUTA));
  const [la1, la2, lo1, lo2] = cajaRuta(r, maxPerp + 0.2);
  const desde = progresoEnRuta();
  const hasta = c.rutaKm ? desde + c.rutaKm : Infinity;
  const ev = c.modo === 'ev';
  const out = [];
  const fuente = ev ? (S.pts || []).map((p) => ({ lat: p[0], lon: p[1], p })) : S.est.filter((e) => e.p[c.fuel]).map((e) => ({ lat: e.lat, lon: e.lon, e }));
  for (const x of fuente) {
    if (x.lat < la1 || x.lat > la2 || x.lon < lo1 || x.lon > lo2) continue;
    const pr_ = proyectarEnRuta(r, x.lat, x.lon);
    if (pr_.perp > maxPerp || pr_.along < desde - 0.3 || pr_.along > hasta) continue;
    const dm = desvioMin(pr_.perp);
    if (dm > c.rutaDesvio) continue;
    const eta = new Date(Date.now() + ((pr_.along - desde) / r.km) * r.min * 60000);
    const base = { perp: pr_.perp, along: pr_.along, kmFalta: pr_.along - desde, desvio: dm, lado: pr_.lado, eta };
    if (ev) {
      const p = x.p, sk = p[4];
      const compat = sk.filter((s) => c.conectores.includes(s[0]));
      if (sk.length && !compat.length) continue;
      if (!sk.length && !c.sinDatos) continue;
      const kwMax = compat.length ? Math.max(...compat.map((s) => s[2])) : p[5];
      if (c.potMin && !(kwMax >= c.potMin)) continue;
      if (c.gratis && p[6] !== 0) continue;
      const pt = { lat: p[0], lon: p[1], name: p[2], op: p[3], sk, compat, kw: kwMax, fee: p[6], hor: p[7], cap: p[8], id: p[9], osm: p[10] ?? null, d: 0, ...base };
      pt.carga = tiempoCarga(pt);
      if (!pt.carga) continue;
      // en viaje esperas mientras carga: el tiempo de carga cuenta entero
      pt.total = pt.carga.coste + (dm / 60) * c.valorHora + pt.carga.h * c.valorHora;
      out.push(pt);
    } else {
      const e = { ...x.e, d: 0, precio: x.e.p[c.fuel], ...base };
      if (c.abiertas && horarioHoy(e.hor, eta) === false) continue;
      if (c.lowcost && !esLowcost(e)) continue;
      if (c.marcas.length && !c.marcas.includes(marca(e.rot))) continue;
      const pl = e.precio / 1000;
      const llenar = pl * c.litros, extra = ((2 * e.perp * RUTA * c.consumo) / 100) * pl, tiempo = (dm / 60) * c.valorHora;
      e.total = { llenar, viaje: extra, tiempo, dinero: llenar + extra, total: llenar + extra + tiempo };
      out.push(e);
    }
  }
  const ord = {
    total: (a, b) => (ev ? a.total - b.total : a.total.total - b.total.total),
    km: (a, b) => a.along - b.along,
    precio: (a, b) => (ev ? a.carga.precio - b.carga.precio : a.precio - b.precio) || a.along - b.along,
  };
  out.sort(ord[c.rutaOrden] || ord.total);
  S.rutaRes = out;
  return out;
}
async function calcularRuta() {
  const o = S.rutaO || (S.pos ? { lat: S.pos.lat, lon: S.pos.lon, nombre: S.pos.gps ? 'Mi ubicación' : S.pos.txt } : null);
  const d = S.rutaD;
  if (!o) { toast('Necesito saber desde dónde sales: activa la ubicación o escribe el origen'); return; }
  if (!d) { toast('Escribe adónde vas y elige una opción de la lista'); $('#rutaDest')?.focus(); return; }
  const btn = $('#rutaCalc'); if (btn) { btn.disabled = true; btn.textContent = 'Calculando ruta…'; }
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${o.lon},${o.lat};${d.lon},${d.lat}?overview=full&geometries=geojson`;
    const r = await fetch(url);
    const j = await r.json();
    if (j.code !== 'Ok' || !j.routes?.length) throw new Error(j.message || 'sin ruta');
    const rt = j.routes[0];
    S.ruta = prepararRuta(rt.geometry.coordinates, o, d, rt.duration, rt.distance);
    save('ruta', S.ruta);
    S.rutaEditar = false; S.rutaO = null; S.rutaD = null;
    if (S.cfg.modo === 'ev' && !S.pts) await cargadores();
  } catch (e) {
    toast('No se pudo calcular la ruta. Comprueba la conexión e inténtalo de nuevo.');
  }
  renderRuta();
}
function bloqueRuta(id) {
  const r = (S.rutaRes || []).find((x) => String(x.id) === String(id));
  if (!S.ruta || !r) return '';
  const o = S.ruta.o, d = S.ruta.d;
  const desde = S.pos?.gps ? `${S.pos.lat},${S.pos.lon}` : `${o.lat},${o.lon}`;
  return `<div class="box"><h3>🛣️ En tu ruta a ${esc(d.nombre)}</h3>
    <div class="kv"><span>Está en el km</span><span>${Math.round(r.along)} (${km(r.kmFalta)} desde aquí)</span></div>
    <div class="kv"><span>Desvío</span><span>${r.perp < 0.05 ? 'en la misma carretera' : '≈ ' + minTxt(r.desvio)}</span></div>
    <div class="kv"><span>Llegarías sobre las</span><span>${r.eta.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span></div>
    ${ladoTxt(r) ? `<div class="muted" style="margin-top:4px">${ladoTxt(r)}</div>` : ''}
    <div class="navs" style="grid-template-columns:1fr;margin:10px 0 0"><a href="https://www.google.com/maps/dir/?api=1&origin=${desde}&destination=${d.lat},${d.lon}&waypoints=${r.lat},${r.lon}&travelmode=driving" target="_blank" rel="noopener">🧭 Ir a ${esc(d.nombre)} parando aquí (Google Maps)</a></div></div>`;
}
const ladoTxt = (r) => (r.perp < 0.25 && r.lado > 0 ? '⚠️ Queda a tu izquierda: si es una autovía, puede estar en el sentido contrario.' : r.perp < 0.25 && r.lado < 0 ? '➡️ Queda a tu derecha, en tu sentido de la marcha.' : '');
function tarjetaRuta(x, cortes) {
  const ev = S.cfg.modo === 'ev';
  const hora = x.eta.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const tags = [`<span class="tag">km <b>${Math.round(x.along)}</b> · ${hora}</span>`,
    `<span class="tag ${x.desvio <= 2 ? 'lc' : ''}">${x.perp < 0.05 ? 'En la carretera' : 'Desvío ' + minTxt(x.desvio)}</span>`];
  if (x.perp < 0.25 && x.lado > 0) tags.push('<span class="tag cl">↔ ¿sentido contrario?</span>');
  if (ev) {
    const t = x.carga;
    tags.push(`<span class="tag">${t.precio === 0 ? 'Gratis' : (t.fuente.startsWith('estimado') ? '~' : '') + t.precio.toLocaleString('es-ES', { minimumFractionDigits: 2 }) + ' €/kWh'}</span><span class="tag">10→80 % <b>${durTxt(t.h)}</b></span>`);
    return `<div class="card" data-ev="${x.id}"><div class="nm"><span class="t">${esc(x.name || x.op || 'Punto de recarga')}</span></div>
      <div class="big"><span class="price ${x.kw >= 50 ? 'p-ok' : x.kw >= 22 ? 'p-mid' : ''}">${x.kw || '?'}<small> kW</small></span><span class="lbl">${esc(x.op && x.name ? x.op : '')}</span></div>
      <div class="sub">${km(x.kmFalta)} por delante</div><div class="row2">${tags.join('')}</div></div>`;
  }
  if (esLowcost(x)) tags.push('<span class="tag lc">Low cost</span>');
  if (horarioHoy(x.hor, x.eta) === false) tags.push('<span class="tag cl">Cerrada a esa hora</span>');
  return `<div class="card" data-est="${x.id}"><div class="nm">${S.favs.has(x.id) ? '<span class="star">★</span>' : ''}<span class="t">${esc(nombreMarca(marca(x.rot)) === 'Sin marca' ? titulo(x.rot) : nombreMarca(marca(x.rot)))}</span></div>
    <div class="big"><span class="price ${claseP(x.precio, cortes)}">${pr(x.precio)}<small> €</small></span><span class="lbl">${FUEL_SHORT[S.cfg.fuel]}</span></div>
    <div class="sub">${esc(nombreLoc(x.loc))} · ${km(x.kmFalta)} por delante</div><div class="row2">${tags.join('')}</div></div>`;
}
let mapaR, capaR;
// Mientras la Ruta está abierta, seguir el GPS para ir quitando lo que ya has pasado
let rutaWatch = null, rutaUlt = null;
function seguirRuta(activar) {
  if (!navigator.geolocation) return;
  if (activar && rutaWatch == null && S.ruta && S.pos?.gps !== false) {
    rutaWatch = navigator.geolocation.watchPosition((p) => {
      const n = { lat: p.coords.latitude, lon: p.coords.longitude, gps: true, prec: p.coords.accuracy };
      // repintar solo si te has movido más de 300 m (ahorra batería y evita parpadeos)
      if (rutaUlt && dist(rutaUlt.lat, rutaUlt.lon, n.lat, n.lon) < 0.3) return;
      rutaUlt = n; S.pos = { ...S.pos, ...n, prov: null }; S.geoError = 0;
      $('#locTxt').textContent = textoPos();
      if (S.cfg.vista === 'ruta' && !$('#sheet').classList.contains('on')) renderRuta(true);
    }, () => {}, { enableHighAccuracy: true, maximumAge: 15000, timeout: 30000 });
  } else if (!activar && rutaWatch != null) {
    navigator.geolocation.clearWatch(rutaWatch); rutaWatch = null; rutaUlt = null;
  }
}
function renderRuta(soloLista = false) {
  const el = $('#ruta'), c = S.cfg;
  seguirRuta(!!S.ruta && !S.rutaEditar);
  const ev = c.modo === 'ev';
  if (!S.ruta || S.rutaEditar) {
    const o = S.rutaO || (S.ruta && S.rutaEditar && S.ruta.o.nombre !== 'Mi ubicación' ? S.ruta.o : null);
    const d = S.rutaD || (S.ruta && S.rutaEditar ? S.ruta.d : null);
    S.rutaO = o; S.rutaD = d;
    el.innerHTML = `<div class="rform">
      <h2>🛣️ ¿Adónde vas?</h2>
      <p class="muted">Te enseño ${ev ? 'los cargadores' : 'las gasolineras'} de camino, sin que tengas que desviarte mucho.</p>
      <label>Desde</label>
      <div class="acw"><input id="rutaOrig" type="search" placeholder="Mi ubicación" value="${esc(o?.nombre && o.nombre !== 'Mi ubicación' ? o.nombre : '')}" autocomplete="off" enterkeyhint="next"><div id="sugO" class="sug"></div></div>
      <label>Hasta</label>
      <div class="acw"><input id="rutaDest" type="search" placeholder="Ciudad, pueblo, dirección o CP" value="${esc(d?.nombre || '')}" autocomplete="off" enterkeyhint="go"><div id="sugD" class="sug"></div></div>
      <div class="rgrid">
        <div><label>Desvío máximo</label><select data-cfg="rutaDesvio">${[2, 5, 10, 15].map((n) => `<option value="${n}" ${n == c.rutaDesvio ? 'selected' : ''}>${n} min</option>`).join('')}</select></div>
        <div><label>Parar en los próximos</label><select data-cfg="rutaKm">${[[0, 'todo el viaje'], [50, '50 km'], [100, '100 km'], [150, '150 km'], [200, '200 km'], [300, '300 km']].map(([v, t]) => `<option value="${v}" ${v == c.rutaKm ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
      </div>
      <button class="btn" id="rutaCalc" style="width:100%;margin-top:12px">Buscar ${ev ? 'cargadores' : 'gasolineras'} en la ruta</button>
      ${S.ruta ? '<button class="btn alt" id="rutaQuitar" style="width:100%;margin-top:8px">Borrar la ruta</button>' : ''}
      <p class="muted" style="margin-top:10px">Ruta calculada con OpenStreetMap (OSRM). Se tiene en cuenta ${ev ? 'tu coche, los conectores y la potencia de los filtros' : 'el combustible y los filtros de arriba'}.</p></div>`;
    autocompletar($('#rutaOrig'), $('#sugO'), (r) => { S.rutaO = r.gps ? null : { lat: r.lat, lon: r.lon, nombre: r.txt || r.nombre }; $('#rutaOrig').value = r.gps ? '' : r.txt || r.nombre; });
    const acD = autocompletar($('#rutaDest'), $('#sugD'), (r) => { if (r.gps) return; S.rutaD = { lat: r.lat, lon: r.lon, nombre: r.txt || r.nombre }; $('#rutaDest').value = S.rutaD.nombre; }, { gps: false });
    $('#rutaDest').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); acD.elegirPrimero(); } });
    $('#rutaDest').addEventListener('input', () => (S.rutaD = null));
    $('#rutaOrig').addEventListener('input', () => (S.rutaO = null));
    return;
  }
  if (ev && !S.pts) { el.innerHTML = '<div class="empty"><b>Cargando puntos de recarga…</b></div>'; cargadores(); return; } // cargadores() vuelve a pintar al terminar
  const r = S.ruta;
  const res = resultadosRuta();
  const hh = Math.floor(r.min / 60), mm = Math.round(r.min % 60);
  const resumenTxt = `${Math.round(r.km)} km · ${hh ? hh + ' h ' : ''}${mm} min${progresoEnRuta() > 1 ? ` · llevas ${Math.round(progresoEnRuta())} km` : ''}`;
  const cab = `<div class="rsum"><div><b>${esc(r.o.nombre)} → ${esc(r.d.nombre)}</b><small id="rutaResumen">${resumenTxt}</small></div>
    <button class="btn alt" id="rutaCambiar">Cambiar</button></div>
    <div id="mapaRuta"></div>`;
  let h = `<div class="chips rchips">
      ${c.sencillo ? '' : chipSel('rutaOrden', '', c.rutaOrden, [['total', 'Lo que más compensa'], ['km', 'En orden de paso'], ['precio', 'Más barata']])}
      ${c.sencillo ? '' : chipSel('rutaDesvio', 'Desvío ≤ ', c.rutaDesvio, [2, 5, 10, 15].map((n) => [n, n + ' min']))}
      ${chipSel('rutaKm', 'Parar en ', c.rutaKm, [[0, 'todo el viaje'], [50, '50 km'], [100, '100 km'], [150, '150 km'], [200, '200 km'], [300, '300 km']])}
    </div>`;
  if (!res.length) h += `<div class="empty"><b>No hay ${ev ? 'cargadores' : 'gasolineras'} con estos filtros</b>Prueba a permitir más minutos de desvío o a quitar filtros.</div>`;
  else {
    const mejor = [...res].sort((a, b) => (ev ? a.total - b.total : a.total.total - b.total.total))[0];
    if (ev) h += `<div class="banner"><b>Te compensa: ${esc(mejor.name || mejor.op || 'Punto de recarga')}</b> en el km ${Math.round(mejor.along)}<small>${mejor.kw ? mejor.kw + ' kW · ' : ''}10→80 % en ${durTxt(mejor.carga.h)} · desvío ${minTxt(mejor.desvio)} · llegas sobre las ${mejor.eta.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} <button data-ev="${mejor.id}">Ver</button></small></div>`;
    else {
      const media = res.reduce((a, x) => a + x.precio, 0) / res.length;
      const ahorro = ((media - mejor.precio) / 1000) * c.litros;
      h += `<div class="banner"><b>Te compensa: ${esc(nombreMarca(marca(mejor.rot)))} en el km ${Math.round(mejor.along)}</b> · ${pr(mejor.precio)} €/L<small>Desvío ${mejor.perp < 0.05 ? 'nulo' : minTxt(mejor.desvio)} · llegas sobre las ${mejor.eta.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}${ahorro > 0.3 ? ` · ${eur(ahorro)} menos que la media de la ruta llenando ${c.litros} L` : ''} <button data-est="${mejor.id}">Ver</button></small><small>${res.length} ${res.length === 1 ? 'gasolinera' : 'gasolineras'} a ≤ ${c.rutaDesvio} min de desvío</small></div>`;
    }
    const cortes = ev ? null : cortesDe(res);
    h += '<div class="lista" style="padding:8px 0">' + res.slice(0, S.limite).map((x) => tarjetaRuta(x, cortes)).join('') + '</div>';
    if (res.length > S.limite) h += `<button class="more" id="mas">Ver más (${res.length - S.limite})</button>`;
  }
  // con el GPS en marcha solo se actualiza la lista: el mapa conserva tu zoom
  const parcial = soloLista && mapaR && $('#mapaRuta') && $('#rutaCuerpo');
  if (parcial) { $('#rutaCuerpo').innerHTML = h; $('#rutaResumen').textContent = resumenTxt; }
  else el.innerHTML = cab + `<div id="rutaCuerpo">${h}</div>`;
  // mapa de la ruta
  if (!parcial) {
    if (mapaR) { mapaR.remove(); mapaR = null; }
    mapaR = L.map('mapaRuta', { zoomControl: false, attributionControl: true });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(mapaR);
    const linea = L.polyline(r.pts.map((p) => [p[0], p[1]]), { color: ev ? '#2563eb' : '#0f766e', weight: 5, opacity: 0.8 }).addTo(mapaR);
    capaR = L.layerGroup().addTo(mapaR);
    setTimeout(() => { mapaR.invalidateSize(); mapaR.fitBounds(linea.getBounds(), { padding: [16, 16] }); }, 30);
  }
  capaR.clearLayers();
  const cortes = ev ? null : cortesDe(res);
  // solo las mejores en el mapa para que se lea bien
  for (const x of res.slice(0, 25)) {
    const html = ev ? `<div class="pin ev">⚡${x.kw || ''}</div>` : `<div class="pin ${claseP(x.precio, cortes)}">${pr(x.precio)}</div>`;
    L.marker([x.lat, x.lon], { icon: L.divIcon({ className: '', html, iconSize: [0, 0] }) }).on('click', () => (ev ? detalleEv(x.id, true) : detalle(x.id, true))).addTo(capaR);
  }
  L.marker([r.d.lat, r.d.lon], { icon: L.divIcon({ className: '', html: '<div class="pin">🏁</div>', iconSize: [0, 0] }) }).addTo(capaR);
  if (S.pos) L.marker([S.pos.lat, S.pos.lon], { icon: L.divIcon({ className: '', html: '<div class="me"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }), zIndexOffset: 1000 }).addTo(capaR);
}

// ---------------------------------------------------------------- Diario de repostajes y recargas
const hoyISO = () => fechaHoy();
const num2 = (v) => parseFloat(String(v ?? '').replace(',', '.'));
const fmtN = (n, d = 2) => (Number.isFinite(n) ? n.toLocaleString('es-ES', { maximumFractionDigits: d }) : '');
function apuntarDesde(tipo, id) {
  const c = S.cfg;
  if (tipo === 'est') {
    const e = S.est.find((x) => x.id == id);
    if (!e) return;
    const f = e.p[c.fuel] ? c.fuel : Object.keys(e.p)[0];
    // media de la zona ese día para calcular el ahorro
    const zona = S.est.filter((x) => x.p[f] && dist(e.lat, e.lon, x.lat, x.lon) <= 5);
    const media = zona.length ? zona.reduce((a, x) => a + x.p[f], 0) / zona.length / 1000 : null;
    formDiario({ c: 'h', lugar: nombreMarca(marca(e.rot)) + ' · ' + nombreLoc(e.loc), estId: e.id, comb: f, pu: e.p[f] / 1000, cant: c.litros, media });
  } else {
    const p = (S.pts || []).find((x) => x[9] === id);
    if (!p) return;
    const pt = { lat: p[0], lon: p[1], name: p[2], op: p[3], sk: p[4], kw: p[5], fee: p[6], id: p[9], osm: p[10] ?? null, d: 0 };
    pt.compat = pt.sk.filter((s) => c.conectores.includes(s[0]));
    if (!pt.sk.length) pt.compat = [['t2', 1, 0]];
    const t = tiempoCarga(pt);
    formDiario({ c: 'e', lugar: pt.name || pt.op || 'Punto de recarga', estId: id, pu: t ? t.precio : c.kwhDC, cant: Math.round(0.7 * c.bat * 10) / 10 });
  }
}
function formDiario(d) {
  S.formD = { ...d };
  abrirHoja(`<h2>📒 Apuntar ${d.c === 'e' ? 'recarga' : 'repostaje'}</h2>
    <div class="rform dform">
      <div class="seg dseg"><button type="button" data-dcoche="h" class="${d.c !== 'e' ? 'on' : ''}" ${S.cfg.tieneComb ? '' : 'hidden'}>🚗 ${esc(nombreComb())}</button><button type="button" data-dcoche="e" class="${d.c === 'e' ? 'on' : ''}" ${S.cfg.tieneEV ? '' : 'hidden'}>⚡ ${esc(nombreEV())}</button></div>
      <label>Dónde</label><input id="dLugar" type="text" value="${esc(d.lugar || '')}" placeholder="${d.c === 'e' ? 'Casa, Zunder…' : 'Gasolinera'}">
      <div class="rgrid">
        <div><label>Fecha</label><input id="dFecha" type="date" value="${hoyISO()}" max="${hoyISO()}"></div>
        <div><label id="dCantL">${d.c === 'e' ? 'kWh' : 'Litros'}</label><input id="dCant" type="text" inputmode="decimal" value="${fmtN(d.cant, 2)}"></div>
        <div><label id="dPuL">${d.c === 'e' ? '€/kWh' : '€/litro'}</label><input id="dPu" type="text" inputmode="decimal" value="${fmtN(d.pu, 3)}"></div>
        <div><label>Total €</label><input id="dTot" type="text" inputmode="decimal" value="${d.cant && d.pu != null ? fmtN(d.cant * d.pu, 2) : ''}"></div>
      </div>
      <label>Cuentakilómetros (opcional, para el consumo real)</label><input id="dKm" type="text" inputmode="numeric" placeholder="Ej.: 48250">
      <label class="chk"><input id="dLleno" type="checkbox" checked> <span id="dLlenoL">${d.c === 'e' ? 'He cargado hasta el nivel habitual' : 'He llenado el depósito'}</span></label>
      <button class="btn" id="guardarDiario" style="width:100%;margin-top:12px">Guardar</button>
      <p class="muted" style="margin-top:8px">Si escribes el total, se calculan los litros. Con el cuentakilómetros y el depósito lleno, la app calcula tu consumo real.</p>
    </div>`);
  const cant = $('#dCant'), pu = $('#dPu'), tot = $('#dTot');
  const deCant = () => { const a = num2(cant.value), b = num2(pu.value); if (a > 0 && b >= 0) tot.value = fmtN(a * b, 2); };
  cant.addEventListener('input', deCant); pu.addEventListener('input', deCant);
  tot.addEventListener('input', () => { const t = num2(tot.value), b = num2(pu.value); if (t > 0 && b > 0) cant.value = fmtN(t / b, 2); });
}
function ajustaFormCoche(cc) {
  S.formD.c = cc;
  $('#dCantL').textContent = cc === 'e' ? 'kWh' : 'Litros';
  $('#dPuL').textContent = cc === 'e' ? '€/kWh' : '€/litro';
  $('#dLlenoL').textContent = cc === 'e' ? 'He cargado hasta el nivel habitual' : 'He llenado el depósito';
  S.formD.media = null; S.formD.comb = cc === 'e' ? 'kwh' : S.formD.comb || S.cfg.fuel;
}
function guardarDiario() {
  const d = S.formD || {};
  const cant = num2($('#dCant').value), pu = num2($('#dPu').value);
  let tot = num2($('#dTot').value);
  if (!(cant > 0)) { toast(d.c === 'e' ? 'Escribe los kWh' : 'Escribe los litros'); return; }
  if (!(pu >= 0)) { toast('Escribe el precio por ' + (d.c === 'e' ? 'kWh' : 'litro')); return; }
  if (!(tot >= 0)) tot = cant * pu;
  const km = parseInt(String($('#dKm').value).replace(/\D/g, ''), 10);
  const ent = {
    id: Date.now(), f: $('#dFecha').value || hoyISO(), c: d.c === 'e' ? 'e' : 'h', lugar: $('#dLugar').value.trim(),
    estId: d.estId ?? null, comb: d.c === 'e' ? 'kwh' : d.comb || S.cfg.fuel, cant, pu, tot: Math.round(tot * 100) / 100,
    km: km > 0 ? km : null, lleno: $('#dLleno').checked, media: d.c === 'e' ? null : d.media ?? null,
  };
  S.diario = [...S.diario, ent].sort((a, b) => (a.f < b.f ? -1 : a.f > b.f ? 1 : a.id - b.id));
  save('diario', S.diario);
  cerrarHoja();
  const ah = ent.media ? (ent.media - ent.pu) * ent.cant : 0;
  toast(ah > 0.2 ? `Apuntado. Has ahorrado ${eur(ah)} frente a la media de la zona` : 'Apuntado en tu diario');
  render();
}
// consumo real entre llenados completos con cuentakilómetros
function consumoReal(coche) {
  const xs = S.diario.filter((x) => x.c === coche).sort((a, b) => (a.km ?? 0) - (b.km ?? 0) || (a.f < b.f ? -1 : 1));
  let ini = null, cant = 0, euros = 0, kmT = 0, cantT = 0, eurT = 0;
  for (const x of xs) {
    if (ini && x.km) { cant += x.cant; euros += x.tot; }
    if (x.km && x.lleno) {
      if (ini && x.km > ini.km) { kmT += x.km - ini.km; cantT += cant; eurT += euros; }
      ini = x; cant = 0; euros = 0;
    }
  }
  return kmT >= 50 ? { porCien: (cantT / kmT) * 100, eurCien: (eurT / kmT) * 100, km: kmT } : null;
}
function diarioHTML() {
  const c = S.cfg;
  const D = S.diario;
  let h = `<div class="dcab"><h2 style="margin:0">📒 Mis repostajes y recargas</h2></div>
    <div class="duo" style="margin:8px 0 4px">${S.cfg.tieneComb ? '<button class="btn" id="nuevoRep">+ Repostaje</button>' : ''}${S.cfg.tieneEV ? '<button class="btn alt" id="nuevaCarga">+ Recarga</button>' : ''}</div>`;
  if (!D.length) return h + `<div class="box muted">Aún no has apuntado nada. Abre una gasolinera o un cargador y toca <b>«He repostado aquí»</b> o <b>«He cargado aquí»</b>, o usa los botones de arriba (por ejemplo, para la carga en casa). Verás aquí cuánto gastas al mes, cuánto ahorras y el consumo real de cada coche.</div>`;
  const mes = hoyISO().slice(0, 7);
  const d0 = new Date(); d0.setDate(1); d0.setMonth(d0.getMonth() - 1);
  const mesPas = `${d0.getFullYear()}-${String(d0.getMonth() + 1).padStart(2, '0')}`;
  const suma = (fn) => D.filter(fn).reduce((a, x) => a + x.tot, 0);
  const esteH = suma((x) => x.f.startsWith(mes) && x.c === 'h'), esteE = suma((x) => x.f.startsWith(mes) && x.c === 'e');
  const pasado = suma((x) => x.f.startsWith(mesPas));
  const anio = suma((x) => x.f.startsWith(mes.slice(0, 4)));
  const conMedia = D.filter((x) => x.media);
  const ahorro = conMedia.reduce((a, x) => a + (x.media - x.pu) * x.cant, 0);
  h += `<div class="stat">
    <div><b>${eur(esteH + esteE)}</b><span>Este mes · 🚗 ${eur(esteH, 0)} · ⚡ ${eur(esteE, 0)}</span></div>
    <div><b>${eur(pasado)}</b><span>Mes pasado</span></div>
    <div><b class="${ahorro >= 0 ? 'down' : 'up'}">${conMedia.length ? (ahorro >= 0 ? '' : '−') + eur(Math.abs(ahorro)) : '—'}</b><span>${conMedia.length ? (ahorro >= 0 ? 'Ahorrado' : 'Pagado de más') + ` frente a la media de la zona (${conMedia.length} ${conMedia.length === 1 ? 'repostaje' : 'repostajes'})` : 'Ahorro: apunta desde la ficha de la gasolinera'}</span></div>
    <div><b>${eur(anio)}</b><span>En ${mes.slice(0, 4)}</span></div></div>`;
  // consumo real
  const cr = [['h', 'consumo', 'L/100 km', '🚗 ' + esc(nombreComb())], ['e', 'evConsumo', 'kWh/100 km', '⚡ ' + esc(nombreEV())]].map(([k, campo, u, nom]) => {
    const r = consumoReal(k);
    if (!r) return '';
    const v = Math.round(r.porCien * 10) / 10;
    return `<div class="kv"><span>${nom}: <b>${fmtN(v, 1)} ${u}</b> · ${eur(r.eurCien)}/100 km</span>${Math.abs(v - c[campo]) >= 0.2 ? `<button class="tag" id="usarConsumo" data-campo="${campo}" data-valor="${v}">Usar en cálculos</button>` : '<span class="muted">✓ en uso</span>'}</div>`;
  }).join('');
  h += `<div class="box"><h3>⛽ Consumo real</h3>${cr || '<div class="muted">Apunta el cuentakilómetros en dos llenados completos seguidos y aquí verás el consumo real de cada coche y lo que te cuesta cada 100 km.</div>'}</div>`;
  // gráfica de los últimos 6 meses
  const meses = [];
  for (let i = 5; i >= 0; i--) { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i); meses.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`); }
  const vals = meses.map((m) => [suma((x) => x.f.startsWith(m) && x.c === 'h'), suma((x) => x.f.startsWith(m) && x.c === 'e')]);
  const mx = Math.max(1, ...vals.map((v) => v[0] + v[1]));
  const W = 340, H = 140, bw = 38, gap = (W - 20 - bw * 6) / 5;
  let g = '';
  vals.forEach(([a, b], i) => {
    const x = 10 + i * (bw + gap), ha = (a / mx) * (H - 40), hb = (b / mx) * (H - 40);
    g += `<rect x="${x}" y="${H - 20 - ha}" width="${bw}" height="${ha}" rx="3" fill="var(--acc)"/>`;
    g += `<rect x="${x}" y="${H - 20 - ha - hb}" width="${bw}" height="${hb}" rx="3" fill="var(--ev)"/>`;
    if (a + b) g += `<text x="${x + bw / 2}" y="${H - 24 - ha - hb}" font-size="10" text-anchor="middle" fill="var(--ink)">${Math.round(a + b)} €</text>`;
    g += `<text x="${x + bw / 2}" y="${H - 6}" font-size="10" text-anchor="middle" fill="var(--muted)">${new Date(meses[i] + '-15').toLocaleDateString('es-ES', { month: 'short' })}</text>`;
  });
  h += `<div class="box"><h3>📊 Gasto por mes</h3><svg class="chart" viewBox="0 0 ${W} ${H}">${g}</svg><div class="legend"><span><i style="background:var(--acc)"></i>${esc(nombreComb())}</span><span><i style="background:var(--ev)"></i>Eléctrico</span></div></div>`;
  // últimos apuntes
  h += `<div class="box"><h3>🧾 Últimos apuntes</h3>${[...D].reverse().slice(0, 15).map((x) => `<div class="kv ent"><span>${x.c === 'e' ? '⚡' : '🚗'} <b>${new Date(x.f + 'T12:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</b> · ${esc(x.lugar || '—')}<small>${fmtN(x.cant, 1)} ${x.c === 'e' ? 'kWh' : 'L'} a ${fmtN(x.pu, 3)} €${x.km ? ' · ' + x.km.toLocaleString('es-ES') + ' km' : ''}${x.media ? ` · <span class="${x.media >= x.pu ? 'down' : 'up'}">${x.media >= x.pu ? 'ahorro' : 'de más'} ${eur(Math.abs((x.media - x.pu) * x.cant))}</span>` : ''}</small></span><span><b>${eur(x.tot)}</b> <button class="tag" data-borrarent="${x.id}" aria-label="Borrar">✕</button></span></div>`).join('')}</div>`;
  return h;
}

// ---------------------------------------------------------------- Alertas de precio
function alertasCumplidas() {
  const out = [];
  for (const [id, a] of Object.entries(S.alertas)) {
    const e = S.est.find((x) => x.id == id);
    if (e && e.p[a.f] && e.p[a.f] <= a.p) out.push({ e, a, precio: e.p[a.f] });
  }
  return out;
}
function avisosAlertas() {
  return alertasCumplidas().map(({ e, a, precio }) => `<div class="alerta">🔔 <b>${esc(nombreMarca(marca(e.rot)))}</b> (${esc(nombreLoc(e.loc))}) tiene ${FUEL_NAMES[a.f]} a <b>${pr(precio)} €</b>, por debajo de tu objetivo de ${pr(a.p)} €. <button data-est="${e.id}">Ver</button></div>`).join('');
}
function alertaHTML(e) {
  const a = S.alertas[e.id];
  const c = S.cfg;
  if (!e.p[c.fuel] && !a) return '';
  return `<div class="box"><h3>🔔 Alerta de precio</h3>${a
    ? `<div class="kv"><span>Te aviso si ${FUEL_NAMES[a.f]} baja de</span><span><b>${pr(a.p)} €</b> <button class="tag" data-alertadel="${e.id}">Quitar</button></span></div><div class="muted">Ahora está a ${e.p[a.f] ? pr(e.p[a.f]) + ' €' : '—'}. El aviso sale al abrir la app.</div>`
    : `<div class="muted">Avísame cuando ${FUEL_NAMES[c.fuel]} baje de:</div><div class="tarifa"><input id="alertaIn" type="text" inputmode="decimal" placeholder="${pr(Math.max(0, e.p[c.fuel] - 30))}"><span>€/L</span><button class="btn" data-alerta="${e.id}">Guardar</button></div>`}</div>`;
}

// ---------------------------------------------------------------- Copia de seguridad
async function exportarCopia() {
  const datos_ = { app: 'GasoCerca', version: APP_VERSION, fecha: new Date().toISOString(), datos: {} };
  for (const k of Object.keys(localStorage)) if (k.startsWith('gc.')) datos_.datos[k] = localStorage.getItem(k);
  const nombre = `gasocerca-copia-${hoyISO()}.json`;
  const fich = new File([JSON.stringify(datos_, null, 1)], nombre, { type: 'application/json' });
  try {
    if (navigator.canShare?.({ files: [fich] })) { await navigator.share({ files: [fich], title: 'Copia de GasoCerca' }); return; }
  } catch (e) { if (e.name === 'AbortError') return; }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(fich); a.download = nombre; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  toast('Copia guardada en Descargas');
}
document.addEventListener('change', async (ev) => {
  if (ev.target.id !== 'importarFich' || !ev.target.files[0]) return;
  try {
    const j = JSON.parse(await ev.target.files[0].text());
    if (j.app !== 'GasoCerca' || !j.datos) throw new Error('formato');
    if (!confirm(`¿Recuperar la copia del ${new Date(j.fecha).toLocaleDateString('es-ES')}? Se sustituirán tus datos actuales.`)) return;
    Object.keys(localStorage).filter((k) => k.startsWith('gc.')).forEach((k) => localStorage.removeItem(k));
    for (const [k, v] of Object.entries(j.datos)) if (k.startsWith('gc.')) localStorage.setItem(k, v);
    location.reload();
  } catch { toast('Ese archivo no es una copia de GasoCerca'); }
});

// ---------------------------------------------------------------- Asistente de primera vez
const asistente = (() => {
  let paso = 0, el = null, r = {};
  const chips = (campo, opciones, sel, multi = false) => `<div class="achips">${opciones.map(([v, t]) => `<button type="button" class="chip ${(multi ? (sel || []).includes(v) : String(sel) === String(v)) ? 'on' : ''}" data-ac="${campo}" data-val="${v}" ${multi ? 'data-multi="1"' : ''}>${t}</button>`).join('')}</div>`;
  const inp = (campo, val, ph, num = true) => `<input class="ainp" data-ai="${campo}" type="text" ${num ? 'inputmode="decimal"' : ''} value="${esc(val ?? '')}" placeholder="${esc(ph || '')}" autocomplete="off">`;
  const PASOS = [
    () => `<div class="aico">⛽⚡</div><h2>¡Hola! Vamos a configurar GasoCerca</h2>
      <p>Te hago unas preguntas rápidas para que los precios, las rutas y los cálculos de «lo que más compensa» se ajusten a <b>tu coche</b>.</p>
      <p class="muted">Son 5 preguntas y tardas menos de un minuto. Tus respuestas se guardan <b>solo en este móvil</b>: no hay cuentas ni registros y la app es gratis.</p>`,
    () => `<h2>¿Cómo prefieres ver la app?</h2><p class="muted">Lo puedes cambiar cuando quieras en Ajustes.</p>
      <div class="acards">
        <button type="button" class="acard ${r.sencillo ? 'on' : ''}" data-ac="sencillo" data-fija="1"><span>😊</span><b>Sencilla (recomendada)</b><small>Solo lo importante: precios cerca, un botón para ir y tus favoritas</small></button>
        <button type="button" class="acard ${!r.sencillo ? 'on' : ''}" data-ac="sencillo" data-fija="0"><span>🧰</span><b>Completa</b><small>Todos los filtros, gastos, alertas y estadísticas</small></button>
      </div>
      <button type="button" class="acard ${r.letraGrande ? 'on' : ''}" data-ac="letraGrande" data-tog="1" style="margin-top:16px"><span>🔍</span><b>Letra más grande</b><small>Para leer mejor</small></button>`,
    () => `<h2>¿Qué coches tienes?</h2><p class="muted">Puedes elegir los dos.</p>
      <div class="acards">
        <button type="button" class="acard ${r.tieneComb ? 'on' : ''}" data-ac="tieneComb" data-tog="1"><span>🚗</span><b>Gasolina, diésel o híbrido</b><small>Ver gasolineras y precios</small></button>
        <button type="button" class="acard ${r.tieneEV ? 'on' : ''}" data-ac="tieneEV" data-tog="1"><span>⚡</span><b>Eléctrico o enchufable</b><small>Ver puntos de recarga</small></button>
      </div>`,
    () => `<h2>🚗 Tu coche de combustión</h2>
      <label>¿Qué combustible usas?</label>${chips('fuel', [['g95', 'Gasolina 95'], ['g98', 'Gasolina 98'], ['dsl', 'Diésel'], ['dslp', 'Diésel Premium'], ['glp', 'GLP'], ['gnc', 'GNC']], r.fuel)}
      <label>¿Cuántos litros sueles echar?</label>${chips('litros', [[20, '20 L'], [30, '30 L'], [40, '40 L'], [50, '50 L'], [60, '60 L']], r.litros)}${inp('litros', r.litros, 'Otra cantidad')}
      <label>¿Cuánto gasta? <small class="muted">(si no lo sabes, deja 6)</small></label>${chips('consumo', [[4, '4 L'], [5, '5 L'], [6, '6 L'], [7, '7 L'], [8, '8 L']], r.consumo)}${inp('consumo', r.consumo, 'L/100 km')}
      <label>Nombre del coche <small class="muted">(opcional)</small></label>${inp('combNombre', r.combNombre, 'Ej.: Corolla', false)}`,
    () => `<h2>⚡ Tu eléctrico</h2>
      <label>Modelo <small class="muted">(opcional)</small></label>${inp('evModelo', r.evModelo, 'Ej.: Tesla Model 3', false)}
      <label>Batería útil</label>${chips('bat', [[30, '30 kWh'], [40, '40 kWh'], [50, '50 kWh'], [60, '60 kWh'], [75, '75 kWh']], r.bat)}${inp('bat', r.bat, 'kWh')}
      <label>Conectores <small class="muted">(casi todos: Tipo 2 + CCS2)</small></label>${chips('conectores', [['t2', 'Tipo 2'], ['ccs', 'CCS2'], ['chademo', 'CHAdeMO']], r.conectores, true)}
      <label>Carga rápida máxima</label>${chips('dcKw', [[50, '50 kW'], [100, '100 kW'], [150, '150 kW'], [250, '250 kW']], r.dcKw)}
      <label>Carga lenta máxima (AC)</label>${chips('acKw', [[3.7, '3,7 kW'], [7.4, '7,4 kW'], [11, '11 kW'], [22, '22 kW']], r.acKw)}
      <label>Precio de la luz en casa</label>${chips('kwhCasa', [[0.1, '0,10 €'], [0.15, '0,15 €'], [0.2, '0,20 €'], [0.25, '0,25 €']], r.kwhCasa)}`,
    () => `<h2>⏱️ ¿Cuánto vale tu tiempo?</h2>
      <p class="muted">Sirve para no mandarte a una gasolinera lejana por ahorrar 1 €: la app compara lo que ahorras con los minutos de más que conduces.</p>
      ${chips('valorHora', [[0, 'Solo me importa el dinero'], [5, 'Poco · 5 €/h'], [10, 'Normal · 10 €/h'], [20, 'Mucho · 20 €/h']], r.valorHora)}
      <label>¿Hasta qué distancia busco al abrir la app?</label>${chips('radio', [[2, '2 km'], [5, '5 km'], [10, '10 km'], [25, '25 km']], r.radio)}`,
    () => `<div class="aico">📍</div><h2>Tu ubicación</h2>
      <p>Para enseñarte lo que tienes cerca necesito saber dónde estás. Solo se usa en este móvil.</p>
      <button type="button" class="btn" data-aloc="1" style="width:100%">${S.pos?.gps ? '✅ Ubicación activada' : 'Permitir ubicación'}</button>
      <p class="muted" style="margin-top:10px">Si no quieres, puedes buscar un pueblo o un código postal en cualquier momento.</p>`,
  ];
  const aplica = (i) => (i === 3 ? r.tieneComb : i === 4 ? r.tieneEV : true);
  function pinta() {
    const total = PASOS.filter((_, i) => aplica(i)).length;
    const n = PASOS.slice(0, paso + 1).filter((_, i) => aplica(i)).length;
    el.innerHTML = `<div class="abody">${PASOS[paso]()}</div>
      <div class="apie"><div class="adots">${Array.from({ length: total }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</div>
      ${paso === 0 ? '<button type="button" class="tour-saltar" data-anav="saltar">Saltar</button>' : '<button type="button" class="btn alt" data-anav="atras">‹</button>'}
      <button type="button" class="btn" data-anav="sig">${paso === 0 ? 'Empezar' : paso === PASOS.length - 1 ? '¡Listo!' : 'Siguiente ›'}</button></div>`;
    el.querySelector('.abody').scrollTop = 0;
  }
  function ir(d) {
    let n = paso + d;
    while (n > 0 && n < PASOS.length && !aplica(n)) n += d;
    if (n >= PASOS.length) return terminar();
    paso = Math.max(0, n); pinta();
  }
  function terminar(saltado) {
    if (!saltado) {
      for (const k of ['sencillo', 'letraGrande', 'tieneComb', 'tieneEV', 'fuel', 'litros', 'consumo', 'combNombre', 'evModelo', 'bat', 'conectores', 'dcKw', 'acKw', 'kwhCasa', 'valorHora', 'radio']) if (r[k] !== undefined) S.cfg[k] = r[k];
      if (S.cfg.conectores.includes('t2') && !S.cfg.conectores.includes('t2c')) S.cfg.conectores = [...S.cfg.conectores, 't2c'];
      S.cfg.modo = S.cfg.tieneComb ? 'fuel' : 'ev';
    }
    S.cfg.setupHecho = true; S.cfg.vista = 'lista'; saveCfg();
    el.remove(); el = null;
    if (!S.pos?.gps) localizar(true); // por si se saltó el paso de la ubicación
    save('version', APP_VERSION);
    render();
    if (!saltado) toast('¡Listo! Puedes cambiarlo todo en Ajustes');
    if (!load('tourVisto', false)) setTimeout(() => tour.iniciar(), 600);
  }
  function iniciar() {
    cerrarHoja();
    const c = S.cfg;
    r = { sencillo: c.sencillo, letraGrande: c.letraGrande, tieneComb: c.tieneComb, tieneEV: c.tieneEV, fuel: c.fuel, litros: c.litros, consumo: c.consumo, combNombre: c.combNombre, evModelo: c.evModelo, bat: c.bat,
      conectores: c.conectores.filter((x) => x !== 't2c'), dcKw: c.dcKw, acKw: c.acKw, kwhCasa: c.kwhCasa, valorHora: c.valorHora, radio: c.radio };
    paso = 0;
    if (!el) {
      el = document.createElement('div'); el.className = 'asis';
      document.body.appendChild(el);
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.anav === 'sig') { if (paso === 2 && !r.tieneComb && !r.tieneEV) { toast('Elige al menos un coche'); return; } ir(1); }
        else if (b.dataset.anav === 'atras') ir(-1);
        else if (b.dataset.anav === 'saltar') terminar(true);
        else if (b.dataset.aloc) { localizar(); setTimeout(pinta, 2500); }
        else if (b.dataset.ac) {
          const k = b.dataset.ac;
          if (b.dataset.fija) r[k] = b.dataset.fija === '1';
          else if (b.dataset.tog) r[k] = !r[k];
          if (k === 'letraGrande') document.body.classList.toggle('grande', !!r[k]);
          else if (b.dataset.fija || b.dataset.tog) { /* ya hecho */ }
          else if (b.dataset.multi) { const st = new Set(r[k]); st.has(b.dataset.val) ? st.delete(b.dataset.val) : st.add(b.dataset.val); r[k] = [...st]; }
          else r[k] = isNaN(+b.dataset.val) ? b.dataset.val : +b.dataset.val;
          pinta();
        }
      });
      el.addEventListener('input', (e) => {
        const k = e.target.dataset.ai; if (!k) return;
        if (k === 'combNombre' || k === 'evModelo') r[k] = e.target.value.trim();
        else { const v = num2(e.target.value); if (v > 0) r[k] = v; }
        // marcar el chip que coincida sin repintar (para no perder el foco)
        el.querySelectorAll(`[data-ac="${k}"]`).forEach((c) => c.classList.toggle('on', String(c.dataset.val) === String(r[k])));
      });
    }
    pinta();
  }
  return { iniciar };
})();

// ---------------------------------------------------------------- Ayuda (preguntas frecuentes)
function ayuda() {
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const P = [
    ['¿Para qué sirve esta app?', 'Para saber qué gasolineras (o puntos de recarga) tienes cerca y a qué precio, y que el móvil te lleve hasta la que más te conviene.'],
    ['¿Qué significan los colores del precio?', '<b style="color:var(--ok)">Verde</b>: de las más baratas de la zona. <b style="color:var(--mid)">Ámbar</b>: precio normal. <b style="color:var(--bad)">Rojo</b>: de las más caras.'],
    ['¿Cómo voy a una gasolinera?', 'Toca el botón <b>🧭 Ir</b> (o «Cómo llegar») y se abre el navegador del móvil con el camino ya puesto.'],
    ['¿Por qué me recomienda una que no es la más barata?', 'Porque también cuenta el viaje: si la más barata está lejos, el combustible y el tiempo que gastas en ir pueden costar más de lo que ahorras.'],
    ['¿Los precios son de verdad?', 'Sí: son los precios oficiales que las gasolineras comunican al Ministerio y se actualizan cada media hora. Aun así, confirma el precio en el surtidor.'],
    ['¿Cómo busco gasolineras en otro sitio?', 'Escribe el pueblo, la calle o el código postal en el buscador de arriba. Para volver a donde estás, toca «📍 Usar mi ubicación».'],
    ['¿Cómo guardo mis gasolineras de siempre?', 'Abre una gasolinera y toca <b>☆ Guardar en favoritas</b>. Las verás en la pestaña <b>★ Favoritas</b>.'],
    ['¿Y si me voy de viaje?', 'En la pestaña <b>🛣️ Ruta</b> escribe adónde vas y te enseña las gasolineras que te pillan de camino.'],
    ['No me sale mi ubicación', 'Seguramente el móvil no le ha dado permiso a la app. <button class="lnk" id="geoAyuda">Ver cómo activarla</button>'],
    ['¿Cuesta dinero? ¿Qué pasa con mis datos?', 'Es <b>gratis</b> y no hay que registrarse. Lo que configuras se guarda <b>solo en tu móvil</b>; nadie más lo ve.'],
    ['¿Cómo la pongo en la pantalla de inicio?', ios ? 'En Safari toca <b>Compartir</b> (□↑) y luego <b>Añadir a pantalla de inicio</b>.' : 'En Chrome toca el menú <b>⋮</b> y luego <b>Instalar aplicación</b> o <b>Añadir a pantalla de inicio</b>.'],
    ['Quiero ver más opciones', S.cfg.sencillo ? 'En <b>Ajustes → Cómo ver la app</b> elige <b>🧰 Completa</b>: verás filtros por marca, low cost, gastos, alertas de precio y más.' : 'Ya estás en el modo completo. Si lo ves demasiado lleno, en <b>Ajustes</b> elige <b>😊 Sencilla</b>.'],
  ];
  abrirHoja(`<h2>❓ Ayuda</h2><p class="addr">Toca una pregunta para ver la respuesta.</p>
    <div class="faq">${P.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>
    <div class="duo" style="margin-top:14px"><button class="btn alt" id="verTour">Ver el tutorial</button><button class="btn" id="cerrarHoja">Entendido</button></div>`);
}

// ---------------------------------------------------------------- Arranque
// DEBE quedarse al final del archivo: así todo (ruta, diario, asistente…) está definido antes de pintar
(() => {
  // accesos directos del icono: ?v=ruta / ?modo=ev
  const q = new URLSearchParams(location.search);
  if (['lista', 'ruta', 'mapa', 'favs', 'tend', 'ajustes'].includes(q.get('v'))) S.cfg.vista = q.get('v');
  if (['fuel', 'ev'].includes(q.get('modo'))) S.cfg.modo = q.get('modo');
  if (q.has('v') || q.has('modo')) { saveCfg(); history.replaceState(null, '', location.pathname); }
})();
render();
datos();
if (!S.cfg.setupHecho) asistente.iniciar(); // primera vez en este dispositivo
else if (!S.pos || S.pos.gps) localizar(true);
