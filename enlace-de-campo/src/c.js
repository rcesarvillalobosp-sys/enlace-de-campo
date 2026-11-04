
/* ---------- acciones (se enlazan por data-a) ---------- */
const A = {};
A.ir = d => ir(d.v);
A.cerrar = cerrar;
A.si = () => { const f = preguntaFn; preguntaFn = null; cerrar(); if (f) f(); };
A.setZona = d => { S.zona = d.id || ''; draw(); };

async function resolver(ids) {
  if (!USER) return;
  const falta = [...new Set(ids)].filter(i => i && S.names[i] === undefined);
  if (!falta.length) return;
  try { const ps = await USER.profiles(falta); falta.forEach(i => { S.names[i] = (ps[i] && ps[i].name) || ''; }); } catch (_) {}
}
const TIPOS = { pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', mp4: 'video/mp4', webm: 'video/webm', txt: 'text/plain', md: 'text/markdown', csv: 'text/csv' };
const tipoArchivo = f => TIPOS[(f.name.split('.').pop() || '').toLowerCase()] || null;
async function subir(file, tipo) {
  if (!ASSETS) { toast('Esta vista no permite subir archivos.', 'bad'); return null; }
  const t = tipo || tipoArchivo(file);
  if (!t) { toast('Formato no admitido. Usa PDF, imagen, MP4/WebM o texto. Un Word se guarda antes como PDF.', 'bad'); return null; }
  try { return await ASSETS.upload(file, { type: t }); }
  catch (e) { toast(e && e.code === 'too_large' ? 'El archivo supera los 20 MB.' : e && e.code === 'quota_or_state' ? 'Se llenó el espacio de archivos.' : 'No se pudo subir el archivo.', 'bad'); return null; }
}

/* ---------- consultas compartidas ---------- */
const asigPend = () => S.d.asignaciones.filter(a => enZona(a) && !S.d.ejecuciones.some(e => e.asignacionId === a.id && e.estado !== 'borrador'));
const leido = m => S.d.lecturas.some(l => l.manualId === m.id && l.uid === S.me.id && l.version === m.version);
const sinLeer = () => S.me.id ? S.d.manuales.filter(m => m.obligatorio && !leido(m)) : [];
const stockBajo = () => S.d.inventario.filter(i => enZona(i) && i.minimo > 0 && i.cantidad <= i.minimo && i.estado !== 'baja');
const certsAlerta = () => {
  const o = [];
  S.d.personal.filter(enZona).forEach(p => (p.certs || []).forEach(c => { const d = diasHasta(c.vence); if (d <= 30) o.push({ p, c, d }); }));
  return o.sort((a, b) => a.d - b.d);
};
const chipVence = f => { const d = diasHasta(f); return d < 0 ? `<span class="chip bad">Vencido hace ${-d} d</span>` : d === 0 ? `<span class="chip warn">Vence hoy</span>` : `<span class="chip ${d <= 2 ? 'warn' : ''}">Vence en ${d} d</span>`; };

/* ---------- panel ---------- */
function vPanel() {
  const pend = asigPend(), venc = pend.filter(a => a.vence < hoy()), bajos = stockBajo(), cs = certsAlerta(), sl = sinLeer();
  const rev = esAdmin() ? S.d.ejecuciones.filter(e => enZona(e) && (e.estado === 'observaciones' || e.estado === 'rechazado') && !e.revision) : [];
  const fl = [];
  venc.forEach(a => fl.push({ s: 'bad', t: `Checklist vencido: ${a.plantillaNombre}`, m: `${a.sitio || zonaNombre(a.zonaId)} · venció ${fFecha(a.vence)}`, a: 'iniciarAsig', id: a.id, b: 'Iniciar' }));
  cs.filter(x => x.d < 0).forEach(x => fl.push({ s: 'bad', t: `Certificación vencida: ${x.c.nombre}`, m: `${x.p.nombre} · venció ${fFecha(x.c.vence)}`, a: 'ir', v: 'personal', b: 'Ver personal' }));
  bajos.filter(i => i.cantidad <= 0).forEach(i => fl.push({ s: 'bad', t: `Sin stock: ${i.nombre}`, m: `${zonaNombre(i.zonaId)} · mínimo ${num(i.minimo)} ${i.unidad || ''}`, a: 'mover', id: i.id, b: 'Registrar entrada' }));
  pend.filter(a => a.vence >= hoy() && diasHasta(a.vence) <= 2).forEach(a => fl.push({ s: 'warn', t: `Checklist por vencer: ${a.plantillaNombre}`, m: `${a.sitio || zonaNombre(a.zonaId)} · ${fFecha(a.vence)}`, a: 'iniciarAsig', id: a.id, b: 'Iniciar' }));
  cs.filter(x => x.d >= 0).forEach(x => fl.push({ s: 'warn', t: `Certificación por vencer: ${x.c.nombre}`, m: `${x.p.nombre} · en ${x.d} días (${fFecha(x.c.vence)})`, a: 'ir', v: 'personal', b: 'Ver personal' }));
  bajos.filter(i => i.cantidad > 0).forEach(i => fl.push({ s: 'warn', t: `Stock bajo: ${i.nombre}`, m: `${zonaNombre(i.zonaId)} · quedan ${num(i.cantidad)} de mínimo ${num(i.minimo)}`, a: 'mover', id: i.id, b: 'Registrar entrada' }));
  sl.forEach(m => fl.push({ s: 'warn', t: `Manual obligatorio sin leer: ${m.titulo}`, m: `Versión ${m.version}`, a: 'verManual', id: m.id, b: 'Abrir' }));
  rev.forEach(e => fl.push({ s: 'warn', t: `Checklist con observaciones: ${e.plantillaNombre}`, m: `${e.sitio || zonaNombre(e.zonaId)} · ${fHora(e.ts)}`, a: 'verRun', id: e.id, b: 'Revisar' }));
  const lista = fl.slice(0, 14);
  const ahora = new Date(), delMes = e => { const d = new Date(e.ts); return d.getMonth() === ahora.getMonth() && d.getFullYear() === ahora.getFullYear() && e.estado !== 'borrador'; };
  const zonas = S.d.zonas.slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));
  const filasZ = zonas.map(z => {
    const ps = S.d.personal.filter(p => p.zonaId === z.id).length, inv = S.d.inventario.filter(i => i.zonaId === z.id);
    const bj = inv.filter(i => i.minimo > 0 && i.cantidad <= i.minimo && i.estado !== 'baja').length, tr = S.d.ejecuciones.filter(e => e.zonaId === z.id && delMes(e)).length;
    return `<div class="row click" data-a="setZona" data-id="${z.id}"><div class="main"><div class="t">${esc(z.nombre)}</div><div class="m"><span>${ps} en personal</span><span>${inv.length} ítems</span><span>${tr} checklists este mes</span></div></div>
      <div class="side">${bj ? `<span class="chip warn">${bj} con stock bajo</span>` : `<span class="chip ok">Stock al día</span>`}</div></div>`;
  }).join('');
  quiero(S.d.auditoria.slice(0, 8).map(a => a.uid));
  const act = S.d.auditoria.slice(0, 8).map(a => `<div class="row"><div class="main"><div class="t">${esc(a.accion)}</div><div class="m"><span>${esc(a.detalle)}</span></div></div><div class="side"><span class="m">${esc(nombreDe(a.uid))} · ${fHora(a.ts)}</span></div></div>`).join('');
  const hayEj = Object.values(S.d).some(arr => arr.some(x => x.ejemplo));
  return cab('Panel', S.zona ? `Zona: ${esc(zonaNombre(S.zona))}` : 'Todas las zonas', btn('ir', 'Nuevo checklist', 'plus', '', 'data-v="checklists"')) +
    (hayEj ? `<div class="note"><span>Estás viendo datos de ejemplo. Bórralos cuando cargues los reales.</span>${esAdmin() ? btn('borrarEj', 'Borrar datos de ejemplo', '', 'ghost sm') : ''}</div>` : '') +
    `<div class="strip"><div><div class="k">${pend.length}</div><div class="kl">Checklists pendientes</div></div><div><div class="k" style="color:${venc.length ? 'var(--bad)' : 'inherit'}">${venc.length}</div><div class="kl">Vencidos</div></div>
      <div><div class="k">${bajos.length}</div><div class="kl">Con stock bajo</div></div><div><div class="k">${cs.length}</div><div class="kl">Certificaciones por vencer</div></div>${S.me.id ? `<div><div class="k">${sl.length}</div><div class="kl">Manuales sin leer</div></div>` : ''}</div>
    <div class="sec"><h3>Atención ahora</h3></div>` +
    (lista.length ? `<div class="rows">${lista.map(x => `<div class="row sev-${x.s}"><div class="main"><div class="t">${esc(x.t)}</div><div class="m"><span>${esc(x.m)}</span></div></div><div class="side"><button class="btn ghost sm" data-a="${x.a}" ${x.id ? `data-id="${x.id}"` : ''} ${x.v ? `data-v="${x.v}"` : ''}>${esc(x.b)}</button></div></div>`).join('')}</div>${fl.length > 14 ? `<p class="sub">y ${fl.length - 14} avisos más</p>` : ''}` : vacio('Todo en orden', 'No hay checklists vencidos, certificaciones por vencer ni stock bajo.')) +
    `<div class="sec"><h3>Por zona</h3></div>${zonas.length ? `<div class="rows">${filasZ}</div>` : vacio('Aún no hay zonas', 'Un supervisor puede crearlas desde Inventario o Personal.')}
    <div class="sec"><h3>Últimas actividades</h3>${btn('ir', 'Ver registro', '', 'ghost sm', 'data-v="auditoria"')}</div>${act ? `<div class="rows">${act}</div>` : vacio('Sin actividad todavía')}`;
}
A.borrarEj = () => preguntar('Borrar datos de ejemplo', 'Se eliminan solo los registros marcados como ejemplo. Tus datos reales no se tocan.', 'Borrar ejemplos', async () => {
  await hacer(async () => {
    for (const c of ['zonas', 'personal', 'manuales', 'plantillas', 'asignaciones', 'ejecuciones', 'inventario', 'movimientos', 'lecturas']) {
      const sn = await col(c).where('ejemplo', '==', true).get();
      for (const d of sn.docs) await col(c).doc(d.id).delete();
    }
    log('Borró datos de ejemplo', '');
  }, 'Datos de ejemplo borrados.');
});

