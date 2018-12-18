const zoomToRD = function(x, y) {
    x = parseFloat(x);
    y = parseFloat(y);
    const wgs = proj4('EPSG:28992', 'EPSG:4326', [x, y]);
    const destination = Cesium.Cartesian3.fromDegrees(wgs[0], wgs[1], 300);
    viewer.camera.setView({ destination: destination });
};

const otlDict = {
    overbrugging: 'otl:OB00428',
    onderdoorgang: 'otl:OB00425',
    ponton: 'otl:OB01647'
};

queryButton.addEventListener('click', function() {
    const x = document.getElementById('queryResults');
    x.style.display = 'block';
    const query = `PREFIX otl: <http://otl.rws.nl/otl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX geo: <http://www.opengis.net/ont/geosparql#>
    PREFIX diskschema: <http://www.rijkswaterstaat.nl/linked_data/schema/disk/>

    select ?beheerobject ?label ?geometryWKT
    where {
        ?objectdeel a ${otlDict[querySelect.value]} ;
         diskschema:objectdeel_beheerobject ?beheerobject .

        ?beheerobject rdfs:label ?label .

        ?beheerobject geo:hasGeometry ?geometry .

        ?geometry geo:asWKT ?geometryWKT .
    } limit 10`;

    if (query !== '') {
        auth.prompt().then(function() {
            SparQLQuery(SparQLServer, query, true).then(function(results) {
                let resultsHTML = '';
                for (const result of results.results.bindings) {
                    const label = result.label.value;
                    const wkt = result.geometryWKT.value;
                    const coordinates = wktToCoord(wkt);

                    resultsHTML += `<button onClick="zoomToRD(${coordinates.x},${
                        coordinates.y
                    })">${label}</button> <br>`;
                }
                const div = document.getElementById('queryResults');
                div.innerHTML = resultsHTML;
            });
        });
    }
});
