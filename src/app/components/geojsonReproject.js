const reprojectGeometry = function(geometry, from, to) {
    if (geometry.type === 'Point') {
        geometry.coordinates = proj4(from, to, geometry.coordinates);
    } else if (geometry.type === 'LineString' || geometry.type === 'MultiPoint') {
        for (let i = 0; i < geometry.coordinates.length; i++) {
            geometry.coordinates[i] = proj4(from, to, geometry.coordinates[i]);
        }
    } else if (geometry.type === 'Polygon' || geometry.type === 'MultiLineString') {
        for (let i = 0; i < geometry.coordinates.length; i++) {
            for (let j = 0; j < geometry.coordinates[i].length; j++) {
                geometry.coordinates[i][j] = proj4(from, to, geometry.coordinates[i][j]);
            }
        }
    } else if (geometry.type === 'MultiPolygon') {
        for (let i = 0; i < geometry.coordinates.length; i++) {
            for (let j = 0; j < geometry.coordinates[i].length; j++) {
                for (let k = 0; k < geometry.coordinates[i][j].length; k++) {
                    geometry.coordinates[i][j][k] = proj4(from, to, geometry.coordinates[i][j][k]);
                }
            }
        }
    } else {
        console.error('Geometry type not recognized.');
        return;
    }
    return geometry;
};

const reprojectGeojson = function(geojson, from, to) {
    if (geojson.type === 'FeatureCollection') {
        for (let i = 0; i < geojson.features.length; i++) {
            geojson.features[i].geometry = reprojectGeometry(
                geojson.features[i].geometry,
                from,
                to
            );
        }
    } else if (geojson.type === 'Feature') {
        geojson.geometry = reprojectGeometry(geojson.geometry, from, to);
    }

    if (typeof geojson.crs.properties.name !== 'undefined') {
        geojson.crs.properties.name = geojson.crs.properties.name.replace(
            from.split(':')[1],
            to.split(':')[1]
        );
    }
    return geojson;
};
