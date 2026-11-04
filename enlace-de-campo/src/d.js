
/* ---------- checklists ---------- */
const I = {}, C = {};
const respondido = (i, x) => !!x && (i.unidad ? x.valor != null : x.ok === true || x.ok === false);
const enFuera = (i, v) => v != null && ((i.min != null && v < i.min) || (i.max != null && v > i.max));
const malo = (i, x) => !!x && (x.ok === false || (!!i.unidad && enFuera(i, x.valor)));
const rangoTxt = i => i.min != null && i.max != null ? `${num(i.min, 2)} a ${num(i.max, 2)}` : i.min != null ? `mínimo ${num(i.min, 2)}` : i.max != null ? `máximo ${num(i.max, 2)}` : '';
const chipEstado = e => e.revision && e.revision.estado === 'aprobado' ? '<span class="chip ok">Aprobado</span>'
  : ({ completo: '<span class="chip ok">Completo</span>', observaciones: '<span class="chip warn">Con observaciones</span>', rechazado: '<span class="chip bad">Rechazado</span>', borrador: '<span class="chip">Borrador</span>' }[e.estado] || '');

function itemsToText(items) {
  return (items || []).map(i => (i.critico ? '! ' : '') + i.texto + (i.unidad ? ` = ${i.unidad}` + (i.min != null || i.max != null ? ` [${i.min ?? ''}..${i.max ?? ''}]` : '') : '') +
    (i.manualId ? ' @' + ((S.d.manuales.find(m => m.id === i.manualId) || {}).titulo || '') : '')).join('\n');
}
function textToItems(t) {
  return t.split('\n').map(l => l.trim()).filter(Boolean).map((l, n) => {
    let critico = false, manualId = null;
    if (l[0] === '!') { critico = true; l = l.slice(1).trim(); }
    const at = l.lastIndexOf(' @');
    if (at > -1) { const q = norm(l.slice(at + 2)), m = q && S.d.manuales.find(m => norm(m.titulo).includes(q)); if (m) manualId = m.id; l = l.slice(0, at).trim(); }
    const it = { id: 'i' + n, texto: l, critico };
    const r = l.match(/^(.*?)\s*=\s*(\S+)\s*(?:\[\s*(-?[\d.,]*)\s*\.\.\s*(-?[\d.,]*)\s*\])?\s*$/);
    if (r) {
      const p = s => s === '' || s == null ? null : parseFloat(s.replace(',', '.'));
      it.texto = r[1]; it.unidad = r[2];
      if (r[3] !== undefined) { it.min = p(r[3]); it.max = p(r[4]); }
    }
    if (manualId) it.manualId = manualId;
    return it;
  });
}

