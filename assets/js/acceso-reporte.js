import { obtenerEstadoSesion } from './auth.js';
import { enlaceAccesoConRetorno } from './retorno-login.js';

export function destinoNuevoReporte() {
  return obtenerEstadoSesion() ? '/pages/reporte.html'
    : enlaceAccesoConRetorno('/pages/login.html', '?volver=%2Fpages%2Freporte.html');
}

export function exigirSesionReporte() {
  const contenido = document.querySelector('.nuevoReporte');
  if (!obtenerEstadoSesion()) {
    if (contenido) contenido.hidden = true;
    window.location.replace(destinoNuevoReporte());
    return false;
  }
  if (contenido) contenido.hidden = false;
  return true;
}

export function configurarEnlacesReporte() {
  const actualizar = () => document.querySelectorAll('a[data-nuevo-reporte]').forEach(enlace => {
    enlace.href = destinoNuevoReporte();
  });
  actualizar();
  window.addEventListener('sesionActualizada', actualizar);
  window.addEventListener('storage', actualizar);
  window.addEventListener('pageshow', actualizar);
  document.addEventListener('click', evento => {
    const enlace = evento.target.closest('a[data-nuevo-reporte]');
    if (enlace) enlace.href = destinoNuevoReporte();
  });
}
