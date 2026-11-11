const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

async function entorno(datos = new Map()) {
  const localStorage = {
    get length() { return datos.size; }, key: i => [...datos.keys()][i] ?? null,
    getItem: clave => datos.get(clave) ?? null,
    setItem: (clave, valor) => datos.set(clave, String(valor)), removeItem: clave => datos.delete(clave)
  };
  const ventana = new EventTarget();
  ventana.location = { origin: 'http://localhost', search: '' };
  const contexto = vm.createContext({ localStorage, window: ventana, document: { getElementById: () => null }, Event, URL, URLSearchParams });
  const modulos = new Map();
  async function cargar(nombre) {
    const archivo = path.resolve(__dirname, '../assets/js', nombre);
    if (modulos.has(archivo)) return modulos.get(archivo);
    const modulo = new vm.SourceTextModule(fs.readFileSync(archivo, 'utf8'), { context: contexto, identifier: archivo });
    modulos.set(archivo, modulo);
    await modulo.link((referencia, padre) => cargar(path.relative(path.resolve(__dirname, '../assets/js'), path.resolve(path.dirname(padre.identifier), referencia))));
    return modulo;
  }
  const apoyo = await cargar('apoyos.js'); await apoyo.evaluate();
  const retorno = await cargar('retorno-login.js'); await retorno.evaluate();
  return { apoyo: apoyo.namespace, auth: (await cargar('auth.js')).namespace, retorno: retorno.namespace, datos, localStorage, contexto, cargar };
}

test('sin sesión no registra; persiste, evita duplicados, separa incidencias y conserva al cerrar sesión', async () => {
  const e = await entorno();
  assert.equal(e.apoyo.registrarApoyo(1).requiereSesion, true);
  assert.equal(e.apoyo.obtenerApoyos(1).length, 0);
  e.auth.iniciarSesion('test@unlam.com', 'Unlam2026!');
  assert.equal(e.auth.obtenerUsuarioActual().id, 'test@unlam.com');
  assert.equal(e.apoyo.registrarApoyo(1).total, 1);
  const registro = e.apoyo.obtenerApoyos(1)[0];
  assert.equal(registro.incidenciaId, '1');
  assert.equal(registro.usuarioId, 'test@unlam.com');
  assert.ok(Number.isFinite(Date.parse(registro.fecha)));
  assert.equal(e.apoyo.registrarApoyo('1').total, 1);
  assert.equal(e.apoyo.obtenerApoyos(1)[0].fecha, registro.fecha);
  assert.equal(e.apoyo.registrarApoyo(2).total, 1);
  const recarga = await entorno(e.datos);
  assert.equal(recarga.apoyo.obtenerEstadoApoyo(1).total, 1);
  assert.equal(recarga.apoyo.obtenerEstadoApoyo(1).apoyado, true);
  e.auth.cerrarSesion();
  assert.equal(e.apoyo.obtenerEstadoApoyo(1).total, 1);
  assert.equal(e.apoyo.obtenerEstadoApoyo(1).apoyado, false);
});

test('reutiliza registro y cuenta apoyos de usuarios distintos sin usar los números de ejemplo', async () => {
  const e = await entorno();
  assert.equal(e.apoyo.obtenerEstadoApoyo(1).total, 0);
  e.auth.iniciarSesion('test@unlam.com', 'Unlam2026!'); e.apoyo.registrarApoyo(1);
  e.auth.registrarUsuario('Vecina', 'vecina@example.com', 'Prueba2026!');
  e.auth.iniciarSesion('vecina@example.com', 'Prueba2026!');
  assert.equal(e.apoyo.obtenerEstadoApoyo(1).apoyado, false);
  assert.equal(e.apoyo.registrarApoyo(1).total, 2);
  assert.equal(e.apoyo.registrarApoyo(1).total, 2);
});

test('dos pestañas comparten registros y admiten IDs existentes de reportes locales', async () => {
  const a = await entorno(); const b = await entorno(a.datos);
  a.localStorage.setItem('reportesUsuario', JSON.stringify([{ id: 'vecinal-123', titulo: 'Reporte local', apoyos: 90 }]));
  a.auth.iniciarSesion('test@unlam.com', 'Unlam2026!');
  a.apoyo.registrarApoyo('vecinal-123'); b.apoyo.registrarApoyo('vecinal-123');
  assert.equal(a.apoyo.obtenerEstadoApoyo('vecinal-123').total, 1);
  assert.throws(() => a.apoyo.registrarApoyo('inexistente'), /disponible/);
  a.localStorage.setItem('reporteUrbanoApoyo:basura', 'invalido');
  assert.equal(a.apoyo.obtenerEstadoApoyo('vecinal-123').total, 1);
});

