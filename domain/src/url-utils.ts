export interface PageOpts {
    lang: string;
    look: string;
    primaryColor: string;
    secondaryColor: string;
    theme: string;
    tenantName: string;
    appName: string;
    pageName: string;
    query?: {
        frmdbRender?: "editor" | "view",
    }
}

export function parsePageUrl(path: string): PageOpts {
    let m = path.match(/^\/([a-z]{2})-(.+?)-([0-9a-f]+?)-([0-9a-f]+?)-(.+?)\/(.+?)\/(.+?)\/(.+?)\.html/);
    if (m && m.length == 9) {
        return {
            lang: m[1],
            look: m[2],
            primaryColor: m[3],
            secondaryColor: m[4],
            theme: m[5],
            tenantName: m[6],
            appName: m[7],
            pageName: m[8],
        }
    } else throw new Error(`Page Pathname ${path} not formatted as expected /:lang-:look-:primary-:secondary-:theme/:tenant/:app/:page.html`)
}

export function makeUrlPath(pageOpts: PageOpts) {
    let {lang, look, primaryColor, secondaryColor, theme, tenantName, appName, pageName} = pageOpts;
    return `/${lang}-${look}-${primaryColor}-${secondaryColor}-${theme}/${tenantName}/${appName}/${pageName}`;
}


//URLSearchParams works in nodejs too
export function isEditorMode(search: string) {
    let query = new URLSearchParams(search);
    return query.get('frmdbRender') === "editor";
}