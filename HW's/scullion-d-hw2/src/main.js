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
  showSphere: true,
  showNoise: false,
  showInvert: false,
  showEmboss: false,
  useTreble: false,
  useBase: false
};

// 1 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
  sound1: "media/new_adventure_theme.mp3"
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
  const fsButton = document.querySelector("#fs-button");

  // add .onclick event to button
  fsButton.onclick = e => {
    console.log("init called");
    utils.goFullscreen(canvasElement);
  };

  // B - hookup play/pause button
  const playButton = document.querySelector("#play-button")

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
  let volumeSlider = document.querySelector("#volume-slider");
  let volumeLabel = document.querySelector("#volume-label");

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
  let trackSelect = document.querySelector("#track-select");
  // add .onchange event to <select>
  trackSelect.onchange = e => {
    audio.loadSoundFile(e.target.value);
    // pause the current track if it is playing
    if (playButton.dataset.playing == "yes") {
      playButton.dispatchEvent(new MouseEvent("click"));
    }
  };

  // E - Add event handlers for the checkbox settings
  const gradientBox = document.querySelector("#gradient-cb");
  const barsBox = document.querySelector("#bars-cb");
  const sphereBox = document.querySelector("#sphere-cb");
  const noiseBox = document.querySelector("#noise-cb");
  const invertBox = document.querySelector("#invert-cb");
  const embossBox = document.querySelector("#emboss-cb");
  const trebleBox = document.querySelector("#highshelf-cb");
  const baseBox = document.querySelector("#lowshelf-cb");

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
  sphereBox.onclick = e => {
    if (e.target.checked) {
      drawParams.showSphere = true;
    }
    else {
      drawParams.showSphere = false;
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
  invertBox.onclick = e => {
    if (e.target.checked) {
      drawParams.showInvert = true;
    }
    else {
      drawParams.showInvert = false;
    }
  }
  embossBox.onclick = e => {
    if (e.target.checked) {
      drawParams.showEmboss = true;
    }
    else {
      drawParams.showEmboss = false;
    }
  }

  trebleBox.onclick = e => {
    if (e.target.checked) {
      drawParams.useTreble = true;
      audio.biquadFilter.frequency.setValueAtTime(1000, audio.audioCtx.currentTime);
      audio.biquadFilter.gain.setValueAtTime(25, audio.audioCtx.currentTime);
    }
    else {
      drawParams.useTreble = false;
      audio.biquadFilter.gain.setValueAtTime(0, audio.audioCtx.currentTime)
    }
  }

  baseBox.onclick = e => {
    if (e.target.checked) {
      drawParams.useBase = true;
      audio.lowShelfBiquadFilter.frequency.setValueAtTime(1000, audio.audioCtx.currentTime);
      audio.lowShelfBiquadFilter.gain.setValueAtTime(15, audio.audioCtx.currentTime);
    }
    else {
      drawParams.useBase = false;
      audio.lowShelfBiquadFilter.gain.setValueAtTime(0, audio.audioCtx.currentTime)
    }
  }
} // end setupUI

function loop() {
  requestAnimationFrame(loop);
  canvas.draw(drawParams);
}

export { init };
