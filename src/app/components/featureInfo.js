'use strict';

const SparQLQuery = function(serverUrl, query, authorize) {
    return new Promise(function(resolve, reject) {
        const headers = new Headers();

        if (authorize) {
            headers.append(
                'Authorization',
                'Basic ' + base64.encode(auth.username + ':' + auth.password)
            );
        }
        headers.append('Accept', 'application/json');
        headers.append('Content-type', 'application/x-www-form-urlencoded');

        const result = fetch(serverUrl, {
            method: 'POST',
            headers: headers,
            mode: 'cors',
            body: 'query=' + encodeURIComponent(query)
        })
            .then(function(response) {
                return response.json();
            })
            .then(function(j) {
                resolve(j);
            })
            .catch(function() {
                if (authorize) {
                    auth.username = '';
                    auth.password = '';
                }
            });
    });
};

const parseURI = function(uri) {
    uri = uri.replace('www.rijkswaterstaat.nl/linked_data/', '148.251.106.132:8092/resource/rws.');
    uri = uri.replace('otl.rws.nl/otl#', '148.251.106.132:8092/resource/otl/');
    return uri;
};

const parseValidationData = function(data) {
    const validationData = {};
    for (let entry of data.results.bindings) {
        validationData[entry.predicate.value] = entry.comment.value;
    }
    return validationData;
};

const buildDescription = function(database, feature, featureInfo, dataValidation) {
    let invalidData;
    if (typeof dataValidation !== 'undefined') {
        dataValidation = parseValidationData(dataValidation);
        invalidData = Object.keys(dataValidation);
    }

    let description = `
    <div data-simplebar class="wrap">
    <table class="table-fill">
    <tbody class="table-hover">

    <thead class="graph-title"><tr><th colspan="2">${database.toUpperCase()}</th></tr></thead>
    <thead class="subject-title"><tr><th colspan="2"><a id="featureURI" target="_blank" href="http://148.251.106.132:8092/resource/rws.${database}/${feature}">${feature}</a></th></tr></thead>
    `;

    for (let result of featureInfo.results.bindings) {
        let comment;
        let predicate = result['p']['value'];
        if (typeof dataValidation !== 'undefined') {
            if (invalidData.includes(predicate)) {
                comment = dataValidation[predicate];
            }
        }
        predicate = predicate.split('/');
        predicate = predicate[predicate.length - 1];
        for (let ns of namespaces) {
            predicate = predicate.replace(ns, '');
        }
        predicate = predicate.replace(feature.toLowerCase() + '_', '');

        let value;
        const objectValue = result['o']['value'];
        const objectType = result['o']['type'];
        let objectID = result['o']['value'].split('/');
        objectID = objectID[objectID.length - 1];
        if (objectType === 'uri') {
            if (
                objectValue.startsWith('http://www.rijkswaterstaat.nl/linked_data/') ||
                objectValue.startsWith('http://148.251.106.132:8092/resource/rws.') ||
                objectValue.startsWith('http://otl.rws.nl/otl#')
            ) {
                const objectURI = parseURI(objectValue);
                value = `<span style="border-bottom: 1px solid; cursor: pointer;" onclick="window.onURI('${objectURI}')" >${objectID}</span>`;
            } else {
                value = `<a target="_blank" href="${objectValue}">${objectID}</a>`;
            }
        } else {
            value = objectValue;
        }

        value = value.replace(/<img src=/g, '<img style="width: 100%;" src=');

        let entry;

        if (typeof comment === 'undefined') {
            entry = `
                <tr>
                <td><div style="display: flex; align-items: center;"><span>${capitalizeFirstLetter(
                    predicate
                )}</span></div></td>
                <td><div style="display: flex; align-items: center;"><span>${value}</span></div></td>
                </tr>
            `;
        } else {
            entry = `
                <tr>
                <td><div style="display: flex; align-items: center;"><span>${capitalizeFirstLetter(
                    predicate
                )}</span></div></td>
                <td><div style="display: flex; align-items: center;"><span>${value}</span><div style="color: red; font-weight: bold;" class="tooltip">&nbsp;&nbsp;!<span class="tooltiptext">${comment}</span></div>
                </div></td>
                </tr>
            `;
        }
        // TODO improve this hacky filtering step
        if (
            !(objectValue.startsWith('x') && objectValue.length > 14 && !objectValue.includes(' '))
        ) {
            description += entry;
        }

        if (predicate === 'label') {
            description = description.replace(`>${feature}</a>`, `>${value}</a>`);
        }
    }
    description += `
    </tbody>
    </table>
    </div>
    `;
    return description;
};

const updateDescription = function(database, id) {
    return new Promise(function(resolve, reject) {
        let query = '';
        if (database === 'otl') {
            query = `select *
                        where {
                            <http://otl.rws.nl/otl#${id}> ?p ?o .
                        }`;
        } else {
            query = `select *
                        where {
                            <http://www.rijkswaterstaat.nl/linked_data/${database}/${id}> ?p ?o .
                        }`;
        }

        if (query !== '') {
            auth.prompt().then(function() {
                if (database === 'disk') {
                    const descriptionPromise = SparQLQuery(SparQLServer, query, true);
                    const dataValidationPromise = SparQLQuery(
                        SparQLServer,
                        `PREFIX rws.disk: <http://www.rijkswaterstaat.nl/linked_data/disk/>
                        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

                        select ?predicate ?object ?comment where {
                            ?_ a rdf:Statement ;
                            rdf:subject rws.disk:${id} ;
                            rdf:predicate ?predicate ;
                            rdf:object ?object ;
                            rdfs:comment ?comment .
                        }`,
                        true
                    );

                    Promise.all([descriptionPromise, dataValidationPromise])
                        .then(entityData => {
                            const description = buildDescription(
                                database,
                                id,
                                entityData[0],
                                entityData[1]
                            );
                            resolve(description);
                        })
                        .catch(e => {
                            reject(e);
                        });
                } else {
                    SparQLQuery(SparQLServer, query, true)
                        .then(entityData => {
                            const description = buildDescription(database, id, entityData);
                            resolve(description);
                        })
                        .catch(e => {
                            reject(e);
                        });
                }
            });
        }
    });
};

const updatePointDescription = function(entity) {
    const fid = Cesium.Property.getValueOrUndefined(entity.properties.FID);
    const name = Cesium.Property.getValueOrUndefined(entity.properties.Naam);
    const number = Cesium.Property.getValueOrUndefined(entity.properties.Nr);

    const description = `<div data-simplebar class="wrap">
    <table class="table-fill">
    <tbody class="table-hover">

    <thead class="graph-title"><tr><th colspan="2">Feature ${fid}</th></tr></thead>

    <tr><td>Naam</td><td>${name}</td></tr>
    <tr><td>Nummer</td><td>${number}</td></tr>

    </tbody>
    </table>
    </div>`;

    entity.description = description;
};

const goBack = function() {
    const uri = descriptionHistory.pop();

    if (typeof uri !== 'undefined') {
        const uriSplit = uri.split('/');
        const database =
            uriSplit[uriSplit.length - 2].split('.')[1] || uriSplit[uriSplit.length - 2];
        const id = uriSplit[uriSplit.length - 1];

        updateDescription(database, id).then(description => {
            frame.contentDocument.body.firstChild.innerHTML = description;
        });
    }
};

{
    const button = document.createElement('button');
    button.id = 'backButton';
    button.className = 'cesium-infoBox-close';
    button.onclick = goBack;
    const text = document.createTextNode('<');
    button.appendChild(text);
    document.querySelector('.cesium-infoBox').appendChild(button);
}
