import { FrmdbLogger } from "@domain/frmdb-logger";
import { FragmentComponent } from "./fragment/fragment.component";
const LOG = new FrmdbLogger('router');

export interface FrmdbRoute {
    route: string;
    regex: RegExp;
    params: string[];
    fragment: FragmentComponent;
}

export interface FrmdbActiveRoute {
    params: {[x: string]: string},
}

let ROUTES: FrmdbRoute[] = [];

export function initRoutes() {
    document.querySelectorAll('frmdb-fragment[path]').forEach((fragment: FragmentComponent) => {
        let route = fragment.getAttribute("path");
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
            fragment,
        });
    });
    console.log(ROUTES);
    let path = window.location.hash;
    if (path && path != '/') {
        render(path);
    }
}

function render(pathName: string, allowMissingRoute: boolean = true) {
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
    if (null == matchedRoute || null == matchedParams) {
        if (allowMissingRoute) return;
        else throw new Error("path " + path + " does not match any route");
    }

    let params = {};
    for (let [i, paramValue] of matchedParams.entries()) {
        params[matchedRoute.params[i]] = paramValue;
    }

    let fragment: FragmentComponent | null = document.querySelector(`frmdb-fragment[path="${matchedRoute.route}"]`);
    if (!fragment) throw new Error("render called and template does not exist: " + path);

    for (let r of ROUTES) {
        r.fragment.style.display = "none";
    }
    fragment.style.display = "block";
    fragment.setParams(params);
}

window.onpopstate = () => {
    let path = window.location.hash;
    render(path, true);
}
