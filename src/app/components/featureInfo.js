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
    }`
};

const SparQLQuery = function(serverUrl, query) {
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
};

const buildQuery = function(wkt) {
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

    const shape = wkt.split(' ')[0];
    if (shape === 'POLYGON') {
        query = vsprintf(baseQueries.polygon, [graphs, wkt]);
    } else if (shape === 'POINT') {
        query = vsprintf(baseQueries.point, [graphs, wkt]);
    }
    return query;
};

const buildDescription = function(entityData) {
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
        property = property.replace(currentSubjectValue.toLowerCase() + '_', '');

        const entry = `
        <tr>
        <td class="text-left">%s</td>
        <td class="text-left">%s</td>
        </tr>
        `;
        description += vsprintf(entry, [capitalizeFirstLetter(property), value]);
    }
    description += `
    </tbody>
    </table>
    </div>
    `;
    return description;
};

const updateDescription = function(entity) {
    const wkt = entityToWKT(entity);
    const query = buildQuery(wkt);
    if (query !== '') {
        auth.prompt().then(function() {
            SparQLQuery(SparQLServer, query).then(function(entityData) {
                entity.description = buildDescription(entityData);
            });
        });
    }
};
