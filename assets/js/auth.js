const CLAVE_USUARIOS = 'reporteUrbanoUsuarios';
const CLAVE_SESION = 'reporteUrbanoSesion';
const normalizarEmail = (email) => email.trim().toLowerCase();

// Demostración local: las cuentas se guardan solamente en este navegador.
function obtenerUsuarios() {
  const usuarios = JSON.parse(localStorage.getItem(CLAVE_USUARIOS) || '[]');
  if (!Array.isArray(usuarios)) throw new Error('Datos de usuarios inválidos.');
  if (!usuarios.some((usuario) => usuario.email === 'test@unlam.com')) {
    usuarios.push({ nombre: 'Usuario de prueba', email: 'test@unlam.com', password: 'Unlam2026!' });
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
  }
  return usuarios;
}

export function validarPasswordRegistro(password) {
  return password.length >= 8 && /[A-ZÁÉÍÓÚÜÑ]/.test(password) && /[!@#$%&*?._+=-]/.test(password);
}

export function registrarUsuario(nombre, email, password) {
  const usuarios = obtenerUsuarios();
  email = normalizarEmail(email);
  if (!nombre.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Datos inválidos.');
  if (!validarPasswordRegistro(password)) throw new Error('Contraseña inv?lida.');
  if (usuarios.some((usuario) => usuario.email === email)) throw new Error('Ya existe una cuenta con ese correo.');
  usuarios.push({ nombre: nombre.trim(), email, password });
  localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
}

export function iniciarSesion(email, password) {
  const usuario = obtenerUsuarios().find((usuario) => usuario.email === normalizarEmail(email) && usuario.password === password);
  if (!usuario) throw new Error('El correo o la contraseña son incorrectos.');
  localStorage.setItem(CLAVE_SESION, usuario.email);
}

export function obtenerEstadoSesion() {
  try {
    const usuarios = obtenerUsuarios();
    return usuarios.some((usuario) => usuario.email === localStorage.getItem(CLAVE_SESION));
  } catch {
    return false;
  }
}

export function cerrarSesion() {
  localStorage.removeItem(CLAVE_SESION);
  actualizarBotonHeader();
}

export function actualizarBotonHeader() {
  const contenedor = document.getElementById('contenedorBotonUsuario');
  if (!contenedor) return;
  if (obtenerEstadoSesion()) {
    contenedor.innerHTML = '<button class="botonMiPerfil" id="btnCerrarSesion" type="button">Cerrar sesión</button>';
    document.getElementById('btnCerrarSesion').addEventListener('click', cerrarSesion);
  } else {
    contenedor.innerHTML = '<a class="botonIngresar" href="/pages/login.html">Ingresar</a>';
  }
}

window.addEventListener('storage', actualizarBotonHeader);
