import { SimpleAddHocQuery } from "@domain/metadata/simple-add-hoc-query";
import { $Icon, $IconObjT } from "@domain/metadata/default-metadata";
import { KeyValueStoreFactoryI, KeyTableStoreI } from "@storage/key_value_store_i";
import { simpleAdHocQueryOnArrayOfOBjects } from "@core/simple-add-hoc-query";

export async function simpleAdHocQueryForMetadataEntities(tenantName: string, appName: string, kvsFactory: KeyValueStoreFactoryI, tableName: string, query: SimpleAddHocQuery): Promise<any[]> {
    if (tableName === $Icon._id) {
        let iconNames = await kvsFactory.metadataStore.getAvailableIcons(tenantName, appName);
        let foundIcons = simpleAdHocQueryOnArrayOfOBjects(query,
            iconNames.map(i => ({ _id: i.replace(/^.*\/svg\//, '').replace(/\.svg$/, '') })));
        return foundIcons;
    } else throw new Error(`Unknown metadata entity ${tableName}`);
}
