const s1 = (sketch) => {
  /* global p5 */
  /* exported preload, setup, draw, mouseClicked */

  // Project base code provided by {amsmith,ikarth}@ucsc.edu


  let tile_width_step_main; // A width step is half a tile's width
  let tile_height_step_main; // A height step is half a tile's height

  // Global variables. These will mostly be overwritten in setup().
  let tile_rows, tile_columns;
  let camera_offset;
  let camera_velocity;

  /////////////////////////////
  // Transforms between coordinate systems
  // These are actually slightly weirder than in full 3d...
  /////////////////////////////
  function worldToScreen([world_x, world_y], [camera_x, camera_y]) {
    let i = (world_x - world_y) * tile_width_step_main;
    let j = (world_x + world_y) * tile_height_step_main;
    return [i + camera_x, j + camera_y];
  }

  function worldToCamera([world_x, world_y], [camera_x, camera_y]) {
    let i = (world_x - world_y) * tile_width_step_main;
    let j = (world_x + world_y) * tile_height_step_main;
    return [i, j];
  }

  function tileRenderingOrder(offset) {
    return [offset[1] - offset[0], offset[0] + offset[1]];
  }

  function screenToWorld([screen_x, screen_y], [camera_x, camera_y]) {
    screen_x -= camera_x;
    screen_y -= camera_y;
    screen_x /= tile_width_step_main * 2;
    screen_y /= tile_height_step_main * 2;
    screen_y += 0.5;
    return [Math.floor(screen_y + screen_x), Math.floor(screen_y - screen_x)];
  }

  function cameraToWorldOffset([camera_x, camera_y]) {
    let world_x = camera_x / (tile_width_step_main * 2);
    let world_y = camera_y / (tile_height_step_main * 2);
    return { x: Math.round(world_x), y: Math.round(world_y) };
  }

  function worldOffsetToCamera([world_x, world_y]) {
    let camera_x = world_x * (tile_width_step_main * 2);
    let camera_y = world_y * (tile_height_step_main * 2);
    return new p5.Vector(camera_x, camera_y);
  }

  sketch.preload = function() {
    if (p3_preload) {
      p3_preload();
    }
  }

  sketch.setup = function() {
    camera_offset = new p5.Vector(-sketch.width / 2, sketch.height / 2);
    camera_velocity = new p5.Vector(0, 0);

    if (p3_setup) {
      p3_setup();
    }

    let label = sketch.createP();
    label.html("World key: ");
    label.parent("canvas-container");

    let input = sketch.createInput("xyzzy");
    input.parent(label);
    input.input(() => {
      rebuildWorld(input.value());
    });
    
    let mLabel = sketch.createP();
    mLabel.html("Zoom (Enter a number 0 < x <= 200): ");
    mLabel.parent("canvas-container");

    let mInput;
    mInput = sketch.createInput(100);
    mInput.parent(mLabel);
    mInput.input(() => {
      if (p3_adjustTileDimensions) {
        p3_adjustTileDimensions(mInput.value());
      }
    });

    sketch.createP("Arrow keys scroll. Clicking drops a tower that's impervious to the waves.").parent("canvas-container");
    sketch.createP("FOR THE SAKE OF YOUR COMPUTER, DON'T MESS WITH THE ZOOM TO BE ANY SMALLER").parent("canvas-container");

    rebuildWorld(input.value());
  }

  function rebuildWorld(key) {
    if (p3_worldKeyChanged) {
      p3_worldKeyChanged(key);
    }
    tile_width_step_main = p3_tileWidth ? p3_tileWidth() : 32;
    tile_height_step_main = p3_tileHeight ? p3_tileHeight() : 14.5;
    tile_columns = Math.ceil(sketch.width / (tile_width_step_main * 2));
    tile_rows = Math.ceil(sketch.height / (tile_height_step_main * 2));
  }

  function mouseClicked() {
    console.log("Hello");
    let world_pos = screenToWorld(
      [0 - mouseX, mouseY],
      [camera_offset.x, camera_offset.y]
    );

    if (p3_tileClicked) {
      p3_tileClicked(world_pos[0], world_pos[1]);
    }
    return false;
  }

  sketch.draw = function() {
    // Keyboard controls!
    if (sketch.keyIsDown(sketch.LEFT_ARROW)) {
      camera_velocity.x -= 1;
    }
    if (sketch.keyIsDown(sketch.RIGHT_ARROW)) {
      camera_velocity.x += 1;
    }
    if (sketch.keyIsDown(sketch.DOWN_ARROW)) {
      camera_velocity.y -= 1;
    }
    if (sketch.keyIsDown(sketch.UP_ARROW)) {
      camera_velocity.y += 1;
    }

    let camera_delta = new p5.Vector(0, 0);
    camera_velocity.add(camera_delta);
    camera_offset.add(camera_velocity);
    camera_velocity.mult(0.95); // cheap easing
    if (camera_velocity.mag() < 0.01) {
      camera_velocity.setMag(0);
    }

    let world_pos = screenToWorld(
      [0 - sketch.mouseX, sketch.mouseY],
      [camera_offset.x, camera_offset.y]
    );
    let world_offset = cameraToWorldOffset([camera_offset.x, camera_offset.y]);

    sketch.background(100);

    if (p3_drawBefore) {
      p3_drawBefore();
    }

    let overdraw = 0.4;

    let y0 = Math.floor((0 - overdraw) * tile_rows);
    let y1 = Math.floor((1 + overdraw) * tile_rows);
    let x0 = Math.floor((0 - overdraw) * tile_columns);
    let x1 = Math.floor((1 + overdraw) * tile_columns);

    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        drawTile(tileRenderingOrder([x + world_offset.x, y - world_offset.y]), [
          camera_offset.x,
          camera_offset.y
        ]); // odd row
      }
      for (let x = x0; x < x1; x++) {
        drawTile(
          tileRenderingOrder([
            x + 0.5 + world_offset.x,
            y + 0.5 - world_offset.y
          ]),
          [camera_offset.x, camera_offset.y]
        ); // even rows are offset horizontally
      }
    }

    describeMouseTile(world_pos, [camera_offset.x, camera_offset.y]);

    if (p3_drawAfter) {
      p3_drawAfter();
    }
  }

  // Display a discription of the tile at world_x, world_y.
  function describeMouseTile([world_x, world_y], [camera_x, camera_y]) {
    let [screen_x, screen_y] = worldToScreen(
      [world_x, world_y],
      [camera_x, camera_y]
    );
    drawTileDescription([world_x, world_y], [0 - screen_x, screen_y]);
  }

  function drawTileDescription([world_x, world_y], [screen_x, screen_y]) {
    sketch.push();
    sketch.translate(screen_x, screen_y);
    if (p3_drawSelectedTile) {
      p3_drawSelectedTile(world_x, world_y, screen_x, screen_y);
    }
    sketch.pop();
  }

  // Draw a tile, mostly by calling the user's drawing code.
  function drawTile([world_x, world_y], [camera_x, camera_y]) {
    let [screen_x, screen_y] = worldToScreen(
      [world_x, world_y],
      [camera_x, camera_y]
    );
    sketch.push();
    sketch.translate(0 - screen_x, screen_y);
    if (p3_drawTile) {
      p3_drawTile(world_x, world_y, -screen_x, screen_y);
    }
    sketch.pop();
  }

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
    canvas = sketch.createCanvas(800, 400);
    canvas.parent("canvas-container");
  }


  let worldSeed;

  let clicks = {};

  let clickedArea = {};

  let colorOffset = 0;

  function p3_worldKeyChanged(key) {
    worldSeed = XXH.h32(key, 0);
    sketch.noiseSeed(worldSeed);
    sketch.randomSeed(worldSeed);
    
    colorOffset = Math.floor(sketch.random(-100, 100));
    
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

  function p3_tileClicked(i, j) {
    let key = [i, j];

    let hash = XXH.h32("" + key, worldSeed).toNumber();
    let minHeight = hash % 5 + 5;
    let rippleHeight = Math.floor(sketch.random(minHeight, 16)); // Adjust this value to control the intensity of the ripple
    clicks[key] = rippleHeight;
    clickedArea[key] = 1;
    console.log("Hello");

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

  function p3_drawBefore() {
    
  }

  function keyPressed() {

  }

  function p3_drawTile(i, j) {
    [tw, th] = [p3_tileWidth(), p3_tileHeight()];
    blockSize = p3_tileWidth();
    
    sketch.noStroke();

    sketch.push();

    // Calculate noise and sine wave values to alter the data of clicks
    let noiseValue = noiseAt(i * 0.1, j * 0.1);
    let sineValue = sinAt(i * 0.1 + sketch.millis() * 0.001);

    // Scale the noise and sine values to match the range of block heights
    let noiseScale = sketch.map(noiseValue, 0, 1, 0, 5);
    let sineScale = sketch.map(sineValue, -1, 1, 0, 5);

    // Set the value of clicks based on the combined effect of noise and sine waves
    if (clickedArea[[i, j]] <= 0 || clickedArea[[i, j]] == null) {
      clicks[[i, j]] = sketch.max(noiseScale, sineScale); 
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

    sketch.pop();
  }



  function generateRoof(i, j, n) {
    let key = [i, j];
    if (clicks[[i, j + 1]] > clicks[key]) {
      sketch.fill(86, 147 + colorOffset, 39 + colorOffset);
    }
    else if (clicks[[i - 1, j + 1]] > clicks[key]) {
      sketch.fill(95, 160 + colorOffset, 49 + colorOffset);
    }
    else {
      sketch.fill(113, 179 + colorOffset, 64 + colorOffset);  
    }
    
    let hash = XXH.h32("" + [i, j], worldSeed).toNumber();
    let sideWave = hash % 2 == 0 ? sinAt(i + (sketch.millis() * .005)) : 0;
    let upperWave = hash % 2 == 1 ? sinAt(i + (sketch.millis() * .005)) : 0;
    
    // Add black outlines to the edges of the roof
    sketch.stroke(0); // Set stroke color to black
    sketch.strokeWeight(1); // Set stroke weight to control the thickness of the outline
    
    // Draw the roof shape with animated corners
    sketch.beginShape();
    sketch.vertex(-tw, -blockSize * n + sideWave); 
    sketch.vertex(0, th - blockSize * n + upperWave);
    sketch.vertex(tw, -blockSize * n + sideWave);
    sketch.vertex(0, -th - blockSize * n + upperWave);
    sketch.endShape(sketch.CLOSE);
    
    // Reset stroke
    sketch.noStroke();
  }


  function generateLeftWall(i, j, n) {
    let leftWallKey = [i + 1, j];
    let leftWallHeight = clicks[leftWallKey] | 0;
    let hash = XXH.h32("" + [i, j], worldSeed).toNumber();
    let sideWave = hash % 2 == 0 ? sinAt(i + (sketch.millis() * .005)) : 0;
    let upperWave = hash % 2 == 1 ? sinAt(i + (sketch.millis() * .005)) : 0;

    sketch.fill(107, 71 + colorOffset, 43 + colorOffset);
    // Add black outline
    sketch.stroke(0); // Set stroke color to black
    sketch.strokeWeight(1); // Set stroke weight to control the thickness of the outline
    for (let k = leftWallHeight; k < n; k++) {
      sketch.beginShape();
      if (k >= n - 1) {
        sketch.vertex(-tw, -blockSize * (k + 1) + sideWave); // Sway the top-left corner of the wall
      }
      else {
        sketch.vertex(-tw, -blockSize * (k + 1));
      }
      sketch.vertex(-tw, -blockSize * k);
      sketch.vertex(0, th - blockSize * k);
      if (k >= n - 1) {
        sketch.vertex(0, th - blockSize * (k + 1) + upperWave); // Sway the bottom-left corner of the wall
      } else {
        sketch.vertex(0, th - blockSize * (k + 1));
      }
      
      sketch.endShape(sketch.CLOSE);
    }
    sketch.strokeWeight(0);
  }

  function generateRightWall(i, j, n) {
    let rightWallKey = [i, j + 1];
    let rightWallHeight = clicks[rightWallKey] | 0;
    let hash = XXH.h32("" + [i, j], worldSeed).toNumber();
    let sideWave = hash % 2 == 0 ? sinAt(i + (sketch.millis() * .005)) : 0;
    let upperWave = hash % 2 == 1 ? sinAt(i + (sketch.millis() * .005)) : 0;
    
    sketch.fill(140, 98 + colorOffset, 71 + colorOffset);
    // Add black outline
    sketch.stroke(0); // Set stroke color to black
    sketch.strokeWeight(1); // Set stroke weight to control the thickness of the outline
    for (let k = rightWallHeight; k < n; k++) {
      sketch.beginShape();
      if (k >= n - 1) {
        sketch.vertex(tw, -blockSize * (k + 1) + sideWave); 
      } else {
        sketch.vertex(tw, -blockSize * (k + 1));
      }
      sketch.vertex(tw, -blockSize * k);
      sketch.vertex(0, th - blockSize * k);
      if (k >= n - 1) {
        sketch.vertex(0, th - blockSize * (k + 1) + upperWave); 
      } else {
        sketch.vertex(0, th - blockSize * (k + 1));
      }
      sketch.endShape(sketch.CLOSE);
    }
    sketch.strokeWeight(0);
  }


  function generateFloor(i, j, n) {
    let hash = XXH.h32("" + [i, j], worldSeed).toNumber();
    
    // Extract components of the hash for hue, saturation, and brightness
    let hue = sketch.map(hash, 0, 4294967295, 230, 246); // Map hash to hue range (green hues)
    let saturation = sketch.map(hash, 0, 4294967295, 200, 250); // Map hash to saturation range (50-100)
    let brightness = sketch.map(hash, 0, 4294967295, 200, 250); // Map hash to brightness range (30-90)
    
    // Set fill color based on hue, saturation, and brightness
    sketch.fill(hue, saturation, brightness + colorOffset);
    
    // Add black outline
    sketch.stroke(0); // Set stroke color to black
    sketch.strokeWeight(0.2); // Set stroke weight to control the thickness of the outline
    
    // Draw the floor shape
    sketch.beginShape();
    sketch.vertex(-tw, 0);
    sketch.vertex(0, th);
    sketch.vertex(tw, 0);
    sketch.vertex(0, -th);
    sketch.endShape(sketch.CLOSE);
    
    // Reset stroke
    sketch.noStroke();
  }


  function p3_drawSelectedTile(i, j) {
    sketch.noFill();
    sketch.stroke(0, 255, 0, 128);

    sketch.beginShape();
    sketch.vertex(-tw, 0);
    sketch.vertex(0, th);
    sketch.vertex(tw, 0);
    sketch.vertex(0, -th);
    sketch.endShape(sketch.CLOSE);

    sketch.noStroke();
    sketch.fill(0);
    sketch.text("tile " + [i, j], 0, 0);
  }

  function p3_drawAfter() {}

  // noise and sin credit to Garrett Blakex

  function noiseAt(y, x, layers=1, zoom=.05) {
    let value = 0;
    for (let i = 1; i <= layers; i++) {
      let power = Math.pow(i, 2)
      value += 1/(power) * sketch.noise(power * y * zoom, power * x * zoom)
    }
    return value
  }

  function sinAt(x, freq = .3, scale = 4) {
    return Math.sin(x * freq) * scale
  }

}

let p51 = new p5(s1, "canvas-container");