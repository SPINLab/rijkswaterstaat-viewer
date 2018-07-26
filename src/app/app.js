'use strict';

Cesium.BingMapsApi.defaultKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1ZWNjNmNiOC0xZDhiLTQ1NTktOGNiZi1jZjE3YzIwMDNkMDMiLCJpZCI6NDk1LCJpYXQiOjE1MjUyNTUyNzV9.R-_alHqdFwfZODeZRMbU3b_Cqakop-X5w2mbtoAS3fA';

proj4.defs([
    [
        'EPSG:4326',
        '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'
    ],
    [
        'EPSG:28992',
        '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.999908 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +towgs84=565.2369,50.0087,465.658,-0.406857330322398,0.350732676542563,-1.8703473836068,4.0812 +no_defs'
    ]
]);

const viewer = new Cesium.Viewer('cesiumContainer', {
    baseLayerPicker: true,
    animation: false,
    timeline: false,
    vrButton: true,
    sceneModePicker: false,
    navigationInstructionsInitiallyVisible: false,
    selectionIndicator: false,
    terrainProvider: providers.terrain.cesiumWorld,
    terrainProviderViewModels: providers.terrain.viewModels,
    imageryProvider: false,
    imageryProviderViewModels: providers.imagery.viewModels,
    requestRenderMode: true,
    maximumRenderTimeChange: Infinity
});

const homeView = {
    x: 3902197,
    y: 334558,
    z: 5047216
};
viewer.camera.setView({ destination: homeView });
viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function(
    commandInfo
) {
    viewer.camera.setView({ destination: homeView });
    commandInfo.cancel = true;
});

// Style the infobox
const frame = viewer.infoBox.frame;
frame.sandbox = 'allow-same-origin allow-scripts allow-popups allow-forms';
frame.addEventListener(
    'load',
    function() {
        const simplebarLink = frame.contentDocument.createElement('script');
        simplebarLink.src = Cesium.buildModuleUrl(
            '../../../simplebar/dist/simplebar.js'
        );
        viewer.infoBox.frame.contentDocument.head.appendChild(simplebarLink);

        const simplebarCssLink = frame.contentDocument.createElement('link');
        simplebarCssLink.href = Cesium.buildModuleUrl(
            '../../../simplebar/dist/simplebar.css'
        );
        simplebarCssLink.rel = 'stylesheet';
        simplebarCssLink.type = 'text/css';
        viewer.infoBox.frame.contentDocument.head.appendChild(simplebarCssLink);

        const cssLink = frame.contentDocument.createElement('link');
        cssLink.href = Cesium.buildModuleUrl(
            '../../../../src/app/components/infobox.css'
        );
        cssLink.rel = 'stylesheet';
        cssLink.type = 'text/css';
        viewer.infoBox.frame.contentDocument.head.appendChild(cssLink);
    },
    false
);

const pointcloudHeightOffset = 6;
const meshHeightOffset = 50;
viewer.scene.globe.depthTestAgainstTerrain = false;
// viewer.scene.globe.enableLighting = true;
const defaultColor = Cesium.Color.YELLOW.withAlpha(0.5);
const loadingDescription = `
<div class="loading">
<svg width="100px" height="100px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="lds-rolling" style="animation-play-state: running; animation-delay: 0s; background: rgba(0, 0, 0, 0) none repeat scroll 0% 0%;">
<circle cx="50" cy="50" fill="none" ng-attr-stroke="{{config.color}}" ng-attr-stroke-width="{{config.width}}" ng-attr-r="{{config.radius}}" ng-attr-stroke-dasharray="{{config.dasharray}}" stroke="#4488bb" stroke-width="10" r="35" stroke-dasharray="164.93361431346415 56.97787143782138" style="animation-play-state: running; animation-delay: 0s;">
  <animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 50;360 50 50" keyTimes="0;1" dur="1.7s" begin="0s" repeatCount="indefinite" style="animation-play-state: running; animation-delay: 0s;"></animateTransform>
</circle>
</svg>
Evaluating Query..
</div>
`;

providers.tilesets.pointcloud.addTilesets();
providers.tilesets.pointcloud.offsetTilesets(6);
providers.tilesets.mesh.addTilesets();
providers.tilesets.mesh.offsetTilesets(50);
providers.entities.addAll();

