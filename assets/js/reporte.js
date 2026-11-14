import { cargarComponentesModulares } from './utils/include.js';
import { actualizarBotonHeader } from './auth.js';
import { buscarDireccionPorCoordenadas, buscarDirecciones } from './direcciones.js';
import { guardarReporteLocal } from './guardar-reporte.js';

const $ = (id) => document.getElementById(id);
const categorias = { bache: 'Bache', luminaria: 'Luminaria', arbolado: 'Arbolado', transito: 'Tránsito' };
let paso = 1;
let ubicacion = null;
let mapa, marcador, mapaResumen, marcadorResumen;
let enviando = false;
let enviado = false;
const fotos = [];
const limites = [[-34.7000, -58.7300], [-34.6100, -58.6200]];
let consultaDireccion = null;
let consultaDireccionCoordenadas = null;

function limpiarBusquedaDireccion() {
  consultaDireccion?.abort();
  consultaDireccion = null;
  consultaDireccionCoordenadas?.abort();
  consultaDireccionCoordenadas = null;
  $('buscarDireccion').disabled = false;
  $('resultadosDireccion').replaceChildren();
  $('resultadosDireccion').hidden = true;
  $('estadoDireccion').textContent = '';
  $('estadoDireccion').classList.remove('estadoResultados');
}

async function completarDireccion(punto) {
  consultaDireccionCoordenadas?.abort();
  const controlador = new AbortController();
  consultaDireccionCoordenadas = controlador;
  const temporizador = setTimeout(() => controlador.abort(), 12000);
  $('calle').value = '';
  $('altura').value = '';
  $('estadoDireccion').textContent = 'Buscando calle y altura…';
  try {
    const direccion = await buscarDireccionPorCoordenadas(punto, controlador.signal);
    if (consultaDireccionCoordenadas !== controlador) return;
    $('calle').value = direccion?.calle || '';
    $('altura').value = direccion?.altura || '';
    $('estadoDireccion').textContent = direccion
      ? 'Dirección completada automáticamente. Revisá la calle y la altura.'
      : 'No encontramos una calle cercana. Podés ingresar la dirección manualmente.';
  } catch (fallo) {
    if (consultaDireccionCoordenadas !== controlador) return;
    $('estadoDireccion').textContent = fallo.name === 'AbortError'
      ? 'La búsqueda tardó demasiado. Podés ingresar la dirección manualmente.'
      : `${fallo.message} Podés ingresar la dirección manualmente.`;
  } finally {
    clearTimeout(temporizador);
    if (consultaDireccionCoordenadas === controlador) consultaDireccionCoordenadas = null;
  }
}

async function buscarDireccion() {
  if (consultaDireccion) return;
  if (!mapa) {
    $('estadoDireccion').textContent = 'El mapa no está disponible. Revisá tu conexión y recargá la página.';
    return;
  }
  const consulta = [$('calle').value.trim(), $('altura').value.trim()].filter(Boolean).join(' ');
  if (!consulta) {
    $('estadoDireccion').textContent = 'Ingresá una calle para buscarla en el mapa.';
    return;
  }
  limpiarBusquedaDireccion();
  const controlador = new AbortController();
  consultaDireccion = controlador;
  const temporizador = setTimeout(() => controlador.abort(), 12000);
  $('buscarDireccion').disabled = true;
  $('estadoDireccion').textContent = 'Buscando dirección…';
  try {
    const resultados = await buscarDirecciones(consulta, limites, controlador.signal);
    if (consultaDireccion !== controlador) return;
    $('estadoDireccion').classList.toggle('estadoResultados', resultados.length > 0);
    $('estadoDireccion').textContent = resultados.length
      ? 'SELECCIONÁ EL RESULTADO PARA COLOCAR EL PIN EN EL MAPA'
      : 'No encontramos esa dirección en la zona del mapa de Ituzaingó. Probá otra forma de escribirla o marcá el lugar en el mapa.';
    for (const resultado of resultados) {
      const item = document.createElement('li');
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.textContent = `${resultado.nombre}${resultado.aproximada ? ' · Sin altura exacta' : ''}`;
      boton.addEventListener('click', () => {
        seleccionarUbicacion(resultado, resultado);
        mapa.setView(resultado, 17);
        $('estadoDireccion').classList.remove('estadoResultados');
        $('estadoDireccion').textContent = `${resultado.aproximada ? 'Ubicación aproximada: no se encontró una altura exacta.' : 'Ubicación seleccionada.'} Revisá y ajustá el pin antes de continuar.`;
        $('resultadosDireccion').hidden = true;
        $('mapaReporte').focus();
      });
      item.append(boton);
      $('resultadosDireccion').append(item);
    }
    $('resultadosDireccion').hidden = resultados.length === 0;
  } catch (fallo) {
    if (consultaDireccion !== controlador) return;
    $('estadoDireccion').textContent = fallo.name === 'AbortError'
      ? 'La búsqueda tardó demasiado. Intentá nuevamente o seleccioná el lugar en el mapa.'
      : fallo instanceof TypeError ? 'No pudimos conectar con el buscador. Podés seleccionar el lugar en el mapa.' : fallo.message;
  } finally {
    clearTimeout(temporizador);
    if (consultaDireccion === controlador) {
      consultaDireccion = null;
      $('buscarDireccion').disabled = false;
    }
  }
}

