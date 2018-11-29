const providers = {};

providers.terrain = {
    cesiumWorld: Cesium.createWorldTerrain(),
    ellipsoid: new Cesium.EllipsoidTerrainProvider(),
    viewModels: [
        new Cesium.ProviderViewModel({
            name: 'Cesium World Terrain',
            iconUrl: Cesium.buildModuleUrl(
                'Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'
            ),
            creationFunction: function() {
                return providers.terrain.cesiumWorld;
            }
        }),
        new Cesium.ProviderViewModel({
            name: 'World Ellipsoid',
            iconUrl: Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/Ellipsoid.png'),
            creationFunction: function() {
                return providers.terrain.ellipsoid;
            }
        })
    ]
};

providers.baseLayers = {
    aerial2016wms: new Cesium.WebMapServiceImageryProvider({
        url: 'https://geodata.nationaalgeoregister.nl/luchtfoto/rgb/wms?',
        layers: '2016_ortho25',
        credit: new Cesium.Credit('PDOK'),
        enablePickFeatures: false
    }),
    aerial2017wms: new Cesium.WebMapServiceImageryProvider({
        url: 'https://geodata.nationaalgeoregister.nl/luchtfoto/rgb/wms?',
        layers: '2017_ortho25',
        credit: new Cesium.Credit('PDOK'),
        enablePickFeatures: false
    }),
    BRT: new Cesium.WebMapTileServiceImageryProvider({
        url: 'https://geodata.nationaalgeoregister.nl/tiles/service/wmts?',
        layer: 'brtachtergrondkaart',
        style: 'default',
        format: 'image/png',
        tileMatrixSetID: 'EPSG:3857',
        tileMatrixLabels: [
            'EPSG:3857:0',
            'EPSG:3857:1',
            'EPSG:3857:2',
            'EPSG:3857:3',
            'EPSG:3857:4',
            'EPSG:3857:5',
            'EPSG:3857:6',
            'EPSG:3857:7',
            'EPSG:3857:8',
            'EPSG:3857:9',
            'EPSG:3857:10',
            'EPSG:3857:11',
            'EPSG:3857:12',
            'EPSG:3857:13',
            'EPSG:3857:14',
            'EPSG:3857:15',
            'EPSG:3857:16',
            'EPSG:3857:17',
            'EPSG:3857:18',
            'EPSG:3857:19'
        ],
        maximumLevel: 19,
        credit: new Cesium.Credit('PDOK'),
        enablePickFeatures: false
    }),
    BRTgrijs: new Cesium.WebMapTileServiceImageryProvider({
        url: 'https://geodata.nationaalgeoregister.nl/tiles/service/wmts?',
        layer: 'brtachtergrondkaartgrijs',
        style: 'default',
        format: 'image/png',
        tileMatrixSetID: 'EPSG:3857',
        tileMatrixLabels: [
            'EPSG:3857:0',
            'EPSG:3857:1',
            'EPSG:3857:2',
            'EPSG:3857:3',
            'EPSG:3857:4',
            'EPSG:3857:5',
            'EPSG:3857:6',
            'EPSG:3857:7',
            'EPSG:3857:8',
            'EPSG:3857:9',
            'EPSG:3857:10',
            'EPSG:3857:11',
            'EPSG:3857:12',
            'EPSG:3857:13',
            'EPSG:3857:14',
            'EPSG:3857:15',
            'EPSG:3857:16',
            'EPSG:3857:17',
            'EPSG:3857:18',
            'EPSG:3857:19'
        ],
        maximumLevel: 19,
        credit: new Cesium.Credit('PDOK'),
        enablePickFeatures: false
    }),
    viewModels: [
        new Cesium.ProviderViewModel({
            name: 'PDOK Luchtfoto 2016',
            iconUrl: Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/bingAerial.png'),
            tooltip: 'PDOK Luchtfoto 2016 25cm',
            creationFunction: function() {
                return providers.baseLayers.aerial2016wms;
            }
        }),
        new Cesium.ProviderViewModel({
            name: 'PDOK Luchtfoto 2017',
            iconUrl: Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/bingAerial.png'),
            tooltip: 'PDOK Luchtfoto 2017 25cm',
            creationFunction: function() {
                return providers.baseLayers.aerial2017wms;
            }
        }),
        new Cesium.ProviderViewModel({
            name: 'BRT',
            iconUrl: Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/openStreetMap.png'),
            tooltip: 'Basis Registratie Topografie',
            creationFunction: function() {
                return providers.baseLayers.BRT;
            }
        }),
        new Cesium.ProviderViewModel({
            name: 'BRT Grijs',
            iconUrl: Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/openStreetMap.png'),
            tooltip: 'Basis Registratie Topografie',
            creationFunction: function() {
                return providers.baseLayers.BRTgrijs;
            }
        })
    ]
};

providers.imagery = {
    bag: new Cesium.ImageryLayer(
        new Cesium.WebMapServiceImageryProvider({
            url: 'https://geodata.nationaalgeoregister.nl/bag/wms',
            layers: 'pand',
            parameters: {
                transparent: 'true',
                format: 'image/png'
            },
            credit: new Cesium.Credit('PDOK')
        }),
        { show: false }
    ),
    brk: new Cesium.ImageryLayer(
        new Cesium.WebMapServiceImageryProvider({
            url: 'https://geodata.nationaalgeoregister.nl/kadastralekaartv3/wms',
            layers: 'perceel',
            parameters: {
                transparent: 'true',
                format: 'image/png'
            },
            credit: new Cesium.Credit('PDOK')
        }),
        { show: false }
    ),
    addImagery: function() {
        for (let layer of Object.values(this)) {
            if (typeof layer === 'object') {
                viewer.scene.imageryLayers.add(layer);
            }
        }
    }
};

