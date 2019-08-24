const translatableSelector = 'p,div,span,h1,h2,h3,h4,h5,h6,li,button,a,label,[placeholder]';
const allowedInnerTags = 'b,strong,i,br,hr,em,q';
const DEFAULT_LANGUAGE = 'en';

class I18nFe {
    
    get defaultLanguage() { return DEFAULT_LANGUAGE; }

    public getLangDesc(lang: string) {
        return this.languages.find(l => l.lang == lang);
    }

    get languages() {
        return [
            { flag: 'gb', full: 'English', lang: 'en' },
            { flag: 'fr', full: 'Francais', lang: 'fr' },
            { flag: 'de', full: 'German', lang: 'de'},
            { flag: 'it', full: 'Italian', lang: 'it'},
            { flag: 'es', full: 'Spanish', lang: 'es'},
            { flag: 'pt', full: 'Portuguese', lang: 'pt'},
            { flag: 'gr', full: 'Greek', lang: 'el'},
            { flag: 'ro', full: 'Romanian', lang: 'ro'},
            { flag: 'pl', full: 'Polish', lang: 'pl'},
            { flag: 'bg', full: 'Bulgarian', lang: 'bg'},
            { flag: 'nl', full: 'Dutch', lang: 'nl'},
            { flag: 'sv', full: 'Swedish', lang: 'sv'},
        ]
    };

    updateNode(sourceLang, targetLang, sourceValue, targetValue) {
        console.log(`Updating i18n [${sourceLang}]"${sourceValue}"->[${targetLang}]"${targetValue}"`);
    };

    translate(sourceLang, sourceValue, targetLang) {
        return sourceValue;
    };

    getTextValue(el: HTMLElement) {
        if (el.hasAttribute('placeholder')) {
            return el.getAttribute('placeholder');
        } else {
            return el.innerHTML;
        }
    }
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
            .filter(el => {
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
            });
        const toTranslateMap = toTranslateElems.reduce((acc, c) => {
            let translationKey = c.hasAttribute('data-i18n-key') ? c.getAttribute('data-i18n-key') : (
                c.hasAttribute('placeholder') ? c.getAttribute('placeholder') : c.innerHTML);

            if (acc[translationKey]) {
                acc[translationKey].push(c);
            } else {
                acc[translationKey] = [c];
            }
            
            return acc;
        }, {});
        const request = {
            to: targetLang,
            texts: Object.keys(toTranslateMap)
        };

        console.log("Parsed HTML, sending translations");
        fetch('/formuladb-api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        }).then(re => {
            console.log("translation done, updating html");
            re.json().then(t => {
                Object.keys(toTranslateMap).forEach((k, ix) => {
                    toTranslateMap[k].forEach(el => {
                        if (targetLang != DEFAULT_LANGUAGE && !el.hasAttribute('data-i18n-key')) {
                            el.setAttribute('data-i18n-key', this.getTextValue(el));
                        }
                        this.setTextValue(el, t[ix]);
                    });
                });
            });
        });
    }
}

export const I18N_FE = new I18nFe();
(window as any).i18n = I18N_FE;
