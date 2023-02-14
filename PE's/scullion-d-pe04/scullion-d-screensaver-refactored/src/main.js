let ctx;
let paused = false;
let canvas;
let createRectangles = true;
let createArcs = true;
let createLines = true;

import { getRandomColor } from "./utils.js";
import { getRandomInt } from "./utils.js";
import { drawRectangle } from "./canvas-utils.js";
import { drawArc } from "./canvas-utils.js";
import { drawLine } from "./canvas-utils.js";

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

// Initializes the program
init();
