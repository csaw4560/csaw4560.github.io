let startLayer = L.tileLayer.provider("BasemapAT.grau");

let map = L.map("map", {
    layers: [
        startLayer
    ]
});

let overlay = {
    stations: L.featureGroup(),
    temperature: L.featureGroup(),
    wind: L.featureGroup(),
    humidity: L.featureGroup(),
    snow: L.featureGroup()
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
    "Windgeschwindigkeit (km/h)": overlay.wind,
    "Relative Luftfeuchte (%)": overlay.humidity,
    "Schneehöhe (cm)": overlay.snow
}).addTo(map);

let awsUrl = "https://aws.openweb.cc/stations";


let aws = L.geoJson.ajax(awsUrl, {
    
    filter: function(feature) {
        console.log("Feature in filter II: ", feature);
        return feature.properties.hasOwnProperty('LT') === true;
    },

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

let getColor = function(val, ramp) {
    let col ="red";

    for (let i = 0; i < ramp.length; i++) {
        const pair = ramp[i];
        if (val >= pair[0]){
            break;
        }else {
            col = pair[1];
        }
        
    }
    return col; 
};

let drawTemperature = function(jsonData) {
    console.log("aus der Funktin", jsonData);
    L.geoJson(jsonData, {
        filter: function(feature) {
            return feature.properties.LT;
        },
        pointToLayer: function(feature, latlng){
            let color = getColor(feature.properties.LT, COLORS.temperature);
            return L.marker(latlng, {
                title: `${feature.properties.name} (${feature.geometry.coordinates[2]} m)`,
                icon: L.divIcon({
                    html: `<div class ="label-temperature" style="background-color:${color}">${feature.properties.LT.toFixed(1)}</div>`,
                    className: "ignore-me" //dirty hack
                })
            })
        }
    }).addTo(overlay.temperature);
};

let drawWind = function(jsonData) {
    console.log("aus der Funktin II", jsonData)
    L.geoJson(jsonData, {
        filter: function(feature) {
            return feature.properties.WG;
        },
        pointToLayer: function(feature, latlng){
            
            kmhValue = Math.round(feature.properties.WG * 3.6);
            let color = getColor(kmhValue, COLORS.wind);
            let rotation = feature.properties.WR;
            //console.log("Khm Value",kmhValue)
            return L.marker(latlng, {
                title: `${feature.properties.name} (${feature.geometry.coordinates[2]} m) - ${kmhValue} km/h`,
                icon: L.divIcon({
                    html: `<div class="label-wind"><i class="fas fa-arrow-circle-up" style="color:${color};transform: rotate(${rotation}deg)"></i></div>`,
                    //html: `<div class="label-wind"> ${feature.properties.WG.toFixed(1)}</div>`,
                    className: "ignore-me" //dirty hack
                })
            })
        }
    }).addTo(overlay.wind);

};

let drawHumidity = function(jsonData) {
    console.log("aus der Funktion", jsonData);
    L.geoJson(jsonData, {
        filter: function(feature) {
            return feature.properties.RH;
        },
        pointToLayer: function(feature, latlng){
            let color = getColor(feature.properties.RH, COLORS.humidity);
            return L.marker(latlng, {
                title: `${feature.properties.name} (${feature.geometry.coordinates[2]} m)`,
                icon: L.divIcon({
                    html: `<div class ="label-humidity" style="background-color:${color}">${feature.properties.RH.toFixed(1)}</div>`,
                    className: "ignore-me" //dirty hack
                })
            })
        }
    }).addTo(overlay.temperature);
};

let drawSnow = function(jsonData) {
    console.log("aus der Funktion", jsonData);
    L.geoJson(jsonData, {
        filter: function(feature) {
            return feature.properties.SH;
        },
        pointToLayer: function(feature, latlng){
            let color = getColor(feature.properties.SH, COLORS.snow);
            return L.marker(latlng, {
                title: `${feature.properties.name} (${feature.geometry.coordinates[2]} m)`,
                icon: L.divIcon({
                    html: `<div class ="label-snow" style="background-color:${color}">${feature.properties.SH.toFixed(1)}</div>`,
                    className: "ignore-me" //dirty hack
                })
            })
        }
    }).addTo(overlay.temperature);
};

aws.on("data:loaded", function() {
    drawTemperature(aws.toGeoJSON());
    drawWind(aws.toGeoJSON());
    drawHumidity(aws.toGeoJSON());
    drawSnow(aws.toGeoJSON());
    
    map.fitBounds(overlay.stations.getBounds());

    overlay.wind.addTo(map);
});