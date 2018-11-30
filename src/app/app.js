'use strict';

// CONSTANTS
const pointcloudHeightOffset = 6;
const meshHeightOffset = 50;
const homeView = { x: 3902197, y: 334558, z: 5047216 };
const namespaces = ['22-rdf-syntax-ns#', 'rdf-schema#', 'geosparql#'];
const SparQLServer = 'http://148.251.106.132:8092/repositories/rwsld';
const highlightColor = Cesium.Color.YELLOW.withAlpha(0.5);
const colors = {
    disk: '#4286f4',
    kerngis: '#f45941',
    ultimo: '#c141f4'
};

// Viewer
const viewer = new Cesium.Viewer('cesiumContainer', {
    baseLayerPicker: true,
    animation: false,
    timeline: false,
    vrButton: false,
    sceneModePicker: false,
    navigationInstructionsInitiallyVisible: false,
    selectionIndicator: false,
    terrainProvider: providers.terrain.cesiumWorld,
    terrainProviderViewModels: providers.terrain.viewModels,
    imageryProvider: false,
    imageryProviderViewModels: providers.baseLayers.viewModels,
    requestRenderMode: true,
    maximumRenderTimeChange: Infinity
});
const ellipsoid = viewer.scene.globe.ellipsoid;
viewer.scene.globe.depthTestAgainstTerrain = false;
// viewer.scene.globe.enableLighting = true;

viewer.camera.setView({ destination: homeView });
viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function(commandInfo) {
    viewer.camera.setView({ destination: homeView });
    commandInfo.cancel = true;
});

providers.imagery.addImagery();
providers.tilesets.pointcloud.addTilesets();
providers.tilesets.pointcloud.offsetTilesets(6);
providers.tilesets.mesh.addTilesets();
providers.tilesets.mesh.offsetTilesets(50);
providers.entities.addAll();

let lastPick;
viewer.selectedEntityChanged.addEventListener(function(entity) {
    if (typeof entity !== 'undefined') {
        if (typeof entity.polygon !== 'undefined') {
            if (entity !== lastPick) {
                if (typeof lastPick !== 'undefined') {
                    const database = Cesium.Property.getValueOrUndefined(
                        lastPick.properties.database
                    );
                    lastPick.polygon.material = Cesium.Color.fromCssColorString(colors[database]);
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
                const database = Cesium.Property.getValueOrUndefined(lastPick.properties.database);
                lastPick.polygon.material = Cesium.Color.fromCssColorString(colors[database]);
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
            const database = Cesium.Property.getValueOrUndefined(lastPick.properties.database);
            lastPick.polygon.material = Cesium.Color.fromCssColorString(colors[database]);
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

diskShowToggle.addEventListener('change', function() {
    providers.entities.disk.show = this.checked;
    viewer.scene.requestRender();
});

kerngisShowToggle.addEventListener('change', function() {
    providers.entities.kerngis.show = this.checked;
    viewer.scene.requestRender();
});

ultimoShowToggle.addEventListener('change', function() {
    providers.entities.ultimo.show = this.checked;
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

bagToggle.addEventListener('change', function() {
    providers.imagery.bag.show = this.checked;
    viewer.scene.requestRender();
});

brkToggle.addEventListener('change', function() {
    providers.imagery.brk.show = this.checked;
    viewer.scene.requestRender();
});

diskToggle.addEventListener('change', function() {
    if (typeof viewer.selectedEntity !== 'undefined' && viewer.selectedEntity.id !== 'None') {
        viewer.selectedEntity.description = loadingDescription;
        updateDescription(viewer.selectedEntity);
    }
});

kerngisToggle.addEventListener('change', function() {
    if (typeof viewer.selectedEntity !== 'undefined' && viewer.selectedEntity.id !== 'None') {
        viewer.selectedEntity.description = loadingDescription;
        updateDescription(viewer.selectedEntity);
    }
});

ultimoToggle.addEventListener('change', function() {
    if (typeof viewer.selectedEntity !== 'undefined' && viewer.selectedEntity.id !== 'None') {
        viewer.selectedEntity.description = loadingDescription;
        updateDescription(viewer.selectedEntity);
    }
});
