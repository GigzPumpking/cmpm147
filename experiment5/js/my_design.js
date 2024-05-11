/* exported getInspirations, initDesign, renderDesign, mutateDesign */

const whRatio = 16;

function getInspirations() {
  return [
    {
      name: "Grilled Cheese in the Airfryer", 
      assetUrl: "https://cdn.glitch.global/469cb487-7465-4986-a3b9-ba3dea1ad22d/grilled_cheese.jpeg?v=1715032914025",
      credit: "Grilled Cheese in the Airfryer, Hung Nguyen, 2022",
      key: "Grill",
      bg: [0, 0, 0],
      colors: [[47, 47, 47], [254, 251, 243], [237, 162, 57]]
    },
    {
      name: "Neary Lagoon", 
      assetUrl: "https://cdn.glitch.global/469cb487-7465-4986-a3b9-ba3dea1ad22d/neary_lagoon.jpeg?v=1715033523805",
      credit: "Neary Lagoon, Hung Nguyen, 2024",
      key: "Lagoon",
      bg: [155, 148, 134],
      colors: [[0, 0, 0], [116, 113, 107], [246, 214, 166]]
    },
    {
      name: "Santa Cruz Ocean", 
      assetUrl: "https://cdn.glitch.global/469cb487-7465-4986-a3b9-ba3dea1ad22d/ocean.jpeg?v=1715033518468",
      credit: "Santa Cruz Ocean, Hung Nguyen, 2024",
      key: "Ocean",
      bg: [63, 132, 211],
      colors: [[46, 108, 179], [143, 134, 11], [34, 43, 50], [160, 147, 123], [82, 109, 128], [165, 192, 213]]
    }
  ];
}

function initDesign(inspiration) {
  resizeCanvas(inspiration.image.width / whRatio, inspiration.image.height / whRatio);
  inspiration.image.loadPixels();
  let fill = inspiration.bg;
  let design = {
    bg: fill,
    fg: []
  }
  
  switch (inspiration.key) {
    case "Grill":
      for(let i = 0; i < 75; i++) {
        // Shades of dark
        let x = floor(random(width));
        let y = floor(random(height));
        let w = floor(random(width/2));
        let h = floor(random(height/2));
        design.fg.push({x: x,
                        y: y,
                        w: w,
                        h: h,
                        fill: [47, 47, 47],
                        alpha: random(0, 255),
                        shape: "rect",
                        color: fill,
                      })
      }
      for(let i = 0; i < 50; i++) {
        // Shades of light gray
        let x = floor(random(width));
        let y = floor(random(height));
        let w = floor(random(width/2));
        let h = floor(random(height/2));
        design.fg.push({x: x,
                        y: y,
                        w: w,
                        h: h,
                        fill: [254, 251, 243],
                        alpha: random(0, 255),
                        shape: "rect",
                        color: fill,
                      })
      }
      for(let i = 0; i < 25; i++) {
        // Shades of orange

        // Initialized in the middle
        let x = floor(random(width/2 - width/4, width/2 + width/4));
        let y = floor(random(height/2 - height/4, height/2 + height/4));
        let w = floor(random(width/4));
        let h = floor(random(height/4));
        design.fg.push({x: x,
                        y: y,
                        w: w,
                        h: h,
                        fill: [237, 162, 57],
                        alpha: random(0, 255),
                        shape: "rect",
                        color: fill,
                      })
      }
      break;
    case "Lagoon":
      // 200 black triangles
      for(let i = 0; i < 200; i++) {
        // equilateral triangle
        let x1 = random(width);
        let y1 = random(height);
        let x2 = x1 + random(-width/6, width/6);
        let y2 = y1 + random(-height/6, height/6);
        let x3 = x1 + random(-width/6, width/6);
        let y3 = y1 + random(-height/6, height/6);
        design.fg.push({x1: x1,
                        y1: y1,
                        x2: x2,
                        y2: y2,
                        x3: x3,
                        y3: y3,
                        fill: [0, 0, 0],
                        alpha: random(0, 255),
                        shape: "triangle",
                        color: fill,
                        rotation: random(TWO_PI)
                      })
      }
      // 200 gray triangles
      for(let i = 0; i < 200; i++) {
        // equilateral triangle
        let x1 = random(width);
        let y1 = random(height);
        let x2 = x1 + random(-width/6, width/6);
        let y2 = y1 + random(-height/6, height/6);
        let x3 = x1 + random(-width/6, width/6);
        let y3 = y1 + random(-height/6, height/6);
        design.fg.push({x1: x1,
                        y1: y1,
                        x2: x2,
                        y2: y2,
                        x3: x3,
                        y3: y3,
                        fill: [116, 113, 107],
                        alpha: random(0, 255),
                        shape: "triangle",
                        color: fill,
                        rotation: random(TWO_PI)
                      })
      }
      break;
    case "Ocean":
      // Create 200 blue ellipses
      for(let i = 0; i < 400; i++) {
        let x = random(width);
        let y = random(height);
        let w = random(width/4);
        let h = random(height/4);
        design.fg.push({x: x,
                        y: y,
                        w: w,
                        h: h,
                        fill: [46, 108, 179],
                        alpha: random(0, 255),
                        shape: "ellipse",
                        color: fill,
                      })
      }
      // Create 200 brown ellipses
      for(let i = 0; i < 300; i++) {
        let x = random(width);
        let y = random(height);
        let w = random(width/4);
        let h = random(height/4);
        design.fg.push({x: x,
                        y: y,
                        w: w,
                        h: h,
                        fill: [143, 134, 11],
                        alpha: random(0, 255),
                        shape: "ellipse",
                        color: fill,
                      })
      }
      // Create 200 seafoam colored ellipses
      for(let i = 0; i < 400; i++) {
        let x = random(width);
        let y = random(height);
        let w = random(width/8);
        let h = random(height/8);
        design.fg.push({x: x,
                        y: y,
                        w: w,
                        h: h,
                        fill: [168, 186, 201],
                        alpha: random(0, 255),
                        shape: "ellipse",
                        color: fill,
                      })
      }

      break;
  }
  
  return design;
}

