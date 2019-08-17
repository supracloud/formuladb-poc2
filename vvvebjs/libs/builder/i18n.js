const translatableSelector = 'p,div,span,h1,h2,h3,h4,h5,h6,li,button,a';
const i18n = {

    init(rootElement) {
        const translatable = rootElement.querySelectorAll(translatableSelector);
        [...translatable].forEach(el => {
            if (el.childNodes && [...el.childNodes].filter(n => n.nodeType === 3 && !/^\S*$/.test(n.nodeValue)).length === 1) {
                el.setAttribute('data-i18n', localStorage.getItem('editor-lang') || i18n.getDefaultLanguage().tag);
            }
        });
    },

    get languages() {
        return [
            { tag: 'en-UK', full: 'English', short: 'EN', flag:'/formuladb-editor/img/GB.png' },
            { tag: 'fr-FR', full: 'Francais', short: 'FR', flag:'/formuladb-editor/img/FR.png'  }
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
        if(!rootElement) return;
        const toTranslate = [...rootElement.querySelectorAll('[data-i18n]')];
        const request = {
            from: sourceLang,
            to: targetLang,
            texts: toTranslate.map(el => el.textContent)
        };
        fetch('/formuladb-api/translate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(request)
        }).then(re => {
            re.json().then(t=>{
                toTranslate.forEach((el, ix) => {
                    el.textContent = t[ix];
                    el.setAttribute('data-i18n', targetLang);
                });
            });            
        });
    }
}