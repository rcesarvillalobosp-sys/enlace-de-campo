# Enlace de Campo

Aplicación web de **operaciones de campo para empresas de telecomunicaciones**: checklists guiados con
mediciones y rangos de aceptación, manuales de operación versionados, personal con certificaciones y turnos,
e inventario por zonas con movimientos y alertas de stock mínimo. Los datos de ejemplo corresponden a una
empresa ficticia (*Kuntur Telecom*, Arequipa) con trabajos de fibra óptica, ONT/GPON, torres y sitios.

**Demo en línea:** https://rcesarvillalobosp-sys.github.io/enlace-de-campo/

**Documento de presentación:** [docs/Enlace-de-Campo.pdf](docs/Enlace-de-Campo.pdf)

## Funciones

| Módulo | Qué hace |
|---|---|
| Panel | Pendientes, vencidos, stock bajo, certificaciones por vencer y manuales sin leer, por zona |
| Checklists | Plantillas (empalme de fibra y medición, instalación de ONT, mantenimiento de torre, revisión de sitio), asignaciones con fecha límite, ejecución paso a paso con mediciones validadas contra rangos, fotos, firma y revisión del supervisor |
| Manuales | Procedimientos versionados (PDF, imagen, video o texto), lectura obligatoria con registro por versión |
| Personal | Técnicos por zona, certificaciones (trabajo en altura, rescate, seguridad eléctrica) con vencimientos y turnos |
| Inventario | Stock por zona, entradas, salidas y transferencias, mínimos y alertas; exportación CSV |
| Registro | Auditoría de cada acción |

## Contenido

- `index.html`: la aplicación completa en un solo archivo (HTML, CSS y JavaScript, sin dependencias).
- `src/`: la misma aplicación separada en partes (`a.html` estructura y estilos, `almacen.js` almacenamiento,
  `b.js`–`f.js` núcleo, panel y manuales, checklists, inventario y personal, arranque).
- `datos-ejemplo/`: 38 documentos JSON ficticios (zonas, personal, manuales, plantillas, inventario,
  asignaciones y checklists) que se cargan la primera vez.

## Almacenamiento

Los datos se guardan en el navegador del usuario (`localStorage`) y los archivos adjuntos en IndexedDB;
nada se envía a un servidor. La capa `src/almacen.js` expone una interfaz de colecciones
(`collection().doc().set/update/delete`, `where`, `orderBy`, `onSnapshot`), de modo que puede sustituirse
por una API propia (una tabla por colección: `zonas`, `personal`, `manuales`, `plantillas`, `asignaciones`,
`ejecuciones`, `inventario`, `movimientos`, `lecturas`, `auditoria`) sin modificar el resto del código.

## Límites conocidos

- Al guardar en el navegador, los datos pertenecen a ese equipo; para un equipo de trabajo compartido se
  requiere un servidor.
- Los manuales se suben como PDF, imagen, MP4/WebM o texto (no Word).
- El informe de un checklist se descarga como HTML (se imprime a PDF desde el navegador).

---

Autor: **Ricardo Villalobos Perez** · Ingeniería de Telecomunicaciones
