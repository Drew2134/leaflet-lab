const MAP = L.map('viewDiv').setView([39.8283, -98.5795], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy OpenStreetMap'
}).addTo(MAP)

$.ajax("data/MLDStadiumsData.geojson", {
    dataType: "json",
    success: function(response) {
        L.geoJson(response).addTo(MAP);
    }
});