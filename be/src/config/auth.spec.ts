/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

import * as _ from 'lodash';
import { getTestFrmdbEngine } from '@storage/key_value_store_impl_selector';
import { FrmdbEngine } from '@core/frmdb_engine';
import { Auth } from './auth';
import { $User, $Permission, $Page, $PermissionObjT } from '@domain/metadata/default-metadata';
import { KeyValueObj } from '@domain/key_value_obj';
import { ServerEventModifiedFormData } from '@domain/event';

describe('auth', () => {
    let frmdbEngine: FrmdbEngine;
    let auth: Auth;
    let authEnabledBak: string | undefined;

    async function putPerm(obj: $PermissionObjT): Promise<ServerEventModifiedFormData> {
        return await frmdbEngine.processEventAnonymous(new ServerEventModifiedFormData(obj)) as ServerEventModifiedFormData;
    }

    beforeEach(async () => {
        frmdbEngine = await getTestFrmdbEngine({
            _id: "", entities: {
                [$User._id]: $User,
                [$Permission._id]: $Permission,
            }
        });
        await frmdbEngine.frmdbEngineStore.kvsFactory.clearAllForTestingPurposes();
        auth = new Auth(frmdbEngine.frmdbEngineStore);

        authEnabledBak = process.env.FRMDB_AUTH_ENABLED;
        process.env.FRMDB_AUTH_ENABLED = "true";
    });

    afterEach(() => {
        process.env.FRMDB_AUTH_ENABLED = authEnabledBak;
    })

    it('authorize pages', async () => {
        await putPerm({ _id: "$Permission~~1", role: "$ANONYMOUS", app_name: "*", resource_entity_id: $Page._id, permission: "0READ", for_who: "ROLE" });

        let authStatus = await auth.authResource(
            { userId: '', userRole: "$ANONYMOUS", permission: "0READ", appName: "appName", resourceEntityId: $Page._id, resourceId: '/appName/index' });
        expect(authStatus).toEqual("allowed");
        authStatus = await auth.authResource(
            { userId: '', userRole: "$ANONYMOUS", permission: "5WRITE", appName: "appName", resourceEntityId: $Page._id, resourceId: '/appName/index' });
        expect(authStatus).toEqual("needs-login");

        authStatus = await auth.authResource(
            { userId: '', userRole: "$ADMIN", permission: "0READ", appName: "appName", resourceEntityId: $Page._id, resourceId: '/appName/index' });
        expect(authStatus).toEqual("allowed");
        authStatus = await auth.authResource(
            { userId: '', userRole: "$ADMIN", permission: "5WRITE", appName: "appName", resourceEntityId: $Page._id, resourceId: '/appName/index' });
        expect(authStatus).toEqual("allowed");
    });
});
