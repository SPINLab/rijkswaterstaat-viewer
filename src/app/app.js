"use strict"
const style = document.createElement('style');
style.innerHTML = "body, html { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; } #top { display: none; }"
document.body.appendChild(style);

Cesium.BingMapsApi.defaultKey = 'AgctUkAssjrKQ55wNUHiskdz0nbRWKfkkGHhSV4mjNrlMCEiKA3aJCYbDEEaxH7C';

const viewer = new Cesium.Viewer('cesiumContainer', {
    imageryProvider: false,
    baseLayerPicker: false,
    animation: false,
    timeline: false,
    vrButton: true,
    sceneModePicker: false,
    navigationInstructionsInitiallyVisible: false,
    selectionIndicator : false
});

// Style the infobox
const frame = viewer.infoBox.frame;
frame.sandbox = 'allow-same-origin allow-scripts allow-popups allow-forms';
frame.addEventListener('load', function () {
    const simplebarLink = frame.contentDocument.createElement("script");
    simplebarLink.src = Cesium.buildModuleUrl('../../../simplebar/dist/simplebar.js');
    viewer.infoBox.frame.contentDocument.head.appendChild(simplebarLink);

    const simplebarCssLink = frame.contentDocument.createElement("link");
    simplebarCssLink.href = Cesium.buildModuleUrl('../../../simplebar/dist/simplebar.css');
    simplebarCssLink.rel = "stylesheet";
    simplebarCssLink.type = "text/css";
    viewer.infoBox.frame.contentDocument.head.appendChild(simplebarCssLink);

    const cssLink = frame.contentDocument.createElement("link");
    cssLink.href = Cesium.buildModuleUrl('../../../../src/app/components/infobox.css');
    cssLink.rel = "stylesheet";
    cssLink.type = "text/css";
    viewer.infoBox.frame.contentDocument.head.appendChild(cssLink);
}, false);


const terrainProvider = new Cesium.CesiumTerrainProvider({
    url : 'https://assets.agi.com/stk-terrain/v1/tilesets/world/tiles',
	requestWaterMask: false
});

const Ortho25 = new Cesium.WebMapServiceImageryProvider({
    url : 'https://geodata.nationaalgeoregister.nl/luchtfoto/rgb/wms?',
    layers : 'Actueel_ortho25',
});

const BRT = new Cesium.WebMapTileServiceImageryProvider({
    url : 'https://geodata.nationaalgeoregister.nl/tiles/service/wmts?',
    layer : 'brtachtergrondkaart',
    style : 'default',
    format : 'image/png',
    tileMatrixSetID : 'EPSG:3857',
    tileMatrixLabels: ['EPSG:3857:0', 'EPSG:3857:1', 'EPSG:3857:2', 'EPSG:3857:3', 'EPSG:3857:4',
                       'EPSG:3857:5', 'EPSG:3857:6', 'EPSG:3857:7', 'EPSG:3857:8', 'EPSG:3857:9',
                       'EPSG:3857:10', 'EPSG:3857:11', 'EPSG:3857:12', 'EPSG:3857:13', 'EPSG:3857:14',
                       'EPSG:3857:15', 'EPSG:3857:16', 'EPSG:3857:17', 'EPSG:3857:18', 'EPSG:3857:19'],
    maximumLevel: 19
    // credit : new Cesium.Credit('PDOK')
});

const imageryViewModels = [];

imageryViewModels.push(new Cesium.ProviderViewModel({
    name : 'PDOK Luchtfoto',
    iconUrl : Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/bingAerial.png'),
    tooltip : 'PDOK Luchtfoto 25cm',
    creationFunction : function() {
        return Ortho25;
    }
}));

imageryViewModels.push(new Cesium.ProviderViewModel({
    name : 'BRT',
    iconUrl : Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/openStreetMap.png'),
    tooltip : 'Basis Registratie Topografie',
    creationFunction : function() {
        return BRT;
    }
}));

const entities = viewer.entities;

viewer.terrainProvider = terrainProvider;

const pointcloudHeightOffset = 6;
const meshHeightOffset = 50;
viewer.scene.globe.depthTestAgainstTerrain = true;
// viewer.scene.globe.enableLighting = true;

const layers = viewer.imageryLayers;
const baseLayerPicker = new Cesium.BaseLayerPicker('baseLayerPickerContainer', {
    globe : viewer.scene.globe,
    imageryProviderViewModels : imageryViewModels
});

const meshTileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
    url: '../data/mesh/tileset.json'
}));

const ahn3Tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
    url: '../data/pointcloud/ahn3/tileset.json'
}));

ahn3Tileset.style = new Cesium.Cesium3DTileStyle({
    pointSize : 2
});

const ahn2Tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
    url: '../data/pointcloud/ahn2/tileset.json'
}));

