/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

require('source-map-support').install();
require('module-alias/register')

import { Container } from "typedi";
import "reflect-metadata";
import * as http from "http";
import config from "./config/config";

//FIXME: use this only for dev/test environment
import { loadData } from "../../fe/src/app/common/test/load_test_data";
import { MockMetadata } from "../../fe/src/app/common/test/mocks/mock-metadata";
import { FrmdbEngine } from "../../fe/src/app/common/frmdb_engine";
import { FrmdbEngineStore } from "../../fe/src/app/common/frmdb_engine_store";
import KeyValueStoreFactory from '@kv_selector_base/key_value_store_impl_selector';

let mockMetadata = new MockMetadata();
let testFrmdbEngine = new FrmdbEngine(new FrmdbEngineStore(KeyValueStoreFactory), mockMetadata.schema);

new Promise(resolve => setTimeout(() => resolve(), 5000))
.then(() => this.testFrmdbEngine.init(true))
.then(() => loadData(testFrmdbEngine, mockMetadata))
.then(() => {
  // Init the express application
  const app = require("./config/express").default();

  const server: http.Server = http.createServer(app);

  server.listen(config.port);

  server.on("error", (e: Error) => {
    console.log("Error starting server" + e);
  });

  server.on("listening", () => {
    console.log("Server started on port " + config.port);
  });
})
.catch(ex => {console.error('cannot load test data', ex), process.exit(1);})

// import { FrmdbEngine } from "./frmdb_engine";

// new FrmdbEngine().init();
