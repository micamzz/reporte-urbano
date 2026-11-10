export async function cargarComponentesModulares() {
  try {
    const respuestaHeader = await fetch('/partials/header.html');
    if (respuestaHeader.ok) {
      document.getElementById('contenedorHeader').innerHTML = await respuestaHeader.text();
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
