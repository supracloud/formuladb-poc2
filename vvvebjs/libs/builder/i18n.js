const translatableSelector = 'p,div,span,h1,h2,h3,h4,h5,h6,li,button,a,label,[placeholder]';
const allowedInnerTags = 'b,strong,i,br,hr,em,q';
const i18n = {

    // init(rootElement) {
    //     const translatable = rootElement.querySelectorAll(translatableSelector);
    //     [...translatable].forEach(el => {
    //         if (el.childNodes && [...el.childNodes].filter(n => n.nodeType === 3 && !/^\S*$/.test(n.nodeValue)).length === 1) {
    //             el.setAttribute('data-i18n', localStorage.getItem('editor-lang') || i18n.getDefaultLanguage().tag);
    //         }
    //     });
    // },

    get languages() {
        return [
            { tag: 'en-UK', full: 'English', short: 'gb', flag: '/formuladb-editor/img/GB.png' },
            { tag: 'fr-FR', full: 'Francais', short: 'fr', flag: '/formuladb-editor/img/FR.png' }
        ]
    },

    getDefaultLanguage() {
        return this.languages[0]
    },

    getLanguage(tag) {
        return this.languages.find(lang => lang.tag === tag) || this.getDefaultLanguage()
    },

    updateNode(sourceLang, targetLang, sourceValue, targetValue) {
        console.log(`Updating i18n [${sourceLang}]"${sourceValue}"->[${targetLang}]"${targetValue}"`);
    },

    translate(sourceLang, sourceValue, targetLang) {
        return sourceValue;
    },

    translateAll(rootElement, sourceLang, targetLang) {
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
            if (c.hasAttribute('placeholder')) {
                if (acc[c.getAttribute('placeholder')]) {
                    acc[c.getAttribute('placeholder')].push(c);
                } else {
                    acc[c.getAttribute('placeholder')] = [c];
                }
            } else {
                if (acc[c.innerHTML]) {
                    acc[c.innerHTML].push(c);
                } else {
                    acc[c.innerHTML] = [c];
                }
            }
            return acc;
        }, {});
        const request = {
            from: sourceLang,
            to: targetLang,
            texts: Object.keys(toTranslateMap)
        };
        fetch('/formuladb-api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        }).then(re => {
            re.json().then(t => {
                Object.keys(toTranslateMap).forEach((k, ix) => {
                    toTranslateMap[k].forEach(el => {
                        if (el.hasAttribute('placeholder')) {
                            el.setAttribute('placeholder', t[ix]);
                        } else {
                            el.innerHTML = t[ix];
                        }
                    });
                });
            });
        });
    }
}