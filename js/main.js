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

//function to pull MLB geoJSON data and style the points
function getData(map){
    $.ajax("data/MLBStadiumsData.geojson", {
        dataType: "json",
        success: function(response){
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "white",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            
            L.geoJson(response, {
                pointToLayer: function (feature, latlng){
                    //generate icon image url based on team name
                    var intIconUrl = "img/" + feature.properties.Team.replace(" ", "_") + ".png";
                    var mapIcon = L.icon({
                        iconUrl: intIconUrl,
                        iconSize: [50, 50],
                        iconAnchor: [25, 25]
                    });
                    
                    //determine marker color based on conference
                    /*if (feature.properties.conference == "National League") {
                        geojsonMarkerOptions.fillColor = "blue"
                    }
                    else {
                        geojsonMarkerOptions.fillColor = "red"
                    };*/

                    //generate popup content from feature properties
                    var popupContent;
                    for (const property in feature.properties) {
                        popupContent += property
                    }

                    return L.marker(latlng, {icon: mapIcon}).bindPopup(popupContent);
                }
            }).addTo(map);
        }
    });
};

$(document).ready(createMap);