function vChecklists() {
  const tab = S.f.tab || 'pend';
  const tabs = `<div class="tabs">${[['pend', 'Pendientes'], ['plant', 'Plantillas'], ['hist', 'Historial']].map(([k, t]) => `<button class="${tab === k ? 'on' : ''}" data-a="tab" data-t="${k}">${t}</button>`).join('')}</div>`;
  const acts = (puede() ? btn('iniciar', 'Iniciar checklist', 'check') : '') + (esAdmin() ? btn('asignar', 'Asignar', 'plus', 'ghost') : '');
  let cuerpo = '';
  if (tab === 'pend') {
    const bor = S.d.ejecuciones.filter(e => e.estado === 'borrador' && e.uid === S.me.id && enZona(e));
    const ps = asigPend().sort((a, b) => a.vence < b.vence ? -1 : 1);
    cuerpo = (bor.length ? `<div class="sec" style="margin-top:0"><h3>Tus borradores</h3></div><div class="rows">${bor.map(e => `<div class="row"><div class="main"><div class="t">${esc(e.plantillaNombre)}</div><div class="m"><span>${esc(e.sitio || zonaNombre(e.zonaId))}</span><span>Guardado ${fHora(e.ts)}</span></div></div><div class="side">${btn('continuar', 'Continuar', '', 'sm', `data-id="${e.id}"`)}</div></div>`).join('')}</div>` : '') +
      `<div class="sec"${bor.length ? '' : ' style="margin-top:0"'}><h3>Asignados</h3></div>` +
      (ps.length ? `<div class="rows">${ps.map(a => `<div class="row${a.vence < hoy() ? ' sev-bad' : ''}"><div class="main"><div class="t">${esc(a.plantillaNombre)}</div><div class="m"><span>${esc(a.sitio || '')}</span><span>${esc(zonaNombre(a.zonaId))}</span>${a.nota ? `<span>${esc(a.nota)}</span>` : ''}</div></div>
        <div class="side">${chipVence(a.vence)}${esAdmin() ? btn('delAsig', 'Quitar', '', 'ghost sm', `data-id="${a.id}"`) : ''}${puede() ? btn('iniciarAsig', 'Iniciar', '', 'sm', `data-id="${a.id}"`) : ''}</div></div>`).join('')}</div>` : vacio('No hay checklists pendientes', 'Un supervisor puede asignar uno a una zona o sitio.'));
  } else if (tab === 'plant') {
    const ls = S.d.plantillas.slice().sort((a, b) => norm(a.nombre) < norm(b.nombre) ? -1 : 1);
    cuerpo = (esAdmin() ? `<div class="bar">${btn('nuevaPlantilla', 'Nueva plantilla', 'plus', 'ghost')}</div>` : '') +
      (ls.length ? `<div class="rows">${ls.map(p => `<div class="row"><div class="main"><div class="t">${esc(p.nombre)}</div><div class="m"><span>${esc(p.tipo)}</span><span>${p.items.length} ítems</span><span>${p.items.filter(i => i.critico).length} críticos</span></div></div>
        <div class="side">${esAdmin() ? btn('editarPlantilla', 'Editar', '', 'ghost sm', `data-id="${p.id}"`) : ''}${puede() ? btn('iniciar', 'Iniciar', '', 'sm', `data-id="${p.id}"`) : ''}</div></div>`).join('')}</div>` : vacio('No hay plantillas', 'Crea la primera plantilla de checklist.'));
  } else {
    const ls = S.d.ejecuciones.filter(e => enZona(e) && e.estado !== 'borrador').slice(0, 100);
    cuerpo = `<div class="bar">${S.caps.save ? btn('csvCl', 'Exportar CSV', 'down', 'ghost') : ''}</div>` +
      (ls.length ? `<div class="rows">${ls.map(e => `<div class="row click ${e.estado === 'rechazado' ? 'sev-bad' : e.estado === 'observaciones' && !e.revision ? 'sev-warn' : ''}" data-a="verRun" data-id="${e.id}"><div class="main"><div class="t">${esc(e.plantillaNombre)}</div><div class="m"><span>${esc(e.sitio || zonaNombre(e.zonaId))}</span><span>${esc(e.firma)}</span><span>${fHora(e.ts)}</span></div></div><div class="side">${chipEstado(e)}</div></div>`).join('')}</div>` : vacio('Sin checklists completados', 'Aquí quedará el historial con quién, cuándo y dónde.'));
  }
  return cab('Checklists', 'Guías paso a paso para instalar, mantener e inspeccionar.', acts) + tabs + cuerpo;
}
A.tab = d => { S.f = { tab: d.t }; draw(); };
A.csvCl = () => descargar('checklists.csv', toCsv([['Fecha', e => new Date(e.ts).toISOString()], ['Checklist', e => e.plantillaNombre], ['Zona', e => zonaNombre(e.zonaId)], ['Sitio', e => e.sitio], ['Firma', e => e.firma], ['Estado', e => e.estado], ['Revisión', e => e.revision ? e.revision.estado : '']], S.d.ejecuciones.filter(e => e.estado !== 'borrador')));

