import { SimpleAddHocQuery } from "@domain/metadata/simple-add-hoc-query";
import { $Icon, $IconObjT, $App, $Page, $Table } from "@domain/metadata/default-metadata";
import { KeyValueStoreFactoryI, KeyTableStoreI } from "@storage/key_value_store_i";
import { simpleAdHocQueryOnArrayOfOBjects } from "@core/simple-add-hoc-query";

export async function simpleAdHocQueryForMetadataEntities(tenantName: string, appName: string, kvsFactory: KeyValueStoreFactoryI, tableName: string, query: SimpleAddHocQuery): Promise<any[]> {
    if (tableName === $App._id) {
        return simpleAdHocQueryOnArrayOfOBjects(query, 
            await kvsFactory.metadataStore.getApps(tenantName, appName));
    } else if (tableName === $Page._id) {
        return simpleAdHocQueryOnArrayOfOBjects(query, 
            await kvsFactory.metadataStore.getPages(tenantName, appName));
    } else if (tableName === $Table._id) {
        return simpleAdHocQueryOnArrayOfOBjects(query, 
            await kvsFactory.metadataStore.getTables(tenantName, appName));
    } else if (tableName === $Icon._id) {
        return simpleAdHocQueryOnArrayOfOBjects(query, 
            await kvsFactory.metadataStore.getAvailableIcons(tenantName, appName));
    } else throw new Error(`Unknown metadata entity ${tableName}`);
}
