/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */
 
require('source-map-support').install();
require('module-alias/register');

// Add this to the VERY top of the first file loaded in your app
var apm = require('elastic-apm-node').start({
    // Override service name from package.json
    serviceName: 'formuladb-be',
    // Use if APM Server requires a token
    //secretToken: '',
    serverUrl: 'https://apmserver.formuladb.io',
    // for now send events for both dev and prod. Update in the future to disable dev
    active: true,
    environment: process.env.FRMDB_ENV_NAME || 'not-known',
    // captureBody: true,
    // transactionSampleRate: 1.0,
    verifyServerCert: false,//TODO: fix this
    logUncaughtExceptions: true,
})

import * as http from 'http';

//FIXME: use this only for dev/test environment
import { getKeyValueStoreFactory } from '@storage/key_value_store_impl_selector';
import { KeyValueStoreFactoryI } from "@storage/key_value_store_i";

let kvsFactory: KeyValueStoreFactoryI;

new Promise(resolve => setTimeout(() => resolve(), 2000))
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
            startGitSync();
        });
    })
    .catch(ex => {
        console.error('error', ex), process.exit(1);
    });

// import { FrmdbEngine } from "./frmdb_engine";

// new FrmdbEngine().init();


function startGitSync() {
    console.log("Starting git-sync each 20 sec");
    setInterval(() => {
        runCmd('bash', '/scripts/sync-git.sh');
    }, 20000)
}

var spawn = require('child_process').spawn;
function runCmd(cmd: string, ...args: string[]) {
    var prc = spawn(cmd, args);

    //noinspection JSUnresolvedFunction
    prc.stdout.setEncoding('utf8');
    prc.stdout.on('data', function (data) {
        var str = data.toString()
        var lines = str.split(/(\r?\n)/g);
        console.log(lines.join(""));
    });
    prc.stderr.on('data', function (data) {
        var str = data.toString()
        var lines = str.split(/(\r?\n)/g);
        console.error(lines.join(""));
    });

    prc.on('close', function (code) {
        console.log('process exit code ' + code);
    });
}