function error(campo, mensaje, control) {
  $(`error${campo}`).textContent = mensaje;
  if (control) control.setAttribute('aria-invalid', String(Boolean(mensaje)));
}

function categoria() { return document.querySelector('[name="categoria"]:checked')?.value; }

function ubicacionValida() {
  return ubicacion && Number.isFinite(ubicacion.lat) && Number.isFinite(ubicacion.lng)
    && ubicacion.lat >= limites[0][0] && ubicacion.lat <= limites[1][0]
    && ubicacion.lng >= limites[0][1] && ubicacion.lng <= limites[1][1];
}

function validarProblema() {
  const seleccion = Object.hasOwn(categorias, categoria());
  error('Categoria', seleccion ? '' : 'Seleccioná una categoría para continuar.', $('grupoCategoria'));
  const titulo = $('titulo').value.trim();
  const descripcion = $('descripcion').value.trim();
  error('Titulo', titulo ? '' : 'Ingresá un título para el reporte.', $('titulo'));
  error('Descripcion', descripcion ? '' : 'Contanos qué está ocurriendo.', $('descripcion'));
  return seleccion && Boolean(titulo) && Boolean(descripcion);
}

function validarUbicacion() {
  const valida = Boolean(ubicacionValida());
  error('Ubicacion', valida ? '' : 'Marcá una ubicación en el mapa o escribí una dirección y seleccionala.', $('mapaReporte'));
  return valida;
}

function enfocarError() {
  const control = document.querySelector('[data-paso]:not([hidden]) [aria-invalid="true"]');
  if (control?.id === 'grupoCategoria') control.querySelector('input').focus();
  else control?.focus();
}

function agregarCapa(mapaDestino) {
  const capa = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 19
  });
  capa.addTo(mapaDestino);
}

function seleccionarUbicacion(punto, direccion) {
  ubicacion = { lat: punto.lat, lng: punto.lng };
  if (!marcador) {
    marcador = L.marker(punto, { draggable: true, autoPan: true }).addTo(mapa);
    marcador.on('dragend', () => seleccionarUbicacion(marcador.getLatLng()));
  } else marcador.setLatLng(punto);
  if (direccion === undefined) completarDireccion(punto);
  else {
    consultaDireccionCoordenadas?.abort();
    consultaDireccionCoordenadas = null;
    $('calle').value = direccion.calle;
    $('altura').value = direccion.altura;
  }
  validarUbicacion();
}

function iniciarMapa() {
  if (!window.L) {
    error('Ubicacion', 'No se pudo cargar el mapa. Revisá tu conexión y recargá la página.', $('mapaReporte'));
    return;
  }
  if (!mapa) {
    mapa = L.map('mapaReporte', { maxBounds: limites, maxBoundsViscosity: 1, minZoom: 13 }).setView([-34.658, -58.670], 14);
    agregarCapa(mapa);
    mapa.on('click', (evento) => seleccionarUbicacion(evento.latlng));
  }
  requestAnimationFrame(() => mapa.invalidateSize());
}

