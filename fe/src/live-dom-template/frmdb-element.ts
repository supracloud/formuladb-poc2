import { on } from "delegated-events";
import { render } from "./live-dom-template";
import { FrmdbUserEvent } from "@fe/frmdb-user-events";

import * as _ from "lodash";

interface FrmdbElementConfig {
    tag:string;
    template: string;
    style?: string;
    noShadow?: boolean;
}


export function FrmdbElementDecoratorTODO(config: FrmdbElementConfig) {
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

export function Attr() {
    return function(target: Object, key: string | symbol) {
    }
}  


/** 
 * Convert complex attribute values to a syntax borrowed from the HTML "style" attribute 
 *    {a: {x:1, y: "gigi"}, b: {x: 3, y: "gogu"}, c: true} CONVERTED TO "a: 1 gigi; b: 3 gogu; c: true"
 *    [{x:1, y: "gigi"}, {x: 3, y: "gogu"}] CONVERTED TO "1 gigi; 3 gogu"
 *    ["a", "b"] CONVERTED TO "a; b"
 *    1 CONVERTED TO "1"
 *    true CONVERTED TO "true"
 *    "str" CONVERTED TO "str"
 */
export function reflectProp2Attr<T>(prop: T, example: T): string {
    if (example instanceof Array) {
        return example.map((v, i) => reflectPropValue(prop[i], v)).join("; ");    
    } else if (typeof example === "object" ) {
        return Object.keys(example).filter(name => prop[name] != null).map(name => {
            return `${name}: ${reflectPropValue(prop[name], example[name])}`
        }).join("; ");    
    } else return reflectPropValue(prop, example);
}

function reflectPropValue(propValue, example): string {
    if (typeof propValue === "object") {
        return _.chain(example)
            .entries()
            .map(([k, v]) => propValue[k] != null ? "" + propValue[k] : '')
            .dropRightWhile(v => !v)
            .join(" ");
    } else if (["string", "number", "boolean"].includes(typeof propValue)) {
        return "" + propValue;
    } else throw new Error("Unsupported property type " + (typeof propValue) + ", " + JSON.stringify(propValue) + ", " + JSON.stringify(example));
}

function parseAttrVal<T extends (number | string | boolean)>(attrVal: string, example: T): T {
    if (typeof example === "number") {
        return parseInt(attrVal) as T;
    } else if (typeof example === "boolean") {
        return ("true" == attrVal) as T;
    } else if (typeof example === "string") {
        return attrVal as T;
    } else return '' as T;
}

function reflectAttrVal(attrVal: string, example) {
    if (typeof example === "object") {
        let values = attrVal.split(/ /);
        let ret = {};
        for (let [i, k] of Object.keys(example).entries()) {
            if (null == values[i]) break;
            ret[k] = parseAttrVal(values[i], example[k]);
        }
        return ret;
    } else if (["string", "number", "boolean"].includes(typeof attrVal)) {
        return parseAttrVal(attrVal, example);
    } else {
        throw new Error("Unsupported property type " + (typeof attrVal) + ", " + JSON.stringify(attrVal) + ", " + JSON.stringify(example));
    }
}

/** 
 * Convert HTML "style" attribute syntax to complex attribute value
 */
export function reflectAttr2Prop<T>(attr: string, example: T): T {
    let attrValuesStr = attr.split(/; /);
    if (example instanceof Array) {
        return attrValuesStr.map((v, i) => reflectAttrVal(v, example[0])) as any as T;    
    } else if (typeof example === "object" ) {
        let ret: any = {};
        for (let val of attrValuesStr) {
            let [name, valuesStr] = val.split(/: /);
            ret[name] = reflectAttrVal(valuesStr, example[name]);
        }
        return ret;
    } else return reflectAttrVal(attr, example);
}

export abstract class FrmdbElementMixin extends HTMLElement {

    public render(data: any) {
        render(data, this);
    }

    public emit(event: FrmdbUserEvent) {
        //TODO!
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
