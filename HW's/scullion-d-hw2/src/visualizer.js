import * as utils from './utils.js';
import { Sphere } from './Sphere.js';
import { Circle } from './Circle.js';

// Imported
let ctx, canvasWidth, canvasHeight, gradient, analyserNode, audioData, sphere;

// Necessary for this script
let lastTime, currentTime, delta, slowData, circleArray, timer, savedData, iteratingSavedData, particleCap;


const setupCanvas = (canvasElement, analyserNodeRef, rotation, color, sphereOptions, numParticles, gradientData) => {
    // create drawing context
    timer = 0;
    particleCap = numParticles;
    ctx = canvasElement.getContext("2d");
    canvasWidth = canvasElement.width;
    canvasHeight = canvasElement.height;
    // create a gradient that runs top to bottom
    gradient = utils.getLinearGradient(ctx, 0, 0, 0, canvasHeight, gradientData.colorStops);
    // keep a reference to the analyser node
    analyserNode = analyserNodeRef;
    // this is the array where the analyser data will be stored
    audioData = new Uint8Array(analyserNode.fftSize / 2);

    let color1 = [54, 0, 255];
    let color2 = [220, 5, 5];
    let white = [255, 255, 255];

    sphere = new Sphere(ctx, 100, canvasWidth, canvasHeight, (sphereOptions.rings + 1) / 2, sphereOptions.points, color[0], color[1], color[2], color[3]);

    // default rotation is set
    sphere.setRotation(rotation);


    circleArray = new Array(1000);

    for (let i = 0; i < circleArray.length; i++) {
        circleArray[i] = new Circle(canvasWidth, canvasHeight, color[4]);
    }

    lastTime = (new Date()).getTime();
    currentTime = 0;
    delta = 0;
    slowData = new Array(128);
    savedData = new Array(128);
    iteratingSavedData = new Array(128);

    for (let i = 0; i < slowData.length; i++) {
        slowData[i] = 0;
        savedData[i] = 0;
        iteratingSavedData[i] = 0;
    }
}

