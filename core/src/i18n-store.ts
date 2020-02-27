import { KeyTableStoreI, KeyValueStoreFactoryI } from "@storage/key_value_store_i";
import { $Dictionary, $DictionaryObjT } from "@domain/metadata/default-metadata";
import { waitUntil, LazyInit } from "@domain/ts-utils";
import { FrmdbStore } from "@core/frmdb_store";
import { FrmdbEngine } from "./frmdb_engine";
import { ServerEventModifiedFormData } from "@domain/event";


export class I18nStore {

    constructor(private frmdbEngine: FrmdbEngine) {
    }

    async getDictionaryCache(): Promise<Map<string, $DictionaryObjT>> {
        let dictionaryCache: Map<string, $DictionaryObjT> = new Map();
        let cacheInit = new LazyInit(async () => {
            let all: $DictionaryObjT[] = 
                await this.frmdbEngine.frmdbEngineStore.getDataListByPrefix($Dictionary._id + '~~') as $DictionaryObjT[];
            for (let dictEntry of all) {
                dictionaryCache.set(dictEntry._id, dictEntry);
            }
            return dictionaryCache;
        })

        return cacheInit.get();
    }

    async updateDictionaryEntry(dictEntry: $DictionaryObjT) {
        await this.frmdbEngine.processEvent(new ServerEventModifiedFormData(dictEntry));
        let dictCache = await this.getDictionaryCache();
        dictCache.set(dictEntry._id, Object.assign(dictCache.get(dictEntry._id), dictEntry));
    }
}
