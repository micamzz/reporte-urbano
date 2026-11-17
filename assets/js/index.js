import { actualizarApoyos, resumenApoyos } from './apoyos-ui.js';
import { configurarEnlacesReporte } from './acceso-reporte.js';

configurarEnlacesReporte();
import { obtenerReportes, textoSeguro, imagenSegura } from './reportes.js';
import { cargarComponentesModulares } from './utils/include.js';
import { actualizarBotonHeader } from './auth.js';

let mapaPrevisualizacion;
let capaReportesInicio;
let carruselReportesConfigurado = false;

function crearPinNativo(colorHex) {
  const svgHtml = `
    <svg class="pinSvgGota" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24c0-6.627-5.373-12-12-12z" fill="${colorHex}" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="4.5" fill="#ffffff"/>
    </svg>
  `;

  return L.divIcon({
    className: 'contenedorPinNativo',
    html: svgHtml,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  });
}

function inicializarMapaCompacto() {
  const elementoMap = document.getElementById('mapaPrevisualizacion');
  if (!elementoMap || !window.L) return;

  mapaPrevisualizacion = L.map('mapaPrevisualizacion', {
    scrollWheelZoom: false
  }).setView([-34.658, -58.670], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap - Municipio de Ituzaingó'
  }).addTo(mapaPrevisualizacion);

  capaReportesInicio = L.layerGroup().addTo(mapaPrevisualizacion);
  renderizarMarcadoresInicio();
}

function renderizarMarcadoresInicio() {
  if (!capaReportesInicio) return;
  capaReportesInicio.clearLayers();
  obtenerReportes().forEach(reporte => {
    let colorPin = '#ef4444';
    let textoEstado = 'Reportado';

    if (reporte.estado === 'en_proceso') {
      colorPin = '#f59e0b';
      textoEstado = 'En Proceso';
    } else if (reporte.estado === 'finalizado') {
      colorPin = '#10b981';
      textoEstado = 'Finalizado';
    }

    const icono = crearPinNativo(colorPin);
    const marcador = L.marker([reporte.lat, reporte.lng], { icon: icono }).addTo(capaReportesInicio);

    marcador.bindPopup(`
      <div style="font-family: Montserrat, sans-serif; padding: 4px;">
        <span style="
          background-color: ${colorPin}; 
          color: white; 
          font-size: 10px; 
          font-weight: bold; 
          padding: 2px 6px; 
          border-radius: 4px; 
          text-transform: uppercase;">
          ${textoEstado}
        </span>
        <h4 style="color: #007bbf; margin: 6px 0 2px 0; font-size: 13px;">${textoSeguro(reporte.titulo)}</h4>
        <small style="color: #555555; font-size: 11px;">📍 ${textoSeguro(reporte.direccion)}</small>
        <br>
        <a href="/pages/detalle-incidencia.html?id=${encodeURIComponent(reporte.id)}&origen=inicio" style="color: #007bbf; font-size: 11px; font-weight: bold; text-decoration: none; display: inline-block; margin-top: 4px;">Ver detalle →</a>
      </div>
    `);
  });
}

// CONVERTIR STRING "DD/MM/YYYY" A OBJETO DATE PARA PODER ORDENAR
function parsearFecha(stringFecha) {
  if (typeof stringFecha !== 'string') return new Date(0);
  const partes = stringFecha.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!partes) return new Date(0);
  return new Date(Number(partes[3]), Number(partes[2]) - 1, Number(partes[1]));
}

function obtenerFechaReporte(reporte) {
  const fechaCreacion = Date.parse(reporte.creadoEn);
  if (Number.isFinite(fechaCreacion)) return fechaCreacion;
  return parsearFecha(reporte.fecha).getTime();
}

