import { cargarComponentesModulares } from './utils/include.js';
import { actualizarBotonHeader, obtenerUsuarioActual } from './auth.js';
import { obtenerReportes, textoSeguro, imagenSegura } from './reportes.js';
import { actualizarApoyos } from './apoyos-ui.js';
import { destinoVolverDetalle } from './retorno-login.js';
import { obtenerSeguimiento } from './seguimiento-incidencias.js';

let mapaDetalle;
let reporteActual;

function actualizarVisibilidadApoyo() {
  const tarjeta = document.querySelector('.tarjetaApoyoDetalle');
  if (!tarjeta) return;
  const usuario = obtenerUsuarioActual();
  tarjeta.hidden = Boolean(usuario && reporteActual?.usuarioId === usuario.id);
}
const categorias = { bache: ['Bache', 'car'], luminaria: ['Luminaria', 'lightbulb-o'], arbolado: ['Arbolado', 'tree'], transito: ['Tránsito', 'road'] };
const estados = { reportado: 'Reportado', en_proceso: 'En proceso', finalizado: 'Finalizado' };

function ampliarFotografia(fuente, descripcion) {
  let visor = document.getElementById('visorFotoDetalle');
  if (!visor) {
    visor = document.createElement('dialog');
    visor.id = 'visorFotoDetalle';
    visor.className = 'visorFotoDetalle';
    visor.setAttribute('aria-label', 'Fotografía ampliada del reporte');
    visor.innerHTML = '<button type="button" class="cerrarVisorFoto" aria-label="Cerrar fotografía">×</button><img>';
    document.body.append(visor);
    visor.querySelector('button').addEventListener('click', () => visor.close());
    visor.addEventListener('click', evento => {
      const rect = visor.getBoundingClientRect();
      if (evento.target === visor && (evento.clientX < rect.left || evento.clientX > rect.right || evento.clientY < rect.top || evento.clientY > rect.bottom)) visor.close();
    });
  }
  const imagen = visor.querySelector('img');
  imagen.src = fuente;
  imagen.alt = descripcion;
  if (!visor.open) visor.showModal();
}

function cargarMapa(reporte) {
  const contenedor = document.getElementById('mapaDetalle');
  const lat = Number(reporte.lat), lng = Number(reporte.lng);
  if (!window.L || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    contenedor.textContent = 'No se pudo mostrar el mapa de esta incidencia.';
    return;
  }
  mapaDetalle = L.map(contenedor, { scrollWheelZoom: false }).setView([lat, lng], 16);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 19
  }).addTo(mapaDetalle);
  const ubicacion = document.createElement('span');
  ubicacion.textContent = reporte.direccion || 'Ubicación del reporte';
  L.marker([lat, lng]).addTo(mapaDetalle).bindPopup(ubicacion);
}

