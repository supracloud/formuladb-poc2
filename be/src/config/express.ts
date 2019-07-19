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
import * as yaml from 'js-yaml';
import * as csv from 'csv';


import { FrmdbEngine } from "@core/frmdb_engine";
import { KeyValueStoreFactoryI, KeyTableStoreI } from "@core/key_value_store_i";
import { FrmdbEngineStore } from "@core/frmdb_engine_store";
import { $User } from "@domain/metadata/default-metadata";
import { BeUser } from "@domain/user";
import { SimpleAddHocQuery } from "@domain/metadata/simple-add-hoc-query";
import { App } from "@domain/app";
import { MetadataStore } from "@core/metadata_store";
import { Schema } from "@domain/metadata/entity";

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
    var metadataStore = new MetadataStore();

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

    // app.use(logger("dev"));
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
                // httpProxy(req, res, next);
            }
        });
    }

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.text({type: ['text/yaml', 'text/csv'], verify: (req, res, buf, encoding) => {
        console.log("TTTTT", buf, encoding, buf.toString(encoding));
    }}));    
    app.use((req, res, next) => {
        console.log("HEREEEEE2", req.url);
        next();
    });
    app.use((req, res, next) => {
        if (req.headers['content-type'] === 'text/yaml') {
            req.body = yaml.safeLoad(req.body);
            next();
        } else if (req.headers['content-type'] === 'text/csv') {
            csv.parse(req.body, {columns: true}, (err, data) => {
                if (err) next(err);
                else {
                    req.body = data;
                    next();    
                }
            })
        } else next();
    });

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

    
    app.get('/formuladb-api/:tenant/applications', async function (req, res) {
        let apps = await kvsFactory.getAllApps();
        res.json(apps);
    });

    app.get('/formuladb-api/:tenant/:app', async function (req, res) {
        let app: App | null = await metadataStore.getApp(req.params.tenant, req.params.app);
        res.json(app);
    });

    app.get('/formuladb-api/:tenant/:app/schema', async function(req, res) {
        let schema: Schema | null = await metadataStore.getSchema(req.params.tenant, req.params.app);
        res.json(schema);
    });

    app.post('/formuladb-api/:tenant/:app/:table/SimpleAddHocQuery', async function(req, res) {
        let query = req.body as SimpleAddHocQuery;
        let ret = await (await getFrmdbEngine(req.params.app)).frmdbEngineStore.simpleAdHocQuery(req.params.table, query);
        res.json(ret);
    });

    app.get('/formuladb-api/:tenant/:app/byprefix/:prefix', async function(req, res) {
        let ret = await (await getFrmdbEngine(req.params.app)).frmdbEngineStore.getDataListByPrefix(req.params.prefix);
        res.json(ret);
    });
    app.get('/formuladb-api/:tenant/:app/obj/:id', async function(req, res) {
        let obj = await (await getFrmdbEngine(req.params.app)).frmdbEngineStore.getDataObj(req.params.id);
        res.json(obj);
    });
    app.get('/formuladb-api/:tenant/:app/table/:id', async function(req, res) {
        let table = await (await getFrmdbEngine(req.params.app)).frmdbEngineStore.getTable(req.params.id);
        res.json(table);
    });
    app.get('/formuladb-api/:tenant/:app/form/:id', async function(req, res) {
        let form = await (await getFrmdbEngine(req.params.app)).frmdbEngineStore.getForm(req.params.id);
        res.json(form);
    });
    app.get('/formuladb-api/:tenant/:app/entity/:id', async function(req, res) {
        let entity = await (await getFrmdbEngine(req.params.app)).frmdbEngineStore.getEntity(req.params.id);
        res.json(entity);
    });

    //all write operations are handled via events
    app.post('/formuladb-api/:tenant/:app/event', async function (req, res) {
        return (await getFrmdbEngine(req.params.app)).processEvent(req.body)
            .then(notif => res.json(notif))
            .catch(err => console.error(err));
    });

    app.patch('/formuladb-api/:tenant/:app/:id', async function (req, res) {
        return (await getFrmdbEngine(req.params.app)).frmdbEngineStore.patchDataObj(req.body)
            .then(notif => res.json(notif))
            .catch(err => console.error(err));
    });

    app.put('/formuladb-api/:app', async function(req, res) {
        return kvsFactory.putApp(req.body)
            .then(ret => res.json(ret))
            .catch(err => console.error(err));
    });
    app.put('/formuladb-api/:tenant/:app/schema', async function(req, res) {
        if (req.user.role !== 'ADMIN') {res.status(403); return;}
        let schema = req.body;
        let existingSchema = await kvsFactory.getSchema(req.body._id);
        if (!existingSchema) {
            await kvsFactory.putSchema(schema);
        }

        return (await getFrmdbEngine(req.params.app)).frmdbEngineStore.init(schema)
            .then(ret => res.json(ret))
            .catch(err => console.error(err));
    });
    app.put('/formuladb-api/:tenant/:app/table', async function(req, res) {
        return (await getFrmdbEngine(req.params.app)).frmdbEngineStore.putTable(req.body)
            .then(ret => res.json(ret))
            .catch(err => console.error(err));
    });
    app.put('/formuladb-api/:tenant/:app/form', async function(req, res) {
        return (await getFrmdbEngine(req.params.app)).frmdbEngineStore.putForm(req.body)
            .then(ret => res.json(ret))
            .catch(err => console.error(err));
    });
    app.put('/formuladb-api/:tenant/:app/bulk', async function(req, res) {
        return (await getFrmdbEngine(req.params.app)).frmdbEngineStore.putBulk(req.body)
            .then(ret => res.json(ret))
            .catch(err => console.error(err));
    });

    app.get('/formuladb/*', (req, res) => {
        if (STATIC_EXT.filter(ext => req.url.indexOf(ext) > 0).length > 0) {
            res.sendFile(path.resolve(`dist/formuladb/${req.path.replace(/^\/?formuladb\//, '')}`));
        } else {
            res.sendFile(path.resolve('dist/formuladb/index.html'));
        }
    });

    function app2theme(path: string) {
        //TODO: read app metadata and replace app name with theme
        return path
            .replace(/^royal-hotel\//, 'royal-master/')
        ;
    }
    function removeTenant(path: string) {
        //TODO: read tenant metadata and check that tenant exists
        return path.replace(/^\/?([-_\w]+)\//, '');
    }
    app.use((req, res, next) => {
        let path = req.path.match(/^\/?([-_\w]+)\/([-_\w]+)\/.*\.(?:css|js|png|jpg|jpeg|eot|eot|woff2|woff|ttf|svg)$/);
        if (!path) {
            next();
            return;
        }
        let httpProxy = proxy({ 
            target: 'https://storage.googleapis.com/formuladb-static-assets/',
            changeOrigin: true,
            pathRewrite: function (path, req) { 
                return app2theme(removeTenant(path));
            },
            logLevel: "debug",
        });
        httpProxy(req, res, next);
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