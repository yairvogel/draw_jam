// using paper js

var walks = [];

function onFrame(event) {
    if (event.count % 4 == 0) {
        walks.forEach(function(walk) {
            walk.next();
        });
    }
}

walks.push(RandomWalk('#00BBF9', 4));
walks.push(RandomWalk('#9B5DE5', 3));
walks.push(RandomWalk('#9B5DE5', 4));

function onLandingStart() {
    console.log('started');
}

function onStop(event) {
    setTimeout(function() {walks = []}, 2000)
    walks = [];
}

document.addEventListener('gameStart', onStop);

function RandomWalk(color, width) {
    var x = Math.random() * view.size.width;
    var y = Math.random() * view.size.height;
    console.log("start", x, y);
    var path = new Path();
    path.strokeColor = color ? color : 'black';
    path.strokeWidth = width ? width : 1;
    var stepSize = 10;

    var randomStep = function(speed) {
        var radius = Math.random() * stepSize;
        var angle = Math.random() * Math.PI * 2;
        vx = speed[0] + Math.cos(angle) * radius;
        vy = speed[1] + Math.sin(angle) * radius;
        if (Math.pow(vx, 2) + Math.pow(vy, 2) > Math.pow(stepSize, 2)) {
            vx /= 2;
            vy /= 2;
        }
        return [vx, vy];
    }

    var speed = randomStep([0, 0]);

    var next = function() {
        speed = randomStep(speed)
        x += speed[0];
        y += speed[1];
        path.add(new Point(x, y));
    }

    return {next: next}
}