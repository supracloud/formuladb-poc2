import { on } from "delegated-events";
import { render } from "./live-dom-template";

export abstract class LiveDomHtmlElement extends HTMLElement {

    public render(data: any) {
        render(data, this);
    }

    /** Web Component standard method */
    abstract connectedCallback();

    protected on(eventType: string | string[], selector: string | string[], fn: (e) => void) {
        let events = eventType instanceof Array ? eventType : [eventType];
        let selectors = selector instanceof Array ? selector : [selector];
        for (let ev of events) {
            for (let sel of selectors) {
                on(ev, sel, fn);
            }
        }
    }
}
