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
import dat from './dat.gui.module.js';

const drawParams = {
};

// Define filePaths array in a scope accessible to both init() and localSave() functions
let filePaths = [];

// 1 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
  sound1: "./uploads/new_adventure_theme.mp3"
});

const init = () => {
  console.log("init called");
  console.log(`Testing utils.getRandomColor() import: ${utils.getRandomColor()}`);
  audio.setupWebaudio(DEFAULTS.sound1);
  let canvasElement = document.querySelector("canvas"); // hookup <canvas> element


  const url = "./data/av-data.json";

  if (localStorage.getItem("dpsAudio") !== null) {
    // The item exists in local storage
    let data = JSON.parse(localStorage.getItem("dpsAudio"));
    // Use the data from local storage
    const { drawParams: params } = data;
    Object.assign(drawParams, params);

    const title = document.createElement('h1');
    title.textContent = data.Title;

    // Add the h1 element to the DOM
    document.body.insertBefore(title, document.body.firstChild);

    const select = document.getElementById('track-select');

    // Loop through the songs and create an option element for each one
    for (const song of data.Songs) {
      console.log(typeof song);
      fetch(song.location)
        .then(response => response.blob())
        .then(blob => {
          let objectURL = URL.createObjectURL(blob);
          // Use objectURL here
          select.insertAdjacentHTML('beforeend', `<option value="${objectURL}">${song.title}</option>`);
          // Store original file path in filePaths array
          filePaths.push(song.location);
        });
    }
  } else {
    // The item does not exist in local storage
    // Use the data from the JSON file
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const { drawParams: params } = data;
        Object.assign(drawParams, params);

        const title = document.createElement('h1');
        title.textContent = data.Title;

        // Add the h1 element to the DOM
        document.body.insertBefore(title, document.body.firstChild);

        const select = document.getElementById('track-select');

        // Loop through the songs and create an option element for each one
        for (const song of data.Songs) {
          filePaths.push(song.location);
          select.insertAdjacentHTML('beforeend', `<option value="${song.location}">${song.title}</option>`);
        }
      });
  }

  setupUI(canvasElement);
  canvas.setupCanvas(canvasElement, audio.analyserNode);

  loop();
}


