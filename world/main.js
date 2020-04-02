let startLayer = L.tileLayer.provider("OpenTopoMap")

let map = L.map("map", {
    center: [0,0],
    zoom: 2,
    layers: [
        startLayer
    ]
});

L.control.layers({
    "OpenTopoMap":startLayer,
    "OpenStreetMap.Mapnik": L.tileLayer.provider("OpenStreetMap.Mapnik"),
    "OpenStreetMap.BZH": L.tileLayer.provider("OpenStreetMap.BZH"),
    "OpenStreetMap.HOT": L.tileLayer.provider("OpenStreetMap.HOT"),
    "OpenStreetMap.DE": L.tileLayer.provider("OpenStreetMap.DE"),
    "OpenStreetMap.France": L.tileLayer.provider("OpenStreetMap.France"),
    "OpenStreetMap.CH": L.tileLayer.provider("OpenStreetMap.CH"),
    "Thunderforest.SpinalMap": L.tileLayer.provider("Thunderforest.SpinalMap"),
    "OpenMapSurfer.Roads": L.tileLayer.provider("OpenMapSurfer.Roads")
    
}).addTo(map);

L.marker([0,0]).addTo(map);

console.log(CONFIRMED);
for (let i = 1; i < CONFIRMED.length; i++) {
    let row = CONFIRMED[i];
    //console.log(row[2],row[3]);
    let val = row[row.length-1];
    let mrk = L.marker([row[2],row[3]]).addTo(map);
    mrk.bindPopup(`${row[0]} ${row[1]}: ${val}`);

    
}