// Wave Pulse Simulation (p5.js)

const xMin = 0;
const xMax = 15;
let nPts = 500;

let direction = "Right";
let cWave = 1.0;
let height = 1.0;
let widthParam = 2.0;
let aStart = 0.0;
let xPoint = 6.0;
let tMax = 15.0;

let pulseName = "Non-symmetric Triangle";
let playing = false;
let t = 0;
let dt = 1 / 60;

let histT = [];
let histU = [];
const HIST_MAX = 2000;

let ui = {};

function setup() {
  const canvas = createCanvas(600, 400);
  canvas.parent("canvas-holder");
  pixelDensity(1);

  buildUI();
  resetSim();
}

function draw() {
  background(255);
  readUI();

  if (playing) {
    t += dt;
    if (t > tMax) {
      t = tMax;
      playing = false;
      ui.playBtn.html("Play");
    }
    const uVal = uAt(xPoint, t);
    histT.push(t);
    histU.push(uVal);
    if (histT.length > HIST_MAX) {
      histT.shift();
      histU.shift();
    }
  }

  const pad = 28;
  const topH = 260;
  const bottomH = 200;
  const left = pad;
  const right = width - pad;

  drawAxes(
  left, pad, right, pad + topH,
  "x", "Displacement",
  `${pulseName} Pulse Traveling ${direction}   (t=${t.toFixed(2)} s)`,
  xMin, xMax,
  -height - 0.1, height + 0.1
);

  drawSnapshot(left, pad, right, pad + topH);

  drawAxes(
  left, pad + topH + 30, right, pad + topH + 30 + bottomH,
  "Time", "Displacement",
  `History at x = ${xPoint.toFixed(2)}`,
  0, tMax,
  -height - 0.1, height + 0.1
);

  drawHistory(left, pad + topH + 30, right, pad + topH + 30 + bottomH);
}

function uAt(x, tNow) {
  const sgn = (direction === "Right") ? -1 : +1;
  const arg = x + sgn * cWave * tNow - aStart;
  return pulseShape(arg);
}

function pulseShape(x) {
  switch (pulseName) {
    case "Triangular": return tri(x);
    case "Square": return sqr(x);
    case "Sine": return sinePulse(x);
    case "Gaussian": return gauss(x);
    case "Non-symmetric Triangle": return nonSymTri(x);
    case "Sine-wave": return sineWavePulse(x);
    case "Trapezoid-pulse": return trapezoid(x);
    default: return nonSymTri(x);
  }
}

function tri(x) {
  const val = (1 - Math.abs(x) / widthParam) * height;
  return Math.max(0, val);
}

function sqr(x) {
  return (Math.abs(x) <= widthParam / 2) ? height : 0;
}

function sinePulse(x) {
  if (Math.abs(x) > widthParam / 2) return 0;
  return height * Math.sin(Math.PI * (x / (widthParam / 2)));
}

function sineWavePulse(x) {
  if (Math.abs(x) > widthParam / 2) return 0;
  return height * Math.sin(2 * Math.PI * 3 * x / 5);
}

function gauss(x) {
  const sigma = 0.1 * widthParam;
  return height * Math.exp(-(x * x) / (sigma * sigma));
}

function nonSymTri(x) {
  let y = 0;
  const r = 1.0, f = 3.0;
  if (x >= -r && x < 0) y = ((x + r) / r) * height;
  if (x >= 0 && x <= f) y = ((f - x) / f) * height;
  return Math.max(0, y);
}

function trapezoid(x) {
  const h = height;
  const left = -2, flatRight = 1, right = 2;
  if (x >= left && x <= flatRight) return h;
  if (x > flatRight && x <= right) return (right - x) / (right - flatRight) * h;
  return 0;
}

function drawSnapshot(x0, y0, x1, y1) {
  stroke(0);
  strokeWeight(2);
  noFill();

  beginShape();
  for (let i = 0; i < nPts; i++) {
    const x = lerp(xMin, xMax, i / (nPts - 1));
    const y = uAt(x, t);
    const px = map(x, xMin, xMax, x0, x1);
    const py = map(y, -height - 0.1, height + 0.1, y1, y0);
    vertex(px, py);
  }
  endShape();

  const yPoint = uAt(xPoint, t);
  const px = map(xPoint, xMin, xMax, x0, x1);
  const py = map(yPoint, -height - 0.1, height + 0.1, y1, y0);
  fill(220, 0, 0);
  noStroke();
  circle(px, py, 12);
}

function drawHistory(x0, y0, x1, y1) {
  stroke(220, 0, 0);
  strokeWeight(2);
  noFill();
  if (histT.length < 2) return;

  beginShape();
  for (let i = 0; i < histT.length; i++) {
    const px = map(histT[i], 0, tMax, x0, x1);
    const py = map(histU[i], -height - 0.1, height + 0.1, y1, y0);
    vertex(px, py);
  }
  endShape();
}

