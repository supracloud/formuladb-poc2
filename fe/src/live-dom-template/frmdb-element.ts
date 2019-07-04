import * as yaml from 'js-yaml';
import * as _ from "lodash";

import { on, emit } from "../delegated-events";
import { updateDOM } from "./live-dom-template";
import { FrmdbLogger } from "@domain/frmdb-logger";
const LOGGER = new FrmdbLogger('frmdb-element');

import { objKeysTyped } from "@domain/ts-utils";
import { FrmdbUserEvent } from '@be/frmdb-user-events';
import { Subscription, Subject } from 'rxjs';

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
            this.setFrmdbPropertyAndUpdateDOM(attrName as any, newParsedVal as any);
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

    frmdbPropertyChangedCallback<T extends keyof STATE>(propName: T, oldVal: STATE[T] | undefined, newVal: STATE[T]): Partial<STATE> | Promise<Partial<STATE>> {
        return {
            ...this.frmdbState,
            [propName]: newVal,
        };
    }

    public setFrmdbPropertyAndUpdateDOM(propName: keyof STATE, propValue: STATE[typeof  propName]) {
        LOGGER.debug("setFrmdbPropertyAndUpdateDOM", "%o %o %o", propName as string, this.frmdbState[propName], propValue);
        this.updateDomWhenStateChanges(this.frmdbPropertyChangedCallback(propName, this.frmdbState[propName], propValue));
    }

    protected updateDomWhenStateChanges(change: Partial<STATE> | Promise<Partial<STATE>>) {
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

export abstract class FrmdbElementBaseWithRxjs<ATTR, STATE> extends FrmdbElementBase<ATTR, STATE> {
    protected internalStateChanges$: Subject<Partial<STATE>> = new Subject();
    constructor() {
        super();
        this.sub(this.internalStateChanges$.subscribe(state => this.updateDomWhenStateChanges(state)));
    }

    protected propertyChanges$: Subject<{propName: keyof STATE, oldVal: STATE[keyof STATE] | undefined, newVal: STATE[keyof STATE]}> = new Subject();
    public setFrmdbPropertyAndUpdateDOM(propName: keyof STATE, propValue: STATE[typeof  propName]) {
        this.propertyChanges$.next({propName, oldVal: this.frmdbState[propName], newVal: propValue});
        super.setFrmdbPropertyAndUpdateDOM(propName, propValue);
    }

    private subscriptions: Subscription[] = [];
    protected sub(s: Subscription) {
        this.subscriptions.push(s);
    }

    disconnectedCallback() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }
}
