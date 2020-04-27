let startLayer = L.tileLayer.provider("BasemapAT.grau");

let map = L.map("map", {
    center: [47.3, 11.5],
    zoom: 8,
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
    }).addTo(overlay.humidity);
};

let drawSnow = function(jsonData) {
    console.log("aus der Funktion", jsonData);
    L.geoJson(jsonData, {
        filter: function(feature) {
            return feature.properties.HS;
        },
        pointToLayer: function(feature, latlng){
            let color = getColor(feature.properties.HS, COLORS.snow);
            return L.marker(latlng, {
                title: `${feature.properties.name} (${feature.geometry.coordinates[2]} m)`,
                icon: L.divIcon({
                    html: `<div class ="label-snow" style="background-color:${color}">${feature.properties.HS.toFixed(1)}</div>`,
                    className: "ignore-me" //dirty hack
                })
            })
        }
    }).addTo(overlay.snow);
};

aws.on("data:loaded", function() {
    drawTemperature(aws.toGeoJSON());
    drawWind(aws.toGeoJSON());
    drawHumidity(aws.toGeoJSON());
    drawSnow(aws.toGeoJSON());
    
    map.fitBounds(overlay.stations.getBounds());

    overlay.stations.addTo(map);
});

var rainviewer = L.control.rainviewer({
    position: 'bottomleft',
    nextButtonText: '>',
    playStopButtonText: 'Start/Stop',
    prevButtonText: '<',
    positionSliderLabelText: "Time:",
    opacitySliderLabelText: "Opacity:",
    animationInterval: 500,
    opacity: 0.5
});
rainviewer.addTo(map);
//Rainviewer

// L.Control.Rainviewer = L.Control.extend({
//     options: {
//         position: 'bottomleft',
//         nextButtonText: '>',
//         playStopButtonText: 'Play/Stop',
//         prevButtonText: '<',
//         positionSliderLabelText: "Hour:",
//         opacitySliderLabelText: "Opacity:",
//         animationInterval: 500,
//         opacity: 0.5
//     },

//     onAdd: function (map) {
//         /**
//          * RainViewer radar animation part
//          * @type {number[]}
//          */
//         this.timestamps = [];
//         this.radarLayers = [];

//         this.currentTimestamp;
//         this.nextTimestamp;

//         this.animationPosition = 0;
//         this.animationTimer = false;

//         this.rainviewerActive = false;

//         this._map = map;

//         this.container = L.DomUtil.create('div', 'leaflet-control-rainviewer leaflet-bar leaflet-control');

//         this.link = L.DomUtil.create('a', 'leaflet-control-rainviewer-button leaflet-bar-part', this.container);
//         this.link.href = '#';
//         L.DomEvent.on(this.link, 'click', this.load, this);
//         return this.container;

//         /*return this.load(map);*/


//     },

//     load: function(map) {
//                 /**
//          * Load actual radar animation frames this.timestamps from RainViewer API
//          */
// 		var t = this;
//         this.apiRequest = new XMLHttpRequest();
//         this.apiRequest.open("GET", "https://tilecache.rainviewer.com/api/maps.json", true);
//         this.apiRequest.onload = function (e) {

//             // save available this.timestamps and show the latest frame: "-1" means "timestamp.lenght - 1"
//             t.timestamps = JSON.parse(t.apiRequest.response);
//             console.log(this);
//             t.showFrame(-1);
//         };
//         this.apiRequest.send();

//         /**
//          * Animation functions
//          * @param ts
//          */

//         L.DomUtil.addClass(this.container, 'leaflet-control-rainviewer-active');

//         this.controlContainer = L.DomUtil.create('div', 'leaflet-control-rainviewer-container', this.container);

//         this.prevButton = L.DomUtil.create('input', 'leaflet-control-rainviewer-prev leaflet-bar-part btn', this.controlContainer);
//         this.prevButton.type = "button";
//         this.prevButton.value = this.options.prevButtonText;
//         L.DomEvent.on(this.prevButton, 'click', t.prev, this);
//         L.DomEvent.disableClickPropagation(this.prevButton);

