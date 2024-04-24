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

/* exported generateGrid, drawGrid */
/* global placeTile */

const decorLimit = 6;

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

function generateRoom(grid, numCols, numRows) {
  // Define minimum room dimensions
  let minD = [Math.floor(numCols * 0.2), Math.floor(numRows * 0.2)];
  
  // Define maximum room dimensions
  let maxD = [Math.floor(numCols * 0.4), Math.floor(numRows * 0.4)];

  // Attempt to generate a room until a valid one is found or a thousand iterations have been run
  let iterations = 0;
  while (iterations < 1000) {
    iterations++;
    
    let roomWidth = Math.floor(random(minD[0], maxD[0]));
    let roomHeight = Math.floor(random(minD[1], maxD[1]));
    
    let startX = Math.floor(Math.random() * (numCols - roomWidth));
    let startY = Math.floor(Math.random() * (numRows - roomHeight));
    
    let endX = startX + roomWidth - 1;
    let endY = startY + roomHeight - 1;
    
    // Check if the proposed room overlaps with existing rooms
    let overlaps = false;
    for (let i = startY; i <= endY; i++) {
      for (let j = startX; j <= endX; j++) {
        if (gridCode(grid, i, j, "_") != 0b1111) {
          // If any cell of the proposed room is not empty, set overlaps flag to true
          overlaps = true;
          break;
        }
      }
      if (overlaps) {
        break;
      }
    }
    
    // If there's no overlap, generate the room and exit the loop
    if (!overlaps) {
      for (let i = startY; i <= endY; i++) {
        for (let j = startX; j <= endX; j++) {
          grid[i][j] = ".";
        }
      }
      break;
    }
  }
}

function generateDecor(grid) {
  let decorCount = 0;
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (gridCheck(grid, i, j, ".")) {
        if (gridCode(grid, i, j, ".") == 0b1111) {
          if (Math.floor(random(0, 12)) == 1 && decorCount < decorLimit) {
            placeTile(i, j, 0 + Math.floor(random(0, 6)), 28 + Math.floor(random(0, 3)));
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
  
  for (let i = 0; i < Math.floor(random(3, 6)); i++) {
    generateRoom(grid, numCols, numRows); 
  }
  
  generateCorridors(grid, numCols, numRows);

  return grid;
}

function drawGrid(grid) {
  background(128);

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (gridCheck(grid, i, j, "_")) {
        placeTile(i, j, Math.floor(random(1, 4)), Math.floor(random(21, 24)));
      } else if (gridCheck(grid, i, j, ".")) {
        drawContext(grid, i, j, ".", Math.floor(random(-4, 1)), 0)
      }
    }
  }
  
  generateDecor(grid);
  
  generateSmoke();
  
}

function generateSmoke() {
  fill(255, 55); 
  noStroke();

  let spacing = 25; 
  let puffiness = 50; 
  let xOffset = 0; 

  for (let y = 0; y < height; y += spacing) {
    beginShape();
    for (let x = 0; x < width; x++) {
      let noiseVal = noise(x * 0.01, y * 0.01, xOffset + frameCount * 0.01);
      let puff = map(noiseVal, 0, 1, -puffiness, puffiness);
      vertex(x, y + puff);
    }
    vertex(width, y + map(noise(width * 0.01, y * 0.01, xOffset + frameCount * 0.01), 0, 1, -puffiness, puffiness));
    vertex(width, y);
    endShape(CLOSE);
  }

  // Increment the xOffset for Perlin noise to animate the smoke
  xOffset += 0.05;

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

function drawContext(grid, i, j, target, ti, tj) {
  // Get the 4-bit code for the cell (i, j) based on the target
  let code = gridCode(grid, i, j, target);
  
  const [tiOffset, tjOffset] = lookup[code];
  
  // if doing differently for insides
  if (code == 0b1111) {
    placeTile(i, j, ti + tiOffset, tj + tjOffset); 
  } 
  else {
    placeTile(i, j, ti + 25, tj + 24); 
    placeTile(i, j, tiOffset, tjOffset);
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
  [25, 23], // Bottom-left corner
  [25, 21], // Top-left corner
  [25, 22], // Middle-left wall
  [27, 3], 
  [27, 23], // Bottom-right corner
  [27, 21], // Top-right corner
  [27, 22], // Middle-right wall
  [27, 3],
  [26, 23], // Bottom-middle wall
  [26, 21], // Top-middle wall
  [16, 24] // Floor
];
