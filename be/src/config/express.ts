/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as logger from "morgan";
import * as path from "path";

import { FrmdbEngine } from "@core/frmdb_engine";
import { SimpleAddHocQuery } from "@core/key_value_store_i";


export default function (frmdbEngine: FrmdbEngine) {
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


    app.get('/', function (req, res) {
        res.json({ message: 'test' });
    });

    app.get('/query/:appname/:id', function (req, res) {
        res.json({ message: 'test' });
    });

    app.post('/api/:appname/:entityName/simpleadhocquery', async function(req, res) {
        let query = req.body as SimpleAddHocQuery;
        let ret = await frmdbEngine.frmdbEngineStore.simpleAdHocQuery(req.params.entityName, query);
        res.json(ret);
    });

    app.get('/api/:appname/byprefix/:prefix', async function(req, res) {
        let ret = await frmdbEngine.frmdbEngineStore.getDataListByPrefix(req.params.prefix);
        res.json(ret);
    });
    app.get('/api/:appname/obj/:id', async function(req, res) {
        let obj = await frmdbEngine.frmdbEngineStore.getDataObj(req.params.id);
        res.json(obj);
    });
    app.get('/api/:appname/table/:id', async function(req, res) {
        let table = await frmdbEngine.frmdbEngineStore.getTable(req.params.id);
        res.json(table);
    });
    app.get('/api/:appname/form/:id', async function(req, res) {
        let form = await frmdbEngine.frmdbEngineStore.getForm(req.params.id);
        res.json(form);
    });
    app.get('/api/:appname/schema', async function(req, res) {
        let schema = await frmdbEngine.frmdbEngineStore.getSchema();
        res.json(schema);
    });
    app.get('/api/:appname/entity/:id', async function(req, res) {
        let entity = await frmdbEngine.frmdbEngineStore.getEntity(req.params.id);
        res.json(entity);
    });

    //all write operations are handled via events
    app.post('/api/:appname/event', async function (req, res) {
        return frmdbEngine.processEvent(req.body)
            .then(notif => res.json(notif))
            .catch(err => console.error(err));
    });


    //TODO: these APIs are mostly for OAM, should probably not be used directly by end-users
    app.put('/api/:appname/schema', async function(req, res) {
        return frmdbEngine.frmdbEngineStore.init(req.body)
            .then(ret => res.json(ret))
            .catch(err => console.error(err));
    });
    app.put('/api/:appname/bulk', async function(req, res) {
        return frmdbEngine.frmdbEngineStore.putBulk(req.body)
            .then(ret => res.json(ret))
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