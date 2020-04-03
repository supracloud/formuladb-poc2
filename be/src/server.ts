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
import { fixHtml } from './frmdb-cli/fix-html';
import { initDb } from './frmdb-cli/init-db';

require('yargs')
    .scriptName("frmdb-be")
    .usage('$0 <cmd> [args]')
    .command('start [opts]', 'start http server', (yargs) => {
        yargs.option('port', {
            type: 'number',
            default: '3000',
            describe: 'the port to listen'
        })
    }, function (argv) {
        startServer(argv.port)
    })
    .command('init-db', 'initialize database from git lfs backup', {}, async (argv) => {
        let kvsFactory = await getKeyValueStoreFactory();
        initDb(kvsFactory);
    })
    .command('fix-html [files..]', 'fix html', {}, (argv) => {
        fixHtml(argv.files)
    })
    .help()
    .argv


async function startServer(port: number) {
    try {
        let kvsFactory = await getKeyValueStoreFactory();

        // Init the express application
        const app = require('./config/express').default(kvsFactory);

        const server: http.Server = http.createServer(app);

        server.listen(port);

        server.on('error', (e: Error) => {
            console.log('Error starting server' + e);
        });

        server.on('listening', () => {
            console.log('Server started on port ' + port);
            startGitSync();
        });
    } catch (ex) {
        console.error('error', ex), process.exit(1);
    }
}

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