ahn2Tileset.style = new Cesium.Cesium3DTileStyle({
    pointSize : 2
});

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
`

const kunstwerken = entities.add(new Cesium.Entity({name: "kunstwerken"}));
const kunstwerkenSource = new Cesium.GeoJsonDataSource();
kunstwerkenSource.load('../data/features/A10A1A6_kunstwerken.json', {
    fill: defaultColor,
    clampToGround: true
}).then(function() {
    console.log('Loaded polygons');
    const jsonEntities = kunstwerkenSource.entities.values;
    jsonEntities.forEach(currentItem => {
        entities.add({
            parent: kunstwerken,
            polygon: currentItem.polygon,
            properties: currentItem.properties,
            name:  currentItem.properties.NAAM,
            description: loadingDescription
        });
    });
});

const beheerobjecten = entities.add(new Cesium.Entity({name: "beheerobjecten"}));
const beheerobjectenSource = new Cesium.GeoJsonDataSource();
beheerobjectenSource.load('../data/features/A10_beheerobjecten.json', {
    color: defaultColor,
    clampToGround: true
}).then(function() {
    const jsonEntities = beheerobjectenSource.entities.values;
    jsonEntities.forEach(currentItem => {
        entities.add({
            parent: beheerobjecten,
            position: currentItem.position,
            billboard: currentItem.billboard,
            properties: currentItem.properties,
            name:  currentItem.properties.naam,
            description: loadingDescription
        });
    });
});
beheerobjecten.show = false;

const bim = entities.add(new Cesium.Entity({name: "bim"}));
const bimSource = new Cesium.GeoJsonDataSource();
bimSource.load('../data/features/bim_locations.json', {
    color: defaultColor,
    clampToGround: true
}).then(function() {
    const jsonEntities = bimSource.entities.values;
    jsonEntities.forEach(currentItem => {
        entities.add({
            parent: bim,
            polygon: currentItem.polygon,
            properties: currentItem.properties,
            name:  currentItem.properties.naam,
            description: loadingDescription
        });
    });
});
bim.show = false;

let dest;
ahn3Tileset.readyPromise.then(function() {
    console.log('Loaded ahn3 tileset');
    const bounding = ahn3Tileset._root._boundingVolume;
    const center = bounding.boundingSphere.center;
    const cart = Cesium.Ellipsoid.WGS84.cartesianToCartographic(center);
    dest = Cesium.Cartesian3.fromDegrees(
            cart.longitude * (180 / Math.PI),
            cart.latitude * (180 / Math.PI),
            bounding._boundingSphere.radius * 2.2
    );

    const surface = Cesium.Cartesian3.fromRadians(cart.longitude, cart.latitude, 0.0);
    const offset = Cesium.Cartesian3.fromRadians(cart.longitude, cart.latitude, pointcloudHeightOffset);
    const translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
    ahn3Tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);

    viewer.camera.setView({ destination: dest });
});

ahn2Tileset.readyPromise.then(function() {
    console.log('Loaded ahn2 tileset');
    const bounding = ahn2Tileset._root._boundingVolume;
    const center = bounding.boundingSphere.center;
    const cart = Cesium.Ellipsoid.WGS84.cartesianToCartographic(center);

    const surface = Cesium.Cartesian3.fromRadians(cart.longitude, cart.latitude, 0.0);
    const offset = Cesium.Cartesian3.fromRadians(cart.longitude, cart.latitude, pointcloudHeightOffset);
    const translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
    ahn2Tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
    ahn2Tileset.show = false;
});

meshTileset.readyPromise.then(function() {
    console.log('Loaded mesh tileset');
    const bounding = meshTileset._root._boundingVolume;
    const center = bounding.boundingSphere.center;
    const cart = Cesium.Ellipsoid.WGS84.cartesianToCartographic(center);

    const surface = Cesium.Cartesian3.fromRadians(cart.longitude, cart.latitude, 0.0);
    const offset = Cesium.Cartesian3.fromRadians(cart.longitude, cart.latitude, meshHeightOffset);
    const translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
    meshTileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
    meshTileset.show = false;
});

viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function(commandInfo) {
    viewer.camera.setView({ destination: dest });
	commandInfo.cancel = true;
});

const auth = {'username': '', 'password': ''};
function promptAuth() {
    return new Promise(function(resolve, reject) {
        if (auth.username !== '' || auth.password !== '') {
            resolve();
        } else {
            const authPrompt = document.createElement("div");
            authPrompt.className = "auth-prompt";

            const submit = function () {
                document.body.removeChild(authPrompt);
                auth.username = usernameInput.value;
                auth.password = passwordInput.value;
                resolve();
            }

            const label = document.createElement("label");
            label.textContent = "Please enter username and password:";
            label.for = "auth-prompt-username";
            authPrompt.appendChild(label);

            const usernameInput = document.createElement("input");
            usernameInput.id = "auth-prompt-username";
            usernameInput.type = "text";
            authPrompt.appendChild(usernameInput);

            const passwordInput = document.createElement("input");
            passwordInput.id = "auth-prompt-password";
            passwordInput.type = "password";
            passwordInput.addEventListener("keyup", function(e) {
                if (e.keyCode == 13) submit();
            }, false);
            authPrompt.appendChild(passwordInput);

            var button = document.createElement("button");
            button.textContent = "Submit";
            button.addEventListener("click", submit, false);
            authPrompt.appendChild(button);

            document.body.appendChild(authPrompt);
        };
    })
};

function SparQLQuery(serverUrl, query) {
    return new Promise(function(resolve, reject) {
        const headers = new Headers();

        headers.append('Authorization', 'Basic ' + base64.encode(auth.username + ":" + auth.password));
        headers.append('Accept', 'application/json')
        headers.append('Content-type', 'application/x-www-form-urlencoded')

        const result = fetch(serverUrl, {
            method:'POST',
            headers: headers,
            mode: 'cors',
            body: 'query=' + query
        }).then(function(response) {
            return response.json();
        }).then(function(j) {
            resolve(j);
        }).catch(function() {
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
    if (coord.hasOwnProperty('longitude')) {
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
    const rd = rdnaptrans.Transform.etrs2rd(new rdnaptrans.Geographic(y, x));
    return rd;
}

function polygonToWKT(vertices) {
    let wkt = "POLYGON ((";
    for (const v of vertices) {
        const rd = toRD(v);
        wkt += rd.X + ' ' + rd.Y + ', ';
    }
    wkt = wkt.slice(0, wkt.length-2)
    wkt += "))";
    return wkt;
}

function pointToWKT(vertex) {
    const rd = toRD(vertex)
    const wkt = "POINT (" + rd.X + ' ' + rd.Y + ')';
    return wkt
}

const ellipsoid = viewer.scene.globe.ellipsoid;
const baseQueryPolygon = `
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
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
}
`

const baseQueryPoint = `
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
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
}
`

function buildQuery(entity) {
    let wkt;
    if (typeof entity.polygon !== 'undefined') {
        const coords = ellipsoid.cartesianArrayToCartographicArray(entity.polygon.hierarchy.getValue().positions)
        wkt = polygonToWKT(coords);
    } else if (typeof entity.billboard !== 'undefined') {
        const coord = ellipsoid.cartesianToCartographic(entity.position.getValue())
        wkt = pointToWKT(coord)
    } else {
        return;
    }

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

    if (typeof entity.polygon !== 'undefined') {
        query = vsprintf(baseQueryPolygon, [graphs, wkt]);
    } else if (typeof entity.billboard !== 'undefined') {
        query = vsprintf(baseQueryPoint, [graphs, wkt]);
    }
    return query;
};

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
        property = property[property.length-1];
        for (const s of namespaces) {
            property = property.replace(s, '');
        }

        let value = result['value']['value'].split('/');
        if (value[0] === 'http:' && value[4] !== 'schema') {
            value = '<a target="_blank" href="http://148.251.106.132:8092/resource/rws.' + currentGraph + '/' + value[value.length-1] + '">GraphDB</a>';
        } else {
            value = value[value.length-1];
        }

        const graph = result['subject']['value'].split('/')[4];
        const subject = result['subject']['value'].split('/')[5];

        if (graph !== currentGraph) {
            description += vsprintf('<thead class="graph-title"><tr><th class="text-left">%s</th><th class="text-left"></th></tr></thead>', [graph.toUpperCase()]);
            currentGraph = graph;
            i = 1;
        }

        if (subject !== currentSubject) {
            currentSubjectValue = value;
            description += vsprintf('<thead class="subject-title"><tr><th class="text-left"> <a target="_blank" href="http://148.251.106.132:8092/resource/rws.%s/%s">%s</th><th class="text-left"></th></tr></thead>', [currentGraph, subject, currentSubjectValue]);
            currentSubject = subject;
            i += 1;
        }
        property = property.replace(currentSubjectValue.toLowerCase() + '_', '');

        const entry = `
        <tr>
        <td class="text-left">%s</td>
        <td class="text-left">%s</td>
        </tr>
        `;
        description += vsprintf(entry, [capitalizeFirstLetter(property), value]);
    };
    description += `
    </tbody>
    </table>
    </div>
    `;
    return description;
}

const SparQLServer = 'http://148.251.106.132:8092/repositories/rwsld';
function updateDescription(entity) {
    const query = buildQuery(entity);
    if (query !== '') {
        promptAuth().then(function () {
            SparQLQuery(SparQLServer, query).then(function(entityData) {
                entity.description = buildDescription(entityData);
            });
        });
    };
};

let lastPick;
const highlightColor = Cesium.Color.RED.withAlpha(0.5);
viewer.selectedEntityChanged.addEventListener(function(entity) {
    if (typeof entity !== 'undefined') {
        if (typeof entity.polygon !== 'undefined') {
            if (entity !== lastPick) {
                if (typeof lastPick !== 'undefined') {
                    lastPick.polygon.material = defaultColor;
                }
                lastPick = entity;

                if (entity.parent.name === "bim") {
                    entity.polygon.show = false;
                    meshTileset.show = true;
                } else {
                    entity.polygon.material = highlightColor;
                }
                entity.description = loadingDescription;
                updateDescription(entity);
            }
        } else if (typeof entity.billboard !== 'undefined') {
            updateDescription(entity);
        } else {
            if (typeof lastPick !== 'undefined') {
                lastPick.polygon.material = defaultColor;
                if (lastPick.parent.name === 'bim') {
                    lastPick.polygon.show = true;
                    meshTileset.show = false;
                }
                lastPick = undefined;
            }
        }
    } else {
        if (typeof lastPick !== 'undefined') {
            lastPick.polygon.material = defaultColor;
            if (lastPick.parent.name === 'bim') {
                lastPick.polygon.show = true;
                meshTileset.show = false;
            }
            lastPick = undefined;
        }
    }
});

kunstwerkenToggle.addEventListener('change', function() {
    if(this.checked) {
        kunstwerken.show = true;
    } else {
        kunstwerken.show = false;
    }
});

beheerobjectenToggle.addEventListener('change', function() {
    if(this.checked) {
        beheerobjecten.show = true;
    } else {
        beheerobjecten.show = false;
    }
});

bimToggle.addEventListener('change', function() {
    if(this.checked) {
        bim.show = true;
    } else {
        bim.show = false;
    }
});

ahn3Toggle.addEventListener('change', function() {
    if(this.checked) {
        ahn3Tileset.show = true;
        ahn2Tileset.show = false;
        ahn2Toggle.checked = false;
    } else {
        ahn3Tileset.show = false;
    }
});

ahn2Toggle.addEventListener('change', function() {
    if(this.checked) {
        ahn2Tileset.show = true;
        ahn3Tileset.show = false;
        ahn3Toggle.checked = false;
    } else {
        ahn2Tileset.show = false;
    }
});

diskToggle.addEventListener('change', function() {
    if (typeof viewer.selectedEntity !== 'undefined') {
        viewer.selectedEntity.description = loadingDescription;
        updateDescription(viewer.selectedEntity);
    }
});

kerngisToggle.addEventListener('change', function() {
    if (typeof viewer.selectedEntity !== 'undefined') {
        viewer.selectedEntity.description = loadingDescription;
        updateDescription(viewer.selectedEntity);
    }
});

ultimoToggle.addEventListener('change', function() {
    if (typeof viewer.selectedEntity !== 'undefined') {
        viewer.selectedEntity.description = loadingDescription;
        updateDescription(viewer.selectedEntity);
    }
});

function zoomToRD(x, y) {
    x = parseFloat(x);
    y = parseFloat(y);
    const wgs = rdnaptrans.Transform.rd2etrs(new rdnaptrans.Cartesian(x, y))
    const destination = Cesium.Cartesian3.fromDegrees(
        wgs.lambda,
        wgs.phi,
        300
    );
    viewer.camera.setView({ destination: destination });
}

function wktToRD(wkt){
    const wktSplit = wkt.split(' ');
    let x = wktSplit[1]
    x = x.replace('(', '');
    let y = wktSplit[2];
    return {'x': parseFloat(x), 'y': parseFloat(y)};
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
`
const otlDict = {
    'overbrugging': 'otl:OB00428',
    'onderdoorgang': 'otl:OB00425',
    'ponton': 'otl:OB01647'
}
queryButton.addEventListener('click', function () {
    const x = document.getElementById("queryResults");
    x.style.display = "block";
    const query = vsprintf(otlQuery, [otlDict[querySelect.value]])
    if (query !== '') {
        promptAuth().then(function () {
            SparQLQuery(SparQLServer, query).then(function(results) {
                console.log(results);
                let resultsHTML = '';
                for (const result of results.results.bindings) {
                    const label = result.label.value;
                    const wkt = result.geometryWKT.value;
                    const coordinates = wktToRD(wkt);

                    resultsHTML += vsprintf('<button onClick="zoomToRD(%s, %s)">%s</button> <br>', [coordinates.x, coordinates.y, label]);
                }

                const div = document.getElementById('queryResults');
                div.innerHTML = resultsHTML;
            });
        });
    };
    console.log(querySelect.value);
});