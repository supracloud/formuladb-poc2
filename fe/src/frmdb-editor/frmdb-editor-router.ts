import { onEventChildren } from "@fe/delegated-events";
import { PageOpts, parsePageUrl } from "@domain/url-utils";

onEventChildren(document, 'click', '[data-frmdb-editor-link]', (event) => {
    event.preventDefault();

    let frmdbLink: HTMLLinkElement = event.target;
    if (!frmdbLink.hasAttribute('data-frmdb-editor-link')) {
        frmdbLink = event.target.closest('[data-frmdb-editor-link]');
    }
    let path = new URL(frmdbLink.href).pathname;
    if (validate(path)) {
        apply(path);
        window.history.pushState({newPath: path}, `FormulaDB: ${path}`, path);
    }
});

const Validators: {[name: string]: (newPath: string, oldPageOpts: PageOpts, newPageOpts: PageOpts) => boolean} = {};
const Handlers: {[name: string]: (newPath: string, oldPageOpts: PageOpts, newPageOpts: PageOpts) => void} = {};
export function registerFrmdbEditorRouterHandler(name: string, 
    handler: (newPath: string, oldPageOpts: PageOpts, newPageOpts: PageOpts) => void,
    validator?: (newPath: string, oldPageOpts: PageOpts, newPageOpts: PageOpts) => boolean) {

        Handlers[name] = handler;
        if (validator) Validators[name] = validator;
}

function apply(newPath: string) {
    let oldPageOpts = parsePageUrl(window.location.pathname);
    let newPageOpts = parsePageUrl(newPath);
    for (let handler of Object.values(Handlers)) {
        handler(newPath, oldPageOpts, newPageOpts);
    }
}
function validate(newPath: string): boolean {
    let oldPageOpts = parsePageUrl(window.location.pathname);
    let newPageOpts = parsePageUrl(newPath);
    for (let validator of Object.values(Validators)) {
        let ret = validator(newPath, oldPageOpts, newPageOpts);
        if (!ret) return false;
    }
    return true;
}

window.onpopstate = (event: PopStateEvent) => {
    let newPath = event.state.newPath;
    apply(newPath);
};