function renderDesign(design, inspiration) {
  background(design.bg[0], design.bg[1], design.bg[2]);
  noStroke();
  for(let obj of design.fg) {
    fill(obj.color[0], obj.color[1], obj.color[2], obj.alpha);
    if (obj.shape === "rect") {
      push();
      translate(obj.x, obj.y);
      rect(0, 0, obj.w, obj.h);
      pop();
    }
    else if (obj.shape === "triangle") { 
      push();
      translate(obj.x1, obj.y1);
      rotate(obj.rotation);
      triangle(0, 0, obj.x2 - obj.x1, obj.y2 - obj.y1, obj.x3 - obj.x1, obj.y3 - obj.y1);
      pop();
    } else if (obj.shape === "ellipse") {
      ellipse(obj.x, obj.y, obj.w, obj.h);
    }
    noFill();
  }
  
  
}

function mutateDesign(design, inspiration, rate) {
  
  for(let obj of design.fg) {
    if (obj.shape === "rect") {
      obj.x = mut(obj.x, 0, width, rate);
      obj.y = mut(obj.y, 0, height, rate);
      obj.w = mut(obj.w, 0, width/2, rate);
      obj.h = mut(obj.h, 0, height/2, rate);
    }
    else if (obj.shape === "triangle") {
      obj.x1 = mut(obj.x1, 0, width, rate);
      obj.y1 = mut(obj.y1, 0, height, rate);
      obj.x2 = mut(obj.x2, 0, width, rate);
      obj.y2 = mut(obj.y2, 0, height, rate);
      obj.x3 = mut(obj.x3, 0, width, rate);
      obj.y3 = mut(obj.y3, 0, height, rate);
      obj.rotation = mut(obj.rotation, 0, TWO_PI, rate);
    }
    else if (obj.shape === "ellipse") {
      obj.x = mut(obj.x, 0, width, rate);
      obj.y = mut(obj.y, 0, height, rate);
      obj.w = mut(obj.w, 0, width/8, rate);
      obj.h = mut(obj.h, 0, height/8, rate);
    }
    obj.alpha = mut(obj.alpha, 0, 255, rate);
    // randomize the fill color at the rate
    if(random(1) < rate) {
      obj.fill = inspiration.colors[floor(random(inspiration.colors.length))];
    }
    // mut each color channel within a specific range of the fill
    for(let i = 0; i < 3; i++) {
      obj.color[i] = mut(obj.fill[i], 0, 255, rate);
    }
  }
}

function mut(num, min, max, rate) {
    return constrain(randomGaussian(num, (rate * (max - min)) / 10), min, max);
}
