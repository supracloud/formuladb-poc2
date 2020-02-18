import { onEventChildren } from "@fe/delegated-events";
import { PageOpts, parsePageUrl } from "@domain/url-utils";

onEventChildren(document, 'click', '[data-frmdb-editor-link]', (event) => {
    event.preventDefault();

    let frmdbLink: HTMLLinkElement = event.target;
    if (!frmdbLink.hasAttribute('data-frmdb-editor-link')) {
        frmdbLink = event.target.closest('[data-frmdb-editor-link]');
    }
    let path = new URL(frmdbLink.href).pathname;
    apply(path);
    window.history.pushState({newPath: path}, `FormulaDB: ${path}`, path);
});

const Handlers: {[name: string]: (newPath: string, oldPageOpts: PageOpts, newPageOpts: PageOpts) => void} = {};
export function registerFrmdbEditorRouterHandler(name: string, handler: (newPath: string, oldPageOpts: PageOpts, newPageOpts: PageOpts) => void) {
    Handlers[name] = handler;
}

function apply(newPath: string) {
    for (let handler of Object.values(Handlers)) {
        handler(newPath, parsePageUrl(window.location.pathname), parsePageUrl(newPath));
    }
}

window.onpopstate = (event: PopStateEvent) => {
    let newPath = event.state.newPath;
    apply(newPath);
};
