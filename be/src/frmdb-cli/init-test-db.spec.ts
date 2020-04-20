const util = require('util');
const exec = util.promisify(require('child_process').exec);

import { initTestDb } from './init-test-db';
import { getKeyValueStoreFactory } from '@storage/key_value_store_impl_selector';

describe('initTestDb', () => {

    it("init test data", async () => {

        let kvsFactory = await getKeyValueStoreFactory();
        let envDir = kvsFactory.metadataStore.envDir;
        await exec(`rm -rf ${envDir}/db`);
        await exec(`cp -ar ./git/formuladb-env/db ${envDir}`);

        await initTestDb(kvsFactory);
    });
});
