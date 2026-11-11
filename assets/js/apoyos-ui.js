import { obtenerEstadoApoyo, registrarApoyo, PREFIJO_APOYOS } from './apoyos.js';
import { obtenerUsuarioActual } from './auth.js';
import { enlaceLoginIncidencia } from './retorno-login.js';

function mostrarAcceso(id) {
  let popup = document.getElementById('popupApoyo');
  if (!popup) {
    popup = document.createElement('dialog');
    popup.id = 'popupApoyo';
    popup.className = 'popupApoyo';
    popup.setAttribute('aria-labelledby', 'tituloPopupApoyo');
    popup.setAttribute('aria-describedby', 'descripcionPopupApoyo');
    popup.innerHTML = `<button class="cerrarPopupApoyo" type="button" aria-label="Cerrar">×</button>
      <span class="iconoPopupApoyo"><i class="fa fa-user-o" aria-hidden="true"></i></span>
      <h2 id="tituloPopupApoyo">¿Te afecta también?</h2>
      <p id="descripcionPopupApoyo">Iniciá sesión para apoyar esta incidencia y mostrar que es un problema en tu barrio.</p>
      <a class="botonAfectado enlaceLoginApoyo">Iniciar sesión</a><button class="cancelarPopupApoyo" type="button">Ahora no</button>`;
    document.body.append(popup);
    popup.querySelector('.cerrarPopupApoyo').addEventListener('click', () => popup.close());
    popup.querySelector('.cancelarPopupApoyo').addEventListener('click', () => popup.close());
    popup.addEventListener('click', evento => {
      const rect = popup.getBoundingClientRect();
      if (evento.target === popup && (evento.clientX < rect.left || evento.clientX > rect.right || evento.clientY < rect.top || evento.clientY > rect.bottom)) popup.close();
    });
  }
  popup.querySelector('a').href = enlaceLoginIncidencia(id);
  if (!popup.open) popup.showModal();
}

export function actualizarApoyos() {
  document.querySelectorAll('[data-apoyo-id]').forEach(boton => {
    const mensaje = boton.parentElement.querySelector('[data-error-apoyo]');
    try {
      const estado = obtenerEstadoApoyo(boton.dataset.apoyoId);
      boton.querySelector('[data-total-apoyos]').textContent = estado.total;
      boton.querySelector('[data-etiqueta-apoyo]').textContent = estado.apoyado ? 'Ya indicaste que te afecta' : 'A mí también me afecta';
      boton.disabled = estado.apoyado;
      boton.classList.toggle('apoyoRegistrado', estado.apoyado);
      boton.setAttribute('aria-pressed', String(estado.apoyado));
    } catch {
      if (mensaje) mensaje.textContent = 'No se pudieron leer los apoyos. Revisá el almacenamiento de tu navegador.';
      boton.disabled = true;
    }
  });
  if (obtenerUsuarioActual()) document.getElementById('popupApoyo')?.close();
}

document.addEventListener('click', evento => {
  const boton = evento.target.closest('[data-apoyo-id]');
  if (!boton || boton.disabled) return;
  const mensaje = boton.parentElement.querySelector('[data-error-apoyo]');
  if (mensaje) mensaje.textContent = '';
  try {
    const resultado = registrarApoyo(boton.dataset.apoyoId);
    if (resultado.requiereSesion) mostrarAcceso(boton.dataset.apoyoId);
    else actualizarApoyos();
  } catch (error) {
    if (mensaje) mensaje.textContent = 'No pudimos guardar tu apoyo. Revisá que el almacenamiento local esté habilitado e intentá nuevamente.';
  }
});

window.addEventListener('apoyosActualizados', actualizarApoyos);
window.addEventListener('sesionActualizada', actualizarApoyos);
window.addEventListener('pageshow', actualizarApoyos);
window.addEventListener('storage', evento => {
  if (!evento.key || evento.key.startsWith(PREFIJO_APOYOS) || ['reporteUrbanoSesion', 'reporteUrbanoUsuarios'].includes(evento.key)) actualizarApoyos();
});
