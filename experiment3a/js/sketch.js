// sketch.js - purpose and description here
// Author: Your Name
// Date:

// Here is how you might set up an OOP p5.js project
// Note that p5.js looks for a file called sketch.js

// Globals

/* exported preload, setup, draw, placeTile */

/* global generateGrid drawGrid */

let seed = 0;
let tilesetImage;
let currentGrid = [];
let numRows, numCols;

function preload() {
  tilesetImage = loadImage(
    "./assets/tileset8.png"
  );
  console.log(tilesetImage);
}

function reseed() {
  seed = (seed | 0) + 1109;
  randomSeed(seed);
  noiseSeed(seed);
  select("#seedReport").html("seed " + seed);
  regenerateGrid();
}

function regenerateGrid() {
  select("#asciiBox").value(gridToString(generateGrid(numCols, numRows)));
  reparseGrid();
}

function reparseGrid() {
  currentGrid = stringToGrid(select("#asciiBox").value());
}

function gridToString(grid) {
  let rows = [];
  for (let i = 0; i < grid.length; i++) {
    rows.push(grid[i].join(""));
  }
  return rows.join("\n");
}

function stringToGrid(str) {
  let grid = [];
  let lines = str.split("\n");
  for (let i = 0; i < lines.length; i++) {
    let row = [];
    let chars = lines[i].split("");
    for (let j = 0; j < chars.length; j++) {
      row.push(chars[j]);
    }
    grid.push(row);
  }
  return grid;
}

function setup() {
  // place our canvas, making it fit our container
  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  canvas.parent("canvas-container");
  // resize canvas is the page is resized
  $(window).resize(function() {
    resizeScreen();
  });
  resizeScreen();

  numCols = select("#asciiBox").attribute("rows") | 0;
  numRows = select("#asciiBox").attribute("cols") | 0;

  createCanvas(16 * numCols, 16 * numRows).parent("canvasContainer");
  select("canvas").elt.getContext("2d").imageSmoothingEnabled = false;

  select("#reseedButton").mousePressed(reseed);
  select("#asciiBox").input(reparseGrid);

  reseed();
}


function draw() {
  randomSeed(seed);
  drawGrid(currentGrid);
}

function placeTile(i, j, ti, tj) {
  image(tilesetImage, 16 * j, 16 * i, 16, 16, 8 * ti, 8 * tj, 8, 8);
}

function resizeScreen() {
  centerHorz = canvasContainer.width() / 2; // Adjusted for drawing logic
  centerVert = canvasContainer.height() / 2; // Adjusted for drawing logic
  console.log("Resizing...");
  resizeCanvas(canvasContainer.width(), canvasContainer.height());
  // redrawCanvas(); // Redraw everything based on new size
}

// solution code

const decorLimit = 15;

function generateCorridors(grid, numRows, numCols) {
  // Track cells that already have corridors connected to them
  let connectedCells = new Set();

  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      if (grid[i][j] === "." && !connectedCells.has(`${i},${j}`)) {
        // search in directions not adjacent to a "." cell
        let directions = [];
        if (gridCheck(grid, i - 1, j, "_")) {
          directions.push("north");
        }
        if (gridCheck(grid, i + 1, j, "_")) {
          directions.push("south");
        }
        if (gridCheck(grid, i, j - 1, "_")) {
          directions.push("west");
        }
        if (gridCheck(grid, i, j + 1, "_")) {
          directions.push("east");
        }

        // for each direction, look forwards until a "." cell is found
        // if a "." cell is found, fill in the cells between the two "." cells
        for (let k = 0; k < directions.length; k++) {
          let direction = directions[k];
          let iOffset = 0;
          let jOffset = 0;
          switch (direction) {
            case "north":
              iOffset = -1;
              break;
            case "south":
              iOffset = 1;
              break;
            case "west":
              jOffset = -1;
              break;
            case "east":
              jOffset = 1;
              break;
          }

          let i2 = i + iOffset;
          let j2 = j + jOffset;
          while (gridCheck(grid, i2, j2, ".")) {
            i2 += iOffset;
            j2 += jOffset;
          }

          // Fill in the cells between the two "." cells
          while (i2 != i || j2 != j) {
            grid[i2][j2] = ".";
            connectedCells.add(`${i2},${j2}`); // Mark the cell as connected
            i2 -= iOffset;
            j2 -= jOffset;
          }
        }
      }
    }
  }
}

function generateLake(grid, numCols, numRows) {
  // Define minimum room dimensions
  let minD = [Math.floor(numCols * 0.2), Math.floor(numRows * 0.2)];
  
  // Define maximum room dimensions
  let maxD = [Math.floor(numCols * 0.4), Math.floor(numRows * 0.4)];

  let roomWidth = Math.floor(random(minD[0], maxD[0]));
  let roomHeight = Math.floor(random(minD[1], maxD[1]));

  let startX = Math.floor(Math.random() * (numCols - roomWidth));
  let startY = Math.floor(Math.random() * (numRows - roomHeight));

  let endX = startX + roomWidth - 1;
  let endY = startY + roomHeight - 1;

  for (let i = startY; i <= endY; i++) {
    for (let j = startX; j <= endX; j++) {
      grid[i][j] = ".";
    }
  }

}

