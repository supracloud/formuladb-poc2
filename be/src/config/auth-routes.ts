import * as express from "express";
import * as passport from "passport";
import * as connectEnsureLogin from "connect-ensure-login";
import { Strategy as LocalStrategy } from "passport-local";
import * as md5 from 'md5';
import * as events from "@domain/event";
import { $UserObjT, DefaultSchema, PermissionType, $Table, $Page, $Image, $Icon, $App } from "@domain/metadata/default-metadata";
import { Auth } from "./auth";
import { FrmdbStore } from "@core/frmdb_store";
import { KeyValueStoreFactoryI } from "@storage/key_value_store_i";
import { parseDataObjId } from "@domain/metadata/data_obj";

const needsLogin = connectEnsureLogin.ensureLoggedIn('/login');

export class AuthRoutes {
    private auth: Auth;
    constructor(kvsFactory: KeyValueStoreFactoryI) {
        this.auth = new Auth(new FrmdbStore(kvsFactory, DefaultSchema));
    }

    initPassport(app: express.Express) {

        passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },
            async (username, password, cb) => {
                try {
                    let user = await this.auth.getUser('$User~~' + username);
                    if (!user) return cb(null, false);
                    let hashedPass = md5(password);
                    if (user.password != hashedPass) { return cb(null, false); }
                    return cb(null, user);
                } catch (err) {
                    return cb(err);
                }
            }
        ));

        passport.serializeUser(function (user: $UserObjT, cb) {
            cb(null, user._id);
        });

        passport.deserializeUser<$UserObjT, string>(async (id, cb) => {
            try {
                let user = await this.auth.getUser(id);
                if (!user) return cb(new Error("User " + id + " forbidden or not found !"));
                return cb(null, user);
            } catch (err) {
                return cb(err);
            }
        });
        app.use(passport.initialize());
        app.use(passport.session());
    }

    roleFromReq(req: express.Request): string {
        return (req.user as any)?.role || '$ANONYMOUS';
    }

    setupAuthRoutes(app: express.Express) {
        app.get('/isauthenticated', function (req, res) {
            res.status(200).send({ isauthenticated: req.isAuthenticated() });
        });

        app.get('/isadminauthenticated', function (req, res) {
            res.status(200).send(
                { isadminauthenticated: this.userFromReq(req)?.role === "$ADMIN" }
            );
        });

        app.get('/isproductionenv', function (req, res) {
            res.status(200).send({ isproductionenv: process.env.FRMDB_IS_PROD_ENV === "true" });
        });

        app.get('/login', function (req, res) {
            res.sendFile('/wwwroot/git/formuladb-env/frmdb-apps/formuladb-io/login.html');
        });

        app.post('/login',
            passport.authenticate('local', { successReturnToOrRedirect: '/', failureRedirect: '/login' }),
        );

        app.get('/logout', function (req, res) {
            req.logout();
            req.session?.destroy(function (err) {
                res.redirect('/');
            });
        });
    }

    async authResource(permission: PermissionType, appName: string, resourceEntityId: string, resourceId: string | undefined,
        req: express.Request, res: express.Response, next): Promise<boolean>
    {
        if (process.env.FRMDB_AUTH_ENABLED === "true") {
            let userRole = this.roleFromReq(req);
            let userId = (req.user as any)?._id;

            let authStatus = await this.auth.authResource({
                appName,
                userId,
                userRole,
                permission,
                resourceEntityId,
                resourceId,
            });

            if (authStatus === "allowed") {
                next();
                return true;
            } else if (authStatus === "needs-login") {
                needsLogin(req, res, next);
                return false;
            } else if (authStatus === "off") {
                req.user = { ...req.user, role: process.env.FRMDB_AUTH_DISABLED_DEFAULT_ROLE || '$ADMIN' };
                next();
                return false;
            } else {
                res.status(403).send();
                return false;
            }
        } else return true;
    }

    async authEvent(appName: string, event: events.MwzEvents, req: express.Request, res: express.Response, next): Promise<boolean> {
        switch (event.type_) {
            case "ServerEventModifiedFormData":
                return this.authResource("5WRITE", appName, parseDataObjId(event.obj._id).entityId, event.obj._id, req, res, next);
            case "ServerEventDeletedFormData":
                return this.authResource("7DELETE", appName, parseDataObjId(event.obj._id).entityId, event.obj._id, req, res, next);
            case "ServerEventNewEntity":
                return this.authResource("5WRITE", appName, $Table._id, event.entityId, req, res, next);
            case "ServerEventDeleteEntity":
                return this.authResource("7DELETE", appName, $Table._id, event.entityId, req, res, next);
            case "ServerEventPreviewFormula":
                return this.authResource("2PREVIEWEDIT", appName, event.targetEntity._id, event.targetPropertyName, req, res, next);
            case "ServerEventSetProperty":
                return this.authResource("5WRITE", appName, event.targetEntity._id, event.property.name, req, res, next);
            case "ServerEventDeleteProperty":
                return this.authResource("7DELETE", appName, event.targetEntity._id, event.propertyName, req, res, next);
            case "ServerEventPutPageHtml":
                return this.authResource("5WRITE", appName, $Page._id, `${$Page._id}~~${event.pageOpts.pageName}`, req, res, next);
            case "ServerEventPutMediaObject":
                //TODO media objects are still using hardcoded routes (/formuladb-api/:app/media), they are not implemented as metadata store entities
                return this.authResource("5WRITE", appName, $Image._id, `${$Image._id}~~${event.fileName}`, req, res, next);
            case "ServerEventPutIcon":
                return this.authResource("5WRITE", appName, $Icon._id, `${$Icon._id}~~${event.iconId}`, req, res, next);
            case "ServerEventSetPage":
                return this.authResource("5WRITE", appName, $Page._id, `${$Page._id}~~${event.pageOpts.pageName}`, req, res, next);
            case "ServerEventDeletePage":
                return this.authResource("7DELETE", appName, $Page._id, `${$Page._id}~~${event.pageName}`, req, res, next);
            case "ServerEventNewApp":
                return this.authResource("5WRITE", appName, $App._id, `${$App._id}~~${event.appName}`, req, res, next);
            default:
                return Promise.reject("n/a event");
        }
    }
}
