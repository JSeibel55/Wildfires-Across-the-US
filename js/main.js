// Map of GeoJSON data from StatesFireData.geojson */

//declare map var in global scope
var map;
var minValue = 250;
var dataStats = {min:10000, max:2000000, mean:750000};

//Function to instantiate the Leaflet map
function createMap(){
    //create the map
    map = L.map('mapid', {
        center: [38, -96],
        zoom: 4
    });

    //add OSM base tilelayer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
    }).addTo(map);

    //call getData function
    getData();
};

function calcStats(data){
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
    
    //get min, max, mean stats for our array
    //dataStats.max = Math.min(...allValues)
    //dataStats.max = Math.max(...allValues);

    //calculate mean
    var sum = allValues.reduce(function(a, b){return a+b;});
    //dataStats.mean = sum/ allValues.length;
}

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {    
    //constant factor adjusts symbol sizes evenly
    minRadius = .5;
    
    //Flannery Appearance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius;

    return radius;
};

//Convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    // Determine which attribute to visualize with proportional symbols
    //Assign the current attribute based on the first index of the attributes array
    var attribute = attributes[0];

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

    var popupContent = createPopupContent(feature.properties, attribute);

    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,(-options.radius)/2) 
    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

// Add circle markers for point features to the map
function createPropSymbols(data, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

// Resize proportional symbols according to new attribute values
function updatePropSymbols(attribute){
    map.eachLayer(function(layer){
        if (layer.feature ){ //&& layer.feature.properties[attribute]
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            var popupContent = createPopupContent(props, attribute);
            
            //update popup content
            popup = layer.getPopup();
            popup.setContent(popupContent).update();
        };
    });
};

// Creates text for the popups in the prop symbols
function createPopupContent(properties, attribute){
    //add city to popup content string
    var popupContent = "<p><b>State:</b> " + properties.State + "</p>";

    //add formatted attribute to panel content string
    var year = attribute.split(" ")[0];
    popupContent += "<p><b>Acres burned in " + year + ":</b> " + properties[attribute] + " acres</p>";

    return popupContent;
};

// Create new sequence controls
function createSequenceControls(attributes){
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function () {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            //create range input element (slider)
            $(container).append('<input class="range-slider" type="range">');

            //add skip buttons
            $(container).append('<button class="step" id="reverse" title="Reverse">Reverse</button>');
            $(container).append('<button class="step" id="forward" title="Forward">Forward</button>');

            return container;
        }
    });
    map.addControl(new SequenceControl());

    //create range input element (slider)
    // $('#panel').append('<input class="range-slider" type="range">');

    //set slider attributes
    $('.range-slider').attr({
        max: 10,
        min: 0,
        value: 0,
        step: 1
    });

    // $('#panel').append('<button class="step" id="reverse">Reverse</button>');
    // $('#panel').append('<button class="step" id="forward">Forward</button>');
    $('#reverse').html('<img src="img/step-backward-solid.svg">');
    $('#forward').html('<img src="img/step-forward-solid.svg">');

    var index = $('.range-slider').val();
     //Click listener for buttons
    $('.step').click(function(){
        //get the old index value
        var index = $('.range-slider').val();

        //Increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //If past the last attribute, wrap around to first attribute
            index = index > 10 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //If past the first attribute, wrap around to last attribute
            index = index < 0 ? 10 : index;
        };

        //Update slider
        $('.range-slider').val(index);
        console.log(attributes[index]);
        updatePropSymbols(attributes[index]);
        updateLegend(attributes[index]);
    });

    //Input listener for slider
    $('.range-slider').on('input', function(){
        //Get the new index value
        var index = $(this).val();
        console.log(attributes[index]);
        updatePropSymbols(attributes[index]);
        updateLegend(attributes[index]);
    }); 
};

function updateLegend(attribute) {
    var legend = document.getElementById("year-step");
    var year = attribute.split(" ")[0];
    legend.innerHTML = "<b>Acres burned in " + year;
}

function createLegend(attribute){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function () {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            var year = attribute.split(" ")[0];
            $(container).append('<p id="year-step" style="font-size: 15px"><b>Acres burned in ' + year + '</p>');

            //Start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="270px" height="180px">';

            //array of circle names to base loop on
            var circles = ["max", "mean", "min"];

            //Loop to add each circle and text to svg string
            for (var i=0; i<circles.length; i++){
                //Assign the r and cy attributes
                var radius = calcPropRadius(dataStats[circles[i]]);
                var cy = 180 - radius;

                //circle string
                svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#990000" fill-opacity="0.8" stroke="#000000" cx="88"/>';

                //evenly space out labels
                var textY = i * 60 + 40;

                //text string
                svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " acres" + '</text>';
            };

            //close svg string
            svg += "</svg>";

            //add attribute legend svg to container
            $(container).append(svg);

            console.log(dataStats.max, dataStats.min, dataStats.mean)

            return container;
        }
    });
    map.addControl(new LegendControl());

    //updateLegend(attribute[0]);
};

//Build an attributes array from the data
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with acres values
        if (attribute.indexOf("Acres") > -1){
            attributes.push(attribute);
        };
    };

    return attributes;
};

//Import GeoJSON data
function getData(map){
    //load the data
    $.getJSON("data/StatesFireData.geojson", function(response){
        //create an attributes array
        var attributes = processData(response);
            
        calcStats(response);
        createPropSymbols(response, attributes);
        createSequenceControls(attributes);
        createLegend(attributes[0]);
    });
};

$(document).ready(createMap);