let startLayer = L.tileLayer.provider("OpenTopoMap")

let map = L.map("map", {
    center: [30, 0],
    zoom: 2,
    layers: [
        startLayer
    ]
});

let circleGroup = L.featureGroup().addTo(map);

L.control.layers({
    "OpenTopoMap": startLayer,
    "OpenStreetMap.Mapnik": L.tileLayer.provider("OpenStreetMap.Mapnik"),
    "OpenStreetMap.BZH": L.tileLayer.provider("OpenStreetMap.BZH"),
    "OpenStreetMap.HOT": L.tileLayer.provider("OpenStreetMap.HOT"),
    "OpenStreetMap.DE": L.tileLayer.provider("OpenStreetMap.DE"),
    "OpenStreetMap.France": L.tileLayer.provider("OpenStreetMap.France"),
    "OpenStreetMap.CH": L.tileLayer.provider("OpenStreetMap.CH"),
    "Thunderforest.SpinalMap": L.tileLayer.provider("Thunderforest.SpinalMap"),
    "OpenMapSurfer.Roads": L.tileLayer.provider("OpenMapSurfer.Roads")

}, {
    "Thematische Darstellung": circleGroup
}).addTo(map);



//L.marker([0,0]).addTo(map);
let drawCircles = function () {
    let data = CONFIRMED;
    let header = CONFIRMED[0];
    let index = document.querySelector("#slider").value;
    let options =document.querySelector("#pulldown").options;
    let value = options[options.selectedIndex].value;
    let label = options[options.selectedIndex].text;
    let color;
    //console.log(value,label,options);

    if(value === "confirmed"){
        data = CONFIRMED;
        color = "#0074D9";
    }else if (value === "deaths") {
        data = DEATHS;
        color ="#B10DC9";
    }else {
        data = RECOVERED;
        color ="#2ECC40"
    }


    //Datum anzeigen
    document.querySelector("#datum").innerHTML = `am ${header[index]} - ${label}`;
    
    circleGroup.clearLayers();

    for (let i = 1; i < data.length; i++) {
        let row = data[i];

        //console.log(row[2],row[3]);
        let reg = `${row[0]} ${row[1]}`;
        let lat = row[2];
        let lng = row[3];
        let val = row[index];
        // let mrk = L.marker([lat,lng]).addTo(map);
        // mrk.bindPopup(`${reg}: ${val}`);


        // A = r2 * PI
        // r = WURZEL (A/PI)
        let s = 0.25;
        let r = Math.sqrt(val * s / Math.PI);
        let circle = L.circleMarker([lat, lng], {
            radius: r,
            color: color
        }).addTo(circleGroup);
        circle.bindPopup(`${reg}: ${val}`);
    }
};

document.querySelector("#pulldown").onchange = function () {
    drawCircles();

};

let slider =document.querySelector("#slider");
slider.min = 4; 
slider.max = CONFIRMED[0].length -1;
slider.step = 1;
slider.value = slider.max;

slider.onchange = function(){
    drawCircles();
}

drawCircles();
//drawCircles(RECOVERED);
//drawCircles(DEATHS);
