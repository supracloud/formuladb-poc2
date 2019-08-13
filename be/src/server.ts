/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

require('source-map-support').install();
require('module-alias/register');
var chokidar = require('chokidar');

import * as http from 'http';

//FIXME: use this only for dev/test environment
import { getKeyValueStoreFactory } from '@storage/key_value_store_impl_selector';
import { KeyValueStoreFactoryI } from '@core/key_value_store_i';

let kvsFactory: KeyValueStoreFactoryI;

new Promise(resolve => setTimeout(() => resolve(), 5000))
    .then(async () => {
        kvsFactory = await getKeyValueStoreFactory();
    })
    .then(() => {
        // Init the express application
        const app = require('./config/express').default(kvsFactory);

        const server: http.Server = http.createServer(app);

        server.listen(3000);

        server.on('error', (e: Error) => {
            console.log('Error starting server' + e);
        });

        server.on('listening', () => {
            console.log('Server started on port ' + 3000);
        });
    })
    .catch(ex => {
        console.error('error', ex), process.exit(1);
    });

// import { FrmdbEngine } from "./frmdb_engine";

// new FrmdbEngine().init();
// https://codeburst.io/dont-use-nodemon-there-are-better-ways-fc016b50b45e
var watcher = chokidar.watch('.', {
    persistent: true,
    cwd: '/dist-be'
}).on('change', (path) => {
    console.log('change detected on', path, '. Clearing cache ...');
    Object.keys(require.cache).forEach(function(id) {
        delete require.cache[id];
    })
});
