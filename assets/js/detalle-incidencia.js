import { cargarComponentesModulares } from './utils/include.js';
import { actualizarBotonHeader } from './auth.js';

const imagenDefault = 'https://via.placeholder.com/600x400?text=Sin+Imagen+Cargada';

// MISMA LISTA DE 20 REPORTES
const listaReportes = [
  // 🔴 REPORTADOS (6 casos)
  { id: 1, categoria: 'bache', estado: 'reportado', titulo: 'Bache profundo en calzada', direccion: 'Av. Cnel. Brandsen 1800', lat: -34.6642, lng: -58.6711, imagen: '/public/img/reportes/bache-brandsen.jpg', fecha: '05/11/2026', descripcion: 'Se observa un bache de gran dimensión que dificulta el tránsito vehicular y genera riesgo de daño en los vehículos.', apoyos: 14 },
  { id: 2, categoria: 'luminaria', estado: 'reportado', titulo: 'Luminaria apagada', direccion: 'Muñiz 450', lat: -34.6585, lng: -58.6672, imagen: '/public/img/reportes/luminaria-muniz.jpg', fecha: '04/11/2026', descripcion: 'Luminaria fuera de servicio desde hace tres días. La cuadra queda completamente a oscuras por la noche.', apoyos: 6 },
  { id: 3, categoria: 'arbolado', estado: 'reportado', titulo: 'Rama grande en riesgo de caída', direccion: 'José María Barcala 720', lat: -34.6531, lng: -58.6750, imagen: '/public/img/reportes/arbol-barcala.jpg', fecha: '03/11/2026', descripcion: 'Rama quebrada en la copa del árbol en riesgo de caer sobre la vereda tras la última tormenta.', apoyos: 9 },
  { id: 4, categoria: 'transito', estado: 'reportado', titulo: 'Cartel de señalización dañado', direccion: 'Av. Néstor Kirchner 21000', lat: -34.6610, lng: -58.6690, imagen: '/public/img/reportes/cartel-kirchner.jpg', fecha: '02/11/2026', descripcion: 'Cartel indicador de velocidad máxima inclinado a punto de caerse.', apoyos: 3 },
  { id: 5, categoria: 'bache', estado: 'reportado', titulo: 'Hundimiento de pavimento', direccion: 'Mansilla 850', lat: -34.6598, lng: -58.6725, imagen: '/public/img/reportes/bache-mansilla.jpg', fecha: '01/11/2026', descripcion: 'Hundimiento del asfalto próximo a la rejilla del sumidero.', apoyos: 18 },
  { id: 6, categoria: 'luminaria', estado: 'reportado', titulo: 'Foco intermitente en plaza', direccion: 'Soler y Rondeau', lat: -34.6562, lng: -58.6698, imagen: '/public/img/reportes/luz-soler.jpg', fecha: '01/11/2026', descripcion: 'Foco parpadeante en el sector de juegos infantiles.', apoyos: 5 },

  // 🟡 EN PROCESO (6 casos)
  { id: 7, categoria: 'bache', estado: 'en_proceso', titulo: 'Reparación de bache en curso', direccion: 'Av. Intendente Ratti 1200', lat: -34.6512, lng: -58.6645, imagen: '/public/img/reportes/bache-ratti.jpg', fecha: '28/10/2026', descripcion: 'Trabajos de fresado y nivelación de la carpeta asfáltica.', apoyos: 22 },
  { id: 8, categoria: 'arbolado', estado: 'en_proceso', titulo: 'Poda correctiva programada', direccion: 'Zuilbarchero 520', lat: -34.6495, lng: -58.6780, imagen: '/public/img/reportes/poda-zuilbarchero.jpg', fecha: '29/10/2026', descripcion: 'Cuadrilla de arbolado urbano asignada para despeje de ramas.', apoyos: 8 },
  { id: 9, categoria: 'luminaria', estado: 'en_proceso', titulo: 'Recambio de cableado eléctrico', direccion: 'Olazábal 1100', lat: -34.6548, lng: -58.6630, imagen: '/public/img/reportes/cableado-olazabal.jpg', fecha: '30/10/2026', descripcion: 'Reemplazo de líneas subterráneas para restablecer el servicio.', apoyos: 11 },
  { id: 10, categoria: 'transito', estado: 'en_proceso', titulo: 'Mantenimiento de semáforo', direccion: 'Av. Santa Rosa y Lavalle', lat: -34.6501, lng: -58.6821, imagen: '/public/img/reportes/semaforo-santarosa.jpg', fecha: '25/10/2026', descripcion: 'Recambio de placa controladora del semáforo.', apoyos: 15 },
  { id: 11, categoria: 'bache', estado: 'en_proceso', titulo: 'Nivelación de tapa de inspección', direccion: 'Defilippi 1420', lat: -34.6472, lng: -58.6765, imagen: '/public/img/reportes/tapa-defilippi.jpg', fecha: '26/10/2026', descripcion: 'Cuadrilla trabajando en el sellado del hormigón.', apoyos: 4 },
  { id: 12, categoria: 'arbolado', estado: 'en_proceso', titulo: 'Despeje de luminaria por ramas', direccion: 'Pirán 340', lat: -34.6621, lng: -58.6742, imagen: '/public/img/reportes/ramas-piran.jpg', fecha: '27/10/2026', descripcion: 'Corte de ramas bajas que tapan la iluminación de la calle.', apoyos: 7 },

  // 🟢 FINALIZADOS (8 casos)
  { id: 13, categoria: 'bache', estado: 'finalizado', titulo: 'Asfaltado y sellado completado', direccion: 'Martín Fierro 3100', lat: -34.6385, lng: -58.6850, imagen: '/public/img/reportes/asfalto-fierro.jpg', fecha: '15/10/2026', descripcion: 'Trabajo finalizado con bacheo en caliente y habilitación del carril.', apoyos: 30 },
  { id: 14, categoria: 'luminaria', estado: 'finalizado', titulo: 'Instalación de luminaria LED', direccion: 'Alvear 920', lat: -34.6570, lng: -58.6650, imagen: '/public/img/reportes/led-alvear.jpg', fecha: '18/10/2026', descripcion: 'Se instaló artefacto LED de alta eficiencia energética.', apoyos: 12 },
  { id: 15, categoria: 'arbolado', estado: 'finalizado', titulo: 'Retiro de árbol caído', direccion: 'Juncal 1250', lat: -34.6665, lng: -58.6688, imagen: '/public/img/reportes/arbol-juncal.jpg', fecha: '20/10/2026', descripcion: 'Limpieza total de troncos y despeje de vereda.', apoyos: 19 },
  { id: 16, categoria: 'transito', estado: 'finalizado', titulo: 'Pintura de senda peatonal', direccion: 'Las Heras 400', lat: -34.6590, lng: -58.6680, imagen: '/public/img/reportes/senda-heras.jpg', fecha: '21/10/2026', descripcion: 'Se demarcó la senda peatonal y la línea de frenado.', apoyos: 25 },
  { id: 17, categoria: 'bache', estado: 'finalizado', titulo: 'Bacheo asfáltico finalizado', direccion: 'Av. Ratti y Grecia', lat: -34.6430, lng: -58.6612, imagen: '/public/img/reportes/bacheo-ratti.jpg', fecha: '22/10/2026', descripcion: 'Reconstrucción completa de la esquina.', apoyos: 16 },
  { id: 18, categoria: 'luminaria', estado: 'finalizado', titulo: 'Reparación de columna de luz', direccion: 'República del Salvador 500', lat: -34.6680, lng: -58.6720, imagen: '/public/img/reportes/columna-salvador.jpg', fecha: '23/10/2026', descripcion: 'Enderezamiento de columna y prueba de tensión superada.', apoyos: 8 },
  { id: 19, categoria: 'arbolado', estado: 'finalizado', titulo: 'Limpieza de restos de poda', direccion: 'Bacacay 780', lat: -34.6538, lng: -58.6695, imagen: '/public/img/reportes/poda-bacacay.jpg', fecha: '24/10/2026', descripcion: 'Retiro y triturado de restos verdes.', apoyos: 10 },
  { id: 20, categoria: 'bache', estado: 'finalizado', titulo: 'Reconstrucción de cordón cuneta', direccion: 'Viamonte 1550', lat: -34.6605, lng: -58.6775, imagen: '/public/img/reportes/cordon-viamonte.jpg', fecha: '24/10/2026', descripcion: 'Hormigonado de cordón cuneta concluido.', apoyos: 13 }
];

