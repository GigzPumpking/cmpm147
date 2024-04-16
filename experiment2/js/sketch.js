// sketch.js - purpose and description here
// Author: Hung Nguyen
// Date: 4/16/2024

// Constants - User-servicable parts
let seed = 239;
const oceanColor = "#1E3E47";
const skyColor = "#6C8989";
const sunColor = "#fefce8";
const birdColor = "#33330b";

// Globals
let myInstance;
let canvasContainer;
var centerHorz, centerVert;


function generateSky(h) {
  beginShape();
  vertex(0, height / 2);
  const steps = 15;
  for (let i = 0; i < steps + 1; i++) {
    let x = (width * i) / steps;
    let y =
      h - 75*random(0.25, 0.5) + i*5;
    vertex(x, y);
  }
  vertex(width, height / 2);
  endShape(CLOSE);
}

function generateWave(h) {
  const scrub = mouseX/width;
  beginShape();
  vertex(0, h);
  for (let i = 0; i < width; i += 20) {
    let x = i;
    let y = h + random(-10, 10*scrub);
    curveVertex(x, y);
  }
  vertex(width, h);
  endShape();
}


function resizeScreen() {
  centerHorz = canvasContainer.width() / 2; // Adjusted for drawing logic
  centerVert = canvasContainer.height() / 2; // Adjusted for drawing logic
  console.log("Resizing...");
  resizeCanvas(canvasContainer.width(), canvasContainer.height());
  // redrawCanvas(); // Redraw everything based on new size
}

// setup() function is called once when the program starts
function setup() {
  $("#reimagine").click(() => seed++);
  // place our canvas, making it fit our container
  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  canvas.parent("canvas-container");

  $(window).resize(function() {
    resizeScreen();
  });
  resizeScreen();
}

// draw() function is called repeatedly, it's the main animation loop
function draw() {
  randomSeed(seed);

  background(100);

  noStroke();

  fill(skyColor);
  rect(0, 0, width, height / 2);

  // Back Sun Sky Color
  fill(248, 201, 104, 150);
  generateSky(height / 3.25)
  
  // Front Sun Sky Color
  fill(224, 149, 60, 100);
  generateSky(height / 2.5);
  
  // 2nd Front Sky Color
  fill(224, 149, 60, 192);
  generateSky(height / 2.25);
  
  fill(sunColor);
  circle(random(0.15, 0.2) * width, height / 2.75, random(0.75, 1)*50);
  
  fill(oceanColor);
  beginShape();
  vertex(0, height / 2);
  for (let i = 0; i < width; i += 20) {
    let x = i;
    let y = height / 2 + random(-5, 5);
    curveVertex(x, y);
  }
  vertex(width, height / 2);
  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);
  
  // Ocean Lines
  noFill();
  const waveCount = 15 * random(0.75, 1.25);
  for (let i = 0; i < waveCount; i++) {
     stroke(101 + random(-10, 10), 101 + random(-10, 10), 101 + random(-10, 10), 192);
     generateWave(height / 1.75 + height*random()); 
  }
  
  fill(birdColor);
  const randTreeCount = random(0.75, 1.25);
  const trees = 200*randTreeCount;
  const scrub = mouseX/width;
  for (let i = 0; i < trees; i++) {
    let z = random();
    let x = width * ((random() + (scrub/50 + millis() / 500000.0) / z) % 1);
    let sRand = random(0.5, 1);
    let s = width / 50 / sRand;
    let yRand = random(0.25, 1.25);
    let y = height / 3 * yRand;
    triangle(x, y + s / 2, x - s / 4, y + 5*random(), x + s / 4, y - 5*random());
  }
}

// mousePressed() function is called once after every time a mouse button is pressed
function mousePressed() {
    // code to run when mouse is pressed
}