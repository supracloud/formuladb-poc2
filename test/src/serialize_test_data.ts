var fs = require('fs');
import { MockMetadata } from "@test/mocks/mock-metadata";

/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

const mockMetadata = new MockMetadata();

function writeFile(appName: string, data: any, fileName: string) {
    let appDir = __dirname + '/../../../apps/' + appName;
    if (!fs.existsSync()){
        fs.mkdirSync(appDir);
    }
    fs.writeFileSync(appDir + '/' + fileName, JSON.stringify(data));
}

for (let app of mockMetadata.apps) {
    let appName = app._id.replace(/App~~/, '');
    writeFile(appName, app, 'App.json');
}

for (let schema of mockMetadata.schemas) {
    let appName = schema._id.replace(/FRMDB_SCHEMA~~/, '');
    writeFile(appName, schema, 'Schema.json');
}
