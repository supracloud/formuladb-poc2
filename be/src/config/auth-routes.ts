import * as express from "express";
import * as passport from "passport";
import * as connectEnsureLogin from "connect-ensure-login";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { OAuth2Strategy as GoogleStrategy } from "passport-google-oauth";
import * as md5 from 'md5';
import * as events from "@domain/event";
import { $UserObjT, DefaultSchema, PermissionType, $Table, $Page, $Image, $Icon, $App, AuthSchema } from "@domain/metadata/default-metadata";
import { Auth, AuthStatus } from "./auth";
import { FrmdbStore } from "@core/frmdb_store";
import { KeyValueStoreFactoryI } from "@storage/key_value_store_i";
import { parseDataObjId } from "@domain/metadata/data_obj";
import { createNewEnvironment } from "./env-manager";

const needsLogin = connectEnsureLogin.ensureLoggedIn('/login');
export type RequestType = "api" | "page";

export class AuthRoutes {
    private auth: Auth;
    constructor(kvsFactory: KeyValueStoreFactoryI) {
        this.auth = new Auth(new FrmdbStore(kvsFactory, AuthSchema));
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

        passport.use(new FacebookStrategy({
            // TODO - these 2 require dynamic update
            clientID: "2662577554031245",
            clientSecret: "ca52b75ca69a22f657cf9ec4d12fcbfc",
            callbackURL: `https://formuladb.io/auth/facebook/callback`,
            profileFields: ['email', 'displayName', 'name', 'gender', 'profileUrl']
          },
          async (accessToken, refreshToken, profile, done) => {
              console.log("facebook strategy");
            try {
                let user = await this.auth.getUser('$User~~' + profile.emails[0].value);
                console.log("profile", profile);
    
                if (!user) {
                    user = await this.auth.createUser(profile.emails[0].value, "", profile.displayName);
                }
                console.log("returning done with user ", user);
                return done(null, user);
            } catch (err) {
                return done(err);
            }
          }
        ));
    
        passport.use(new GoogleStrategy({
            // TODO - these 2 require dynamic update
            clientID: "544230964028-9lenl9om20v9k5m9gdqcgf5atdfsdvhs.apps.googleusercontent.com",
            clientSecret: "jIaag_5K00ISafiaYaxCZ2h3",
            callbackURL: `https://formuladb.io/auth/google/callback`
          },
          async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await this.auth.getUser('$User~~' + profile.emails[0].value);
                console.log("profile", profile);

                if (!user) {
                    user = await this.auth.createUser(profile.emails[0].value, "", profile.displayName);
                }
                return done(null, user);
            } catch (err) {
                return done(err);
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
        app.get('/auth/facebook', passport.authenticate('facebook', {state: process.env.FRMDB_ENV_NAME,
                                                                     scope: 'email'}));
        app.get('/auth/facebook/callback',
        passport.authenticate('facebook', { successRedirect: '/',
                                            failureRedirect: '/login' }));
    
        app.get('/auth/google',
        passport.authenticate('google', { scope: [
                                                    'https://www.googleapis.com/auth/plus.login',
                                                    'https://www.googleapis.com/auth/userinfo.profile',
                                                    'https://www.googleapis.com/auth/userinfo.email'
                                                 ],
                                          state: process.env.FRMDB_ENV_NAME }));
        app.get('/auth/google/callback', 
        passport.authenticate('google', { failureRedirect: '/login' }),
        function(req, res) {
          res.redirect('/');
        });
        
        app.get('/isauthenticated', function (req, res) {
            res.status(200).send({ isauthenticated: req.isAuthenticated() });
        });

        app.get('/isadminauthenticated', function (req, res) {
            res.status(200).send(
                { isadminauthenticated: this.userFromReq(req)?.role === "$ADMIN" }
            );
        });

        app.get('/isproductionenv', function (req, res) {
            res.status(200).send({ isproductionenv: process.env.FRMDB_CAN_CREATE_ENV === "true" });
        });

        function login(req, res, next) {
            passport.authenticate('local', function (err, user, info) {
                if (err) { return next(err); }
                if (!user) { return res.redirect(`/${req.params.lang}`); }
                req.logIn(user, function (err) {
                    if (err) { return next(err); }
                    return res.redirect('/');
                });
            })(req, res, next);
        }
        app.post('/:lang/users/login', login);

        app.post('/:lang/users/register', async (req, res, next) => {
            let user = await this.auth.getUser(`$User~~${req.body.email}`);
            if (user) {
                req.flash('warning', "User already exists");
                res.redirect(`/${req.params.lang}/users/register.html`);
                return;
            }

            if (!req.body.email || !req.body.password || !req.body.email || !req.body.envname) {
                req.flash('error', "please supply name, environment name, email and password");
                res.redirect(`/${req.params.lang}/users/register.html`);
                return;
            }

            let hashedPass = md5(req.body.password);
            await this.auth.createUser(req.body.email, hashedPass, req.body.name);

            if (process.env.FRMDB_CAN_CREATE_ENV) {
                await createNewEnvironment(req.body.environment, req.body.email, req.body.password);
                // res.redirect(`/${req.params.lang}/users/env-creation.html`);
                let domain = process.env.BUILD_DEVELOPMENT ? 'frmdb.localhost' : 'formuladb.io';
                res.redirect(`/${req.params.lang}/users/env-creation.html`);
            } else {
                login(req, res, next);
                return;
            }
        });

        app.get('/:lang/users/logout', function (req, res) {
            req.logout();
            req.session?.destroy(function (err) {
                res.redirect('/');
            });
        });
    }

    async authResource(requestType: RequestType, permission: PermissionType, appName: string, resourceEntityId: string, resourceId: string | undefined,
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

            return this.processAuthStatus(requestType, authStatus, req, res, next);
        } else return true;
    }

    processAuthStatus(requestType: RequestType, authStatus: AuthStatus, req: express.Request, res: express.Response, next) {
        if (authStatus === "allowed") {
            return true;
        } else if (authStatus === "needs-login") {
            if (requestType === "page") needsLogin(req, res, next);
            else res.status(403).send({});
            return false;
        } else if (authStatus === "off") {
            req.user = { ...req.user, role: process.env.FRMDB_AUTH_DISABLED_DEFAULT_ROLE || '$ADMIN' };
            return true;
        } else {
            res.status(403).send();
            return false;
        }
    }

    async authEvent(requestType: RequestType, appName: string, event: events.MwzEvents, req: express.Request, res: express.Response, next): Promise<boolean> {
        if (process.env.FRMDB_AUTH_ENABLED === "true") {
            let userRole = this.roleFromReq(req);
            let userId = this.userIdFromReq(req);

            let authStatus = await this.auth.authEvent(userId, userRole, appName, event);
            return this.processAuthStatus(requestType, authStatus, req, res, next);
        } else return true;
    }
}
