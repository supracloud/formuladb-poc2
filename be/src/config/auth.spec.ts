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

    async function putObj(obj: KeyValueObj): Promise<ServerEventModifiedFormData> {
        return await frmdbEngine.processEvent(new ServerEventModifiedFormData(obj)) as ServerEventModifiedFormData;
    }

    beforeEach(async () => {
        frmdbEngine = await getTestFrmdbEngine({_id: "", entities: {
            [$User._id]: $User,
            [$Permission._id]: $Permission,
        }});
        auth = new Auth(frmdbEngine.frmdbEngineStore);
        console.log(await frmdbEngine.frmdbEngineStore.all($Permission._id));
        await putObj({ _id: "$Permission~~1", resource_entity_id: $Page._id, role: "$ANONYMOUS", permission: "GET-all" } as $PermissionObjT);
        console.log(await frmdbEngine.frmdbEngineStore.all($Permission._id));

        authEnabledBak = process.env.FRMDB_AUTH_ENABLED ;
        process.env.FRMDB_AUTH_ENABLED = "true";
    });

    afterEach(() => {
        process.env.FRMDB_AUTH_ENABLED = authEnabledBak;
    })

    it('authorize pages', async () => {
        let authStatus = await auth.authResource({
            userId: '',
            userRole: "$ANONYMOUS",
            method: "GET", 
            resourceEntityId: $Page._id, 
            resourceId: '/appName/index'
        });
        expect(authStatus).toEqual("allowed");
    });
});
