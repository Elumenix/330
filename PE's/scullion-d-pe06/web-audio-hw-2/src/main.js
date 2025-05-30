/*
  main.js is primarily responsible for hooking up the UI to the rest of the application 
  and setting up the main event loop
*/

// We will write the functions in this file in the traditional ES5 way
// In this instance, we feel the code is more readable if written this way
// If you want to re-write these as ES6 arrow functions, to be consistent with the other files, go ahead!

import * as utils from './utils.js';
import * as audio from './audio.js';
import * as canvas from './visualizer.js';

const drawParams = {
  showGradient: true,
  showBars: true,
  showCircles: true,
  showNoise: true
};

// 1 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
  sound1: "media/New Adventure Theme.mp3"
});

function init() {
  console.log("init called");
  console.log(`Testing utils.getRandomColor() import: ${utils.getRandomColor()}`);
  audio.setupWebaudio(DEFAULTS.sound1);
  let canvasElement = document.querySelector("canvas"); // hookup <canvas> element
  setupUI(canvasElement);
  canvas.setupCanvas(canvasElement, audio.analyserNode);
  loop();
}

function setupUI(canvasElement) {
  // A - hookup fullscreen button
  const fsButton = document.querySelector("#fsButton");

  // add .onclick event to button
  fsButton.onclick = e => {
    console.log("init called");
    utils.goFullscreen(canvasElement);
  };

  // B - hookup play/pause button
  const playButton = document.querySelector("#playButton")

  // add onclick event to button
  playButton.onclick = e => {
    console.log(`audioCtx.state before = ${audio.audioCtx.state}`);

    // check if context is in suspended state (autoplay policy)
    if (audio.audioCtx.state == "suspended") {
      audio.audioCtx.resume();
    }
    console.log(`audioCtx.state after = ${audio.audioCtx.state}`);
    if (e.target.dataset.playing == "no") {
      //if track is currently paused, play it
      audio.playCurrentSound();
      e.target.dataset.playing = "yes"; // our CSS wil set the text to "Pause"
      // if track IS playing, pause it
    }
    else {
      audio.pauseCurrentSound();
      e.target.dataset.playing = "no"; // our CSS will set the text to "Play"
    }
  };

  // C - hookup volume slider & label
  let volumeSlider = document.querySelector("#volumeSlider");
  let volumeLabel = document.querySelector("#volumeLabel");

  // add .oninput event to slider
  volumeSlider.oninput = e => {
    // set the gain
    audio.setVolume(e.target.value);
    // update value of label to match value of slider
    volumeLabel.innerHTML = Math.round((e.target.value / 2 * 100));
  };

  // set value of label to match initial value of slider
  volumeSlider.dispatchEvent(new Event("input"));

  // D - hookup track <select>
  let trackSelect = document.querySelector("#trackSelect");
  // add .onchange event to <select>
  trackSelect.onchange = e => {
    audio.loadSoundFile(e.target.value);
    // pause the current track if it is playing
    if (playButton.dataset.playing == "yes") {
      playButton.dispatchEvent(new MouseEvent("click"));
    }
  };

  // E - Add event handlers for the checkbox settings
  const gradientBox = document.querySelector("#gradientCB");
  const barsBox = document.querySelector("#barsCB");
  const circlesBox = document.querySelector("#circlesCB");
  const noiseBox = document.querySelector("#noiseCB");

  // add onclick event to checkboxes
  gradientBox.onclick = e => {
    if (e.target.checked) {
      drawParams.showGradient = true;
    }
    else {
      drawParams.showGradient = false;
    }
  }
  barsBox.onclick = e => {
    if (e.target.checked) {
      drawParams.showBars = true;
    }
    else {
      drawParams.showBars = false;
    }
  }
  circlesBox.onclick = e => {
    if (e.target.checked) {
      drawParams.showCircles = true;
    }
    else {
      drawParams.showCircles = false;
    }
  }
  noiseBox.onclick = e => {
    if (e.target.checked) {
      drawParams.showNoise = true;
    }
    else {
      drawParams.showNoise = false;
    }
  }
} // end setupUI

function loop() {
  requestAnimationFrame(loop);
  canvas.draw(drawParams);
}

export { init };
