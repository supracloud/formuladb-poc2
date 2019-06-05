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

    public setDictionary(dictionary: { [literal: string]: string }) {
        this.dictionary = dictionary;
    }
}

export const I18N = new I18nService({});
export function setDictionary(dictionary: { [literal: string]: string }) {
    I18N.setDictionary(dictionary);
}
