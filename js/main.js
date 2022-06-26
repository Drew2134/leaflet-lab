function createMap() {
    const MAP = L.map('viewDiv', {
        center: [39.8283, -98.5795],
        zoom: 4
    });

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy OpenStreetMap"
    }).addTo(MAP);

    getData(MAP)
};

function getData(map){
    $.ajax("data/MLBStadiumsData.geojson", {
        dataType: "json",
        success: function(response){
            
            L.geoJson(response, {
                pointToLayer: function (feature, latlng){
                    if (feature.properties.conference == "National League") {
                        var geojsonMarkerOptions = {
                            radius: 8,
                            fillColor: "blue",
                            color: "#000",
                            weight: 1,
                            opacity: 1,
                            fillOpacity: 0.8
                        };
                    }
                    else {
                        var geojsonMarkerOptions = {
                            radius: 8,
                            fillColor: "red",
                            color: "#000",
                            weight: 1,
                            opacity: 1,
                            fillOpacity: 0.8
                        };
                    };
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
        }
    });
};

$(document).ready(createMap);