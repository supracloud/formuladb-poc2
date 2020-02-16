import { KeyValueStoreFactoryI } from "@storage/key_value_store_i";
import { v3beta1 } from "@google-cloud/translate";
import { I18nStorage } from "@storage/i18n-storage";
import { $DictionaryObjT } from "@domain/metadata/default-metadata";

const translationClient = new v3beta1.TranslationServiceClient();
const projectId = 'seismic-plexus-232506';

const translateBatchSize = 128;
const EMPTY_MAP = new Map();
const DEFAULT_LANGUAGE = 'en';


interface Translation {

    /** Translation translatedText */
    translatedText?: string;

    /** Translation model */
    model?: string;

    /** Translation detectedLanguageCode */
    detectedLanguageCode?: string;
}

export class I18nBe {
    i18nStorage: I18nStorage;

    constructor(private kvsFactory: KeyValueStoreFactoryI) {
        this.i18nStorage = new I18nStorage(kvsFactory);
        this.i18nStorage.getDictionaryKvs();
    }


    async translateText(texts: string[], toLangAndCountry: string) {
        let toLang = toLangAndCountry.slice(0, 2);
        const batches: string[][] = [];
        let dictionaryKVS = await this.i18nStorage.getDictionaryKvs();
        let dirtyDictionaryEntries: Map<string, $DictionaryObjT> = new Map();
        let returnedTranslations: { [key: string]: string } = {};

        let i = 0;
        let batch: string[] = [];
        for (let text of texts) {
            if ((this.i18nStorage.dictionaryCache.get(text) || {})[toLang]) {
                returnedTranslations[text] = this.i18nStorage.dictionaryCache.get(text)![toLang];
            } else {
                batch.push(text)
                i++;
            }
            if (i % translateBatchSize == 0) {
                batches.push(batch);
                batch = [];
            }
        }
        if (batch.length > 0) batches.push(batch);

        v3beta1.TranslationServiceClient['']
        let promises = batches.filter(batch => batch.length > 0)
            .map(batch => translationClient.translateText({
                parent: translationClient.locationPath(projectId, 'global'),
                contents: batch,
                mimeType: 'text/html', // mime types: text/plain, text/html
                sourceLanguageCode: DEFAULT_LANGUAGE,
                targetLanguageCode: toLangAndCountry,
            }));
        let responses = await Promise.all(promises);

        for (let res of responses) {
            if (!res || !res[0] || !res[0].translations) continue;
            let translatedBatch: string[] = res[0].translations.map(t => t.translatedText).filter<string>((x): x is string => x != null);
            for (let [idx, defaultText] of batch.entries()) {
                let translatedText = translatedBatch[idx];
                let dictEntry: $DictionaryObjT = this.i18nStorage.dictionaryCache.get(defaultText) || { _id: defaultText } as $DictionaryObjT;
                dictEntry[toLang] = translatedText;
                dirtyDictionaryEntries.set(defaultText, dictEntry);
                returnedTranslations[defaultText] = translatedText;
            }
        }

        for (let dirtyDictEntry of dirtyDictionaryEntries.values()) {
            this.i18nStorage.dictionaryCache.set(dirtyDictEntry._id, dirtyDictEntry);
            /*no-await*/ dictionaryKVS.put(dirtyDictEntry);
        }

        return returnedTranslations;
    }

}