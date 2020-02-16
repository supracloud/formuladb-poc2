import { KeyTableStoreI, KeyValueStoreFactoryI } from "@storage/key_value_store_i";
import { $Dictionary, $DictionaryObjT } from "@domain/metadata/default-metadata";


export class I18nStorage {
    kvs$Dictionary: KeyTableStoreI<$DictionaryObjT>;
    dictionaryCache: Map<string, $DictionaryObjT> = new Map();

    constructor(private kvsFactory: KeyValueStoreFactoryI) {
        this.getDictionaryKvs();
    }

    async getDictionaryKvs(): Promise<KeyTableStoreI<$DictionaryObjT>> {
        if (!this.kvs$Dictionary) {
            this.kvs$Dictionary = await this.kvsFactory.createKeyTableS<$DictionaryObjT>($Dictionary);
            let all = await this.kvs$Dictionary.all();
            for (let dictEntry of all) {
                this.dictionaryCache.set(dictEntry._id, dictEntry);
            }
        }
        return this.kvs$Dictionary;
    }
}
