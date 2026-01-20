// sketch.js (FULL) - Wave Pulse Simulation with clean ticks + no cropping

// Domain and sampling
const xMin = 0;
const xMax = 15;
const HIST_MAX = 2000;
let nPts = 500;

// Parameters (UI)
let direction = "Right";
let cWave = 1.0;
let heightAmp = 1.0;
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
let ui = {};

// Canvas sizing
const CANVAS_H = 760; // enough room for both plots + ticks

function setup() {
  const holder = document.getElementById("canvas-holder");
  const w = Math.max(520, holder.clientWidth - 20); // minus padding
  const canvas = createCanvas(w, CANVAS_H);
  canvas.parent("canvas-holder");
  pixelDensity(1);

  buildUI();
  resetSim();
}

function windowResized() {
  const holder = document.getElementById("canvas-holder");
  if (!holder) return;
  const w = Math.max(520, holder.clientWidth - 20);
  resizeCanvas(w, CANVAS_H);
}

function draw() {
  background(255);
  readUI();

  // Update time + history
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

  // Layout (more margin for tick labels)
  const padTop = 26;
  const leftMargin = 90;     // space for y ticks + y label
  const rightMargin = 26;
  const topH = 260;
  const bottomH = 210;
  const gap = 90;            // space between plots (title + ticks)
  const bottomPad = 70;      // room for history x ticks + xlabel

  const x0 = leftMargin;
  const x1 = width - rightMargin;

  const snapY0 = padTop;
  const snapY1 = snapY0 + topH;

  const histY0 = snapY1 + gap;
  const histY1 = histY0 + bottomH;

  // Snapshot axes + plot
  drawAxes(
    x0, snapY0, x1, snapY1,
    "x", "Displacement",
    `${pulseName} Pulse Traveling ${direction}   (t=${t.toFixed(2)} s)`,
    xMin, xMax,
    -heightAmp - 0.1, heightAmp + 0.1
  );
  drawSnapshot(x0, snapY0, x1, snapY1);

  // History axes + plot
  drawAxes(
    x0, histY0, x1, histY1,
    "Time", "Displacement",
    `History at x = ${xPoint.toFixed(2)}`,
    0, tMax,
    -heightAmp - 0.1, heightAmp + 0.1
  );
  drawHistory(x0, histY0, x1, histY1);

  // Safety: if canvas height is too small for layout, show warning text
  if (histY1 + bottomPad > height) {
    noStroke();
    fill(200, 0, 0);
    textSize(12);
    textAlign(LEFT, TOP);
    text("Canvas too short: increase CANVAS_H in sketch.js", 10, height - 18);
  }
}

/* ---------------- Physics ---------------- */

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
  const val = (1 - Math.abs(x) / widthParam) * heightAmp;
  return Math.max(0, val);
}

function sqr(x) {
  return (Math.abs(x) <= widthParam / 2) ? heightAmp : 0;
}

function sinePulse(x) {
  if (Math.abs(x) > widthParam / 2) return 0;
  return heightAmp * Math.sin(Math.PI * (x / (widthParam / 2)));
}

function sineWavePulse(x) {
  if (Math.abs(x) > widthParam / 2) return 0;
  return heightAmp * Math.sin(2 * Math.PI * 3 * x / 5);
}

function gauss(x) {
  const sigma = 0.1 * widthParam;
  return heightAmp * Math.exp(-(x * x) / (sigma * sigma));
}

function nonSymTri(x) {
  let y = 0;
  const r = 1.0, f = 3.0;
  if (x >= -r && x < 0) y = ((x + r) / r) * heightAmp;
  if (x >= 0 && x <= f) y = ((f - x) / f) * heightAmp;
  return Math.max(0, y);
}

function trapezoid(x) {
  const h = heightAmp;
  const left = -2, flatRight = 1, right = 2;
  if (x >= left && x <= flatRight) return h;
  if (x > flatRight && x <= right) return (right - x) / (right - flatRight) * h;
  return 0;
}

/* ---------------- Drawing helpers ---------------- */

function drawSnapshot(x0, y0, x1, y1) {
  stroke(0);
  strokeWeight(2);
  noFill();

  beginShape();
  for (let i = 0; i < nPts; i++) {
    const x = lerp(xMin, xMax, i / (nPts - 1));
    const y = uAt(x, t);
    const px = map(x, xMin, xMax, x0, x1);
    const py = map(y, -heightAmp - 0.1, heightAmp + 0.1, y1, y0);
    vertex(px, py);
  }
  endShape();

  // Red dot
  const yP = uAt(xPoint, t);
  const px = map(xPoint, xMin, xMax, x0, x1);
  const py = map(yP, -heightAmp - 0.1, heightAmp + 0.1, y1, y0);

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
    const py = map(histU[i], -heightAmp - 0.1, heightAmp + 0.1, y1, y0);
    vertex(px, py);
  }
  endShape();
}

/*
 drawAxes draws:
 - box
 - title above
 - x/y labels
 - tick marks + numeric labels
*/
function drawAxes(x0, y0, x1, y1, xlabel, ylabel, title,
                  xMinVal, xMaxVal, yMinVal, yMaxVal) {

  // Box
  stroke(0);
  strokeWeight(1);
  noFill();
  rect(x0, y0, x1 - x0, y1 - y0);

  // Title (above)
  noStroke();
  fill(0);
  textSize(14);
  textAlign(LEFT, BOTTOM);
  text(title, x0, y0 - 6);

  // Labels
  textSize(12);
  textAlign(CENTER, TOP);
  text(xlabel, (x0 + x1) / 2, y1 + 34);

  push();
  translate(x0 - 60, (y0 + y1) / 2);
  rotate(-HALF_PI);
  textAlign(CENTER, TOP);
  text(ylabel, 0, 0);
  pop();

  // Ticks
  textSize(10);
  fill(0);
  stroke(0);

  const nXTicks = 6;
  const nYTicks = 5;

  // X ticks (below box)
  for (let i = 0; i <= nXTicks; i++) {
    const val = lerp(xMinVal, xMaxVal, i / nXTicks);
    const px = map(val, xMinVal, xMaxVal, x0, x1);

    line(px, y1, px, y1 + 6);
    noStroke();
    textAlign(CENTER, TOP);
    text(val.toFixed(1), px, y1 + 10);
    stroke(0);
  }

  // Y ticks (left of box)
  for (let j = 0; j <= nYTicks; j++) {
    const val = lerp(yMinVal, yMaxVal, j / nYTicks);
    const py = map(val, yMinVal, yMaxVal, y1, y0);

    line(x0 - 6, py, x0, py);
    noStroke();
    textAlign(RIGHT, CENTER);
    text(val.toFixed(1), x0 - 10, py);
    stroke(0);
  }
}

/* ---------------- UI ---------------- */

function buildUI() {
  const holder = select("#ui");
  holder.html("");

  createElement("label", "Pulse shape").parent(holder);
  ui.pulseSel = createSelect().parent(holder);
  ["Triangular", "Square", "Sine", "Gaussian", "Non-symmetric Triangle", "Sine-wave", "Trapezoid-pulse"]
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
  ui.hSlider = createSlider(0.1, 2.0, heightAmp, 0.1).parent(holder);

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
  heightAmp = ui.hSlider.value();
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
