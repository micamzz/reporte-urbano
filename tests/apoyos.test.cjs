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
