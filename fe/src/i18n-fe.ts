const translatableSelector = 'p,div,span,h1,h2,h3,h4,h5,h6,li,button,a,label,[placeholder]';
const allowedInnerTags = 'b,strong,i,br,hr,em,q';
export const DEFAULT_LANGUAGE = 'en';

export function getTranslationKey(el) {
    return el.hasAttribute('data-i18n-key') ? el.getAttribute('data-i18n-key') : (
        el.hasAttribute('placeholder') ? el.getAttribute('placeholder') : el.innerHTML)
}

export function getTextValue(el: HTMLElement) {
    if (el.hasAttribute('placeholder')) {
        return el.getAttribute('placeholder');
    } else {
        return el.innerHTML;
    }
}

export function isElementWithTextContent(el: any) {
    if (el.hasAttribute('placeholder')) {
        return true;
    }
    if (el.childNodes && [...el.childNodes]
        .some(cn => cn.nodeType !== 3 && cn.tagName && allowedInnerTags.indexOf(cn.tagName.toLowerCase()) < 0)) {
        return false;
    }
    if (el.textContent.trim().length === 0) {
        return false;
    }
    return true;
}


export class I18nFe {

    get defaultLanguage() { return DEFAULT_LANGUAGE; }

    public getLangDesc(lang: string) {
        return this.languages.find(l => l.lang == lang);
    }

    get languages() {
        return [
            { flag: 'gb', full: 'English', lang: 'en' },
            { flag: 'fr', full: 'Francais', lang: 'fr' },
            { flag: 'de', full: 'German', lang: 'de' },
            { flag: 'it', full: 'Italian', lang: 'it' },
            { flag: 'es', full: 'Spanish', lang: 'es' },
            { flag: 'pt', full: 'Portuguese', lang: 'pt' },
            { flag: 'gr', full: 'Greek', lang: 'el' },
            { flag: 'ro', full: 'Romanian', lang: 'ro' },
            { flag: 'pl', full: 'Polish', lang: 'pl' },
            { flag: 'bg', full: 'Bulgarian', lang: 'bg' },
            { flag: 'nl', full: 'Dutch', lang: 'nl' },
            { flag: 'sv', full: 'Swedish', lang: 'sv' },
        ]
    };

    updateNode(el: HTMLElement, sourceLang, targetLang, sourceValue, targetValue) {
        //FIXME:updateNode
        //get translation key (text in the default language)
        //translate current text to default language and update key
        //translate key to other languages
        //strategies for cleanup un-used keys
        console.log(`Updating i18n [${sourceLang}]"${sourceValue}"->[${targetLang}]"${targetValue}"`);
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

    translateAll(rootElement, prevLang, targetLang) {
        if (!rootElement) return;

        const toTranslateElems = [...rootElement.querySelectorAll(translatableSelector)]
            .filter(el => isElementWithTextContent(el));
        const toTranslateMap = toTranslateElems.reduce((acc, el) => {
            let translationKey = getTranslationKey(el);

            if (acc[translationKey]) {
                acc[translationKey].push(el);
            } else {
                acc[translationKey] = [el];
            }

            return acc;
        }, {});
        const request = {
            to: targetLang,
            texts: Object.keys(toTranslateMap)
        };


        if (DEFAULT_LANGUAGE === targetLang) {
            for (let els of Object.values(toTranslateMap)) {
                for (let el of (els as HTMLElement[])) {
                    let defaultText = el.getAttribute('data-i18n-key');
                    if (defaultText) this.setTextValue(el, defaultText);
                }
            }
            return;
        }

        console.log("Parsed HTML, sending translations", request);
        fetch('/formuladb-api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        }).then(re => {
            console.log("translation done, updating html");
            re.json().then(returnedTranslations => {
                Object.keys(toTranslateMap).forEach((k, ix) => {
                    toTranslateMap[k].forEach(el => {
                        if (targetLang != DEFAULT_LANGUAGE && !el.hasAttribute('data-i18n-key')) {
                            el.setAttribute('data-i18n-key', getTextValue(el));
                        }
                        this.setTextValue(el, returnedTranslations[k]);
                    });
                });
            });
        });
    }
}

export const I18N_FE = new I18nFe();
(window as any).i18n = I18N_FE;
