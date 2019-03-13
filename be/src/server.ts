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
import { MockMetadata } from "@core/test/mocks/mock-metadata";
import { FrmdbEngine } from "@core/frmdb_engine";
import { getFrmdbEngine, getKeyValueStoreFactory } from '@storage/key_value_store_impl_selector';
import { App } from "@core/domain/app";
import { KeyValueStoreFactoryI } from "@core/key_value_store_i";

let kvsFactory: KeyValueStoreFactoryI;
const devMode = true;

new Promise(resolve => setTimeout(() => resolve(), 5000))
.then(async () => {
  if (devMode) {
    kvsFactory = await loadTestData();
  } else {
    kvsFactory = await getKeyValueStoreFactory();
  }
})
.then(() => {
  // Init the express application
  const app = require("./config/express").default(kvsFactory);

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
