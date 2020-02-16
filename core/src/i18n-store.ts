import { KeyTableStoreI, KeyValueStoreFactoryI } from "@storage/key_value_store_i";
import { $Dictionary, $DictionaryObjT } from "@domain/metadata/default-metadata";
import { waitUntil } from "@domain/ts-utils";
import { FrmdbStore } from "@core/frmdb_store";


export class I18nStore {
    cacheState: 'none' | 'initializing' | 'initialized' = 'none'; 
    private dictionaryCache: Map<string, $DictionaryObjT> = new Map();

    constructor(private frmdbStore: FrmdbStore) {
    }

    async getDictionaryCache(): Promise<Map<string, $DictionaryObjT>> {
        if ('none' === this.cacheState) {
            let all: $DictionaryObjT[] = 
                await this.frmdbStore.getDataListByPrefix($Dictionary._id + + '~~') as $DictionaryObjT[];
            for (let dictEntry of all) {
                this.dictionaryCache.set(dictEntry._id, dictEntry);
            }
        } else if ('initializing' == this.cacheState) {
            await waitUntil(() => 'initialized' == this.cacheState);
        }
        return this.dictionaryCache;
    }

    async updateDictionaryEntry(dictEntry: $DictionaryObjT) {
        return this.frmdbStore.putDataObj(dictEntry);
    }
}
