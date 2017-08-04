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

viewer.terrainProvider = terrainProvider;

var layers = viewer.imageryLayers;
var baseLayerPicker = new Cesium.BaseLayerPicker('baseLayerPickerContainer', {
    globe : viewer.scene.globe,
    imageryProviderViewModels : imageryViewModels
});


var tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
    url: '../data/pointcloud/tileset.json'
}));

tileset.style = new Cesium.Cesium3DTileStyle({
    pointSize : 3
});

var defaultColor = Cesium.Color.YELLOW.withAlpha(0.5);
viewer.dataSources.add(Cesium.GeoJsonDataSource.load('../data/polygons/footprint.json', {
    fill: defaultColor,
    clampToGround: true
}));

tileset.readyPromise.then(function() {
    console.log('Loaded tileset');
    var bounding = tileset._root._boundingVolume;
    var center = bounding.boundingSphere.center;
    var cart = Cesium.Ellipsoid.WGS84.cartesianToCartographic(center);
    var dest = Cesium.Cartesian3.fromDegrees(
            cart.longitude * (180 / Math.PI),
            cart.latitude * (180 / Math.PI),
            bounding._boundingSphere.radius * 2.2);
    viewer.camera.setView({ destination: dest });
});

var lastPick;
var highlightColor = Cesium.Color.RED.withAlpha(0.5);
viewer.selectedEntityChanged.addEventListener(function(entity) {
    if (typeof entity.polygon !== 'undefined') {
        if (entity !== lastPick) {
            if (typeof lastPick !== 'undefined') {
                lastPick.polygon.material = defaultColor;
            }
            entity.polygon.material = highlightColor;
            lastPick = entity;
        }
    } else {
        if (typeof lastPick !== 'undefined') {
            lastPick.polygon.material = defaultColor;
            lastPick = undefined;
        }
    }
});





// var styles = [];

// function addStyle(name, style) {
//     style.pointSize = Cesium.defaultValue(style.pointSize, 5.0);
//     styles.push({
//         name : name,
//         style : style
//     });
// }

// addStyle('No Style', {});
// addStyle('Red', {
//     color : "color('#ff0000')"
// });

// function setStyle(style) {
//     return function() {
//         tileset.style = new Cesium.Cesium3DTileStyle(style);
//     };
// }

// var styleOptions = [];
// for (var i = 0; i < styles.length; ++i) {
//     var style = styles[i];
//     styleOptions.push({
//         text : style.name,
//         onselect : setStyle(style.style)
//     });
// }