//         this.startstopButton = L.DomUtil.create('input', 'leaflet-control-rainviewer-startstop leaflet-bar-part btn', this.controlContainer);
//         this.startstopButton.type = "button";
//         this.startstopButton.value = this.options.playStopButtonText;
//         L.DomEvent.on(this.startstopButton, 'click', t.startstop, this);
//         L.DomEvent.disableClickPropagation(this.startstopButton);

//         this.nextButton = L.DomUtil.create('input', 'leaflet-control-rainviewer-next leaflet-bar-part btn', this.controlContainer);
//         this.nextButton.type = "button";
//         this.nextButton.value = this.options.nextButtonText;
//         L.DomEvent.on(this.nextButton, 'click', t.next, this);
//         L.DomEvent.disableClickPropagation(this.nextButton);

//         this.positionSliderLabel = L.DomUtil.create('label', 'leaflet-control-rainviewer-label leaflet-bar-part', this.controlContainer);
//         this.positionSliderLabel.for = "rainviewer-positionslider";
//         this.positionSliderLabel.textContent = this.options.positionSliderLabelText;

//         this.positionSlider = L.DomUtil.create('input', 'leaflet-control-rainviewer-positionslider leaflet-bar-part', this.controlContainer);
//         this.positionSlider.type = "range";
//         this.positionSlider.id = "rainviewer-positionslider";
//         this.positionSlider.min = 0;
//         this.positionSlider.max = 11;
//         this.positionSlider.value = this.animationPosition;
//         L.DomEvent.on(this.positionSlider, 'input', t.setPosition, this);
//         L.DomEvent.disableClickPropagation(this.positionSlider);

//         this.opacitySliderLabel = L.DomUtil.create('label', 'leaflet-control-rainviewer-label leaflet-bar-part', this.controlContainer);
//         this.opacitySliderLabel.for = "rainviewer-opacityslider";
//         this.opacitySliderLabel.textContent = this.options.opacitySliderLabelText;

//         this.opacitySlider = L.DomUtil.create('input', 'leaflet-control-rainviewer-opacityslider leaflet-bar-part', this.controlContainer);
//         this.opacitySlider.type = "range";
//         this.opacitySlider.id = "rainviewer-opacityslider";
//         this.opacitySlider.min = 0;
//         this.opacitySlider.max = 100;
//         this.opacitySlider.value = this.options.opacity*100;
//         L.DomEvent.on(this.opacitySlider, 'input', t.setOpacity, this);
//         L.DomEvent.disableClickPropagation(this.opacitySlider);


//         this.closeButton = L.DomUtil.create('div', 'leaflet-control-rainviewer-close', this.container);
//         L.DomEvent.on(this.closeButton, 'click', t.unload, this);

//         var html = '<div id="timestamp" class="leaflet-control-rainviewer-timestamp"></div>'

//         this.controlContainer.insertAdjacentHTML('beforeend', html);

//         L.DomEvent.disableClickPropagation(this.controlContainer);

//         /*return container;*/
//     },

//     unload: function(e) {
//         L.DomUtil.remove(this.controlContainer);
//         L.DomUtil.remove(this.closeButton);
//         L.DomUtil.removeClass(this.container, 'leaflet-control-rainviewer-active');
//         console.log(this.radarLayers);
//         var radarLayers = this.radarLayers;
//         var map = this._map;
//         Object.keys(radarLayers).forEach(function (key) {
//             if (map.hasLayer(radarLayers[key])) {
//                 map.removeLayer(radarLayers[key]);
//             }
//          });
//     },
    
//     addLayer: function(ts) {
//         if (!this.radarLayers[ts]) {
//             this.radarLayers[ts] = new L.TileLayer('https://tilecache.rainviewer.com/v2/radar/' + ts + '/256/{z}/{x}/{y}/2/1_1.png', {
//                 tileSize: 256,
//                 opacity: 0.001,
// 				transparent: true,
// 				attribution: '<a href="https://rainviewer.com" target="_blank">rainnviewer.com</a>',
//                 zIndex: ts
//             });
//         }
//         if (!map.hasLayer(this.radarLayers[ts])) {
//             map.addLayer(this.radarLayers[ts]);
//         }
//     },

