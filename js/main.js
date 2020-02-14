/* Map of GeoJSON data from StatesFireData.geojson */
//declare map var in global scope
var map;

//function to instantiate the Leaflet map
function createMap(){
    //create the map
    map = L.map('mapid', {
        center: [40, -95],
        zoom: 4.5
    });

    //add OSM base tilelayer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
    }).addTo(map);

    //call getData function
    getData();
};

//function to retrieve the data and place it on the map
function getData(){
    //load the data
    $.getJSON("data/StatesFireData.geojson", function(response){
        //create marker options
        var geojsonMarkerOptions = {
            radius: 5,
            fillColor: "#990000",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };

        //create custom icon
        var fireIcon = L.icon({
            iconUrl: 'img/fire.png',

            iconSize:     [60, 70], // size of the icon
            iconAnchor:   [25, 50], // point of the icon which will correspond to marker's location
            popupAnchor:  [-2, -50] // point from which the popup should open relative to the iconAnchor
        });

        //create a Leaflet GeoJSON layer and add it to the map
        L.geoJson(response, {
            pointToLayer: function (feature, latlng){
                //return L.circleMarker(latlng, geojsonMarkerOptions);
                return L.marker(latlng, {icon: fireIcon});
            },
            onEachFeature: function onEachFeature(feature, layer) {
                //no property named popupContent; instead, create html string with all properties
                var popupContent = "";
                if (feature.properties) {
                    //loop to add feature property names and values to html string
                    for (var property in feature.properties){
                        popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
                    }
                    layer.bindPopup(popupContent);
                };
            }
        }).addTo(map);
    });
};

$(document).ready(createMap);