"use strict";

const words1 = ["Acute", "Aft", "Anti-matter", "Bipolar", "Cargo", "Command", "Communication", "Computer", "Deuterium", "Dorsal", "Emergency", "Engineering", "Environmental", "Flight", "Fore", "Guidance", "Heat", "Impulse", "Increased", "Inertial", "Infinite", "Ionizing", "Isolinear", "Lateral", "Linear", "Matter", "Medical", "Navigational", "Optical", "Optimal", "Optional", "Personal", "Personnel", "Phased", "Reduced", "Science", "Ship's", "Shuttlecraft", "Structural", "Subspace", "Transporter", "Ventral"];

const words2 = ["Propulsion", "Dissipation", "Sensor", "Improbability", "Buffer", "Graviton", "Replicator", "Matter", "Anti-matter", "Organic", "Power", "Silicon", "Holographic", "Transient", "Integrity", "Plasma", "Fusion", "Control", "Access", "Auto", "Destruct", "Isolinear", "Transwarp", "Energy", "Medical", "Environmental", "Coil", "Impulse", "Warp", "Phaser", "Operating", "Photon", "Deflector", "Integrity", "Control", "Bridge", "Dampening", "Display", "Beam", "Quantum", "Baseline", "Input"];

const words3 = ["Chamber", "Interface", "Coil", "Polymer", "Biosphere", "Platform", "Thruster", "Deflector", "Replicator", "Tricorder", "Operation", "Array", "Matrix", "Grid", "Sensor", "Mode", "Panel", "Storage", "Conduit", "Pod", "Hatch", "Regulator", "Display", "Inverter", "Spectrum", "Generator", "Cloud", "Field", "Terminal", "Module", "Procedure", "System", "Diagnostic", "Device", "Beam", "Probe", "Bank", "Tie-In", "Facility", "Bay", "Indicator", "Cell"];

// References
let output;
let button;
let moreButton;

// Initialize References
window.onload = function () {
    output = document.querySelector("#output");
    button = document.querySelector("#myButton");
    moreButton = document.querySelector("#moreButton");

    // Event

    button.onclick = () => {
        generateTechno(1);
    }
    moreButton.onclick = () => {
        generateTechno(5);
    }

    // One is generated on page first loading
    generateTechno(1);
}

function generateTechno(num) {
    // Helper Method
    function grabArrayMember(array) {
        return array[Math.floor(Math.random() * array.length)];
    }


    output.innerHTML = "";
    for (let i = 0; i < num; i++) {
        output.innerHTML += `${grabArrayMember(words1)} ${grabArrayMember(words2)} ${grabArrayMember(words3)}<br>`
    }
}
