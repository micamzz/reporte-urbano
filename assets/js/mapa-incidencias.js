import { cargarComponentesModulares } from './utils/include.js';
import { actualizarBotonHeader } from './auth.js';

const imagenDefault = 'https://via.placeholder.com/300x200?text=Sin+Imagen+Cargada';

// LISTA DE 20 REPORTES CON COORDENADAS EXACTAS Y REALES EN ITUZAINGÓ
const listaReportes = [
  // 🔴 REPORTADOS (6 casos)
  { id: 1, categoria: 'bache', estado: 'reportado', titulo: 'Bache profundo en calzada', direccion: 'Av. Cnel. Brandsen 1800', lat: -34.6521, lng: -58.6715, imagen: '/public/img/reportes/bache-brandsen.jpg', fecha: '05/11/2026', descripcion: 'Se observa un bache de gran dimensión que dificulta el tránsito vehicular y genera riesgo de daño en los vehículos.', apoyos: 14 },
  { id: 2, categoria: 'luminaria', estado: 'reportado', titulo: 'Luminaria apagada', direccion: 'Muñiz 450', lat: -34.6590, lng: -58.6652, imagen: '/public/img/reportes/luminaria-muniz.jpg', fecha: '04/11/2026', descripcion: 'Luminaria fuera de servicio desde hace tres días. La cuadra queda completamente a oscuras por la noche.', apoyos: 6 },
  { id: 3, categoria: 'arbolado', estado: 'reportado', titulo: 'Rama grande en riesgo de caída', direccion: 'José María Barcala 720', lat: -34.6480, lng: -58.6740, imagen: '/public/img/reportes/arbol-barcala.jpg', fecha: '03/11/2026', descripcion: 'Rama quebrada en la copa del árbol en riesgo de caer sobre la vereda tras la última tormenta.', apoyos: 9 },
  { id: 4, categoria: 'transito', estado: 'reportado', titulo: 'Cartel de señalización dañado', direccion: 'Av. Néstor Kirchner 21000', lat: -34.6540, lng: -58.6830, imagen: '/public/img/reportes/cartel-kirchner.jpg', fecha: '02/11/2026', descripcion: 'Cartel indicador de velocidad máxima inclinado a punto de caerse.', apoyos: 3 },
  { id: 5, categoria: 'bache', estado: 'reportado', titulo: 'Hundimiento de pavimento', direccion: 'Mansilla 850', lat: -34.6612, lng: -58.6685, imagen: '/public/img/reportes/bache-mansilla.jpg', fecha: '01/11/2026', descripcion: 'Hundimiento del asfalto próximo a la rejilla del sumidero.', apoyos: 18 },
  { id: 6, categoria: 'luminaria', estado: 'reportado', titulo: 'Foco intermitente en plaza', direccion: 'Soler y Rondeau', lat: -34.6565, lng: -58.6710, imagen: '/public/img/reportes/luz-soler.jpg', fecha: '01/11/2026', descripcion: 'Foco parpadeante en el sector de juegos infantiles.', apoyos: 5 },

  // 🟡 EN PROCESO (6 casos)
  { id: 7, categoria: 'bache', estado: 'en_proceso', titulo: 'Reparación de bache en curso', direccion: 'Av. Intendente Ratti 1200', lat: -34.6410, lng: -58.6640, imagen: '/public/img/reportes/bache-ratti.jpg', fecha: '28/10/2026', descripcion: 'Trabajos de fresado y nivelación de la carpeta asfáltica.', apoyos: 22 },
  { id: 8, categoria: 'arbolado', estado: 'en_proceso', titulo: 'Poda correctiva programada', direccion: 'Zuilbarchero 520', lat: -34.6350, lng: -58.6750, imagen: '/public/img/reportes/poda-zuilbarchero.jpg', fecha: '29/10/2026', descripcion: 'Cuadrilla de arbolado urbano asignada para despeje de ramas.', apoyos: 8 },
  { id: 9, categoria: 'luminaria', estado: 'en_proceso', titulo: 'Recambio de cableado eléctrico', direccion: 'Olazábal 1100', lat: -34.6635, lng: -58.6620, imagen: '/public/img/reportes/cableado-olazabal.jpg', fecha: '30/10/2026', descripcion: 'Reemplazo de líneas subterráneas para restablecer el servicio.', apoyos: 11 },
  { id: 10, categoria: 'transito', estado: 'en_proceso', titulo: 'Mantenimiento de semáforo', direccion: 'Av. Santa Rosa y Lavalle', lat: -34.6485, lng: -58.6870, imagen: '/public/img/reportes/semaforo-santarosa.jpg', fecha: '25/10/2026', descripcion: 'Recambio de placa controladora del semáforo.', apoyos: 15 },
  { id: 11, categoria: 'bache', estado: 'en_proceso', titulo: 'Nivelación de tapa de inspección', direccion: 'Defilippi 1420', lat: -34.6395, lng: -58.6810, imagen: '/public/img/reportes/tapa-defilippi.jpg', fecha: '26/10/2026', descripcion: 'Cuadrilla trabajando en el sellado del hormigón.', apoyos: 4 },
  { id: 12, categoria: 'arbolado', estado: 'en_proceso', titulo: 'Despeje de luminaria por ramas', direccion: 'Pirán 340', lat: -34.6670, lng: -58.6690, imagen: '/public/img/reportes/ramas-piran.jpg', fecha: '27/10/2026', descripcion: 'Corte de ramas bajas que tapan la iluminación de la calle.', apoyos: 7 },

  // 🟢 FINALIZADOS (8 casos)
  { id: 13, categoria: 'bache', estado: 'finalizado', titulo: 'Asfaltado y sellado completado', direccion: 'Martín Fierro 3100', lat: -34.6290, lng: -58.6920, imagen: '/public/img/reportes/asfalto-fierro.jpg', fecha: '15/10/2026', descripcion: 'Trabajo finalizado con bacheo en caliente y habilitación del carril.', apoyos: 30 },
  { id: 14, categoria: 'luminaria', estado: 'finalizado', titulo: 'Instalación de luminaria LED', direccion: 'Alvear 920', lat: -34.6580, lng: -58.6595, imagen: '/public/img/reportes/led-alvear.jpg', fecha: '18/10/2026', descripcion: 'Se instaló artefacto LED de alta eficiencia energética.', apoyos: 12 },
  { id: 15, categoria: 'arbolado', estado: 'finalizado', titulo: 'Retiro de árbol caído', direccion: 'Juncal 1250', lat: -34.6720, lng: -58.6750, imagen: '/public/img/reportes/arbol-juncal.jpg', fecha: '20/10/2026', descripcion: 'Limpieza total de troncos y despeje de vereda.', apoyos: 19 },
  { id: 16, categoria: 'transito', estado: 'finalizado', titulo: 'Pintura de senda peatonal', direccion: 'Las Heras 400', lat: -34.6555, lng: -58.6640, imagen: '/public/img/reportes/senda-heras.jpg', fecha: '21/10/2026', descripcion: 'Se demarcó la senda peatonal y la línea de frenado.', apoyos: 25 },
  { id: 17, categoria: 'bache', estado: 'finalizado', titulo: 'Bacheo asfáltico finalizado', direccion: 'Av. Ratti y Grecia', lat: -34.6440, lng: -58.6610, imagen: '/public/img/reportes/bacheo-ratti.jpg', fecha: '22/10/2026', descripcion: 'Reconstrucción completa de la esquina.', apoyos: 16 },
  { id: 18, categoria: 'luminaria', estado: 'finalizado', titulo: 'Reparación de columna de luz', direccion: 'República del Salvador 500', lat: -34.6640, lng: -58.6780, imagen: '/public/img/reportes/columna-salvador.jpg', fecha: '23/10/2026', descripcion: 'Enderezamiento de columna y prueba de tensión superada.', apoyos: 8 },
  { id: 19, categoria: 'arbolado', estado: 'finalizado', titulo: 'Limpieza de restos de poda', direccion: 'Bacacay 780', lat: -34.6515, lng: -58.6680, imagen: '/public/img/reportes/poda-bacacay.jpg', fecha: '24/10/2026', descripcion: 'Retiro y triturado de restos verdes.', apoyos: 10 },
  { id: 20, categoria: 'bache', estado: 'finalizado', titulo: 'Reconstrucción de cordón cuneta', direccion: 'Viamonte 1550', lat: -34.6595, lng: -58.6835, imagen: '/public/img/reportes/cordon-viamonte.jpg', fecha: '24/10/2026', descripcion: 'Hormigonado de cordón cuneta concluido.', apoyos: 13 }
];

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
  if (!el) return;

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
  const reportesUsuario = JSON.parse(localStorage.getItem('reportesUsuario')) || [];
  const listaCompleta = [...listaReportes, ...reportesUsuario];

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
        <h4 style="color: #007bbf; margin: 6px 0 2px 0; font-size: 13px;">${reporte.titulo}</h4>
        <small style="color: #555555; font-size: 11px;">📍 ${reporte.direccion}</small>
        
        <img src="${reporte.imagen}" alt="${reporte.titulo}" class="imagenReportePopup" onerror="this.src='${imagenDefault}';">

        <a href="/pages/detalle-incidencia.html?id=${reporte.id}" class="botonVerDetallePopup">
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