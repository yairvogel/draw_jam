// The Coding Train
// https://thecodingtrain.com/CodingChallenges/153-interactive-sketchrnn.html
// https://youtu.be/ZCXkvwLxBrA
// https://editor.p5js.org/codingtrain/sketches/hcumr-aua

function Rdp(points, epsilon = 0.1) {
  let rdpPoints = [];
  rdp(0, points.length - 1, points, rdpPoints, epsilon);
  return [points[0], ...rdpPoints, points[points.length - 1]];
}

function rdp(startIndex, endIndex, allPoints, rdpPoints, epsilon) {
  const nextIndex = findFurthest(allPoints, startIndex, endIndex, epsilon);
  if (nextIndex > 0) {
    if (startIndex != nextIndex) {
      rdp(startIndex, nextIndex, allPoints, rdpPoints, epsilon);
    }
    rdpPoints.push(allPoints[nextIndex]);
    if (endIndex != nextIndex) {
      rdp(nextIndex, endIndex, allPoints, rdpPoints, epsilon);
    }
  }
}

function findFurthest(points, a, b, epsilon) {
  let recordDistance = -1;
  const start = points[a];
  const end = points[b];
  let furthestIndex = -1;
  for (let i = a + 1; i < b; i++) {
    const currentPoint = points[i];
    const d = lineDist(currentPoint, start, end);
    if (d > recordDistance) {
      recordDistance = d;
      furthestIndex = i;
    }
  }
  if (recordDistance > epsilon) {
    return furthestIndex;
  } else {
    return -1;
  }
}

function lineDist(c, a, b) {
  const vc = createVector(c.x, c.y);
  const va = createVector(a.x, a.y);
  const vb = createVector(b.x, b.y);

  const norm = scalarProjection(vc, va, vb);
  return p5.Vector.dist(vc, norm);
}

function scalarProjection(p, a, b) {
  const ap = p5.Vector.sub(p, a);
  const ab = p5.Vector.sub(b, a);
  ab.normalize(); // Normalize the line
  ab.mult(ap.dot(ab));
  const normalPoint = p5.Vector.add(a, ab);
  return normalPoint;
}
