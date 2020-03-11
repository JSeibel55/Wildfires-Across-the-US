// Map of GeoJSON data from StatesFireData.geojson */

//declare map var in global scope
var map;
var index; //global variable for sequence index so multiple functions can access
var dataValue = "acres"; //global variable for the data that is clicked on
var dataStatsAcres = {min:10000, max:2000000, mean:750000}; //manually created values for the acres burned data
var dataStatsNumber = {min:250, max:15000, mean:7000}; // manually created values for the numbers of fires

//Function to instantiate the Leaflet map
function createMap(){
    //create the map
    myBounds = new L.LatLngBounds(new L.LatLng(60, 0), new L.LatLng(30, 0));
    map = L.map('mapid', {
        center: [38, -96],
        zoom: 4,
        minZoom: 3,
        maxZoom: 12,
        maxBounds: [[80, -180], [0, -10]],
    });

    //add OSM base tilelayer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
    }).addTo(map);

    //call getData function
    getData();
};

//Calculate the max, mean, min values of the dataset. Currently not being used as these values are hardcoded.
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
function calcPropRadius(attValue, dataValue) {  
    if(dataValue === "number"){
        var minValue = 5;  
        //constant factor adjusts symbol sizes evenly
        minRadius = .5;
        
        //Flannery Appearance Compensation formula
        var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius;

        return radius;
    }
    else {
        var minValue = 250;  
        //constant factor adjusts symbol sizes evenly
        minRadius = .5;
        
        //Flannery Appearance Compensation formula
        var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius;

        return radius;
    }
};

//Convert markers to circle markers
function pointToLayer(feature, latlng, attributes, attributes2){
    // Determine which attribute to visualize with proportional symbols
    //Assign the current attribute based on the first index of the attributes array
    var attribute = attributes[0];
    var attribute2 = attributes2[0];

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

    var popupContent = createPopupContent(feature.properties, attribute, attribute2);

    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,(-options.radius)/2) 
    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

// Add circle markers for point features to the map
function createPropSymbols(data, attributes, attributes2){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes, attributes2);
        }
    }).addTo(map);
};

// Resize proportional symbols according to new attribute values
function updatePropSymbols(attribute, attribute2, dataValue){
    map.eachLayer(function(layer){
        if(dataValue === "acres"){
            if (layer.feature ){ //&& layer.feature.properties[attribute]
                //access feature properties
                var props = layer.feature.properties;
    
                //update each feature's radius based on new attribute values
                var radius = calcPropRadius(props[attribute], dataValue);
                layer.setRadius(radius);
    
                var popupContent = createPopupContent(props, attribute, attribute2);
                
                //update popup content
                popup = layer.getPopup();
                popup.setContent(popupContent).update();
            };
        };
        if(dataValue === "number"){
            if (layer.feature ){ //&& layer.feature.properties[attribute]
                //access feature properties
                var props = layer.feature.properties;
    
                //update each feature's radius based on new attribute values
                var radius = calcPropRadius(props[attribute2], dataValue);
                layer.setRadius(radius);
    
                var popupContent = createPopupContent(props, attribute, attribute2);
                
                //update popup content
                popup = layer.getPopup();
                popup.setContent(popupContent).update();
            };
        };
    });
};

// Creates text for the popups in the prop symbols
function createPopupContent(properties, attribute, attribute2){
    //add city to popup content string
    var popupContent = "<p style='font-size: 20px'><b>" + properties.State + "</b></p>";

    //add formatted attribute to panel content string
    var year = attribute.split(" ")[0];
    popupContent += "<p><b>" + properties[attribute] + "</b>: Acres Burned in <b>" + year + "</b></p>";
    popupContent += "<p><b>" + properties[attribute2] + "</b>: Number of Fires</p>";

    return popupContent;
};

// Create sequence controls on top of the map with both a step button feature and range bar
function createSequenceControls(attributes, attributes2){
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

            L.DomEvent.disableClickPropagation(container);

            return container;
        }
    });
    map.addControl(new SequenceControl());

    //create range input element (slider)
    //set slider attributes
    $('.range-slider').attr({
        max: 10,
        min: 0,
        value: 0,
        step: 1
    });

    $('#reverse').html('<img src="img/step-backward-solid.svg">');
    $('#forward').html('<img src="img/step-forward-solid.svg">');

    index = $('.range-slider').val();
     //Click listener for buttons
    $('.step').click(function(){
        //get the old index value
        index = $('.range-slider').val();

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
        updatePropSymbols(attributes[index], attributes2[index], dataValue);
        updateLegend(attributes[index], attributes2[index], dataValue);
    });

    //Input listener for slider
    $('.range-slider').on('input', function(){
        //Get the new index value
        index = $(this).val();
        updatePropSymbols(attributes[index], attributes2[index], dataValue);
        updateLegend(attributes[index], attributes2[index], dataValue);
    }); 
};

