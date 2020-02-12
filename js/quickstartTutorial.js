// .map= initialize the map on the "map" div with a given center and zoom
// .setView= sets the view of the map (geographical center and zoom) 
var mymap = L.map('mapid').setView([51.505, -0.09], 13);

// .tileLayer= load and display tile layers on the map
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    accessToken: "pk.eyJ1IjoianNlaWJlbDU1IiwiYSI6ImNrNmpxc3pzYTAwZXIzanZ4Nm5scHAzam0ifQ.5NLBHlevG0PL-E13Yax9NA"
}).addTo(mymap); // .addTo= displays previous function output to the map div

// .marker= display clickable/draggable icons on the map
var marker = L.marker([51.5, -0.09]).addTo(mymap);

// .circle= draws a circle overlay on a map
var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(mymap);

// .polygon= draws a polygon overlay on a map
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(mymap);

// .bindPopup= bind a popup to feature
// .openPopup= opens the popup on default
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

var popup = L.popup()
    .setLatLng([51.5, -0.09]) // setLatLng= sets the lat and lon of the popup
    .setContent("I am a standalone popup.") //setContent= sets the description of the marker
    .openOn(mymap); // .openOn= sets the default to open when map does

// function onMapClick(e) {
//     alert("You clicked the map at " + e.latlng);
// }

// mymap.on('click', onMapClick);

var popup = L.popup();

// onMapClick(e)= when the map is clicked on, event happens
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mymap);
}

// .on= waits for certain event, then does an action
mymap.on('click', onMapClick);