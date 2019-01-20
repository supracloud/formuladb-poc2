var SEP = '_'; // set to '_' for easier debugging 

function toIndexableString(key: Array<any>) {
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

function parseIndexableString(str: String) {
    return JSON.parse("[" + str.replace(SEP, ',') + "]");
};

export {
    toIndexableString,
    parseIndexableString,
    SEP
}