let baseLength;
let minLength;
let lengthRatio;
let angleChange;
let leafDensity;
let leafColor;
let timer = 10;
let sound;
let fft;
let h = 0;
let x = 0;
let beat;
const threshold = 0.4;
const avgWindow = 20;
let lastPeak;
let rAVG = 0;
let spectrum;
let counter = 0;
let songs;
let sounds = [];
let currentSound;
let checkFirst = 0;
function windowResized() {
  resizeCanvas(windowWidth-40, windowHeight-50);
}

function preload() {
  loadStrings("assets/songlist.txt", setSongs);
}

function setSongs(result) {
  for (let i = 0; i < result.length; i++) {
    sound = loadSound(result[i]);
    sounds[i] = sound;
  }
}

function setup() {

  currentSound = sounds[floor(random(0, sounds.length))];
  createCanvas(windowWidth-40, windowHeight-50);
  fft = new p5.FFT();
  currentSound.amp(0.2);
  renewColors()
  background(120);
  //playSong();
  beat = millis();
  //currentSound.play();
  //fill(255,255,255);
  textSize(32);
  let message = "Press to Start";
  let messageWidth = textWidth(message);
  textAlign(CENTER);
  text(message,width/2, height/2);

}

function playSong() {

  if (!currentSound.isPlaying()) {
    currentSound = sounds[floor(random(sounds.length))];
    currentSound.play();
  }

}

function draw() {
 
  if (counter < rAVG && counter % 5 == 0) {
    renewColors();
    drawTree(width / 2, height, PI / 2, baseLength);
  } else if (counter > rAVG && checkFirst == 1) {
    counter = 0;
    background(120);
    
  }
  spectrum = fft.analyze();
  analyzeSong();
  drawSpectrumGraph();
  counter++;
  if(checkFirst == 1)
  {
    //console.log("HI");
    playSong();

  }
}

/* adapted from the following
https://spin.atomicobject.com/2022/04/26/generative-art-recursion/
*/
function drawTree(x, y, angle, length) {
  const [x1, y1] = [x, y];
  const x2 = x1 + cos(angle) * length;
  const y2 = y1 - sin(angle) * length;

  line(x1, y1, x2, y2);

  if (length >= minLength) {
    drawTree(x2, y2, angle + angleChange, length * lengthRatio);
    drawTree(x2, y2, angle - angleChange, length * lengthRatio);
  } else {
    drawLeaves(x2, y2);
  }
}

/* adapted from the following
https://spin.atomicobject.com/2022/04/26/generative-art-recursion/
*/
function drawLeaves(x, y) {
  push();

  fill(leafColor);
  noStroke();

  for (let i = 0; i < leafDensity; i++) {
    circle(randomGaussian(x, 10), randomGaussian(y, 10), random(2, 5));
  }

  pop();
}

// generate a tree from any place the mouse is clicked
function mouseClicked() {
  playSong();
  checkFirst = 1;
  renewColors();
  drawTree(mouseX, mouseY, PI / 2, baseLength);
}

// consolidated the changes into a function for reusability
function renewColors() {
  leafDensity = random(0, 3);
  leafColor = color(random(0, x), random(0, x), random(0, x));
  baseLength = random(height / 10, height / 4);
  minLength = random(1, 12);
  lengthRatio = random(0.25, 0.75);
  angleChange = random(PI / 24, PI/6 );
}

function countDown() {

  if (frameRate % 60 == 0 && timer > 0) {
    // if the frameCount is divisible by 60, then a second has passed. it will stop at 0
    timer--;
    redrawNewTree();
  } else if (timer == 0) {
    timer = rAVG;
  }
}

function redrawNewTree() {
  renewColors();
  drawTree(width / 2, height, PI / 2, baseLength);

}

function analyzeSong() {
  for (let i = 0; i < spectrum.length; i++) {
    x = map(i, 0, spectrum.length, 0, width);
    h = -height + map(spectrum[i], 0, 255, height, 0);
  }
}

let i = 0;
// Graphing code adapted from https://jankozeluh.g6.cz/index.html by Jan Koželuh
function drawSpectrumGraph() {
 
  let peak = 0;
  // compute a running average of values to avoid very
  // localized energy from triggering a beat.
  let runningAvg = 0;
  for (let i = 0; i < spectrum.length; i++) {
 
    runningAvg += spectrum[i] / avgWindow;
    if (i >= avgWindow) {
      runningAvg -= spectrum[i] / avgWindow;
    }
    if (runningAvg > peak) {
      peak = runningAvg;
    }
  }

  // any time there is a sudden increase in peak energy, call that a beat
  if (peak > lastPeak * (1 + threshold)) {
    beat = millis();

  }
  lastPeak = peak;
  rAVG = runningAvg;
  
}