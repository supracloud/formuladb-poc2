/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

process.env.DEBUG="express:*"
require('hot-debug');
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as passport from "passport";
import * as timeout from 'connect-timeout';
import * as connectEnsureLogin from "connect-ensure-login";
import { Strategy as LocalStrategy } from "passport-local";
import * as md5 from 'md5';
import * as proxy from 'http-proxy-middleware';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as csv from 'csv';
import * as mime from 'mime';
import * as serveIndex from 'serve-index';
let debug = require('debug');

import { FrmdbEngine } from "@core/frmdb_engine";
import { KeyValueStoreFactoryI, KeyTableStoreI } from "@storage/key_value_store_i";
import { FrmdbEngineStore } from "@core/frmdb_engine_store";
import { $User, $Dictionary } from "@domain/metadata/default-metadata";
import { BeUser } from "@domain/user";
import { SimpleAddHocQuery } from "@domain/metadata/simple-add-hoc-query";
import { App } from "@domain/app";
import { Schema } from "@domain/metadata/entity";
import { LazyInit } from "@domain/ts-utils";
import { I18nBe } from "@be/i18n-be";

let frmdbEngines: Map<string, LazyInit<FrmdbEngine>> = new Map();

const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
const SECRET = 'bla-bla-secret';

export default function (kvsFactory: KeyValueStoreFactoryI) {
    var app: express.Express = express();
    var kvs$User: KeyTableStoreI<BeUser>;
    var i18nBe = new I18nBe(kvsFactory);

    async function getFrmdbEngine(tenantName: string, appName: string): Promise<FrmdbEngine> {
        let frmdbEngineInit = frmdbEngines.get(appName);
        if (!frmdbEngineInit) {
            frmdbEngineInit = new LazyInit(async () => {
                let schema = await kvsFactory.metadataStore.getSchema(tenantName, appName);
                if (!schema) throw new Error("The app does not exist " + tenantName + "/" + appName);
                let engine = new FrmdbEngine(new FrmdbEngineStore(tenantName, appName, kvsFactory, schema));
                await engine.init();
                return engine;
            })
            frmdbEngines.set(appName, frmdbEngineInit);
        }
        return frmdbEngineInit.get();
    }

    async function getUserKvs(): Promise<KeyTableStoreI<BeUser>> {
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

    // This needs to be before express bodyParser: https://github.com/nodejitsu/node-http-proxy/issues/180
    // if (process.env.FRMDB_PROXY) {
    //     let httpProxy = proxy({ target: process.env.FRMDB_PROXY });
    //     app.use(function (req, res, next) {
    //         if (/\/formuladb.*/.test(req.path)) {
    //             next();
    //         } else {
    //             // httpProxy(req, res, next);
    //         }
    //     });
    // }

    app.use(bodyParser.json({limit: "10mb"}));
    app.use(bodyParser.urlencoded({ limit: "10mb", extended: false }));
    app.use(bodyParser.text({
        limit: "10mb",
        type: ['text/yaml', 'text/csv', 'text/html'], verify: (req, res, buf, encoding) => {
            console.log("TTTTT", buf, encoding, buf.toString(encoding));
        }
    }));
    app.use((req, res, next) => {
        console.log("HEREEEEE3", req.url);
        next();
    });
    app.use((req, res, next) => {
        if (req.headers['content-type'] === 'text/yaml') {
            req.body = yaml.safeLoad(req.body);
            next();
        } else if (req.headers['content-type'] === 'text/csv') {
            csv.parse(req.body, { columns: true }, (err, data) => {
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
            function (req, res, next) {
                res.redirect('/');
            }
        );
    } else {
        app.use(function (req, res, next) {
            req.user = { role: process.env.FRMDB_AUTH_DISABLED_DEFAULT_ROLE || 'ADMIN' };
            next();
        });
    }

    //////////////////////////////////////////////////////////////////////////////////////
    // themes, icons, images & other static content
    //////////////////////////////////////////////////////////////////////////////////////

    app.use('/formuladb-themes', express.static('/wwwroot/git/formuladb-themes'));
    app.use('/formuladb-icons/', express.static('wwwroot/git/formuladb-icons'));
    app.use('/formuladb-static/', express.static('/wwwroot/git/formuladb-static'));
    
    const staticAssetsUrl = process.env.FRMDB_IS_DEV_ENV ? 'http://nginx:8085' : 'https://storage.googleapis.com/formuladb-static-assets';
    let httpProxy = proxy({
        target: staticAssetsUrl,
        changeOrigin: true,
        proxyTimeout: 500,
        // pathRewrite: function (path, req) { return path },
        logLevel: "debug",
    });
    //not used anymore
    app.get(/^\/formuladb-static\/.*\.(png|jpg|jpeg|svg|gif|webm|eot|ttf|woff|woff2|otf|css|js)$/, timeout('2s'), async function (req, res, next) {
        httpProxy(req, res, next);
    });
    app.get(/^\/formuladb-themes\/.*/, timeout('2s'), async function (req, res, next) {
        httpProxy(req, res, next);
    });

    //////////////////////////////////////////////////////////////////////////////////////
    // apps
    //////////////////////////////////////////////////////////////////////////////////////

    let formuladbIoStatic = express.static('/wwwroot/git/formuladb-apps/formuladb.io', { index: "index.html" });
    app.get('/', formuladbIoStatic);
    app.get('/*.html', formuladbIoStatic);
    app.get('/*.yaml', formuladbIoStatic);

    app.get('/formuladb/*', express.static('/wwwroot'));

    let formuladbAppsStatic = express.static('/wwwroot/git');
    app.get(/.*\.(html|yaml)$/, function appHtmlAndYaml(req, res, next) {
        console.log("HTML FILESSSSSSSS", req.url);
        formuladbAppsStatic(req, res, next);
    });

    //////////////////////////////////////////////////////////////////////////////////////
    // Internal Debug APIs
    //////////////////////////////////////////////////////////////////////////////////////

    app.get('/formuladb-api/DEBUG/enabled/:debugValue', async function (req, res, next) {
        try {
            res.send(debug.enabled(req.params.debugValue));
        } catch (err) {
            console.error(err);
            next(err);
        }
    });

    app.post('/formuladb-api/DEBUG/:debugValue', async function (req, res, next) {
        try {
            debug.enable(req.params.debugValue);
            res.send(`OK ${req.params.debugValue}`);
        } catch (err) {
            console.error(err);
            next(err);
        }
    });

    //////////////////////////////////////////////////////////////////////////////////////
    // API
    //////////////////////////////////////////////////////////////////////////////////////

    app.post('/formuladb-api/translate', async (req, res, next) => {
        try {
            res.json(await i18nBe.translateText(req.body.texts, req.body.to));
        } catch (err) {
            console.error(err);
            next(err);
        }
    });

    app.get('/formuladb-api/:tenant/:app', async function (req, res, next) {
        try {
            let app: App | null = await kvsFactory.metadataStore.getApp(req.params.tenant, req.params.app);
            if (!app) throw new Error(`App ${req.params.tenant}/${req.params.app} not found`);
            res.json(app);
        } catch (err) {
            console.error(err);
            next(err);
        }
    });

    app.get('/formuladb-api/:tenant/:app/schema', async function (req, res, next) {
        try {
            let schema: Schema | null = await kvsFactory.metadataStore.getSchema(req.params.tenant, req.params.app);
            res.json(schema);
        } catch (err) {
            console.error(err);
            next(err);
        }
    });

    
    app.get('/formuladb-api/:tenant/:app/media', async function (req, res, next) {
        try {
            let paths: string[] = await kvsFactory.metadataStore.getMediaObjects(req.params.tenant, req.params.app);
            res.json(paths);
        } catch (err) {
            console.error(err);
            next(err);
        }
    });

    app.post('/formuladb-api/:tenant/:app/:table/SimpleAddHocQuery', async function (req, res, next) {
        try {
            let query = req.body as SimpleAddHocQuery;
            let ret = await (await getFrmdbEngine(req.params.tenant, req.params.app)).frmdbEngineStore.simpleAdHocQuery(req.params.table, query);
            res.json(ret);
        } catch (err) {
            console.error(err);
            next(err);
        }
    });

    app.get('/formuladb-api/:tenant/:app/byprefix/:prefix', async function (req, res, next) {
        try {
            let ret = await (await getFrmdbEngine(req.params.tenant, req.params.app)).frmdbEngineStore.getDataListByPrefix(req.params.prefix);
            res.json(ret);
        } catch (err) {
            console.error(err);
            next(err);
        }
    });
    app.get('/formuladb-api/:tenant/:app/obj/:id', async function (req, res, next) {
        try {
            let obj = await (await getFrmdbEngine(req.params.tenant, req.params.app)).frmdbEngineStore.getDataObj(req.params.id);
            res.json(obj);
        } catch (err) {
            console.error(err);
            next(err);
        }
    });

    //all write operations are handled via events
    app.post('/formuladb-api/:tenant/:app/event', async function (req, res, next) {
        return (await getFrmdbEngine(req.params.tenant, req.params.app))
            .processEvent(req.body)
            .then(notif => res.json(notif))
            .catch(err => { console.error(err); next(err) });
    });

    app.patch('/formuladb-api/:tenant/:app/:id', async function (req, res, next) {
        return (await getFrmdbEngine(req.params.tenant, req.params.app)).frmdbEngineStore.patchDataObj(req.body)
            .then(notif => res.json(notif))
            .catch(err => { console.error(err); next(err) });
    });

    app.put('/formuladb-api/:tenant/:app', async function (req, res, next) {
        return kvsFactory.metadataStore.putApp(req.params.tenant, req.params.app, req.body)
            .then(ret => res.json(ret))
            .catch(err => { console.error(err); next(err) });
    });
    app.put('/formuladb-api/:tenant/:app/schema', async function (req, res, next) {
        if (req.user.role !== 'ADMIN') { res.status(403); return; }
        let schema = req.body;
        let existingSchema = await kvsFactory.metadataStore.getSchema(req.params.tenant, req.params.app);
        if (!existingSchema) {
            await kvsFactory.metadataStore.putSchema(req.params.tenant, req.params.app, schema);
        }

        return (await getFrmdbEngine(req.params.tenant, req.params.app)).frmdbEngineStore.init(schema)
            .then(ret => res.json(ret))
            .catch(err => { console.error(err); next(err) });
    });

    app.put('/formuladb-api/:tenant/:app/bulk', async function (req, res, next) {
        return (await getFrmdbEngine(req.params.tenant, req.params.app)).frmdbEngineStore.putBulk(req.body)
            .then(ret => res.json(ret))
            .catch(err => { console.error(err); next(err) });
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
            error_: err
        });
    });

    return app;
};
