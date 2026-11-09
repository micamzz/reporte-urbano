import { cargarComponentesModulares } from './utils/include.js';
import { actualizarBotonHeader } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  await cargarComponentesModulares();
  actualizarBotonHeader();

  const formularioContacto = document.getElementById('formularioContacto');
  if (formularioContacto) {
    formularioContacto.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Mensaje enviado a la Municipalidad de Ituzaingó.');
    });
  }
});