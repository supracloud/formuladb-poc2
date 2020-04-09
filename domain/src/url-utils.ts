export interface MandatoryPageOpts {
    lang: string;
    appName: string;
    pageName: string;
}
export interface OptionalPageOpts {
    look?: string;
    primaryColor?: string;
    secondaryColor?: string;
    theme?: string;
}
export interface AllPageOpts extends MandatoryPageOpts, OptionalPageOpts {
    query?: {
        frmdbRender?: "editor" | "view" | "screenshot" | "pdf",
    }
}

export type FullPageOpts = MandatoryPageOpts & Required<OptionalPageOpts> & {
    query?: {
        frmdbRender?: "editor" | "view" | "screenshot" | "pdf",
    }
}

export type DefaultPageOptsForAppT = Required<OptionalPageOpts>;
export const DefaultPageOptsForApp = {
    look: 'basic',
    primaryColor: '008cba',
    secondaryColor: 'eeeeee',
    theme: 'Clean',
}

export function parseFullPageUrl(path: string): FullPageOpts {
    let fullOpts = _parseFullPageUrl(path);
    if (!fullOpts) throw new Error(`${path} not formatted like /:lang-:look-:primary-:secondary-:theme/:app/:page.html`);
    return fullOpts;
}

function _parseFullPageUrl(path: string): FullPageOpts | null {
    let m = path.match(/^\/([a-z]{2})-(.+?)-([0-9a-f]+?)-([0-9a-f]+?)-(.+?)\/(.+?)\/(.+?)\.html/);
    if (m && m.length == 8) {
        return {
            lang: m[1],
            look: m[2],
            primaryColor: m[3],
            secondaryColor: m[4],
            theme: m[5],
            appName: m[6],
            pageName: m[7],
        }
    } else return null;
}
export function parseAllPageUrl(path: string): AllPageOpts {
    let fullOpts = _parseFullPageUrl(path);
    if (fullOpts) return fullOpts;
    else return parseMandatoryPageUrl(path);
}

export function parseMandatoryPageUrl(path: string): MandatoryPageOpts {
    let m2 = path.match(/^\/([a-z]{2})\/(.+?)\/(.+?)\.html/);
    if (m2 && m2.length === 4) {
        return {
            lang: m2[1],
            appName: m2[2],
            pageName: m2[3],
        }                
    } else throw new Error(`Page Pathname ${path} not formatted as expected /:lang/:app/:page.html`)
}

export function makeUrlPath(pageOpts: AllPageOpts) {
    let {lang, look, primaryColor, secondaryColor, theme, appName, pageName} = pageOpts;
    if (look && primaryColor && secondaryColor && theme) {
        return `/${lang}-${look}-${primaryColor}-${secondaryColor}-${theme}/${appName}/${pageName}.html`;
    } else {
        return `/${lang}/${appName}/${pageName}.html`;
    }
}


//URLSearchParams works in nodejs too
export function isEditorMode(search: string) {
    let query = new URLSearchParams(search);
    return query.get('frmdbRender') === "editor";
}