/* iniciar, asignar y plantillas */
const zonasOpts = () => S.d.zonas.slice().sort((a, b) => (a.orden || 0) - (b.orden || 0)).map(z => [z.id, z.nombre]);
A.iniciar = d => {
  if (!S.d.plantillas.length) return toast('Primero crea una plantilla de checklist.', 'bad');
  modal(cabModal('Iniciar checklist') + `<div class="stack"><label class="fld"><span>Plantilla</span><select id="sPl">${opts(S.d.plantillas.map(p => [p.id, p.nombre]), d.id)}</select></label>
    <div class="g2"><label class="fld"><span>Zona</span><select id="sZo">${opts(zonasOpts(), S.zona, 'Sin zona')}</select></label><label class="fld"><span>Sitio o cliente</span><input id="sSi" type="text" placeholder="Ej. Torre CAY-01"></label></div></div>
    <div class="foot"><button class="btn ghost" data-a="cerrar">Cancelar</button>${btn('empezar', 'Empezar')}</div>`);
};
A.empezar = () => { const pl = S.d.plantillas.find(p => p.id === val('sPl')); if (!pl) return; cerrar(); empezarRun(pl, { zonaId: val('sZo'), sitio: val('sSi') }); };
A.iniciarAsig = d => {
  const a = S.d.asignaciones.find(x => x.id === d.id), pl = a && S.d.plantillas.find(p => p.id === a.plantillaId);
  if (!pl) return toast('La plantilla de este checklist ya no existe.', 'bad');
  const b = S.d.ejecuciones.find(e => e.asignacionId === a.id && e.estado === 'borrador' && e.uid === S.me.id);
  cerrar(); b ? A.continuar({ id: b.id }) : empezarRun(pl, { zonaId: a.zonaId, sitio: a.sitio, asignacionId: a.id });
};
A.continuar = d => { const e = S.d.ejecuciones.find(x => x.id === d.id); if (!e) return; S.run = { ...JSON.parse(JSON.stringify(e)), err: null }; S.view = 'ejecutar'; draw(); window.scrollTo(0, 0); };
function empezarRun(pl, c) {
  S.run = { id: '', plantillaId: pl.id, plantillaNombre: pl.nombre, items: pl.items, resp: {}, zonaId: c.zonaId || '', sitio: c.sitio || '', asignacionId: c.asignacionId || '', firma: S.me.name || '', nota: '', err: null };
  S.view = 'ejecutar'; draw(); window.scrollTo(0, 0);
}
A.asignar = () => {
  if (!S.d.plantillas.length) return toast('Primero crea una plantilla.', 'bad');
  const f = new Date(); f.setDate(f.getDate() + 3);
  modal(cabModal('Asignar checklist') + `<div class="stack"><label class="fld"><span>Plantilla</span><select id="aPl">${opts(S.d.plantillas.map(p => [p.id, p.nombre]))}</select></label>
    <div class="g2"><label class="fld"><span>Zona</span><select id="aZo">${opts(zonasOpts(), S.zona, 'Sin zona')}</select></label><label class="fld"><span>Sitio</span><input id="aSi" type="text" placeholder="Ej. Nodo CCO-02"></label>
    <label class="fld"><span>Vence el</span><input id="aVe" type="date" value="${isoDate(f)}"></label></div>
    <label class="fld"><span>Nota para el técnico</span><textarea id="aNo" rows="2"></textarea></label></div>
    <div class="foot"><button class="btn ghost" data-a="cerrar">Cancelar</button>${btn('guardarAsig', 'Asignar')}</div>`);
};
A.guardarAsig = async () => {
  const pl = S.d.plantillas.find(p => p.id === val('aPl')); if (!pl) return;
  await hacer(async () => { await guardar('asignaciones', '', { plantillaId: pl.id, plantillaNombre: pl.nombre, zonaId: val('aZo'), sitio: val('aSi'), vence: val('aVe') || hoy(), nota: val('aNo'), ts: Date.now() }, 'Asignó checklist', pl.nombre); cerrar(); }, 'Checklist asignado.');
};
A.delAsig = d => hacer(() => borrar('asignaciones', d.id, 'Quitó asignación', ''), 'Asignación quitada.');
function formPlantilla(p) {
  p = p || {};
  modal(cabModal(p.id ? 'Editar plantilla' : 'Nueva plantilla') + `<div class="stack"><label class="fld"><span>Nombre</span><input id="pNom" type="text" value="${esc(p.nombre || '')}"></label>
    <label class="fld"><span>Tipo de trabajo</span><select id="pTip">${opts(TIPOS_CL, p.tipo)}</select></label>
    <label class="fld"><span>Ítems, uno por línea</span><textarea id="pIts" rows="10" style="font-family:var(--font-mono);font-size:14px">${esc(itemsToText(p.items))}</textarea>
    <small>Escribe <b>!</b> al inicio para marcar un ítem crítico. Para una medición usa <b>texto = unidad [mín..máx]</b>, por ejemplo <span class="mono">Potencia en ONT = dBm [-27..-8]</span>. Para enlazar un manual, termina la línea con <b>@</b> y parte de su título.</small></label></div>
    <div class="foot">${p.id ? btn('delPlantilla', 'Eliminar', '', 'ghost', `data-id="${p.id}"`) : ''}<button class="btn ghost" data-a="cerrar">Cancelar</button>${btn('guardarPlantilla', 'Guardar plantilla', '', '', `data-id="${p.id || ''}"`)}</div>`);
}
A.nuevaPlantilla = () => formPlantilla();
A.editarPlantilla = d => formPlantilla(S.d.plantillas.find(p => p.id === d.id));
A.guardarPlantilla = async d => {
  const prev = S.d.plantillas.find(p => p.id === d.id), nombre = val('pNom'), items = textToItems(document.getElementById('pIts').value);
  if (!nombre) return toast('Escribe el nombre de la plantilla.', 'bad');
  if (!items.length) return toast('Agrega al menos un ítem.', 'bad');
  const data = { nombre, tipo: val('pTip'), items }; if (prev && prev.ejemplo) data.ejemplo = true;
  await hacer(async () => { await guardar('plantillas', d.id || '', JSON.parse(JSON.stringify(data)), prev ? 'Editó plantilla' : 'Creó plantilla', nombre); cerrar(); }, 'Plantilla guardada.');
};
A.delPlantilla = d => { const p = S.d.plantillas.find(x => x.id === d.id); if (p) preguntar('Eliminar plantilla', `Se elimina “${p.nombre}”. Los checklists ya hechos conservan su resultado.`, 'Eliminar', () => hacer(async () => { await borrar('plantillas', p.id, 'Eliminó plantilla', p.nombre); }, 'Plantilla eliminada.')); };