function drawAxes(x0, y0, x1, y1, xlabel, ylabel, title,
                  xMinVal, xMaxVal, yMinVal, yMaxVal) {

  // Box
  stroke(0);
  strokeWeight(1);
  noFill();
  rect(x0, y0, x1 - x0, y1 - y0);

  // Title
  noStroke();
  fill(0);
  textSize(14);
  textAlign(LEFT, BOTTOM);
  text(title, x0 + 6, y0 + 16);


  // Axis labels
  textSize(12);
  textAlign(CENTER, TOP);
  text(xlabel, (x0 + x1) / 2, y1 + 10);

  push();
  translate(x0 - 28, (y0 + y1) / 2);
  rotate(-HALF_PI);
  textAlign(CENTER, TOP);
  text(ylabel, 0, 0);
  pop();

  // ---- TICKS ----
  textSize(10);
  fill(0);
  stroke(0);

  const nXTicks = 6;
  const nYTicks = 5;

    // X-axis ticks (draw INSIDE the box so they don't overlap the next plot)
  for (let i = 0; i <= nXTicks; i++) {
    const val = lerp(xMinVal, xMaxVal, i / nXTicks);
    const px = map(val, xMinVal, xMaxVal, x0, x1);

    // tick goes upward into the plot
    line(px, y1, px, y1 - 6);

    noStroke();
    textAlign(CENTER, BOTTOM);
    // label sits just above the bottom edge (inside)
    text(val.toFixed(1), px, y1 - 8);
    stroke(0);
  }


  // Y-axis ticks
  for (let j = 0; j <= nYTicks; j++) {
    const val = lerp(yMinVal, yMaxVal, j / nYTicks);
    const py = map(val, yMinVal, yMaxVal, y1, y0);

    line(x0 - 5, py, x0, py); // tick
    noStroke();
    textAlign(RIGHT, CENTER);
    text(val.toFixed(1), x0 - 8, py);
    stroke(0);
  }
}


function buildUI() {
  const holder = select("#ui");
  holder.html("");

  createElement("label", "Pulse shape").parent(holder);
  ui.pulseSel = createSelect().parent(holder);
  ["Triangular","Square","Sine","Gaussian","Non-symmetric Triangle","Sine-wave","Trapezoid-pulse"]
    .forEach(s => ui.pulseSel.option(s));
  ui.pulseSel.value(pulseName);

  createElement("label", "Direction").parent(holder);
  ui.dirSel = createSelect().parent(holder);
  ui.dirSel.option("Right");
  ui.dirSel.option("Left");
  ui.dirSel.value(direction);

  holder.child(createP(""));

  ui.playBtn = createButton("Play").parent(holder);
  ui.playBtn.mousePressed(() => {
    playing = !playing;
    ui.playBtn.html(playing ? "Pause" : "Play");
  });

  ui.resetBtn = createButton("Reset").parent(holder);
  ui.resetBtn.mousePressed(resetSim);

  holder.child(createP(""));

  createElement("label", "Wave speed c").parent(holder);
  ui.cSlider = createSlider(0.1, 5.0, cWave, 0.1).parent(holder);

  createElement("label", "Pulse height").parent(holder);
  ui.hSlider = createSlider(0.1, 2.0, height, 0.1).parent(holder);

  createElement("label", "Pulse width").parent(holder);
  ui.wSlider = createSlider(0.2, 6.0, widthParam, 0.1).parent(holder);

  createElement("label", "Initial pulse center a").parent(holder);
  ui.aSlider = createSlider(xMin, xMax, aStart, 0.1).parent(holder);

  createElement("label", "Point of interest x").parent(holder);
  ui.xpSlider = createSlider(xMin, xMax, xPoint, 0.1).parent(holder);

  createElement("label", "Max time").parent(holder);
  ui.tMaxSlider = createSlider(1.0, 30.0, tMax, 0.5).parent(holder);

  createElement("label", "FPS (target)").parent(holder);
  ui.fpsSlider = createSlider(10, 60, 60, 1).parent(holder);

  createP("Tip: For Right, choose x_point > a. For Left, choose x_point < a.")
    .style("color:#444;font-size:12px")
    .parent(holder);
}

function readUI() {
  pulseName = ui.pulseSel.value();

  const newDir = ui.dirSel.value();
  if (newDir !== direction) {
    direction = newDir;
    aStart = (direction === "Right") ? xMin : xMax;
    ui.aSlider.value(aStart);
    resetSim();
  }

  cWave = ui.cSlider.value();
  height = ui.hSlider.value();
  widthParam = ui.wSlider.value();
  aStart = ui.aSlider.value();
  xPoint = ui.xpSlider.value();
  tMax = ui.tMaxSlider.value();

  const fps = ui.fpsSlider.value();
  dt = 1 / fps;

  t = constrain(t, 0, tMax);
}

function resetSim() {
  playing = false;
  ui.playBtn?.html("Play");
  t = 0;
  histT = [];
  histU = [];
}