test('no informa un apoyo guardado si el almacenamiento falla', async () => {
  const e = await entorno(); e.auth.iniciarSesion('test@unlam.com', 'Unlam2026!');
  e.localStorage.setItem = () => { throw new Error('Sin espacio'); };
  assert.throws(() => e.apoyo.registrarApoyo(1), /Sin espacio/);
  assert.equal(e.apoyo.obtenerApoyos(1).length, 0);
});

test('retorno a la misma incidencia y rechazo de redirecciones externas', async () => {
  const { retorno } = await entorno();
  const enlace = retorno.enlaceLoginIncidencia('vecinal-123');
  assert.equal(retorno.destinoTrasLogin(new URL(enlace, 'http://localhost').search), '/pages/detalle-incidencia.html?id=vecinal-123');
  assert.equal(retorno.destinoTrasLogin('?volver=https://externo.example/pages/detalle-incidencia.html?id=1'), '/index.html');
  assert.equal(retorno.destinoTrasLogin('?volver=//externo.example'), '/index.html');
  assert.equal(retorno.destinoTrasLogin(''), '/index.html');
});

test('vuelve al origen y lo conserva al iniciar sesión', async () => {
  const { retorno, contexto } = await entorno();
  contexto.window.location.pathname = '/pages/detalle-incidencia.html';
  contexto.window.location.search = '?id=1&origen=inicio';
  assert.equal(retorno.destinoVolverDetalle().href, '/index.html#seccionEstadisticas');
  assert.equal(retorno.destinoVolverDetalle().texto, 'Volver al inicio');
  const login = new URL(retorno.enlaceLoginIncidencia(1), 'http://localhost');
  assert.equal(retorno.destinoTrasLogin(login.search), '/pages/detalle-incidencia.html?id=1&origen=inicio');
  assert.equal(retorno.destinoVolverDetalle('?id=1&origen=mapa').href, '/pages/mapa-incidencias.html');
  assert.equal(retorno.destinoVolverDetalle('?id=1&origen=https://externo.example').href, '/pages/mapa-incidencias.html');
  contexto.window.location.pathname = '/index.html';
  assert.match(retorno.enlaceLoginIncidencia(1), /origen%3Dinicio/);
});

test('conserva volver entre login y registro hasta autenticar, sin registrar apoyos', async () => {
  const { retorno, auth, apoyo } = await entorno();
  const loginInicial = new URL(retorno.enlaceLoginIncidencia(2), 'http://localhost');
  assert.equal(retorno.destinoTrasLogin(loginInicial.search), '/pages/detalle-incidencia.html?id=2');
  const registro = new URL(retorno.enlaceAccesoConRetorno('/pages/registro.html', loginInicial.search), 'http://localhost');
  assert.equal(registro.searchParams.get('volver'), loginInicial.searchParams.get('volver'));
  const loginPosterior = new URL(retorno.enlaceAccesoConRetorno('/pages/login.html', registro.search), 'http://localhost');
  assert.equal(loginPosterior.searchParams.get('volver'), loginInicial.searchParams.get('volver'));
  auth.registrarUsuario('Vecino', 'nuevo@example.com', 'Prueba2026!');
  assert.equal(auth.obtenerUsuarioActual(), null); // El registro actual requiere login posterior.
  auth.iniciarSesion('nuevo@example.com', 'Prueba2026!');
  assert.equal(retorno.destinoTrasLogin(loginPosterior.search), '/pages/detalle-incidencia.html?id=2');
  assert.equal(apoyo.obtenerApoyos(2).length, 0);
  const origen = '?volver=' + encodeURIComponent('/pages/detalle-incidencia.html?id=2&origen=inicio');
  const registroConOrigen = new URL(retorno.enlaceAccesoConRetorno('/pages/registro.html', origen), 'http://localhost');
  assert.equal(retorno.destinoTrasLogin(registroConOrigen.search), '/pages/detalle-incidencia.html?id=2&origen=inicio');
});

test('enlaces normales sin retorno y rechazo de destinos externos o inválidos en ambos sentidos', async () => {
  const { retorno } = await entorno();
  for (const ruta of ['/pages/login.html', '/pages/registro.html']) {
    assert.equal(retorno.enlaceAccesoConRetorno(ruta, ''), ruta);
    for (const destino of ['https://externo.example/pages/detalle-incidencia.html?id=1', '//externo.example', 'javascript:alert(1)', '/pages/detalle-incidencia.html', '/pagina-inexistente.html']) {
      const busqueda = '?volver=' + encodeURIComponent(destino);
      assert.equal(retorno.enlaceAccesoConRetorno(ruta, busqueda), ruta);
      assert.equal(retorno.destinoTrasLogin(busqueda), '/index.html');
    }
  }
});