const draw = (params = {}) => {
    // Update everything to find deltaTime
    currentTime = (new Date()).getTime();
    delta = (currentTime - lastTime) / 1000;

    if (params.displayWaveform) {
        timer += delta;
    }

    // 1 - populate the audioData array with the frequency data from the analyserNode
    // notice these arrays are passed "by reference" 

    analyserNode.getByteFrequencyData(audioData);
    slowData = audioData;


    // 2 - draw background
    ctx.save();
    ctx.fillStyle = "black";
    ctx.globalAlpha = 1;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();

    // 3 - draw gradient
    if (params.showGradient) {
        ctx.save();
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 1;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.restore();
    }

    if (params.showConfetti) {
        for (let i = 0; i < particleCap; i++) {
            circleArray[i].update(slowData);
            circleArray[i].draw(ctx, slowData);
        }
    }


    if (params.displayWaveform && timer > .03333) {
        timer -= .03333;

        // Get the waveform data from the analyserNode
        analyserNode.getByteTimeDomainData(audioData);

        for (let i = 0; i < savedData.length; i++) {
            iteratingSavedData[i] = (audioData[i] + iteratingSavedData[i]) / 2;
            savedData[i] = iteratingSavedData[i];
        }
        slowData = savedData;
    }
    else if (params.displayWaveform) {
        analyserNode.getByteTimeDomainData(audioData);
        for (let i = 0; i < savedData.length; i++) {
            iteratingSavedData[i] = (audioData[i] + iteratingSavedData[i]) / 2;
        }
        slowData = savedData;
    }

    // 4 - draw bars
    if (params.showBars) {
        ctx.save();
        let frequencyBinCount = analyserNode.frequencyBinCount;
        let frequencyWidth = ((canvasWidth / 128) - .5),
            frequencyHeight = 0,
            x = 0;
        for (let i = 0; i < frequencyBinCount; i++) {
            frequencyHeight = slowData[i] * (canvasHeight * 0.002);
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.fillRect(x, canvasHeight / 2 - frequencyHeight + frequencyHeight / 2, frequencyWidth, frequencyHeight);
            x += frequencyWidth + 0.5;
            ctx.restore();
        }
    }

    // Revert back because the sphere will cause a seizure warning with waveform data
    if (params.displayWaveform) {
        analyserNode.getByteFrequencyData(audioData);
        slowData = audioData;
    }

    // 5 - draw sphere
    if (params.showSphere) {
        ctx.save();

        if (params.pulseSphere) {
            sphere.drawSphere(slowData, true);
        }
        else {
            sphere.drawSphere(slowData, false);
        }

        if (params.spinSphere) {
            let bassVolume = 0;
            let mediumVolume = 0;
            let trebleVolume = 0;

            // Bass power
            for (let i = 0; i < 43; i++) {
                bassVolume += slowData[i];
            }

            // Medium power
            for (let i = 43; i < 85; i++) {
                mediumVolume += slowData[i];
            }

            // Treble power
            for (let i = 86; i < 128; i++) {
                trebleVolume += slowData[i];
            }

            if (bassVolume != 0) {
                bassVolume = (bassVolume - 128) / 44;
            }

            if (mediumVolume != 0) {
                mediumVolume = (mediumVolume - 90) / 43;
            }

            if (trebleVolume != 0) {
                trebleVolume = (trebleVolume - 50) / 43;
            }

            sphere.turnX(bassVolume * delta);
            sphere.turnY(mediumVolume * delta);
            sphere.turnZ(trebleVolume * delta);
        }
        ctx.restore();
    }

    // 6 - bitmap manipulation
    // TODO: right now. we are looping though every pixel of the canvas (320,000 of them!), 
    // regardless of whether or not we are applying a pixel effect
    // At some point, refactor this code so that we are looping though the image data only if
    // it is necessary

    // A) grab all of the pixels on the canvas and put them in the `data` array
    // `imageData.data` is a `Uint8ClampedArray()` typed array that has 1.28 million elements!
    // the variable `data` below is a reference to that array 
    let imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    let data = imageData.data;
    let length = data.length;
    let width = imageData.width; // not using here

    // B) Iterate through each pixel, stepping 4 elements at a time (which is the RGBA for 1 pixel)
    for (let i = 0; i < length; i += 4) {
        // C) randomly change every 20th pixel to red
        if (params.showNoise && Math.random() < .05) {
            // data[i] is the red channel
            // data[i+1] is the green channel
            // data[i+2] is the blue channel
            // data[i+3] is the alpha channel
            data[i] = data[i + 1] = data[i + 2] = 0; // zero out the red and green and blue channels
            data[i + 1] = 130; // make the red channel 100% red
        } // end if

        // invert?
        if (params.showInvert) {
            let red = data[i], green = data[i + 1], blue = data[i + 2];
            data[i] = 255 - red; // set red
            data[i + 1] = 255 - green; // set green
            data[i + 2] = 255 - blue; // set blue
            // data[i+3] is the alpha, but we're leaving that alone 
        }
    } // end for

    // Check for emboss
    if (params.showEmboss) {
        // note we are stepping through *each* sub-pixel
        for (let i = 0; i < length; i++) {
            if (i % 4 == 3) continue; // skip alpha channel
            data[i] = 127 + 2 * data[i] - data[i + 4] - data[i + width * 4];
        }
    }

    // D) copy image data back to canvas
    ctx.putImageData(imageData, 0, 0);

    lastTime = currentTime
}

const rebuildSphere = (sphereOptions, color, rotation) => {
    sphere = new Sphere(ctx, 100, canvasWidth, canvasHeight, (sphereOptions.rings + 1) / 2, sphereOptions.points, color[0], color[1], color[2], color[3]);

    sphere.setRotation(rotation);
}

const changeParticleColor = (color) => {
    for (let i = 0; i < circleArray.length; i++) {
        circleArray[i].color = color;
    }
}

const changeParticleNumber = (num) => {
    particleCap = num;
}

const changeGradient = (gradientData) => {
    gradient = utils.getLinearGradient(ctx, 0, 0, 0, canvasHeight, gradientData.colorStops);
}

export { setupCanvas, draw, sphere, rebuildSphere, changeParticleColor, changeParticleNumber, changeGradient };
