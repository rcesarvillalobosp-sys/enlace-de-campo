# Enlace de Campo

Aplicación web de operaciones para una empresa de telecomunicaciones (empresa ficticia: Kuntur Telecom).
Incluye checklists guiados con mediciones y rangos, manuales de operación con versiones, personal con
certificaciones y turnos, e inventario por zonas con movimientos y alertas de stock mínimo.

## Contenido
- `index.html`: la aplicación completa en un solo archivo (HTML, CSS y JavaScript).
- `src/`: la misma aplicación separada en partes (estilos, núcleo, panel y manuales, checklists, inventario y personal, arranque).
- `datos-ejemplo/`: 38 documentos JSON ficticios (zonas, personal, manuales, plantillas, inventario, asignaciones y checklists).

## Importante
La aplicación guarda sus datos con una base de datos de la plataforma de Claude (`window.claude.use("db")`).
Fuera de esa plataforma la página abre, pero muestra "Sin base de datos".
Para usarla con tu propio servidor hay que reemplazar las funciones `col`, `guardar`, `parchar` y `borrar`
(en `src/b.js`) y la suscripción de `src/f.js` por llamadas a tu API. Cada colección corresponde a una tabla:
`zonas`, `personal`, `manuales`, `plantillas`, `asignaciones`, `ejecuciones`, `inventario`, `movimientos`, `lecturas`, `auditoria`.

## Límites conocidos
- Los manuales se suben como PDF, imagen, MP4/WebM o texto (no Word).
- El informe de un checklist se descarga como HTML (se imprime a PDF desde el navegador).
- No funciona sin conexión a internet.
