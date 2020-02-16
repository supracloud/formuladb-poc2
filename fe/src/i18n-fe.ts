import { I18nLang } from "@domain/i18n";

export function feTranslateApi(targetLang: I18nLang, texts: string[]) {
    return fetch('/formuladb-api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({to: targetLang, texts})
    }).then(re => re.json());
}