const auth = {
    username: '',
    password: '',
    prompt: function() {
        return new Promise(
            function(resolve, reject) {
                if (this.username !== '' || this.password !== '') {
                    resolve();
                } else {
                    const authPrompt = document.createElement('div');
                    authPrompt.className = 'auth-prompt';

                    const submit = function() {
                        document.body.removeChild(authPrompt);
                        this.username = usernameInput.value;
                        this.password = passwordInput.value;
                        resolve();
                    }.bind(this);

                    const label = document.createElement('label');
                    label.textContent = 'Please enter username and password:';
                    label.for = 'auth-prompt-username';
                    authPrompt.appendChild(label);

                    const usernameInput = document.createElement('input');
                    usernameInput.id = 'auth-prompt-username';
                    usernameInput.type = 'text';
                    authPrompt.appendChild(usernameInput);

                    const passwordInput = document.createElement('input');
                    passwordInput.id = 'auth-prompt-password';
                    passwordInput.type = 'password';
                    passwordInput.addEventListener(
                        'keyup',
                        function(e) {
                            if (e.keyCode == 13) submit();
                        },
                        false
                    );
                    authPrompt.appendChild(passwordInput);

                    var button = document.createElement('button');
                    button.textContent = 'Submit';
                    button.addEventListener('click', submit, false);
                    authPrompt.appendChild(button);

                    document.body.appendChild(authPrompt);
                }
            }.bind(this)
        );
    }
};

