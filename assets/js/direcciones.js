// Servicio público Photon: búsquedas explícitas y resultados cacheados por sesión.
const endpoint = 'https://photon.komoot.io/api/';
const cache = new Map();
let ultimaConsulta = 0;

export async function buscarDirecciones(direccion, limites, signal) {
  const consulta = direccion.trim().replace(/\s+/g, ' ');
  if (!consulta) throw new Error('Ingresá una calle y altura para buscar.');
  const clave = consulta.toLocaleLowerCase('es');
  if (cache.has(clave)) return cache.get(clave);
  if (Date.now() - ultimaConsulta < 1500) throw new Error('Esperá un momento antes de volver a buscar.');
  ultimaConsulta = Date.now();
  const url = new URL(endpoint);
  url.search = new URLSearchParams({ q: `${consulta}, Ituzaingó, Buenos Aires, Argentina`,
    lat: '-34.658', lon: '-58.670', limit: '5',
    bbox: `${limites[0][1]},${limites[0][0]},${limites[1][1]},${limites[1][0]}` }).toString();
  const respuesta = await fetch(url, { signal });
  if (!respuesta.ok) throw new Error('El buscador no está disponible. Intentá más tarde o seleccioná el lugar en el mapa.');
  const datos = await respuesta.json();
  if (!Array.isArray(datos.features)) throw new Error('No pudimos interpretar la respuesta del buscador. Seleccioná el lugar en el mapa.');
  const resultados = datos.features.flatMap((item) => {
    const punto = item.geometry?.coordinates;
    if (item.geometry?.type !== 'Point' || !Array.isArray(punto)) return [];
    const [lng, lat] = punto;
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < limites[0][0] || lat > limites[1][0]
      || lng < limites[0][1] || lng > limites[1][1]) return [];
    const p = item.properties || {};
    const calle = p.street || p.name || '';
    const altura = p.housenumber || '';
    const nombre = [calle, altura].filter(Boolean).join(' ');
    if (!nombre) return [];
    return [{
      lat, lng, calle, altura,
      nombre: [nombre, p.city || p.district, p.state].filter(Boolean).join(', '),
      aproximada: !altura
    }];
  });
  cache.set(clave, resultados);
  return resultados;
}

export async function buscarDireccionPorCoordenadas(punto, signal) {
  if (!Number.isFinite(punto.lat) || !Number.isFinite(punto.lng)) {
    throw new Error('La ubicación no es válida para buscar una dirección.');
  }
  const url = new URL('https://photon.komoot.io/reverse');
  url.search = new URLSearchParams({
    lat: String(punto.lat),
    lon: String(punto.lng),
    limit: '1'
  }).toString();
  const respuesta = await fetch(url, { signal });
  if (!respuesta.ok) throw new Error('No pudimos obtener la dirección de esa ubicación.');
  const datos = await respuesta.json();
  if (!Array.isArray(datos.features)) throw new Error('No pudimos interpretar la dirección de esa ubicación.');
  const propiedades = datos.features[0]?.properties;
  if (!propiedades) return null;
  const calle = propiedades.street || propiedades.name || '';
  if (!calle) return null;
  return { calle, altura: propiedades.housenumber || '' };
}
