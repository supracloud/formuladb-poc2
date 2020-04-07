import * as express from "express";
import * as passport from "passport";
import * as connectEnsureLogin from "connect-ensure-login";
import { Strategy as LocalStrategy } from "passport-local";
import * as md5 from 'md5';
import { $User, $UserObjT, $PermissionObjT, $Permission, PermissionType } from "@domain/metadata/default-metadata";
import { LazyInit } from "@domain/ts-utils";
import { KeyTableStoreI, KeyValueStoreFactoryI } from "@storage/key_value_store_i";
import { FrmdbStore } from "@core/frmdb_store";

const needsLogin = connectEnsureLogin.ensureLoggedIn('/login');
export type AuthStatus = "allowed" | "not-allowed" | "needs-login" | "off";
export interface AuthInputData {
    userId: string;
    userRole: string;
    permission: PermissionType;
    appName: string;
    resourceEntityId: string;
    resourceId: string;
}

export class Auth {

    constructor(private frmdbStore: FrmdbStore) {
    }

    async getUser(userId: string): Promise<$UserObjT | null> {
        return this.frmdbStore.getDataObj(userId) as Promise<$UserObjT | null>;
    }

    async permissionMatchesUser(userId: string, userRole: string, perm: $PermissionObjT): Promise<boolean> {
        if (perm.for_who === "ALL") return true;
        else if (perm.for_who === "ROLE") return userRole === perm.role;
        else if (perm.for_who === "OWNER") {
            if (!perm.resource_id) {
                console.warn(`OWNER permission but no resource id`, userId, userRole, perm);
                return false;
            }
            let dataObj = await this.frmdbStore.getDataObj(perm.resource_id);
            return dataObj?.owner == userId;
        } else return false;
    }
    permissionMatchesReq(inputData: AuthInputData, perm: $PermissionObjT): boolean {
        if (perm.permission < inputData.permission) return false;

        if (perm.resource_id === inputData.resourceId) return true;
        else if (perm.resource_entity_id === inputData.resourceEntityId && !perm.resource_id) return true;
        else if (perm.role === inputData.userRole && !perm.resource_entity_id && !perm.resource_id) return true;
        else return false;
    }

    async authResource(inputData: AuthInputData): Promise<AuthStatus> {

        if (process.env.FRMDB_AUTH_ENABLED === "true") {
            console.log("auth enabled");

            if (inputData.userRole === '$ADMIN') {
                return "allowed";
            } else {
                let permissions: $PermissionObjT[] = await this.frmdbStore.all($Permission._id);
                let allowed: boolean = false;
                for (let perm of permissions) {
                    if (this.permissionMatchesReq(inputData, perm)) {
                        let matchesUser = await this.permissionMatchesUser(inputData.userId, inputData.userRole, perm); 
                        if (matchesUser) allowed = true;
                    }
                }
                if (!allowed) {
                    if (inputData.userRole === '$ANONYMOUS') return "needs-login";
                    else return "not-allowed";
                } else return "allowed";
            }
        } else return "off";
    }
}
