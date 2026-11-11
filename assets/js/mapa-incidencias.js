import { obtenerReportes, textoSeguro, imagenSegura } from './reportes.js';
import { configurarEnlacesReporte } from './acceso-reporte.js';

configurarEnlacesReporte();
import { cargarComponentesModulares } from './utils/include.js';
import { actualizarBotonHeader } from './auth.js';

const imagenDefault = 'https://via.placeholder.com/300x200?text=Sin+Imagen+Cargada';

let mapa;
let capaMarcadores;

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

function inicializarMapaGrande() {
  const el = document.getElementById('mapaPantallaCompleta');
  if (!el || !window.L) return;

  const limitesItuzaingo = L.latLngBounds(
    L.latLng(-34.7000, -58.7300),
    L.latLng(-34.6100, -58.6200)
  );

  mapa = L.map('mapaPantallaCompleta', {
    maxBounds: limitesItuzaingo,
    maxBoundsViscosity: 1.0,
    minZoom: 13,
    maxZoom: 18
  }).setView([-34.658, -58.670], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapa);
  capaMarcadores = L.layerGroup().addTo(mapa);
  renderizarMapaIncidencias('todos');
}

function renderizarMapaIncidencias(categoriaFiltro) {
  if (!capaMarcadores) return;
  capaMarcadores.clearLayers();

  // Integrar reportes creados en localStorage si los hay
  const listaCompleta = obtenerReportes();

  const filtrados = categoriaFiltro === 'todos' 
    ? listaCompleta 
    : listaCompleta.filter(reporte => reporte.categoria === categoriaFiltro);

  const elementoTotal = document.getElementById('totalReportes');
  if (elementoTotal) {
    elementoTotal.innerText = filtrados.length;
  }

  filtrados.forEach(reporte => {
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
    const marcador = L.marker([reporte.lat, reporte.lng], { icon: icono }).addTo(capaMarcadores);

    marcador.bindPopup(`
      <div class="tarjetaPopup">
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
        
        ${imagenSegura(reporte.imagen) ? `<img src="${textoSeguro(imagenSegura(reporte.imagen))}" alt="${textoSeguro(reporte.titulo)}" class="imagenReportePopup" onerror="this.onerror=null;this.src='${imagenDefault}';">` : ''}

        <a href="/pages/detalle-incidencia.html?id=${encodeURIComponent(reporte.id)}&origen=mapa" class="botonVerDetallePopup">
          Ver detalle completo →
        </a>
      </div>
    `);
  });
}

function vincularEventosMapa() {
  const botonesFiltro = document.querySelectorAll('.botonFiltroFlotante');
  botonesFiltro.forEach(boton => {
    boton.addEventListener('click', (e) => {
      botonesFiltro.forEach(b => b.classList.remove('filtroActivo'));
      e.target.classList.add('filtroActivo');
      
      const categoria = e.target.dataset.categoria || 'todos';
      renderizarMapaIncidencias(categoria);
    });
  });

  const btnReportar = document.getElementById('btnNuevoReporteMapa');
  if (btnReportar) {
    btnReportar.addEventListener('click', () => {
      alert('Iniciando proceso para crear un nuevo reporte desde el mapa de incidencias.');
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await cargarComponentesModulares();
  actualizarBotonHeader();
  inicializarMapaGrande();
  vincularEventosMapa();
});

window.addEventListener('storage', evento => {
  if (!evento.key || evento.key === 'reportesUsuario') {
    actualizarReportesMapa();
  }
});
function actualizarReportesMapa() {
  const filtro = document.querySelector('.filtroActivo')?.dataset.categoria || 'todos';
  renderizarMapaIncidencias(filtro);
}
window.addEventListener('reportesActualizados', actualizarReportesMapa);
window.addEventListener('pageshow', actualizarReportesMapa);