function mostrarResumen() {
  const pares = [['Categoría', categorias[categoria()]], ['Título', $('titulo').value.trim()],
  ['Descripción', $('descripcion').value.trim()], ['Dirección', direccionCompleta() || 'Sin dirección ingresada']];
  $('resumenReporte').replaceChildren();
  for (const [nombre, valor] of pares) {
    const termino = document.createElement('dt');
    const detalle = document.createElement('dd');
    termino.textContent = nombre; detalle.textContent = valor;
    $('resumenReporte').append(termino, detalle);
  }
  renderizarFotos($('resumenFotos'), false);
  if (window.L) {
    if (!mapaResumen) { mapaResumen = L.map('mapaResumen'); agregarCapa(mapaResumen); }
    if (!marcadorResumen) marcadorResumen = L.marker(ubicacion).addTo(mapaResumen);
    marcadorResumen.setLatLng(ubicacion);
    requestAnimationFrame(() => { mapaResumen.invalidateSize(); mapaResumen.setView(ubicacion, 16); });
  }
}

function mostrarPaso(numero) {
  if (paso === 2 && numero !== 2) limpiarBusquedaDireccion();
  paso = numero;
  document.querySelectorAll('[data-paso]').forEach((panel) => { panel.hidden = Number(panel.dataset.paso) !== paso; });
  document.querySelectorAll('.progresoReporte li').forEach((item, indice) => {
    item.classList.toggle('completado', indice + 1 < paso);
    if (indice + 1 === paso) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  });
  $('cancelarReporte').hidden = paso !== 1;
  $('anteriorReporte').hidden = paso === 1;
  $('siguienteReporte').hidden = paso === 3;
  $('enviarReporte').hidden = paso !== 3;
  $('estadoEnvio').textContent = '';
  if (paso === 2) iniciarMapa();
  if (paso === 3) mostrarResumen();
  $(`tituloPaso${paso}`).focus();
}

function renderizarFotos(contenedor, editable = true) {
  contenedor.replaceChildren();
  fotos.forEach((foto, indice) => {
    const figura = document.createElement('figure'); figura.className = 'fotoReporte';
    const imagen = document.createElement('img'); imagen.src = foto.url; imagen.alt = foto.archivo.name;
    figura.append(imagen);
    if (editable) {
      const boton = document.createElement('button'); boton.type = 'button'; boton.textContent = '×';
      boton.setAttribute('aria-label', `Eliminar fotografía ${foto.archivo.name}`);
      boton.addEventListener('click', () => {
        URL.revokeObjectURL(foto.url); fotos.splice(indice, 1);
        error('Fotos', '', $('zonaFotos')); renderizarFotos(contenedor);
        $('resumenFotos').replaceChildren();
        (contenedor.querySelector('button') || $('fotos')).focus();
      });
      figura.append(boton);
    }
    contenedor.append(figura);
  });
}

function agregarFotos(archivos) {
  const errores = [];
  for (const archivo of archivos) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type) || !/\.(jpe?g|png|webp)$/i.test(archivo.name)) {
      errores.push(`${archivo.name}: usá JPG, PNG o WEBP.`); continue;
    }
    if (!archivo.size || archivo.size > 5 * 1024 * 1024) {
      errores.push(`${archivo.name}: la foto debe tener contenido y pesar hasta 5 MB.`); continue;
    }
    if (fotos.length >= 5) { errores.push('Podés adjuntar hasta 5 fotografías.'); break; }
    fotos.push({ archivo, url: URL.createObjectURL(archivo) });
  }
  error('Fotos', errores.join(' '), $('zonaFotos'));
  $('fotos').value = '';
  renderizarFotos($('vistaFotos'));
}

export async function crearReporte(datos) {
  return guardarReporteLocal(datos);
}

function prepararDatos() {
  const datos = new FormData();
  for (const [clave, valor] of Object.entries({ categoria: categoria(), titulo: $('titulo').value.trim(), descripcion: $('descripcion').value.trim(), direccion: direccionCompleta(), lat: ubicacion.lat, lng: ubicacion.lng })) datos.append(clave, valor);
  fotos.forEach(({ archivo }) => datos.append('fotografias', archivo));
  return datos;
}

