import { on } from "delegated-events";
import { render } from "./live-dom-template";
import { FrmdbUserEvent } from "@web/frmdb-user-events";

interface FrmdbElementConfig {
    tag:string;
    template: string;
    style?: string;
    noShadow?: boolean;
}


export function FrmdbElementTODO(config: FrmdbElementConfig) {
    return function(cls: any) {
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

export type EventType = "click" | "blur" | FrmdbUserEvent['type'];

/** 
 * Convert complex attribute values to a syntax borrowed from the HTML "style" attribute 
 *    e.g {a: {x:1, y: "gigi"}, b: {x: 3, y: "gogu"}} 
 *    converted to attr="a: 1 gigi; b: 3 gogu"
 */
export function val2attr<T>(val: {[name: string]: T}, ...keyList: (keyof T)[]): string {
    return Object.entries(val).map(([name, tObj]) => {
        return `${name}: ${keyList.map(k => tObj[k]).filter(x => x != null).join(" ")}`
    }).join("; ");
}

/** 
 * Convert HTML "style" attribute syntax to complex attribute value
 * 
 * keys "name" and "_id" are special, e.g. "a; b" converts to {a: {name: "a"}, b: {name: "b"}} if keyList contains "name"
 */
export function attr2val<T>(attr: string, example: T, ...keyList: (keyof T)[]): {[name: string]: T} {
    let ret: any = {};
    attr.split(/\s*;\s*/).map(x => {
        let [name, valuesStr] = x.split(/\s*:\s*/);
        let obj: any = {};
        let values = valuesStr ? valuesStr.split(/\s+/) : [];
        for (const [i, k] of keyList.entries()) {
            if (typeof example[k] === "number") {
                obj[k] = parseInt(values[i]);
            } else if (typeof example[k] === "boolean") {
                obj[k] = ("true" == values[i]);
            } else {
                if (null == values[i] && ("name" === k || "_id" === k)) {
                    obj[k] = name;
                } else obj[k] = values[i];
            }
        }
        ret[name] = obj;
    })
    return ret;
}

export abstract class FrmdbElementMixin extends HTMLElement {

    public render(data: any) {
        render(data, this);
    }

    public emit(event: FrmdbUserEvent) {
    }

    public on(eventType: EventType | EventType[], selector: string | string[], fn: (e) => void) {
        let events = eventType instanceof Array ? eventType : [eventType];
        let selectors = selector instanceof Array ? selector : [selector];
        for (let ev of events) {
            for (let sel of selectors) {
                on(ev, [this.tagName, ...this.className.split(/\s+/)].join('.') + ' ' + sel, fn);
            }
        }
    }
}
