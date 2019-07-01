import * as yaml from 'js-yaml';
import * as _ from "lodash";

import { on, emit } from "../delegated-events";
import { updateDOM } from "./live-dom-template";
import { FrmdbLogger } from "@domain/frmdb-logger";
const LOGGER = new FrmdbLogger('frmdb-element');

import { objKeysTyped } from "@domain/ts-utils";

interface FrmdbElementConfig<ATTR, STATE> {
    tag:string;
    observedAttributes: (keyof ATTR)[],
    initialState?: STATE,
    template: string;
    style?: string;
    noShadow?: boolean;
}


export function FrmdbElementDecorator<ATTR, STATE>(config: FrmdbElementConfig<ATTR, STATE>) {
    return function(cls: { new(): FrmdbElementBase<ATTR, STATE> }) {
        LOGGER.info("FrmdbElementDecorator", "Decorating component " + cls.name);
        validateSelector(config.tag);
        if (!config.template) {
            throw new Error('You need to pass a template for the element');
        }
        const template = document.createElement('template');
        if (config.style) {
            config.template = `<style>${config.style}</style> ${config.template}`;
        }
        template.innerHTML = config.template;

        const LOG = new FrmdbLogger(cls.name);

        const connectedCallback = cls.prototype.connectedCallback || function () {};
        const connectedCallbackNew = function(this: FrmdbElementBase<ATTR, STATE>) {
            for (let attrName of config.observedAttributes) {
                (this.attr[attrName] as any) = reflectAttr2Prop(this.getAttribute(attrName as string) || '') as any;
            }

            const clone = document.importNode(template.content, true);
            if (config.noShadow) {
                this.appendChild(clone);
            } else {
                this.attachShadow({mode: 'open'}).appendChild(clone);
            }
            connectedCallback.call(this);
            this.updateStateWhenAttributesChange().then(() => updateDOM({attr: this.attr || {}, state: this.state || {}}, config.noShadow ? this : this.shadowRoot as any as HTMLElement));
        };

        const attributeChangedCallback = cls.prototype.attributeChangedCallback || function () {};
        const attributeChangedCallbackNew = function(attrName, oldVal, newVal) {
            let typedVal: any = reflectAttr2Prop(newVal);
            LOG.debug("%o %o %o", attrName, oldVal, newVal, typedVal);
            this.attr[attrName] =  typedVal;
            attributeChangedCallback.call(this, attrName, oldVal, newVal);
            updateDOM({...this.attr, ...this.state}, this);
        }


        //Web Components APIs
        cls.prototype.connectedCallback = connectedCallbackNew;
        cls.prototype.attributeChangedCallback = attributeChangedCallbackNew;
        (cls as any).observedAttributes = config.observedAttributes;

        // custom formuladb properties
        cls.prototype.attr = {};
        cls.prototype.state = config.initialState || {};
        LOG.info("FrmdbElementDecorator", "%O", cls);

        //define custom element
        window.customElements.define(config.tag, cls);
    }
}

const validateSelector = (selector: string) => {
    if (selector.indexOf('-') <= 0) {
        throw new Error('You need at least 1 dash in the custom element name!');
    }
};

export function Attr() {
    return function(target: Object, key: string | symbol) {
    }
}  


/** 
 * Convert complex attribute values to a syntax inspired the HTML "style" attribute 
 *   but syntax is actually "flow" yaml syntax
 */
export function reflectProp2Attr<T>(prop: T): string {
    return yaml.safeDump(prop, {flowLevel: 0, lineWidth: 10000}).replace(/\n$/, '');
}

/** 
 * Convert HTML "complex" attribute syntax to complex attribute value
 */
export function reflectAttr2Prop<T>(attr: string): T {
    return yaml.safeLoad(attr);
}

export abstract class FrmdbElementBase<ATTR, STATE> extends HTMLElement {
    attr: Partial<ATTR>;
    state: Partial<STATE>;

    emit = emit.bind(null, this);

    async updateStateWhenAttributesChange(): Promise<void> {
        return Promise.resolve();
    }
}
