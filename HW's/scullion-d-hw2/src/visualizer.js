import * as utils from './utils.js';
import { Sphere } from './Sphere.js';

let ctx, canvasWidth, canvasHeight, gradient, analyserNode, audioData, sphere;


const setupCanvas = (canvasElement, analyserNodeRef) => {
    // create drawing context
    ctx = canvasElement.getContext("2d");
    canvasWidth = canvasElement.width;
    canvasHeight = canvasElement.height;
    // create a gradient that runs top to bottom
    gradient = utils.getLinearGradient(ctx, 0, 0, 0, canvasHeight, [{ percent: 0, color: "aqua" }, { percent: 1, color: "magenta" }]);
    // keep a reference to the analyser node
    analyserNode = analyserNodeRef;
    // this is the array where the analyser data will be stored
    audioData = new Uint8Array(analyserNode.fftSize / 2);
    sphere = new Sphere(ctx, 100, canvasWidth, canvasHeight);
}

const draw = (params = {}) => {
    // 1 - populate the audioData array with the frequency data from the analyserNode
    // notice these arrays are passed "by reference" 
    analyserNode.getByteFrequencyData(audioData);
    console.log(audioData[5]);
    // OR
    //analyserNode.getByteTimeDomainData(audioData); // waveform data

    // 2 - draw background
    ctx.save();
    ctx.fillStyle = "black";
    ctx.globalAlpha = .1;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();

    // 3 - draw gradient
    if (params.showGradient) {
        ctx.save();
        ctx.fillStyle = gradient;
        ctx.globalAlpha = .3;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.restore();
    }

    // 4 - draw bars
    if (params.showBars) {
        let barSpacing = 4;
        let margin = 5;
        let screenWidthForBars = canvasWidth - (audioData.length * barSpacing) - margin * 2;
        let barWidth = screenWidthForBars / audioData.length;
        let barHeight = 200;
        let topSpacing = 100;

        ctx.save();
        let frequencyBinCount = analyserNode.frequencyBinCount;
        console.log(frequencyBinCount);
        let frequencyWidth = ((canvasWidth / 128) - 0.03),
            frequencyHeight = 0,
            x = 0;
        for (var i = 0; i < frequencyBinCount; i++) {
            frequencyHeight = audioData[i] * (canvasHeight * 0.002);
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.fillRect(x, canvasHeight - frequencyHeight, frequencyWidth, frequencyHeight);
            x += frequencyWidth + 0.5;
            ctx.restore();
        }
    }

    // 5 - draw circles
    if (params.showSphere) {
        ctx.save();

        sphere.drawSphere();
        sphere.rotateX(1.57);
        sphere.rotateY(2.5);
        sphere.rotateZ(2);

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
}

export { setupCanvas, draw };