/* ---------- manuales ---------- */
function vManuales() {
  const q = norm(S.f.q), c = S.f.cat || '';
  const ls = S.d.manuales.filter(m => (!c || m.categoria === c) && (!q || norm(m.titulo + ' ' + (m.notas || '')).includes(q))).sort((a, b) => norm(a.titulo) < norm(b.titulo) ? -1 : 1);
  const filas = ls.map(m => `<div class="row click" data-a="verManual" data-id="${m.id}"><div class="main"><div class="t">${esc(m.titulo)}</div>
    <div class="m"><span>${esc(m.categoria)}</span><span>Versión ${esc(m.version)}</span><span>${fFecha(m.fecha)}</span></div></div>
    <div class="side">${m.obligatorio ? `<span class="chip acc">Obligatorio</span>${S.me.id ? (leido(m) ? '<span class="chip ok">Leído</span>' : '<span class="chip warn">Sin leer</span>') : ''}` : ''}
    <span class="chip">${m.asset ? esc((m.asset.nombre.split('.').pop() || 'archivo').toUpperCase()) : 'Sin archivo'}</span></div></div>`).join('');
  return cab('Manuales de operación', 'Procedimientos vigentes de instalación, mantenimiento y seguridad.', esAdmin() ? btn('nuevoManual', 'Subir manual', 'up') : '') +
    `<div class="bar"><input id="qMan" type="search" placeholder="Buscar por nombre o palabra clave" value="${esc(S.f.q || '')}" data-i="q"><select id="cMan" data-i="cat">${opts(CAT_MANUAL, c, 'Todas las categorías')}</select></div>` +
    (ls.length ? `<div class="rows">${filas}</div>` : vacio('No hay manuales', S.d.manuales.length ? 'Prueba con otra búsqueda o categoría.' : 'Sube el primer manual para que el equipo lo consulte.'));
}
A.verManual = async d => {
  const m = S.d.manuales.find(x => x.id === d.id); if (!m) return;
  const lect = S.d.lecturas.filter(l => l.manualId === m.id && l.version === m.version);
  if (esAdmin()) await resolver(lect.map(l => l.uid));
  const arch = x => x ? `<a class="btn sm" style="text-decoration:none" href="/_blob/${x.id}" target="_blank" rel="noopener">${ic('file')}Abrir ${esc(x.nombre)}</a>` : '<span class="chip">Sin archivo adjunto</span>';
  modal(cabModal(m.titulo) + `<div class="acts">${m.obligatorio ? '<span class="chip acc">Obligatorio</span>' : ''}<span class="chip">${esc(m.categoria)}</span><span class="chip">Versión ${esc(m.version)}</span><span class="chip">${fFecha(m.fecha)}</span></div>
    ${m.notas ? `<p>${esc(m.notas)}</p>` : ''}<div>${arch(m.asset)}</div>
    ${(m.historial || []).length ? `<div class="stack"><b>Versiones anteriores</b>${m.historial.map(h => `<div class="row" style="border:1px solid var(--line);border-radius:6px"><div class="main"><div class="t">Versión ${esc(h.version)}</div><div class="m"><span>${fFecha(h.fecha)}</span></div></div><div class="side">${h.asset ? arch(h.asset) : ''}</div></div>`).join('')}</div>` : ''}
    ${esAdmin() ? `<div class="stack"><b>Leído por (${lect.length})</b><p class="sub">${lect.length ? lect.map(l => esc(nombreDe(l.uid))).join(', ') : 'Nadie ha confirmado la lectura de esta versión.'}</p></div>` : ''}
    <div class="foot">${esAdmin() ? btn('editarManual', 'Editar o subir versión', 'up', 'ghost', `data-id="${m.id}"`) + btn('delManual', 'Eliminar', '', 'ghost', `data-id="${m.id}"`) : ''}
    ${puede() && S.me.id ? (leido(m) ? '<span class="chip ok">Ya lo marcaste como leído</span>' : btn('leer', 'Marcar como leído', '', '', `data-id="${m.id}"`)) : ''}</div>`);
};
A.leer = d => { const m = S.d.manuales.find(x => x.id === d.id); if (!m) return;
  hacer(async () => { await guardar('lecturas', S.me.id + '_' + m.id, { uid: S.me.id, manualId: m.id, version: m.version, ts: Date.now() }, 'Leyó manual', m.titulo); cerrar(); }, 'Lectura registrada.'); };
