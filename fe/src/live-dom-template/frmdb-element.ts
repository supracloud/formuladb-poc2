import * as yaml from 'js-yaml';
import * as _ from "lodash";

import { emit } from "../delegated-events";
import { updateDOM } from "./live-dom-template";
import { FrmdbLogger } from "@domain/frmdb-logger";
import { FrmdbUserEvent } from '@fe/frmdb-user-events';
import { dataBindStateToElement } from '@fe/frmdb-element-utils';

interface FrmdbElementConfig<ATTR, STATE> {
    tag: string;
    observedAttributes: (keyof ATTR)[],
    initialState?: STATE,
    template: string;
    style?: string;
    noShadow?: boolean;
    extends?: 'ul' | 'button' | 'input';
}


export function FrmdbElementDecorator<ATTR, STATE>(config: FrmdbElementConfig<ATTR, STATE>) {
    return function (cls: { new(): FrmdbElementBase<ATTR, STATE> }) {
        const LOG = new FrmdbLogger(cls.name);
        cls.prototype.LOG = LOG;
        LOG.info("FrmdbElementDecorator", "Decorating component " + cls.name);
        validateSelector(config.tag);
        if (!config.template) {
            throw new Error('You need to pass a template for the element');
        }
        const template = document.createElement('template');
        if (config.style) {
            config.template = `<style>${config.style}</style> ${config.template}`;
        }
        template.innerHTML = config.template;

        const connectedCallback = cls.prototype.connectedCallback || function () { };
        const connectedCallbackNew = function (this: FrmdbElementBase<ATTR, STATE>) {
            if (this.closest('template[data-frmdb-if]')) { console.debug("Not rendering hidden element", this); return; }
            const clone = document.importNode(template.content, true);
            if (config.noShadow) {
                // this.appendChild(clone);//does not trigger connectedCallback in jsdom
                this.innerHTML = template.innerHTML;//works with jsdom
            } else {
                if (!this.shadowRoot) {
                    this.attachShadow({ mode: 'open' });
                }
                this.shadowRoot!.innerHTML = '';
                this.shadowRoot!.appendChild(clone);
            }
            connectedCallback.call(this);
        };

        //Web Components APIs
        cls.prototype.connectedCallback = connectedCallbackNew;
        (cls as any).observedAttributes = config.observedAttributes;

        // custom formuladb properties
        cls.prototype.frmdbConfig = config;
        cls.prototype.frmdbState = config.initialState || {};
        LOG.info("FrmdbElementDecorator", "%O", cls);

        //define custom element
        window.customElements.define(config.tag, cls, config.extends ? { extends: config.extends } : undefined);
    }
}

const validateSelector = (selector: string) => {
    if (selector.indexOf('-') <= 0) {
        throw new Error('You need at least 1 dash in the custom element name!');
    }
};

export function Attr() {
    return function (target: Object, key: string | symbol) {
    }
}


/** 
 * Convert complex attribute values to a syntax inspired the HTML "style" attribute 
 *   but syntax is actually "flow" yaml syntax
 */
export function reflectProp2Attr<T>(prop: T): string {
    return yaml.safeDump(prop, { flowLevel: 0, lineWidth: 10000 }).replace(/\n$/, '');
}

/** 
 * Convert HTML "complex" attribute syntax to complex attribute value
 */
export function reflectAttr2Prop<ATTR>(attrName: keyof ATTR, attr: string): ATTR[typeof attrName] {
    return yaml.safeLoad(attr);
}

/**
 * An element is
 */
export class FrmdbElementBase<ATTR, STATE> extends HTMLElement {
    protected LOG: FrmdbLogger;
    frmdbConfig: FrmdbElementConfig<ATTR, STATE>;

    frmdbState: Partial<STATE> = dataBindStateToElement<STATE>(this, {} as STATE);

    emit: (event: FrmdbUserEvent) => void = emit.bind(null, this);

    get elem() {
        return this.frmdbConfig.noShadow ? this : this.shadowRoot as any as HTMLElement;
    }

    protected attributeChangedCallback(attrName: keyof ATTR, oldVal, newVal) {
        let oldParsedVal = reflectAttr2Prop(attrName, oldVal);
        let newParsedVal = reflectAttr2Prop(attrName, newVal);
        this.LOG.debug("attributeChangedCallback", "%o %o %o %o %o", attrName as string, oldVal, newVal, oldParsedVal, newParsedVal);
        this.frmdbState[attrName as any] = newParsedVal;
    }

    frmdbPropertyChangedCallback<T extends keyof STATE>(propName: T, oldVal: STATE[T] | undefined, newVal: STATE[T]) {
    }

}

// (<any>Element.prototype).debugStr = function () {
//     return toDebugStr({}, this);
// }
function toDebugStr(parent: {}, el: Element | ShadowRoot) {
    let name = el instanceof ShadowRoot ? "#shadowRoot" : 
        '<' + el.tagName + Array.from(el.attributes).map(a => `${a.name}="${a.value}"`).join(" ") + '>';
    let children: any = {};
    let childNodes = el instanceof Element && el.shadowRoot ? [el.shadowRoot] : el.childNodes;

    for (let i = 0; i < childNodes.length; i++) {
        const child = childNodes[i];

        switch (child.nodeType) {
            case 1: // element
            case 11: // document fragment
                toDebugStr(children, child as Element);
                break;

            case 3: // text
                children['text'] += (child as any).nodeValue.trim();
                break;

            case 8: // comment
                break;
        }
    }

    parent[name] = children;
    return parent;
}
