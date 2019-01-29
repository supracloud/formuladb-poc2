/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

require('source-map-support').install();
require('module-alias/register')

import { Container } from "typedi";
import "reflect-metadata";
import * as http from "http";
import config from "./config/config";

//FIXME: use this only for dev/test environment
import { loadTestData } from "@core/test/load_test_data";
import { MockMetadata, ExampleApps } from "@core/test/mocks/mock-metadata";
import { FrmdbEngine } from "@core/frmdb_engine";
import { FrmdbEngineStore } from "@core/frmdb_engine_store";
import { getFrmdbEngine } from '@storage/key_value_store_impl_selector';

let mockMetadata = new MockMetadata(ExampleApps.inventory);
let testFrmdbEngine: FrmdbEngine;

new Promise(resolve => setTimeout(() => resolve(), 5000))
.then(async () => {
  testFrmdbEngine = await getFrmdbEngine(mockMetadata.schema);
  await testFrmdbEngine.init(true);
  await loadTestData(testFrmdbEngine, mockMetadata)
})
.then(() => {
  // Init the express application
  const app = require("./config/express").default(testFrmdbEngine);

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
