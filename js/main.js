//function to convert default point markers to circle markers
function pointToLayer(feature, latlng) {
    var attribute = "yr2021";

    var geojsonMarkerOptions = {
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    var attValue = Number(feature.properties[attribute]);

    geojsonMarkerOptions.radius = calcPropRadius(attValue);
    geojsonMarkerOptions.color = calcSymbolColor(feature.properties.conference)

    var teamMarker = L.circleMarker(latlng, geojsonMarkerOptions);

    var popupContent;

    teamMarker.bindPopup(popupContent);
    
    return teamMarker;
}

function calcSymbolColor(conference) {
    switch(conference) {
        case "National League":
            return "blue";
        case "American League":
            return "red";
    };
};

//function to calculate proportional symbol radius
function calcPropRadius(attValue) {
    var scaleFactor = .5;
    var area = attValue * scaleFactor;
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

//function to add circle markers to map
function createPropSymbols(data, map) {
    L.geoJson(data, {
        pointToLayer: pointToLayer
    }).addTo(map);
};

//function to import MLB geoJSON data
function getData(map){
    $.ajax("data/MLBStadiumsData.geojson", {
        dataType: "json",
        success: function(response){

            //call function to create proportional symbols
            createPropSymbols(response, map);
        }
    });
};

//function to generate map and view with openstreetmap tile
function createMap() {
    //tie map to viewDiv in HTML. Set center to center of U.S. and zoom of 4
    const MAP = L.map('viewDiv', {
        center: [39.8283, -98.5795],
        zoom: 4
    });

    //link to humanitarian style OSM tiles
    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy OpenStreetMap"
    }).addTo(MAP);

    //call function to get MLB data
    getData(MAP)
};

$(document).ready(createMap);

//CREDIT FOR TEAM LOGOS: SportsLogos.net