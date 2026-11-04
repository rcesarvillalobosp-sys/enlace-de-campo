(() => {
'use strict';
/* ---------- utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const isoDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hoy = () => isoDate(new Date());
const diasHasta = f => Math.round((new Date(f + 'T00:00:00') - new Date(hoy() + 'T00:00:00')) / 864e5);
const fFecha = f => f ? new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(f + 'T00:00:00')) : '—';
const fHora = t => t ? new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(t)) : '—';
const num = (n, d = 0) => new Intl.NumberFormat('es-PE', { maximumFractionDigits: d }).format(n ?? 0);
const norm = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const ic = (n, c = '') => `<svg class="ic ${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const opts = (arr, sel, vacio) => (vacio ? `<option value="">${esc(vacio)}</option>` : '') +
  arr.map(o => { const [v, t] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}"${v === sel ? ' selected' : ''}>${esc(t)}</option>`; }).join('');
const val = id => { const e = document.getElementById(id); return e ? e.value.trim() : ''; };
const chk = id => { const e = document.getElementById(id); return !!(e && e.checked); };

/* ---------- constantes del rubro ---------- */
const NAV = [['panel', 'Panel', 'grid'], ['checklists', 'Checklists', 'check'], ['manuales', 'Manuales', 'book'], ['inventario', 'Inventario', 'box'], ['personal', 'Personal', 'users'], ['auditoria', 'Registro', 'clock']];
const CAT_MANUAL = ['Instalación', 'Mantenimiento', 'Fibra óptica', 'Radioenlaces', 'Torres', 'Seguridad', 'Emergencias'];
const CAT_INV = ['Fibra y cable', 'Equipos activos', 'Antenas y radio', 'Energía', 'Conectividad', 'Instrumentos y herramientas', 'EPP y seguridad'];
const EST_INV = ['nuevo', 'en uso', 'en reparación', 'baja'];
const TIPOS_CL = ['Instalación', 'Mantenimiento preventivo', 'Inspección de torre', 'Revisión de sitio', 'Cierre de incidencia'];
const FIBRA = [['Azul', '#1f5fbf'], ['Naranja', '#f08a1c'], ['Verde', '#2e9a4a'], ['Marrón', '#7a4a25'], ['Pizarra', '#6b7785'], ['Blanco', '#ffffff'],
  ['Rojo', '#d32f2f'], ['Negro', '#111111'], ['Amarillo', '#f2d21b'], ['Violeta', '#7b3fa0'], ['Rosa', '#ef7fa8'], ['Celeste', '#2bb5d8']];
const TURNOS = { M: 'Mañana', T: 'Tarde', N: 'Noche', L: 'Libre' };
const DIAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const VIEWS = NAV.map(n => n[0]);

/* ---------- estado ---------- */
const S = {
  view: 'panel', zona: '', f: {}, run: null, booted: false, synced: false, slow: false, err: '',
  d: { zonas: [], personal: [], manuales: [], plantillas: [], asignaciones: [], ejecuciones: [], inventario: [], movimientos: [], lecturas: [], auditoria: [] },
  me: { id: null, name: '' }, names: {},
  caps: { db: false, write: null, admin: false, owner: false, upload: false, save: false }
};
let DB = null, USER = null, ASSETS = null, DL = null;
const puede = () => S.caps.write !== false;
const esAdmin = () => S.caps.admin || S.caps.owner;
const rol = () => S.caps.owner ? 'Administrador' : S.caps.admin ? 'Supervisor' : S.caps.write === false ? 'Solo lectura' : 'Técnico';
const zonaNombre = id => (S.d.zonas.find(z => z.id === id) || {}).nombre || '—';
const enZona = o => !S.zona || o.zonaId === S.zona;

/* nombres de usuarios: se guardan solo ids y se resuelven al mostrar */
const pend = new Set();
const nombreDe = id => !id ? '—' : id === S.me.id ? (S.me.name || 'Tú') : (S.names[id] || 'Alguien');
function quiero(ids) {
  if (!USER) return;
  const falta = [...new Set(ids)].filter(i => i && S.names[i] === undefined && !pend.has(i));
  if (!falta.length) return;
  falta.forEach(i => pend.add(i));
  USER.profiles(falta).then(ps => { falta.forEach(i => { S.names[i] = (ps[i] && ps[i].name) || ''; pend.delete(i); }); sched(); });
}

/* ---------- escritura con registro de auditoría ---------- */
const col = n => DB.collection(n);
function log(accion, detalle, c, ref) {
  col('auditoria').add({ ts: Date.now(), uid: S.me.id, accion, detalle: detalle || '', col: c || '', ref: ref || '' }).catch(() => {});
}
async function guardar(c, id, data, accion, detalle) {
  const r = id ? col(c).doc(id) : col(c).doc();
  await r.set(data); log(accion, detalle, c, r.id); return r.id;
}
async function parchar(c, id, patch, accion, detalle) { await col(c).doc(id).update(patch); log(accion, detalle, c, id); }
async function borrar(c, id, accion, detalle) { await col(c).doc(id).delete(); log(accion, detalle, c, id); }
const errMsg = e => e && e.code === 'invalid_argument' ? 'Tu nivel de acceso no permite este cambio.'
  : e && e.code === 'quota_exceeded' ? 'Se llenó la base de datos. Borra registros antiguos.' : 'No se pudo guardar. Revisa tu conexión e intenta de nuevo.';
async function hacer(fn, ok) {
  try { await fn(); if (ok) toast(ok); return true; } catch (e) { toast(errMsg(e), 'bad'); return false; }
}

/* ---------- avisos y ventanas ---------- */
let tt;
function toast(msg, kind = 'ok') {
  const t = $('#toast'); t.textContent = msg; t.className = 'toast ' + (kind === 'bad' ? 'bad' : ''); t.hidden = false;
  clearTimeout(tt); tt = setTimeout(() => { t.hidden = true; }, 4200);
}
function modal(html) {
  const m = $('#modal'); m.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`; m.hidden = false; document.body.style.overflow = 'hidden';
}
function cerrar() { const m = $('#modal'); m.hidden = true; m.innerHTML = ''; document.body.style.overflow = ''; }
let preguntaFn = null;
function preguntar(titulo, texto, btn, fn) {
  preguntaFn = fn;
  modal(`<div class="sh"><h3>${esc(titulo)}</h3></div><p>${esc(texto)}</p>
    <div class="foot"><button class="btn ghost" data-a="cerrar">Cancelar</button><button class="btn bad" data-a="si">${esc(btn)}</button></div>`);
}
const cabModal = t => `<div class="sh"><h3>${esc(t)}</h3><button class="btn ghost sm" data-a="cerrar" aria-label="Cerrar">${ic('x')}</button></div>`;

/* ---------- descarga de archivos ---------- */
const csvCelda = v => { const s = String(v ?? ''); return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const toCsv = (cols, rows) => '﻿' + [cols.map(c => csvCelda(c[0])).join(','), ...rows.map(r => cols.map(c => csvCelda(c[1](r))).join(','))].join('\r\n');
async function descargar(nombre, data) {
  if (!DL) return toast('Esta vista no permite descargar archivos.', 'bad');
  try { await DL.save({ filename: nombre, data }); toast('Archivo listo.'); }
  catch (e) { if (!e || e.code !== 'declined') toast('No se pudo descargar el archivo.', 'bad'); }
}

/* ---------- dibujo ---------- */
let raf = 0;
const sched = () => { if (S.view === 'ejecutar') return; cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); };
function draw() {
  const a = document.activeElement, id = a && a.id, s0 = a && a.selectionStart, s1 = a && a.selectionEnd, y = window.scrollY;
  $('#app').innerHTML = shell();
  if (id) { const n = document.getElementById(id); if (n) { n.focus(); try { if (s0 != null) n.setSelectionRange(s0, s1); } catch (_) {} } }
  window.scrollTo(0, y);
}
function ir(v) {
  S.view = v; S.f = {}; draw(); window.scrollTo(0, 0);
  if (VIEWS.includes(v)) { try { history.replaceState(null, '', '#' + v); } catch (_) { location.hash = v; } }
}
const fibraStrip = () => `<div class="fibra" title="Código de colores de fibra">${FIBRA.map(f => `<i style="background:${f[1]}"></i>`).join('')}</div>`;

function shell() {
  const nav = NAV.map(([v, t, i]) => `<button class="nav-item${S.view === v || (S.view === 'ejecutar' && v === 'checklists') ? ' on' : ''}" data-a="ir" data-v="${v}">${ic(i)}<span>${t}</span></button>`).join('');
  const zs = S.d.zonas.slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));
  const estado = S.err ? ['off', 'Sin acceso a datos'] : S.synced ? ['on', 'En línea'] : [S.slow ? 'off' : '', S.slow ? 'Sin respuesta, mostrando datos guardados' : 'Conectando…'];
  return `<aside class="rail"><div class="brand"><h1>Enlace de Campo</h1><small>Operaciones de red</small>${fibraStrip()}</div>
    <nav class="nav">${nav}</nav>
    <div class="who"><span class="chip acc" style="align-self:flex-start">${esc(rol())}</span><span>${esc(S.me.name || '')}</span></div></aside>
  <div class="main-col"><div class="topbar"><div class="brandm"><h1>Enlace de Campo</h1>${fibraStrip()}</div>
    <div class="tools"><label class="zsel">Zona <select id="zonaSel" data-i="zona" style="width:auto;min-width:170px">${opts(zs.map(z => [z.id, z.nombre]), S.zona, 'Todas las zonas')}</select></label>
    <span class="sync ${estado[0]}"><i></i>${esc(estado[1])}</span></div></div>
    <main class="page">${vista()}</main></div><nav class="tabbar">${nav}</nav>`;
}
function vista() {
  if (!S.booted) return `<div class="empty"><h3>Cargando</h3>Conectando con la base de datos…</div>`;
  if (!S.caps.db) return `<div class="empty"><h3>Sin base de datos</h3>Abre este enlace con tu sesión de Claude para ver y guardar los datos de la empresa.</div>`;
  return ({ panel: vPanel, checklists: vChecklists, manuales: vManuales, inventario: vInventario, personal: vPersonal, auditoria: vAuditoria, ejecutar: vEjecutar }[S.view] || vPanel)();
}
const vacio = (t, s) => `<div class="empty"><h3>${esc(t)}</h3>${esc(s || '')}</div>`;
const cab = (t, sub, acts) => `<header class="vh"><div><h2>${esc(t)}</h2>${sub ? `<p class="sub">${sub}</p>` : ''}</div><div class="acts">${acts || ''}</div></header>`;
const btn = (a, t, icon, cls = '', data = '') => `<button class="btn ${cls}" data-a="${a}" ${data}>${icon ? ic(icon) : ''}${esc(t)}</button>`;
