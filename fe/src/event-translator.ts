import { on, emit } from "./delegated-events";
import { FrmdbLogger } from "@domain/frmdb-logger";
import { FrmdbUserEvent } from "./frmdb-user-events";
const LOG = new FrmdbLogger('event-translator');

export function translateClicksToNavigationEvents(el: HTMLElement | Document | ShadowRoot) {
    on(el, 'click', '[data-frmdb-link]', function (event) {
        event.preventDefault();
        let targetEl = event.target;
        //@ts-ignore
        if (el instanceof ShadowRoot) {
            //@ts-ignore
            targetEl = el.host;
        }
        let newEvent = {type: "frmdbUserNavigation", path: event.target.pathname};
        emit(targetEl, newEvent as FrmdbUserEvent);
        LOG.debug("translateClicksToNavigationEvents", "Event %o translated to %o, sent from %o", event, newEvent, targetEl);
    });
}
