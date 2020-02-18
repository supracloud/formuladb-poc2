import { KeyValueStoreFactoryI } from "@storage/key_value_store_i";
import { v3beta1 } from "@google-cloud/translate";
import { $DictionaryObjT, $Dictionary } from "@domain/metadata/default-metadata";
import { FrmdbEngine } from "@core/frmdb_engine";

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

export async function i18nTranslateText(frdbEngine: FrmdbEngine, texts: string[], toLangAndCountry: string) {
    let toLang = toLangAndCountry.slice(0, 2);
    const batches: string[][] = [];
    let dictionaryCache = await frdbEngine.i18nStore.getDictionaryCache();
    let dirtyDictionaryEntries: Map<string, $DictionaryObjT> = new Map();
    let returnedTranslations: { [key: string]: string } = {};

    let i = 0;
    let batch: string[] = [];
    for (let text of texts) {
        if ((dictionaryCache.get(text) || {})[toLang]) {
            returnedTranslations[text] = dictionaryCache.get(text)![toLang];
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
            let dictEntry: $DictionaryObjT = dictionaryCache.get(defaultText) || { _id: $Dictionary._id + '~~' + defaultText } as $DictionaryObjT;
            dictEntry[toLang] = translatedText;
            dirtyDictionaryEntries.set(defaultText, dictEntry);
            returnedTranslations[defaultText] = translatedText;
        }
    }

    for (let dirtyDictEntry of dirtyDictionaryEntries.values()) {
        dictionaryCache.set(dirtyDictEntry._id, dirtyDictEntry);
            /*no-await*/ frdbEngine.i18nStore.updateDictionaryEntry(dirtyDictEntry);
    }

    return returnedTranslations;
}
