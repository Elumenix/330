import * as map from "./map.js";
import * as ajax from "./ajax.js";

// I. Variables & constants
// NB - it's easy to get [longitude,latitude] coordinates with this tool: http://geojson.io/
const lnglatNYS = [-75.71615970715911, 43.025810763917775];
const lnglatUSA = [-98.5696, 39.8282];


// II. Functions
const setupUI = () => {
	// NYS Zoom 5.2
	
	// NYS isometric view
	
	// World zoom 0

}

const init = () => {
	map.initMap(lnglatNYS);
	setupUI();
};

init();