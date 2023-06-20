/*
  main.js is primarily responsible for hooking up the UI to the rest of the application 
  and setting up the main event loop
*/
import * as audio from './audio.js';
import * as canvas from './visualizer.js';
import dat from './dat.gui.module.js';

let gradientData = {};
let reloadOverride = false;


const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom

const rotation = {};
let rotationFolder;

const drawParams = {
};
let particleNum;

let colors;
let tempColors
let sphereOptions = {};
let tempSphereOptions = {};
let biquads = {};

// Define filePaths array in a scope accessible to both init() and localSave() functions
let filePaths = [];
let volume = 0;

const init = () => {
  document.querySelector("#my-stats-container").appendChild(stats.dom);

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
    biquads = data.Biquads;
    particleNum = data.NumParticles;
    gradientData = data.GradientData;

    // Add the h1 element to the DOM
    document.body.insertBefore(title, document.body.firstChild);

    const select = document.getElementById('track-select');

    // Loop through the songs and create an option element for each one
    // Create an array to store the fetch promises
    let fetchPromises = [];

    // Loop through the songs and create an option element for each one
    for (const song of data.Songs) {
      // Store the fetch promise in the fetchPromises array
      fetchPromises.push(
        fetch(song.location)
          .then(response => response.blob())
          .then(blob => {
            let objectURL = URL.createObjectURL(blob);
            // Use objectURL here
            select.insertAdjacentHTML('beforeend', `<option value="${objectURL}">${song.title}</option>`);
            // Store original file path in filePaths array
            filePaths.push(song.location);
          })
      );
    }

    // Wait for all of the fetch promises to resolve
    Promise.all(fetchPromises).then(() => {
      // Call the setupWebaudio function after all of the songs have been fetched
      audio.setupWebaudio(`./${filePaths[0]}`);

      canvas.setupCanvas(canvasElement, audio.analyserNode, rotation, colors, sphereOptions, particleNum, gradientData);
      setupUI(canvasElement);
      requestAnimationFrame(loop);
    });
  } else {
    // The item does not exist in local storage

    const select = document.getElementById('track-select');
    // Use the data from the JSON file
    fetch(url)
      .then(response => response.json())
      .then(data => {
        // Loop through the songs and create an option element for each one
        for (const song of data.Songs) {
          filePaths.push(song.location);
          select.insertAdjacentHTML('beforeend', `<option value="${song.location}">${song.title}</option>`);
        }

        audio.setupWebaudio(`./${filePaths[0]}`);


        const { drawParams: params } = data;
        Object.assign(drawParams, params);

        const { Rotation: axis } = data;
        Object.assign(rotation, axis);

        const title = document.createElement('h1');
        title.textContent = data.Title;
        colors = data.Colors;
        sphereOptions = data.SphereOptions;
        volume = data.Volume;
        biquads = data.Biquads;
        particleNum = data.NumParticles;
        gradientData = data.GradientData;

        // Add the h1 element to the DOM
        document.body.insertBefore(title, document.body.firstChild);


        canvas.setupCanvas(canvasElement, audio.analyserNode, rotation, colors, sphereOptions, particleNum, gradientData);
        setupUI(canvasElement);
        requestAnimationFrame(loop);
      });
  }
}


