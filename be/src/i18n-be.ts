import { KeyTableStoreI, KeyValueStoreFactoryI } from "@storage/key_value_store_i";
import { DictionaryEntry } from "@domain/dictionary-entry";
import { $Dictionary } from "@domain/metadata/default-metadata";
import { v3beta1 } from "@google-cloud/translate";
import { elvis } from "@core/elvis";

const translationClient = new v3beta1.TranslationServiceClient();
const projectId = 'seismic-plexus-232506';

const translateBatchSize = 128;
const EMPTY_MAP = new Map();
const DEFAULT_LANGUAGE = 'en';

export class I18nBe {
    kvs$Dictionary: KeyTableStoreI<DictionaryEntry>;
    dictionaryCache: Map<string, DictionaryEntry> = new Map();

    constructor(private kvsFactory: KeyValueStoreFactoryI) {
        this.getDictionaryKvs();
    }

    async getDictionaryKvs(): Promise<KeyTableStoreI<DictionaryEntry>> {
        if (!this.kvs$Dictionary) {
            this.kvs$Dictionary = await this.kvsFactory.createKeyTableS<DictionaryEntry>($Dictionary);
            let all = await this.kvs$Dictionary.all();
            for (let dictEntry of all) {
                this.dictionaryCache.set(dictEntry._id, dictEntry);
            }
        }
        return this.kvs$Dictionary;
    }

    async translateText(texts: string[], toLangAndCountry: string) {
        let toLang = toLangAndCountry.slice(0, 2);
        const batches: string[][] = [];
        let dictionaryKVS = await this.getDictionaryKvs();
        let dirtyDictionaryEntries: Map<string, DictionaryEntry> = new Map();
        let returnedTranslations: {[key: string]: string} = {};

        let i = 0;
        let batch: string[] = [];
        for (let text of texts) {
            if ((this.dictionaryCache.get(text) || {})[toLang]) {
                returnedTranslations[text] = this.dictionaryCache.get(text)![toLang];
            } else {
                batch.push(text)
                i++;
            }
            if (i%translateBatchSize == 0) {
                batches.push(batch);
                batch = [];
            }
        }
        if (batch.length > 0) batches.push(batch);

        // const translations = await Promise.all(batches.map(batch => {
        //     // Construct request
        //     const request = {
        //         parent: translationClient.locationPath(projectId, 'global'),
        //         contents: batch,
        //         mimeType: 'text/html', // mime types: text/plain, text/html
        //         sourceLanguageCode: DEFAULT_LANGUAGE,
        //         targetLanguageCode: toLangAndCountry,
        //     };
        //     if (batch.length == 0) return [{translations: []}];
        //     return translationClient.translateText(request)
        //         .then(x => {
        //             let translatedBatch: string[] = x[0].translations.map(t => t.translatedText);
        //             for (let [idx, defaultText] of batch.entries()) {
        //                 let translatedText = translatedBatch[idx];
        //                 let dictEntry: DictionaryEntry = this.dictionaryCache.get(defaultText) || {_id: defaultText} as DictionaryEntry;
        //                 dictEntry[toLang] = translatedText;
        //                 dirtyDictionaryEntries.set(defaultText, dictEntry);
        //                 returnedTranslations[defaultText] = translatedText;
        //             }
        //             console.log(x);
        //             return x;
        //         })
        //         .catch(err => {
        //             console.error(err, JSON.stringify(request)); 
        //             throw err;
        //         });
        // }));

        for (let dirtyDictEntry of dirtyDictionaryEntries.values()) {
            this.dictionaryCache.set(dirtyDictEntry._id, dirtyDictEntry);
            /*no-await*/ dictionaryKVS.put(dirtyDictEntry);
        }

        return returnedTranslations;
    }

}