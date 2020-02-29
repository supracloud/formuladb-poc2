import { FrmdbUserEvent } from "./frmdb-user-events";
import { FrmdbLogger } from "@domain/frmdb-logger";

const LOG = new FrmdbLogger('delegated-events');

export type EventType = 
    | "click" 
    | "mouseover" 
    | "mousemove"
    | "mouseenter"
    | "blur" 
    | "keydown" 
    | "keyup" 
    | "change"
    | "input"
    | "submit"
    | "paste"
    | FrmdbUserEvent['type']
    | 'FrmdbFormulaEditorChangedColumnsHighlightEvent'
;

export function getTarget(event: Event): HTMLElement | null {
    return (event.composed ? event.composedPath()[0] : event.target) as HTMLElement;
}

export function onEvent(el: HTMLElement | Document | ShadowRoot, eventType: EventType | EventType[], selector: string | string[], fn: (e) => void) {
    _onEvent(false, false, el, eventType, selector, fn);
}
export function onEventDeepShadowDOM(el: HTMLElement | Document | ShadowRoot, eventType: EventType | EventType[], selector: string | string[], fn: (e) => void) {
    _onEvent(false, true, el, eventType, selector, fn);
}
export function onEventChildren(el: HTMLElement | Document | ShadowRoot, eventType: EventType | EventType[], selector: string | string[], fn: (e) => void) {
    _onEvent(true, false, el, eventType, selector, fn);
}
function _onEvent(children: boolean, deep: boolean, el: HTMLElement | Document | ShadowRoot, eventType: EventType | EventType[], selector: string | string[], fn: (e) => void) {
    if (!el) return;
    let events = eventType instanceof Array ? eventType : [eventType];
    let selectors = selector instanceof Array ? selector : [selector];
    for (let ev of events) {
        //@ts-ignore
        el.addEventListener(ev, (event: any) => {
            let target = deep ? getTarget(event) : event.target;
            if (!event || !target) {console.warn("received incorrect event:", event); return};
            for (let sel of selectors) {
                if (target.matches(sel) || (children && target.matches(sel + ' *'))) {
                    LOG.debug("on", "%o, %o,", ev, event);
                    fn(event);
                    break;
                }
            }
        });
    }
}

export function onDoc(eventType: EventType | EventType[], selector: string | string[], fn: (e) => void) {
    return onEvent(document, eventType, selector, fn);
}

export function emit(target: Element | Document, event: FrmdbUserEvent, bubbles: boolean = true) {
    LOG.debug("emit", "%o, %s,", event, new Error().stack);
    target.dispatchEvent(new CustomEvent(event.type, {detail: event, bubbles}));
}

export function listenForDOMChanges(targetNode: HTMLElement) {
    const config = { attributes: true, childList: true, subtree: true };

    // Callback function to execute when mutations are observed
    const callback = function(mutationsList, observer) {
        for(let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                console.log('A child node has been added or removed.');
            }
            else if (mutation.type === 'attributes') {
                console.log('The ' + mutation.attributeName + ' attribute was modified.');
            }
        }
    };
    
    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);
    
    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);        
}
