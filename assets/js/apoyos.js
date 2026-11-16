import { obtenerUsuarioActual } from './auth.js';
import { obtenerReportes } from './reportes.js';

// Una clave por incidencia y usuario evita sobrescribir apoyos de otras pestañas.
export const PREFIJO_APOYOS = 'reporteUrbanoApoyo:';
const claveApoyo = (incidenciaId, usuarioId) => `${PREFIJO_APOYOS}${encodeURIComponent(incidenciaId)}:${encodeURIComponent(usuarioId)}`;

export function obtenerApoyos(incidenciaId) {
  const registros = new Map();
  for (let i = 0; i < localStorage.length; i++) {
    const clave = localStorage.key(i);
    if (!clave?.startsWith(PREFIJO_APOYOS)) continue;
    let apoyo;
    try { apoyo = JSON.parse(localStorage.getItem(clave)); } catch { continue; }
    if (!apoyo || apoyo.incidenciaId !== String(incidenciaId) || typeof apoyo.usuarioId !== 'string'
      || !apoyo.usuarioId || !Number.isFinite(Date.parse(apoyo.fecha))
      || clave !== claveApoyo(apoyo.incidenciaId, apoyo.usuarioId)) continue;
    registros.set(apoyo.usuarioId, apoyo);
  }
  return [...registros.values()];
}

// Cantidades ficticias fijas para los 20 reportes de demostraci?n.
const apoyosIniciales = new Map(Object.entries({
  1: 24, 2: 17, 3: 32, 4: 8, 5: 41, 6: 13,
  7: 56, 8: 19, 9: 27, 10: 63, 11: 11, 12: 22,
  13: 78, 14: 45, 15: 36, 16: 29, 17: 52, 18: 16, 19: 9, 20: 34
}));

export function obtenerEstadoApoyo(incidenciaId) {
  const usuario = obtenerUsuarioActual();
  const apoyos = obtenerApoyos(incidenciaId);
  return { total: (apoyosIniciales.get(String(incidenciaId)) ?? 0) + apoyos.length, apoyado: Boolean(usuario && apoyos.some(apoyo => apoyo.usuarioId === usuario.id)) };
}

export function registrarApoyo(incidenciaId) {
  const usuario = obtenerUsuarioActual();
  const id = String(incidenciaId);
  const reporte = obtenerReportes().find(reporte => String(reporte.id) === id);
  if (reporte?.estado === 'finalizado') return { ...obtenerEstadoApoyo(id), cerrado: true };
  if (!usuario) return { requiereSesion: true };
  if (!reporte) throw new Error('La incidencia ya no está disponible.');
  const clave = claveApoyo(id, usuario.id);
  if (obtenerApoyos(id).some(apoyo => apoyo.usuarioId === usuario.id)) return obtenerEstadoApoyo(id);
  const apoyo = { incidenciaId: id, usuarioId: usuario.id, fecha: new Date().toISOString() };
  localStorage.setItem(clave, JSON.stringify(apoyo));
  window.dispatchEvent(new Event('apoyosActualizados'));
  return obtenerEstadoApoyo(id);
}
