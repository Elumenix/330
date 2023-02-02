import { grabArrayMember } from "./utils.js";

// References
let output;
let button;
let moreButton;

// Initialize References
window.onload = () => {
    output = document.querySelector("#output");
    button = document.querySelector("#my-button");
    moreButton = document.querySelector("#more-button");


    // Event
    button.onclick = () => {
        generateTechno(1);
    }
    moreButton.onclick = () => {
        generateTechno(5);
    }

    loadBabble();
    // One is generated on page first loading
    generateTechno(1);
}

const loadBabble = () => {
    const url = "data/babble-data.json";
    const xhr = new XMLHttpRequest();
    xhr.onload = (e) => {
        console.log(`In onload - HTTP Status Code = ${e.target.status}`);
        let json;

        try {
            json = JSON.parse(e.target.responseText);
        }
        catch {
            document.querySelector("#output").innerHTML = "BAD JSON!";
            return;
        }

        const words1 = json["words1"];
        const words2 = json["words2"];
        const words3 = json["words3"];

        console.log(words1);
    };
    xhr.onerror = e => console.log(`In onerrer - HTTP Status Code = ${e.target.status}`);
    xhr.open("GET", url);
    xhr.send();
}

const generateTechno = (num) => {
    output.innerHTML = "";
    for (let i = 0; i < num; i++) {
        output.innerHTML += `${grabArrayMember(words1)} ${grabArrayMember(words2)} ${grabArrayMember(words3)}<br>`
    }
}
