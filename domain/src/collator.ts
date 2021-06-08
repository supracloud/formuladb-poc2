// export const SEP:string = '\u0000';
export const SEP :string = '\x01';
export const MINCHAR: string = '\x01';//postgres does not support \u0000
export const MAXCHAR: string = '\x7f';

export function toIndexableStringInHouse(key: Array<any>) {
    let result: string = "";
    key.forEach(element => {
        if (result.length > 0) {
            result += SEP;
        }
        switch (typeof element) {
            case 'number': {
                result += /*'N' + */String(element).padStart(17, '0');//Number.MAX_SAFE_INTEGER=9007199254740991
                break;
            }
            case 'boolean': {
                result += /*'B' + */String(element).padStart(5);
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

export function parseIndexableStringInHouse(str: String) {
    let keySegments = str.split(SEP);
    return keySegments;
    // let ret: any[] = [];
    // for (let k of keySegments) {
    //     if (k.match(/^N[0-9]{19}$/)) {
    //         ret.push(Number.par)
    //     }
    // }
};

