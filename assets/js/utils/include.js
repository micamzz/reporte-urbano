export async function cargarComponentesModulares() {
  try {
    const respuestaHeader = await fetch('/partials/header.html');
    if (respuestaHeader.ok) {
      document.getElementById('contenedorHeader').innerHTML = await respuestaHeader.text();
    }

    const respuestaFooter = await fetch('/partials/footer.html');
    if (respuestaFooter.ok) {
      document.getElementById('contenedorFooter').innerHTML = await respuestaFooter.text();
    }
  } catch (error) {
    console.error('Error al cargar componentes parciales:', error);
  }
}