//     /**
//      * Display particular frame of animation for the @position
//      * If preloadOnly parameter is set to true, the frame layer only adds for the tiles preloading purpose
//      * @param position
//      * @param preloadOnly
//      */
//     changeRadarPosition: function(position, preloadOnly) {
//         while (position >= this.timestamps.length) {
//             position -= this.timestamps.length;
//         }
//         while (position < 0) {
//             position += this.timestamps.length;
//         }

//         this.currentTimestamp = this.timestamps[this.animationPosition];
//         this.nextTimestamp = this.timestamps[position];

//         this.addLayer(this.nextTimestamp);

//         if (preloadOnly) {
//             return;
//         }

//         this.animationPosition = position;
//         this.positionSlider.value = position;

//         if (this.radarLayers[this.currentTimestamp]) {
//             this.radarLayers[this.currentTimestamp].setOpacity(0);
//         }
//         this.radarLayers[this.nextTimestamp].setOpacity(this.options.opacity);

//         document.getElementById("timestamp").innerHTML = (new Date(this.nextTimestamp * 1000)).toLocaleString();
//     },

//     /**
//      * Check avialability and show particular frame position from the this.timestamps list
//      */
//     showFrame: function(nextPosition) {
//         var preloadingDirection = nextPosition - this.animationPosition > 0 ? 1 : -1;

//         this.changeRadarPosition(nextPosition);

//         // preload next next frame (typically, +1 frame)
//         // if don't do that, the animation will be blinking at the first loop
//         this.changeRadarPosition(nextPosition + preloadingDirection, true);
//     },

//     /**
//      * Stop the animation
//      * Check if the animation timeout is set and clear it.
//      */
//     setOpacity: function(e){
//         console.log(e.srcElement.value/100);
//         if (this.radarLayers[this.currentTimestamp]) {
//             this.radarLayers[this.currentTimestamp].setOpacity(e.srcElement.value/100);
//         }
//     },

//     setPosition: function(e){
//         this.showFrame(e.srcElement.value)
//     },

//     stop: function() {
//         if (this.animationTimer) {
//             clearTimeout(this.animationTimer);
//             this.animationTimer = false;
//             return true;
//         }
//         return false;
//     },

//     play: function() {
//         this.showFrame(this.animationPosition + 1);

//         // Main animation driver. Run this function every 500 ms
//         this.animationTimer = setTimeout(function(){ this.play() }.bind(this), this.options.animationInterval);
//     },

//     playStop: function() {
//         if (!this.stop()) {
//            this.play();
//         }
//     },

//     prev: function(e) {
//         L.DomEvent.stopPropagation(e);
//         L.DomEvent.preventDefault(e);
//         this.stop();
//         this.showFrame(this.animationPosition - 1);
//         return
//     },

//     startstop: function(e) {
//         L.DomEvent.stopPropagation(e);
//         L.DomEvent.preventDefault(e);
//         this.playStop()

//     },

//     next: function(e) {
//         L.DomEvent.stopPropagation(e);
//         L.DomEvent.preventDefault(e);
//         this.stop();
//         this.showFrame(this.animationPosition + 1);
//         return
//     },

//     onRemove: function (map) {
//         // Nothing to do here
//     }
// });

// L.control.rainviewer = function (opts) {
//     return new L.Control.Rainviewer(opts);
// }



// var rainviewer = L.control.rainviewer({
//     position: 'bottomleft',
//     nextButtonText: '>',
//     playStopButtonText: 'Start/Stop',
//     prevButtonText: '<',
//     positionSliderLabelText: "Time:",
//     opacitySliderLabelText: "Opacity:",
//     animationInterval: 500,
//     opacity: 0.5
// });
// rainviewer.addTo(map);