function generateDecor(grid) {
  let decorCount = 0;
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (gridCheck(grid, i, j, "_")) {
        if (gridCode(grid, i, j, "_") == 0b1111) {
          if (Math.floor(random(0, 12)) == 1 && decorCount < decorLimit) {
            placeTile(i, j, 20 + Math.floor(random(0, 7)), 0 + Math.floor(random(0, 3)));
            decorCount++;
          }
        }
      }
    }
  }
}


function generateGrid(numCols, numRows) {
  let grid = [];

  // Fill grid with background code ('_')
  for (let i = 0; i < numRows; i++) {
    let row = [];
    for (let j = 0; j < numCols; j++) {
      row.push("_");
    }
    grid.push(row);
  }
  
  for (let i = 0; i < Math.floor(random(2, 4)); i++) {
    generateLake(grid, numCols, numRows); 
  }
  
  generateCorridors(grid, numCols, numRows);

  return grid;
}

let time = 0; // Initialize time variable for animation

function generateSnow() {
  let numEllipses = 100; // Adjust the number of ellipses as needed
  let maxSize = 20; // Maximum size of ellipses
  let minSize = 5; // Minimum size of ellipses
  
  // Increment time for animation
  time += 0.01;
  
  // Draw ellipses with animated positions and sizes
  for (let i = 0; i < numEllipses; i++) {
    let x = random(width); // Random x position within canvas width
    let y = random(height); // Random y position within canvas height
    let size = random(minSize, maxSize); // Random size for ellipses
    let noiseFactor = 0.05; // Adjust the noise factor to control the distortion amount
    
    // Apply Perlin noise to distort the position of the ellipses over time
    let noiseX = noise(x * noiseFactor, y * noiseFactor, time) * 20 - 10; // Random noise for x position
    let noiseY = noise(y * noiseFactor, x * noiseFactor, time) * 20 - 10; // Random noise for y position
    
    // Draw distorted ellipse with animated position
    ellipse(x + noiseX, y + noiseY, size, size);
  }
}


function drawGrid(grid) {
  background(128);

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (gridCheck(grid, i, j, "_")) {
        drawContext(grid, i, j, "_", 0, 0, bgLookup);
      } else if (gridCheck(grid, i, j, ".")) {
        drawContext(grid, i, j, ".", 0, 0, lookup);
      }
    }
  }
  
  generateDecor(grid);
  
  fill(240, 124);
  noStroke();
  
  generateSnow();
}


function gridCheck(grid, i, j, target) {
  if (0 <= i && i < grid.length && 0 <= j && j <= grid[i].length) {
    return grid[i][j] == target;
  }
}

function gridCode(grid, i, j, target) {
  let northBit = gridCheck(grid, i - 1, j, target) ? 1 : 0;
  let southBit = gridCheck(grid, i + 1, j, target) ? 1 : 0;
  let eastBit = gridCheck(grid, i, j + 1, target) ? 1 : 0;
  let westBit = gridCheck(grid, i, j - 1, target) ? 1 : 0;

  // Form the 4-bit code using bitwise operations
  let code =
    (northBit << 0) + (southBit << 1) + (eastBit << 2) + (westBit << 3);

  return code;
}

function drawContext(grid, i, j, target, ti, tj, search) {
  // Get the 4-bit code for the cell (i, j) based on the target
  let code = gridCode(grid, i, j, target);
  
  const [tiOffset, tjOffset] = search[code];
  
  // if doing differently for insides
  if (code == 0b1111) {
    placeTile(i, j, ti + tiOffset + Math.floor(random(0, 4)), tj + tjOffset); 
  } 
  else {
    if (target == "_") {
      placeTile(i, j, Math.floor(random(0, 4)), 12); 
      placeTile(i, j, tiOffset - 3, tjOffset - 6);
    }
    else {
      placeTile(i, j, ti + 17, tj + 18); 
      placeTile(i, j, tiOffset, tjOffset);
    }
    placeTile(i, j, tiOffset - 8, tjOffset - 6);
  }
}

// Inside == 16
// Corner == 4
// 0b0101 bottom left
// 0b1001 bottom right
// 0b1010 top right
// 0b0110 top left

const lookup = [
  [27, 3],
  [27, 3], 
  [27, 3], 
  [27, 3], 
  [27, 3],
  [12, 20], // Bottom-left corner
  [12, 18], // Top-left corner
  [12, 19], // Middle-left wall
  [27, 3], 
  [14, 20], // Bottom-right corner
  [14, 18], // Top-right corner
  [14, 19], // Middle-right wall
  [27, 3],
  [13, 20], // Bottom-middle wall
  [13, 18], // Top-middle wall
  [17, 18] // Floor
];

const bgLookup = [
  [27, 3],
  [27, 3], 
  [27, 3], 
  [27, 3], 
  [27, 3],
  [12, 20], // Bottom-left corner
  [12, 18], // Top-left corner
  [12, 19], // Middle-left wall
  [27, 3], 
  [14, 20], // Bottom-right corner
  [14, 18], // Top-right corner
  [14, 19], // Middle-right wall
  [27, 3],
  [13, 20], // Bottom-middle wall
  [13, 18], // Top-middle wall
  [0, 12] // Floor
];
