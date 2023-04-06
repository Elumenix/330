const geojson = {
    type: 'FeatureCollection',
    features: []
};

function init() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZWx1bWVuaXgiLCJhIjoiY2xnNWlteDEyMDN0ZjNlbjlwYXI1a2RocSJ9.dO0Dj8YQUJ5iXVEfP-EaJA';

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-77.67454147338866, 43.08484339838443],
        zoom: 15.5
    });

    // add markers to map
    for (const feature of geojson.features) {
        // create a HTML element for each feature
        const el = document.createElement('div');
        el.className = 'marker';

        // make a marker for each feature and add to the map
        new mapboxgl.Marker(el)
            .setLngLat(feature.geometry.coordinates)
            .setPopup(
                new mapboxgl.Popup({ offset: 25 }) // add popups
                    .setHTML(
                        `<h3>${feature.properties.title}</h3><p>${feature.properties.description}</p>`
                    )
            )
            .addTo(map);
    }
}

export { init };