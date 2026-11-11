import { cargarComponentesModulares } from './utils/include.js';
import { actualizarBotonHeader, registrarUsuario, validarPasswordRegistro } from './auth.js';
import { conservarRetornoEnlaces } from './retorno-login.js';

conservarRetornoEnlaces();

const formulario = document.getElementById('formularioRegistro');
const nombre = document.getElementById('nombreRegistro');
const email = document.getElementById('emailRegistro');
const password = document.getElementById('passwordRegistro');
const mensaje = document.getElementById('mensajeRegistro');

function mostrarError(input, idError, texto) {
  document.getElementById(idError).textContent = texto;
  input.setAttribute('aria-invalid', texto ? 'true' : 'false');
}

function validarNombre() {
  const error = nombre.value.trim() ? '' : 'Ingresá tu nombre.';
  mostrarError(nombre, 'errorNombre', error);
  return !error;
}

function validarEmail() {
  const valor = email.value.trim();
  let error = '';
  if (!valor) error = 'Ingresá tu correo electrónico.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) error = 'Ingresá un correo electrónico válido.';
  mostrarError(email, 'errorEmail', error);
  return !error;
}

function validarPassword() {
  let error = '';
  if (!password.value) error = 'Ingresá una contraseña.';
  else if (!validarPasswordRegistro(password.value)) error = 'Usá al menos 8 caracteres, una mayúscula y un símbolo permitido: ! @ # $ % & * ? . _ + - =';
  mostrarError(password, 'errorPassword', error);
  return !error;
}

const validadores = new Map([[nombre, validarNombre], [email, validarEmail], [password, validarPassword]]);
for (const [input, validar] of validadores) {
  input.addEventListener('blur', validar);
  input.addEventListener('input', () => {
    if (input.getAttribute('aria-invalid') === 'true') validar();
  });
}

formulario.addEventListener('keydown', (evento) => {
  if (evento.key !== 'Enter' || !validadores.has(evento.target)) return;
  evento.preventDefault();
  const orden = [nombre, email, password];
  const indice = orden.indexOf(evento.target);
  if (validadores.get(evento.target)()) {
    if (indice < orden.length - 1) orden[indice + 1].focus();
    else formulario.querySelector('.botonAcceso').focus();
  }
});

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();
  mensaje.textContent = '';
  const resultados = [validarNombre(), validarEmail(), validarPassword()];
  const primerInvalido = [nombre, email, password][resultados.indexOf(false)];
  if (primerInvalido) {
    primerInvalido.focus();
    return;
  }
  try {
    registrarUsuario(nombre.value, email.value, password.value);
    formulario.reset();
    document.getElementById('popupRegistroExitoso').showModal();
  } catch (error) {
    mensaje.textContent = error.message === 'Ya existe una cuenta con ese correo.'
      ? error.message
      : 'No se pudo guardar la cuenta. Revisá que el almacenamiento local esté habilitado en tu navegador.';
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  await cargarComponentesModulares();
  actualizarBotonHeader();
});
