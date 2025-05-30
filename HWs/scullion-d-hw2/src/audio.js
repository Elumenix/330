// Something I deemed necessary later on for glitched audio files
let duration;

// 1 - our WebAudio context, **we will export and make this public at the bottom of the file**
let audioCtx;

// **These are "private" properties - these will NOT be visible outside of this module (i.e. file)**
// 2 - WebAudio nodes that are part of our WebAudio audio routing graph
let element, sourceNode, analyserNode, gainNode, biquadFilter, lowShelfBiquadFilter;

// 3 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
    gain: .5,
    numSamples: 256
});

// 4 - create a new array of 8-bit integers (0-255)
// this is a typed array to hold the audio frequency data
let audioData = new Uint8Array(DEFAULTS.numSamples / 2);

// **Next are "public" methods - we are going to export all of these at the bottom of this file**
const setupWebaudio = (filePath) => {
    // 1 - The || is because WebAudio has not been standardized across browsers yet
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    // 2 - this creates an <audio> element
    element = new Audio(); //document.querySelector("audio");
    element.crossOrigin = 'anonymous'; // Let files from a server be played without issue

    let message = document.querySelector("#update-message");

    // 3 - have it point at a sound file
    if (!filePath.includes('undefined')) {
        loadSoundFile(filePath);
    }
    else {
        message.innerHTML = "No available tracks."
    }

    // 4 - create an a source node that points at the <audio> element
    sourceNode = audioCtx.createMediaElementSource(element);

    // Might not be a good standard, but only way I could think of to change the button back
    sourceNode.mediaElement.onended = () => {
        if (sourceNode.mediaElement.loop == false) {
            document.querySelector("#play-button").dataset.playing = "no";
        }
    }


    biquadFilter = audioCtx.createBiquadFilter();
    biquadFilter.type = "highshelf";

    lowShelfBiquadFilter = audioCtx.createBiquadFilter();
    lowShelfBiquadFilter.type = "lowshelf";


    // 5 - create an analyser node
    // note the UK spelling of "Analyser"
    analyserNode = audioCtx.createAnalyser();

    /*
    // 6
    We will request DEFAULTS.numSamples number of samples or "bins" spaced equally 
    across the sound spectrum.
    
    If DEFAULTS.numSamples (fftSize) is 256, then the first bin is 0 Hz, the second is 172 Hz, 
    the third is 344Hz, and so on. Each bin contains a number between 0-255 representing 
    the amplitude of that frequency.
    */

    // fft stands for Fast Fourier Transform
    analyserNode.fftSize = DEFAULTS.numSamples;

    sourceNode.connect(biquadFilter);
    biquadFilter.connect(lowShelfBiquadFilter);
    lowShelfBiquadFilter.connect(analyserNode);


    // 7 - create a gain (volume) node
    gainNode = audioCtx.createGain();
    gainNode.gain.value = DEFAULTS.gain;

    // 8 - connect the nodes - we now have an audio graph
    sourceNode.connect(analyserNode);
    analyserNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);


    // 9 - Hook up progress bar
    const progressBar = document.querySelector('#progress-bar');

    element.addEventListener('timeupdate', () => {
        progressBar.value = (element.currentTime / element.duration) * 100;
    });

    progressBar.addEventListener('input', () => {
        element.currentTime = (progressBar.value / 100) * element.duration;
    });


    // 10 - Hook up time tracker
    const timeTracker = document.querySelector('#time-tracker');

    element.addEventListener('timeupdate', () => {
        const currentTime = formatTime(element.currentTime);

        if (duration < currentTime) {
            // Some audio files are glitched and show a wrong end time regardless, this needs to account for that
            // Rounding is to prevent pause button glitch
            if (duration + .3 >= currentTime) {
                duration = currentTime;
            }
        }
        else {
            // Duration used to be updated but that somehow caused it to permanently increase
            // in number at the end if the user spammed the pause button, for whatever reason
            duration = timeTracker.textContent.split(' / ')[1];
        }
        timeTracker.textContent = `${currentTime} / ${duration}`;
    });

    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }


    // Makes it so that the bar doesn't start at center when a new song is selected, prevents NaN in timer display
    element.addEventListener('loadedmetadata', () => {
        progressBar.value = 0;
        const currentTime = formatTime(element.currentTime);
        duration = formatTime(element.duration);
        timeTracker.textContent = `${currentTime} / ${duration}`;
    });
}

const loadSoundFile = (filePath) => {
    let message = document.querySelector('#update-message');
    element.addEventListener('error', () => {
        message.innerHTML = "Track was removed after server update. Please reupload.";
    });

    if (!(filePath == "NaN")) {
        element.src = filePath;
    }
    else {
        // Clears element without throwing an error
        element.src = "./uploads/silence.mp3";
    }

    element.removeEventListener('error', () => {
        message.innerHTML = "Track was removed after server update. Please reupload.";
    });
}

const playCurrentSound = () => {
    let temp = gainNode.gain.value;


    element.play().catch((error) => {
        let message = document.querySelector("#update-message");
        let select = document.querySelector("#track-select");

        if (select.children.length == 0) {
            message.innerHTML = "No available tracks."
        }
        else {
            message.innerHTML = "Track was removed after server update. Please reupload.";
        }
    });


    gainNode.gain.value = temp;
}

const pauseCurrentSound = () => {
    element.pause();
}

const setVolume = (value) => {
    value = Number(value); // make sure that it's a Number rather than a String
    gainNode.gain.value = value;
}

const setLooping = (value) => {
    sourceNode.mediaElement.loop = value;
}

export { audioCtx, setupWebaudio, playCurrentSound, pauseCurrentSound, loadSoundFile, setVolume, setLooping, analyserNode, biquadFilter, lowShelfBiquadFilter };
