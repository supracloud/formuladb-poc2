import * as Collate from 'pouchdb-collate';

// export const SEP:string = '\u0000';
export const SEP :string = '\x01';
export const MINCHAR: string = '\x01';//postgres does not support \u0000
export const MAXCHAR: string = '\x7f';

function toIndexableStringInHouse(key: Array<any>) {
    let result: string = "";
    key.forEach(element => {
        if (result.length > 0) {
            result += SEP;
        }
        switch (typeof element) {
            case 'number': {
                result += String(element).padStart(10)
                break;
            }
            case 'boolean': {
                result += String(element).padStart(5)
                break;
            }
            case 'string': {
                result += String(element);
                break;
            }
        }
    });
    return result;
};

function parseIndexableStringInHouse(str: String) {
    return str.split(SEP);
};

const usePouchdbCollate = false;

export function toIndexableString(key: Array<any>) {
    if (usePouchdbCollate) {
        return Collate.toIndexableString(key);
    } else {
        return toIndexableStringInHouse(key);
    }
}
export function parseIndexableString(str: String) {
    if (usePouchdbCollate) {
        return Collate.parseIndexableString(str);
    } else {
        return parseIndexableStringInHouse(str);
    }
}
