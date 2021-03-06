let currentLine = [];
let lines = [];
let shouldStartLine = false;
let lastPen = "down";
let turnBtn = document.getElementById("turn");

turnBtn.addEventListener("click", () => {
  window.dispatchEvent(
    new CustomEvent("turnChanged", { detail: { turn: "ai" } })
  );
});

let cnv;
let prevX, prevY;

window.addEventListener("modelLoaded", () => {
  document.getElementById("canvasContainer").style.display = "block";
});

window.addEventListener("turnChanged", (e) => {
  const { detail } = e;
  const { turn } = detail;
  if (turn === "player") {
    turnBtn.innerHTML = "Draw and click here";
    turnBtn.style.backgroundColor = "#B5FFCC";
    mouseReleased = finishedLine;
    mousePressed = startedLine;
    mouseDragged = lineDrawn;
  }
  if (turn === "ai") {
    turnBtn.innerHTML = "Ai is drawing...";
    turnBtn.style.backgroundColor = "#FFE5B8"
    mouseReleased = null;
    mousePressed = null;
    mouseDragged = null;
    setTimeout(() => generateLine(lines), 300);
  }
});

const classes = [
  "bee",
  "book",
  "radio",
  "lion",
  "paintbrush",
  "rifle",
  "hedgehog",
  "pineapple",
  "key",
  "squirrel",
  "sheep",
  "bicycle",
  "lantern",
  "toothbrush",
  "spider",
  "parrot",
  "chair",
  "stove",
  "rabbit",
  "cactus",
];
let currentRnn;
let sketchRnns;
function generateLine(currentLines) {
  const aggregatedLines = getAggregatedLines(currentLines);
  if (!aggregatedLines.length) {
      window.dispatchEvent(new CustomEvent('turnChanged', { detail: { turn: 'player'}}));
      return;
  }
  const normalizedLines = normalizeLine(aggregatedLines)
  const deltaLines = getDeltaLines(normalizedLines);
  lastPen = "up";
  prevX = aggregatedLines[aggregatedLines.length - 1].x;
  prevY = aggregatedLines[aggregatedLines.length - 1].y;
  const tensorInput = getTensorInput(aggregatedLines);
  const prediction = classify(tensorInput);
  console.log("drawing a", classes[prediction]);
  const currentRnn = getSketchRnn(prediction);
  currentRnn.generate(deltaLines, gotStrokePath);
}

strokes = 0;
function getSketchRnn(prediction) {
    if (sketchRnns[prediction]) {
        sketchRnns[prediction].reset();
    } else {
        sketchRnns[prediction] = ml5.sketchRNN(classes[prediction]);
    }
    currentRnn = sketchRnns[prediction];
    return currentRnn;
}

function classify(tensorInput) {
    const predictionDistribution = classifier.predict(tensorInput);
    console.log(tensorInput)
    console.log(predictionDistribution)
    return argmax([...predictionDistribution.dataSync()]);
}

function getTensorInput(aggregatedLines) {
    const normalizedLines = normalizeLine(aggregatedLines);
    return tf.tensor([
        normalizedLines.map((point) => [point.x, point.y, point.pen === "down" ? 0 : 1]),
    ]);
}

function normalizeLine(aggregatedLines) {
    const xs = aggregatedLines.map(p => p.x);
    const ys = aggregatedLines.map(p => p.y);
    const minX = min(xs);
    const minY = min(ys);
    const dX = max(xs) - minX || xs[0];
    const dY = max(ys) - minY || ys[0];
    return aggregatedLines.map(p => ({ x: (p.x - minX) / dX, y: (p.y - minY) / dY, pen: p.pen }));
}

function getAggregatedLines(currentLines) {
    return currentLines.flatMap((aLine) => {
        if (!aLine.length) return aLine;
        console.log(aLine);
        aLine[aLine.length - 1].pen = "up";
        return aLine;
    });
}

function getDeltaLines(lines) {
    const finalLine = [];
    for (let i = 1; i < lines.length; i++) {
        finalLine.push({
            dx: lines[i].x - lines[i - 1].x,
            dy: lines[i].y - lines[i - 1].y,
            pen: lines[i].pen,
        });
    }
}

function gotStrokePath(error, strokePath) {
  if (error) console.log(error);
  switch (lastPen) {
    case "down":
      drawLineTo(prevX + strokePath.dx, prevY + strokePath.dy);
      setTimeout(() => currentRnn.generate(gotStrokePath), 0);
      break;
    case "up":
      currentLine.length && lines.push(currentLine);
      startLine(prevX + strokePath.dx, prevY + strokePath.dy);
      if (strokes == 0) {
        strokes += 1;
        setTimeout(() => currentRnn.generate(gotStrokePath), 0);
      } else {
        strokes = 0;
        window.dispatchEvent(
          new CustomEvent("turnChanged", { detail: { turn: "player" } })
        );
      }
      break;
    case "end":
      window.dispatchEvent(
        new CustomEvent("turnChanged", { detail: { turn: "player" } })
      );
      break;
  }
  lastPen = strokePath.pen;
}

setup = () => {
  cnv = createCanvas(window.innerWidth * 0.9, window.innerHeight * 0.8);
  cnv.parent("canvasContainer");
  startLine(width / 2, height / 2);
  sketchRnns = [classes.map((_) => {})];

  background(255);
};

function startLine(curX, curY) {
  prevX = curX;
  prevY = curY;
  currentLine = [];
}

function drawLineTo(curX, curY) {
  currentLine.push({ x: curX, y: curY, pen: "down" });
  stroke(3);
  line(prevX, prevY, curX, curY);
  prevX = curX;
  prevY = curY;
}

const finishedLine = () => {
  const anotherLine = [...currentLine];
  lines.push(anotherLine);
  currentLine = [];
};

const startedLine = () => {
  startLine(mouseX, mouseY);
};

const lineDrawn = () => {
  drawLineTo(mouseX, mouseY);
};

let downloadButton = document.getElementById("download");
downloadButton.addEventListener("click", () => {
  saveCanvas(cnv, "My Drawing with AI", "png");
});

let restartButton = document.getElementById("restart");
restartButton.addEventListener("click", () => {
  location.reload();
});

function argmax(array) {
  return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
}
