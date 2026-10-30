// Busca en la página el botón y la ofrenda completa
const boton = document.querySelector('#boton-vela');
const ofrenda = document.querySelector('#ofrenda');

// Esta función se ejecuta cada vez que alguien selecciona el botón
boton.addEventListener('click', () => {
  const encendida = ofrenda.classList.toggle('encendida');
  boton.setAttribute('aria-pressed', encendida);
  boton.textContent = encendida ? 'Apagar la vela' : 'Encender la vela';
});
