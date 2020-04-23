let startLayer = L.tileLayer.provider("BasemapAT.grau");

let map = L.map("map", {
    layers: [
        startLayer
    ]
});

let overlay = {
    stations: L.featureGroup()
}

L.control.layers({
    "BasemapAT.grau": startLayer,
    "BasemapAT": L.tileLayer.provider("BasemapAT"),
    "BasemapAT.highdpi": L.tileLayer.provider("BasemapAT.highdpi"),
    "BasemapAT.terrain": L.tileLayer.provider("BasemapAT.terrain"),
    "BasemapAT.surface": L.tileLayer.provider("BasemapAT.surface"),
    "BasemapAT.orthofoto": L.tileLayer.provider("BasemapAT.orthofoto"),
    "BasemapAT.overlay": L.tileLayer.provider("BasemapAT.overlay"),
    "BasemapAT.orthofoto+overlay": L.layerGroup([
        L.tileLayer.provider("BasemapAT.orthofoto"),
        L.tileLayer.provider("BasemapAT.overlay")
    ])
}, {
    "Wetterstationen Tirol": overlay.stations
}).addTo(map);

let awsUrl = "https://aws.openweb.cc/stations";


let aws = L.geoJson.ajax(awsUrl, {
    // filter: function (feature) {
    //     console.log("Feature in filter: ", feature);
    //     return feature.geometry.coordinates[2] > 3000;
        
    // },
    filter: function(feature) {
        console.log("Feature in filter II: ", feature);
        return feature.properties.hasOwnProperty('LD') === true;
    },

    // filter: function (feature) {
    //     if (feature.properteis.hasOwnProperty('LT') === true AND 
    //     feature.geomety.coordinates[2] > 3000) {
    //         return feature
            
    //     }
        
    // }
    pointToLayer: function (point, latlng) {
        // console.log("point: ", point);
        let marker = L.marker(latlng).bindPopup(`
        <h3>${point.properties.name} ${point.geometry.coordinates[2]} m</h3>
        <ul>
        <li>Position: Lat: ${point.geometry.coordinates[1]}/Lng: ${point.geometry.coordinates[0]}</li>
        <li>Datum: ${point.properties.date}</li>
        <li>Lufttemperatur: ${point.properties.LT} °C</li>
        <li>Windgeschwindigkeit: ${point.properties.WG} m/s</li>
        <li>Relative Luftfeuchte: ${point.properties.RH} % </li>
        <li>Schneehöhe: ${point.properties.HS} cm</li>
        <li><a href='https://lawine.tirol.gv.at/data/grafiken/1100/standard/tag/${point.properties.plot}.png'>Link</a></li>
        </ul>
        `);
        return marker;
    }
}).addTo(overlay.stations);

aws.on("data:loaded", function() {
    console.log(aws.toGeoJSON());

    map.fitBounds(overlay.stations.getBounds());

    overlay.stations.addTo(map);
});