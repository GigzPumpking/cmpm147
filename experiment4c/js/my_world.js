"use strict";

/* global XXH */
/* exported --
    p3_preload
    p3_setup
    p3_worldKeyChanged
    p3_tileWidth
    p3_tileHeight
    p3_tileClicked
    p3_drawBefore
    p3_drawTile
    p3_drawSelectedTile
    p3_drawAfter
*/

function p3_preload() {}

function p3_setup() {
  
}


let worldSeed;

let clicks = {};

let clickedArea = {};

let colorOffset = 0;

function p3_worldKeyChanged(key) {
  worldSeed = XXH.h32(key, 0);
  noiseSeed(worldSeed);
  randomSeed(worldSeed);
  
  colorOffset = Math.floor(random(-100, 100));
  
  clicks = {};
  clickedArea = {};
}

let tileWidth = 16;
let tileHeight = 8;

function p3_tileWidth() {
  return tileWidth;
}
function p3_tileHeight() {
  return tileHeight;
}

function p3_adjustTileDimensions(num) {
  if (num > 0 && num <= 200) {
    tileWidth = 16*(num/100);
    tileHeight = 8*(num/100); 
  }
}

let [tw, th] = [p3_tileWidth(), p3_tileHeight()];

let blockSize = p3_tileWidth();

function p3_tileClicked(i, j, event) {
  let key = [i, j];
  
  if (event.button === 0) { // Left Click
    let hash = XXH.h32("" + [i, j], worldSeed).toNumber();
    let minHeight = hash % 5 + 5;
    let rippleHeight = Math.floor(random(minHeight, 16)); // Adjust this value to control the intensity of the ripple
    clicks[key] = rippleHeight;
    clickedArea[key] = 1;

    // Add ripple effects to surrounding tiles
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx !== 0 || dy !== 0) { // Exclude the clicked tile itself
          let neighborKey = [i + dx, j + dy];
          // Calculate distance from clicked tile to neighbor tile
          let distance = Math.sqrt(dx * dx + dy * dy);
          // Decrease neighbor tile's height based on distance from clicked tile
          clicks[neighborKey] = Math.max(0, rippleHeight - distance);
          clickedArea[neighborKey] = 1;
        }
      }
    }
  } 
}

function p3_drawBefore() {
  
}

function keyPressed() {

}

let lastUpdateTime = 0;
const updateInterval = 500; // Update interval in milliseconds (1 second)

function p3_drawTile(i, j) {
  [tw, th] = [p3_tileWidth(), p3_tileHeight()];
  blockSize = p3_tileWidth();
  
  noStroke();

  push();

  // Calculate noise and sine wave values to alter the data of clicks
  let noiseValue = noiseAt(i * 0.1, j * 0.1);
  let sineValue = sinAt(i * 0.1 + millis() * 0.001);

  // Scale the noise and sine values to match the range of block heights
  let noiseScale = map(noiseValue, 0, 1, 0, 5);
  let sineScale = map(sineValue, -1, 1, 0, 5);

  // Set the value of clicks based on the combined effect of noise and sine waves
  if (clickedArea[[i, j]] <= 0 || clickedArea[[i, j]] == null) {
    clicks[[i, j]] = max(noiseScale, sineScale); 
  }

  let n = clicks[[i, j]] | 0;
  if (n != 0) {

    if (n > 0) {  // Roof
      generateRoof(i, j, n);
    }

    // Left Side Wall
    generateLeftWall(i, j, n);

    // Right Side Wall
    generateRightWall(i, j, n);
  } else {
    generateFloor(i, j, n);
  }

  pop();
}



function generateRoof(i, j, n) {
  let key = [i, j];
  if (clicks[[i, j + 1]] > clicks[key]) {
    fill(86, 147 + colorOffset, 39 + colorOffset);
  }
  else if (clicks[[i - 1, j + 1]] > clicks[key]) {
    fill(95, 160 + colorOffset, 49 + colorOffset);
  }
  else {
    fill(113, 179 + colorOffset, 64 + colorOffset);  
  }
  
  let hash = XXH.h32("" + [i, j], worldSeed).toNumber();
  let sideWave = hash % 2 == 0 ? sinAt(i + (millis() * .005)) : 0;
  let upperWave = hash % 2 == 1 ? sinAt(i + (millis() * .005)) : 0;
  
  // Add black outlines to the edges of the roof
  stroke(0); // Set stroke color to black
  strokeWeight(1); // Set stroke weight to control the thickness of the outline
  
  // Draw the roof shape with animated corners
  beginShape();
  vertex(-tw, -blockSize * n + sideWave); 
  vertex(0, th - blockSize * n + upperWave);
  vertex(tw, -blockSize * n + sideWave);
  vertex(0, -th - blockSize * n + upperWave);
  endShape(CLOSE);
  
  // Reset stroke
  noStroke();
}


