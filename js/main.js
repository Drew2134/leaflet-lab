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
            
            var allMLB = L.geoJson(response);

            var american = L.geoJson(response, {
                filter: function(feature, layer) {
                    return feature.properties.conference == "American League";
                },
                pointToLayer: function(feature, latlng) {
                    //generate icon image url based on team name
                    let intIconUrl = "img/" + feature.properties.Team.replace(/ /g, "_") + ".png";
                    
                    //create map icons using generated icon url
                    let mapIcon = L.icon({
                        iconUrl: intIconUrl,
                        iconSize: [60, 60],
                        iconAnchor: [25, 25]
                    });

                    //generate popup content from feature properties
                    let popupContent;
                    for (const property in feature.properties) {
                        popupContent += property
                    }

                    return L.marker(latlng, {icon: mapIcon}).bindPopup(popupContent);
                }
            }).addTo(MAP);

            var national = L.geoJson(response, {
                filter: function(feature, layer) {
                    return feature.properties.conference == "National League";
                },
                pointToLayer: function(feature, latlng) {
                    //generate icon image url based on team name
                    let intIconUrl = "img/" + feature.properties.Team.replace(/ /g, "_") + ".png";
                    
                    //create map icons using generated icon url
                    let mapIcon = L.icon({
                        iconUrl: intIconUrl,
                        iconSize: [60, 60],
                        iconAnchor: [25, 25]
                    });

                    //generate popup content from feature properties
                    let popupContent;
                    for (const property in feature.properties) {
                        popupContent += property
                    }

                    return L.marker(latlng, {icon: mapIcon}).bindPopup(popupContent);
                }
            }).addTo(MAP);

            $("NL").click(function() {
                map.addLayer(national);
                map.removeLayer(american);
            });
            $("AL").click(function() {
                map.addLayer(american);
                map.removeLayer(national);
            });
            $("MLB").click(function() {
                map.addLayer(national);
                map.addLayer(american);
            });
        }
    });
};

$(document).ready(createMap);