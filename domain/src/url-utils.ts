export interface PageOpts {
    lang: string;
    look: string;
    primaryColor: string;
    secondaryColor: string;
    theme: string;
    editorOpts: 'e' | 'n';
    tenantName: string;
    appName: string;
    pageName: string;
}

export function parsePageUrl(url: string): PageOpts {
    let m = url.match(/^\/([a-z]{2})-(.+?)-([0-9a-f]+?)-([0-9a-f]+?)-(.+?)-(e|n)\/(.+?)\/(.+?)\/(.+?.html)/);
    if (m && m.length == 10) {
        return {
            lang: m[1],
            look: m[2],
            primaryColor: m[3],
            secondaryColor: m[4],
            theme: m[5],
            editorOpts: m[6] as 'e'|'n',
            tenantName: m[7],
            appName: m[8],
            pageName: m[9],
        }
    } else throw new Error(`Page Url ${url} not formatted as expected /:lang-:look-:primary-:secondary-:theme-:eopts/:tenant/:app/:page.html`)
}