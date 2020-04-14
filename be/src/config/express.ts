/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

require('hot-debug');
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as proxy from 'http-proxy-middleware';
import * as yaml from 'js-yaml';
import * as csv from 'csv';
import * as mime from 'mime';
import * as serveIndex from 'serve-index';
const fetch = require('node-fetch')
let debug = require('debug');
const url = require('url');
var flash = require('connect-flash');
var ipn = require('paypal-ipn');

import { FrmdbEngine } from "@core/frmdb_engine";
import { KeyValueStoreFactoryI, KeyTableStoreI } from "@storage/key_value_store_i";
import { FrmdbEngineStore } from "@core/frmdb_engine_store";
import { SimpleAddHocQuery } from "@domain/metadata/simple-add-hoc-query";
import { App } from "@domain/app";
import { Schema } from "@domain/metadata/entity";
import { LazyInit } from "@domain/ts-utils";
import { i18nTranslateText } from "@be/i18n-be";
import { cleanupEnvironment, createNewEnvironment } from "./env-manager";
import { AuthRoutes } from "./auth-routes";
import { setupChangesFeedRoutes, addEventToChangesFeed } from "./changes-feed-routes";
import { searchPremiumIcons, PremiumIconRespose } from "@storage/icon-api";
import { $Dictionary, isMetadataEntity, $UserObjT, $User, $PermissionObjT, $Permission, $Page, isMetadataStoreEntity, $ImageObjT } from "@domain/metadata/default-metadata";
import { simpleAdHocQueryForMetadataEntities } from "./simple-ad-hoc-query-metadata-entities";
import { FullPageOpts, makeUrlPath, DefaultPageOptsForAppT, DefaultPageOptsForApp } from "@domain/url-utils";
import { FrmdbRoutes } from "./api";

const FRMDB_ENV_ROOT_DIR = process.env.FRMDB_ENV_ROOT_DIR || '/wwwroot/git';
const FRMDB_ENV_DIR = `${FRMDB_ENV_ROOT_DIR}/formuladb-env`;
const FRMDB_DIR = process.env.FRMDB_ENV_ROOT_DIR ? `${process.env.FRMDB_ENV_ROOT_DIR}/formuladb` : '/wwwroot/formuladb';

let frmdbEngines: Map<string, LazyInit<FrmdbEngine>> = new Map();

const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
const SECRET = 'bla-bla-secret';