function generateLeftWall(i, j, n) {
  let leftWallKey = [i + 1, j];
  let leftWallHeight = clicks[leftWallKey] | 0;
  let hash = XXH.h32("" + [i, j], worldSeed).toNumber();
  let sideWave = hash % 2 == 0 ? sinAt(i + (millis() * .005)) : 0;
  let upperWave = hash % 2 == 1 ? sinAt(i + (millis() * .005)) : 0;

  fill(107, 71 + colorOffset, 43 + colorOffset);
  // Add black outline
  stroke(0); // Set stroke color to black
  strokeWeight(1); // Set stroke weight to control the thickness of the outline
  for (let k = leftWallHeight; k < n; k++) {
    beginShape();
    if (k >= n - 1) {
      vertex(-tw, -blockSize * (k + 1) + sideWave); // Sway the top-left corner of the wall
    }
    else {
      vertex(-tw, -blockSize * (k + 1));
    }
    vertex(-tw, -blockSize * k);
    vertex(0, th - blockSize * k);
    if (k >= n - 1) {
      vertex(0, th - blockSize * (k + 1) + upperWave); // Sway the bottom-left corner of the wall
    } else {
      vertex(0, th - blockSize * (k + 1));
    }
    
    endShape(CLOSE);
  }
  strokeWeight(0);
}

function generateRightWall(i, j, n) {
  let rightWallKey = [i, j + 1];
  let rightWallHeight = clicks[rightWallKey] | 0;
  let hash = XXH.h32("" + [i, j], worldSeed).toNumber();
  let sideWave = hash % 2 == 0 ? sinAt(i + (millis() * .005)) : 0;
  let upperWave = hash % 2 == 1 ? sinAt(i + (millis() * .005)) : 0;
  
  fill(140, 98 + colorOffset, 71 + colorOffset);
  // Add black outline
  stroke(0); // Set stroke color to black
  strokeWeight(1); // Set stroke weight to control the thickness of the outline
  for (let k = rightWallHeight; k < n; k++) {
    beginShape();
    if (k >= n - 1) {
      vertex(tw, -blockSize * (k + 1) + sideWave); 
    } else {
      vertex(tw, -blockSize * (k + 1));
    }
    vertex(tw, -blockSize * k);
    vertex(0, th - blockSize * k);
    if (k >= n - 1) {
      vertex(0, th - blockSize * (k + 1) + upperWave); 
    } else {
      vertex(0, th - blockSize * (k + 1));
    }
    endShape(CLOSE);
  }
  strokeWeight(0);
}


function generateFloor(i, j, n) {
  let hash = XXH.h32("" + [i, j], worldSeed).toNumber();
  
  // Extract components of the hash for hue, saturation, and brightness
  let hue = map(hash, 0, 4294967295, 230, 246); // Map hash to hue range (green hues)
  let saturation = map(hash, 0, 4294967295, 200, 250); // Map hash to saturation range (50-100)
  let brightness = map(hash, 0, 4294967295, 200, 250); // Map hash to brightness range (30-90)
  
  // Set fill color based on hue, saturation, and brightness
  fill(hue, saturation, brightness + colorOffset);
  
  // Add black outline
  stroke(0); // Set stroke color to black
  strokeWeight(0.2); // Set stroke weight to control the thickness of the outline
  
  // Draw the floor shape
  beginShape();
  vertex(-tw, 0);
  vertex(0, th);
  vertex(tw, 0);
  vertex(0, -th);
  endShape(CLOSE);
  
  // Reset stroke
  noStroke();
}


function p3_drawSelectedTile(i, j) {
  noFill();
  stroke(0, 255, 0, 128);

  beginShape();
  vertex(-tw, 0);
  vertex(0, th);
  vertex(tw, 0);
  vertex(0, -th);
  endShape(CLOSE);

  noStroke();
  fill(0);
  text("tile " + [i, j], 0, 0);
}

function p3_drawAfter() {}

// noise and sin credit to Garrett Blake

function noiseAt(y, x, layers=1, zoom=.05) {
  let value = 0;
  for (let i = 1; i <= layers; i++) {
    let power = Math.pow(i, 2)
    value += 1/(power) * noise(power * y * zoom, power * x * zoom)
  }
  return value
}

function sinAt(x, freq = .3, scale = 4) {
  return Math.sin(x * freq) * scale
}

