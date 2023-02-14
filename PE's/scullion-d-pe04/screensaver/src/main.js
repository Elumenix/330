let ctx;
let paused = false;
let canvas;
let createRectangles = true;
let createArcs = true;
let createLines = true;

/// Establishes initial scene and program loop after the window loads
const init = () => {
    console.log("page loaded!");
    // #2 Now that the page has loaded, start drawing!

    // A - `canvas` variable points at <canvas> tag
    canvas = document.querySelector("canvas");

    // B - the `ctx` variable points at a "2D drawing context"
    ctx = canvas.getContext("2d");

    // C - all fill operations are now in red
    ctx.fillStyle = "red";

    // D - fill a rectangle with the current fill color
    ctx.fillRect(20, 20, 600, 440);

    document.querySelector("#btn-clear").onclick = () => ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Creating Rects
    drawRectangle(ctx, 120, 120, 400, 300, 'yellow', 10, 'magenta');
    drawLine(ctx, 20, 20, 620, 460, 5, 'magenta');
    drawLine(ctx, 620, 20, 20, 460, 5, 'magenta');

    // circle
    drawArc(ctx, 320, 240, 50, 'green', 0, 'purple', 0, Math.PI * 2)


    // small circle
    drawArc(ctx, 320, 240, 20, 'gray', 0, 'yellow', 0, Math.PI)
    drawArc(ctx, 220, 200, 20, 'white', 0, 'black', 0, Math.PI)
    drawArc(ctx, 420, 200, 20, 'white', 0, 'black', 0, Math.PI)
    drawLine(ctx, 20, 180, 620, 180, 20, 'black')


    setupUI();
    update(ctx);
}

/// Returns a random color
const getRandomColor = () => {
    /// Returns a value between 55 an 255
    const getByte = () => {
        return 55 + Math.round(Math.random() * 200);
    }
    return `rgba(${getByte()},${getByte()},${getByte()},.8)`;
}

///Returns a random number
const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

///Draws a random rectangle to the screen
const drawRandomRect = (ctx) => {
    drawRectangle(ctx, getRandomInt(0, 640), getRandomInt(0, 480), getRandomInt(10, 90), getRandomInt(10, 90), getRandomColor(), getRandomInt(2, 12), getRandomColor());
}

///Draws a random arc
const drawRandomArc = (ctx) => {
    drawArc(ctx, getRandomInt(0, 640), getRandomInt(0, 480), getRandomInt(10, 90), getRandomColor(), getRandomInt(0, 10), getRandomColor(), getRandomInt(0, Math.PI * 2), getRandomInt(0, Math.PI * 2));
}

/// Draws a random line 
const drawRandomLine = (ctx) => {
    drawLine(ctx, getRandomInt(0, 640), getRandomInt(0, 480), getRandomInt(0, 640), getRandomInt(0, 480), getRandomInt(1, 5), getRandomColor());
}

/// Reginsters a click on the canvas
const canvasClicked = (e) => {
    let rect = e.target.getBoundingClientRect();
    let mouseX = e.clientX - rect.x;
    let mouseY = e.clientY - rect.y;
    console.log(mouseX, mouseY);
    for (let i = 0; i < 10; i++) {
        let x = getRandomInt(-100, 100) + mouseX;
        let y = getRandomInt(-100, 100) + mouseY;
        let radius = getRandomInt(0, 20);
        let startAngle = getRandomInt(0, Math.PI * 2);
        let endAngle = getRandomInt(0, Math.PI * 2);
        let fillStyle = getRandomColor();
        drawArc(ctx, x, y, radius, fillStyle, startAngle, endAngle);
    }
}

/// Sets up UI on the canvas
const setupUI = () => {
    document.querySelector("#btn-pause").onclick = function () {
        paused = true;
    };
    document.querySelector("#btn-play").onclick = function () {
        if (!paused) return;
        paused = false;
        update();
    };

    canvas.onclick = canvasClicked;

    document.querySelector("#cb-rectangles").onclick = function (e) {
        createRectangles = e.target.checked;
    }
    document.querySelector("#cb-arcs").onclick = function (e) {
        createArcs = e.target.checked;
    }
    document.querySelector("#cb-lines").onclick = function (e) {
        createLines = e.target.checked;
    }
}

/// The main update loop of the program
const update = () => {
    if (paused) return;
    requestAnimationFrame(update);
    if (createRectangles) {
        drawRandomRect(ctx);
    }
    if (createArcs) {
        drawRandomArc(ctx);
    }
    if (createLines) {
        drawRandomLine(ctx);
    }
}

/// Draws a custom rectangle at the specified location
const drawRectangle = (ctx, x, y, width, height, fillStyle = "black", lineWidth = 0, strokeStyle = "black") => {
    ctx.save();
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.fill();
    if (lineWidth > 0) {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.stroke();
    }
    ctx.closePath();
    ctx.restore();
}

/// Draws a custom arc at the specified location
const drawArc = (ctx, x, y, radius, fillStyle = "black", lineWidth = 0, strokeStyle = "black", startAngle = 0, endAngle = Math.PI * 2) => {
    ctx.save();
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.fill();
    if (lineWidth > 0) {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.stroke();
    }
    ctx.closePath();
    ctx.restore();
}

/// Draws a custom line at the specified location
const drawLine = (ctx, x, y, x2, y2, lineWidth = 1, strokeStyle = "black") => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    if (lineWidth > 0) {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.stroke();
    }
    ctx.closePath();
    ctx.restore();
}

init();
