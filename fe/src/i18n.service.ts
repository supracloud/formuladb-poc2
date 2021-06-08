import { FrmdbError, getValidationFullName } from "@domain/errors";
import { I18N_UTILS } from "@core/i18n-utils";
import { I18nLang } from "@domain/i18n";
import { parseMandatoryPageUrl } from "@domain/url-utils";
import { waitUntil } from "@domain/ts-utils";

export class I18nService {

    constructor(private dictionary: { [literal: string]: string }) {
    }

    tt(value: string, param?: string, param2?: string): string {
        let p = param || '';
        let p2 = param2 || '';
        let transalation = this.dictionary ? this.dictionary[value] : null;
        if (transalation) {
            transalation = transalation.replace('$PARAM$', this.dictionary[p] || p)
                .replace('$PARAM2$', this.dictionary[p2] || p2)
            ;
        }
        // console.error("I18N " + transalation, value, this.dictionary);
        return transalation || value;
    }

    terr(err: FrmdbError) {
        if (typeof err === "string") {
            return this.tt(err);
        } else {
            return err.map(e => {
                if (!e.errorMessage) return '';
                if (typeof e.errorMessage === "string") return this.tt(e.errorMessage)
                else {
                    let tmpl = this.tt(e.errorMessage[0] + '');
                    if (e.params) {
                        for (let i = 1; i < e.params?.length||0; i++) {
                            tmpl = tmpl.replace('%%', e.params[i] + '');
                        }
                    }
                }
            }).join('; '); 
        }
    }

    public setDictionary(dictionary: { [literal: string]: string }) {
        this.dictionary = dictionary;
    }

    public async waitForDictionary() {
        if (Object.keys(this.dictionary).length == 0) {
            await waitUntil(() => Promise.resolve(Object.keys(this.dictionary).length > 0), 45, 500);
        }
    }
    public async translateElement(el: HTMLElement) {
        await this.waitForDictionary();
        let pageOpts = parseMandatoryPageUrl(window.location.pathname);
        I18N_UTILS.applyLanguageOnCleanHtmlPage(el, pageOpts.lang as I18nLang, this.dictionary);
    }
}

export const I18N = new I18nService({});
export function setDictionary(dictionary: { [literal: string]: string }) {
    I18N.setDictionary(dictionary);
}