/* ---------- ejecución en campo ---------- */
function vEjecutar() {
  const r = S.run; if (!r) { S.view = 'checklists'; return vChecklists(); }
  const hechos = r.items.filter(i => respondido(i, r.resp[i.id])).length, crit = r.items.filter(i => i.critico && !respondido(i, r.resp[i.id])).length;
  const itemHtml = i => {
    const x = r.resp[i.id] || {}, fuera = i.unidad && enFuera(i, x.valor), fc = /^hilo/i.test(i.texto) ? FIBRA.find(f => norm(i.texto).includes(norm(f[0]))) : null;
    const man = i.manualId && S.d.manuales.find(m => m.id === i.manualId);
    const cuerpo = i.unidad
      ? `<div class="med"><input id="v-${i.id}" type="number" step="any" inputmode="decimal" value="${esc(x.raw ?? '')}" data-i="medida" data-it="${i.id}" aria-label="Valor medido"><b>${esc(i.unidad)}</b>
          ${rangoTxt(i) ? `<span class="sub" style="margin:0">Rango: ${rangoTxt(i)}</span>` : ''}${x.valor != null ? (fuera ? '<span class="chip bad">Fuera de rango</span>' : '<span class="chip ok">En rango</span>') : ''}</div>`
      : `<div class="yn"><button class="y${x.ok === true ? ' on' : ''}" data-a="resp" data-it="${i.id}" data-v="1">Cumple</button><button class="n${x.ok === false ? ' on' : ''}" data-a="resp" data-it="${i.id}" data-v="0">No cumple</button></div>`;
    const nota = x.nota || x.verNota || malo(i, x) ? `<textarea id="n-${i.id}" rows="2" placeholder="${malo(i, x) ? 'Nota obligatoria: qué pasó' : 'Nota'}" data-i="nota" data-it="${i.id}">${esc(x.nota || '')}</textarea>` : '';
    return `<div class="it ${malo(i, x) ? 'no' : respondido(i, x) ? 'good' : ''}"><div class="q">${fc ? `<span class="dot" style="background:${fc[1]}"></span>` : ''}<span>${esc(i.texto)}</span>${i.critico ? '<span class="chip acc">Crítico</span>' : ''}</div>
      ${cuerpo}${nota}
      <div class="thumbs">${(x.fotos || []).map(f => `<div><img src="/_blob/${f}" alt="Foto del ítem"><button data-a="quitarFoto" data-it="${i.id}" data-f="${f}" aria-label="Quitar foto">${ic('x')}</button></div>`).join('')}</div>
      <div class="acts">${!nota ? `<button class="btn ghost sm" data-a="verNota" data-it="${i.id}">Agregar nota</button>` : ''}
        ${S.caps.upload && (x.fotos || []).length < 3 ? `<label class="btn ghost sm">${ic('cam')}Foto<input type="file" accept="image/*" capture="environment" hidden data-c="foto" data-it="${i.id}"></label>` : ''}
        ${man ? `<button class="btn ghost sm" data-a="verManual" data-id="${man.id}">${ic('book')}Ver manual</button>` : ''}</div></div>`;
  };
  return cab(r.plantillaNombre, `${esc(r.sitio || 'Sin sitio')} · ${esc(zonaNombre(r.zonaId))}`, btn('salirRun', 'Salir', 'back', 'ghost')) +
    `<div class="stack" style="margin-bottom:14px"><div class="prog"><i style="width:${Math.round(100 * hechos / Math.max(1, r.items.length))}%"></i></div>
      <span class="sub" style="margin:0">${hechos} de ${r.items.length} ítems completos${crit ? ` · <b>${crit} crítico${crit > 1 ? 's' : ''} pendiente${crit > 1 ? 's' : ''}</b>` : ''}</span></div>` +
    (r.err ? `<div class="note" style="border-color:var(--bad);background:var(--bad-soft)"><div>${r.err.map(e => `<div>${esc(e)}</div>`).join('')}</div></div>` : '') +
    `<div class="stack">${r.items.map(itemHtml).join('')}
    <label class="fld"><span>Sitio o cliente</span><input id="r-sitio" type="text" value="${esc(r.sitio)}" data-i="sitioRun"></label>
    <label class="fld"><span>Observaciones generales</span><textarea id="r-nota" rows="2" data-i="notaRun">${esc(r.nota)}</textarea></label>
    <label class="fld"><span>Firma: escribe tu nombre</span><input id="r-firma" type="text" value="${esc(r.firma)}" data-i="firmaRun"></label>
    <div class="acts">${btn('completar', 'Completar checklist', 'check')}${btn('borrador', 'Guardar borrador', '', 'ghost')}</div></div>`;
}
const respDe = id => (S.run.resp[id] = S.run.resp[id] || {});
A.resp = d => { respDe(d.it).ok = d.v === '1'; draw(); };
A.verNota = d => { respDe(d.it).verNota = true; draw(); const n = document.getElementById('n-' + d.it); if (n) n.focus(); };
I.medida = t => { const x = respDe(t.dataset.it); x.raw = t.value; x.valor = t.value === '' || isNaN(t.valueAsNumber) ? null : t.valueAsNumber; draw(); };
I.nota = t => { respDe(t.dataset.it).nota = t.value; };
I.sitioRun = t => { S.run.sitio = t.value; };
I.notaRun = t => { S.run.nota = t.value; };
I.firmaRun = t => { S.run.firma = t.value; };
I.zona = t => { S.zona = t.value; draw(); };
A.salirRun = () => preguntar('Salir del checklist', 'Si sales sin guardar un borrador, pierdes lo que llenaste.', 'Salir', () => { S.run = null; ir('checklists'); });
A.quitarFoto = d => { const x = respDe(d.it); x.fotos = (x.fotos || []).filter(f => f !== d.f); draw(); };
async function comprimir(file) {
  try {
    const b = await createImageBitmap(file), k = Math.min(1, 1280 / Math.max(b.width, b.height)), cv = document.createElement('canvas');
    cv.width = Math.round(b.width * k); cv.height = Math.round(b.height * k); cv.getContext('2d').drawImage(b, 0, 0, cv.width, cv.height);
    return await new Promise(r => cv.toBlob(r, 'image/jpeg', .8));
  } catch (_) { return null; }
}
C.foto = async t => {
  const f = t.files[0]; if (!f) return; toast('Subiendo foto…');
  const blob = await comprimir(f), r = blob ? await subir(blob, 'image/jpeg') : await subir(f);
  if (r) { const x = respDe(t.dataset.it); x.fotos = [...(x.fotos || []), r.id]; draw(); toast('Foto agregada.'); }
};
async function guardarRun(estado) {
  const r = S.run, sinResponder = r.items.filter(i => !respondido(i, r.resp[i.id])).length;
  const resp = JSON.parse(JSON.stringify(r.resp)); Object.values(resp).forEach(x => delete x.verNota);
  const data = JSON.parse(JSON.stringify({ plantillaId: r.plantillaId, plantillaNombre: r.plantillaNombre, items: r.items, resp, zonaId: r.zonaId, sitio: r.sitio, asignacionId: r.asignacionId, uid: S.me.id, firma: r.firma.trim(), nota: r.nota, ts: Date.now(), estado, sinResponder }));
  return hacer(async () => { r.id = await guardar('ejecuciones', r.id, data, estado === 'borrador' ? 'Guardó borrador' : 'Completó checklist', `${r.plantillaNombre} · ${r.sitio || zonaNombre(r.zonaId)}`); }, null);
}
A.borrador = async () => { if (await guardarRun('borrador')) { toast('Borrador guardado.'); S.run = null; ir('checklists'); } };
A.completar = async () => {
  const r = S.run, falta = [];
  r.items.forEach(i => { const x = r.resp[i.id] || {};
    if (i.critico && !respondido(i, x)) falta.push(`Falta el ítem crítico: ${i.texto}`);
    if (malo(i, x) && !(x.nota || '').trim()) falta.push(`Explica en una nota: ${i.texto}`); });
  if (!r.firma.trim()) falta.push('Escribe tu nombre como firma.');
  r.err = falta.length ? falta : null;
  if (falta.length) { draw(); window.scrollTo(0, 0); return; }
  const obs = r.items.some(i => malo(i, r.resp[i.id])), estado = obs ? 'observaciones' : 'completo';
  if (await guardarRun(estado)) { toast(obs ? 'Checklist guardado con observaciones.' : 'Checklist completo.'); S.run = null; S.f = { tab: 'hist' }; ir('checklists'); S.f = { tab: 'hist' }; draw(); }
};

