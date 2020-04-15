import { LANGUAGES, DEFAULT_LANGUAGE, I18nLang, DEFAULT_FLAG } from "@domain/i18n";
import { $DictionaryObjT, $Dictionary } from "@domain/metadata/default-metadata";

const translatableSelector = 'th,td,p,div,span,h1,h2,h3,h4,h5,h6,li,button,a,label,legend,[placeholder]';
const allowedInnerTags = 'b,strong,i,br,hr,em,q';
const notAllowedTagsForTextEditing = ['input', 'select', 'textarea', 'video', 'img'];

export function getTranslationKey(el) {
    return el.hasAttribute('data-i18n-key') ? el.getAttribute('data-i18n-key') : (
        el.hasAttribute('placeholder') ? el.getAttribute('placeholder') : el.innerHTML)
}

export function getTextValue(el: HTMLElement) {
    if (el.hasAttribute('placeholder')) {
        return el.getAttribute('placeholder')!;
    } else {
        return el.innerHTML;
    }
}

export function isElementWithTextContentEditable(el: HTMLElement) {
    return el.matches(translatableSelector) && isElementWithTextContent(el);
}

export function isElementWithTextContent(el: any) {
    if (el.hasAttribute('placeholder')) {
        return true;
    }
    if (el.childNodes && [...el.childNodes]
        .some(cn => cn.nodeType !== 3 && cn.tagName && allowedInnerTags.indexOf(cn.tagName.toLowerCase()) < 0 && !notAllowedTagsForTextEditing.includes(cn.tagName.toLowerCase()))) {
        return false;
    }
    if (el.textContent.trim().length === 0) {
        return false;
    }
    return true;
}

export type TranslateCallback = (targetLang: I18nLang, texts: string[]) => Promise<{ [key: string]: string }>;

export class I18Utils {

    get defaultLanguage() { return DEFAULT_LANGUAGE; }
    get defaultFlag() { return DEFAULT_FLAG; }

    public getLangDesc(lang: string) {
        return this.languages.find(l => l.lang == lang);
    }
    public getDefaultLanguage() {
        return this.getLangDesc(this.defaultLanguage)!;
    }

    get languages() {
        return Object.values(LANGUAGES);
    };

    translate(sourceLang, sourceValue, targetLang) {
        return sourceValue;
    };

    setTextValue(el: HTMLElement, text: string) {
        if (el.hasAttribute('placeholder')) {
            el.setAttribute('placeholder', text);
        } else {
            el.innerHTML = text;
        }
    }

    async translateAll(rootElement: Document | ShadowRoot | HTMLElement, prevLang: I18nLang, targetLang: I18nLang, translate: TranslateCallback) {
        if (!rootElement) return;

        const toTranslateElems: HTMLElement[] = Array.from(rootElement.querySelectorAll(translatableSelector))
            .filter(el => isElementWithTextContent(el)) as HTMLElement[];
        const toTranslateMap = toTranslateElems.reduce((acc: { [key: string]: HTMLElement[] }, el) => {
            let translationKey = getTranslationKey(el);

            if (acc[translationKey]) {
                acc[translationKey].push(el);
            } else {
                acc[translationKey] = [el];
            }

            return acc;
        }, {});

        if (DEFAULT_LANGUAGE === targetLang) {
            for (let els of Object.values(toTranslateMap)) {
                for (let el of (els as HTMLElement[])) {
                    let defaultText = el.getAttribute('data-i18n-key');
                    if (defaultText) this.setTextValue(el, defaultText);
                }
            }
            return;
        }

        console.log("Parsed HTML, sending translations", targetLang, Object.keys(toTranslateMap));
        let returnedTranslations = await translate(targetLang, Object.keys(toTranslateMap));
    }

    cleanI18nTranslations(rootEl: Document | ShadowRoot | HTMLElement) {
        for (let el of Array.from(rootEl.querySelectorAll('[data-i18n-key]'))) {
            this.setTextValue(el as HTMLElement, el.getAttribute('data-i18n-key')!);
            el.removeAttribute('data-i18n-key');
        }
    }

    applyLanguageOnCleanHtmlPage(rootElement: Document | ShadowRoot | HTMLElement, targetLang: I18nLang, dictionary: Map<string, $DictionaryObjT>) {
        if (targetLang === DEFAULT_LANGUAGE) return;

        for (let el of Array.from(rootElement.querySelectorAll(translatableSelector))) {
            if (!isElementWithTextContent(el)) continue;
            let textDefaultLanguage = getTextValue(el as HTMLElement);
            el.setAttribute('data-i18n-key', textDefaultLanguage);
            this.setTextValue(el as HTMLElement, 
                dictionary.get($Dictionary._id + '~~' + textDefaultLanguage)?.[targetLang] || `${targetLang}:${textDefaultLanguage}`);
        }
    }
}

export const I18N_UTILS = new I18Utils();
