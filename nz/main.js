let latitude = document.querySelector('div[data-lat]').attributes[1].value;
let longitude = document.querySelector('div[data-lng]').attributes[2].value;
let title = document.querySelector('div[data-title]').attributes[3].value

//let map = document.querySelector("#map");

var mymap = L.map('map').setView([latitude, longitude], 13);

L.tileLayer.provider("OpenTopoMap").addTo(mymap);

var marker = L.marker([latitude, longitude]).addTo(mymap);
marker.bindPopup(`<b>${title}</b>`).openPopup();