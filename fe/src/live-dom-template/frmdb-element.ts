import * as yaml from 'js-yaml';
import * as _ from "lodash";

import { onEvent, emit } from "../delegated-events";
import { updateDOM } from "./live-dom-template";
import { FrmdbLogger } from "@domain/frmdb-logger";

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

        //Web Components APIs
        cls.prototype.connectedCallback = connectedCallbackNew;
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
export class FrmdbElementBase<ATTR, STATE> extends HTMLElement {
    protected LOG: FrmdbLogger;
    frmdbConfig: FrmdbElementConfig<ATTR, STATE>;

    frmdbState: Partial<STATE> = new Proxy({}, {
        set: (obj, propName: keyof STATE, propValue, receiver) => {
            let ret = true;
            if (this.frmdbState[propName] !== propValue) {
                ret = Reflect.set(obj, propName, propValue);
                this.debouncedUpdateDOM();
            }
            this.updateDomWhenStateChanges(this.frmdbPropertyChangedCallback(propName, this.frmdbState[propName], propValue));
            return ret;
        }
    });

    emit = emit.bind(null, this);
    
    protected attributeChangedCallback(attrName: keyof ATTR, oldVal, newVal) {
        let oldParsedVal = reflectAttr2Prop(attrName, oldVal);
        let newParsedVal = reflectAttr2Prop(attrName, newVal);
        this.LOG.debug("attributeChangedCallback", "%o %o %o %o %o", attrName as string, oldVal, newVal, oldParsedVal, newParsedVal);
        this.frmdbState[attrName as any] = newParsedVal;
    }

    frmdbPropertyChangedCallback<T extends keyof STATE>(propName: T, oldVal: STATE[T] | undefined, newVal: STATE[T]): Partial<STATE> | Promise<Partial<STATE>> {
        return this.frmdbState;
    }

    private debouncedUpdateDOM = _.debounce(() => {
        let el = this.frmdbConfig.noShadow ? this : this.shadowRoot as any as HTMLElement;
        this.LOG.debug("updateDOM", "%o %o", this.frmdbState, el);
        updateDOM(this.frmdbState, el);
    }, 100);

    protected updateDomWhenStateChanges(change: Partial<STATE> | Promise<Partial<STATE>>) {
        let p = change instanceof Promise ? change : Promise.resolve(change);
        p.then((newState) => {
            if (this.frmdbState != newState) {
                this.frmdbState = newState;
                this.debouncedUpdateDOM();
            }
        });
    }
}