function renderizarReportesRecientes() {
  const contenedorTarjetas = document.getElementById('contenedorTarjetasRecientes');
  if (!contenedorTarjetas) return;

  contenedorTarjetas.innerHTML = '';

  const ordenadosPorFecha = obtenerReportes().sort((a, b) => obtenerFechaReporte(b) - obtenerFechaReporte(a));

  ordenadosPorFecha.forEach(reporte => {
    let colorBadge = '#ef4444';
    let textoEstado = 'Reportado';

    if (reporte.estado === 'en_proceso') {
      colorBadge = '#f59e0b';
      textoEstado = 'En Proceso';
    } else if (reporte.estado === 'finalizado') {
      colorBadge = '#10b981';
      textoEstado = 'Finalizado';
    }

    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjetaReporteReciente';
    
    // Al hacer clic en cualquier parte de la tarjeta, te redirige al detalle del reporte
    tarjeta.addEventListener('click', evento => {
      if (evento.target instanceof Element && !evento.target.closest('button, a')) {
        window.location.href = `/pages/detalle-incidencia.html?id=${encodeURIComponent(reporte.id)}&origen=inicio`;
      }
    });

    tarjeta.innerHTML = `
      <div>
        <div class="cabeceraTarjetaReporte">
          <span class="badgeEstado" style="background-color: ${colorBadge};">${textoEstado}</span>
          <span class="badgeCategoria">${textoSeguro(reporte.categoria)}</span>
        </div>
        <h3 class="tituloTarjetaReporte">${textoSeguro(reporte.titulo)}</h3>
        <p class="direccionTarjetaReporte">📍 ${textoSeguro(reporte.direccion)}</p>
        <span class="fechaTarjetaReporte"> ${textoSeguro(reporte.fecha)}</span>
      </div>
      <div class="contenedorAccionesTarjeta">
        <span class="enlaceVerMasDetalle">Ver detalle completo </span>
        ${reporte.estado === 'finalizado' ? resumenApoyos(reporte) : `<button type="button" class="botonAfectado" data-apoyo-id="${textoSeguro(reporte.id)}" aria-pressed="false">
          <i class="fa fa-thumbs-o-up" aria-hidden="true"></i> <span data-etiqueta-apoyo>A mí también me afecta</span> (<span data-total-apoyos>0</span>)
        </button>`}<p data-error-apoyo role="status"></p>
      </div>
    `;
    
    contenedorTarjetas.appendChild(tarjeta);
  });

  const viewport = document.getElementById('ventanaReportesRecientes');
  if (viewport) viewport.scrollLeft = 0;
  actualizarControlesReportes();
  actualizarApoyos();
}

function actualizarControlesReportes() {
  const viewport = document.getElementById('ventanaReportesRecientes');
  const tarjetas = [...document.querySelectorAll('#contenedorTarjetasRecientes .tarjetaReporteReciente')];
  const contador = document.getElementById('contadorReportesRecientes');
  const anterior = document.getElementById('reporteAnterior');
  const siguiente = document.getElementById('reporteSiguiente');

  if (!viewport || !contador || !anterior || !siguiente) return;

  const limitesViewport = viewport.getBoundingClientRect();
  const visibles = tarjetas
    .map((tarjeta, indice) => ({ indice, limites: tarjeta.getBoundingClientRect() }))
    .filter(({ limites }) => limites.right > limitesViewport.left + 1 && limites.left < limitesViewport.right - 1);

  if (!visibles.length) {
    contador.textContent = 'Sin reportes';
    anterior.disabled = true;
    siguiente.disabled = true;
    return;
  }

  contador.textContent = `${visibles[0].indice + 1}–${visibles[visibles.length - 1].indice + 1} de ${tarjetas.length}`;
  anterior.disabled = viewport.scrollLeft <= 1;
  siguiente.disabled = viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 1;
}

function configurarCarruselReportes() {
  if (carruselReportesConfigurado) return;

  const viewport = document.getElementById('ventanaReportesRecientes');
  const anterior = document.getElementById('reporteAnterior');
  const siguiente = document.getElementById('reporteSiguiente');
  if (!viewport || !anterior || !siguiente) return;

  const desplazar = direccion => {
    viewport.scrollBy({ left: direccion * viewport.clientWidth, behavior: 'smooth' });
  };

  anterior.addEventListener('click', () => desplazar(-1));
  siguiente.addEventListener('click', () => desplazar(1));
  viewport.addEventListener('scroll', actualizarControlesReportes, { passive: true });
  window.addEventListener('resize', actualizarControlesReportes);
  carruselReportesConfigurado = true;
  actualizarControlesReportes();
}

document.addEventListener('DOMContentLoaded', async () => {
  await cargarComponentesModulares();
  actualizarBotonHeader();
  inicializarMapaCompacto();
  renderizarReportesRecientes();
  configurarCarruselReportes();

  const btnNuevoReporte = document.getElementById('btnNuevoReporteIndex');
  if (btnNuevoReporte) {
    btnNuevoReporte.addEventListener('click', () => {
      alert('Iniciando el proceso para crear un nuevo reporte en Ituzaingó.');
    });
  }
});
window.addEventListener('storage', evento => {
  if (!evento.key || evento.key === 'reportesUsuario') actualizarReportesInicio();
});
function actualizarReportesInicio() {
  renderizarReportesRecientes();
  renderizarMarcadoresInicio();
}
window.addEventListener('reportesActualizados', actualizarReportesInicio);
window.addEventListener('pageshow', actualizarReportesInicio);
