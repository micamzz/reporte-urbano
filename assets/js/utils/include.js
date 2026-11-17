export async function cargarComponentesModulares() {
  try {
    const respuestaHeader = await fetch('/partials/header.html');
    if (respuestaHeader.ok) {
      const contenedorHeader = document.getElementById('contenedorHeader');
      contenedorHeader.innerHTML = await respuestaHeader.text();

      const encabezado = contenedorHeader.querySelector('.encabezadoPrincipal');
      const botonMenu = encabezado.querySelector('.botonMenuMovil');
      const navegacion = encabezado.querySelector('.navegacionMenu');
      const cerrarMenu = () => {
        navegacion.classList.remove('menuAbierto');
        botonMenu.setAttribute('aria-expanded', 'false');
        botonMenu.setAttribute('aria-label', 'Abrir menú de navegación');
      };

      botonMenu.addEventListener('click', () => {
        const abierto = botonMenu.getAttribute('aria-expanded') !== 'true';
        navegacion.classList.toggle('menuAbierto', abierto);
        botonMenu.setAttribute('aria-expanded', String(abierto));
        botonMenu.setAttribute('aria-label', abierto ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
      });

      navegacion.addEventListener('click', evento => {
        if (evento.target instanceof Element && evento.target.closest('a')) cerrarMenu();
      });

      document.addEventListener('click', evento => {
        if (!encabezado.contains(evento.target)) cerrarMenu();
      });

      document.addEventListener('keydown', evento => {
        if (evento.key === 'Escape' && botonMenu.getAttribute('aria-expanded') === 'true') {
          cerrarMenu();
          botonMenu.focus();
        }
      });
    }

    const respuestaFooter = await fetch('/partials/footer.html');
    if (respuestaFooter.ok) {
      const documentoFooter = new DOMParser().parseFromString(await respuestaFooter.text(), 'text/html');
      const footer = documentoFooter.querySelector('footer');
      if (footer) document.getElementById('contenedorFooter').replaceChildren(footer);
    }
  } catch (error) {
    console.error('Error al cargar componentes parciales:', error);
  }
}
