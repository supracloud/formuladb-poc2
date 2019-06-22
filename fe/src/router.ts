import { onDoc } from "./delegated-events";
import { translateClicksToNavigationEvents } from "./event-translator";
import { FrmdbLogger } from "@domain/frmdb-logger";
const LOG = new FrmdbLogger('frmdb:router');

export interface FrmdbRoute {
    route: string;
    regex: RegExp;
    params: string[];
}

export interface FrmdbActiveRoute {
    params: {[x: string]: string},
}

let LINK_CACHE = new Set<string>();
let ROUTES: FrmdbRoute[] = [];

translateClicksToNavigationEvents(document);

onDoc('frmdbUserNavigation', '*', function (event) {
    console.log("frmdbUserNavigation on", event);
    let path = event.detail.path;
    window.history.pushState(
        {},
        path,
        window.location.origin + path
    );
    LINK_CACHE.add(path);
    render(path);
});

/** get the list of routes */
$( document ).ready(function() {
    document.querySelectorAll('template[data-frmdb-template]').forEach((tmpl) => {
        let route = tmpl.getAttribute("data-frmdb-template");
        if (!route) throw new Error("Found template with empty route");
        let regexStr: string[] = [];
        let params: string[] = [];
        for (let segment of route.split(/(\(:\w+\))/)) {
            let match = segment.match(/\(:(\w+)\)/);
            if (match != null) {
                regexStr.push('(.*?)');
                params.push(match[1]);
            } else {
                regexStr.push(segment);
            }
        }
        regexStr.push('$');
        ROUTES.push({
            route: route,
            regex: new RegExp(regexStr.join('')),
            params,
        });
    });
    console.log(ROUTES);
    let path = window.location.pathname;
    if (path && path != '/') {
        render(path);
    }
});


function render(pathName: string, routerOutletName: string = "main") {
    let path = pathName.replace(/^\//, '');
    let matchedRoute: FrmdbRoute | null = null;
    let matchedParams: RegExpExecArray | null = null;
    for (let route of ROUTES) {
        matchedParams = route.regex.exec(path);
        LOG.debug("%o %o %o", path, route, matchedParams);
        if (null != matchedParams) {
            matchedRoute = route;
            break;
        }
    }
    if (null == matchedRoute || null == matchedParams) throw new Error("path " + path + " does not match any route");

    let params = {};
    for (let [i, paramValue] of matchedParams.entries()) {
        params[matchedRoute.params[i]] = paramValue;
    }

    let routerOutlet = document.querySelector(`[data-frmdb-router-outlet="${routerOutletName}"]`);
    if (!routerOutlet) throw new Error("render called and router outlet does not exists " + routerOutletName);

    let template: HTMLTemplateElement | null = document.querySelector(`template[data-frmdb-template="${matchedRoute.route}"]`);
    if (!template) throw new Error("render called and template does not exist " + path);

    window['FrmdbActivatedRoute'] = {params};
    while (routerOutlet.firstChild) {
        routerOutlet.removeChild(routerOutlet.firstChild);
    }
    routerOutlet.appendChild(template.content.cloneNode(true))
}

window.onpopstate = () => {
    let path = window.location.pathname;
    if (LINK_CACHE.has(path)) {
        render(path);
    }
}
