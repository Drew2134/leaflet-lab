//function to add circle markers to map
function createPropSymbols(data, map) {
    var attribute = "yr2021";

    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            var attValue = Number(feature.properties[attribute]);

            console.log(feature.properties, attValue);

            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
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