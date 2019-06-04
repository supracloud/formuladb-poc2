import { on } from "delegated-events";
import { render } from "./live-dom-template";

interface FrmdbElementConfig {
    tag:string;
    template: string;
    style?: string;
    noShadow?: boolean;
}


export function FrmdbElement<ELEM extends HTMLElement>(config: FrmdbElementConfig) {
    return function(cls: ELEM) {
        validateSelector(config.tag);
        if (!config.template) {
            throw new Error('You need to pass a template for the element');
        }
        const template = document.createElement('template');
        if (config.style) {
            config.template = `<style>${config.style}</style> ${config.template}`;
        }
        template.innerHTML = config.template;

        const connectedCallback = cls.prototype.connectedCallback || function () {};
        cls.prototype.connectedCallback = function() {
            const clone = document.importNode(template.content, true);
            if (config.noShadow) {
                this.appendChild(clone);
            } else {
                this.attachShadow({mode: 'open'}).appendChild(clone);
            }
            connectedCallback.call(this);
        };

        window.customElements.define(config.tag, cls);
    }
}

const validateSelector = (selector: string) => {
    if (selector.indexOf('-') <= 0) {
        throw new Error('You need at least 1 dash in the custom element name!');
    }
};

function on(eventType: string | string[], selector: string | string[], fn: (e) => void) {
    let events = eventType instanceof Array ? eventType : [eventType];
    let selectors = selector instanceof Array ? selector : [selector];
    for (let ev of events) {
        for (let sel of selectors) {
            on(ev, sel, fn);
        }
    }
}

export abstract class FrmdbElementBase extends HTMLElement {

    public render(data: any) {
        render(data, this);
    }

    /** Web Component standard method */
    abstract connectedCallback();


}
