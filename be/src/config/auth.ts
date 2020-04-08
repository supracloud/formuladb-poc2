import * as micromatch from 'micromatch';
import * as connectEnsureLogin from "connect-ensure-login";
import { $UserObjT, $PermissionObjT, $Permission, PermissionType, $Table, $Page, $Image, $Icon, $App } from "@domain/metadata/default-metadata";
import { FrmdbStore } from "@core/frmdb_store";
import * as events from "@domain/event";
import { parseDataObjId } from '@domain/metadata/data_obj';

const needsLogin = connectEnsureLogin.ensureLoggedIn('/login');
export type AuthStatus = "allowed" | "not-allowed" | "needs-login" | "off";
export interface AuthInputData {
    userId: string;
    userRole: string;
    permission: PermissionType;
    appName: string;
    resourceEntityId: '$ALL_RESOURCES$' | string;
    resourceId?: string;
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
            return dataObj?._owner == userId;
        } else return false;
    }
    permissionMatchesReq(inputData: AuthInputData, perm: $PermissionObjT): boolean {
        if (perm.permission < inputData.permission) return false;
        if (!micromatch.isMatch(inputData.appName, perm.app_name)) return false;

        if (perm.resource_id === "$ALL_RESOURCES$" || perm.resource_id === inputData.resourceId) return true;
        else if (perm.resource_entity_id === inputData.resourceEntityId && !perm.resource_id) return true;
        else if (perm.role === inputData.userRole && !perm.resource_entity_id && !perm.resource_id) return true;
        else return false;
    }

    async authResource(inputData: AuthInputData): Promise<AuthStatus> {

        if (process.env.FRMDB_AUTH_ENABLED === "true") {

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

    async authEvent(userId: string, userRole: string, appName: string, event: events.MwzEvents): Promise<AuthStatus> {
        switch (event.type_) {
            case "ServerEventModifiedFormData":
                return this.authResource({userId, userRole, permission: "5WRITE", appName, resourceEntityId: parseDataObjId(event.obj._id).entityId, resourceId: event.obj._id});
            case "ServerEventDeletedFormData":
                return this.authResource({userId, userRole, permission: "7DELETE", appName, resourceEntityId: parseDataObjId(event.obj._id).entityId, resourceId: event.obj._id});
            case "ServerEventNewEntity":
                return this.authResource({userId, userRole, permission: "5WRITE", appName, resourceEntityId: $Table._id, resourceId: event.entityId});
            case "ServerEventDeleteEntity":
                return this.authResource({userId, userRole, permission: "7DELETE", appName, resourceEntityId: $Table._id, resourceId: event.entityId});
            case "ServerEventPreviewFormula":
                return this.authResource({userId, userRole, permission: "2PREVIEWEDIT", appName, resourceEntityId: event.targetEntity._id, resourceId: event.targetPropertyName});
            case "ServerEventSetProperty":
                return this.authResource({userId, userRole, permission: "5WRITE", appName, resourceEntityId: event.targetEntity._id, resourceId: event.property.name});
            case "ServerEventDeleteProperty":
                return this.authResource({userId, userRole, permission: "7DELETE", appName, resourceEntityId: event.targetEntity._id, resourceId: event.propertyName});
            case "ServerEventPutPageHtml":
                return this.authResource({userId, userRole, permission: "5WRITE", appName, resourceEntityId: $Page._id, resourceId: `${$Page._id}~~${event.pageOpts.pageName}`});
            case "ServerEventPutMediaObject":
                //TODO media objects are still using hardcoded routes (/formuladb-api/:app/media), they are not implemented as metadata store entities
                return this.authResource({userId, userRole, permission: "5WRITE", appName, resourceEntityId: $Image._id, resourceId: `${$Image._id}~~${event.fileName}`});
            case "ServerEventPutIcon":
                return this.authResource({userId, userRole, permission: "5WRITE", appName, resourceEntityId: $Icon._id, resourceId: `${$Icon._id}~~${event.iconId}`});
            case "ServerEventSetPage":
                return this.authResource({userId, userRole, permission: "5WRITE", appName, resourceEntityId: $Page._id, resourceId: `${$Page._id}~~${event.pageOpts.pageName}`});
            case "ServerEventDeletePage":
                return this.authResource({userId, userRole, permission: "7DELETE", appName, resourceEntityId: $Page._id, resourceId: `${$Page._id}~~${event.pageName}`});
            case "ServerEventNewApp":
                return this.authResource({userId, userRole, permission: "5WRITE", appName, resourceEntityId: $App._id, resourceId: `${$App._id}~~${event.appName}`});
            default:
                return Promise.reject("n/a event");
        }
    }
}
