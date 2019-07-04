import * as yaml from 'js-yaml';
import * as _ from "lodash";

import { on, emit } from "../delegated-events";
import { updateDOM } from "./live-dom-template";
import { FrmdbLogger } from "@domain/frmdb-logger";
const LOGGER = new FrmdbLogger('frmdb-element');

import { objKeysTyped } from "@domain/ts-utils";
import { FrmdbUserEvent } from '@be/frmdb-user-events';

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
            const clone = document.importNode(template.content, true);
            if (config.noShadow) {
                this.appendChild(clone);
            } else {
                this.attachShadow({mode: 'open'}).appendChild(clone);
            }
            connectedCallback.call(this);
        };

        // const attributeChangedCallback = cls.prototype.attributeChangedCallback || function () {};
        const attributeChangedCallbackNew = function(this: FrmdbElementBase<ATTR, STATE>, attrName: keyof ATTR, oldVal, newVal) {
            let oldParsedVal = reflectAttr2Prop(attrName, oldVal);
            let newParsedVal = reflectAttr2Prop(attrName, newVal);
            LOG.debug("attributeChangedCallbackNew", "%o %o %o %o %o", attrName as string, oldVal, newVal, oldParsedVal, newParsedVal);
            // attributeChangedCallback.call(this, attrName, oldVal, newVal);
            this.updateDomWhenStateChanges(this.frmdbAttributeChangedCallback(attrName, oldParsedVal, newParsedVal));
        }
        
        const frmdbPropertyChangedCallback = cls.prototype.frmdbPropertyChangedCallback;
        if (frmdbPropertyChangedCallback) {
            const frmdbPropertyChangedCallbackNew = function(this: FrmdbElementBase<ATTR, STATE>, propName: keyof STATE, oldPropVal: STATE[typeof  propName], newPropVal: STATE[typeof  propName]) {
                LOG.debug("frmdbPropertyChangedCallback", "%o %o %o", propName as string, oldPropVal, newPropVal);
                let previousState = this.frmdbState;
                this.updateDomWhenStateChanges(frmdbPropertyChangedCallback.call(this, propName, oldPropVal, newPropVal));
            }
            cls.prototype.frmdbPropertyChangedCallback = frmdbPropertyChangedCallbackNew;
        }


        //Web Components APIs
        cls.prototype.connectedCallback = connectedCallbackNew;
        cls.prototype.attributeChangedCallback = attributeChangedCallbackNew;
        (cls as any).observedAttributes = config.observedAttributes;

        // custom formuladb properties
        cls.prototype.frmdbConfig = config; 
        cls.prototype.frmdbState = config.initialState || {};
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

/**
 * An element is
 */
export abstract class FrmdbElementBase<ATTR, STATE> extends HTMLElement {
    frmdbState: Partial<STATE>;
    frmdbConfig: FrmdbElementConfig<ATTR, STATE>;

    emit = emit.bind(null, this);

    frmdbAttributeChangedCallback<T extends keyof ATTR>(attrName: T, oldVal: ATTR[T], newVal: ATTR[T]): Partial<STATE> | Promise<Partial<STATE>> {
        return this.frmdbState;
    }
    frmdbPropertyChangedCallback<T extends keyof STATE>(attrName: T, oldVal: STATE[T], newVal: STATE[T]): Partial<STATE> | Promise<Partial<STATE>> {
        return this.frmdbState;
    }

    public setFrmdbProperty(propName: keyof STATE, propValue: STATE[typeof  propName]) {
        this.frmdbState[propName] = propValue;
    }

    public updateDomWhenStateChanges(change: Partial<STATE> | Promise<Partial<STATE>>) {
        let p = change instanceof Promise ? change : Promise.resolve(change);
        p.then((newState) => {
            if (this.frmdbState != newState) {
                this.frmdbState = newState;
                // _.debounce(() => 
                    updateDOM(this.frmdbState, this.frmdbConfig.noShadow ? this : this.shadowRoot as any as HTMLElement)
                // );
            }
        });
    }
}

if ((Element.prototype as any).$frmdb$ == null) {
    (Element.prototype as any).$frmdb = function (this: Element) {
        let rootNode = this.getRootNode();
        return rootNode instanceof ShadowRoot ? rootNode.host : (rootNode as Document).body;
    }
}