const setupUI = (canvasElement) => {
  let startingWidth = screen.width - canvas.canvasWidth - 125;

  if (startingWidth < 400) {
    startingWidth = 400;
  }

  // Immediatly set up gui element
  const gui = new dat.GUI({ width: startingWidth });

  // A - hookup fullscreen button : Deprecated, didn't feel right + too blurry
  /*const fsButton = document.querySelector("#fs-button");

  // add .onclick event to button
  fsButton.onclick = e => {
    console.log("init called");
    utils.goFullscreen(canvasElement);
  };*/

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
      audio.biquadFilter.frequency.setValueAtTime(biquads.trebFreq, audio.audioCtx.currentTime);
      audio.biquadFilter.gain.setValueAtTime(biquads.trebGain, audio.audioCtx.currentTime);
    }
    else {
      audio.biquadFilter.gain.setValueAtTime(0, audio.audioCtx.currentTime);
    }

    localSave();
  });
  trebleController.name("Treble Boost");

  // Set initial condition
  if (drawParams.useTreble == true) {
    audio.biquadFilter.frequency.setValueAtTime(biquads.trebFreq, audio.audioCtx.currentTime);
    audio.biquadFilter.gain.setValueAtTime(biquads.trebGain, audio.audioCtx.currentTime);
  }


  const baseController = soundFolder.add(drawParams, 'useBase');
  baseController.onChange(function (e) {
    if (e == true) {
      audio.lowShelfBiquadFilter.frequency.setValueAtTime(biquads.bassFreq, audio.audioCtx.currentTime);
      audio.lowShelfBiquadFilter.gain.setValueAtTime(biquads.bassGain, audio.audioCtx.currentTime);
    }
    else {
      audio.lowShelfBiquadFilter.gain.setValueAtTime(0, audio.audioCtx.currentTime);
    }

    localSave();
  });
  baseController.name("Bass Boost");

  // Set initial condition
  if (drawParams.useBase == true) {
    audio.lowShelfBiquadFilter.frequency.setValueAtTime(biquads.bassFreq, audio.audioCtx.currentTime);
    audio.lowShelfBiquadFilter.gain.setValueAtTime(biquads.bassGain, audio.audioCtx.currentTime);
  }

  const soundOptionsFolder = soundFolder.addFolder("Boost Options");

  const freq1Controller = soundOptionsFolder.add(biquads, 'trebFreq', 10, 24000).name("Treble Frequency");
  freq1Controller.onChange(function (e) {
    audio.biquadFilter.frequency.setValueAtTime(biquads.trebFreq, audio.audioCtx.currentTime);
    localSave();
  });

  let propertyName = freq1Controller.domElement.parentNode.querySelector('.property-name');
  propertyName.classList.add('tooltip');
  let tooltip = document.createElement("span");
  tooltip.classList.add("tooltiptext");
  tooltip.innerHTML = "Gray Area";
  propertyName.appendChild(tooltip);

  const gain1Controller = soundOptionsFolder.add(biquads, 'trebGain', 0, 50).name("Treble Gain");
  gain1Controller.onChange(function (e) {
    if (drawParams.useTreble == true) {
      audio.biquadFilter.gain.setValueAtTime(biquads.trebGain, audio.audioCtx.currentTime);
    }
    localSave();
  });

  const freq2Controller = soundOptionsFolder.add(biquads, 'bassFreq', 10, 24000).name("Bass Frequency");
  freq2Controller.onChange(function (e) {
    audio.lowShelfBiquadFilter.frequency.setValueAtTime(biquads.bassFreq, audio.audioCtx.currentTime);
    localSave();
  });

  propertyName = freq2Controller.domElement.parentNode.querySelector('.property-name');
  propertyName.classList.add('tooltip');
  tooltip = document.createElement("span");
  tooltip.classList.add("tooltiptext");
  tooltip.innerHTML = "Blue Area";
  propertyName.appendChild(tooltip);

  const gain2Controller = soundOptionsFolder.add(biquads, 'bassGain', 0, 50).name("Bass Gain");
  gain2Controller.onChange(function (e) {
    if (drawParams.useBase == true) {
      audio.lowShelfBiquadFilter.gain.setValueAtTime(biquads.bassGain, audio.audioCtx.currentTime);
    }
    localSave();
  });

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

    // Send file to server-side script
    const formData = new FormData();
    formData.append('file', file);
    fetch('https://music-file-uploader.onrender.com/upload', {
      method: 'POST',
      body: formData
    })
      .then(response => response.text())
      .then(data => {

        // Format the file name to get rid of underscores and file type
        let fileName = data.split('/').pop();
        let fileUrl = `https://music-file-uploader.onrender.com/uploads/${fileName}`;

        fileName = fileName.substring(0, fileName.lastIndexOf('.'));
        fileName = fileName.replace('_', " ");
        while (fileName.includes("_")) {
          fileName = fileName.replace('_', " ");
        }
        while (fileName.includes("-")) {
          fileName = fileName.replace('-', " ");
        }

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
          audio.loadSoundFile(fileUrl);
        } else {
          // Create new option
          option = document.createElement('option');
          option.value = fileUrl; // set value to file path on server
          option.textContent = fileName;
          filePaths.push(fileUrl);
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

  rotationFolder = sphereFolder.addFolder("Rotation");
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

  buildOptions.add(tempSphereOptions, 'radius', 50, 300).name("Radius");

  let ringController = buildOptions.add(tempSphereOptions, 'rings', 1, 45).name("Rings").step(2);
  ringController.onChange(function (e) {
    // Stepping defaults to even numbers so i'm taking over
    if (e % 2 == 0) {
      e = e - 1;
      tempSphereOptions.rings = e;
      ringController.updateDisplay();
    }
  })

  const pointController = buildOptions.add(tempSphereOptions, 'points', 3, 1000).name("Points").step(1);

propertyName = pointController.domElement.parentNode.querySelector('.property-name');
propertyName.classList.add('tooltip');
tooltip = document.createElement("span");
tooltip.classList.add("tooltiptext");
tooltip.innerHTML = "Per Ring: May Cause Lag";
propertyName.appendChild(tooltip);

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

  const optionsFolder = backgroundFolder.addFolder("Specialized Options");
  const waveformController = optionsFolder.add(drawParams, 'displayWaveform').name("Display Waveform");

  waveformController.onChange(function (e) {
    drawParams.displayFrequency = !drawParams.displayWaveform;
    localSave();
  });

  const particleNumController = optionsFolder.add({ number: particleNum }, 'number', 1, 1000).name("# of Particles").step(1);

  particleNumController.onChange(function (e) {
    canvas.changeParticleNumber(e);
    particleNum = e; // save because object was used
    localSave();
  });

  const particleColorController = optionsFolder.addColor(tempColors, 4).name("Particle Color");
  particleColorController.onChange(function (e) {
    canvas.changeParticleColor(e);
    localSave();
  });

  let gradientFolder = optionsFolder.addFolder("Gradient");

  const angleController = gradientFolder.add(gradientData, 'angle', 0, 360).name("Angle");
  angleController.onChange(function (e) {
    canvas.changeGradient(gradientData);
    localSave();
  });

  let addButton = gradientFolder.add({
    addColorStop: function () {
      // Create a new color stop object with default values
      let newColorStop = { percent: 0.5, color: "#ffffff" };

      // Add the new color stop to the gradientData.colorStops array
      gradientData.colorStops.push(newColorStop);

      // Create new controls for the added color stop
      let i = gradientData.colorStops.length - 1;

      // Create a color controller for the added color stop
      let colorController = gradientFolder.addColor(newColorStop, "color");
      colorController.name(`Color ${i + 1}`);
      colorController.property = `color`;
      colorController.onChange(function (e) {
        canvas.changeGradient(gradientData);
        localSave();
      });

      // Create a percent controller for the added color stop
      let percentController = gradientFolder.add(newColorStop, "percent", 0, 1);
      percentController.name(`Percent`);
      percentController.property = `percent`;
      percentController.onChange(function (e) {
        canvas.changeGradient(gradientData)
        localSave();
      });


      // Change immediatly on innitialization
      canvas.changeGradient(gradientData);
      localSave();

      // Add a button to remove the added color stop
      gradientFolder.add({
        [`remove${i + 1}`]: (function (index) {
          return function () {
            removeColorStop(index);
            canvas.changeGradient(gradientData);
            localSave();
          };
        })(i)
      }, `remove${i + 1}`).name(`Remove Color Stop ${i + 1}`);

    }
  }, "addColorStop").name("Add Color Stop");

  // Set button to be green
  addButton.domElement.parentNode.parentNode.classList.add('add-button');
  // Color stop removal function
  const removeColorStop = (index) => {
    // Remove the color stop from the gradientData.colorStops array
    gradientData.colorStops.splice(index, 1);

    // Remove the corresponding controls from the dat.GUI interface
    let colorController = gradientFolder.__controllers[index * 3 + 2];

    let percentController = gradientFolder.__controllers[index * 3 + 3];
    let removeButtonController = gradientFolder.__controllers.find(controller => controller.property === `remove${index + 1}`);
    gradientFolder.remove(colorController);
    gradientFolder.remove(percentController);
    gradientFolder.remove(removeButtonController);

    // Renumber the remaining color stops and their corresponding controls
    for (let i = index; i < gradientData.colorStops.length; i++) {
      let colorController = gradientFolder.__controllers[i * 3 + 2];
      let removeButtonController = gradientFolder.__controllers.find(controller => controller.property === `remove${i + 2}`);
      colorController.name(`Color ${i + 1}`);
      removeButtonController.name(`Remove Color Stop ${i + 1}`);
      removeButtonController.property = `remove${i + 1}`;
      removeButtonController.object[`remove${i + 1}`] = (function (index) {
        return function () {
          removeColorStop(index);
          canvas.changeGradient(gradientData);
          localSave();
        };
      })(i);
      delete removeButtonController.object[`remove${i + 2}`];
    }
  };

  // Establishes whatever was gotten from storage
  for (let i = 0; i < gradientData.colorStops.length; i++) {
    let colorStop = gradientData.colorStops[i];

    // Create a color controller for this color stop
    let colorController = gradientFolder.addColor(colorStop, `color`);
    colorController.name(`Color ${i + 1}`);
    colorController.property = `color`;
    colorController.onChange(function (e) {
      canvas.changeGradient(gradientData);
      localSave();
    });

    // Create a percent controller for this color stop
    let percentController = gradientFolder.add(colorStop, `percent`, 0, 1);
    percentController.name(`Percent`);
    percentController.property = `percent`;
    percentController.onChange(function (e) {
      canvas.changeGradient(gradientData);
      localSave();
    });

    // Add a button to remove this color stop
    gradientFolder.add({
      [`remove${i + 1}`]: (function (index) {
        return function () {
          removeColorStop(index);
          canvas.changeGradient(gradientData);
          localSave();
        };
      })(i)
    }, `remove${i + 1}`).name(`Remove Color Stop ${i + 1}`);
  }


  const overlayFolder = gui.addFolder('Overlay');

  const embossController = overlayFolder.add(drawParams, 'showEmboss');
  embossController.name("Emboss");

  overlayFolder.open();

// Add a tooltip
propertyName = embossController.domElement.parentNode.querySelector('.property-name');
propertyName.classList.add('tooltip');
tooltip = document.createElement("span");
tooltip.classList.add("tooltiptext");
tooltip.innerHTML = "Warning: This Will Cause Lag";
propertyName.appendChild(tooltip);

  embossController.onChange(function (e) {
    localSave();
  });

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

  // reload the page
  const resetButton = {
    reset: function () {
      reloadOverride = true;
      localStorage.removeItem("dpsAudio");
      location.reload();
    }
  }

  gui.add(resetButton, 'reset').name("Revert to Default Settings");


  const loopBox = document.querySelector("#loop-cb");


  // Assign defaults from cache on page load
  /*drawParams.loopAudio = loopBox.checked;*/

  loopBox.onchange = () => {
    drawParams.loopAudio = loopBox.checked;
    audio.setLooping(loopBox.checked);

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

    // weird location for this, but it prevents exposing main to other classes
    // Reload override is active because reloading the page is asynchronous, so 
    // the json would be resaved before the page was reloaded otherwise
    if (drawParams.spinSphere && !reloadOverride) {
      let recievedRotation = canvas.sphere.getRotation();

      // Variable is const so I need to do it individually
      rotation.x = recievedRotation.x;
      rotation.y = recievedRotation.y;
      rotation.z = recievedRotation.z;
      rotationFolder.updateDisplay();
      localSave();
    }

    stats.end();
  }

  requestAnimationFrame(loop);
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
    Volume: volume,
    Biquads: biquads,
    Songs: songs,
    drawParams: drawParams,
    Rotation: rotation,
    SphereOptions: sphereOptions,
    Colors: colors,
    NumParticles: particleNum,
    GradientData: gradientData
  };

  localStorage.setItem("dpsAudio", JSON.stringify(dataToSave));
}


export { init };