function SparQLQuery(serverUrl, query) {
    return new Promise(function(resolve, reject) {
        const headers = new Headers();

        headers.append(
            'Authorization',
            'Basic ' + base64.encode(auth.username + ':' + auth.password)
        );
        headers.append('Accept', 'application/json');
        headers.append('Content-type', 'application/x-www-form-urlencoded');

        const result = fetch(serverUrl, {
            method: 'POST',
            headers: headers,
            mode: 'cors',
            body: 'query=' + query
        })
            .then(function(response) {
                return response.json();
            })
            .then(function(j) {
                resolve(j);
            })
            .catch(function() {
                auth.username = '';
                auth.password = '';
            });
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function toRD(coord) {
    let x;
    let y;
    if (coord instanceof Array) {
        x = coord[0] * Cesium.Math.DEGREES_PER_RADIAN;
        y = coord[1] * Cesium.Math.DEGREES_PER_RADIAN;
    } else if (coord.hasOwnProperty('longitude')) {
        x = coord.longitude * Cesium.Math.DEGREES_PER_RADIAN;
        y = coord.latitude * Cesium.Math.DEGREES_PER_RADIAN;
    } else if (coord.hasOwnProperty('x')) {
        x = coord.x * Cesium.Math.DEGREES_PER_RADIAN;
        y = coord.y * Cesium.Math.DEGREES_PER_RADIAN;
    } else if (coord.hasOwnProperty('X')) {
        x = coord.X * Cesium.Math.DEGREES_PER_RADIAN;
        y = coord.Y * Cesium.Math.DEGREES_PER_RADIAN;
    } else {
        return;
    }
    const rd = proj4('EPSG:4326', 'EPSG:28992', [x, y]);
    return rd;
}

function polygonToWKT(vertices) {
    let wkt = 'POLYGON ((';
    for (let v of vertices) {
        const rd = toRD(v);
        wkt += rd[0] + ' ' + rd[1] + ', ';
    }
    wkt = wkt.slice(0, wkt.length - 2);
    wkt += '))';
    return wkt;
}

function pointToWKT(vertex) {
    const rd = toRD(vertex);
    const wkt = 'POINT (' + rd[0] + ' ' + rd[1] + ')';
    return wkt;
}

const ellipsoid = viewer.scene.globe.ellipsoid;

const baseQueries = {
    polygon: `PREFIX geo: <http://www.opengis.net/ont/geosparql#>
    PREFIX geof: <http://www.opengis.net/def/function/geosparql/>

    select ?subject ?property ?value
    %s
    where {
        ?subject geo:hasGeometry ?geometry;
              ?property ?value.
        ?geometry geo:asWKT ?geometryWKT .

        FILTER (
            geof:sfWithin(?geometryWKT, '''
            %s
            '''^^geo:wktLiteral))
    }`,
    point: `PREFIX geo: <http://www.opengis.net/ont/geosparql#>
    PREFIX geof: <http://www.opengis.net/def/function/geosparql/>

    select ?subject ?property ?value
    %s
    where {
        ?subject geo:hasGeometry ?geometry;
              ?property ?value.
        ?geometry geo:asWKT ?geometryWKT .

        FILTER (
            geof:sfWithin(?geometryWKT, geof:buffer('''
            %s
            '''^^geo:wktLiteral, 20)))
    }`,
    getGeometry: `PREFIX geo: <http://www.opengis.net/ont/geosparql#>

    select ?geom
    where {
        ?s ?p ?geom .

        filter (?s= <%s>)
        . filter (datatype(?geom) = geo:wktLiteral)
    }`
};

function entityToWKT(entity) {
    let wkt;
    if (typeof entity.polygon !== 'undefined') {
        const coords = ellipsoid.cartesianArrayToCartographicArray(
            entity.polygon.hierarchy.getValue().positions
        );
        wkt = polygonToWKT(coords);
    } else if (typeof entity.billboard !== 'undefined') {
        const coord = ellipsoid.cartesianToCartographic(
            entity.position.getValue()
        );
        wkt = pointToWKT(coord);
    } else {
        return;
    }
    return wkt;
}

function buildQuery(wkt) {
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

    console.log(wkt);
    const shape = wkt.split(' ')[0];
    if (shape === 'POLYGON') {
        query = vsprintf(baseQueries.polygon, [graphs, wkt]);
    } else if (shape === 'POINT') {
        query = vsprintf(baseQueries.point, [graphs, wkt]);
    }
    return query;
}

const namespaces = ['22-rdf-syntax-ns#', 'rdf-schema#', 'geosparql#'];
function buildDescription(entityData) {
    let description = `
    <div data-simplebar class="wrap">
    <table class="table-fill">
    <tbody class="table-hover">
    `;

    let currentGraph = '';
    let currentSubject = '';
    let currentSubjectValue = '';
    let i = 1;
    for (const result of entityData.results.bindings) {
        let property = result['property']['value'].split('/');
        property = property[property.length - 1];
        for (const s of namespaces) {
            property = property.replace(s, '');
        }

        let value;
        let valueList = result['value']['value'].split('/');
        if (valueList[0] === 'http:' && valueList[4] !== 'schema') {
            value =
                '<a target="_blank" href="http://148.251.106.132:8092/resource/rws.' +
                currentGraph +
                '/' +
                valueList[valueList.length - 1] +
                '">GraphDB</a>';
        } else {
            if (valueList.length > 4) {
                value = valueList[valueList.length - 1];
            } else {
                value = result['value']['value'];
            }
        }

        const graph = result['subject']['value'].split('/')[4];
        const subject = result['subject']['value'].split('/')[5];

        if (graph !== currentGraph) {
            description += vsprintf(
                '<thead class="graph-title"><tr><th class="text-left">%s</th><th class="text-left"></th></tr></thead>',
                [graph.toUpperCase()]
            );
            currentGraph = graph;
            i = 1;
        }

        if (subject !== currentSubject) {
            currentSubjectValue = value;
            description += vsprintf(
                '<thead class="subject-title"><tr><th class="text-left"> <a target="_blank" href="http://148.251.106.132:8092/resource/rws.%s/%s">%s</th><th class="text-left"></th></tr></thead>',
                [currentGraph, subject, currentSubjectValue]
            );
            currentSubject = subject;
            i += 1;
        }
        property = property.replace(
            currentSubjectValue.toLowerCase() + '_',
            ''
        );

        const entry = `
        <tr>
        <td class="text-left">%s</td>
        <td class="text-left">%s</td>
        </tr>
        `;
        description += vsprintf(entry, [
            capitalizeFirstLetter(property),
            value
        ]);
    }
    description += `
    </tbody>
    </table>
    </div>
    `;
    return description;
}

const SparQLServer = 'http://148.251.106.132:8092/repositories/rwsld';

function updateDescription(entity) {
    const wkt = entityToWKT(entity);
    const query = buildQuery(wkt);
    if (query !== '') {
        auth.prompt().then(function() {
            SparQLQuery(SparQLServer, query).then(function(entityData) {
                entity.description = buildDescription(entityData);
            });
        });
    }
}

let lastPick;
const highlightColor = Cesium.Color.RED.withAlpha(0.5);
viewer.selectedEntityChanged.addEventListener(function(entity) {
    if (typeof entity !== 'undefined') {
        if (typeof entity.polygon !== 'undefined') {
            if (entity !== lastPick) {
                if (typeof lastPick !== 'undefined') {
                    lastPick.polygon.material = defaultColor;
                    viewer.scene.requestRender();
                }
                lastPick = entity;

                if (entity.parent.name === 'bim') {
                    entity.polygon.show = false;
                    providers.tilesets.mesh.meshTileset.show = true;
                    viewer.scene.requestRender();
                } else {
                    entity.polygon.material = highlightColor;
                    viewer.scene.requestRender();
                }
                entity.description = loadingDescription;
                updateDescription(entity);
            }
        } else if (typeof entity.billboard !== 'undefined') {
            updateDescription(entity);
        } else {
            if (typeof lastPick !== 'undefined') {
                lastPick.polygon.material = defaultColor;
                viewer.scene.requestRender();
                if (lastPick.parent.name === 'bim') {
                    lastPick.polygon.show = true;
                    providers.tilesets.mesh.meshTileset.show = false;
                    viewer.scene.requestRender();
                }
                lastPick = undefined;
            }
        }
    } else {
        if (typeof lastPick !== 'undefined') {
            lastPick.polygon.material = defaultColor;
            viewer.scene.requestRender();
            if (lastPick.parent.name === 'bim') {
                lastPick.polygon.show = true;
                providers.tilesets.mesh.meshTileset.show = false;
                viewer.scene.requestRender();
            }
            lastPick = undefined;
        }
    }
});

kunstwerkenToggle.addEventListener('change', function() {
    providers.entities.kunstwerken.show = this.checked;
    viewer.scene.requestRender();
});

beheerobjectenToggle.addEventListener('change', function() {
    providers.entities.beheerobjecten.show = this.checked;
    viewer.scene.requestRender();
});

bimToggle.addEventListener('change', function() {
    providers.entities.bim.show = this.checked;
    viewer.scene.requestRender();
});

ahn3Toggle.addEventListener('change', function() {
    if (this.checked) {
        providers.tilesets.pointcloud.ahn3Tileset.show = true;
        providers.tilesets.pointcloud.ahn2Tileset.show = false;
        ahn2Toggle.checked = false;
    } else {
        providers.tilesets.pointcloud.ahn3Tileset.show = false;
    }
    viewer.scene.requestRender();
});

ahn2Toggle.addEventListener('change', function() {
    if (this.checked) {
        providers.tilesets.pointcloud.ahn2Tileset.show = true;
        providers.tilesets.pointcloud.ahn3Tileset.show = false;
        ahn3Toggle.checked = false;
    } else {
        providers.tilesets.pointcloud.ahn2Tileset.show = false;
    }
    viewer.scene.requestRender();
});

diskToggle.addEventListener('change', function() {
    if (viewer.selectedEntity.id !== 'None') {
        viewer.selectedEntity.description = loadingDescription;
        updateDescription(viewer.selectedEntity);
    }
    // if (extentPrimitive.extent.north === 0 && extentPrimitive.extent.east === 0 &&
    //         extentPrimitive.extent.south === 0 && extentPrimitive.extent.west === 0) {

    // }
});

kerngisToggle.addEventListener('change', function() {
    if (viewer.selectedEntity.id !== 'None') {
        viewer.selectedEntity.description = loadingDescription;
        updateDescription(viewer.selectedEntity);
    }
});

ultimoToggle.addEventListener('change', function() {
    if (viewer.selectedEntity.id !== 'None') {
        viewer.selectedEntity.description = loadingDescription;
        updateDescription(viewer.selectedEntity);
    }
});

function zoomToRD(x, y) {
    x = parseFloat(x);
    y = parseFloat(y);
    // const wgs = rdnaptrans.Transform.rd2etrs(new rdnaptrans.Cartesian(x, y))
    const wgs = proj4('EPSG:28992', 'EPSG:4326', [x, y]);
    const destination = Cesium.Cartesian3.fromDegrees(
        // wgs.lambda,
        // wgs.phi,
        wgs[0],
        wgs[1],
        300
    );
    viewer.camera.setView({ destination: destination });
}

function wktToRD(wkt) {
    const wktSplit = wkt.split(' ');
    let x = wktSplit[1];
    x = x.replace('(', '');
    let y = wktSplit[2];
    return { x: parseFloat(x), y: parseFloat(y) };
}

const otlQuery = `
PREFIX otl: <http://otl.rws.nl/otl#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
PREFIX diskschema: <http://www.rijkswaterstaat.nl/linked_data/schema/disk/>

select ?beheerobject ?label ?geometryWKT
where {
    ?objectdeel a %s ;
     diskschema:objectdeel_beheerobject ?beheerobject .

    ?beheerobject rdfs:label ?label .

    ?beheerobject geo:hasGeometry ?geometry .

    ?geometry geo:asWKT ?geometryWKT .
} limit 10
`;

const otlDict = {
    overbrugging: 'otl:OB00428',
    onderdoorgang: 'otl:OB00425',
    ponton: 'otl:OB01647'
};

queryButton.addEventListener('click', function() {
    const x = document.getElementById('queryResults');
    x.style.display = 'block';
    const query = vsprintf(otlQuery, [otlDict[querySelect.value]]);
    if (query !== '') {
        promptAuth().then(function() {
            SparQLQuery(SparQLServer, query).then(function(results) {
                let resultsHTML = '';
                for (const result of results.results.bindings) {
                    const label = result.label.value;
                    const wkt = result.geometryWKT.value;
                    const coordinates = wktToRD(wkt);

                    resultsHTML += vsprintf(
                        '<button onClick="zoomToRD(%s, %s)">%s</button> <br>',
                        [coordinates.x, coordinates.y, label]
                    );
                }

                const div = document.getElementById('queryResults');
                div.innerHTML = resultsHTML;
            });
        });
    }
});

const drawHelper = new DrawHelper(viewer);
const toolbar = drawHelper.addToolbar(document.getElementById('toolbar'), {
    buttons: ['extent']
});

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
    const upperleft = [
        extentPrimitive.extent.west,
        extentPrimitive.extent.north
    ];
    const lowerright = [
        extentPrimitive.extent.east,
        extentPrimitive.extent.south
    ];
    const upperright = [
        extentPrimitive.extent.east,
        extentPrimitive.extent.north
    ];
    const lowerleft = [
        extentPrimitive.extent.west,
        extentPrimitive.extent.south
    ];

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
        if (
            data[i].property.value ===
            'http://www.opengis.net/ont/geosparql#hasGeometry'
        ) {
            const query = vsprintf(
                baseQueries.getGeometry,
                data[i].value.value
            );
            auth.prompt().then(function() {
                SparQLQuery(SparQLServer, query).then(function(data) {
                    drawGeometry(data.results.bindings[0].geom.value);
                });
            });
        }
    }
}

function reprojectGeojson(geojson, from, to) {
    if (geojson.type === 'Point') {
        geojson.coordinates = proj4(from, to, geojson.coordinates);
    } else if (geojson.type === 'LineString' || geojson.type === 'MultiPoint') {
        for (let i = 0; i < geojson.coordinates.length; i++) {
            geojson.coordinates[i] = proj4(from, to, geojson.coordinates[i]);
        }
    } else if (
        geojson.type === 'Polygon' ||
        geojson.type === 'MultiLineString'
    ) {
        for (let i = 0; i < geojson.coordinates.length; i++) {
            for (let j = 0; j < geojson.coordinates[i].length; j++) {
                geojson.coordinates[i][j] = proj4(
                    from,
                    to,
                    geojson.coordinates[i][j]
                );
            }
        }
    } else if (geojson.type === 'MultiPolygon') {
        for (let i = 0; i < geojson.coordinates.length; i++) {
            for (let j = 0; j < geojson.coordinates[i].length; j++) {
                for (let k = 0; k < geojson.coordinates[i][j].length; k++) {
                    geojson.coordinates[i][j][k] = proj4(
                        from,
                        to,
                        geojson.coordinates[i][j][k]
                    );
                }
            }
        }
    } else {
        console.error('Shape type not recognized.');
        return;
    }
    return geojson;
}

const drawnGeometries = new Cesium.Entity({
    name: 'drawn',
    show: true
});

function removeZ(wkt) {
    const wktSplit = wkt.split(',');
    if (wktSplit.length > 1) {
        if (wktSplit[1].split(' ').length > 2) {
            wkt = wkt.replace(/ [^\s\)]+,/g, ',').replace(/ [^\s\)]+[)]/g, ')');
        }
    } else if (wktSplit[0].split(' ').length > 3) {
        wkt = wkt.replace(/ [^\s\)]+[)]/g, ')');
    }
    return wkt;
}

function drawGeometry(geom) {
    geom = removeZ(geom);
    const wkt = new Wkt.Wkt();
    wkt.read(geom);
    let geojson = wkt.toJson();

    geojson = reprojectGeojson(geojson, 'EPSG:28992', 'EPSG:4326');

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
