const drawHelper = new DrawHelper(viewer);
const toolbar = drawHelper.addToolbar(document.getElementById('toolbar'), {
    buttons: ['extent']
});
const getGeometryQuery = `PREFIX geo: <http://www.opengis.net/ont/geosparql#>
select ?geom
where {
    ?s ?p ?geom .

    filter (?s= <%s>)
    . filter (datatype(?geom) = geo:wktLiteral)
}`;

let extentPrimitive = new DrawHelper.ExtentPrimitive({
    extent: new Cesium.Rectangle(0, 0, 0, 0),
    material: new Cesium.Material({
        fabric: {
            type: 'Color',
            uniforms: {
                color: new Cesium.Color(0.27, 0.53, 0.73, 0.5)
            }
        }
    })
});
viewer.scene.primitives.add(extentPrimitive);
extentPrimitive.setEditable();

const submitBtn = document.getElementById('submitExtent');

toolbar.addListener('extentCreated', function(event) {
    const extent = event.extent;
    extentPrimitive.setExtent(extent);
    submitBtn.disabled = false;
    submitBtn.style.visibility = 'visible';
});

extentPrimitive.addListener('onEdited', function() {
    submitBtn.disabled = false;
    submitBtn.style.visibility = 'visible';
});

submitBtn.addEventListener('click', function() {
    const upperleft = [extentPrimitive.extent.west, extentPrimitive.extent.north];
    const lowerright = [extentPrimitive.extent.east, extentPrimitive.extent.south];
    const upperright = [extentPrimitive.extent.east, extentPrimitive.extent.north];
    const lowerleft = [extentPrimitive.extent.west, extentPrimitive.extent.south];

    const bbox = [upperleft, upperright, lowerright, lowerleft, upperleft];
    const wkt = polygonToWKT(bbox);

    const query = buildQuery(wkt);

    if (query !== '') {
        auth.prompt().then(function() {
            SparQLQuery(SparQLServer, query).then(function(data) {
                const geometries = filterGeometries(data.results.bindings);
            });
        });
    }

    submitBtn.disabled = true;
    submitBtn.style.visibility = 'hidden';
});

toolbar.addListener('removeDrawed', function() {
    extentPrimitive.setExtent(new Cesium.Rectangle(0, 0, 0, 0));
});

function filterGeometries(data) {
    for (let i in data) {
        if (data[i].property.value === 'http://www.opengis.net/ont/geosparql#hasGeometry') {
            const query = vsprintf(getGeometryQuery, data[i].value.value);
            auth.prompt().then(function() {
                SparQLQuery(SparQLServer, query).then(function(data) {
                    drawGeometry(data.results.bindings[0].geom.value);
                });
            });
        }
    }
}

const drawnGeometries = new Cesium.Entity({
    name: 'drawn',
    show: true
});

function drawGeometry(geom) {
    geom = removeZ(geom);
    const wkt = new Wkt.Wkt();
    wkt.read(geom);
    let geojson = wkt.toJson();

    geojson = reprojectGeometry(geojson, 'EPSG:28992', 'EPSG:4326');

    const source = new Cesium.GeoJsonDataSource();

    source
        .load(geojson, {
            fill: defaultColor,
            clampToGround: true
        })
        .then(function() {
            for (let entity of source.entities.values) {
                if (typeof entity.billboard !== 'undefined') {
                    viewer.entities.add({
                        parent: drawnGeometries,
                        position: entity.position,
                        billboard: entity.billboard,
                        description: loadingDescription
                    });
                } else if (typeof entity.polygon !== 'undefined') {
                    viewer.entities.add({
                        parent: drawnGeometries,
                        polygon: entity.polygon,
                        description: loadingDescription
                    });
                }
            }
            viewer.scene.requestRender();
        });
}
