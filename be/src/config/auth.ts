import * as express from "express";
import * as passport from "passport";
import * as connectEnsureLogin from "connect-ensure-login";
import { KeyTableStoreI, KeyValueStoreFactoryI } from "@storage/key_value_store_i";
import { BeUser } from "@domain/user";
import { Strategy as LocalStrategy } from "passport-local";
import * as md5 from 'md5';
import { $User } from "@domain/metadata/default-metadata";

const FREE_PATHS = [/\/formuladb-env\/static/, /\/formuladb-env/themes/formuladb/, /\/assets/, /\/register/, /\/login/, /\/formuladb-env\/apps/, /^\/$/];
const ADMIN_PATHS = [/\/formuladb-editor/];

export function initPassport(app: express.Express,
                             kvsFactory: KeyValueStoreFactoryI) {

    var kvs$User: KeyTableStoreI<BeUser>;

    async function getUserKvs(): Promise<KeyTableStoreI<BeUser>> {
        if (!kvs$User) {
            kvs$User = await kvsFactory.createKeyTableS<BeUser>($User);
        }
        return Promise.resolve(kvs$User);
    }    
    
    passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },
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
            let user = await userKVS.get(id);
            if (!user) return cb(new Error("User " + id + " forbidden or not found !"));
            return cb(null, user);
        } catch (err) {
            return cb(err);
        }
    });
    app.use(passport.initialize());
    app.use(passport.session());
}

export function handleAuth(app: express.Express) {
    app.get('/isauthenticated', function(req, res) {
        res.status(200).send({ isauthenticated: req.isAuthenticated() });
    });

    app.get('/isadminauthenticated', function(req, res) {
        res.status(200).send(
            { isadminauthenticated: ('user' in req && 'role' in req.user && req.user.role === 'ADMIN') }
        );
    });

    app.get('/isproductionenv', function(req, res) {
        res.status(200).send({ isproductionenv: process.env.FRMDB_IS_PROD_ENV === "true" });
    });

    app.get('/login', function(req, res) {
        res.sendFile('/wwwroot/git/formuladb-env/apps/formuladb.io/login.html');
    });

    app.post('/login',
    passport.authenticate('local', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/');
    });

    app.get('/logout', function(req, res) {
        req.logout();
        req.session.destroy(function (err) {
            res.redirect('/');
        });
    });

    if (process.env.FRMDB_AUTH_ENABLED === "true") {
        console.log("auth enabled");
        app.use(function (req, res, next) {

            if (req.user && req.user.role && req.user.role === 'ADMIN') {
                next();
                return;
            }

            var adminpath = ADMIN_PATHS.some(function(regex) {
                return regex.test(req.path);
            });
            if (adminpath && process.env.FRMDB_IS_PROD_ENV !== "true") {
                // Check if user role is admin
                if (!req.user || !req.user.role) {
                    res.redirect('/login');
                    return;
                }
                if (req.user.role !== 'ADMIN') {
                    res.redirect('/');
                    return;
                }
            }

            var freepath = FREE_PATHS.some(function(regex) {
                return regex.test(req.path);
            });
            if (! freepath) {
                connectEnsureLogin.ensureLoggedIn('/login')(req, res, next);
            } else next();
        });

    } else {
        app.use(function (req, res, next) {
            req.user = { role: process.env.FRMDB_AUTH_DISABLED_DEFAULT_ROLE || 'ADMIN' };
            next();
        });
    }
}
