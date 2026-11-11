import { cargarComponentesModulares } from './utils/include.js';
import { actualizarBotonHeader, obtenerUsuarioActual } from './auth.js';
import { obtenerReportes, textoSeguro } from './reportes.js';
import { enlaceAccesoConRetorno } from './retorno-login.js';

function actualizarPerfil() {
  const contenido = document.querySelector('.contenidoPerfil');
  const usuario = obtenerUsuarioActual();
  if (!usuario) {
    contenido.hidden = true;
    document.getElementById('reportesPerfil').replaceChildren();
    window.location.replace(enlaceAccesoConRetorno('/pages/login.html', '?volver=%2Fpages%2Fperfil.html'));
    return;
  }
  document.getElementById('nombrePerfil').textContent = usuario.nombre;
  document.getElementById('emailPerfil').textContent = usuario.email;
  const reportes = obtenerReportes().filter(reporte => reporte.usuarioId === usuario.id)
    .sort((a, b) => (Date.parse(b.creadoEn) || 0) - (Date.parse(a.creadoEn) || 0));
  const estados = { reportado: 'Reportado', en_proceso: 'En proceso', finalizado: 'Finalizado' };
  const categorias = { bache: 'Bache', luminaria: 'Luminaria', arbolado: 'Arbolado', transito: 'Tránsito' };
  document.getElementById('reportesPerfil').innerHTML = reportes.length ? reportes.map(reporte => `
    <article class="reportePersonal">
      <h3>${textoSeguro(reporte.titulo)}</h3>
      <p class="metadatosPerfil">${textoSeguro(categorias[reporte.categoria] || reporte.categoria)} · ${textoSeguro(estados[reporte.estado] || reporte.estado)} · ${textoSeguro(reporte.fecha)}</p>
      <p>${textoSeguro(reporte.direccion || 'Ubicación seleccionada en el mapa')}</p>
      ${reporte.numeroSeguimiento ? `<p>Número de seguimiento: <strong>${textoSeguro(reporte.numeroSeguimiento)}</strong></p>` : ''}
      <a href="/pages/detalle-incidencia.html?id=${encodeURIComponent(reporte.id)}&origen=perfil">Ver detalle de la incidencia</a>
    </article>`).join('') : '<p class="vacioPerfil">Todavía no creaste reportes. Podés comenzar con “Reportar un problema”.</p>';
  contenido.hidden = false;
}

actualizarPerfil();
await cargarComponentesModulares();
actualizarBotonHeader();
window.addEventListener('sesionActualizada', actualizarPerfil);
window.addEventListener('pageshow', actualizarPerfil);
window.addEventListener('reportesActualizados', actualizarPerfil);
window.addEventListener('storage', evento => {
  if (!evento.key || ['reporteUrbanoSesion', 'reporteUrbanoUsuarios', 'reportesUsuario'].includes(evento.key)) actualizarPerfil();
});