const setupUI = (canvasElement) => {
  // Immediatly set up gui element
  const gui = new dat.GUI();

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
  const soundFolder = gui.addFolder('Sound');

  // Initial volume
  const volumeController = soundFolder.add({ volume: 50 }, 'volume', 0, 100);
  audio.setVolume(.5);

  volumeController.onChange(function (newValue) {
    audio.setVolume(newValue / 100);
  });
  volumeController.name("Volume");

  const trebleController = soundFolder.add(drawParams, 'useTreble');
  trebleController.onChange(function (e) {
    if (e == true) {
      drawParams.useTreble = true;
      audio.biquadFilter.frequency.setValueAtTime(1000, audio.audioCtx.currentTime);
      audio.biquadFilter.gain.setValueAtTime(15, audio.audioCtx.currentTime);
    }
    else {
      drawParams.useTreble = false;
      audio.biquadFilter.gain.setValueAtTime(0, audio.audioCtx.currentTime)
    }

    localSave();
  });
  trebleController.name("Treble Boost");

  // Set initial condition
  if (drawParams.useTreble == true) {
    audio.biquadFilter.frequency.setValueAtTime(1000, audio.audioCtx.currentTime);
    audio.biquadFilter.gain.setValueAtTime(15, audio.audioCtx.currentTime);
  }


  const baseController = soundFolder.add(drawParams, 'useBase');
  baseController.onChange(function (e) {
    if (e == true) {
      drawParams.useBase = true;
      audio.lowShelfBiquadFilter.frequency.setValueAtTime(1000, audio.audioCtx.currentTime);
      audio.lowShelfBiquadFilter.gain.setValueAtTime(30, audio.audioCtx.currentTime);
    }
    else {
      drawParams.useBase = false;
      audio.lowShelfBiquadFilter.gain.setValueAtTime(0, audio.audioCtx.currentTime)
    }

    localSave();
  });
  baseController.name("Bass Boost");

  // Set initial condition
  if (drawParams.useBase == true) {
    audio.lowShelfBiquadFilter.frequency.setValueAtTime(1000, audio.audioCtx.currentTime);
    audio.lowShelfBiquadFilter.gain.setValueAtTime(30, audio.audioCtx.currentTime);
  }

  // Display section in settings
  soundFolder.open();



  // D - hookup track <select>
  let trackSelect = document.querySelector("#track-select");
  // add .onchange event to <select>
  trackSelect.onchange = e => {
    audio.loadSoundFile(e.target.value);
    audio.setLooping(loopBox.checked);

    // pause the current track if it is playing
    if (playButton.dataset.playing == "yes") {
      playButton.dispatchEvent(new MouseEvent("click"));
    }
  };

  // Set up button that can get audio from the computer
  let trackFile = document.querySelector("#music-file");
  trackFile.value = "";

  trackFile.onchange = e => {
    e.preventDefault(); // Don't reload page when finished
    let file = e.target.files[0];
    let fileName = file.name.substring(0, file.name.lastIndexOf('.'));

    // Send file to server-side script
    const formData = new FormData();
    formData.append('file', file);
    fetch('http://localhost:80/upload', {
      method: 'POST',
      body: formData
    })
      .then(response => response.text())
      .then(data => {
        console.log(data);
        // data contains the file path on the server
        audio.loadSoundFile(data);

        // pause the current track if it is playing
        if (playButton.dataset.playing == "yes") {
          playButton.dispatchEvent(new MouseEvent("click"));
        }

        // Adds new track to track select if it doesn't exist already 
        const select = document.getElementById('track-select');
        let option = Array.from(select.options).find(option => option.textContent === fileName);

        if (option) {
          // Select existing option
          option.selected = true;
          audio.loadSoundFile(option.value);
        } else {
          // Create new option
          option = document.createElement('option');
          option.value = data; // set value to file path on server
          option.textContent = fileName;
          filePaths.push(data);
          console.log(data);
          option.selected = true;
          select.appendChild(option);
          audio.loadSoundFile(option.value);
          audio.setLooping(loopBox.checked);
          localSave();
        }
      }).catch(error => {
        console.error(error);
      });
  };


  // E - Add event handlers for the checkbox settings


  const gradientBox = document.querySelector("#gradient-cb");
  const barsBox = document.querySelector("#bars-cb");
  const sphereBox = document.querySelector("#sphere-cb");
  const pulseBox = document.querySelector("#pulse-sphere-cb")
  const spinBox = document.querySelector("#spin-sphere-cb");
  const confettiBox = document.querySelector("#confetti-cb");
  const noiseBox = document.querySelector("#noise-cb");
  const invertBox = document.querySelector("#invert-cb");
  const embossBox = document.querySelector("#emboss-cb");
  const trebleBox = document.querySelector("#highshelf-cb");
  const baseBox = document.querySelector("#lowshelf-cb");
  const loopBox = document.querySelector("#loop-cb");
  const frequencyButton = document.querySelector("#frequency");
  const waveformButton = document.querySelector("#waveform");

  // Assign defaults from cache on page load
  drawParams.showGradient = gradientBox.checked;
  drawParams.showBars = barsBox.checked;
  drawParams.showSphere = sphereBox.checked;
  drawParams.pulseSphere = pulseBox.checked;
  drawParams.spinSphere = spinBox.checked;
  drawParams.showConfetti = confettiBox.checked;
  drawParams.showNoise = noiseBox.checked;
  drawParams.showInvert = invertBox.checked;
  drawParams.showEmboss = embossBox.checked;
  drawParams.loopAudio = loopBox.checked;
  drawParams.displayFrequency = frequencyButton.checked;
  drawParams.displayWaveform = waveformButton.checked;

  

  // add onclick event to checkboxes
  gradientBox.onclick = e => {
    if (e.target.checked) {
      drawParams.showGradient = true;
    }
    else {
      drawParams.showGradient = false;
    }

    localSave();
  }
  barsBox.onclick = e => {
    if (e.target.checked) {
      drawParams.showBars = true;
    }
    else {
      drawParams.showBars = false;
    }

    localSave();
  }
  sphereBox.onclick = e => {
    if (e.target.checked) {
      drawParams.showSphere = true;
    }
    else {
      drawParams.showSphere = false;
    }

    localSave();
  }
  pulseBox.onclick = e => {
    if (e.target.checked) {
      drawParams.pulseSphere = true;
    }
    else {
      drawParams.pulseSphere = false;
    }

    localSave();
  }
  spinBox.onclick = e => {
    if (e.target.checked) {
      drawParams.spinSphere = true;
    }
    else {
      drawParams.spinSphere = false;
    }

    localSave();
  }
  confettiBox.onclick = e => {
    if (e.target.checked) {
      drawParams.showConfetti = true;
    }
    else {
      drawParams.showConfetti = false;
    }

    localSave();
  }
  noiseBox.onclick = e => {
    if (e.target.checked) {
      drawParams.showNoise = true;
    }
    else {
      drawParams.showNoise = false;
    }

    localSave();
  }
  invertBox.onclick = e => {
    if (e.target.checked) {
      drawParams.showInvert = true;
    }
    else {
      drawParams.showInvert = false;
    }

    localSave();
  }
  embossBox.onclick = e => {
    if (e.target.checked) {
      drawParams.showEmboss = true;
    }
    else {
      drawParams.showEmboss = false;
    }

    localSave();
  }



  loopBox.onchange = () => {
    drawParams.loopAudio = loopBox.checked;
    audio.setLooping(loopBox.checked);

    localSave();
  }

  frequencyButton.onclick = () => {
    drawParams.displayFrequency = true;
    drawParams.displayWaveform = false;

    localSave();
  }

  waveformButton.onclick = () => {
    drawParams.displayFrequency = false;
    drawParams.displayWaveform = true;

    localSave();
  }
} // end setupUI

const loop = () => {
  setTimeout(() => {
    requestAnimationFrame(loop);
  }, 1000 / 60);

  canvas.draw(drawParams);
}

const localSave = () => {
  let trackSelect = document.querySelector("#track-select");
  let songs = [];

  for (let i = 0; i < trackSelect.children.length; i++) {
    let song = {
      title: trackSelect.children[i].textContent,
      location: filePaths[i] // Use original file path from filePaths array
    };

    songs.push(song);
  }

  let dataToSave = {
    Title: "Spherical Audio Visualizer",
    Songs: songs,
    drawParams: drawParams
  };

  localStorage.setItem("dpsAudio", JSON.stringify(dataToSave));
}


export { init };
