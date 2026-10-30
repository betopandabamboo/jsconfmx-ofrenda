// Busca en la página el botón y la ofrenda completa
const boton = document.querySelector('#boton-vela');
const ofrenda = document.querySelector('#ofrenda');

// Esta función se ejecuta cada vez que alguien selecciona el botón
boton.addEventListener('click', () => {
  const encendida = ofrenda.classList.toggle('encendida');
  boton.setAttribute('aria-pressed', encendida);
  boton.textContent = encendida ? 'Apagar la fiesta de Apple' : 'Encender la fiesta de Apple';
});

// Scratch sintetizado en el navegador; el audio empieza solo al tocar un disco.
let audio;
let scratch;
let silencio;
function rayar(velocidad) {
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) return;
  if (!audio) {
    audio = new AudioEngine();
    const buffer = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) {
      // Ruido modulado: textura rítmica de un surco de vinilo.
      samples[i] = (Math.random() * 2 - 1) * (0.35 + 0.65 * Math.abs(Math.sin(i / audio.sampleRate * 180)));
    }
    const source = audio.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = audio.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 2;
    const gain = audio.createGain();
    gain.gain.value = 0;
    source.connect(filter).connect(gain).connect(audio.destination);
    source.start();
    scratch = { source, filter, gain };
  }
  audio.resume().catch(() => {});
  const rapidez = Math.min(Math.abs(velocidad), 35);
  const ahora = audio.currentTime;
  scratch.source.playbackRate.setTargetAtTime(0.3 + rapidez / 12, ahora, 0.015);
  scratch.filter.frequency.setTargetAtTime((velocidad < 0 ? 650 : 1100) + rapidez * 95, ahora, 0.015);
  scratch.gain.gain.cancelScheduledValues(ahora);
  scratch.gain.gain.setTargetAtTime(0.22, ahora, 0.008);
  clearTimeout(silencio);
  silencio = setTimeout(callar, 90);
}
function callar() {
  if (scratch) scratch.gain.gain.setTargetAtTime(0, audio.currentTime, 0.015);
}

document.querySelectorAll('.tornamesa').forEach((disco) => {
  let pointer = null;
  let anterior = 0;
  let giro = 0;
  const angulo = (event) => {
    const rect = disco.getBoundingClientRect();
    return Math.atan2(event.clientY - rect.top - rect.height / 2, event.clientX - rect.left - rect.width / 2) * 180 / Math.PI;
  };
  disco.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || pointer !== null) return;
    pointer = event.pointerId;
    anterior = angulo(event);
    disco.setPointerCapture(pointer);
    disco.classList.add('rayando');
    rayar(3);
  });
  disco.addEventListener('pointermove', (event) => {
    if (event.pointerId !== pointer) return;
    const actual = angulo(event);
    const delta = ((actual - anterior + 540) % 360) - 180;
    anterior = actual;
    giro += delta;
    disco.style.setProperty('--giro', `${giro}deg`);
    if (Math.abs(delta) > 0.2) rayar(delta);
  });
  const soltar = () => {
    pointer = null;
    disco.classList.remove('rayando');
    callar();
  };
  disco.addEventListener('pointerup', soltar);
  disco.addEventListener('pointercancel', soltar);
  disco.addEventListener('lostpointercapture', soltar);
  disco.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', ' '].includes(event.key)) return;
    event.preventDefault();
    const delta = event.key === 'ArrowLeft' ? -25 : 25;
    giro += delta;
    disco.classList.add('rayando');
    disco.style.setProperty('--giro', `${giro}deg`);
    rayar(delta);
  });
  disco.addEventListener('keyup', soltar);
  disco.addEventListener('blur', soltar);
});
window.addEventListener('blur', callar);

// Mantiene el recorrido de las notas hasta la esfera en cualquier pantalla.
const cabina = document.querySelector('.cabina');
const esfera = document.querySelector('.disco-bola');
function ajustarRecorridoNotas() {
  const origen = cabina.getBoundingClientRect();
  const destino = esfera.getBoundingClientRect();
  const recorrido = Math.max(200, origen.top + origen.height * 0.6 - destino.top);
  cabina.style.setProperty('--recorrido-notas', `${recorrido}px`);
}
ajustarRecorridoNotas();
window.addEventListener('resize', ajustarRecorridoNotas);
if (typeof ResizeObserver !== 'undefined') {
  new ResizeObserver(ajustarRecorridoNotas).observe(ofrenda);
}
if (document.fonts) document.fonts.ready.then(ajustarRecorridoNotas);
