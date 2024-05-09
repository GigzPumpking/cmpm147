/* exported getInspirations, initDesign, renderDesign, mutateDesign */

function getInspirations() {
  return [
    {
      name: "Grilled Cheese in the Airfryer",
      assetUrl:
        "https://cdn.glitch.global/469cb487-7465-4986-a3b9-ba3dea1ad22d/grilled_cheese.jpeg?v=1715032914025",
      credit: "Grilled Cheese in the Airfryer, Hung Nguyen, 2022",
      key: "Grill",
    },
    {
      name: "Neary Lagoon",
      assetUrl:
        "https://cdn.glitch.global/469cb487-7465-4986-a3b9-ba3dea1ad22d/neary_lagoon.jpeg?v=1715033523805",
      credit: "Neary Lagoon, Hung Nguyen, 2024",
      key: "Lagoon",
    },
    {
      name: "Santa Cruz Ocean",
      assetUrl:
        "https://cdn.glitch.global/469cb487-7465-4986-a3b9-ba3dea1ad22d/ocean.jpeg?v=1715033518468",
      credit: "Santa Cruz Ocean, Hung Nguyen, 2024",
      key: "Ocean",
    },
  ];
}

function initDesign(inspiration) {
  resizeCanvas(inspiration.image.width / 16, inspiration.image.height / 16);

  let design = {
    bg: inspiration.bg,
    fg: [],
  };

  switch (inspiration.key) {
    case "Grill":
      // Initialize design with 100 big rectangles in the background and 100 small triangles in the middle and another 50 rectangles in the foreground

      // Make the background rectangles big and dark
      for (let i = 0; i < 200; i++) {
        // Rectangle vertices

        let x = random(width);
        let y = random(height);
        let w = random(width / 2);
        let h = random(height / 2);
        let shape = "rectangle";
        let layer = "bg";
        let alpha = random(128);

        design.fg.push({
          x: x,
          y: y,
          w: w,
          h: h,
          fill: getColorIndex(floor(x), floor(y), inspiration.image),
          shape: shape,
          layer: layer,
          alpha: alpha
        });

      for (let i = 0; i < 500; i++) {
        // Triangle vertices

        // Initialize triangles in the center of the canvas
        // Make them lighter

        let centerX = random(width / 4, (3 * width) / 4);
        let centerY = random(height / 4, (3 * height) / 4);

        let sizeMin = 3;

        let x1 = centerX 
        let y1 = centerY
        let x2 = centerX + random(-width / sizeMin, width / sizeMin);
        let y2 = centerY + random(-height / sizeMin, height / sizeMin);
        let x3 = centerX + random(-width / sizeMin, width / sizeMin);
        let y3 = centerY + random(-height / sizeMin, height / sizeMin);
        let shape = "triangle";
        let layer = "fg";
        let alpha = random(128, 255);

        design.fg.push({
          x1: x1,
          y1: y1,
          x2: x2,
          y2: y2,
          x3: x3,
          y3: y3,
          fill: getColorIndex(floor(x1), floor(y1), inspiration.image),
          shape: shape,
          layer: layer,
          alpha: alpha
        });
      }
      for (let i = 0; i < 10; i++) {
        // Rectangle vertices
        // Make these rectangles darker
        // Limit them to inside of the triangles

        let x = random(width/4, (3 * width) / 4);
        let y = random(height/4, (3 * height) / 4);
        let w = random(width / 2);
        let h = random(height / 2);
        let shape = "rectangle";
        let layer = "fg";
        let alpha = random(128);

        design.fg.push({
          x: x,
          y: y,
          w: w,
          h: h,
          fill: getColorIndex(floor(x), floor(y), inspiration.image),
          shape: shape,
          layer: layer,
          alpha: alpha
        });
      }
      break;
    }

  }

  return design;
}

function getColorIndex(xpos, ypos, img) {
  let index = (ypos * img.width + xpos) * 4;
  let rval = [img.pixels[index], img.pixels[index + 1], img.pixels[index + 2]];
  return rval;
}

function renderDesign(design, inspiration) {
  background(design.bg[0], design.bg[1], design.bg[2], design.bg[3]);
  for (let shape of design.fg) {
    fill(shape.fill[0], shape.fill[1], shape.fill[2], shape.alpha);
    switch (shape.shape) {
      case "triangle":
        triangle(shape.x1, shape.y1, shape.x2, shape.y2, shape.x3, shape.y3);
        break;
      case "rectangle":
        rect(shape.x, shape.y, shape.w, shape.h);
        break;
    }
    noFill();
  }
}

function mutateDesign(design, inspiration, rate) {
  design.bg = mut(design.bg, 0, 255, rate);
  for (let shape of design.fg) {
    switch (inspiration.key) {
        case "Grill":
            shape.alpha = mut(shape.alpha, 0, 255, rate);
            switch (shape.shape) {
                case "triangle":
                    // limit the size of the triangles using the x1 and y1 vertices
                    // make the triangle equilateral
                    shape.x1 = mut(shape.x1, 0, width, rate);
                    shape.y1 = mut(shape.y1, 0, height, rate);
                    shape.x2 = shape.x1 + mut(shape.x2 - shape.x1, -width / 3, width / 3, rate);
                    shape.y2 = shape.y1 + mut(shape.y2 - shape.y1, -height / 3, height / 3, rate);
                    shape.x3 = shape.x1 + mut(shape.x3 - shape.x1, -width / 3, width / 3, rate);
                    shape.y3 = shape.y1 + mut(shape.y3 - shape.y1, -height / 3, height / 3, rate);
                    shape.fill = getColorIndex(floor(shape.x1), floor(shape.y1), inspiration.image);
                    break;
                case "rectangle":
                    if (shape.layer == "bg") {
                        shape.x = mut(shape.x, 0, width, rate);
                        shape.y = mut(shape.y, 0, height, rate);
                        shape.w = mut(shape.w, 0, width / 2, rate);
                        shape.h = mut(shape.h, 0, height / 2, rate);
                        shape.fill = getColorIndex(floor(shape.x), floor(shape.y), inspiration.image);
                    }
                    else if (shape.layer == "fg") {
                        shape.x = mut(shape.x, 0, width, rate);
                        shape.y = mut(shape.y, 0, height, rate);
                        shape.w = mut(shape.w, 0, width / 2, rate);
                        shape.h = mut(shape.h, 0, height / 2, rate);
                        shape.fill = getColorIndex(floor(shape.x), floor(shape.y), inspiration.image);
                    }
                    
                    break;
                }
            break;
        case "Lagoon":
            break;
        case "Ocean":
            break;
    }
  }
}

function mut(num, min, max, rate) {
  return constrain(randomGaussian(num, (rate * (max - min)) / 10), min, max);
}
