require('source-map-support').install();
require('module-alias/register');
const fs = require('fs');
const yaml = require('js-yaml');
const csv = require("csv");

import { MockMetadata, App_booking, Schema_booking } from "@test/mocks/mock-metadata";
import { MockData } from "./mocks/mock-data";

/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

const mockMetadata = new MockMetadata();
const mockData = new MockData({});

function writeFile(appName: string, data: any, fileName: string) {
    let appDir = __dirname + '/../../../apps/' + appName;
    if (!fs.existsSync(appDir)){
        fs.mkdirSync(appDir);
    }
    console.log(appDir, fileName);
    if (data instanceof Array) {
        csv.stringify(data, {header: true}, (err, csvData) => {
            if (err) throw err;
            fs.writeFileSync(appDir + '/' + fileName, csvData);
        })
    } else {
        fs.writeFileSync(appDir + '/' + fileName, yaml.safeDump(data, {
            flowLevel: 4,
        }));
    }
}

for (let app of [ App_booking]) {
    let appName = app._id.replace(/App~~/, '');
    writeFile(appName, app, 'App.yml');
}

for (let schema of [Schema_booking]) {
    let appName = schema._id.replace(/FRMDB_SCHEMA~~/, '');
    writeFile(appName, schema, 'Schema.yml');

    for (let entityId of Object.keys(schema.entities)) {
        writeFile(appName, mockData.getAllForPath(entityId + "~~"), entityId + '.csv');
    }
}
