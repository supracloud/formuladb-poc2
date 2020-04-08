import * as express from "express";
import * as passport from "passport";
import * as connectEnsureLogin from "connect-ensure-login";
import { Strategy as LocalStrategy } from "passport-local";
import * as md5 from 'md5';
import * as events from "@domain/event";
import { $UserObjT, DefaultSchema, PermissionType, $Table, $Page, $Image, $Icon, $App } from "@domain/metadata/default-metadata";
import { Auth, AuthStatus } from "./auth";
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
    
    userIdFromReq(req: express.Request): string {
        return (req.user as any)?._id;
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
        req: express.Request, res: express.Response, next): Promise<boolean> {
        if (process.env.FRMDB_AUTH_ENABLED === "true") {
            let userRole = this.roleFromReq(req);
            let userId = this.userIdFromReq(req);

            let authStatus = await this.auth.authResource({
                appName,
                userId,
                userRole,
                permission,
                resourceEntityId,
                resourceId,
            });

            return this.processAuthStatus(authStatus, req, res, next);
        } else return true;
    }

    processAuthStatus(authStatus: AuthStatus, req: express.Request, res: express.Response, next) {
        if (authStatus === "allowed") {
            return true;
        } else if (authStatus === "needs-login") {
            needsLogin(req, res, next);
            return false;
        } else if (authStatus === "off") {
            req.user = { ...req.user, role: process.env.FRMDB_AUTH_DISABLED_DEFAULT_ROLE || '$ADMIN' };
            return true;
        } else {
            res.status(403).send();
            return false;
        }
    }

    async authEvent(appName: string, event: events.MwzEvents, req: express.Request, res: express.Response, next): Promise<boolean> {
        if (process.env.FRMDB_AUTH_ENABLED === "true") {
            let userRole = this.roleFromReq(req);
            let userId = this.userIdFromReq(req);

            let authStatus = await this.auth.authEvent(userId, userRole, appName, event);
            return this.processAuthStatus(authStatus, req, res, next);
        } else return true;
    }
}
