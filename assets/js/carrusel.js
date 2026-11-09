
document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('trackCarrusel');
  const slides = document.querySelectorAll('.diapositivaCarrusel');
  const btnAnterior = document.getElementById('btnAntCarrusel');
  const btnSiguiente = document.getElementById('btnSigCarrusel');
  const indicadores = document.querySelectorAll('.puntoCarrusel');

  if (!track || !slides.length || !btnAnterior || !btnSiguiente) return;

  let indiceActual = 0;
  let intervalo;

  function mostrarSlide(indice) {
    indiceActual = (indice + slides.length) % slides.length;

    track.style.transform = `translateX(-${indiceActual * 100}%)`;

    slides.forEach((slide, i) => {
      slide.classList.toggle('activa', i === indiceActual);
    });

    indicadores.forEach((punto, i) => {
      punto.classList.toggle('activo', i === indiceActual);
    });
  }

  function siguiente() {
    mostrarSlide(indiceActual + 1);
  }

  function anterior() {
    mostrarSlide(indiceActual - 1);
  }

  function iniciarAutoplay() {
    detenerAutoplay();
    intervalo = setInterval(siguiente, 4000);
  }

  function detenerAutoplay() {
    clearInterval(intervalo);
  }

  btnSiguiente.addEventListener('click', () => {
    siguiente();
    iniciarAutoplay();
  });

  btnAnterior.addEventListener('click', () => {
    anterior();
    iniciarAutoplay();
  });

  indicadores.forEach((punto, i) => {
    punto.addEventListener('click', () => {
      mostrarSlide(i);
      iniciarAutoplay();
    });
  });

  const contenedor = document.querySelector('.contenedorCarrusel');

  contenedor.addEventListener('mouseenter', detenerAutoplay);
  contenedor.addEventListener('mouseleave', iniciarAutoplay);

  mostrarSlide(0);
  iniciarAutoplay();
});
