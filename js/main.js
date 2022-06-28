//function to convert default point markers to circle markers
function pointToLayer(feature, latlng) {
    var attribute = "yr2021";

    //generic marker options consistent to every feature
    var geojsonMarkerOptions = {
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    var attValue = Number(feature.properties[attribute]);

    //call radius and color functions to populate marker options
    geojsonMarkerOptions.radius = calcPropRadius(attValue);
    geojsonMarkerOptions.fillColor = calcSymbolColor(feature.properties.conference)

    //create marker with calculated options
    var teamMarker = L.circleMarker(latlng, geojsonMarkerOptions);

    var team = feature.properties.Team;
    var teamLogo = "img/" + team.replace(/ /g, "_") + ".png";

    //build html content for popup
    var popupContent = "<p>" + team + "</p>";

    //build html content for info panel
    var fieldName = Object.keys(feature.properties);
    var fieldValue = Object.values(feature.properties);
    var panelTable = "<table>"

    for(let i=0; i < fieldName.length; i++) {
        if(fieldName.toString().startsWith("yr")) {
            fieldName.slice(2);
            fieldValue = fieldValue.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
        }
        
        
        panelTable += "<tr><th>" + fieldName[i] + "</th><td>" + fieldValue[i] + "</td></tr>";
    };

    panelTable += "</table>";
    
    var panelNotes = "<p>*franchise values are estimates in millions";
    var panelContent = "<figure><img src='" + teamLogo + "' alt='" + team + " logo' style='width:75px; height:75px;'><figcaption style='color:gray; font-style:italic; font-size:12;'>Credit: SportsLogos.net</figcaption></figure>" + panelTable + panelNotes;

    //bind popup event to marker
    teamMarker.bindPopup(popupContent, {
        offset: new L.Point(0, -geojsonMarkerOptions.radius),
        maxWidth: "auto"
    });

    teamMarker.on({
        mouseover: function() {
            this.openPopup();
        },
        mouseout: function() {
            this.closePopup();
        },
        click: function() {
            $("#panel").html(panelContent);
        }
    });

    return teamMarker;
}

//function to grab the matching color based on team conference
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