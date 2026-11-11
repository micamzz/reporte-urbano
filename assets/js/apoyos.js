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

export function obtenerEstadoApoyo(incidenciaId) {
  const usuario = obtenerUsuarioActual();
  const apoyos = obtenerApoyos(incidenciaId);
  return { total: apoyos.length, apoyado: Boolean(usuario && apoyos.some(apoyo => apoyo.usuarioId === usuario.id)) };
}

export function registrarApoyo(incidenciaId) {
  const usuario = obtenerUsuarioActual();
  if (!usuario) return { requiereSesion: true };
  const id = String(incidenciaId);
  if (!obtenerReportes().some(reporte => String(reporte.id) === id)) throw new Error('La incidencia ya no está disponible.');
  const clave = claveApoyo(id, usuario.id);
  if (obtenerApoyos(id).some(apoyo => apoyo.usuarioId === usuario.id)) return obtenerEstadoApoyo(id);
  const apoyo = { incidenciaId: id, usuarioId: usuario.id, fecha: new Date().toISOString() };
  localStorage.setItem(clave, JSON.stringify(apoyo));
  window.dispatchEvent(new Event('apoyosActualizados'));
  return obtenerEstadoApoyo(id);
}
