/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as logger from "morgan";
import * as passport from "passport";
import * as connectEnsureLogin from "connect-ensure-login";
import { Strategy as LocalStrategy } from "passport-local";
import * as md5 from 'md5';
import * as proxy from 'http-proxy-middleware';
import * as path from 'path';


import { FrmdbEngine } from "@core/frmdb_engine";
import { SimpleAddHocQuery, KeyValueStoreFactoryI, KeyTableStoreI } from "@core/key_value_store_i";
import { FrmdbEngineStore } from "@core/frmdb_engine_store";
import { $User } from "@domain/metadata/default-metadata";
import { BeUser } from "@domain/user";

let frmdbEngines: Map<string, FrmdbEngine> = new Map();

const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
const SECRET = 'bla-bla-secret';

const STATIC_EXT = [
    '.js',
    '.ico',
    '.css',
    '.png',
    '.jpg',
    '.woff2',
    '.woff',
    '.ttf',
    '.svg',
  ];

export default function (kvsFactory: KeyValueStoreFactoryI) {
    var app: express.Express = express();
    var kvs$User: KeyTableStoreI<BeUser>;

    async function getFrmdbEngine(appName: string) {
        let frmdbEngine = frmdbEngines.get(appName);
        if (!frmdbEngine) {
            let schema = await kvsFactory.getSchema("FRMDB_SCHEMA~~" + appName);
            if (!schema) throw new Error("The app does not exist " + appName);
            frmdbEngine = new FrmdbEngine(new FrmdbEngineStore(kvsFactory, schema));
            frmdbEngines.set(appName, frmdbEngine);
        }
        return frmdbEngine;
    }

    async function getUserKvs() {
        if (!kvs$User) {
            kvs$User = await kvsFactory.createKeyTableS<BeUser>($User);
        } 
        return Promise.resolve(kvs$User);
    }

    passport.use("user-pass", new LocalStrategy(
        async function (username, password, cb) {
            try {
                let userKVS = await getUserKvs();
                let user = await userKVS.get('$User~~' + username);
                if (!user) return cb(null, false);
                let hashedPass = md5(password);
                if (user.password != hashedPass) { return cb(null, false); }
                return cb(null, user);
            } catch (err) {
                return cb(err);
            }
        }
    ));
    passport.serializeUser(function (user: BeUser, cb) {
        cb(null, user._id);
    });
    passport.deserializeUser(async function (id, cb) {
        try {
            let userKVS = await getUserKvs();
            let user = await userKVS.get('$User~~' + id);
            if (!user) return cb(new Error("User " + id + " forbidden or not found !"));
            return cb(null, user);
        } catch (err) {
            return cb(err);
        }
    }); 

    app.use(logger("dev"));
    app.use(cookieParser(SECRET));
    app.use(require('express-session')({
        secret: SECRET,
        resave: false,
        saveUninitialized: true
    }))

    //This needs to be before express bodyParser: https://github.com/nodejitsu/node-http-proxy/issues/180
    if (process.env.FRMDB_PROXY) {
        let httpProxy = proxy({ target: process.env.FRMDB_PROXY });
        app.use(function (req, res, next) {
            if (/\/formuladb.*/.test(req.path)) {
                next();
            } else {
                httpProxy(req, res, next);
            }
        });
    }

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    if (process.env.FRMDB_AUTH_ENABLED === "true") {
        app.use(passport.initialize());
        app.use(passport.session());
        app.use(function (req, res, next) {
            if (req.path !== '/formuladb-api/login') {
                connectEnsureLogin.ensureLoggedIn('/formuladb-api/login')(req, res, next);
            } else next();
        });
        app.post('/formuladb-api/login',
            passport.authenticate('user-pass', { failureRedirect: '/formuladb-api/login' }),
            function (req, res) {
                res.redirect('/');
            }
        );
    } else {
        app.use(function (req, res, next) {
            req.user = {role: process.env.FRMDB_AUTH_DISABLED_DEFAULT_ROLE || 'ADMIN'};
            next();
        });
    }
    

    app.get('/formuladb/*', (req, res) => {
        if (STATIC_EXT.filter(ext => req.url.indexOf(ext) > 0).length > 0) {
            res.sendFile(path.resolve(`public/${req.url.replace(/^\/?formuladb\//, '')}`));
        } else {
            res.sendFile(path.resolve('public/index.html'));
        }
    });


    app.get('/formuladb-api/applications', async function (req, res) {
        let apps = await kvsFactory.getAllApps();
        res.json(apps);
    });

    app.post('/formuladb-api/:appname/:entityName/simpleadhocquery', async function(req, res) {
        let query = req.body as SimpleAddHocQuery;
        let ret = await (await getFrmdbEngine(req.params.appname)).frmdbEngineStore.simpleAdHocQuery(req.params.entityName, query);
        res.json(ret);
    });

    app.get('/formuladb-api/:appname/byprefix/:prefix', async function(req, res) {
        let ret = await (await getFrmdbEngine(req.params.appname)).frmdbEngineStore.getDataListByPrefix(req.params.prefix);
        res.json(ret);
    });
    app.get('/formuladb-api/:appname/obj/:id', async function(req, res) {
        let obj = await (await getFrmdbEngine(req.params.appname)).frmdbEngineStore.getDataObj(req.params.id);
        res.json(obj);
    });
    app.get('/formuladb-api/:appname/table/:id', async function(req, res) {
        let table = await (await getFrmdbEngine(req.params.appname)).frmdbEngineStore.getTable(req.params.id);
        res.json(table);
    });
    app.get('/formuladb-api/:appname/form/:id', async function(req, res) {
        let form = await (await getFrmdbEngine(req.params.appname)).frmdbEngineStore.getForm(req.params.id);
        res.json(form);
    });
    app.get('/formuladb-api/:appname/schema', async function(req, res) {
        let schema = await (await getFrmdbEngine(req.params.appname)).frmdbEngineStore.getSchema('FRMDB_SCHEMA~~' + req.params.appname);
        res.json(schema);
    });
    app.get('/formuladb-api/:appname/entity/:id', async function(req, res) {
        let entity = await (await getFrmdbEngine(req.params.appname)).frmdbEngineStore.getEntity(req.params.id);
        res.json(entity);
    });

    //all write operations are handled via events
    app.post('/formuladb-api/:appname/event', async function (req, res) {
        return (await getFrmdbEngine(req.params.appname)).processEvent(req.body)
            .then(notif => res.json(notif))
            .catch(err => console.error(err));
    });

    app.patch('/formuladb-api/:appname/:id', async function (req, res) {
        return (await getFrmdbEngine(req.params.appname)).frmdbEngineStore.patchDataObj(req.body)
            .then(notif => res.json(notif))
            .catch(err => console.error(err));
    });

    app.put('/formuladb-api/:appname', async function(req, res) {
        return kvsFactory.putApp(req.body)
            .then(ret => res.json(ret))
            .catch(err => console.error(err));
    });
    app.put('/formuladb-api/:appname/schema', async function(req, res) {
        if (req.user.role !== 'ADMIN') {res.status(403); return;}
        let schema = req.body;
        let existingSchema = await kvsFactory.getSchema(req.body._id);
        if (!existingSchema) {
            await kvsFactory.putSchema(schema);
        }

        return (await getFrmdbEngine(req.params.appname)).frmdbEngineStore.init(schema)
            .then(ret => res.json(ret))
            .catch(err => console.error(err));
    });
    app.put('/formuladb-api/:appname/table', async function(req, res) {
        return (await getFrmdbEngine(req.params.appname)).frmdbEngineStore.putTable(req.body)
            .then(ret => res.json(ret))
            .catch(err => console.error(err));
    });
    app.put('/formuladb-api/:appname/form', async function(req, res) {
        return (await getFrmdbEngine(req.params.appname)).frmdbEngineStore.putForm(req.body)
            .then(ret => res.json(ret))
            .catch(err => console.error(err));
    });
    app.put('/formuladb-api/:appname/bulk', async function(req, res) {
        return (await getFrmdbEngine(req.params.appname)).frmdbEngineStore.putBulk(req.body)
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
            error: err
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