// Create widget that can toggle between looking at Acres burned in each state or numbers of fires in each state
function createDataControl(attributes, attributes2){
    var DataControl = L.Control.extend({
        options: {
            position: 'topright'
        },
        
        onAdd: function () {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'data-control-container');

            //create radio button for the two data
            $(container).append('<input type="radio" class="switch" id="acres" name="fire" value="acres" checked>Acres Burned<p></p>');
            $(container).append('<input type="radio" class="switch" id="number" name="fire" value="number">Number of Fires');

            L.DomEvent.disableClickPropagation(container);

            return container;
        }
    });
    map.addControl(new DataControl());

        //var dataValue = "acres";
         //Click listener for buttons
         $('.switch').click(function(){
    
            //Change the selected data
            if ($(this).attr('id') == 'acres'){
                dataValue = "acres";
            } else if ($(this).attr('id') == 'number'){
                dataValue = "number";
            };
    
            //Update data shown
            updatePropSymbols(attributes[index], attributes2[index], dataValue);
            updateLegend(attributes[index], attributes2[index], dataValue);
        });
}

//Update the proportional legend when the sequence button changes
function updateLegend(attribute, attribute2, dataValue) {
    if (dataValue === "acres"){
        //Update the legend title
        var legendTitle = document.getElementById("year-step");
        var year = attribute.split(" ")[0];
        legendTitle.innerHTML = "<b>Acres Burned in " + year;
        
        //Update the legend proportional symbols
        var legendSymbols = document.getElementById("attribute-legend");
        //array of circle names to base loop on
        var circles = ["max", "mean", "min"];

        var svg = "";
        //Loop to add each circle and text to svg string
        for (var i=0; i<circles.length; i++){
            //Assign the r and cy attributes
            var radius = calcPropRadius(dataStatsAcres[circles[i]], dataValue); //Manually set radius of circles
            var cy = 180 - radius;

            //circle string
            svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#990000" fill-opacity="0.8" stroke="#000000" cx="88"/>';

            //evenly space out labels
            var textY = i * 60 + 40;

            //text string
            svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStatsAcres[circles[i]]*100)/100 + " acres" + '</text>';
        };

        legendSymbols.innerHTML = svg;
    }
    else if (dataValue === "number"){
        //Update the legend title
        var legendTitle = document.getElementById("year-step");
        var year = attribute2.split(" ")[0];
        legendTitle.innerHTML = "<b>Number of Fires in " + year;
        
        //Update the legend proportional symbols
        var legendSymbols = document.getElementById("attribute-legend");
        //array of circle names to base loop on
        var circles = ["max", "mean", "min"];

        var svg = "";
        //Loop to add each circle and text to svg string
        for (var i=0; i<circles.length; i++){
            //Assign the r and cy attributes
            var radius = calcPropRadius(dataStatsNumber[circles[i]], dataValue); //Manually set radius of circles
            var cy = 180 - radius;

            //circle string
            svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#990000" fill-opacity="0.8" stroke="#000000" cx="88"/>';

            //evenly space out labels
            var textY = i * 40 + 90;

            //text string
            svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStatsNumber[circles[i]]*100)/100 + " acres" + '</text>';
        };
        legendSymbols.innerHTML = svg;
    }
}

//Create the legend of proportional symbols set to the defined max, min, mean in the "dataStats" global varaible
function createLegend(attribute){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function () {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            var year = attribute.split(" ")[0];
            $(container).append('<h2 id="year-step" ><b>Acres Burned in ' + year + '</h2>');

            //Start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="270px" height="180px">';

            //array of circle names to base loop on
            var circles = ["max", "mean", "min"];

            //Loop to add each circle and text to svg string
            for (var i=0; i<circles.length; i++){
                //Assign the r and cy attributes
                var radius = calcPropRadius(dataStatsAcres[circles[i]]); //Manually set radius of circles
                var cy = 180 - radius;

                //circle string
                svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#990000" fill-opacity="0.8" stroke="#000000" cx="88"/>';

                //evenly space out labels
                var textY = i * 60 + 40;

                //text string
                svg += '<text id="' + circles[i] + '-text" x="180" y="' + textY + '">' + Math.round(dataStatsAcres[circles[i]]*100)/100 + " acres" + '</text>';
            };

            //close svg string
            svg += "</svg>";

            //add attribute legend svg to container
            $(container).append(svg);

            L.DomEvent.disableClickPropagation(container);

            return container;
        }
    });
    map.addControl(new LegendControl());
};

//Build an attributes array from the data
function processData(data, keyword){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with acres values
        if (attribute.indexOf(keyword) > -1){
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
        var attributes = processData(response, "Acres"); // attributes = acres burned in a state
        var attributes2 = processData(response, "Number"); // attributes2 = number of fires in a state
            
        calcStats(response);
        createPropSymbols(response, attributes, attributes2);
        createSequenceControls(attributes, attributes2);
        createLegend(attributes[0]);
        createDataControl(attributes, attributes2);
    });
};

$(document).ready(createMap);