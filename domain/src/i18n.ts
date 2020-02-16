export const LANGUAGES = {
    en: { flag: 'gb', full: 'English', lang: 'en' },
    fr: { flag: 'fr', full: 'Francais', lang: 'fr' },
    de: { flag: 'de', full: 'German', lang: 'de' },
    it: { flag: 'it', full: 'Italian', lang: 'it' },
    es: { flag: 'es', full: 'Spanish', lang: 'es' },
    pt: { flag: 'pt', full: 'Portuguese', lang: 'pt' },
    el: { flag: 'gr', full: 'Greek', lang: 'el' },
    ro: { flag: 'ro', full: 'Romanian', lang: 'ro' },
    pl: { flag: 'pl', full: 'Polish', lang: 'pl' },
    bg: { flag: 'bg', full: 'Bulgarian', lang: 'bg' },
    nl: { flag: 'nl', full: 'Dutch', lang: 'nl' },
    sv: { flag: 'sv', full: 'Swedish', lang: 'sv' },
};

export type I18nLang = keyof typeof LANGUAGES;
export const DEFAULT_LANGUAGE: I18nLang = 'en';