providers.tilesets = {};
providers.tilesets.mesh = {
    meshTileset: new Cesium.Cesium3DTileset({
        url: '../data/mesh/tileset.json',
        show: false
    }),
    addTilesets: function() {
        for (let tileset of Object.values(this)) {
            if (typeof tileset === 'object') {
                viewer.scene.primitives.add(tileset);
            }
        }
    },
    offsetTilesets: function(offset) {
        for (let tileset of Object.values(this)) {
            if (typeof tileset === 'object') {
                tileset.readyPromise.then(function() {
                    const bounding = tileset._root._boundingVolume;
                    const center = bounding.boundingSphere.center;
                    const cart = Cesium.Ellipsoid.WGS84.cartesianToCartographic(center);

                    const surface = Cesium.Cartesian3.fromRadians(
                        cart.longitude,
                        cart.latitude,
                        0.0
                    );
                    const offsetCart = Cesium.Cartesian3.fromRadians(
                        cart.longitude,
                        cart.latitude,
                        offset
                    );
                    const translation = Cesium.Cartesian3.subtract(
                        offsetCart,
                        surface,
                        new Cesium.Cartesian3()
                    );
                    tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
                });
            }
        }
    }
};

providers.tilesets.pointcloud = {
    ahn3Tileset: new Cesium.Cesium3DTileset({
        url: '../data/pointcloud/ahn3/tileset.json',
        show: false,
        pointCloudShading: {
            attenuation: true,
            maximumAttenuation: 2.0
        }
    }),
    ahn2Tileset: new Cesium.Cesium3DTileset({
        url: '../data/pointcloud/ahn2/tileset.json',
        show: false,
        pointCloudShading: {
            attenuation: true,
            maximumAttenuation: 2.0
        }
    }),
    zaltbommelBrugTileset: new Cesium.Cesium3DTileset({
        url: '../data/pointcloud/zaltbommel/tileset.json',
        pointCloudShading: {
            attenuation: true,
            maximumAttenuation: 2.0
        }
    }),
    addTilesets: function() {
        for (let tileset of Object.values(this)) {
            if (typeof tileset === 'object') {
                viewer.scene.primitives.add(tileset);
            }
        }
    },
    offsetTilesets: function(offset) {
        for (let tileset of Object.values(this)) {
            if (typeof tileset === 'object') {
                tileset.readyPromise.then(function() {
                    const bounding = tileset._root._boundingVolume;
                    const center = bounding.boundingSphere.center;
                    const cart = Cesium.Ellipsoid.WGS84.cartesianToCartographic(center);

                    const surface = Cesium.Cartesian3.fromRadians(
                        cart.longitude,
                        cart.latitude,
                        0.0
                    );
                    const offsetCart = Cesium.Cartesian3.fromRadians(
                        cart.longitude,
                        cart.latitude,
                        offset
                    );
                    const translation = Cesium.Cartesian3.subtract(
                        offsetCart,
                        surface,
                        new Cesium.Cartesian3()
                    );
                    tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
                });
            }
        }
    }
};

providers.entities = {
    kunstwerken: new Cesium.Entity({
        name: 'kunstwerken',
        show: false
    }),
    beheerobjecten: new Cesium.Entity({
        name: 'beheerobjecten',
        show: false
    }),
    bim: new Cesium.Entity({
        name: 'bim',
        show: false
    }),
    addKunstwerken: function() {
        const source = new Cesium.GeoJsonDataSource({
            name: 'kunstwerken'
        });

        source
            .load('../data/features/A10A1A6_kunstwerken.json', {
                fill: defaultColor,
                clampToGround: true
            })
            .then(
                function() {
                    for (let entity of source.entities.values) {
                        viewer.entities.add({
                            parent: this.kunstwerken,
                            polygon: entity.polygon,
                            properties: entity.properties,
                            name: entity.properties.NAAM,
                            description: loadingDescription
                        });
                    }
                }.bind(this)
            );
    },
    addBeheerobjecten: function() {
        const source = new Cesium.GeoJsonDataSource({
            name: 'beheerobjecten'
        });

        source
            .load('../data/features/A10_beheerobjecten.json', {
                color: defaultColor,
                clampToGround: true
            })
            .then(
                function() {
                    for (let entity of source.entities.values) {
                        viewer.entities.add({
                            parent: this.beheerobjecten,
                            position: entity.position,
                            billboard: entity.billboard,
                            properties: entity.properties,
                            name: entity.properties.naam,
                            description: loadingDescription
                        });
                    }
                }.bind(this)
            );
    },
    addBIM: function() {
        const source = new Cesium.GeoJsonDataSource({
            name: 'BIM'
        });

        source
            .load('../data/features/bim_locations.json', {
                fill: defaultColor,
                clampToGround: true
            })
            .then(
                function() {
                    for (let entity of source.entities.values) {
                        viewer.entities.add({
                            parent: this.bim,
                            polygon: entity.polygon,
                            properties: entity.properties,
                            name: entity.properties.naam,
                            description: loadingDescription
                        });
                    }
                }.bind(this)
            );
    },
    addAll: function() {
        for (let loadFunction of Object.values(this)) {
            if (typeof loadFunction === 'function' && loadFunction.name !== 'addAll') {
                loadFunction.call(this);
            }
        }
    }
};
