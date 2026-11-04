
/* ---------- inventario ---------- */
function vInventario() {
  const tab = S.f.tab || 'stock';
  const tabs = `<div class="tabs">${[['stock', 'Existencias'], ['mov', 'Movimientos']].map(([k, t]) => `<button class="${tab === k ? 'on' : ''}" data-a="tab" data-t="${k}">${t}</button>`).join('')}</div>`;
  const acts = (esAdmin() ? btn('nuevoItem', 'Nuevo ítem', 'plus') + btn('zonas', 'Zonas', '', 'ghost') : '') + (S.caps.save ? btn('csvInv', 'Exportar CSV', 'down', 'ghost') : '');
  const q = norm(S.f.q), c = S.f.cat || '', es = S.f.est || '';
  const base = S.d.inventario.filter(i => enZona(i) && (!c || i.categoria === c) && (!es || i.estado === es) && (!q || norm(i.nombre + ' ' + (i.codigo || '')).includes(q)));
  const bajos = base.filter(i => i.minimo > 0 && i.cantidad <= i.minimo && i.estado !== 'baja').length;
  const strip = `<div class="strip"><div><div class="k">${base.length}</div><div class="kl">Ítems</div></div><div><div class="k">${bajos}</div><div class="kl">Bajo el mínimo</div></div><div><div class="k">${base.filter(i => i.estado === 'en reparación').length}</div><div class="kl">En reparación</div></div></div>`;
  let cuerpo;
  if (tab === 'mov') {
    const ms = S.d.movimientos.filter(m => !S.zona || m.deZona === S.zona || m.aZona === S.zona).slice(0, 100);
    quiero(ms.map(m => m.uid));
    cuerpo = ms.length ? `<div class="rows">${ms.map(m => `<div class="row"><div class="main"><div class="t">${esc(m.invNombre)}</div><div class="m"><span>${esc(m.tipo)}${m.tipo === 'transferencia' ? `: ${esc(zonaNombre(m.deZona))} → ${esc(zonaNombre(m.aZona))}` : ` · ${esc(zonaNombre(m.deZona))}`}</span><span>${esc(m.motivo || '')}</span><span>${esc(nombreDe(m.uid))} · ${fHora(m.ts)}</span></div></div>
      <div class="side"><span class="chip ${m.tipo === 'entrada' ? 'ok' : m.tipo === 'salida' ? 'warn' : ''}">${m.tipo === 'entrada' ? '+' : m.tipo === 'salida' ? '−' : ''}${num(m.cant, 2)} ${esc(m.unidad || '')}</span></div></div>`).join('')}</div>` : vacio('Sin movimientos', 'Las entradas, salidas y transferencias quedan registradas aquí.');
  } else {
    const cons = !S.zona && S.f.det !== '1';
    let filas;
    if (cons) {
      const g = {};
      base.forEach(i => { const k = norm(i.nombre); const o = g[k] = g[k] || { nombre: i.nombre, unidad: i.unidad, cat: i.categoria, total: 0, z: {}, bajo: false }; o.total += i.cantidad; o.z[i.zonaId] = (o.z[i.zonaId] || 0) + i.cantidad; if (i.minimo > 0 && i.cantidad <= i.minimo) o.bajo = true; });
      filas = Object.values(g).sort((a, b) => norm(a.nombre) < norm(b.nombre) ? -1 : 1).map(o => `<div class="row${o.bajo ? ' sev-warn' : ''}"><div class="main"><div class="t">${esc(o.nombre)}</div><div class="m"><span>${esc(o.cat)}</span>${Object.entries(o.z).map(([z, n]) => `<span>${esc(zonaNombre(z))}: <b class="mono">${num(n)}</b></span>`).join('')}</div></div>
        <div class="side">${o.bajo ? '<span class="chip warn">Bajo mínimo en una zona</span>' : ''}<div class="qty">${num(o.total, 2)}<small>${esc(o.unidad || '')}</small></div></div></div>`).join('');
    } else {
      filas = base.slice().sort((a, b) => norm(a.nombre) < norm(b.nombre) ? -1 : 1).map(i => {
        const bajo = i.minimo > 0 && i.cantidad <= i.minimo && i.estado !== 'baja';
        return `<div class="row${bajo ? ' sev-warn' : ''}"><div class="main"><div class="t">${esc(i.nombre)}</div><div class="m">${i.codigo ? `<span class="mono">${esc(i.codigo)}</span>` : ''}<span>${esc(i.categoria)}</span><span>${esc(zonaNombre(i.zonaId))}</span>${i.responsable ? `<span>Resp.: ${esc(i.responsable)}</span>` : ''}</div></div>
        <div class="side">${bajo ? '<span class="chip warn">Bajo mínimo</span>' : ''}<span class="chip ${i.estado === 'baja' ? 'bad' : i.estado === 'en reparación' ? 'warn' : ''}">${esc(i.estado)}</span><div class="qty">${num(i.cantidad, 2)}<small>${esc(i.unidad || '')}</small></div>
        ${puede() ? btn('mover', 'Mover', 'swap', 'ghost sm', `data-id="${i.id}"`) : ''}${esAdmin() ? btn('editarItem', 'Editar', '', 'ghost sm', `data-id="${i.id}"`) : ''}</div></div>`;
      }).join('');
    }
    cuerpo = `<div class="bar"><input id="qInv" type="search" placeholder="Buscar por nombre o serie" value="${esc(S.f.q || '')}" data-i="q"><select id="cInv" data-i="cat">${opts(CAT_INV, c, 'Todas las categorías')}</select><select id="eInv" data-i="est">${opts(EST_INV, es, 'Todos los estados')}</select>
      ${!S.zona ? btn('detalle', cons ? 'Ver detalle por zona' : 'Ver consolidado', '', 'ghost') : ''}</div>` +
      (filas ? `<div class="rows">${filas}</div>` : vacio('No hay ítems', S.d.inventario.length ? 'Prueba con otro filtro.' : 'Un supervisor puede registrar el primer ítem.'));
  }
  return cab('Inventario', S.zona ? `Zona: ${esc(zonaNombre(S.zona))}` : 'Consolidado de todas las zonas', acts) + strip + tabs + cuerpo;
}
A.detalle = () => { S.f.det = S.f.det === '1' ? '' : '1'; draw(); };
A.csvInv = () => descargar('inventario.csv', toCsv([['Ítem', i => i.nombre], ['Categoría', i => i.categoria], ['Código o serie', i => i.codigo], ['Cantidad', i => i.cantidad], ['Unidad', i => i.unidad], ['Estado', i => i.estado], ['Zona', i => zonaNombre(i.zonaId)], ['Responsable', i => i.responsable], ['Mínimo', i => i.minimo]], S.d.inventario.filter(enZona)));
function formItem(i) {
  i = i || {};
  modal(cabModal(i.id ? 'Editar ítem' : 'Nuevo ítem') + `<div class="stack"><label class="fld"><span>Nombre</span><input id="iNom" type="text" value="${esc(i.nombre || '')}"></label>
    <div class="g2"><label class="fld"><span>Categoría</span><select id="iCat">${opts(CAT_INV, i.categoria)}</select></label><label class="fld"><span>Código o serie</span><input id="iCod" type="text" value="${esc(i.codigo || '')}"></label>
    <label class="fld"><span>Cantidad</span><input id="iCan" type="number" step="any" value="${i.cantidad ?? 1}"></label><label class="fld"><span>Unidad</span><input id="iUni" type="text" placeholder="u, m, rollo" value="${esc(i.unidad || 'u')}"></label>
    <label class="fld"><span>Estado</span><select id="iEst">${opts(EST_INV, i.estado || 'nuevo')}</select></label><label class="fld"><span>Zona</span><select id="iZon">${opts(zonasOpts(), i.zonaId || S.zona)}</select></label>
    <label class="fld"><span>Responsable</span><input id="iRes" type="text" value="${esc(i.responsable || '')}"></label><label class="fld"><span>Stock mínimo</span><input id="iMin" type="number" step="any" value="${i.minimo ?? 0}"></label></div></div>
    <div class="foot">${i.id ? btn('delItem', 'Eliminar', '', 'ghost', `data-id="${i.id}"`) : ''}<button class="btn ghost" data-a="cerrar">Cancelar</button>${btn('guardarItem', 'Guardar ítem', '', '', `data-id="${i.id || ''}"`)}</div>`);
}
A.nuevoItem = () => { if (!S.d.zonas.length) return toast('Primero crea una zona.', 'bad'); formItem(); };
A.editarItem = d => formItem(S.d.inventario.find(i => i.id === d.id));
A.guardarItem = async d => {
  const prev = S.d.inventario.find(i => i.id === d.id), nombre = val('iNom'), cant = parseFloat(val('iCan'));
  if (!nombre) return toast('Escribe el nombre del ítem.', 'bad');
  if (isNaN(cant) || cant < 0) return toast('La cantidad debe ser un número mayor o igual a 0.', 'bad');
  const data = { nombre, categoria: val('iCat'), codigo: val('iCod'), cantidad: cant, unidad: val('iUni') || 'u', estado: val('iEst'), zonaId: val('iZon'), responsable: val('iRes'), minimo: parseFloat(val('iMin')) || 0 };
  if (prev && prev.ejemplo) data.ejemplo = true;
  await hacer(async () => { await guardar('inventario', d.id || '', data, prev ? 'Editó ítem' : 'Creó ítem', nombre); cerrar(); }, 'Ítem guardado.');
};
A.delItem = d => { const i = S.d.inventario.find(x => x.id === d.id); if (i) preguntar('Eliminar ítem', `Se elimina “${i.nombre}” del inventario de ${zonaNombre(i.zonaId)}.`, 'Eliminar', () => hacer(async () => { await borrar('inventario', i.id, 'Eliminó ítem', i.nombre); }, 'Ítem eliminado.')); };
A.mover = d => {
  const i = S.d.inventario.find(x => x.id === d.id); if (!i) return;
  modal(cabModal('Mover: ' + i.nombre) + `<p class="sub">En ${esc(zonaNombre(i.zonaId))} hay <b class="mono">${num(i.cantidad, 2)}</b> ${esc(i.unidad || '')}.</p>
    <div class="stack"><div class="g2"><label class="fld"><span>Tipo</span><select id="mvTipo">${opts([['salida', 'Salida (uso o consumo)'], ['entrada', 'Entrada (compra o devolución)'], ['transferencia', 'Transferencia a otra zona']])}</select></label>
    <label class="fld"><span>Cantidad</span><input id="mvCan" type="number" step="any" value="1"></label></div>
    <label class="fld"><span>Zona de destino (solo transferencia)</span><select id="mvDes">${opts(zonasOpts().filter(z => z[0] !== i.zonaId), '', 'Elegir zona')}</select></label>
    <label class="fld"><span>Motivo</span><input id="mvMot" type="text" placeholder="Ej. Instalación cliente, reposición de almacén"></label></div>
    <div class="foot"><button class="btn ghost" data-a="cerrar">Cancelar</button>${btn('hacerMov', 'Registrar movimiento', '', '', `data-id="${i.id}"`)}</div>`);
};
A.hacerMov = async d => {
  const it = S.d.inventario.find(x => x.id === d.id); if (!it) return;
  const tipo = val('mvTipo'), n = parseFloat(val('mvCan')), des = val('mvDes'), motivo = val('mvMot');
  if (!(n > 0)) return toast('Escribe una cantidad mayor a 0.', 'bad');
  if (tipo !== 'entrada' && n > it.cantidad) return toast('No hay tanta cantidad en esta zona.', 'bad');
  if (tipo !== 'entrada' && !motivo) return toast('Escribe el motivo del movimiento.', 'bad');
  if (tipo === 'transferencia' && !des) return toast('Elige la zona de destino.', 'bad');
  await hacer(async () => {
    if (tipo === 'entrada') await parchar('inventario', it.id, { cantidad: it.cantidad + n }, 'Entrada de inventario', `${it.nombre} +${n}`);
    else if (tipo === 'salida') await parchar('inventario', it.id, { cantidad: it.cantidad - n }, 'Salida de inventario', `${it.nombre} −${n}`);
    else {
      const dest = S.d.inventario.find(x => x.zonaId === des && norm(x.nombre) === norm(it.nombre) && (x.codigo || '') === (it.codigo || ''));
      if (n === it.cantidad && !dest) await parchar('inventario', it.id, { zonaId: des }, 'Transferencia', `${it.nombre} → ${zonaNombre(des)}`);
      else {
        await parchar('inventario', it.id, { cantidad: it.cantidad - n }, 'Transferencia', `${it.nombre} ×${n} → ${zonaNombre(des)}`);
        if (dest) await parchar('inventario', dest.id, { cantidad: dest.cantidad + n }, 'Recepción de transferencia', it.nombre);
        else { const c = { nombre: it.nombre, categoria: it.categoria, codigo: it.codigo || '', cantidad: n, unidad: it.unidad, estado: it.estado, zonaId: des, responsable: '', minimo: it.minimo || 0 }; if (it.ejemplo) c.ejemplo = true; await guardar('inventario', '', c, 'Creó ítem por transferencia', it.nombre); }
      }
    }
    const mv = { invId: it.id, invNombre: it.nombre, tipo, cant: n, unidad: it.unidad || '', deZona: it.zonaId, aZona: tipo === 'transferencia' ? des : '', motivo, uid: S.me.id, ts: Date.now() };
    if (it.ejemplo) mv.ejemplo = true;
    await col('movimientos').add(mv); cerrar();
  }, 'Movimiento registrado.');
};
A.zonas = () => {
  const zs = S.d.zonas.slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));
  modal(cabModal('Zonas y almacenes') + `<div class="rows">${zs.map(z => `<div class="row"><div class="main"><div class="t">${esc(z.nombre)}</div><div class="m"><span>${esc(z.tipo || 'Zona')}</span></div></div><div class="side">${btn('delZona', 'Quitar', '', 'ghost sm', `data-id="${z.id}"`)}</div></div>`).join('') || '<div class="row">Aún no hay zonas.</div>'}</div>
    <div class="g2"><label class="fld"><span>Nombre</span><input id="zNom" type="text" placeholder="Ej. Zona Sur · Socabaya"></label><label class="fld"><span>Tipo</span><select id="zTip">${opts(['Zona', 'Sitio', 'Almacén'])}</select></label></div>
    <div class="foot"><button class="btn ghost" data-a="cerrar">Cerrar</button>${btn('addZona', 'Agregar zona', 'plus')}</div>`);
};
A.addZona = async () => { const n = val('zNom'); if (!n) return toast('Escribe el nombre de la zona.', 'bad'); if (await hacer(() => guardar('zonas', '', { nombre: n, tipo: val('zTip'), orden: S.d.zonas.length }, 'Creó zona', n), 'Zona agregada.')) setTimeout(A.zonas, 350); };
A.delZona = d => { const z = S.d.zonas.find(x => x.id === d.id); if (!z) return;
  if (S.d.inventario.some(i => i.zonaId === z.id) || S.d.personal.some(p => p.zonaId === z.id)) return toast('Esta zona tiene inventario o personal. Muévelos antes de quitarla.', 'bad');
  hacer(async () => { await borrar('zonas', z.id, 'Eliminó zona', z.nombre); if (S.zona === z.id) S.zona = ''; setTimeout(A.zonas, 350); }, 'Zona quitada.'); };