test('actualiza el enlace a registro y ambos enlaces de regreso al login', async () => {
  const { retorno, contexto } = await entorno();
  contexto.window.location.search = '?volver=' + encodeURIComponent('/pages/detalle-incidencia.html?id=3&origen=mapa');
  const enlaces = ['/pages/registro.html', '/pages/login.html', '/pages/login.html'].map(ruta => ({
    href: ruta, getAttribute() { return this.href; }, setAttribute(nombre, valor) { this.href = valor; }
  }));
  contexto.document.querySelectorAll = () => enlaces;
  retorno.conservarRetornoEnlaces();
  for (const enlace of enlaces) {
    assert.equal(new URL(enlace.href, 'http://localhost').searchParams.get('volver'), '/pages/detalle-incidencia.html?id=3&origen=mapa');
  }
});

test('guarda reportes con seguimiento de ocho dígitos, los integra al listado y permite apoyarlos', async () => {
  const e = await entorno();
  e.auth.iniciarSesion('test@unlam.com', 'Unlam2026!');
  e.contexto.crypto = require('node:crypto').webcrypto;
  const modulo = await e.cargar('guardar-reporte.js'); await modulo.evaluate();
  const datos = new FormData();
  for (const [clave, valor] of Object.entries({ categoria: 'bache', titulo: 'Bache nuevo', descripcion: 'Calzada dañada', direccion: 'Soler 450', lat: '-34.658', lng: '-58.670' })) datos.set(clave, valor);
  const primero = await modulo.namespace.guardarReporteLocal(datos);
  const segundo = await modulo.namespace.guardarReporteLocal(datos);
  assert.match(primero.numeroSeguimiento, /^RU\d{8}IT$/);
  assert.match(segundo.numeroSeguimiento, /^RU\d{8}IT$/);
  assert.notEqual(primero.numeroSeguimiento, segundo.numeroSeguimiento);
  assert.notEqual(primero.id, segundo.id);
  assert.equal(primero.estado, 'reportado');
  assert.equal(primero.lat, -34.658);
  assert.ok(Number.isFinite(Date.parse(primero.creadoEn)));
  const guardados = JSON.parse(e.localStorage.getItem('reportesUsuario'));
  assert.equal(guardados.length, 2);
  const reportes = (await e.cargar('reportes.js')).namespace.obtenerReportes();
  assert.ok(reportes.some(reporte => reporte.id === primero.id));
  e.auth.iniciarSesion('test@unlam.com', 'Unlam2026!');
  assert.equal(e.apoyo.registrarApoyo(primero.id).total, 1);
  e.localStorage.setItem = () => { throw new Error('Sin espacio'); };
  await assert.rejects(() => modulo.namespace.guardarReporteLocal(datos), /almacenamiento/);
  datos.set('titulo', '   ');
  await assert.rejects(() => modulo.namespace.guardarReporteLocal(datos), /datos/);
});

test('las fotos se almacenan como datos persistentes y no como URLs temporales', async () => {
  const e = await entorno();
  e.auth.iniciarSesion('test@unlam.com', 'Unlam2026!');
  e.contexto.crypto = require('node:crypto').webcrypto;
  e.contexto.FileReader = class {
    readAsDataURL() { this.result = 'data:image/png;base64,aW1hZ2Vu'; this.onload(); }
  };
  const modulo = await e.cargar('guardar-reporte.js'); await modulo.evaluate();
  const datos = new FormData();
  for (const [clave, valor] of Object.entries({ categoria: 'luminaria', titulo: 'Luz apagada', descripcion: 'Sin iluminación', lat: '-34.658', lng: '-58.670' })) datos.set(clave, valor);
  datos.append('fotografias', new Blob(['imagen'], { type: 'image/png' }), 'foto.png');
  const reporte = await modulo.namespace.guardarReporteLocal(datos);
  assert.equal(reporte.fotografias.length, 1);
  assert.match(reporte.imagen, /^data:image\/png;base64,/);
  assert.equal(JSON.parse(e.localStorage.getItem('reportesUsuario'))[0].fotografias[0], reporte.imagen);
});

