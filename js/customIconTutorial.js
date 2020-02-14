// .map= initialize the map on the "map" div with a given center and zoom
// .setView= sets the view of the map (geographical center and zoom) 
var map = L.map('mapid').setView([51.505, -0.09], 13);

// .tileLayer= load and display tile layers on the map
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    accessToken: "pk.eyJ1IjoianNlaWJlbDU1IiwiYSI6ImNrNmpxc3pzYTAwZXIzanZ4Nm5scHAzam0ifQ.5NLBHlevG0PL-E13Yax9NA"
}).addTo(map); // .addTo= displays previous function output to the map div

// var greenIcon = L.icon({
//     iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-green.png',
//     shadowUrl: 'https://leafletjs.com/examples/custom-icons/leaf-shadow.png',

//     iconSize:     [38, 95], // size of the icon
//     shadowSize:   [50, 64], // size of the shadow
//     iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
//     shadowAnchor: [4, 62],  // the same for the shadow
//     popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
// });

// L.marker([51.5, -0.09], {icon: greenIcon}).addTo(map);

var LeafIcon = L.Icon.extend({
    options: {
        shadowUrl: 'https://leafletjs.com/examples/custom-icons/leaf-shadow.png',
        iconSize:     [38, 95],
        shadowSize:   [50, 64],
        iconAnchor:   [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor:  [-3, -76]
    }
});

var greenIcon = new LeafIcon({iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-green.png'}),
    redIcon = new LeafIcon({iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-red.png'}),
    orangeIcon = new LeafIcon({iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-orange.png'});

L.icon = function (options) {
    return new L.Icon(options);
};

L.marker([51.5, -0.09], {icon: greenIcon}).addTo(map).bindPopup("I am a green leaf.");
L.marker([51.495, -0.083], {icon: redIcon}).addTo(map).bindPopup("I am a red leaf.");
L.marker([51.49, -0.1], {icon: orangeIcon}).addTo(map).bindPopup("I am an orange leaf.");