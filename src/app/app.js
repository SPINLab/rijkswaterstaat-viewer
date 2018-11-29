'use strict';

// CONSTANTS
Cesium.Ion.defaultAccessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiNmYzNDQyYi01NjA1LTRlMGEtYjIwNy1jYTdlYjI0YjRjYTgiLCJpZCI6NDk1LCJzY29wZXMiOlsiYXNyIiwiZ2MiXSwiaWF0IjoxNTM5MzQ5MDIyfQ.cGZC70v3soK3viTM4BqSonUWuP4zppbmISw6ZX_3Qwc';
const pointcloudHeightOffset = 6;
const meshHeightOffset = 50;
const homeView = { x: 3902197, y: 334558, z: 5047216 };
const namespaces = ['22-rdf-syntax-ns#', 'rdf-schema#', 'geosparql#'];
const SparQLServer = 'http://148.251.106.132:8092/repositories/rwsld';
const defaultColor = Cesium.Color.YELLOW.withAlpha(0.5);
const highlightColor = Cesium.Color.RED.withAlpha(0.5);

// Viewer
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
