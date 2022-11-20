let camera, scene, renderer, controls, model;

// JS Audio API //////////////

const audio = document.getElementById('audio'); // access DOM audio element

const audioContext = new AudioContext(); // interface (audio processing graph)
// note: this method of creating the audio context is not yet supported in Safari
let src = audioContext.createMediaElementSource(audio); // give audio context an audio source
const analyser = audioContext.createAnalyser(); // analyzer for the audio context

src.connect(analyser); // connect audio context source to the analyzer
analyser.connect(audioContext.destination); // end destination of audio graph (sends sound to speakers)

analyser.smoothingTimeConstant = 0.95;

audio.addEventListener('play', function() {
    audioContext.resume();
});

// Fast Fourier Transform analysis size
// this value can be a multiple of 8 from 32 to 32768
analyser.fftSize = 256;
// (FFT) is an algorithm that samples a signal over a period of time and divides it into its frequency components (single sinusoidal oscillations)
// It separates the mixed signals and shows what frequency is a violent vibration.
// (FFTSize) represents the window size in samples that is used when performing a FFT

const bufferLength = analyser.frequencyBinCount; // read-only property
console.log(bufferLength);
// unsigned integer, half of fftSize (so in this case, bufferLength = 128)
// Equates to number of data values you have to play with for the visualization
// A bin is a spectrum sample, and defines the frequency resolution of the window.

const dataArray = new Uint8Array(bufferLength); // convert to 8-bit unsigned integer array
console.log(dataArray);
// At this point dataArray is an array with length of bufferLength but no values yet

const canvas = document.getElementById('back');
const context = canvas.getContext('2d');
const grainCanvas = document.getElementById('grain');
const grainContext = grainCanvas.getContext('2d');

let width;
let height;

// get ratio of the resolution in physical pixels to the resolution in CSS pixels
let pxScale = window.devicePixelRatio;

const liquid = document.getElementById('liquid');
const grain = document.getElementById('risograph');

function setup() {
  // make sure video begins to play (some browsers diregard autoplay attribute)
  liquid.play();
  risograph.play();

  // full browser canvas
  width = window.innerWidth;
  height = window.innerHeight;

  // set the CSS display size
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  canvas.width = width * pxScale;
  canvas.height = height * pxScale;
  grainCanvas.style.width = width + 'px';
  grainCanvas.style.height = height + 'px';
  grainCanvas.width = width * pxScale;
  grainCanvas.height = height * pxScale;

  // normalize the coordinate system
  context.scale(pxScale, pxScale);
  grainContext.scale(pxScale, pxScale);
}

function draw() {
  context.drawImage(liquid, 0, 0, canvas.width, canvas.height);
  grainContext.drawImage(grain, 0, 0, grainCanvas.width, grainCanvas.height);

  requestAnimationFrame(draw);
}

function init() {
  // SETUP
  scene = new THREE.Scene();
  let width = window.innerWidth;
  let height = window.innerHeight;

  // CAMERA
  camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 25000);
  camera.position.set(0, 0, 12);
  scene.add(camera);

  // LIGHTING
  let spotlight = new THREE.DirectionalLight(0xdcfaf3, 5); // color, intensity, distance
  spotlight.position.set(500, 500, 500);
  spotlight.castShadow = true;
  spotlight.shadow.mapSize.width = 4096; // shadow map texture width
  spotlight.shadow.mapSize.height = 4096; // shadow map texture height
  spotlight.shadow.camera.near = 500; // perspective shadow camera frustum near parameter
  spotlight.shadow.camera.far = 2000; // perspective shadow camera frustum far parameter
  spotlight.shadow.camera.fov = 45; // perspective shadow camera frustum field of view parameter
  scene.add(spotlight);

  let loader = new THREE.GLTFLoader();

  // LOAD ICE CUBES MODEL
  loader.load(
      'media/ice.gltf',
      function (gltf) {
          model = gltf.scene
          scene.add(model);
      })
 
  // RENDER
  renderer = new THREE.WebGLRenderer({alpha: 1, antialias: true});
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;

  // ORBIT CONTROLS
  controls = new THREE.OrbitControls(camera, renderer.domElement);

  document.body.appendChild(renderer.domElement);
}

// ANIMATE
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera); 

  let date = new Date(); // get date string
  let timer = date.getTime() * 0.0004; // get time string, changing speed
  camera.position.y = 20 * Math.cos(timer);
  camera.position.x = 10 * Math.cos(timer); // multiplier changes X coordinate
  camera.position.z = 10 * Math.sin(timer); // multiplier changes Z coordinate

  controls.update();
}

window.addEventListener('load', () => {
  setup();
  draw();
  init();
  animate();
});

// window.addEventListener('resize', () => {
//   init();
//   animate();
// });