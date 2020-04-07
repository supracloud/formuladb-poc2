import * as express from "express";
import * as passport from "passport";
import * as connectEnsureLogin from "connect-ensure-login";
import { Strategy as LocalStrategy } from "passport-local";
import * as md5 from 'md5';
import { $UserObjT } from "@domain/metadata/default-metadata";
import { Auth } from "./auth";
import { FrmdbStore } from "@core/frmdb_store";

const needsLogin = connectEnsureLogin.ensureLoggedIn('/login');

export class AuthRoutes {
    private auth: Auth;
    constructor(frmdbStore: FrmdbStore) {
        this.auth = new Auth(frmdbStore);
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
                let up = await this.auth.usersAndPerms.get();
                let user = await up.kvs$User.get(id);
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

    async authResource(method: "GET" | "POST" | "DELETE" | "PUT", resourceEntityId: string, resourceId: string,
        req: express.Request, res: express.Response, next) 
    {
        if (process.env.FRMDB_AUTH_ENABLED === "true") {
            let userRole = this.roleFromReq(req);
            let userId = (req.user as any)?._id;

            let authStatus = await this.auth.authResource({
                userId,
                userRole,
                method,
                resourceEntityId,
                resourceId,
            });

            if (authStatus === "allowed") {
                next();
            } else if (authStatus === "needs-login") {
                needsLogin(req, res, next);
            } else if (authStatus === "off") {
                req.user = { ...req.user, role: process.env.FRMDB_AUTH_DISABLED_DEFAULT_ROLE || '$ADMIN' };
                next();    
            } else {
                res.status(403).send();
            }
        }
    }
}
