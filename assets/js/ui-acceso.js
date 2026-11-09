// Controles visuales compartidos; no intervienen en el envío ni la validación.
const trazos = {
  email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  text: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  password: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4M12 14v3"/>'
};
const ojo = '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>';
const svg = (trazo) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${trazo}</svg>`;

document.querySelectorAll('.campoAcceso input').forEach((input) => {
  const tipo = input.type;
  const contenedor = document.createElement('div');
  contenedor.className = 'entradaAcceso';
  input.before(contenedor);
  const icono = document.createElement('span');
  icono.className = 'iconoEntrada';
  icono.innerHTML = svg(trazos[tipo] || trazos.text);
  contenedor.append(icono, input);

  if (tipo !== 'password') return;
  input.classList.add('conVisibilidad');
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'alternarPassword';
  boton.setAttribute('aria-label', 'Mostrar contraseña');
  boton.setAttribute('aria-controls', input.id);
  boton.setAttribute('aria-pressed', 'false');
  boton.innerHTML = svg(ojo);
  boton.addEventListener('click', () => {
    const visible = input.type === 'password';
    input.type = visible ? 'text' : 'password';
    boton.setAttribute('aria-pressed', String(visible));
    boton.setAttribute('aria-label', visible ? 'Ocultar contraseña' : 'Mostrar contraseña');
    boton.innerHTML = svg(ojo + (visible ? '<path d="m3 3 18 18"/>' : ''));
  });
  contenedor.append(boton);
});

// Volver a ocultar la contraseña cuando el registro limpia el formulario.
document.querySelectorAll('.formularioAcceso').forEach((formulario) => {
  formulario.addEventListener('reset', () => {
    formulario.querySelectorAll('.alternarPassword[aria-pressed="true"]').forEach((boton) => boton.click());
  });
});
