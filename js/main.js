// Map of GeoJSON data from StatesFireData.geojson */

//declare map var in global scope
var map;
var minValue;

//Step 1: function to instantiate the Leaflet map
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

function calcMinValue(data){
     
    //create empty array to store all data values
    var allValues = [];
    
    //loop through each state
    for(var state of data.features){
         //loop through each year
         for(var year = 2008; year <= 2018; year+=1){
               //get acres burned for current year
              var value = state.properties[String(year) + " Acres Burned"];
              //add value to array
              allValues.push(value);
          }
    }
    
    //get minimum value of our array
    var minValue = Math.min(...allValues)
    
    minValue = 500;
    return minValue;
}

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    
    //constant factor adjusts symbol sizes evenly
    var minRadius = 1;
    
    //Flannery Appearance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius

    return radius;
};

// Add circle markers for point features to the map
function createPropSymbols(data){
    //create marker options
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#990000",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    // Determine which attribute to visualize with proportional symbols
    var attribute = "2018 Acres Burned";

    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            //For each feature, determine its value for the selected attribute
            var attValue = Number(feature.properties[attribute]);

            //Give each feature's circle marker a radius based on its attribute value
            geojsonMarkerOptions.radius = calcPropRadius(attValue);

            //examine the attribute value to check that it is correct
            //console.log(feature.properties, attValue);

            //create circle markers
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(map);
};

//Import GeoJSON data
function getData(){
    //load the data
    $.getJSON("data/StatesFireData.geojson", function(response){
        //calculate minimum data value
        minValue = calcMinValue(response);

        //call function to create proportional symbols
        createPropSymbols(response);
    });
};

//function to retrieve the data and place it on the map
function getDataOld(){
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
                return L.circleMarker(latlng, geojsonMarkerOptions);
                //return L.marker(latlng, {icon: fireIcon});
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