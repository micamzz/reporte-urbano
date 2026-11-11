import { obtenerUsuarioActual } from './auth.js';

function leerFotografia(archivo) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result);
    lector.onerror = () => reject(new Error('No pudimos leer una fotografía. Volvé a seleccionarla e intentá nuevamente.'));
    lector.readAsDataURL(archivo);
  });
}

export async function guardarReporteLocal(datos) {
  const categoria = datos.get('categoria');
  const titulo = String(datos.get('titulo') || '').trim();
  const descripcion = String(datos.get('descripcion') || '').trim();
  const lat = Number(datos.get('lat')), lng = Number(datos.get('lng'));
  if (!['bache', 'luminaria', 'arbolado', 'transito'].includes(categoria) || !titulo || !descripcion
    || datos.get('lat') === null || datos.get('lng') === null || !Number.isFinite(lat) || !Number.isFinite(lng)
    || lat < -34.70 || lat > -34.61 || lng < -58.73 || lng > -58.62) throw new Error('Revisá los datos y la ubicación del reporte.');
  const archivos = datos.getAll('fotografias');
  if (archivos.length > 5 || archivos.some(archivo => !['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type)
    || !archivo.size || archivo.size > 5 * 1024 * 1024)) throw new Error('Revisá el formato, tamaño y cantidad de fotografías.');
  const fotografias = await Promise.all(archivos.map(leerFotografia));
  const guardar = () => {
    let reportes;
    try {
      reportes = JSON.parse(localStorage.getItem('reportesUsuario') || '[]');
      if (!Array.isArray(reportes)) throw new Error();
    } catch { throw new Error('No pudimos leer los reportes guardados. Tus datos siguen en el formulario.'); }
    let numeroSeguimiento;
    do {
      const numero = crypto.getRandomValues(new Uint32Array(1))[0] % 100000000;
      numeroSeguimiento = `RU${String(numero).padStart(8, '0')}IT`;
    } while (reportes.some(reporte => reporte.numeroSeguimiento === numeroSeguimiento));
    const ahora = new Date();
    const reporte = {
      id: crypto.randomUUID(), numeroSeguimiento, categoria, titulo, descripcion,
      direccion: String(datos.get('direccion') || '').trim(), lat, lng, estado: 'reportado',
      fecha: new Intl.DateTimeFormat('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit', year: 'numeric' }).format(ahora),
      creadoEn: ahora.toISOString(), usuarioId: obtenerUsuarioActual()?.id || null,
      fotografias, imagen: fotografias[0] || ''
    };
    try { localStorage.setItem('reportesUsuario', JSON.stringify([...reportes, reporte])); }
    catch { throw new Error('No pudimos guardar el reporte. El almacenamiento puede estar lleno o deshabilitado. Si adjuntaste fotos, probá con menos imágenes o más pequeñas. Tus datos siguen en el formulario.'); }
    window.dispatchEvent(new Event('reportesActualizados'));
    return reporte;
  };
  return globalThis.navigator?.locks ? navigator.locks.request('guardarReporteUrbano', guardar) : guardar();
}
