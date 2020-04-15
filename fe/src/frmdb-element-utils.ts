import { debounce } from "lodash";
import { updateDOM } from "./live-dom-template/live-dom-template";

export interface FrmdbCustomRender {
    frmdbRender();
}
function isFrmdbCustomRender(param): param is FrmdbCustomRender {
    return param && typeof param.frmdbRender === 'function';
}
export interface FrmdbPropertyChangeHandler {
    frmdbPropertyChangedCallback<STATE>(propName: keyof STATE, oldValue, propValue): void;
}
function isFrmdbPropertyChangeHandler(param): param is FrmdbPropertyChangeHandler {
    return param && typeof param.frmdbPropertyChangedCallback === 'function';
}

/** Approach using Proxy */
export function dataBindStateToElement<STATE extends Object>(component: HTMLElement, state: STATE): STATE {
    let frmdbState: STATE = new Proxy(state, {
        set: (obj, propName: keyof STATE, propValue, receiver) => {
            const debouncedUpdateDOM = debounce((component: HTMLElement, state) => {
                let el = component.shadowRoot ? (component.shadowRoot as any as HTMLElement) : component;
                updateDOM(state, el);
            }, 150)
    
            let ret = true;
            let oldValue = state[propName];
            // if (!_.isEqual(oldValue, propValue)) {
            if (oldValue !== propValue) {
                ret = Reflect.set(obj, propName, propValue);

                if (isFrmdbPropertyChangeHandler(component)) {
                    component.frmdbPropertyChangedCallback(propName, oldValue, propValue);
                }

                if (isFrmdbCustomRender(component)) component.frmdbRender()
                else if (component.shadowRoot) debouncedUpdateDOM(component.shadowRoot as any as HTMLElement, state);
                else debouncedUpdateDOM(component, state);
            }
            return ret;
        },
    });

    return frmdbState;
}

