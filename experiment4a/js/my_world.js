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

let colorOffset = 0;

function p3_worldKeyChanged(key) {
  worldSeed = XXH.h32(key, 0);
  noiseSeed(worldSeed);
  randomSeed(worldSeed);
  
  colorOffset = Math.floor(random(-100, 100));
  
  clicks = {};
}

function p3_tileWidth() {
  return 32;
}
function p3_tileHeight() {
  return 16;
}

let [tw, th] = [p3_tileWidth(), p3_tileHeight()];

const blockSize = p3_tileWidth();

function p3_tileClicked(i, j, event) {
  let key = [i, j];
  console.log(event.button);
  
  if (event.button === 0) { // Left Click
    clicks[key] = 1 + (clicks[key] | 0); 
  } 
  else if (event.button === 2) { // Right Click
    clicks[key] = 1 + (clicks[key] | 0); 
  }
}

function p3_drawBefore() {
  
}

function keyPressed() {
  let world_pos = screenToWorld(
    [0 - mouseX, mouseY],
    [camera_offset.x, camera_offset.y]
  );
  
  if (keyCode == '82') {
    clicks[world_pos] = (clicks[world_pos] - 1 | 0); 
    if (clicks[world_pos] < 0) clicks[world_pos] = 0;
    console.log(clicks[world_pos]);
  } 
}

function p3_drawTile(i, j) {
  noStroke();

  push();
  
  if (clicks[[i, j]] == null) {
    // Generate a random hash based on tile coordinates
    let hash = XXH.h32("" + [i, j], worldSeed).toNumber();

    // Map the hash value to a range where certain values correspond to generating a hill, a cross, or nothing
    let generationType = hash % 4;

    if (generationType == 0) { 
      generateHill(i, j);
    } else if (generationType == 1) { 
      generateCross(i, j);
    } else if (generationType == 2) {
      generateCircle(i, j);
    }
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
  }
  else {
    generateFloor(i, j, n);
  }

  pop();
}

function generateHill(i, j) {
  // Randomly select hill height
  let randomHeight = Math.floor(Math.random() * 4) + 3; // Random height from 3 to 6

  // Calculate distance threshold based on randomHeight
  const distanceThresholdFraction = 2; // Adjust as needed
  let distanceThreshold = Math.floor(randomHeight * distanceThresholdFraction);

  // Check if there are any nearby hills within the distance threshold
  let canGenerate = true;

  for (let x = i - distanceThreshold; x <= i + distanceThreshold; x++) {
    for (let y = j - distanceThreshold; y <= j + distanceThreshold; y++) {
      if (clicks[[x, y]] > 0) { // Check if there is a hill nearby
        canGenerate = false;
        break;
      }
    }
    if (!canGenerate) {
      break;
    }
  }

  // If no nearby hills, generate the hill
  if (canGenerate) {
    clicks[[i, j]] = randomHeight; // Set the center tile to randomHeight

    // Adjust surrounding tiles based on randomHeight
    for (let distance = 1; distance <= randomHeight; distance++) {
      // Adjust tiles along each edge of the pyramid
      for (let k = -distance; k <= distance; k++) {
        clicks[[i - distance, j + k]] = randomHeight - distance; // Adjust tiles along the left edge
        clicks[[i + distance, j + k]] = randomHeight - distance; // Adjust tiles along the right edge
        clicks[[i + k, j - distance]] = randomHeight - distance; // Adjust tiles along the top edge
        clicks[[i + k, j + distance]] = randomHeight - distance; // Adjust tiles along the bottom edge
      }
    }
  }
}

function generateCross(i, j) {
  
  // Randomly select cross size
  let randomSize = Math.floor(Math.random() * 4) + 3; // Random size from 3 to 6

  // Calculate distance threshold based on randomSize
  const distanceThresholdFraction = 2; // Adjust as needed
  let distanceThreshold = Math.floor(randomSize * distanceThresholdFraction);

  // Check if there are any nearby crosses within the distance threshold
  let canGenerate = true;

  for (let x = i - distanceThreshold; x <= i + distanceThreshold; x++) {
    for (let y = j - distanceThreshold; y <= j + distanceThreshold; y++) {
      if (clicks[[x, y]] > 0) { // Check if there is a cross nearby
        canGenerate = false;
        break;
      }
    }
    if (!canGenerate) {
      break;
    }
  }

  // If no nearby crosses, generate the cross
  if (canGenerate) {
    clicks[[i, j]] = 1; // Set the center tile to 1

    // Adjust surrounding tiles based on randomSize
    for (let k = 1; k <= randomSize; k++) {
      clicks[[i - k, j - k]] = 1; // Set tiles in the top-left direction
      clicks[[i + k, j - k]] = 1; // Set tiles in the top-right direction
      clicks[[i - k, j + k]] = 1; // Set tiles in the bottom-left direction
      clicks[[i + k, j + k]] = 1; // Set tiles in the bottom-right direction
    }
  }
}

function generateCircle(i, j) {
  // Define minRadius and maxRadius
  let minRadius = 3;
  let maxRadius = 7;

  // Randomize the radius within the specified range
  let radius = Math.floor(random(minRadius, maxRadius + 1));

  // Calculate distance threshold based on radius
  const distanceThresholdFraction = 2; // Adjust as needed
  let distanceThreshold = Math.floor(radius * distanceThresholdFraction);

  // Check if there are any nearby circles within the distance threshold
  let canGenerate = true;

  for (let x = i - distanceThreshold; x <= i + distanceThreshold; x++) {
    for (let y = j - distanceThreshold; y <= j + distanceThreshold; y++) {
      if (clicks[[x, y]] > 0) { // Check if there is a circle nearby
        canGenerate = false;
        break;
      }
    }
    if (!canGenerate) {
      break;
    }
  }

  // If no nearby circles, generate the circle
  if (canGenerate) {
    // Set the center tile to 1
    clicks[[i, j]] = 1;

    // Loop through each tile in a square area around the center (i, j)
    for (let x = i - radius; x <= i + radius; x++) {
      for (let y = j - radius; y <= j + radius; y++) {
        // Check if the distance from the current tile to the center (i, j) is within the radius
        if (dist(x, y, i, j) <= radius) {
          // Set the tile to 1 (indicating it's part of the circle)
          clicks[[x, y]] = 1;
        }
      }
    }
  }
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
  let hue = map(hash, 0, 4294967295, 80, 130); // Map hash to hue range (green hues)
  let saturation = map(hash, 0, 4294967295, 137, 250); // Map hash to saturation range (50-100)
  let brightness = map(hash, 0, 4294967295, 30, 50); // Map hash to brightness range (30-90)
  
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

// noise and sin credit to Garrett Blakex

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

