const listaReportes = [
  // 🔴 REPORTADOS (6 casos)
  { id: 1, categoria: 'bache', estado: 'reportado', titulo: 'Bache profundo en calzada', direccion: 'Av. Cnel. Brandsen 1800', lat: -34.6521, lng: -58.6715, imagen: '/public/img/reportes/bache-brandsen.jpg', fecha: '05/11/2026', descripcion: 'Se observa un bache de gran dimensión que dificulta el tránsito vehicular y genera riesgo de daño en los vehículos.' },
  { id: 2, categoria: 'luminaria', estado: 'reportado', titulo: 'Luminaria apagada', direccion: 'Muñiz 450', lat: -34.6590, lng: -58.6652, imagen: '/public/img/reportes/luminaria-muniz.jpg', fecha: '04/11/2026', descripcion: 'Luminaria fuera de servicio desde hace tres días. La cuadra queda completamente a oscuras por la noche.' },
  { id: 3, categoria: 'arbolado', estado: 'reportado', titulo: 'Rama grande en riesgo de caída', direccion: 'José María Barcala 720', lat: -34.6480, lng: -58.6740, imagen: '/public/img/reportes/arbol-barcala.jpg', fecha: '03/11/2026', descripcion: 'Rama quebrada en la copa del árbol en riesgo de caer sobre la vereda tras la última tormenta.' },
  { id: 4, categoria: 'transito', estado: 'reportado', titulo: 'Cartel de señalización dañado', direccion: 'Av. Néstor Kirchner 21000', lat: -34.6540, lng: -58.6830, imagen: '/public/img/reportes/cartel-kirchner.jpg', fecha: '02/11/2026', descripcion: 'Cartel indicador de velocidad máxima inclinado a punto de caerse.' },
  { id: 5, categoria: 'bache', estado: 'reportado', titulo: 'Hundimiento de pavimento', direccion: 'Mansilla 850', lat: -34.6612, lng: -58.6685, imagen: '/public/img/reportes/bache-mansilla.jpg', fecha: '01/11/2026', descripcion: 'Hundimiento del asfalto próximo a la rejilla del sumidero.' },
  { id: 6, categoria: 'luminaria', estado: 'reportado', titulo: 'Foco intermitente en plaza', direccion: 'Soler y Rondeau', lat: -34.6565, lng: -58.6710, imagen: '/public/img/reportes/luz-soler.jpg', fecha: '01/11/2026', descripcion: 'Foco parpadeante en el sector de juegos infantiles.' },

  // 🟡 EN PROCESO (6 casos)
  { id: 7, categoria: 'bache', estado: 'en_proceso', titulo: 'Reparación de bache en curso', direccion: 'Av. Intendente Ratti 1200', lat: -34.6410, lng: -58.6640, imagen: '/public/img/reportes/bache-ratti.jpg', fecha: '28/10/2026', descripcion: 'Trabajos de fresado y nivelación de la carpeta asfáltica.' },
  { id: 8, categoria: 'arbolado', estado: 'en_proceso', titulo: 'Poda correctiva programada', direccion: 'Zuilbarchero 520', lat: -34.6350, lng: -58.6750, imagen: '/public/img/reportes/poda-zuilbarchero.jpg', fecha: '29/10/2026', descripcion: 'Cuadrilla de arbolado urbano asignada para despeje de ramas.' },
  { id: 9, categoria: 'luminaria', estado: 'en_proceso', titulo: 'Recambio de cableado eléctrico', direccion: 'Olazábal 1100', lat: -34.6635, lng: -58.6620, imagen: '/public/img/reportes/cableado-olazabal.jpg', fecha: '30/10/2026', descripcion: 'Reemplazo de líneas subterráneas para restablecer el servicio.' },
  { id: 10, categoria: 'transito', estado: 'en_proceso', titulo: 'Mantenimiento de semáforo', direccion: 'Av. Santa Rosa y Lavalle', lat: -34.6485, lng: -58.6870, imagen: '/public/img/reportes/semaforo-santarosa.jpg', fecha: '25/10/2026', descripcion: 'Recambio de placa controladora del semáforo.' },
  { id: 11, categoria: 'bache', estado: 'en_proceso', titulo: 'Nivelación de tapa de inspección', direccion: 'Defilippi 1420', lat: -34.6395, lng: -58.6810, imagen: '/public/img/reportes/tapa-defilippi.jpg', fecha: '26/10/2026', descripcion: 'Cuadrilla trabajando en el sellado del hormigón.' },
  { id: 12, categoria: 'arbolado', estado: 'en_proceso', titulo: 'Despeje de luminaria por ramas', direccion: 'Pirán 340', lat: -34.6670, lng: -58.6690, imagen: '/public/img/reportes/ramas-piran.jpg', fecha: '27/10/2026', descripcion: 'Corte de ramas bajas que tapan la iluminación de la calle.' },

  // 🟢 FINALIZADOS (8 casos)
  { id: 13, categoria: 'bache', estado: 'finalizado', titulo: 'Asfaltado y sellado completado', direccion: 'Martín Fierro 3100', lat: -34.6290, lng: -58.6920, imagen: '/public/img/reportes/asfalto-fierro.jpg', fecha: '15/10/2026', descripcion: 'Trabajo finalizado con bacheo en caliente y habilitación del carril.' },
  { id: 14, categoria: 'luminaria', estado: 'finalizado', titulo: 'Instalación de luminaria LED', direccion: 'Alvear 920', lat: -34.6580, lng: -58.6595, imagen: '/public/img/reportes/led-alvear.jpg', fecha: '18/10/2026', descripcion: 'Se instaló artefacto LED de alta eficiencia energética.' },
  { id: 15, categoria: 'arbolado', estado: 'finalizado', titulo: 'Retiro de árbol caído', direccion: 'Juncal 1250', lat: -34.6720, lng: -58.6750, imagen: '/public/img/reportes/arbol-juncal.jpg', fecha: '20/10/2026', descripcion: 'Limpieza total de troncos y despeje de vereda.' },
  { id: 16, categoria: 'transito', estado: 'finalizado', titulo: 'Pintura de senda peatonal', direccion: 'Las Heras 400', lat: -34.6555, lng: -58.6640, imagen: '/public/img/reportes/senda-heras.jpg', fecha: '21/10/2026', descripcion: 'Se demarcó la senda peatonal y la línea de frenado.' },
  { id: 17, categoria: 'bache', estado: 'finalizado', titulo: 'Bacheo asfáltico finalizado', direccion: 'Av. Ratti y Grecia', lat: -34.6440, lng: -58.6610, imagen: '/public/img/reportes/bacheo-ratti.jpg', fecha: '22/10/2026', descripcion: 'Reconstrucción completa de la esquina.' },
  { id: 18, categoria: 'luminaria', estado: 'finalizado', titulo: 'Reparación de columna de luz', direccion: 'República del Salvador 500', lat: -34.6640, lng: -58.6780, imagen: '/public/img/reportes/columna-salvador.jpg', fecha: '23/10/2026', descripcion: 'Enderezamiento de columna y prueba de tensión superada.' },
  { id: 19, categoria: 'arbolado', estado: 'finalizado', titulo: 'Limpieza de restos de poda', direccion: 'Bacacay 780', lat: -34.6515, lng: -58.6680, imagen: '/public/img/reportes/poda-bacacay.jpg', fecha: '24/10/2026', descripcion: 'Retiro y triturado de restos verdes.' },
  { id: 20, categoria: 'bache', estado: 'finalizado', titulo: 'Reconstrucción de cordón cuneta', direccion: 'Viamonte 1550', lat: -34.6595, lng: -58.6835, imagen: '/public/img/reportes/cordon-viamonte.jpg', fecha: '24/10/2026', descripcion: 'Hormigonado de cordón cuneta concluido.' }
];

export function obtenerReportes() {
  let locales = [];
  try {
    const datos = JSON.parse(localStorage.getItem('reportesUsuario') || '[]');
    if (Array.isArray(datos)) locales = datos;
  } catch { /* Los reportes de ejemplo siguen disponibles si falla el almacenamiento. */ }
  const reportes = new Map(listaReportes.map(reporte => [String(reporte.id), reporte]));
  for (const reporte of locales) {
    if (!reporte || !['string', 'number'].includes(typeof reporte.id) || !String(reporte.id).trim()) continue;
    if (!reportes.has(String(reporte.id))) reportes.set(String(reporte.id), reporte);
  }
  return [...reportes.values()];
}

export function textoSeguro(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, letra => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[letra]));
}

export function imagenSegura(valor) {
  if (typeof valor !== 'string') return '';
  try {
    const url = new URL(valor, window.location.origin);
    return ['http:', 'https:', 'blob:'].includes(url.protocol) || /^data:image\/(jpeg|png|webp);base64,/i.test(valor) ? valor : '';
  } catch { return ''; }
}
