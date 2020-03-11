import { onEventChildren } from "@fe/delegated-events";
import { PageOpts, parsePageUrl } from "@domain/url-utils";

onEventChildren(document, 'click', '[data-frmdb-editor-link]', (event) => {
    event.preventDefault();

    let frmdbLink: HTMLLinkElement = event.target;
    if (!frmdbLink.hasAttribute('data-frmdb-editor-link')) {
        frmdbLink = event.target.closest('[data-frmdb-editor-link]');
    }
    let url = new URL(frmdbLink.href);
    if (validate(url)) {
        navigateTo(url.href)
    }
});

export function navigateTo(relativePathOrHref: string) {
    let oldPageOpts = parsePageUrl(window.location.pathname);
    let url = new URL(relativePathOrHref, window.location.href);
    window.history.pushState({urlHref: url.href}, `FormulaDB: ${url.pathname}`, url.href);
    apply(oldPageOpts, url);
}

export function navigateEditorToPage(pageName: string) {
    navigateTo(`../${pageName}.html`);
}

export function navigateEditorToAppAndPage(appName: string, pageName: string) {
    navigateTo(`../${appName}/${pageName}.html`);
}

const Validators: {[name: string]: (newPath: string, oldPageOpts: PageOpts, newPageOpts: PageOpts) => boolean} = {};
const Handlers: {[name: string]: (newPath: string, oldPageOpts: PageOpts, newPageOpts: PageOpts) => void} = {};
export function registerFrmdbEditorRouterHandler(name: string, 
    handler: (newPath: string, oldPageOpts: PageOpts, newPageOpts: PageOpts) => void,
    validator?: (newPath: string, oldPageOpts: PageOpts, newPageOpts: PageOpts) => boolean) {

        Handlers[name] = handler;
        if (validator) Validators[name] = validator;
}

function apply(oldPageOpts: PageOpts, url: URL) {
    let newPageOpts = parsePageUrl(url.pathname);
    for (let handler of Object.values(Handlers)) {
        handler(url.pathname, oldPageOpts, newPageOpts);
    }
}
function validate(url: URL): boolean {
    let oldPageOpts = parsePageUrl(window.location.pathname);
    let newPageOpts = parsePageUrl(url.pathname);
    for (let validator of Object.values(Validators)) {
        let ret = validator(url.pathname, oldPageOpts, newPageOpts);
        if (!ret) return false;
    }
    return true;
}

window.onpopstate = (event: PopStateEvent) => {
    navigateTo(event.state.urlHref)
};
