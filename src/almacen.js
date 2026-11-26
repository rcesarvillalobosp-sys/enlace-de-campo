/* ---------- almacenamiento local del navegador ----------
   Datos: localStorage (JSON por colección). Archivos adjuntos: IndexedDB.
   Expone la misma interfaz que usa la aplicación (colecciones, usuario, archivos y descargas),
   de modo que puede sustituirse por un servidor propio sin tocar el resto del código. */
window.EnlaceLocal = (() => {
'use strict';
const KEY = 'enlace-de-campo/datos/v1';
const EJEMPLO = {"asignaciones":{"as1":{"plantillaId":"pl-fibra","plantillaNombre":"Empalme de fibra y medición","zonaId":"zona-norte","sitio":"Cierre CAY-014","vence":"2026-11-02","nota":"Reprocesar el hilo 1 si supera 0.1 dB.","ts":1793829006639,"ejemplo":true},"as2":{"plantillaId":"pl-torre","plantillaNombre":"Mantenimiento preventivo de torre","zonaId":"zona-sur","sitio":"Torre SOC-03","vence":"2026-11-06","nota":"","ts":1793829006639,"ejemplo":true},"as3":{"plantillaId":"pl-sitio","plantillaNombre":"Revisión de sitio: energía y climatización","zonaId":"zona-norte","sitio":"Nodo CAY-01","vence":"2026-11-12","nota":"","ts":1793829006639,"ejemplo":true}},"ejecuciones":{"e1":{"plantillaId":"pl-ont","plantillaNombre":"Instalación de ONT en cliente","items":[{"texto":"Verificar identidad y acceso del cliente","critico":true,"id":"i0"},{"texto":"Ubicar la ONT lejos de fuentes de calor y humedad","critico":false,"id":"i1"},{"texto":"Limpiar conectores SC/APC antes de conectar","critico":false,"id":"i2"},{"texto":"Potencia óptica recibida en ONT","critico":true,"unidad":"dBm","min":-27,"max":-8,"manualId":"m-ont","id":"i3"},{"texto":"Prueba de velocidad contratada","critico":false,"id":"i4"},{"texto":"Explicar al cliente el uso del equipo","critico":false,"id":"i5"}],"resp":{"i0":{"ok":true},"i1":{"ok":true},"i2":{"ok":true},"i3":{"valor":-19.4,"raw":"-19.4"},"i4":{"ok":true},"i5":{"ok":true}},"zonaId":"zona-sur","sitio":"Cliente · Av. Socabaya 214","asignacionId":"","uid":null,"firma":"Mirtha Huanca Apaza","nota":"","ts":1793656206639,"estado":"completo","sinResponder":0,"ejemplo":true},"e2":{"plantillaId":"pl-fibra","plantillaNombre":"Empalme de fibra y medición","items":[{"texto":"Limpieza y cortes de fibra","critico":false,"id":"i0"},{"texto":"Hilo 1 · Azul · pérdida de empalme","critico":true,"unidad":"dB","min":null,"max":0.1,"id":"i1"},{"texto":"Hilo 2 · Naranja · pérdida de empalme","critico":false,"unidad":"dB","min":null,"max":0.1,"id":"i2"},{"texto":"Hilo 3 · Verde · pérdida de empalme","critico":false,"unidad":"dB","min":null,"max":0.1,"id":"i3"},{"texto":"Hilo 4 · Marrón · pérdida de empalme","critico":false,"unidad":"dB","min":null,"max":0.1,"id":"i4"},{"texto":"Sellado y fijación del cierre de empalme","critico":false,"id":"i5"},{"texto":"Medición OTDR registrada","critico":false,"unidad":"m","min":0,"max":null,"id":"i6"}],"resp":{"i0":{"ok":true},"i1":{"valor":0.18,"raw":"0.18","nota":"Se reprocesó el empalme dos veces; queda en 0.18 dB."},"i2":{"valor":0.06,"raw":"0.06"},"i3":{"valor":0.07,"raw":"0.07"},"i4":{"valor":0.05,"raw":"0.05"},"i5":{"ok":true},"i6":{"valor":4210,"raw":"4210"}},"zonaId":"zona-norte","sitio":"Cierre CAY-009","asignacionId":"","uid":null,"firma":"Jorge Salas Pinto","nota":"","ts":1793397006639,"estado":"observaciones","sinResponder":0,"ejemplo":true}},"inventario":{"inv00":{"nombre":"Fibra óptica monomodo G.652D 24 hilos","categoria":"Fibra y cable","codigo":"FO24-0001","cantidad":3200,"unidad":"m","estado":"nuevo","zonaId":"almacen","responsable":"","minimo":1000,"ejemplo":true},"inv01":{"nombre":"Fibra óptica monomodo G.652D 24 hilos","categoria":"Fibra y cable","codigo":"FO24-0001","cantidad":420,"unidad":"m","estado":"en uso","zonaId":"zona-norte","responsable":"","minimo":500,"ejemplo":true},"inv02":{"nombre":"Cierre de empalme tipo domo 24F","categoria":"Fibra y cable","codigo":"","cantidad":14,"unidad":"u","estado":"nuevo","zonaId":"almacen","responsable":"","minimo":6,"ejemplo":true},"inv03":{"nombre":"ONT GPON doble banda","categoria":"Equipos activos","codigo":"","cantidad":38,"unidad":"u","estado":"nuevo","zonaId":"almacen","responsable":"","minimo":15,"ejemplo":true},"inv04":{"nombre":"ONT GPON doble banda","categoria":"Equipos activos","codigo":"","cantidad":4,"unidad":"u","estado":"nuevo","zonaId":"zona-sur","responsable":"","minimo":6,"ejemplo":true},"inv05":{"nombre":"Conector SC/APC de campo","categoria":"Conectividad","codigo":"","cantidad":400,"unidad":"u","estado":"nuevo","zonaId":"almacen","responsable":"","minimo":100,"ejemplo":true},"inv06":{"nombre":"Patchcord SC/APC a SC/APC 3 m","categoria":"Conectividad","codigo":"","cantidad":60,"unidad":"u","estado":"nuevo","zonaId":"zona-norte","responsable":"","minimo":20,"ejemplo":true},"inv07":{"nombre":"Antena sectorial 65° 17 dBi","categoria":"Antenas y radio","codigo":"ANT-6517-22","cantidad":2,"unidad":"u","estado":"nuevo","zonaId":"almacen","responsable":"","minimo":1,"ejemplo":true},"inv08":{"nombre":"Radioenlace 5 GHz punto a punto","categoria":"Antenas y radio","codigo":"RE5-0088","cantidad":1,"unidad":"u","estado":"en uso","zonaId":"zona-sur","responsable":"","minimo":0,"ejemplo":true},"inv09":{"nombre":"Cable coaxial 7/8 pulgada","categoria":"Antenas y radio","codigo":"","cantidad":150,"unidad":"m","estado":"nuevo","zonaId":"almacen","responsable":"","minimo":50,"ejemplo":true},"inv10":{"nombre":"Batería 12 V 150 Ah","categoria":"Energía","codigo":"","cantidad":0,"unidad":"u","estado":"nuevo","zonaId":"zona-norte","responsable":"","minimo":2,"ejemplo":true},"inv11":{"nombre":"Rectificador 48 V 30 A","categoria":"Energía","codigo":"RT48-0412","cantidad":1,"unidad":"u","estado":"en reparación","zonaId":"zona-sur","responsable":"","minimo":0,"ejemplo":true},"inv12":{"nombre":"Medidor de potencia óptica","categoria":"Instrumentos y herramientas","codigo":"OPM-3391","cantidad":3,"unidad":"u","estado":"en uso","zonaId":"zona-norte","responsable":"","minimo":1,"ejemplo":true},"inv13":{"nombre":"OTDR portátil","categoria":"Instrumentos y herramientas","codigo":"OTDR-1207","cantidad":1,"unidad":"u","estado":"en uso","zonaId":"zona-norte","responsable":"","minimo":0,"ejemplo":true},"inv14":{"nombre":"Arnés y línea de vida","categoria":"EPP y seguridad","codigo":"","cantidad":9,"unidad":"u","estado":"en uso","zonaId":"zona-sur","responsable":"","minimo":4,"ejemplo":true}},"manuales":{"m-altura":{"titulo":"Emergencias: trabajo en altura y rescate","categoria":"Emergencias","version":"3.0","fecha":"2026-10-01","obligatorio":true,"notas":"Lectura obligatoria antes de subir a cualquier torre.","asset":null,"historial":[],"ejemplo":true},"m-ont":{"titulo":"Instalación de ONT en cliente residencial","categoria":"Instalación","version":"2.1","fecha":"2026-08-12","obligatorio":false,"notas":"Pasos de instalación, ubicación del equipo y pruebas de potencia.","asset":null,"historial":[{"version":"2.0","fecha":"2026-02-03","asset":null}],"ejemplo":true},"m-torre":{"titulo":"Mantenimiento preventivo de torre y balizaje","categoria":"Torres","version":"1.4","fecha":"2026-06-20","obligatorio":false,"notas":"Inspección de estructura, puesta a tierra y luces de obstáculo.","asset":null,"historial":[],"ejemplo":true}},"personal":{"p0":{"nombre":"Luis Quispe Mamani","cargo":"Técnico de planta externa","zonaId":"zona-norte","telefono":"951000000","ingreso":"2018-01-15","certs":[{"nombre":"Trabajo en altura","vence":"2026-11-20"},{"nombre":"Seguridad eléctrica","vence":"2027-04-10"}],"equipos":["OTDR","Arnés y línea de vida"],"turnos":["M","M","M","M","M","L","L"],"uid":null,"ejemplo":true},"p1":{"nombre":"Rosa Condori Huamán","cargo":"Supervisora de zona","zonaId":"zona-norte","telefono":"951000173","ingreso":"2019-02-15","certs":[{"nombre":"Trabajo en altura","vence":"2027-03-15"},{"nombre":"Primeros auxilios","vence":"2027-01-30"}],"equipos":["Camioneta 4x4","Tablet de campo"],"turnos":["M","M","M","M","M","M","L"],"uid":null,"ejemplo":true},"p2":{"nombre":"Jorge Salas Pinto","cargo":"Técnico de fibra","zonaId":"zona-norte","telefono":"951000346","ingreso":"2020-03-15","certs":[{"nombre":"Fusión de fibra óptica","vence":"2027-06-01"},{"nombre":"Trabajo en altura","vence":"2026-10-15"}],"equipos":["Fusionadora","Medidor de potencia óptica"],"turnos":["T","T","T","T","T","L","L"],"uid":null,"ejemplo":true},"p3":{"nombre":"Ana Paredes Ccori","cargo":"Almacenera","zonaId":"almacen","telefono":"951000519","ingreso":"2021-04-15","certs":[{"nombre":"Primeros auxilios","vence":"2027-02-12"}],"equipos":["Lector de códigos"],"turnos":["M","M","M","M","M","L","L"],"uid":null,"ejemplo":true},"p4":{"nombre":"Carlos Villanueva Rojas","cargo":"Técnico de radioenlaces","zonaId":"zona-sur","telefono":"951000692","ingreso":"2022-05-15","certs":[{"nombre":"Trabajo en altura","vence":"2027-05-20"},{"nombre":"Seguridad eléctrica","vence":"2026-12-05"}],"equipos":["Analizador de espectro","Arnés y línea de vida"],"turnos":["M","M","M","T","T","L","L"],"uid":null,"ejemplo":true},"p5":{"nombre":"Mirtha Huanca Apaza","cargo":"Técnica de instalación","zonaId":"zona-sur","telefono":"951000865","ingreso":"2023-06-15","certs":[{"nombre":"Seguridad eléctrica","vence":"2027-08-18"}],"equipos":["Kit de instalación ONT"],"turnos":["T","T","T","T","T","L","L"],"uid":null,"ejemplo":true},"p6":{"nombre":"Diego Cáceres Flores","cargo":"Liniero (trabajo en altura)","zonaId":"zona-sur","telefono":"951001038","ingreso":"2018-07-15","certs":[{"nombre":"Trabajo en altura","vence":"2027-02-01"},{"nombre":"Rescate en altura","vence":"2026-11-25"}],"equipos":["Arnés y línea de vida","Casco con barbiquejo"],"turnos":["N","N","N","N","N","L","L"],"uid":null,"ejemplo":true},"p7":{"nombre":"Elena Ramos Vera","cargo":"Coordinadora de seguridad","zonaId":"zona-norte","telefono":"951001211","ingreso":"2019-08-15","certs":[{"nombre":"Prevención de riesgos","vence":"2027-09-09"}],"equipos":["Detector de gas"],"turnos":["M","M","M","M","M","L","L"],"uid":null,"ejemplo":true}},"plantillas":{"pl-fibra":{"nombre":"Empalme de fibra y medición","tipo":"Mantenimiento preventivo","items":[{"texto":"Limpieza y cortes de fibra","critico":false,"id":"i0"},{"texto":"Hilo 1 · Azul · pérdida de empalme","critico":true,"unidad":"dB","min":null,"max":0.1,"id":"i1"},{"texto":"Hilo 2 · Naranja · pérdida de empalme","critico":false,"unidad":"dB","min":null,"max":0.1,"id":"i2"},{"texto":"Hilo 3 · Verde · pérdida de empalme","critico":false,"unidad":"dB","min":null,"max":0.1,"id":"i3"},{"texto":"Hilo 4 · Marrón · pérdida de empalme","critico":false,"unidad":"dB","min":null,"max":0.1,"id":"i4"},{"texto":"Sellado y fijación del cierre de empalme","critico":false,"id":"i5"},{"texto":"Medición OTDR registrada","critico":false,"unidad":"m","min":0,"max":null,"id":"i6"}],"ejemplo":true},"pl-ont":{"nombre":"Instalación de ONT en cliente","tipo":"Instalación","items":[{"texto":"Verificar identidad y acceso del cliente","critico":true,"id":"i0"},{"texto":"Ubicar la ONT lejos de fuentes de calor y humedad","critico":false,"id":"i1"},{"texto":"Limpiar conectores SC/APC antes de conectar","critico":false,"id":"i2"},{"texto":"Potencia óptica recibida en ONT","critico":true,"unidad":"dBm","min":-27,"max":-8,"manualId":"m-ont","id":"i3"},{"texto":"Prueba de velocidad contratada","critico":false,"id":"i4"},{"texto":"Explicar al cliente el uso del equipo","critico":false,"id":"i5"}],"ejemplo":true},"pl-sitio":{"nombre":"Revisión de sitio: energía y climatización","tipo":"Revisión de sitio","items":[{"texto":"Voltaje del banco de baterías","critico":true,"unidad":"V","min":51,"max":54,"id":"i0"},{"texto":"Temperatura de sala de equipos","critico":false,"unidad":"°C","min":null,"max":32,"id":"i1"},{"texto":"Rectificador sin alarmas","critico":false,"id":"i2"},{"texto":"Aire acondicionado operativo","critico":false,"id":"i3"},{"texto":"Extintor vigente y señalizado","critico":false,"id":"i4"},{"texto":"Cierre de incidencia con cliente informado","critico":false,"id":"i5"}],"ejemplo":true},"pl-torre":{"nombre":"Mantenimiento preventivo de torre","tipo":"Inspección de torre","items":[{"texto":"Revisar línea de vida y puntos de anclaje","critico":true,"manualId":"m-altura","id":"i0"},{"texto":"Verticalidad de la estructura","critico":false,"id":"i1"},{"texto":"Luz de obstáculo (balizaje) operativa","critico":true,"manualId":"m-torre","id":"i2"},{"texto":"Resistencia de puesta a tierra","critico":false,"unidad":"Ω","min":null,"max":5,"id":"i3"},{"texto":"Torque de pernos en base y empalmes","critico":false,"id":"i4"},{"texto":"Estado de pintura naranja y blanca","critico":false,"id":"i5"},{"texto":"ROE (relación de onda estacionaria) en línea de antena","critico":false,"id":"i6"}],"ejemplo":true}},"zonas":{"almacen":{"nombre":"Almacén Central","tipo":"Almacén","orden":2,"ejemplo":true},"zona-norte":{"nombre":"Zona Norte · Cayma","tipo":"Zona","orden":0,"ejemplo":true},"zona-sur":{"nombre":"Zona Sur · Socabaya","tipo":"Zona","orden":1,"ejemplo":true}}};
const copia = v => JSON.parse(JSON.stringify(v));
const nuevoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
let datos = null, disponible = true;
try { datos = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (_) { datos = null; }
try { if (!datos) { datos = copia(EJEMPLO); localStorage.setItem(KEY, JSON.stringify(datos)); } }
catch (_) { disponible = false; datos = datos || copia(EJEMPLO); }
const subs = new Set();
const persistir = () => {
  try { localStorage.setItem(KEY, JSON.stringify(datos)); }
  catch (e) { const er = new Error('Sin espacio en el almacenamiento del navegador'); er.code = 'quota_or_state'; throw er; }
};
const avisar = () => subs.forEach(f => f());
window.addEventListener('storage', e => { if (e.key === KEY) { try { datos = JSON.parse(e.newValue || '{}'); avisar(); } catch (_) {} } });

const comparar = (a, op, b) => op === '==' ? a === b : op === '!=' ? a !== b : op === '<' ? a < b : op === '<=' ? a <= b : op === '>' ? a > b : op === '>=' ? a >= b : false;
function consulta(nombre, filtros = [], orden = null, limite = null) {
  const docs = () => {
    let arr = Object.entries(datos[nombre] || {});
    arr = arr.filter(([, d]) => filtros.every(([k, op, v]) => comparar(d[k], op, v)));
    if (orden) { const [k, dir] = orden, s = dir === 'desc' ? -1 : 1; arr.sort((x, y) => (x[1][k] > y[1][k] ? 1 : x[1][k] < y[1][k] ? -1 : 0) * s); }
    if (limite != null) arr = arr.slice(0, limite);
    return arr.map(([id, d]) => ({ id, data: () => copia(d) }));
  };
  const ref = id => {
    id = id || nuevoId();
    return {
      id,
      async get() { const d = (datos[nombre] || {})[id]; return { id, exists: !!d, data: () => d ? copia(d) : undefined }; },
      async set(v) { (datos[nombre] = datos[nombre] || {})[id] = copia(v); persistir(); avisar(); },
      async update(p) {
        const d = (datos[nombre] || {})[id];
        if (!d) { const er = new Error('El registro no existe'); er.code = 'not_found'; throw er; }
        Object.assign(d, copia(p)); persistir(); avisar();
      },
      async delete() { if (datos[nombre]) delete datos[nombre][id]; persistir(); avisar(); }
    };
  };
  return {
    where: (k, op, v) => consulta(nombre, [...filtros, [k, op, v]], orden, limite),
    orderBy: (k, dir = 'asc') => consulta(nombre, filtros, [k, dir], limite),
    limit: n => consulta(nombre, filtros, orden, n),
    doc: ref,
    async add(v) { const r = ref(); await r.set(v); return r; },
    async get() { return { docs: docs() }; },
    onSnapshot(cb, err) {
      const f = () => { try { cb({ docs: docs(), metadata: { fromCache: false } }); } catch (e) { if (err) err(e); } };
      subs.add(f); setTimeout(f, 0); return () => subs.delete(f);
    }
  };
}
const db = { collection: n => consulta(n) };

/* Usuario local: quien abre la aplicación en este navegador administra sus propios datos. */
const YO = { id: 'local', name: 'Usuario local' };
const user = {
  async me() { return YO; }, async isOwner() { return true; }, async canEdit() { return true; }, async can() { return true; },
  async profiles(ids) { const o = {}; ids.forEach(i => { o[i] = { name: i === YO.id ? YO.name : '' }; }); return o; }
};

/* Archivos adjuntos (manuales y fotos) en IndexedDB */
const urls = new Map();
const abrir = () => new Promise((res, rej) => {
  if (!window.indexedDB) return rej(new Error('IndexedDB no disponible'));
  const r = indexedDB.open('enlace-de-campo', 1);
  r.onupgradeneeded = () => r.result.createObjectStore('archivos');
  r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
});
const idb = abrir();
const precarga = idb.then(base => new Promise(res => {
  const req = base.transaction('archivos').objectStore('archivos').openCursor();
  req.onsuccess = () => { const c = req.result; if (c) { urls.set(c.key, URL.createObjectURL(c.value)); c.continue(); } else res(); };
  req.onerror = () => res();
}));
const assets = {
  async upload(file, opt = {}) {
    if (file.size > 20 * 1024 * 1024) { const er = new Error('Archivo demasiado grande'); er.code = 'too_large'; throw er; }
    const tipo = opt.type || file.type || 'application/octet-stream';
    const blob = new Blob([file], { type: tipo }), id = nuevoId(), base = await idb;
    await new Promise((res, rej) => {
      const tx = base.transaction('archivos', 'readwrite'); tx.objectStore('archivos').put(blob, id);
      tx.oncomplete = res; tx.onerror = () => { const er = new Error('Sin espacio'); er.code = 'quota_or_state'; rej(er); };
    });
    urls.set(id, URL.createObjectURL(blob));
    return { id, contentType: tipo, sizeBytes: blob.size };
  }
};

/* Descargas (CSV, informes) */
const downloads = {
  async save({ filename, data }) {
    const blob = data instanceof Blob ? data : new Blob([data], { type: /\.csv$/i.test(filename) ? 'text/csv;charset=utf-8' : /\.html?$/i.test(filename) ? 'text/html;charset=utf-8' : 'application/octet-stream' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
};

const servicios = {
  db: async () => { if (!disponible) throw new Error('Almacenamiento no disponible'); return db; },
  user: async () => user,
  assets: async () => { await precarga; return assets; },
  downloads: async () => downloads
};
return {
  use: n => servicios[n] ? servicios[n]() : Promise.reject(new Error('Servicio desconocido')),
  url: id => urls.get(id) || '',
  restablecer() { localStorage.removeItem(KEY); location.reload(); }
};
})();
