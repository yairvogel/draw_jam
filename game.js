function argmax(array) {
  return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
}

const classes = [
    'bee',
    'book',
    'radio',
    'lion',
    'paintbrush',
    'rifle',
    'hedgehog',
    'pineapple',
    'key',
    'squirrel',
    'sheep',
    'bicycle',
    'lantern',
    'toothbrush',
    'spider',
    'parrot',
    'chair',
    'stove',
    'rabbit',
    'cactus'
];
let sketchRnn;
let sketchRnns;
function generateLine(currentLines) {
  background(255);
  const lines = currentLines.flatMap((aLine) => {
    rdpLine = Rdp(aLine, 4);
    rdpLine[rdpLine.length - 1].pen = "up";
    for (let i = 0; i < rdpLine.length - 1; i++) {
      line(rdpLine[i].x, rdpLine[i].y, rdpLine[i + 1].x, rdpLine[i + 1].y);
    }
    return rdpLine;
  });
  const finalLine = [];
  for (let i = 1; i < lines.length; i++) {
    finalLine.push({
      dx: lines[i].x - lines[i - 1].x,
      dy: lines[i].y - lines[i - 1].y,
      pen: lines[i].pen,
    });
  }
  lastPen = "up";
  const tensorInput = tf.tensor([
    lines.map((point) => [point.x, point.y, point.pen === "down" ? 0 : 1]),
  ]);
  console.log(tensorInput);
  const predictionDistribution = classifier.predict(tensorInput);
  console.log(predictionDistribution.dataSync());
  const prediction = argmax([...predictionDistribution.dataSync()]);
  if (!sketchRnns[prediction]) {
    sketchRnns[prediction] = ml5.sketchRNN(classes[prediction]);
  }
  console.log('drawing a', classes[prediction]);
  sketchRnn = sketchRnns[prediction];
  sketchRnn.generate(gotStrokePath);
}
let shouldStartLine = false;
let lastPen = "down";

strokes = 0;
function gotStrokePath(error, strokePath) {
  switch (lastPen) {
    case "down":
      drawLineTo(prevX + strokePath.dx, prevY + strokePath.dy);
      setTimeout(() => sketchRnn.generate(gotStrokePath), 0);
      break;
    case "up":
      currentLine.length && lines.push(currentLine);
      startLine(prevX + strokePath.dx, prevY + strokePath.dy);
      if (strokes == 0) {
        strokes += 1;
        setTimeout(() => sketchRnn.generate(gotStrokePath), 0);
      } else strokes = 0;
      break;
    case "end":
      break;
  }
  lastPen = strokePath.pen;
}

let cnv;
let prevX, prevY;

setup = () => {
  cnv = createCanvas(window.innerWidth * 0.9, window.innerHeight * 0.8);
  cnv.parent("canvasContainer");
  document.getElementById('canvasContainer').style.display = 'block';
  startLine(width / 2, height / 2);
  sketchRnns = [classes.map(_ => {})];

  background(255);
};

let currentLine = [];
let lines = [];

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

let resetClicked = false;

mouseReleased = () => {
  if (!resetClicked) {
    const anotherLine = [...currentLine];
    lines.push(anotherLine);
    setTimeout(() => generateLine(lines), 300);
  }
  currentLine = [];
};

mousePressed = () => {
  startLine(mouseX, mouseY);
};

mouseDragged = () => {
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
