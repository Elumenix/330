import * as map from "./map.js";
import * as ajax from "./ajax.js";

// I. Variables & constants
// NB - it's easy to get [longitude,latitude] coordinates with this tool: http://geojson.io/
const lnglatNYS = [-75.71615970715911, 43.025810763917775];
const lnglatUSA = [-98.5696, 39.8282];
let geojson;


// II. Functions
const setupUI = () => {
	// NYS Zoom 5.2
	document.querySelector("#btn1").onclick = () => {
		map.setZoomLevel(5.2);
		map.setPitchAndBearing(0, 0);
		map.flyTo(lnglatNYS);
	};

	// NYS isometric view
	document.querySelector("#btn2").onclick = () => {
		map.setZoomLevel(5.5);
		map.setPitchAndBearing(45, 0);
		map.flyTo(lnglatNYS);
	};

	// World zoom 0
	document.querySelector("#btn3").onclick = () => {
		map.setZoomLevel(3);
		map.setPitchAndBearing(0, 0);
		map.flyTo(lnglatUSA);
	};
}

const showFeatureDetails = (id) => {
	const feature = getFeatureById(id);
	document.querySelector("#details-1").innerHTML = `Info for ${feature.properties.title}`;
	document.querySelector("#details-2").innerHTML = `<p><b>Address:</b> ${feature.properties.address}</p><p><b>Phone:</b> <a href="tel:+${feature.properties.phone}">${feature.properties.phone}</a></p><p><b>Website:</b> <a href="${feature.properties.url}">${feature.properties.url}</a></p>`;
	document.querySelector("#details-3").innerHTML = `<p>${feature.properties.description}</p>`;
};

const getFeatureById = (id) => {
	return geojson.features.find(feature => feature.id === id);
};

const init = () => {
	map.initMap(lnglatNYS);
	ajax.downloadFile("data/parks.geojson", (str) => {
		geojson = JSON.parse(str);
		map.addMarkersToMap(geojson, showFeatureDetails);
		setupUI();
	});
};

init();