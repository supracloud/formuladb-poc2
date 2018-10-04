/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import * as bodyParser from "body-parser";
import config from "./config";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as logger from "morgan";
import * as path from "path";

import { Container } from "typedi";
import { FrmdbEngine } from "../../../fe/src/app/common/frmdb_engine";
import { KeyValueStores } from "../keyValueStores";
import { FrmdbEngineStore } from "../../../fe/src/app/common/frmdb_engine_store";
import { SchemaDAO } from "../../../fe/src/app/common/domain/metadata/schema_dao";


export default function (db) {
    var app: express.Express = express();

    app.use(logger("dev"));
    app.use(cookieParser());
    app.use(require('express-session')({
        secret: 'blabblabla',
        resave: false,
        saveUninitialized: true
    }))

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    let kvs = Container.get(KeyValueStores);
    var frmdbEngine = new FrmdbEngine(new FrmdbEngineStore(kvs.transactionsDB, kvs.dataDB, kvs.locksDB), {_id: 'FRMDB_SCHEMA', entities: {}});

    app.get('/', function (req, res) {
        res.json({ message: 'test' });
    });

    app.get('/query/:dbname/:id', function (req, res) {
        res.json({ message: 'test' });
    });

    app.post('/api/event', function (req, res) {
        frmdbEngine.processEvent(req.body)
            .then(notif => res.json(notif))
            .catch(err => console.error(err));
    });

    // catch 404 and forward to error handler
    app.use((req: express.Request, res: express.Response, next: Function): void => {
        let err: Error = new Error("Not Found");
        next(err);
    });

    // production error handler
    app.use((err: any, req: express.Request, res: express.Response, next): void => {
        res.status(err.status || 500).json({
            message: err.message,
            error: {}
        });
    });

    if (app.get("env") === "development") {
        app.use((err: Error, req: express.Request, res: express.Response, next): void => {
            res.status(500).json({
                message: err.message,
                error: err
            });
        });
    }

    return app;
};