
let latitude = document.querySelector('div[data-lat]').attributes[1].value;
let longitude = document.querySelector('div[data-lng]').attributes[2].value;
let title = document.querySelector('div[data-title]').attributes[3].value

let map = document.querySelector("#map");

var mymap = L.map('map').setView([latitude, longitude], 13);

L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>tributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https:/ntopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
}).addTo(mymap);

var marker = L.marker([latitude, longitude]).addTo(mymap);
marker.bindPopup(`<b>${title}</b>`).openPopup();