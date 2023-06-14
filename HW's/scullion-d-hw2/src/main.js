/*
  main.js is primarily responsible for hooking up the UI to the rest of the application 
  and setting up the main event loop
*/
import * as utils from './utils.js';
import * as audio from './audio.js';
import * as canvas from './visualizer.js';
import dat from './dat.gui.module.js';

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

const rotation = {};

const drawParams = {
};

let colors;
let tempColors
let sphereOptions = {};
let tempSphereOptions = {};

// Define filePaths array in a scope accessible to both init() and localSave() functions
let filePaths = [];
let volume = 0;

// 1 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
  sound1: "./uploads/new_adventure_theme.mp3"
});

const init = () => {
  var stats = new Stats();
  audio.setupWebaudio(DEFAULTS.sound1);
  let canvasElement = document.querySelector("canvas"); // hookup <canvas> element


  const url = "./data/av-data.json";

  if (localStorage.getItem("dpsAudio") !== null) {
    // The item exists in local storage
    let data = JSON.parse(localStorage.getItem("dpsAudio"));
    // Use the data from local storage
    const { drawParams: params } = data;
    Object.assign(drawParams, params);

    const { Rotation: axis } = data;
    Object.assign(rotation, axis);

    const title = document.createElement('h1');
    title.textContent = data.Title;

    colors = data.Colors;
    sphereOptions = data.SphereOptions;
    volume = data.Volume;

    // Add the h1 element to the DOM
    document.body.insertBefore(title, document.body.firstChild);

    const select = document.getElementById('track-select');

    // Loop through the songs and create an option element for each one
    for (const song of data.Songs) {
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

    canvas.setupCanvas(canvasElement, audio.analyserNode, rotation, colors, sphereOptions);
    setupUI(canvasElement);

    loop();
  } else {
    // The item does not exist in local storage
    // Use the data from the JSON file
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const { drawParams: params } = data;
        Object.assign(drawParams, params);

        const { Rotation: axis } = data;
        Object.assign(rotation, axis);

        const title = document.createElement('h1');
        title.textContent = data.Title;
        colors = data.Colors;
        sphereOptions = data.SphereOptions;
        volume = data.Volume;

        // Add the h1 element to the DOM
        document.body.insertBefore(title, document.body.firstChild);

        const select = document.getElementById('track-select');

        // Loop through the songs and create an option element for each one
        for (const song of data.Songs) {
          filePaths.push(song.location);
          select.insertAdjacentHTML('beforeend', `<option value="${song.location}">${song.title}</option>`);
        }

        canvas.setupCanvas(canvasElement, audio.analyserNode, rotation, colors, sphereOptions);
        setupUI(canvasElement);
        loop();
      });
  }
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
    // check if context is in suspended state (autoplay policy)
    if (audio.audioCtx.state == "suspended") {
      audio.audioCtx.resume();
    }
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
  const volumeController = soundFolder.add({ volOption: volume }, 'volOption', 0, 100);
  audio.setVolume(volume / 100);

  volumeController.onChange(function (newValue) {
    audio.setVolume(newValue / 100);
    volume = newValue;
    localSave();
  });
  volumeController.name("Volume");
  

  const trebleController = soundFolder.add(drawParams, 'useTreble');
  trebleController.onChange(function (e) {
    if (e == true) {
      audio.biquadFilter.frequency.setValueAtTime(1000, audio.audioCtx.currentTime);
      audio.biquadFilter.gain.setValueAtTime(15, audio.audioCtx.currentTime);
    }
    else {
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
      audio.lowShelfBiquadFilter.frequency.setValueAtTime(1000, audio.audioCtx.currentTime);
      audio.lowShelfBiquadFilter.gain.setValueAtTime(30, audio.audioCtx.currentTime);
    }
    else {
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
  const sphereFolder = gui.addFolder('Sphere');
  const sphereController = sphereFolder.add(drawParams, 'showSphere');
  sphereController.name("Display Sphere");

  sphereController.onChange(function (e) {
    localSave();
  });

  const pulseController = sphereFolder.add(drawParams, 'pulseSphere');
  pulseController.name("Pulse");

  pulseController.onChange(function (e) {
    localSave();
  });

  const spinController = sphereFolder.add(drawParams, 'spinSphere');
  spinController.name("Spin");

  spinController.onChange(function (e) {
    localSave();
  });



  const rotationFolder = sphereFolder.addFolder("Rotation");
  const x = rotationFolder.add(rotation, 'x', 0.00, 360);
  const y = rotationFolder.add(rotation, 'y', 0.00, 360);
  const z = rotationFolder.add(rotation, 'z', 0.00, 360);

  // Set up function then set initial values
  x.onChange(function (e) {
    canvas.sphere.setRotation(rotation);
    localSave();
  });

  y.onChange(function (e) {
    canvas.sphere.setRotation(rotation);
    localSave();
  });

  z.onChange(function (e) {
    canvas.sphere.setRotation(rotation);
    localSave();
  });


  let buildOptions = sphereFolder.addFolder("Build Options");




  // Set a copy of initial values before ui is created
  tempColors = colors;
  tempSphereOptions = sphereOptions;




  let ringController = buildOptions.add(tempSphereOptions, 'rings', 1, 45).name("Rings").step(2);
  ringController.onChange(function (e) {
    // Stepping defaults to even numbers so i'm taking over
    if (e % 2 == 0) {
      e = e - 1;
      tempSphereOptions.rings = e;
      ringController.updateDisplay();
    }
  })

  buildOptions.add(tempSphereOptions, 'points', 3, 1000).name("Points").step(1);
  buildOptions.addColor(tempColors, 0).name("Front Primary");
  buildOptions.addColor(tempColors, 1).name("Front Secondary");
  buildOptions.addColor(tempColors, 2).name("Back Primary");
  buildOptions.addColor(tempColors, 3).name("Back Secondary");

  const buildButton = {
    reBuild: function () {
      colors = tempColors;
      sphereOptions = tempSphereOptions;

      canvas.rebuildSphere(sphereOptions, colors, rotation);
      localSave();
    }
  }

  const button = buildOptions.add(buildButton, 'reBuild');
  button.name("Build Sphere");

  sphereFolder.open();

  const backgroundFolder = gui.addFolder('Background');

  const barController = backgroundFolder.add(drawParams, 'showBars');
  barController.name("Display Bars");

  barController.onChange(function (e) {
    localSave();
  });

  const gradientController = backgroundFolder.add(drawParams, 'showGradient');
  gradientController.name("Display Gradient");

  gradientController.onChange(function (e) {
    localSave();
  });

  const particleController = backgroundFolder.add(drawParams, 'showConfetti');
  particleController.name("Display Particles");

  particleController.onChange(function (e) {
    localSave();
  });

  backgroundFolder.open();


  const overlayFolder = gui.addFolder('Overlay');

  const embossController = overlayFolder.add(drawParams, 'showEmboss');
  embossController.onChange(function (e) {
    localSave();
  });
  embossController.name("Emboss");

  const invertController = overlayFolder.add(drawParams, 'showInvert');
  invertController.name("Invert");

  invertController.onChange(function (e) {
    localSave();
  });

  const noiseController = overlayFolder.add(drawParams, 'showNoise');
  noiseController.name("Noise");

  noiseController.onChange(function (e) {
    localSave();
  });

  overlayFolder.open();

  const loopBox = document.querySelector("#loop-cb");
  const frequencyButton = document.querySelector("#frequency");
  const waveformButton = document.querySelector("#waveform");

  // Assign defaults from cache on page load
  /*drawParams.loopAudio = loopBox.checked;
  drawParams.displayFrequency = frequencyButton.checked;
  drawParams.displayWaveform = waveformButton.checked;*/

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

const fps = 60;
const interval = 1000 / fps;

let then = performance.now();

const loop = (now) => {
  const elapsed = now - then;

  if (elapsed > interval) {
    then = now - (elapsed % interval);

    // Keep track of fps
    stats.begin();
    canvas.draw(drawParams);
    stats.end();
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);



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
    Volume: volume,
    Songs: songs,
    drawParams: drawParams,
    Rotation: rotation,
    SphereOptions: sphereOptions,
    Colors: colors
  };

  localStorage.setItem("dpsAudio", JSON.stringify(dataToSave));
}


export { init };
