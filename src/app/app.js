var style = document.createElement('style');
style.innerHTML = "body, html { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; } #top { display: none; }"
document.body.appendChild(style);

Cesium.BingMapsApi.defaultKey = 'AgctUkAssjrKQ55wNUHiskdz0nbRWKfkkGHhSV4mjNrlMCEiKA3aJCYbDEEaxH7C';

var imageryProviders = Cesium.createDefaultImageryProviderViewModels();
var terrainProviders = Cesium.createDefaultTerrainProviderViewModels();

var viewer = new Cesium.Viewer('cesiumContainer', {
    imageryProviderViewModels: imageryProviders,
    selectedImageryProviderViewModel: imageryProviders[6],
    terrainProviderViewModels: terrainProviders,
    selectedTerrainProviderViewModel: terrainProviders[1],
    animation: false,
    timeline: false,
    vrButton: true,
    sceneModePicker: false,
    navigationInstructionsInitiallyVisible: false
});

var tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
    url: '../data/tileset.json'
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



// tileset.style = new Cesium.Cesium3DTileStyle(tileset, style);