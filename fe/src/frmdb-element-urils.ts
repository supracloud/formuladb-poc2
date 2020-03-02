import { debounce } from "lodash";
import { updateDOM } from "./live-dom-template/live-dom-template";

export interface FrmdbCustomRender {
    frmdbRender();
}
function isFrmdbCustomRender(param): param is FrmdbCustomRender {
    return param && typeof param.frmdbRender === 'function';
}

export function dataBindStateToElement<STATE extends Object>(component: HTMLElement, state: STATE): STATE {
    let frmdbState: STATE = new Proxy(state, {
        set: (obj, propName: keyof STATE, propValue, receiver) => {
            let ret = true;
            let oldValue = state[propName];
            if (oldValue !== propValue) {
                ret = Reflect.set(obj, propName, propValue);
                if (isFrmdbCustomRender(component)) component.frmdbRender()
                else if (component.shadowRoot) debouncedUpdateDOM(component.shadowRoot as any as HTMLElement, state);
                else  debouncedUpdateDOM(component, state);
            }
            return ret;
        }
    });

    return frmdbState;
}

const debouncedUpdateDOM = debounce((component: HTMLElement, state) => updateDOM(state, component), 100);
