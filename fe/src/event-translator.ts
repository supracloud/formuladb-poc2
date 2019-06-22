import { on, emit } from "./delegated-events";

export function translateClicksToNavigationEvents(el: HTMLElement | Document | ShadowRoot) {
    on(el, 'click', '[data-frmdb-link]', function (event) {
        event.preventDefault();
        let targetEl = event.target;
        //@ts-ignore
        if (el instanceof ShadowRoot) {
            //@ts-ignore
            targetEl = el.host;
        }
        emit(targetEl, {type: "frmdbUserNavigation", path: event.target.pathname});
        console.log("frmdbUserNavigation emit from ", targetEl);
    });    
}
