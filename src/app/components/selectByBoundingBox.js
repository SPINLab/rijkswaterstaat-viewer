const drawHelper = new DrawHelper(viewer);
const toolbar = drawHelper.addToolbar(document.getElementById('toolbar'), {
    buttons: ['extent']
});
clearDrawn = document.getElementById('clear-drawn');
const submitBtn = document.getElementById('submitExtent');

const buildBoundingBoxQuery = function(wkt) {
    let graphs = '';
    if (diskToggle.checked === true) {
        graphs += 'from <http://www.rijkswaterstaat.nl/linked_data/disk/> ';
    }
    if (kerngisToggle.checked === true) {
        graphs += 'from <http://www.rijkswaterstaat.nl/linked_data/kerngis/> ';
    }
    if (ultimoToggle.checked === true) {
        graphs += 'from <http://www.rijkswaterstaat.nl/linked_data/ultimo/> ';
    }

    let query = '';
    if (graphs.length === 0) {
        entity.description = 'No databases selected to query..';
        return query;
    }

    query = `PREFIX geo: <http://www.opengis.net/ont/geosparql#>
    PREFIX geof: <http://www.opengis.net/def/function/geosparql/>

    select ?subject ?geometryWKT
    ${graphs}
    where {
    ?subject geo:hasGeometry/geo:asWKT ?geometryWKT .

    FILTER (
    geof:sfWithin(?geometryWKT, '''
    ${wkt}
    '''^^geo:wktLiteral))
    }`;

    return query;
};

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

    const query = buildBoundingBoxQuery(wkt);

    if (query !== '') {
        auth.prompt().then(function() {
            SparQLQuery(SparQLServer, query, true).then(function(data) {
                drawGeometries(data.results.bindings);
            });
        });
    }

    clearDrawn.click();

    submitBtn.disabled = true;
    submitBtn.style.visibility = 'hidden';
});

toolbar.addListener('removeDrawed', function() {
    extentPrimitive.setExtent(new Cesium.Rectangle(0, 0, 0, 0));
});

const createBillboardImage = function(color) {
    const pinBuilder = new Cesium.PinBuilder();
    const image = pinBuilder.fromColor(Cesium.Color.fromCssColorString(color), 48).toDataURL();
    return image;
};

const drawGeometry = function(geom, subject) {
    geom = removeZ(geom);
    const wkt = new Wkt.Wkt();
    wkt.read(geom);
    let geojson = wkt.toJson();

    geojson = reprojectGeometry(geojson, 'EPSG:28992', 'EPSG:4326');

    const source = new Cesium.GeoJsonDataSource();

    source
        .load(geojson, {
            clampToGround: true
        })
        .then(function() {
            for (let entity of source.entities.values) {
                // http://www.rijkswaterstaat.nl/linked_data/disk/re9823d452941e5b71e7ea05696e254313eba2e15
                const subjectParts = subject.split('/');
                const id = subjectParts[subjectParts.length - 1];

                let database;
                if (subject.includes('disk')) {
                    database = 'disk';
                } else if (subject.includes('kerngis')) {
                    database = 'kerngis';
                } else if (subject.includes('ultimo')) {
                    database = 'ultimo';
                }

                if (typeof entity.billboard !== 'undefined') {
                    if (database === 'disk') {
                        entity.billboard.image = createBillboardImage(colors.disk);
                    } else if (database === 'kerngis') {
                        entity.billboard.image = createBillboardImage(colors.kerngis);
                    } else if (database === 'ultimo') {
                        entity.billboard.image = createBillboardImage(colors.ultimo);
                    }

                    viewer.entities.add({
                        parent: providers.entities[database],
                        position: entity.position,
                        billboard: entity.billboard,
                        description: loadingDescription,
                        properties: {
                            id: id,
                            database: database
                        }
                    });
                } else if (typeof entity.polygon !== 'undefined') {
                    if (database === 'disk') {
                        entity.polygon.material = new Cesium.Color.fromCssColorString(colors.disk);
                    } else if (database === 'kerngis') {
                        entity.polygon.material = new Cesium.Color.fromCssColorString(
                            colors.kerngis
                        );
                    } else if (database === 'ultimo') {
                        entity.polygon.material = new Cesium.Color.fromCssColorString(
                            colors.ultimo
                        );
                    }

                    viewer.entities.add({
                        parent: providers.entities[database],
                        polygon: entity.polygon,
                        description: loadingDescription,
                        properties: {
                            id: id,
                            database: database
                        }
                    });
                } else if (typeof entity.polyline !== 'undefined') {
                    if (database === 'disk') {
                        entity.polyline.material = new Cesium.Color.fromCssColorString(colors.disk);
                    } else if (database === 'kerngis') {
                        entity.polyline.material = new Cesium.Color.fromCssColorString(
                            colors.kerngis
                        );
                    } else if (database === 'ultimo') {
                        entity.polyline.material = new Cesium.Color.fromCssColorString(
                            colors.ultimo
                        );
                    }

                    viewer.entities.add({
                        parent: providers.entities[database],
                        polyline: entity.polyline,
                        description: loadingDescription,
                        properties: {
                            id: id,
                            database: database
                        }
                    });
                } else {
                    console.log(entity);
                }
            }
            viewer.scene.requestRender();
        });
};

const drawGeometries = function(data) {
    for (let subject of data) {
        drawGeometry(subject.geometryWKT.value, subject.subject.value);
    }
};
