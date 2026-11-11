import { cargarComponentesModulares } from './utils/include.js';
import { actualizarBotonHeader, iniciarSesion } from './auth.js';
import { destinoTrasLogin } from './retorno-login.js';

const formulario = document.getElementById('formularioLogin');
const email = document.getElementById('emailLogin');
const password = document.getElementById('passwordLogin');
const mensaje = document.getElementById('mensajeAcceso');

function mostrarError(input, elementoError, texto) {
  elementoError.textContent = texto;
  input.setAttribute('aria-invalid', texto ? 'true' : 'false');
}

function validarEmail() {
  const valor = email.value.trim();
  let error = '';
  if (!valor) error = 'Ingresá tu correo electrónico.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) error = 'Ingresá un correo electrónico válido.';
  mostrarError(email, document.getElementById('errorEmail'), error);
  return !error;
}

function validarPassword() {
  const error = password.value ? '' : 'Ingresá tu contraseña.';
  mostrarError(password, document.getElementById('errorPassword'), error);
  return !error;
}

email.addEventListener('blur', validarEmail);
password.addEventListener('blur', validarPassword);
email.addEventListener('input', () => {
  if (email.getAttribute('aria-invalid') === 'true') validarEmail();
});
password.addEventListener('input', () => {
  if (password.getAttribute('aria-invalid') === 'true') validarPassword();
});

// Enter avanza por los campos; no envía el formulario desde un input.
formulario.addEventListener('keydown', (evento) => {
  if (evento.key !== 'Enter' || evento.target.tagName !== 'INPUT') return;
  evento.preventDefault();
  if (evento.target === email) {
    if (validarEmail()) password.focus();
  } else if (evento.target === password) {
    if (validarPassword()) formulario.querySelector('.botonAcceso').focus();
  }
});

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();
  mensaje.textContent = '';
  const emailValido = validarEmail();
  const passwordValida = validarPassword();
  if (!emailValido) email.focus();
  else if (!passwordValida) password.focus();
  else {
    try {
      iniciarSesion(email.value, password.value);
      window.location.href = destinoTrasLogin();
    } catch (error) {
      mensaje.textContent = error.message === 'El correo o la contraseña son incorrectos.'
        ? error.message
        : 'No se pudo acceder al almacenamiento local. Revisá que esté habilitado en tu navegador.';
    }
  }
});

document.getElementById('enlaceRecuperar')?.addEventListener('click', (evento) => {
  evento.preventDefault();
  mensaje.textContent = 'La recuperación de contraseña todavía no está disponible.';
});

document.addEventListener('DOMContentLoaded', async () => {
  await cargarComponentesModulares();
  actualizarBotonHeader();
});
