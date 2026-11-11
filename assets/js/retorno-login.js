export function destinoTrasLogin(busqueda = window.location.search) {
  const retorno = new URLSearchParams(busqueda).get('volver');
  if (!retorno) return '/index.html';
  try {
    const url = new URL(retorno, window.location.origin);
    if (url.origin === window.location.origin && url.pathname === '/pages/detalle-incidencia.html' && url.searchParams.get('id')) {
      return url.pathname + url.search;
    }
  } catch { /* Un destino inválido vuelve al inicio. */ }
  return '/index.html';
}

export function enlaceLoginIncidencia(id) {
  const origen = origenDetalle();
  const detalle = `/pages/detalle-incidencia.html?id=${encodeURIComponent(id)}${origen ? `&origen=${origen}` : ''}`;
  return `/pages/login.html?volver=${encodeURIComponent(detalle)}`;
}

function origenDetalle() {
  const origen = new URLSearchParams(window.location.search).get('origen');
  if (window.location.pathname === '/pages/detalle-incidencia.html' && ['inicio', 'mapa'].includes(origen)) return origen;
  if (['/', '/index.html'].includes(window.location.pathname)) return 'inicio';
  if (window.location.pathname === '/pages/mapa-incidencias.html') return 'mapa';
  return null;
}

export function destinoVolverDetalle(busqueda = window.location.search) {
  return new URLSearchParams(busqueda).get('origen') === 'inicio'
    ? { href: '/index.html#seccionEstadisticas', texto: 'Volver al inicio' }
    : { href: '/pages/mapa-incidencias.html', texto: 'Volver al mapa' };
}
