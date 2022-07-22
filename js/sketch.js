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
var w1 = window.innerWidth;
var h1 = window.innerHeight; 
let button;
let textMessage = "Play";
let distribution = [];
let localY = 0;
function windowResized() {
  resizeCanvas(window.innerWidth,window.innerHeight);
  setBackground();
  createDistribution();
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
  createDistribution();
  currentSound = sounds[floor(random(0, sounds.length))];
  createCanvas(w1, h1);
  //fullscreen(true);
  fft = new p5.FFT();
  currentSound.amp(0.2);
  renewColors()
  setBackground();
  //playSong();
  beat = millis();
  //currentSound.play();
  //fill(255,255,255);
 
  if(checkFirst == 0)
  {
 //   button = createButton('Play');
 //   textAlign(CENTER)
    //button.position(width/2, height/2);
 //   button.position(20, 120);
 //   button.size(75,50);
  //  button.mousePressed(changePlay);
  //  textSize(32);
  //  let message = "Press to Start";
  //  textAlign(CENTER);
   // text(message,width/2, height/2);
  }
}

function playSong() {

  if (!currentSound.isPlaying() && checkFirst == 1) {
currentSound = sounds[floor(random(sounds.length))];
    currentSound.play();
  }

}

function draw() {
  
  
  if (counter < rAVG && counter % 5 == 0) {
    renewColors();
    drawTree(floor(random(width)), height, PI / 2, baseLength);
  } else if (counter > rAVG && checkFirst == 1) {
    counter = 0;
    setBackground();
    
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
  
  push();
  fill(0, 0, 0);
  noStroke();
  //rect(20, 20, w1-40, h1-40);
  rect(20, 0, w1-40, 20);
  rect(0, 0, 20, h1-20);
  rect(0, h1-20, w1-20, 20);
  rect(w1-20, 0, w1, h1);
  pop();

  push();
  fill(0);
  stroke(0, 0, 0);
  bezier(20,20,width/3,100, width*2/3, 40, width,20);
  fill(255);
  textSize(28);
  textAlign(CENTER);
  text(textMessage, width/2-50, 40);
  pop();
 
 // y2+=random(1,10);
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
  
  // altered to create a more leaf type
  for (let i = 0; i < leafDensity; i++) {
    ellipse(randomGaussian(x, 15), randomGaussian(y, 20), random(2, 5),random(1, 10));
 //  ellipse(x, localY, random(2, 5),random(1, 10));
     
   
  }
 
  pop();
}

// generate a tree from any place the mouse is clicked
function mouseClicked() {
 // playSong();
  //checkFirst = 1;
 // console.log("mouseX: " + mouseX + ": mouseY:" + mouseY + ":" + floor(width/2)-50);
  if(mouseX >= floor(width/2)-90 && mouseX < floor(width/2) + 70 && mouseY >= 10 && mouseY < 70)
  {
    changePlay();
  }
  renewColors();
  drawTree(mouseX, mouseY, PI / 2, baseLength);
}

// consolidated the changes into a function for reusability
function renewColors() {
  leafDensity = random(0, 5);
  leafColor = color(random(0, x/3), random(0, x/2), random(0, x/4));
  baseLength = random(height / 10, height / 4);
  minLength = random(1, 12);
  lengthRatio = random(0.25, 0.65);
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

function changePlay()
{
  //if(button.html() == "Play")
  if(textMessage == "Play")
  {
    setBackground();
   // button.html("Pause");
   textMessage = "Pause";
    playSong();
    checkFirst = 1;
  }
  //else if(button.html() == "Pause")
  else if(textMessage == "Pause")
  {
    
    setBackground();
    //button.html("Play");
    textMessage = "Play";
    currentSound.pause(); 
    checkFirst = 0;
  }
  
}

function createDistribution()
{
 // for (let i = 0; i < 10; i++) {
 //   distribution[i] = floor(randomGaussian() * 60); 
 // }
}

function setBackground()
{
  background(38,54,38);
}