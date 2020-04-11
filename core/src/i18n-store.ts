import { KeyTableStoreI, KeyValueStoreFactoryI } from "@storage/key_value_store_i";
import { $Dictionary, $DictionaryObjT } from "@domain/metadata/default-metadata";
import { waitUntil, LazyInit } from "@domain/ts-utils";
import { FrmdbStore } from "@core/frmdb_store";
import { FrmdbEngine } from "./frmdb_engine";
import { ServerEventModifiedFormData } from "@domain/event";


export class I18nStore {

    constructor(private frmdbEngine: FrmdbEngine) {
        console.log("I18nStore");
    }

    dictionaryCache: Map<string, $DictionaryObjT> | undefined;
    async getDictionaryCache(): Promise<Map<string, $DictionaryObjT>> {
        if (this.dictionaryCache) return this.dictionaryCache;

        let cacheInit = new LazyInit(async () => {
            let all: $DictionaryObjT[] =
                await this.frmdbEngine.frmdbEngineStore.getDataListByPrefix($Dictionary._id + '~~') as $DictionaryObjT[];
            let dictCache = new Map();
            for (let dictEntry of all) {
                dictCache.set(dictEntry._id, dictEntry);
            }
            this.dictionaryCache = dictCache;
            return this.dictionaryCache;
        })

        return cacheInit.get();
    }

    async updateDictionaryEntry(userRole: string, userId: string, dictEntry: $DictionaryObjT) {
        let dictCache, existingEntry;
        try {
            existingEntry = await this.frmdbEngine.frmdbEngineStore.getDataObj(dictEntry._id);
        } catch (err) {
            console.warn(err);
        }
        try {
            await this.frmdbEngine.processEvent(userRole, userId, 
                new ServerEventModifiedFormData(Object.assign(existingEntry || {}, dictEntry)));
        } catch (err) {
            console.warn(err);
        }
        try {
            dictCache = await this.getDictionaryCache();
        } catch (err) {
            console.warn(err);
        }
        try {
            dictCache.set(dictEntry._id, Object.assign(dictCache.get(dictEntry._id), dictEntry));
        } catch (err) {
            console.warn(err);
        }
    }
}
