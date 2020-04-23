let startLayer = L.tileLayer.provider("BasemapAT.grau");

let map = L.map("map", {
    layers: [
        startLayer
    ]
});

let overlay = {
    stations: L.featureGroup(),
    temperature: L.featureGroup(),
    wind: L.featureGroup()
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
    "Wetterstationen Tirol": overlay.stations,
    "Temperatur (°C)": overlay.temperature,
    "Wind (km/h)": overlay.wind
}).addTo(map);

let awsUrl = "https://aws.openweb.cc/stations";


let aws = L.geoJson.ajax(awsUrl, {
    // filter: function (feature) {
    //     console.log("Feature in filter: ", feature);
    //     return feature.geometry.coordinates[2] > 3000;
        
    // },
    filter: function(feature) {
        console.log("Feature in filter II: ", feature);
        return feature.properties.hasOwnProperty('LT') === true;
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

let drawTemperature = function(jsonData) {
    console.log("aus der Funktin", jsonData);
    L.geoJson(jsonData, {
        filter: function(feature) {
            return feature.properties.LT;
        },
        pointToLayer: function(feature, latlng){
            return L.marker(latlng, {
                title: `${feature.properties.name} (${feature.geometry.coordinates[2]} m)`,
                icon: L.divIcon({
                    html: `<div class ="label-temperature">${feature.properties.LT.toFixed(1)}</div>`,
                    className: "ignore-me" //dirty hack
                })
            })
        }
    }).addTo(overlay.temperature);
};
//neues overlay definieren und zu l.control layers hinzufügen
//die funktion draw wind als 1:1 Kopie von draw Temperature mit Anpassungen ( in km/h nicht in m/s)
// .label-wind im main css erstellen
//die funktion draw wind in data:loaded aufrufen
let drawWind = function(jsonData) {
    console.log("aus der Funktin II", jsonData)
    L.geoJson(jsonData, {
        filter: function(feature) {
            return feature.properties.WG;
        },
        pointToLayer: function(feature, latlng){
            let kmhValue = feature.properties.WG * 3.6
            console.log("Khm Value",kmhValue)
            return L.marker(latlng, {
                title: `${feature.properties.name} (${feature.geometry.coordinates[2]} m)`,
                icon: L.divIcon({
                    html: `<div class="label-wind"> ${kmhValue.toFixed(1)}</div>`,
                    //html: `<div class="label-wind"> ${feature.properties.WG.toFixed(1)}</div>`,
                    className: "ignore-me" //dirty hack
                })
            })
        }
    }).addTo(overlay.wind);

}
aws.on("data:loaded", function() {
    //console.log(aws.toGeoJSON());
    drawTemperature(aws.toGeoJSON());
    drawWind(aws.toGeoJSON());
    map.fitBounds(overlay.stations.getBounds());

    overlay.temperature.addTo(map);
    overlay.wind.addTo(map);
});