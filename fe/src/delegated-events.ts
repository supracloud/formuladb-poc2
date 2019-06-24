import { FrmdbUserEvent } from "./frmdb-user-events";
import { FrmdbLogger } from "@domain/frmdb-logger";

const LOG = new FrmdbLogger('delegated-events');

export type EventType = "click" | "blur" | FrmdbUserEvent['type'];

export function on(el: HTMLElement | Document | ShadowRoot, eventType: EventType | EventType[], selector: string | string[], fn: (e) => void) {
    let events = eventType instanceof Array ? eventType : [eventType];
    let selectors = selector instanceof Array ? selector : [selector];
    for (let ev of events) {
        //@ts-ignore
        el.addEventListener(ev, (event: any) => {
            LOG.debug("on", "%o, %o,", ev, event);
            if (!event || !event.target) {console.warn("received incorrect event:", event); return};
            for (let sel of selectors) {
                if (event.target.matches(sel)) {
                    fn(event);
                    break;
                }
            }
        });
    }
}

export function onDoc(eventType: EventType | EventType[], selector: string | string[], fn: (e) => void) {
    return on(document, eventType, selector, fn);
}

export function emit(target: HTMLElement | Document, event: FrmdbUserEvent, bubbles: boolean = true) {
    target.dispatchEvent(new CustomEvent(event.type, {detail: event, bubbles}));
}