function direccionCompleta() {
  return [$('calle').value.trim(), $('altura').value.trim()].filter(Boolean).join(' ');
}

$('siguienteReporte').addEventListener('click', () => {
  if (paso === 1 ? validarProblema() : validarUbicacion()) mostrarPaso(paso + 1);
  else enfocarError();
});
$('anteriorReporte').addEventListener('click', () => mostrarPaso(paso - 1));
$('buscarDireccion').addEventListener('click', buscarDireccion);
for (const id of ['calle', 'altura']) {
  $(id).addEventListener('input', limpiarBusquedaDireccion);
  $(id).addEventListener('keydown', (evento) => {
    if (evento.key === 'Enter') { evento.preventDefault(); buscarDireccion(); }
  });
}
function actualizarContadorDescripcion() {
  $('contadorDescripcion').textContent = `${$('descripcion').value.length}/200`;
}
$('descripcion').addEventListener('input', actualizarContadorDescripcion);
actualizarContadorDescripcion();

for (const [id, campo] of [['titulo', 'Titulo'], ['descripcion', 'Descripcion']]) {
  $(id).addEventListener('input', () => { if ($(id).value.trim()) error(campo, '', $(id)); });
}

function actualizarContadorTitulo() {
  $('contadorTitulo').textContent = `${$('titulo').value.length}/50`;
}

$('titulo').addEventListener('input', actualizarContadorTitulo);
actualizarContadorTitulo();

for (const [id, campo] of [['titulo', 'Titulo'], ['descripcion', 'Descripcion']]) {
  $(id).addEventListener('input', () => { if ($(id).value.trim()) error(campo, '', $(id)); });
}

document.querySelectorAll('[name="categoria"]').forEach((radio) => radio.addEventListener('change', () => error('Categoria', '', $('grupoCategoria'))));
$('fotos').addEventListener('change', (evento) => agregarFotos(evento.target.files));

for (const nombre of ['dragover', 'dragleave', 'drop']) $('zonaFotos').addEventListener(nombre, (evento) => {
  evento.preventDefault(); $('zonaFotos').classList.toggle('arrastrando', nombre === 'dragover');
  if (nombre === 'drop') agregarFotos(evento.dataTransfer.files);
});

$('formularioReporte').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (enviando || enviado) return;
  if (paso !== 3) { $('siguienteReporte').click(); return; }
  if (!validarProblema()) { mostrarPaso(1); enfocarError(); return; }
  if (!validarUbicacion()) { mostrarPaso(2); enfocarError(); return; }
  if (fotos.length > 5 || fotos.some(({ archivo }) => archivo.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type))) {
    mostrarPaso(1); error('Fotos', 'Revisá el formato, tamaño y cantidad de fotografías.', $('zonaFotos')); return;
  }
  enviando = true;
  $('formularioReporte').setAttribute('aria-busy', 'true');
  $('enviarReporte').disabled = true; $('anteriorReporte').disabled = true;
  $('estadoEnvio').textContent = 'Enviando reporte…';
  try {
    const reporte = await crearReporte(prepararDatos());
    enviado = true;
    $('estadoEnvio').textContent = `Reporte enviado correctamente. Número de seguimiento: ${reporte.numeroSeguimiento}.`;
    $('numeroSeguimiento').textContent = reporte.numeroSeguimiento;
    $('verReporteCreado').href = `/pages/detalle-incidencia.html?id=${encodeURIComponent(reporte.id)}&origen=inicio`;
    $('popupReporteEnviado').showModal();
  } catch (fallo) {
    $('estadoEnvio').textContent = fallo.message || 'No pudimos enviar el reporte. Intentá nuevamente sin cerrar esta página.';
  } finally {
    enviando = false; $('formularioReporte').removeAttribute('aria-busy');
    $('enviarReporte').disabled = enviado; $('anteriorReporte').disabled = enviado;
    if (!$('popupReporteEnviado').open) $('estadoEnvio').focus();
  }
});

$('cerrarReporteEnviado').addEventListener('click', () => $('popupReporteEnviado').close());
await cargarComponentesModulares();
actualizarBotonHeader();
