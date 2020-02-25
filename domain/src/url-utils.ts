export interface PageOpts {
    lang: string;
    look: string;
    primaryColor: string;
    secondaryColor: string;
    theme: string;
    editorOpts: '$EDIT$' | '$normal$' | '$view$';
    tenantName: string;
    appName: string;
    pageName: string;
}

export function parsePageUrl(path: string): PageOpts {
    let m = path.match(/^\/([a-z]{2})-(.+?)-([0-9a-f]+?)-([0-9a-f]+?)-(.+?)-(\$EDIT\$|\$normal\$|\$view\$)\/(.+?)\/(.+?)\/(.+?\.html)/);
    if (m && m.length == 10) {
        return {
            lang: m[1],
            look: m[2],
            primaryColor: m[3],
            secondaryColor: m[4],
            theme: m[5],
            editorOpts: m[6] as PageOpts['editorOpts'],
            tenantName: m[7],
            appName: m[8],
            pageName: m[9],
        }
    } else throw new Error(`Page Pathname ${path} not formatted as expected /:lang-:look-:primary-:secondary-:theme-:eopts/:tenant/:app/:page.html`)
}

export function switchEditorOffInPath(path: string) {
    return path.replace(/\$EDIT\$/, '$normal$');
}
export function makeViewOnlyUrlNoScripts(path: string) {
    return path.replace(/(-\$EDIT\$\/)|(-\$normal\$\/)/, '-$view$/');
}
export function isEditorMode(path: string) {
    return path.indexOf('-$EDIT$') > 0;
}
export function isViewMode(path: string) {
    return path.indexOf('-$view$') > 0;
}

export function makeUrlPath(pageOpts: PageOpts) {
    let {lang, look, primaryColor, secondaryColor, theme, editorOpts, tenantName, appName, pageName} = pageOpts;
    return `/${lang}-${look}-${primaryColor}-${secondaryColor}-${theme}-${editorOpts}/${tenantName}/${appName}/${pageName}`;
}