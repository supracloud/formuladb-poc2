const i18n = {
    get languages() {
        return [
            { tag: 'en-UK', full: 'English', short: 'EN' },
            { tag: 'fr-FR', full: 'Francais', short: 'FR' }
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
    }
}