function cargarDetalleReporte() {
  if (mapaDetalle) { mapaDetalle.remove(); mapaDetalle = null; }
  const contenedor = document.getElementById('contenedorDetalle');
  const id = new URLSearchParams(window.location.search).get('id');
  const reporte = obtenerReportes().find(item => String(item.id) === id);
  reporteActual = reporte;
  if (!reporte) {
    contenedor.innerHTML = '<section class="tarjetaDetallePrincipal"><h2>Reporte no encontrado</h2><p>El reporte solicitado no existe o fue removido.</p></section>';
    return;
  }
  const [categoria, icono] = categorias[reporte.categoria] || ['Incidencia', 'map-marker'];
  const estado = Object.hasOwn(estados, reporte.estado) ? reporte.estado : 'reportado';
  const seguimiento = obtenerSeguimiento(reporte);
  document.title = `${reporte.titulo} - Reporte Urbano`;
  contenedor.innerHTML = `
    <div class="grillaDetalleContenido">
      <div class="columnaPrincipalDetalle">
      <article class="tarjetaDetallePrincipal">
        <header class="cabeceraDetalle"><span class="iconoCategoriaDetalle"><i class="fa fa-${icono}" aria-hidden="true"></i></span>
          <div class="tituloEtiquetasDetalle"><h2 class="tituloDetalle">${textoSeguro(reporte.titulo)}</h2><div class="etiquetasDetalle"><span class="badgeCategoria">${categoria}</span><span class="badgeEstado estado-${estado}">${estados[estado]}</span></div></div>
        </header>
        <div class="metadatosDetalle"><p><i class="fa fa-map-marker" aria-hidden="true"></i> ${textoSeguro(reporte.direccion || 'Sin dirección ingresada')}</p><p><i class="fa fa-calendar" aria-hidden="true"></i> ${textoSeguro(reporte.fecha || 'Sin fecha')}</p></div>
        ${reporte.numeroSeguimiento ? `<p class="numeroSeguimientoDetalle">Número de seguimiento: <strong>${textoSeguro(reporte.numeroSeguimiento)}</strong></p>` : ''}
        <section class="seccionInfoDetalle"><h3>Descripción</h3><p class="descripcionDetalle">${textoSeguro(reporte.descripcion)}</p></section>
        <section class="seccionInfoDetalle"><h3>Fotografías</h3><div id="fotografiasDetalle" class="fotografiasDetalle"></div></section>
      </article>
      <section class="tarjetaSeguimientoDetalle" aria-labelledby="tituloSeguimiento">
        <header class="cabeceraSeguimiento"><i class="fa fa-clone" aria-hidden="true"></i><div><h2 id="tituloSeguimiento">Seguimiento de la incidencia</h2><p>Historial de actualizaciones del reporte</p></div></header>
        <ol class="lineaTiempoDetalle">${seguimiento.map(actualizacion => `
          <li class="etapaSeguimiento etapa-${actualizacion.etapa}">
            <span class="iconoEtapa"><i class="fa fa-${actualizacion.icono}" aria-hidden="true"></i></span>
            <div class="contenidoEtapa"><div class="tituloFechaEtapa"><h3>${actualizacion.titulo}</h3><time datetime="${actualizacion.fecha}">${actualizacion.fecha.split('-').reverse().join('/')}</time></div><p>${textoSeguro(actualizacion.descripcion)}</p></div>
          </li>`).join('')}</ol>
        ${seguimiento.length ? '' : '<p class="sinSeguimiento">No hay actualizaciones disponibles para este reporte.</p>'}
      </section>
      </div>
      <aside class="columnaDetalle" aria-label="Ubicación y apoyos">
        <section class="tarjetaMapaDetalle"><h2 class="tituloMapaDetalle"><i class="fa fa-map-marker" aria-hidden="true"></i> Ubicación del reporte</h2><div id="mapaDetalle" aria-label="Mapa de la incidencia"></div><p class="direccionMapaDetalle"><i class="fa fa-map-marker" aria-hidden="true"></i> ${textoSeguro(reporte.direccion || 'Ubicación seleccionada')}, Ituzaingó</p></section>
        <section class="tarjetaApoyoDetalle" aria-label="Apoyar esta incidencia">
          <button type="button" class="botonAfectado botonApoyoDetalle" data-apoyo-id="${textoSeguro(reporte.id)}" aria-pressed="false"><i class="fa fa-thumbs-o-up" aria-hidden="true"></i><span data-etiqueta-apoyo>A mí también me afecta</span><span data-total-apoyos aria-label="Cantidad de apoyos">0</span></button>
          <p data-error-apoyo role="status"></p>
        </section>
      </aside>
    </div>`;
  const fotos = Array.isArray(reporte.fotografias) ? reporte.fotografias : Array.isArray(reporte.imagenes) ? reporte.imagenes : [reporte.imagen];
  const galeria = document.getElementById('fotografiasDetalle');
  const fuentes = [...new Set(fotos.map(foto => imagenSegura(foto)).filter(Boolean))];
  if (!fuentes.length) galeria.textContent = 'No hay fotografías adjuntas.';
  fuentes.forEach((fuente, indice) => {
    const enlace = document.createElement('a'); enlace.href = fuente; enlace.target = '_blank'; enlace.rel = 'noopener noreferrer';
    enlace.setAttribute('aria-label', `Abrir fotografía ${indice + 1} del reporte`);
    const imagen = document.createElement('img'); imagen.src = fuente; imagen.alt = `Fotografía ${indice + 1}: ${reporte.titulo}`; imagen.loading = 'lazy';
    enlace.addEventListener('click', evento => {
      if (evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return;
      evento.preventDefault();
      ampliarFotografia(fuente, imagen.alt);
    });
    imagen.addEventListener('error', () => { enlace.replaceWith(document.createTextNode('No se pudo cargar esta fotografía.')); }, { once: true });
    enlace.append(imagen); galeria.append(enlace);
  });
  actualizarVisibilidadApoyo();
  cargarMapa(reporte);
  actualizarApoyos();
}

document.addEventListener('DOMContentLoaded', async () => {
  const destino = destinoVolverDetalle();
  const volver = document.querySelector('.botonVolverDinamico');
  volver.href = destino.href;
  volver.innerHTML = `<i class="fa fa-arrow-left" aria-hidden="true"></i> ${destino.texto}`;
  cargarDetalleReporte();
  await cargarComponentesModulares();
  actualizarBotonHeader();
});
window.addEventListener('storage', evento => {
  if (!evento.key || evento.key === 'reportesUsuario') cargarDetalleReporte();
  else if (['reporteUrbanoSesion', 'reporteUrbanoUsuarios'].includes(evento.key)) actualizarVisibilidadApoyo();
});
window.addEventListener('sesionActualizada', actualizarVisibilidadApoyo);
window.addEventListener('pageshow', actualizarVisibilidadApoyo);