/* ---------- detalle e informe ---------- */
function informe(e) {
  const filas = e.items.map(i => { const x = (e.resp || {})[i.id] || {};
    const r = i.unidad ? (x.valor != null ? `${x.valor} ${i.unidad}${enFuera(i, x.valor) ? ' (fuera de rango)' : ''}` : 'Sin medir') : x.ok === true ? 'Cumple' : x.ok === false ? 'No cumple' : 'Sin responder';
    return `<tr><td>${esc(i.texto)}${i.critico ? ' <b>(crítico)</b>' : ''}</td><td>${esc(r)}</td><td>${esc(x.nota || '')}</td></tr>`; }).join('');
  return `<!doctype html><html lang="es"><meta charset="utf-8"><title>Informe de checklist</title><style>body{font:15px/1.4 system-ui,sans-serif;margin:32px;color:#111}table{border-collapse:collapse;width:100%}td,th{border:1px solid #bbb;padding:6px 8px;text-align:left;vertical-align:top}h1{margin:0 0 4px}</style>
<h1>${esc(e.plantillaNombre)}</h1><p>${esc(e.sitio || zonaNombre(e.zonaId))} · ${fHora(e.ts)} · Firma: ${esc(e.firma)} · Estado: ${esc(e.estado)}</p>
<table><tr><th>Ítem</th><th>Resultado</th><th>Nota</th></tr>${filas}</table>${e.nota ? `<p><b>Observaciones:</b> ${esc(e.nota)}</p>` : ''}${e.revision ? `<p><b>Revisión del supervisor:</b> ${esc(e.revision.estado)}. ${esc(e.revision.nota || '')}</p>` : ''}</html>`;
}
A.verRun = async d => {
  const e = S.d.ejecuciones.find(x => x.id === d.id); if (!e) return;
  if (e.revision) await resolver([e.revision.uid]);
  const lineas = e.items.map(i => { const x = (e.resp || {})[i.id] || {};
    const res = i.unidad ? (x.valor != null ? `<b class="mono">${num(x.valor, 3)} ${esc(i.unidad)}</b> ${enFuera(i, x.valor) ? '<span class="chip bad">Fuera de rango</span>' : '<span class="chip ok">En rango</span>'}` : '<span class="chip">Sin medir</span>')
      : x.ok === true ? '<span class="chip ok">Cumple</span>' : x.ok === false ? '<span class="chip bad">No cumple</span>' : '<span class="chip">Sin responder</span>';
    return `<div class="row"><div class="main"><div class="t">${esc(i.texto)}${i.critico ? ' <span class="chip acc">Crítico</span>' : ''}</div>${x.nota ? `<div class="m"><span>${esc(x.nota)}</span></div>` : ''}
      ${(x.fotos || []).length ? `<div class="thumbs" style="margin-top:6px">${x.fotos.map(f => `<a href="/_blob/${f}" target="_blank" rel="noopener"><img src="/_blob/${f}" alt="Foto"></a>`).join('')}</div>` : ''}</div><div class="side">${res}</div></div>`; }).join('');
  modal(cabModal(e.plantillaNombre) + `<div class="acts">${chipEstado(e)}<span class="chip">${esc(e.sitio || zonaNombre(e.zonaId))}</span><span class="chip">${esc(zonaNombre(e.zonaId))}</span><span class="chip">${esc(e.firma)}</span><span class="chip">${fHora(e.ts)}</span></div>
    ${e.nota ? `<p>${esc(e.nota)}</p>` : ''}<div class="rows">${lineas}</div>
    ${e.revision ? `<p class="sub">Revisión: <b>${esc(e.revision.estado)}</b> por ${esc(nombreDe(e.revision.uid))}. ${esc(e.revision.nota || '')}</p>` : ''}
    ${esAdmin() && !e.revision ? `<label class="fld"><span>Nota de revisión</span><textarea id="rvNota" rows="2"></textarea></label>` : ''}
    <div class="foot">${S.caps.save ? btn('informe', 'Descargar informe', 'down', 'ghost', `data-id="${e.id}"`) : ''}
    ${esAdmin() && !e.revision ? btn('revisar', 'Rechazar', '', 'ghost', `data-id="${e.id}" data-v="rechazado"`) + btn('revisar', 'Aprobar', '', '', `data-id="${e.id}" data-v="aprobado"`) : ''}</div>`);
};
A.informe = d => { const e = S.d.ejecuciones.find(x => x.id === d.id); if (e) descargar(`checklist-${norm(e.plantillaNombre).replace(/\W+/g, '-')}-${isoDate(new Date(e.ts))}.html`, informe(e)); };
A.revisar = d => { const e = S.d.ejecuciones.find(x => x.id === d.id); if (!e) return;
  hacer(async () => { await parchar('ejecuciones', e.id, { revision: { estado: d.v, nota: val('rvNota'), uid: S.me.id, ts: Date.now() }, ...(d.v === 'rechazado' ? { estado: 'rechazado' } : {}) }, d.v === 'aprobado' ? 'Aprobó checklist' : 'Rechazó checklist', e.plantillaNombre); cerrar(); }, 'Revisión guardada.'); };
