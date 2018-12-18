const coordWgsToRD = function(coord) {
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
};

const polygonToWKT = function(vertices) {
    let wkt = 'POLYGON ((';
    for (let v of vertices) {
        const rd = coordWgsToRD(v);
        wkt += rd[0] + ' ' + rd[1] + ', ';
    }
    wkt = wkt.slice(0, wkt.length - 2);
    wkt += '))';
    return wkt;
};

const pointToWKT = function(vertex) {
    const rd = coordWgsToRD(vertex);
    const wkt = 'POINT (' + rd[0] + ' ' + rd[1] + ')';
    return wkt;
};

const wktToCoord = function(wkt) {
    const wktSplit = wkt.split(' ');
    let x = wktSplit[1];
    x = x.replace('(', '');
    let y = wktSplit[2];
    return { x: parseFloat(x), y: parseFloat(y) };
};

const removeZ = function(wkt) {
    const wktSplit = wkt.split(',');
    if (wktSplit.length > 1) {
        if (wktSplit[1].split(' ').length > 2) {
            wkt = wkt.replace(/ [^\s\)]+,/g, ',').replace(/ [^\s\)]+[)]/g, ')');
        }
    } else if (wktSplit[0].split(' ').length > 3) {
        wkt = wkt.replace(/ [^\s\)]+[)]/g, ')');
    }
    return wkt;
};

const entityToWKT = function(entity) {
    let wkt;
    if (typeof entity.polygon !== 'undefined') {
        const coords = ellipsoid.cartesianArrayToCartographicArray(
            entity.polygon.hierarchy.getValue().positions
        );
        wkt = polygonToWKT(coords);
    } else if (typeof entity.billboard !== 'undefined') {
        const coord = ellipsoid.cartesianToCartographic(entity.position.getValue());
        wkt = pointToWKT(coord);
    } else {
        return;
    }
    return wkt;
};
