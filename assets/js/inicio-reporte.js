import { exigirSesionReporte } from './acceso-reporte.js';

if (exigirSesionReporte()) await import('./reporte.js');

window.addEventListener('sesionActualizada', exigirSesionReporte);
window.addEventListener('pageshow', exigirSesionReporte);
window.addEventListener('storage', evento => {
  if (!evento.key || ['reporteUrbanoSesion', 'reporteUrbanoUsuarios'].includes(evento.key)) exigirSesionReporte();
});
