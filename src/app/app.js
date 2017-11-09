var style = document.createElement('style');
style.innerHTML = "body, html { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; } #top { display: none; }"
document.body.appendChild(style);

Cesium.BingMapsApi.defaultKey = 'AgctUkAssjrKQ55wNUHiskdz0nbRWKfkkGHhSV4mjNrlMCEiKA3aJCYbDEEaxH7C';

var terrainProvider = new Cesium.CesiumTerrainProvider({
    url : 'https://assets.agi.com/stk-terrain/v1/tilesets/world/tiles',
	requestWaterMask: false
});

var Ortho25 = new Cesium.WebMapServiceImageryProvider({
    url : 'https://geodata.nationaalgeoregister.nl/luchtfoto/wms?',
    layers : 'Actueel_ortho25',
});

var BRT = new Cesium.WebMapTileServiceImageryProvider({
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

var imageryViewModels = [];

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

var viewer = new Cesium.Viewer('cesiumContainer', {
    imageryProvider: false,
    baseLayerPicker: false,
    animation: false,
    timeline: false,
    vrButton: true,
    sceneModePicker: false,
    navigationInstructionsInitiallyVisible: false,
    selectionIndicator : false
});

var entities = viewer.entities;

viewer.terrainProvider = terrainProvider;

var pointcloudHeightOffset = 4;
var meshHeightOffset = 50;
viewer.scene.globe.depthTestAgainstTerrain = true;
// viewer.scene.globe.enableLighting = true;

var layers = viewer.imageryLayers;
var baseLayerPicker = new Cesium.BaseLayerPicker('baseLayerPickerContainer', {
    globe : viewer.scene.globe,
    imageryProviderViewModels : imageryViewModels
});

var meshTileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
    url: '../data/mesh/tileset.json'
}));

var pointcloudTileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
    url: '../data/pointcloud/tileset.json'
}));

pointcloudTileset.style = new Cesium.Cesium3DTileStyle({
    pointSize : 2
});

var defaultColor = Cesium.Color.YELLOW.withAlpha(0.5);

var kunstwerken = entities.add(new Cesium.Entity());
var kunstwerkenSource = new Cesium.GeoJsonDataSource();
kunstwerkenSource.load('../data/features/A10_kunstwerken.json', {
    fill: defaultColor,
    clampToGround: true
}).then(function() {
    console.log('Loaded polygons');
    var jsonEntities = kunstwerkenSource._entityCollection._entities._array;
    jsonEntities.forEach(currentItem => {
        entities.add({
            parent: kunstwerken,
            polygon: currentItem.polygon,
            properties: currentItem.properties,
            name:  currentItem.properties.NAAM,
            description: "Omschrijving: " + currentItem.properties.OBJECTTEKS + "<br>" +
                         "Diskcode: " + currentItem.properties.DISKCODE + "<br>" +
                         "Onderhouder: " + currentItem.properties.ONDERHOUDE + "<br>" +
                         "Beheerder: " + currentItem.properties.BEHEERDER + "<br>" +
                         "Eigenaar: " + currentItem.properties.EIGENAAR
        });
    });
});

var beheerobjecten = entities.add(new Cesium.Entity());
var beheerobjectenSource = new Cesium.GeoJsonDataSource();
beheerobjectenSource.load('../data/features/A10_beheerobjecten.json', {
    color: defaultColor,
    clampToGround: true
}).then(function() {
    var jsonEntities = beheerobjectenSource._entityCollection._entities._array;
    jsonEntities.forEach(currentItem => {
        entities.add({
            parent: beheerobjecten,
            position: currentItem.position,
            billboard: currentItem.billboard,
            properties: currentItem.properties,
            name:  currentItem.properties.naam,
            description: "Omschrijving: " + currentItem.properties.omschrijving + "<br>" +
                         "Archiefcode: " + currentItem.properties.archiefcode + "<br>"
        });
    });
});
beheerobjecten.show = false;

var dest;
pointcloudTileset.readyPromise.then(function() {
    console.log('Loaded point cloud tileset');
    var bounding = pointcloudTileset._root._boundingVolume;
    var center = bounding.boundingSphere.center;
    var cart = Cesium.Ellipsoid.WGS84.cartesianToCartographic(center);
    dest = Cesium.Cartesian3.fromDegrees(
            cart.longitude * (180 / Math.PI),
            cart.latitude * (180 / Math.PI),
            bounding._boundingSphere.radius * 2.2
    );

    var surface = Cesium.Cartesian3.fromRadians(cart.longitude, cart.latitude, 0.0);
    var offset = Cesium.Cartesian3.fromRadians(cart.longitude, cart.latitude, pointcloudHeightOffset);
    var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
    pointcloudTileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);

    viewer.camera.setView({ destination: dest });
});

meshTileset.readyPromise.then(function() {
    console.log('Loaded mesh tileset');
    var bounding = meshTileset._root._boundingVolume;
    var center = bounding.boundingSphere.center;
    var cart = Cesium.Ellipsoid.WGS84.cartesianToCartographic(center);

    var surface = Cesium.Cartesian3.fromRadians(cart.longitude, cart.latitude, 0.0);
    var offset = Cesium.Cartesian3.fromRadians(cart.longitude, cart.latitude, meshHeightOffset);
    var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
    meshTileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
});

viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function(commandInfo) {
    viewer.camera.setView({ destination: dest });
	commandInfo.cancel = true;
});

var query = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> SELECT * WHERE {  ?sub ?pred ?obj . } LIMIT 10";
var lastPick;
var highlightColor = Cesium.Color.RED.withAlpha(0.5);
viewer.selectedEntityChanged.addEventListener(function(entity) {
    if (typeof entity !== 'undefined') {
        if (typeof entity.polygon !== 'undefined') {
            if (entity !== lastPick) {
                if (typeof lastPick !== 'undefined') {
                    lastPick.polygon.material = defaultColor;
                }
                entity.polygon.material = highlightColor;
                lastPick = entity;

                // entityData = SparQLQuery('localhost:8000', query);
                // var entityData = {'foo': 'bar', 'oof': 'rab'};
                // var description = "";
                // for (var key in entityData) {
                //     if (entityData.hasOwnProperty(key)) {
                //         var value = entityData[key];
                //         description += key + ": " + value + "<br>"
                //     }
                // }
                // entity.description = description;
            }
        } else {
            if (typeof lastPick !== 'undefined') {
                lastPick.polygon.material = defaultColor;
                lastPick = undefined;
            }
        }
    } else {
        if (typeof lastPick !== 'undefined') {
            lastPick.polygon.material = defaultColor;
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

pointcloudToggle.addEventListener('change', function() {
    if(this.checked) {
        pointcloudTileset.show = true;
    } else {
        pointcloudTileset.show = false;
    }
});
