import * as yaml from 'js-yaml';
import * as _ from "lodash";

import { on, emit } from "../delegated-events";
import { updateDOM } from "./live-dom-template";
import { FrmdbLogger } from "@domain/frmdb-logger";
const LOGGER = new FrmdbLogger('frmdb-element');

import { objKeysTyped } from "@domain/ts-utils";
import { FrmdbUserEvent } from '@be/frmdb-user-events';

interface FrmdbElementConfig<ATTR, STATE extends ATTR> {
    tag:string;
    observedAttributes: (keyof ATTR)[],
    initialState?: STATE,
    template: string;
    style?: string;
    noShadow?: boolean;
}


export function FrmdbElementDecorator<ATTR, STATE extends ATTR>(config: FrmdbElementConfig<ATTR, STATE>) {
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
            const clone = document.importNode(template.content, true);
            if (config.noShadow) {
                this.appendChild(clone);
            } else {
                this.attachShadow({mode: 'open'}).appendChild(clone);
            }
            connectedCallback.call(this);
        };

        const attributeChangedCallback = cls.prototype.attributeChangedCallback || function () {};
        const attributeChangedCallbackNew = function(this: FrmdbElementBase<ATTR, STATE>, attrName: keyof ATTR, oldVal, newVal) {
            let oldParsedVal = reflectAttr2Prop(attrName, oldVal);
            let newParsedVal = reflectAttr2Prop(attrName, newVal);
            LOG.debug("%o %o %o", attrName as string, oldVal, newVal, newParsedVal);
            attributeChangedCallback.call(this, attrName, oldVal, newVal);
            let previousState = this.immutableState;
            this.actionsOnAttributeChange(attrName, oldParsedVal, newParsedVal);
            this.effectsOnAttributeChange(attrName, oldParsedVal, newParsedVal).then(() => {
                if (this.immutableState != previousState) {
                    // _.debounce(() => 
                        updateDOM(this.immutableState, config.noShadow ? this : this.shadowRoot as any as HTMLElement)
                    // );
                }
            });
        }


        //Web Components APIs
        cls.prototype.connectedCallback = connectedCallbackNew;
        cls.prototype.attributeChangedCallback = attributeChangedCallbackNew;
        (cls as any).observedAttributes = config.observedAttributes;

        // custom formuladb properties
        cls.prototype.immutableState = config.initialState || {};
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
export function reflectAttr2Prop<ATTR>(attrName: keyof ATTR, attr: string): ATTR[typeof attrName] {
    return yaml.safeLoad(attr);
}

export abstract class FrmdbElementBase<ATTR, STATE extends ATTR> extends HTMLElement {
    immutableState: Partial<STATE>;

    emit = emit.bind(null, this);

    actionsOnAttributeChange<T extends keyof ATTR>(attrName: T, oldVal: ATTR[T], newVal: ATTR[T]): void {

    }
    async effectsOnAttributeChange<T extends keyof ATTR>(attrName: T, oldVal: ATTR[T], newVal: ATTR[T]): Promise<void> {
        return Promise.resolve();
    }

    async effectsOnEvent(event: Event): Promise<void> {
        return Promise.resolve();
    }
    actionsOnEvent(event: Event): void {

    }
}