test('acceso a Nuevo Reporte, retorno por registro y cierre de sesión', async () => {
  const e = await entorno();
  const contenido = { hidden: true };
  const enlaces = [{ href: '/pages/reporte.html' }, { href: '/pages/reporte.html' }];
  const eventos = new Map();
  let redireccion;
  e.contexto.document.querySelector = () => contenido;
  e.contexto.document.querySelectorAll = () => enlaces;
  e.contexto.document.addEventListener = (nombre, callback) => eventos.set(nombre, callback);
  e.contexto.window.location.replace = url => { redireccion = url; };
  const modulo = await e.cargar('acceso-reporte.js'); await modulo.evaluate();
  const acceso = modulo.namespace;
  acceso.configurarEnlacesReporte();
  assert.match(enlaces[0].href, /^\/pages\/login.html\?volver=/);
  assert.equal(acceso.exigirSesionReporte(), false);
  assert.equal(contenido.hidden, true);
  const login = new URL(redireccion, 'http://localhost');
  assert.equal(e.retorno.destinoTrasLogin(login.search), '/pages/reporte.html');
  const registro = new URL(e.retorno.enlaceAccesoConRetorno('/pages/registro.html', login.search), 'http://localhost');
  const vueltaLogin = new URL(e.retorno.enlaceAccesoConRetorno('/pages/login.html', registro.search), 'http://localhost');
  e.auth.registrarUsuario('Vecino', 'reporte@example.com', 'Prueba2026!');
  assert.equal(e.auth.obtenerUsuarioActual(), null);
  e.auth.iniciarSesion('reporte@example.com', 'Prueba2026!');
  assert.equal(e.retorno.destinoTrasLogin(vueltaLogin.search), '/pages/reporte.html');
  assert.equal(enlaces[0].href, '/pages/reporte.html');
  assert.equal(enlaces[1].href, '/pages/reporte.html');
  assert.equal(acceso.exigirSesionReporte(), true);
  assert.equal(contenido.hidden, false);
  e.auth.cerrarSesion();
  assert.equal(acceso.exigirSesionReporte(), false);
  assert.equal(contenido.hidden, true);
  assert.match(enlaces[0].href, /^\/pages\/login.html\?volver=/);
  assert.equal(e.retorno.destinoTrasLogin(''), '/index.html');
  assert.equal(e.retorno.destinoTrasLogin('?volver=https://externo.example/pages/reporte.html'), '/index.html');
  assert.equal(e.retorno.destinoTrasLogin('?volver=' + encodeURIComponent('/pages/detalle-incidencia.html?id=1&origen=mapa')), '/pages/detalle-incidencia.html?id=1&origen=mapa');
  const guardado = await e.cargar('guardar-reporte.js'); await guardado.evaluate();
  await assert.rejects(() => guardado.namespace.guardarReporteLocal(new FormData()), /sesión/);
  assert.equal(e.localStorage.getItem('reportesUsuario'), null);
});

test('popup sin sesión, retorno al detalle, estados sincronizados de detalle e inicio y cierre de sesión', async () => {
  const e = await entorno();
  const nodos = new Map();
  const eventos = new Map();
  function elemento() {
    const selectores = new Map();
    return {
      textContent: '', disabled: false, hidden: false, open: false, dataset: {},
      classList: { toggle() {} }, setAttribute() {},
      querySelector(selector) {
        if (!selectores.has(selector)) selectores.set(selector, elemento());
        return selectores.get(selector);
      },
      addEventListener(tipo, callback) { eventos.set(this.id + tipo, callback); },
      showModal() { this.open = true; }, close() { this.open = false; }
    };
  }
  const detalle = elemento(), inicio = elemento();
  for (const boton of [detalle, inicio]) { boton.dataset.apoyoId = '1'; boton.parentElement = elemento(); }
  e.contexto.document = {
    getElementById: id => nodos.get(id), querySelectorAll: () => [detalle, inicio],
    addEventListener: (tipo, callback) => eventos.set(tipo, callback),
    createElement: () => elemento(), body: { append: nodo => nodos.set(nodo.id, nodo) }
  };
  const ui = await e.cargar('apoyos-ui.js'); await ui.evaluate();
  ui.namespace.actualizarApoyos();
  eventos.get('click')({ target: { closest: () => detalle } });
  const popup = nodos.get('popupApoyo');
  assert.equal(popup.open, true);
  assert.equal(e.apoyo.obtenerApoyos(1).length, 0);
  assert.equal(popup.querySelector('a').href, e.retorno.enlaceLoginIncidencia(1));
  popup.close(); assert.equal(popup.open, false);
  e.auth.iniciarSesion('test@unlam.com', 'Unlam2026!');
  eventos.get('click')({ target: { closest: () => detalle } });
  for (const boton of [detalle, inicio]) {
    assert.equal(boton.querySelector('[data-total-apoyos]').textContent, 1);
    assert.equal(boton.disabled, true);
    assert.equal(boton.querySelector('[data-etiqueta-apoyo]').textContent, 'Ya indicaste que te afecta');
  }
  assert.equal(popup.open, false);
  eventos.get('click')({ target: { closest: () => inicio } });
  assert.equal(e.apoyo.obtenerApoyos(1).length, 1);
  e.auth.cerrarSesion();
  assert.equal(detalle.disabled, false);
  assert.equal(detalle.querySelector('[data-total-apoyos]').textContent, 1);
});