function formManual(m) {
  m = m || {};
  modal(cabModal(m.id ? 'Editar manual' : 'Subir manual') + `<div class="stack">
    <label class="fld"><span>Título</span><input id="mTit" type="text" value="${esc(m.titulo || '')}"></label>
    <div class="g2"><label class="fld"><span>Categoría</span><select id="mCat">${opts(CAT_MANUAL, m.categoria)}</select></label>
    <label class="fld"><span>Versión</span><input id="mVer" type="text" value="${esc(m.version || '1.0')}"></label>
    <label class="fld"><span>Fecha de la versión</span><input id="mFec" type="date" value="${esc(m.fecha || hoy())}"></label></div>
    <label class="chk"><input id="mObl" type="checkbox" ${m.obligatorio ? 'checked' : ''}>Obligatorio de leer para todo el personal</label>
    <label class="fld"><span>Notas</span><textarea id="mNot" rows="2">${esc(m.notas || '')}</textarea></label>
    <label class="fld"><span>Archivo ${m.asset ? '(déjalo vacío para conservar el actual)' : ''}</span><input id="mFile" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.mp4,.webm,.txt,.md,.csv">
    <small>PDF, imágenes, video MP4/WebM o texto, hasta 20 MB. Si tu manual está en Word, guárdalo como PDF antes.${S.caps.upload ? '' : ' Esta vista no permite subir archivos.'}</small></label>
    <small>Si cambias el número de versión, la anterior queda en el historial y se pide leer de nuevo.</small></div>
    <div class="foot"><button class="btn ghost" data-a="cerrar">Cancelar</button>${btn('guardarManual', 'Guardar manual', '', '', `data-id="${m.id || ''}"`)}</div>`);
}
A.nuevoManual = () => formManual();
A.editarManual = d => formManual(S.d.manuales.find(x => x.id === d.id));
A.guardarManual = async d => {
  const prev = S.d.manuales.find(m => m.id === d.id), titulo = val('mTit');
  if (!titulo) return toast('Escribe el título del manual.', 'bad');
  const f = $('#mFile').files[0]; let asset = prev ? prev.asset || null : null;
  if (f) { const r = await subir(f); if (!r) return; asset = { id: r.id, nombre: f.name, tipo: r.contentType, tam: r.sizeBytes }; }
  const version = val('mVer') || '1.0', hist = prev && prev.historial ? prev.historial.slice() : [];
  if (prev && prev.version !== version) hist.unshift({ version: prev.version, fecha: prev.fecha, asset: prev.asset || null });
  const data = { titulo, categoria: val('mCat'), version, fecha: val('mFec') || hoy(), obligatorio: chk('mObl'), notas: val('mNot'), asset, historial: hist.slice(0, 20) };
  if (prev && prev.ejemplo) data.ejemplo = true;
  await hacer(async () => { await guardar('manuales', d.id || '', data, prev ? 'Actualizó manual' : 'Subió manual', `${titulo} v${version}`); cerrar(); }, 'Manual guardado.');
};
A.delManual = d => { const m = S.d.manuales.find(x => x.id === d.id); if (m) preguntar('Eliminar manual', `Se elimina “${m.titulo}” con su historial de versiones.`, 'Eliminar', () => hacer(async () => { await borrar('manuales', m.id, 'Eliminó manual', m.titulo); }, 'Manual eliminado.')); };