/* ---------- personal ---------- */
const parseCerts = t => t.split('\n').map(l => l.split('|').map(s => s.trim())).filter(a => a[0]).map(a => ({ nombre: a[0], vence: /^\d{4}-\d{2}-\d{2}$/.test(a[1] || '') ? a[1] : '' }));
const certChip = c => { if (!c.vence) return '<span class="chip">Sin fecha</span>'; const d = diasHasta(c.vence); return d < 0 ? '<span class="chip bad">Vencida</span>' : d <= 30 ? `<span class="chip warn">Vence en ${d} d</span>` : '<span class="chip ok">Vigente</span>'; };
function vPersonal() {
  const q = norm(S.f.q);
  const ls = S.d.personal.filter(p => enZona(p) && (!q || norm(p.nombre + ' ' + p.cargo).includes(q))).sort((a, b) => norm(a.nombre) < norm(b.nombre) ? -1 : 1);
  const filas = ls.map(p => { const peor = (p.certs || []).map(c => c.vence ? diasHasta(c.vence) : 999).sort((a, b) => a - b)[0];
    return `<div class="row click${peor < 0 ? ' sev-bad' : peor <= 30 ? ' sev-warn' : ''}" data-a="verPersona" data-id="${p.id}"><div class="main"><div class="t">${esc(p.nombre)}</div><div class="m"><span>${esc(p.cargo)}</span><span>${esc(zonaNombre(p.zonaId))}</span></div></div>
    <div class="side">${peor < 0 ? '<span class="chip bad">Certificación vencida</span>' : peor <= 30 ? '<span class="chip warn">Certificación por vencer</span>' : ''}</div></div>`; }).join('');
  return cab('Personal', 'Fichas, certificaciones, equipos asignados y turnos.', (esAdmin() ? btn('nuevaPersona', 'Nueva ficha', 'plus') : '') + (S.caps.save ? btn('csvPer', 'Exportar CSV', 'down', 'ghost') : '')) +
    `<div class="bar"><input id="qPer" type="search" placeholder="Buscar por nombre o cargo" value="${esc(S.f.q || '')}" data-i="q"></div>` +
    (ls.length ? `<div class="rows">${filas}</div>` : vacio('No hay fichas', S.d.personal.length ? 'Prueba con otra búsqueda o zona.' : 'Un supervisor puede crear la primera ficha.'));
}
A.csvPer = () => descargar('personal.csv', toCsv([['Nombre', p => p.nombre], ['Cargo', p => p.cargo], ['Zona', p => zonaNombre(p.zonaId)], ['Teléfono', p => p.telefono], ['Ingreso', p => p.ingreso], ['Certificaciones', p => (p.certs || []).map(c => `${c.nombre} (${c.vence || 's/f'})`).join('; ')], ['Equipos', p => (p.equipos || []).join('; ')]], S.d.personal.filter(enZona)));
A.verPersona = d => {
  const p = S.d.personal.find(x => x.id === d.id); if (!p) return;
  const hechos = S.d.ejecuciones.filter(e => e.estado !== 'borrador' && ((p.uid && e.uid === p.uid) || norm(e.firma) === norm(p.nombre)));
  const obl = S.d.manuales.filter(m => m.obligatorio), leidos = p.uid ? obl.filter(m => S.d.lecturas.some(l => l.uid === p.uid && l.manualId === m.id && l.version === m.version)).length : null;
  modal(cabModal(p.nombre) + `<dl class="kv"><dt>Cargo</dt><dd>${esc(p.cargo)}</dd><dt>Zona</dt><dd>${esc(zonaNombre(p.zonaId))}</dd><dt>Teléfono</dt><dd class="mono">${esc(p.telefono || '—')}</dd><dt>Ingreso</dt><dd>${fFecha(p.ingreso)}</dd>
    <dt>Checklists</dt><dd>${hechos.length} realizados</dd><dt>Manuales</dt><dd>${leidos === null ? 'Sin cuenta vinculada' : `${leidos} de ${obl.length} obligatorios leídos`}</dd></dl>
    <div class="stack"><b>Certificaciones</b>${(p.certs || []).length ? `<div class="rows">${p.certs.map(c => `<div class="row"><div class="main"><div class="t">${esc(c.nombre)}</div><div class="m"><span>Vence ${fFecha(c.vence)}</span></div></div><div class="side">${certChip(c)}</div></div>`).join('')}</div>` : '<p class="sub">Sin certificaciones registradas.</p>'}</div>
    <div class="stack"><b>Equipos y herramientas asignados</b><p class="sub">${(p.equipos || []).length ? p.equipos.map(esc).join(' · ') : 'Ninguno.'}</p></div>
    <div class="stack"><b>Turnos de la semana</b><div class="turnos">${(p.turnos || []).map((t, n) => `<div class="tu ${t}"><span>${DIAS[n]}</span><b>${t}</b></div>`).join('')}</div><small class="sub">M mañana · T tarde · N noche · L libre</small></div>
    <div class="foot">${esAdmin() ? btn('editarPersona', 'Editar ficha', '', 'ghost', `data-id="${p.id}"`) : ''}</div>`);
};
function formPersona(p) {
  p = p || {};
  const tu = p.turnos || ['M', 'M', 'M', 'M', 'M', 'L', 'L'];
  modal(cabModal(p.id ? 'Editar ficha' : 'Nueva ficha') + `<div class="stack"><label class="fld"><span>Nombre completo</span><input id="pNomb" type="text" value="${esc(p.nombre || '')}"></label>
    <div class="g2"><label class="fld"><span>Cargo</span><input id="pCar" type="text" value="${esc(p.cargo || '')}"></label><label class="fld"><span>Zona</span><select id="pZon">${opts(zonasOpts(), p.zonaId || S.zona, 'Sin zona')}</select></label>
    <label class="fld"><span>Teléfono</span><input id="pTel" type="text" value="${esc(p.telefono || '')}"></label><label class="fld"><span>Fecha de ingreso</span><input id="pIng" type="date" value="${esc(p.ingreso || '')}"></label></div>
    <label class="fld"><span>Certificaciones, una por línea</span><textarea id="pCer" rows="3" placeholder="Trabajo en altura | 2027-03-15">${esc((p.certs || []).map(c => `${c.nombre} | ${c.vence}`).join('\n'))}</textarea></label>
    <label class="fld"><span>Equipos y herramientas, uno por línea</span><textarea id="pEqu" rows="3">${esc((p.equipos || []).join('\n'))}</textarea></label>
    <div class="fld"><span>Turnos (lunes a domingo)</span><div class="turnos">${tu.map((t, n) => `<select id="pTu${n}" aria-label="${DIAS[n]}" style="padding:4px;min-height:40px">${opts(Object.keys(TURNOS), t)}</select>`).join('')}</div></div>
    ${S.me.id ? `<label class="chk"><input id="pUid" type="checkbox" ${p.uid === S.me.id ? 'checked' : ''}>Esta ficha es mía (vincula mi cuenta)</label>` : ''}</div>
    <div class="foot">${p.id ? btn('delPersona', 'Eliminar', '', 'ghost', `data-id="${p.id}"`) : ''}<button class="btn ghost" data-a="cerrar">Cancelar</button>${btn('guardarPersona', 'Guardar ficha', '', '', `data-id="${p.id || ''}"`)}</div>`);
}
A.nuevaPersona = () => formPersona();
A.editarPersona = d => formPersona(S.d.personal.find(p => p.id === d.id));
A.guardarPersona = async d => {
  const prev = S.d.personal.find(p => p.id === d.id), nombre = val('pNomb');
  if (!nombre) return toast('Escribe el nombre de la persona.', 'bad');
  const data = { nombre, cargo: val('pCar'), zonaId: val('pZon'), telefono: val('pTel'), ingreso: val('pIng'), certs: parseCerts(val('pCer')), equipos: val('pEqu').split('\n').map(s => s.trim()).filter(Boolean), turnos: [0, 1, 2, 3, 4, 5, 6].map(n => val('pTu' + n) || 'L'), uid: chk('pUid') ? S.me.id : (prev && prev.uid && prev.uid !== S.me.id ? prev.uid : null) };
  if (prev && prev.ejemplo) data.ejemplo = true;
  await hacer(async () => { await guardar('personal', d.id || '', data, prev ? 'Editó ficha' : 'Creó ficha', nombre); cerrar(); }, 'Ficha guardada.');
};
A.delPersona = d => { const p = S.d.personal.find(x => x.id === d.id); if (p) preguntar('Eliminar ficha', `Se elimina la ficha de ${p.nombre}.`, 'Eliminar', () => hacer(async () => { await borrar('personal', p.id, 'Eliminó ficha', p.nombre); }, 'Ficha eliminada.')); };

/* ---------- registro de actividad ---------- */
function vAuditoria() {
  quiero(S.d.auditoria.map(a => a.uid));
  return cab('Registro de actividad', 'Quién cambió qué y cuándo. Se muestran los últimos 150 movimientos.', esAdmin() ? btn('purgar', 'Borrar registros de más de 90 días', '', 'ghost') : '') +
    (S.d.auditoria.length ? `<div class="rows">${S.d.auditoria.map(a => `<div class="row"><div class="main"><div class="t">${esc(a.accion)}</div><div class="m"><span>${esc(a.detalle)}</span></div></div><div class="side"><span class="m">${esc(nombreDe(a.uid))} · ${fHora(a.ts)}</span></div></div>`).join('')}</div>` : vacio('Sin actividad todavía', 'Cada cambio quedará anotado aquí.'));
}
A.purgar = () => preguntar('Borrar registros antiguos', 'Se eliminan los registros de actividad con más de 90 días.', 'Borrar', () => hacer(async () => {
  const sn = await col('auditoria').where('ts', '<', Date.now() - 90 * 864e5).limit(500).get();
  for (const d of sn.docs) await col('auditoria').doc(d.id).delete();
  toast(`${sn.size} registros borrados.`);
}, null));
