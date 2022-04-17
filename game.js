let sketchRnn;

function generateLine(currentLines) {
    sketchRnn.generate(currentLines, gotStrokePath);
}

let lastPen = 'down';

strokes = 0;
function gotStrokePath(error, strokePath)
{
    console.log(strokes);
    switch (lastPen) {
        case 'down':
            drawLineTo(prevX + strokePath.dx, prevY + strokePath.dy);
            setTimeout(() => sketchRnn.generate(gotStrokePath), 0);
            break;
        case 'up':
            startLine(prevX + strokePath.dx, prevY + strokePath.dy);
            if (strokes == 0) 
            {
                strokes += 1;
                setTimeout(() => sketchRnn.generate(gotStrokePath), 0);
            }
            else strokes = 0;
            break;
        case 'end':
            sketchRnn.reset();
            break;
    }
    lastPen = strokePath.pen;
}

let cnv;
let prevX, prevY;

setup = () => {
    cnv = createCanvas(window.innerWidth * .9, window.innerHeight * .8);
    cnv.parent('canvasContainer');
    startLine(width / 2, height / 2);
    sketchRnn = ml5.sketchRNN("cat")
    
    background(255);
}

let currentLine = [];
let lines = []

function startLine(curX, curY)
{
    prevX = curX;
    prevY = curY;
    currentLine = [];
}

function drawLineTo(curX, curY)
{
    currentLine.push({dx: curX - prevX, dy: curY - prevY, pen: 'down'});
    stroke(3);
    line(prevX, prevY, curX, curY);
    prevX = curX;
    prevY = curY;
}

let resetClicked = false;
    
mouseReleased = () => {
    if (currentLine.length > 0) {
        currentLine[currentLine.length - 1].pen = 'up';
    }
    if (!resetClicked) {
        setTimeout(() => generateLine(currentLine), 300);
    }
    currentLine = [];
}

mousePressed = () => {
    startLine(mouseX, mouseY);
}
                    
mouseDragged = () => {
    drawLineTo(mouseX, mouseY);
}

setTimeout(() => {
document.getElementById('canvasContainer').style.display = 'block';
}, 0);

let downloadButton = document.getElementById('download');
downloadButton.addEventListener('click', () => {
    saveCanvas(cnv, 'My Drawing with AI', 'png')
})

let restartButton = document.getElementById('restart');
restartButton.addEventListener('click', () => {
    location.reload();
});