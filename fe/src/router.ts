import { on } from "delegated-events";

let linkCache = new Set<string>();

on('click', '[data-frmdb-link]', function (event) {
    event.preventDefault();
    let path = event.target.pathname;
    window.history.pushState(
        {},
        path,
        window.location.origin + path
    );
    linkCache.add(path);
    render(path);
});

function render(pathName: string) {
    let path = pathName.replace(/^\//, '');
    let anchor = document.querySelector(`a[href="${path}"][data-frmdb-link]`);
    if (!anchor) throw new Error("render called and link does not exists " + path);

    let routerOutletName = anchor.getAttribute("data-frmdb-link");
    let routerOutlet = document.querySelector(`[data-frmdb-router-outlet="${routerOutletName}"]`);
    if (!routerOutlet) throw new Error("render called and router outlet does not exists " + routerOutletName);

    let template: HTMLTemplateElement | null = document.querySelector(`template[data-frmdb-template="${path}"]`);
    if (!template) throw new Error("render called and template does not exist " + path);

    routerOutlet.appendChild(template.content.cloneNode(true))
}

window.onpopstate = () => {
    let path = window.location.pathname;
    if (linkCache.has(path)) {
        render(path);
    }
}
window.onload = function () {
    let path = window.location.pathname;
    if (path && path != '/') {
        render(path);
    }
};
