let startLayer = L.tileLayer.provider("OpenTopoMap")

let map = L.map("map", {
    center: [0, 0],
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
    for (let i = 1; i < data.length; i++) {
        let row = data[i];
        //console.log(row[2],row[3]);
        let reg = `${row[0]} ${row[1]}`;
        let lat = row[2];
        let lng = row[3];
        let val = row[row.length - 1];
        // let mrk = L.marker([lat,lng]).addTo(map);
        // mrk.bindPopup(`${reg}: ${val}`);


        // A = r2 * PI
        // r = WURZEL (A/PI)
        let s = 0.25;
        let r = Math.sqrt(val * s / Math.PI);
        let circle = L.circleMarker([lat, lng], {
            radius: r
        }).addTo(circleGroup);
        circle.bindPopup(`${reg}: ${val}`);
    }
};

drawCircles();
//drawCircles(RECOVRED);
//drawCircles(DEATHS);
