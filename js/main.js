$(document).ready(createMap);

//function to generate map and view with OSM tiles
function createMap() {
    //tie map to viewDiv in HTML. Set center to center of U.S. and zoom of 5
    const MAP = L.map("viewDiv", {
        center: [39.8283, -98.5795],
        zoom: 4
    });

    //link to humanitarian style OSM tiles and add to map
    const HUMAN_BASE = L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
        minZoom: 4,
        maxZoom: 19,
        attribution: "&copy OpenStreetMap"
    }).addTo(MAP);

    //link to dark gray basemap
    const DARK = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png", {
        minZoom: 4,
        maxZoom: 19,
        attribution: "&copy OpenStreetMap &copy CARTO"
    });
    
    //add layer control widget to map
    var layerControl = L.control.layers().addTo(MAP);
    //add basemap layers to BaseLayer section of layer control widget
    layerControl.addBaseLayer(HUMAN_BASE, "Humanitarian");
    layerControl.addBaseLayer(DARK, "Dark");
    //listen for basemap change
    MAP.on("baselayerchange", function(event) {
        //change map title background depending on basemap
        if (event.name == "Humanitarian") {
            $("#infoText")[0].style.backgroundColor = "rgba(0, 0, 0, 0.35)";
        } else if (event.name == "Dark") {
            $("#infoText")[0].style.backgroundColor = "rgba(255, 255, 255, 0.35)";
        }
    });

    //add time slider widget
    L.control.timelineSlider({
        timelineItems: ["2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021"],
        extraChangeMapParams: {
            //pass layerControl variable as additional param to updatePropSymbols
            layerControl: layerControl
        },
        //call updatePropSymbols every time slider moves
        changeMap: updatePropSymbols
    })
    .addTo(MAP);

    //call initial data gather function for symbols
    getData(MAP, layerControl);

    //call function to add map title
    addMapTitle(MAP);
};

//function to import MLB geoJSON data
function getData(map, layerControl) {
    $.ajax("data/MLBStadiumsData.geojson", {
        dataType: "json",
        success: function(response) {
            //call functions to create proportional symbol layers
            createNLSymbols(response, map, layerControl);
            createALSymbols(response, map, layerControl);
        }
    });
};

//function to add circle markers for NL teams
function createNLSymbols(data, map, layerControl) {
    const NL_LAYER = L.geoJson(data, {
        pointToLayer: pointToLayer,
        filter: pullNLTeams
    }).addTo(map);

    //add NL layer to Overlay section of layer control widget
    layerControl.addOverlay(NL_LAYER, "National League");
};

//function to add circle markers for AL teams
function createALSymbols(data, map, layerControl) {
    const AL_LAYER = L.geoJson(data, {
        pointToLayer: pointToLayer,
        filter: pullALTeams
    }).addTo(map);

    //add AL layer to Overlay section of layer control widget
    layerControl.addOverlay(AL_LAYER, "American League");
};

//filter function for getting NL teams
function pullNLTeams(feature) {
    if (feature.properties.Conference == "National League") {
        return true;
    }
};

//filter function for getting AL Teams
function pullALTeams(feature) {
    if (feature.properties.Conference == "American League") {
        return true;
    }
};

//function to convert default point markers to circle markers
function pointToLayer(feature, latlng) {
    //generic marker options consistent to every feature
    var geojsonMarkerOptions = {
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    var attribute = "2012";
    var attValue = Number(feature.properties[attribute]);

    //call radius and color functions to populate marker options
    geojsonMarkerOptions.radius = calcPropRadius(attValue);
    geojsonMarkerOptions.fillColor = calcSymbolColor(feature.properties.Conference)

    //create marker with calculated options
    var teamMarker = L.circleMarker(latlng, geojsonMarkerOptions);

    var team = feature.properties.Team;
    var teamLogo = "img/" + team.replace(/ /g, "_") + ".png";
    var teamValue = feature.properties[attribute];

    //build html content for popup
    var popupContent = "<p><b>" + team + "<br> 2012 Value: </b>$" + teamValue.toLocaleString() + "M</p>";

    //build html content for info panel
    var fieldName = Object.keys(feature.properties);
    var fieldValue = Object.values(feature.properties);

    //create html table with team details
    var panelTable = "<table id='infoTable'>"
    for(let i=0; i < fieldName.length; i++) {
        //find value fields and format numbers
        if(fieldName[i].toString().startsWith("20")) {
            fieldValue[i] = "$" + fieldValue[i].toLocaleString();
        }
        //add data to row and add row to table
        panelTable += "<tr><th>" + fieldName[i] + "</th><td>" + fieldValue[i] + "</td></tr>";
    };
    panelTable += "</table>";
    
    var panelNotes = "<p>*franchise values are estimates in millions";
    var panelContent = "<img id='logo' src='" + teamLogo + "' alt='" + team + " logo'><p style='color:gray; font-style:italic; font-size:12;'>Credit: SportsLogos.net</p>" + panelTable + panelNotes;

    //bind popup event to marker
    teamMarker.bindPopup(popupContent, {
        offset: new L.Point(0, -geojsonMarkerOptions.radius)
    });

    //event listeners for points
    teamMarker.on({
        mouseover: function() {
            this.openPopup();
        },
        mouseout: function() {
            this.closePopup();
        },
        click: function() {
            $("#panel").html(panelContent);
            $("#panel")[0].style.display = "block";
            let mapCenter = ($("#viewDiv")[0].offsetWidth / 2).toString() + "px";
            $("#infoText")[0].style.left = mapCenter;
            $("#infoText")[0].style.transform = "translateX(-50%)";
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

//function to update proportial symbols when time slider changes
function updatePropSymbols() {
    let year = mapParams.label;
    mapParams.map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[year]){
            let props = layer.feature.properties;

            var radius = calcPropRadius(props[year]);
            layer.setRadius(radius);

            var popupContent = "<p><b>" + props.Team + "<br>" + year + " Value: </b>$" + props[year].toLocaleString() + "M</p>";

            layer.bindPopup(popupContent, {
                offset: new L.Point(0, -radius)
            });
        };
    });
}

//add a custom map control to hold div with map title
function addMapTitle(map) {
    L.Control.textbox = L.Control.extend({
		onAdd: function(map) {
			
		var text = L.DomUtil.create('div');
		text.id = "infoText";
		text.innerHTML = "<b>MLB Franchise Values</b>"
		return text;
		},

		onRemove: function(map) {
			// Nothing to do here
		}
	});
	L.control.textbox = function(opts) { return new L.Control.textbox(opts);}
	L.control.textbox({ position: 'topleft' }).addTo(map);
}

//watch for window resize so map title stays centered
window.onresize = function(event) {
    let mapCenter = ($("#viewDiv")[0].offsetWidth / 2).toString() + "px";
    $("#infoText")[0].style.left = mapCenter;
}