function cargarDetalleReporte() {
  const contenedor = document.getElementById('contenedorDetalle');
  if (!contenedor) return;

  // Obtener la ID desde los parámetros de la URL
  const parametros = new URLSearchParams(window.location.search);
  const idReporte = parseInt(parametros.get('id'));

  const reporte = listaReportes.find(r => r.id === idReporte);

  if (!reporte) {
    contenedor.innerHTML = `
      <h2 style="color: #ef4444;">Reporte no encontrado</h2>
      <p style="color: #64748b;">El reporte solicitado no existe o fue removido.</p>
    `;
    return;
  }

  let colorEstado = '#ef4444';
  let textoEstado = 'Reportado';

  if (reporte.estado === 'en_proceso') {
    colorEstado = '#f59e0b';
    textoEstado = 'En Proceso';
  } else if (reporte.estado === 'finalizado') {
    colorEstado = '#10b981';
    textoEstado = 'Finalizado';
  }

  contenedor.innerHTML = `
    <div class="cabeceraDetalle">
      <span class="badgeEstadoDetalle" style="background-color: ${colorEstado};">${textoEstado}</span>
      <span class="badgeCategoriaDetalle">Categoría: ${reporte.categoria}</span>
    </div>

    <h1 class="tituloDetalle">${reporte.titulo}</h1>
    <p class="direccionDetalle">📍 ${reporte.direccion} (Ituzaingó)</p>

    <div class="grillaDetalleContenido">
      <div>
        <img src="${reporte.imagen}" alt="${reporte.titulo}" class="imagenDetalleGrande" onerror="this.src='${imagenDefault}';">
      </div>

      <div class="infoAdicionalDetalle">
        <div class="bloqueInfo">
          <p class="tituloBloque">Fecha de reporte</p>
          <p class="textoBloque">${reporte.fecha}</p>
        </div>

        <div class="bloqueInfo">
          <p class="tituloBloque">Descripción del vecino</p>
          <p class="textoBloque">${reporte.descripcion}</p>
        </div>

        <button class="botonApoyoDetalle" id="btnApoyoDetalle">
          👍 A mí también me afecta (<span id="numApoyos">${reporte.apoyos}</span>)
        </button>
      </div>
    </div>
  `;

  document.getElementById('btnApoyoDetalle').addEventListener('click', () => {
    reporte.apoyos++;
    document.getElementById('numApoyos').innerText = reporte.apoyos;
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await cargarComponentesModulares();
  actualizarBotonHeader();
  cargarDetalleReporte();
});