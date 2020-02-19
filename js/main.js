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

//function to convert markers to circle markers
function pointToLayer(feature, latlng){
    // Determine which attribute to visualize with proportional symbols
    var attribute = "2018 Acres Burned";
    var attribute2 = "2018 Number of Fires";

    //create marker options
    var options = {
        radius: 8,
        fillColor: "#990000",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string starting with state
    var popupContent = "<p><b>State:</b> " + feature.properties.State + "</p>";

    //add formatted attribute to popup content string
    var year = attribute.split(" ")[0];
    popupContent += "<p><b>Acres burned in " + year + ":</b> " + feature.properties[attribute] + " acres</p>";
    var year = attribute2.split(" ")[0];
    popupContent += "<p><b>Number of Fires in " + year + ":</b> " + feature.properties[attribute2];

    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,(-options.radius)/2) 
    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

// Add circle markers for point features to the map
function createPropSymbols(data){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: pointToLayer
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