export default function (kvsFactory: KeyValueStoreFactoryI) {
    var app: express.Express = express();

    let coreFrmdbEngine: FrmdbEngine | undefined;
    async function getCoreFrmdbEngine(): Promise<FrmdbEngine> {
        if (coreFrmdbEngine) return coreFrmdbEngine;

        let coreFrmdbEngineInit = new LazyInit(async () => {
            let engine = new FrmdbEngine(new FrmdbEngineStore(kvsFactory, {
                _id: "FRMDB_SCHEMA",
                entities: {
                    [$Dictionary._id]: $Dictionary,
                }
            }));
            await engine.init();
            coreFrmdbEngine = engine;
            return engine;
        });
        return coreFrmdbEngineInit.get();
    }

    async function getFrmdbEngine(appName: string): Promise<FrmdbEngine> {
        let frmdbEngineInit = frmdbEngines.get(appName);
        if (!frmdbEngineInit) {
            frmdbEngineInit = new LazyInit(async () => {
                let schema = await kvsFactory.metadataStore.getSchema(appName);
                if (!schema) throw new Error("The app does not exist " + appName);
                let engine = new FrmdbEngine(new FrmdbEngineStore(kvsFactory, schema));
                await engine.init();
                return engine;
            })
            frmdbEngines.set(appName, frmdbEngineInit);
        }
        return frmdbEngineInit.get();
    }

    // app.use(logger("dev"));
    app.use(cookieParser(SECRET));
    app.use(require('express-session')({
        secret: SECRET,
        resave: false,
        saveUninitialized: true
    }))
    app.use(flash());

    let authRoutes = new AuthRoutes(kvsFactory);
    authRoutes.initPassport(app);

    app.use(bodyParser.json({ limit: "10mb" }));
    app.use(bodyParser.urlencoded({ limit: "10mb", extended: false }));
    app.use(bodyParser.text({
        limit: "10mb",
        type: ['text/yaml', 'text/csv', 'text/html'], verify: (req, res, buf, encoding) => {
            console.log("TTTTT", buf, encoding, buf.toString(encoding));
        }
    }));

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

    authRoutes.setupAuthRoutes(app);

    app.get('/:lang/users/login.html', function (req, res, next) {
        req.params.app = "users";
        req.params.page = "login";
        renderHtmlPage(req, res, next);
    });
    app.get('/:lang/users/register.html', function (req, res, next) {
        req.params.app = "users";
        req.params.page = "register";
        renderHtmlPage(req, res, next);
    });

    //////////////////////////////////////////////////////////////////////////////////////
    // API (prioritary paths)
    //////////////////////////////////////////////////////////////////////////////////////

    setupChangesFeedRoutes(app, kvsFactory);

    app.delete('/formuladb-api/env/:envname', async function (req, res, next) {
        if (process.env.FRMDB_CAN_CREATE_ENV) {
            console.log(`Delete called on ${req.params.envname} environment`)
            let status_message = await cleanupEnvironment(req.params.envname);
            console.log(status_message);
            res.end(status_message);
        } else {
            next();
        }
    });

    //////////////////////////////////////////////////////////////////////////////////////
    // themes, icons, images & other static content
    //////////////////////////////////////////////////////////////////////////////////////

    app.use('/formuladb-env/', express.static(`${FRMDB_ENV_DIR}/`));

    //////////////////////////////////////////////////////////////////////////////////////
    // apps
    //////////////////////////////////////////////////////////////////////////////////////
    let formuladbEnvStatic = express.static('/wwwroot/git/formuladb-env');

    app.get('/', function (req, res, next) {
        res.redirect(makeUrlPath({
            lang: 'en',
            look: 'cerulean',
            primaryColor: '7795f8',
            secondaryColor: '6c757d',
            appName: 'formuladb-io',
            pageName: 'index',
            theme: '_none_',
        }));
    });

    const DEFAULT_APP = 'formuladb-io';//TODO: make this configurable
    app.get("/", function (req, res, next) {
        res.redirect(`${FRMDB_ENV_DIR}/frmdb-apps/${DEFAULT_APP}/index.html`);
    });

    app.use('/formuladb/', express.static(`${FRMDB_DIR}/`));

    async function renderHtmlPage(req: express.Request, res: express.Response, next) {
        let defaultPageOpts: DefaultPageOptsForAppT = DefaultPageOptsForApp;
        if (!req.params.look) {
            defaultPageOpts = await kvsFactory.metadataStore.getDefaultPageOptsForApp(req.params.app);
        }

        let appName = req.params.app;
        let pageName = req.params.page;
        if (! await authRoutes.authResource("page", '0READ', appName, $Page._id, pageName, req, res, next)) return;
        let query: FullPageOpts['query'] = req.query;

        let pageOpts: FullPageOpts = {
            lang: req.params.lang,
            look: req.params.look || defaultPageOpts.look,
            primaryColor: req.params.primary || defaultPageOpts.primaryColor,
            secondaryColor: req.params.secondary || defaultPageOpts.secondaryColor,
            theme: req.params.theme || defaultPageOpts.theme,
            appName: req.params.app,
            pageName: req.params.page,
            query: req.query,
        };

        if (query?.frmdbRender === "screenshot") {
            let screenshot = await kvsFactory.metadataStore.getPageScreenshot(pageOpts);
            res.set('Content-Type', 'image/png')
            res.send(screenshot);
            return;
        } else if (query?.frmdbRender === "pdf") {
            let pdf = await kvsFactory.metadataStore.getPagePdf(pageOpts);
            res.set('Content-Type', 'application/pdf')
            res.send(pdf);
            return;
        }

        if (query?.frmdbRender != "view" && req.params.page === 'page-components-reference') {
            res.redirect(url.format({
                pathname: req.path,
                query: {
                    ...query,
                    frmdbRender: "view",
                }
            }));
        }
        else if (query?.frmdbRender === "editor") {
            if (! await authRoutes.authResource("api", '2PREVIEWEDIT', pageName, $Page._id, appName, req, res, next)) return;
            res.set('Content-Type', 'text/html')
            res.sendFile(`${FRMDB_DIR}/editor.html`);
        } else {
            let coreFrmdbEngine = await getCoreFrmdbEngine();
            let dictionaryCache = await coreFrmdbEngine.i18nStore.getDictionaryCache();
            let pageHtml = await kvsFactory.metadataStore.getPageHtml(pageOpts, dictionaryCache, {
                'info': req.flash('info'),
                'warning': req.flash('info'),
                'error': req.flash('error'),
            });
            res.set('Content-Type', 'text/html')
            res.send(pageHtml);
        }
    }
    app.get('/:lang-:look-:primary-:secondary-:theme/:app/:page.html', renderHtmlPage);
    app.get('/:lang/:app/:page.html', renderHtmlPage);

    async function renderFormuladbCss(req, res, next) {
        let defaultPageOpts: DefaultPageOptsForAppT = DefaultPageOptsForApp;
        if (!req.params.look) {
            defaultPageOpts = await kvsFactory.metadataStore.getDefaultPageOptsForApp(req.params.app);
        }
        let css = await kvsFactory.metadataStore.getLookCss({
            lang: req.params.land,
            look: req.params.look || defaultPageOpts.look,
            primaryColor: req.params.primary || defaultPageOpts.primaryColor,
            secondaryColor: req.params.secondary || defaultPageOpts.secondaryColor,
            theme: req.params.theme || defaultPageOpts.theme,
            appName: req.params.app,
            pageName: `${req.params.page}.html`,
            query: req.query,
        });
        res.set('Content-Type', 'text/css')
        res.send(css);
    };
    app.get('/:lang-:look-:primary-:secondary-:theme/:app/formuladb-look.css', renderFormuladbCss);
    app.get('/:lang/:app/formuladb-look.css', renderFormuladbCss);

    app.get('/:lang-:look-:primary-:secondary-:theme/:app/:fileName([-_a-zA-Z0-9./]+\.(png|jpg|jpeg|svg|gif|webm|eot|ttf|woff|woff2|otf|css|js)$)', async function (req, res, next) {
        res.redirect(`/formuladb-env/frmdb-apps/${req.params.app}/${req.params.fileName}`);
    });
    app.get('/:lang/:app/static/:fileName([-_a-zA-Z0-9./]+\.(png|jpg|jpeg|svg|gif|webm|eot|ttf|woff|woff2|otf|css|js)$)', async function (req, res, next) {
        res.redirect(`/formuladb-env/frmdb-apps/${req.params.app}/static/${req.params.fileName}`);
    });
    app.get('/:lang-:look-:primary-:secondary-:theme/:app/static/:fileName([-_a-zA-Z0-9/]+\.(png|jpg|jpeg|svg|gif|webm|eot|ttf|woff|woff2|otf|css|js)$)', async function (req, res, next) {
        res.redirect(`/formuladb-env/frmdb-apps/${req.params.app}/static/${req.params.fileName}`);
    });
    app.get('/:lang-:look-:primary-:secondary-:theme/:app/static/:dirName/:fileName([-_a-zA-Z0-9/]+\.(png|jpg|jpeg|svg|gif|webm|eot|ttf|woff|woff2|otf|css|js)$)', async function (req, res, next) {
        res.redirect(`/formuladb-env/frmdb-apps/${req.params.app}/static/${req.params.dirName}/${req.params.fileName}`);
    });
    app.get('/:lang-:look-:primary-:secondary-:theme/:app/static/:dirName/:dirName2/:fileName([-_a-zA-Z0-9/]+\.(png|jpg|jpeg|svg|gif|webm|eot|ttf|woff|woff2|otf|css|js)$)', async function (req, res, next) {
        res.redirect(`/formuladb-env/frmdb-apps/${req.params.app}/static/${req.params.dirName}/${req.params.dirName2}/${req.params.fileName}`);
    });
    app.get('/:app/:name.yaml', function (req, res, next) {
        formuladbEnvStatic(req, res, next);
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

    async function verifyPayPalIPN(params: any, opts: any): Promise<boolean> {
        return new Promise((resolve, reject) => {
            ipn.verify(params, { ...opts }, function callback(err, msg) {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    if (params.payment_status == 'Completed') {
                        resolve(true);
                    } else {
                        console.log("Payment not completed", params);
                        resolve(false);
                    }
                }
            });
        });
    }
    app.post('/formuladb-api/payments/PayPal_IPN', async function (req, res, next) {
        console.log("strting PAYPAL ipn check OK", req.body);
        let paymentCompleted = await verifyPayPalIPN(req.body, {});
        console.log("PAYPAL ipn check finished", paymentCompleted, req.body);
    });
    app.post('/formuladb-api/payments-sandbox/PayPal_IPN', async function (req, res, next) {
        console.log("strting PAYPAL ipn check OK with sandbox", req.body);
        let paymentCompleted = await verifyPayPalIPN(req.body, {allow_sandbox: true});
        console.log("PAYPAL ipn check finished", paymentCompleted, req.body);
    });

    app.get('/formuladb-api/themes', async function (req, res, next) {
        let themes = await kvsFactory.metadataStore.getThemes();
        res.send(themes);
    });

    app.get('/formuladb-api/looks', async function (req, res, next) {
        let looks = await kvsFactory.metadataStore.getLooks();
        res.send(looks);
    });

    app.post('/formuladb-api/translate', async (req, res, next) => {
        try {
            let coreFrmdbEngine = await getCoreFrmdbEngine();
            let userRole = authRoutes.roleFromReq(req);
            let userId = authRoutes.userIdFromReq(req);
            let translations = await i18nTranslateText(userRole, userId, coreFrmdbEngine, req.body.texts, req.body.to);
            res.json(translations);
        } catch (err) {
            console.error(err);
            next(err);
        }
    });

    app.get('/formuladb-api/user', async function (req, res, next) {
        try {
            let userRole = authRoutes.roleFromReq(req);
            let userId = authRoutes.userIdFromReq(req);
            res.send({ userId, userRole });
        } catch (err) {
            console.error(err);
            next(err);
        }
    });

    app.get('/formuladb-api/check-env/:env', async function (req, res, next) {
        try {
            let resp = await fetch(`https://${req.params.env}.formuladb.io/formuladb-api/base-app/schema`).then(response => {
                return response.text();
            });
            if (resp.indexOf('$Dictionary') >= 0 && resp.indexOf('$Page') >= 0) {
                res.status(200); res.send('ok');
            } else {
                res.status(406); res.send('not-ok');
            }
        } catch (err) {
            console.info(err);
            res.status(406); res.send('not-ready');
        }
    });

    app.get('/formuladb-api/:app', async function (req, res, next) {
        try {
            let app: App | null = await kvsFactory.metadataStore.getApp(req.params.app);
            if (!app) throw new Error(`App ${req.params.tenant}/${req.params.app} not found`);
            res.json(app);
        } catch (err) {
            console.error(err);
            next(err);
        }
    });

    app.get('/formuladb-api/:app/schema', async function (req, res, next) {
        try {
            let schema: Schema | null = await kvsFactory.metadataStore.getSchema(req.params.app);
            res.json(schema);
        } catch (err) {
            console.error(err);
            next(err);
        }
    });

    app.get('/formuladb-api/:app/media', async function (req, res, next) {
        try {
            let imgs: $ImageObjT[] = await kvsFactory.metadataStore.getAvailableImages(req.params.app);
            res.json(imgs.map(i => i._id));//TODO use simpleAddHocQuery
        } catch (err) {
            console.error(err);
            next(err);
        }
    });

    app.get('/formuladb-api/:app/premium-icons/:search', async function (req, res, next) {
        try {
            let icons: PremiumIconRespose = await searchPremiumIcons(req.params.search);
            res.send(icons);
        } catch (err) {
            console.error(err);
            next(err);
        }
    });

    app.post('/formuladb-api/:app/:table/SimpleAddHocQuery', async function (req, res, next) {
        try {
            let query = req.body as SimpleAddHocQuery;

            let ret;
            if (isMetadataStoreEntity(req.params.table)) {
                ret = await simpleAdHocQueryForMetadataEntities(req.params.app, kvsFactory, req.params.table, query);
            } else {
                ret = await (await getFrmdbEngine(req.params.app)).frmdbEngineStore.simpleAdHocQuery(req.params.table, query);
            }
            res.json(ret);
        } catch (err) {
            console.error(err);
            next(err);
        }
    });

    app.get('/formuladb-api/:app/byprefix/:prefix', async function (req, res, next) {
        try {
            let ret = await (await getFrmdbEngine(req.params.app)).frmdbEngineStore.getDataListByPrefix(req.params.prefix);
            res.json(ret);
        } catch (err) {
            console.error(err);
            next(err);
        }
    });
    app.get('/formuladb-api/:app/obj/:id', async function (req, res, next) {
        try {
            let obj = await (await getFrmdbEngine(req.params.app)).frmdbEngineStore.getDataObj(req.params.id);
            res.json(obj || {});
        } catch (err) {
            console.error(err);
            next(err);
        }
    });

    app.post('/formuladb-api/:app/centralized-logging/add-event', async function (req, res, next) {
        console.info(req.body);
        res.status(200).send({});
    });

    //all write operations are handled via events
    app.post('/formuladb-api/:app/event', async function (req, res, next) {
        let event = req.body;
        if (! await authRoutes.authEvent("api", req.params.app, event, req, res, next)) return;
        let userRole = authRoutes.roleFromReq(req);
        let userId = authRoutes.userIdFromReq(req);
        return (await getFrmdbEngine(req.params.app))
            .processEvent(userRole, userId, event)
            .then(notif => {
                addEventToChangesFeed(notif);
                res.json(notif);
            })
            .catch(err => { console.error(err); next(err) });
    });
    app.post('/formuladb-api/:app/reference_to_options/:referencedTableAlias', async function (req, res, next) {
        return (await getFrmdbEngine(req.params.app))
            .getOptionsForReferenceToProperties(req.body, req.params.referencedTableAlias)
            .then(optsObjs => {
                res.json(optsObjs);
            })
            .catch(err => { console.error(err); next(err) });
    });

    app.patch('/formuladb-api/:app/:id', async function (req, res, next) {
        return (await getFrmdbEngine(req.params.app)).frmdbEngineStore.patchDataObj(req.body)
            .then(notif => res.json(notif))
            .catch(err => { console.error(err); next(err) });
    });

    app.put('/formuladb-api/:app', async function (req, res, next) {
        return kvsFactory.metadataStore.putApp(req.params.app, req.body)
            .then(ret => res.json(ret))
            .catch(err => { console.error(err); next(err) });
    });
    app.put('/formuladb-api/:app/schema', async function (req, res, next) {
        let schema = req.body;
        let existingSchema = await kvsFactory.metadataStore.getSchema(req.params.app);
        if (!existingSchema) {
            await kvsFactory.metadataStore.putSchema(req.params.app, schema);
        }

        return (await getFrmdbEngine(req.params.app)).frmdbEngineStore.init(schema)
            .then(ret => res.json(ret))
            .catch(err => { console.error(err); next(err) });
    });

    app.put('/formuladb-api/:app/bulk', async function (req, res, next) {
        return (await getFrmdbEngine(req.params.app)).frmdbEngineStore.putBulk(req.body)
            .then(ret => res.json(ret))
            .catch(err => { console.error(err); next(err) });
    });

    // catch 404 and forward to error handler
    app.use((req: express.Request, res: express.Response, next: Function): void => {
        res.status(404).send('Not found');
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
