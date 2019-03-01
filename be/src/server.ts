/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

require('source-map-support').install();
require('module-alias/register')

import "reflect-metadata";
import * as http from "http";

//FIXME: use this only for dev/test environment
import { loadTestData } from "@core/test/load_test_data";
import { MockMetadata, ExampleApps } from "@core/test/mocks/mock-metadata";
import { FrmdbEngine } from "@core/frmdb_engine";
import { getFrmdbEngine } from '@storage/key_value_store_impl_selector';

let frmdbEngine: FrmdbEngine;
const devMode = true;
let mockMetadata = new MockMetadata(ExampleApps.test);

new Promise(resolve => setTimeout(() => resolve(), 5000))
.then(async () => {
  if (devMode) {
    frmdbEngine = await loadTestData(mockMetadata.schema)
  } else {
    frmdbEngine = await getFrmdbEngine({_id: "FRMDB_SCHEMA", entities: {}});
    let schema = await frmdbEngine.frmdbEngineStore.getSchema();
    if (schema) {
      frmdbEngine.frmdbEngineStore.setSchema(schema);
    }
    await frmdbEngine.init(true);
  }
})
.then(() => {
  // Init the express application
  const app = require("./config/express").default(frmdbEngine);

  const server: http.Server = http.createServer(app);

  server.listen(3000);

  server.on("error", (e: Error) => {
    console.log("Error starting server" + e);
  });

  server.on("listening", () => {
    console.log("Server started on port " + 3000);
  });
})
.catch(ex => {console.error('cannot load test data', ex), process.exit(1);})

// import { FrmdbEngine } from "./frmdb_engine";

// new FrmdbEngine().init();
