import * as express from "express";
import * as passport from "passport";
import * as connectEnsureLogin from "connect-ensure-login";
import { Strategy as LocalStrategy } from "passport-local";
import * as md5 from 'md5';
import { $User, $UserObjT, $PermissionObjT, $Permission } from "@domain/metadata/default-metadata";
import { LazyInit } from "@domain/ts-utils";
import { KeyTableStoreI, KeyValueStoreFactoryI } from "@storage/key_value_store_i";
import { FrmdbStore } from "@core/frmdb_store";

const needsLogin = connectEnsureLogin.ensureLoggedIn('/login');
export type AuthStatus = "allowed" | "not-allowed" | "needs-login" | "off";
export interface AuthInputData {
    userId: string;
    userRole: string;
    method: "GET" | "POST" | "DELETE" | "PUT";
    resourceEntityId: string;
    resourceId: string;
}

export class Auth {
    usersAndPerms: LazyInit<{
        users: { [_id: string]: $UserObjT };
        permissions: $PermissionObjT[];
    }>;

    constructor(private frmdbStore: FrmdbStore) {
        this.usersAndPerms = new LazyInit(async () => {
            let users: { [_id: string]: $UserObjT } = {};
            let usersList = await this.frmdbStore.all($User._id);
            for (let user of usersList) {
                users[user._id] = user;
            }
            let permissions = await this.frmdbStore.all($Permission._id);
            console.info("Permissions", permissions);
            
            return {
                users,
                permissions,
            };
        });
    }

    async getUser(userId: string): Promise<$UserObjT | null> {
        let up = await this.usersAndPerms.get();
        return up.users[userId];
    }

    permissionMatchesReq(inputData: AuthInputData, perm: $PermissionObjT) {
        return (
            perm.resource_id === inputData.resourceId 
            || (perm.resource_entity_id === inputData.resourceEntityId && !perm.resource_id )
        ) && inputData.userRole === perm.role
    }

    async authResource(inputData: AuthInputData): Promise<AuthStatus> {

        if (process.env.FRMDB_AUTH_ENABLED === "true") {
            console.log("auth enabled");

            if (inputData.userRole === '$ADMIN') {
                return "allowed";
            } else {
                let up = await this.usersAndPerms.get();
                let ret: AuthStatus = "not-allowed";
                for (let perm of up.permissions) {
                    if (this.permissionMatchesReq(inputData, perm)) {
                        if (perm.permission.indexOf(inputData.method) === 0) {
                            if (perm.permission.indexOf('-all') > 0) { 
                                ret = "allowed";
                                break; 
                            }
                            else if (perm.permission.indexOf('-group') > 0) { 
                                //TODO
                            }
                            else if (perm.permission.indexOf('-owner') > 0) { 
                                //TODO
                            } else throw new Error(`Unknown permission ${JSON.stringify(perm)}`);
                        }
                    } 
                }
                if (!ret && inputData.userRole === '$ANONYMOUS') return "needs-login";
                else return ret;
            }
        } else return "off";
    }
}
