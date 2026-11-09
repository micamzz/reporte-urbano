let usuarioLogueado = false;

export function obtenerEstadoSesion() {
  return usuarioLogueado;
}

export function actualizarBotonHeader() {
  const contenedorBoton = document.getElementById('contenedorBotonUsuario');
  if (!contenedorBoton) return;

  if (usuarioLogueado) {
    contenedorBoton.innerHTML = `
      <button class="botonMiPerfil" id="btnPerfilHeader">Mi Perfil</button>
    `;
    document.getElementById('btnPerfilHeader').addEventListener('click', () => {
      window.location.href = '/pages/perfil.html';
    });
  } else {
    contenedorBoton.innerHTML = `
      <a class="botonIngresar" id="btnIngresarHeader" href="/pages/login.html">Ingresar</a>
    `;
  }
}

export function alternarEstadoSesion() {
  usuarioLogueado = !usuarioLogueado;
  actualizarBotonHeader();
}
