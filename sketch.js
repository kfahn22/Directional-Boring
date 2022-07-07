// Horizontal Directional Drilling Simulation
// from The Coding Train (https://thecodingtrain.com/)
// Inspired by Practical Engineering (https://practical.engineering/)
// https://github.com/CodingTrain/Directional-Boring/

// Vectors for current position and direction
let pos, dir;
// Bias of current drill (up or down, 1 or -1)
let bias;
// All the points along the drill path so far
let path;
// Current state of game
let state;
// Find distance to nearest obstacle
let dist = [];

// Groundcolor is used to determine win or lose state
const groundColor = [139, 69, 19];
const groundLevel = 100;
// Position of the goal square box (relative to ground)
const goal = {
  x: 540,
  w: 20
};

// Pixel map for scene
let hddScene;

// Button to start
let startButton;

// Button for easy/hard mode
let mode;

// Reset the initial state
function startDrill() {
  pos = createVector(10, 100);
  dir = p5.Vector.fromAngle(PI / 6);
  path = [];
  bias = 1;
  state = 'PAUSED';
  mode = 'EASY';
}

function setup() {
  // Let's begin!
  createCanvas(600, 400);
  startDrill();

  // Handle the start and stop button
  startButton = createButton('start').mousePressed(function () {
    if (state == 'PAUSED') {
      state = 'DRILLING';
      this.html('pause');
    } else if (state == 'DRILLING') {
      state = 'PAUSED';
      this.html('start');
    } else if (state == 'WIN' || state == 'LOSE') {
      startDrill();
    }
  });

  // Handle the mode of play
  modeButton = createButton('Mode').mousePressed(function () {
    if (state == 'EASY') {
      state = 'HARD';
    } else if (state == 'HARD') {
      state = 'EASY';
    }
  });


  // Handle the toggle bias button
  createButton('toggle bias').mousePressed(function () {
    bias *= -1;
  });

  // A slider for adding some randomness
  createSpan('randomness: ');
  randomSlider = createSlider(0, 10, 0, 0.01);

  // Draw the scene
  hddScene = createGraphics(width, height);
  hddScene.background(51);
  hddScene.noStroke();
  hddScene.rectMode(CORNER);
  hddScene.fill(groundColor);
  hddScene.rect(0, groundLevel, width, height - groundLevel);
  hddScene.fill(30, 144, 255);
  hddScene.arc(width / 2, groundLevel, 400, 200, 0, PI);

  // Add the goal
  hddScene.fill(0, 255, 0);
  hddScene.rect(goal.x, groundLevel - goal.w, goal.w, goal.w);
}

// One drill step
function drill() {
  // Angle the drill turns per step
  const angle = 0.01;
  dir.rotate(angle * bias);

  // Add some randomness
  const randomFactor = randomSlider.value();
  const r = random(-randomFactor, randomFactor) * angle;
  dir.rotate(r);

  // Save previous position
  path.push(pos.copy());
  pos.add(dir);

  // Get pixel color under drill
  const c = hddScene.get(pos.x, pos.y);

  if (mode == 'EASY') {
    // check for win in easy 
    state = easy(c);
  } else if (mode === 'HARD') {
    state = hard(pos.x, pos.y);
  }
}

// // Green you win!
// if (c[0] == 0 && c[1] == 255 && c[2] == 0) {
//   state = 'WIN';
//   startButton.html('try again');
//   // Anything else not the ground color you lose!
// } else if (
//   c[0] != groundColor[0] ||
//   c[1] !== groundColor[1] ||
//   c[2] !== groundColor[2]
// ) {
//   state = 'LOSE';
//   startButton.html('try again');
// }
//}

