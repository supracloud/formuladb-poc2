require('source-map-support').install();

import { Container } from "typedi";
import "reflect-metadata";
import * as http from "http";
import config from "./config/config";

//FIXME: use this only for dev/test environment
import { loadData } from "./tests/loadTestData";
import { KeyValueStores } from "./keyValueStores";

let kvs = Container.get(KeyValueStores);

new Promise(resolve => setTimeout(() => resolve(), 5000))
.then(() => kvs.init())
.then(() => loadData())
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