// Draw loop
function draw() {
  // Dril!
  if (state == 'DRILLING') drill();

  // Draw the scene
  image(hddScene, 0, 0);
  if (mode == 'EASY') {
  // Draw the path
  beginShape();
  noFill();
  stroke(0);
  strokeWeight(2);
  for (let v of path) {
    vertex(v.x, v.y);
  }
  endShape();

  // Draw something where drill starts
  fill(255, 0, 0);
  stroke(255);
  strokeWeight(1);
  circle(10, groundLevel, 4);

  // Draw the drill bit
  stroke(255, 0, 0);
  strokeWeight(2);
  push();
  translate(pos.x, pos.y);
  rotate(dir.heading() + (PI / 6) * bias);
  line(0, 0, 10, 0);
  pop();
  } else if (mode === 'HARD') {
    stroke(255, 0, 0);
    dist = getDist(pos.x, pos.y);
    circle(pos.x, pos.y, dist);
  }
  // If you've lost!
  if (state == 'LOSE') {
    background(255, 0, 0, 150);
    textAlign(CENTER, CENTER);
    noStroke();
    fill(255);
    textSize(96);
    textFont('courier-bold');
    text('YOU LOSE', width / 2, height / 2);
    // If you've won!
  } else if (state == 'WIN') {
    background(0, 255, 0, 150);
    textAlign(CENTER, CENTER);
    noStroke();
    fill(255);
    textSize(96);
    textFont('courier-bold');
    text('YOU WIN', width / 2, height / 2);
    textSize(24);
    // Starting idea for a score
    text(`pipe length: ${path.length}`, width / 2, height / 2 + 96);
  }
}

function easy(c) {
  // Green you win!
  if (c[0] == 0 && c[1] == 255 && c[2] == 0) {
    state = 'WIN';
    startButton.html('try again');
    // Anything else not the ground color you lose!
  } else if (
    c[0] != groundColor[0] ||
    c[1] !== groundColor[1] ||
    c[2] !== groundColor[2]
  ) {
    state = 'LOSE';
    startButton.html('try again');
  }
  return state;
}

function hard(x, y) {
  let e = isInEllipse(x, y);
  let c1 = isInCircle(x, y, 175, 250, 30);
  let c2 = isInCircle(x, y, 250, 275, 20);
  let c3 = isInCircle(x, y, 475, 200, 40);

  if (y > 100 && e) {
    state = 'LOSE';
    startButton.html('try again');
  } else if (x < 200 && y < 100 || x > 600) {
    state = 'LOSE';
    startButton.html('try again');
  } else if (y > 400) {
    state = 'LOSE';
    startButton.html('try again');
  } else if (c1 || c2 || c3) {
    state = 'LOSE';
    startButton.html('try again');
  } else if (x == 540 && y < 20) {
    state = 'WIN';
    startButton.html('try again');
  }
  return state;
}

function addObstacle() {
  stroke(59);
  circle(175, 250, 30);
  circle(250, 275, 20);
  circle(475, 200, 40);
}

//https://stackoverflow.com/questions/34731883/ellipse-mouse-collision-detection
function isInEllipse(x, y) {
  let a = 200;
  let b = 100;
  let dx = x - 300;
  let dy = y - 100;
  return ((dx * dx) / (a * a) + (dy * dy) / (b * b) <= 1);
}

function isInCircle(x, y, a, b, r) {
  let xsq = pow((x - a), 2);
  let ysq = pow((y - b), 2);
  if (xsq + ysq < r * r) {
    return true;
  }
}

function getDist(x,y) {
  // Find distance to left boundary
  dist[0] = x;
  // Find distance to right boundary
  dist[1] = 600 - x;
  // Find distance to surface
  dist[2] = y - 100;
  // Find distance to bottom 
  dist[3] = 600 - y;
  // Find distance to water
  dist[4] = getDistFromEllipse(300,100,200,100, pos.x, pos.y);
  let minDist = 600;
  for (let i=0; i<dist.length; i++) {
    if (dist[i]< minDist) {
      minDist = dist[i];
    }
  }
  return minDist;
}

function getDistFromEllipse(cx, cy, a, b, posx, posy){
  let startAngle=-PI/2;
  let lastX=cx-(a*Math.cos(startAngle));
  let lastY=cy+(b*Math.sin(startAngle));
  let points=[];
  for(var i=0;i<1000;i++){
    let angle=startAngle+PI2/1000*i;
    let x=cx-(a*Math.cos(angle));
    let y=cy+(b*Math.sin(angle));
    let dx=x-lastX;
    let dy=y-lastY;
    let length=parseInt(Math.sqrt(dx*dx+dy*dy));
    let eAngle=(Math.atan2(dy,dx)+PI2)%PI2;
    if(length>0){
      points.push({x:x,y:y,angle:eAngle});
      lastX=x;
      lastY=y;
    }
  }
  for (i=0; i< points.length; i++) {
    let minDist = 600;
    dist = sqrt(pow((posx-points.x),2) + pow((posy-points.y),2));
    if (dist < minDist) {
      minDist = dist;
    }
  }
 return minDist;
}
