
import { debounce } from "lodash";
import { updateDOM } from "@fe/live-dom-template/live-dom-template";
import { I18N } from "./i18n.service";

const debouncedUpdateDOM = debounce((component: FrmdbComponent<any>, state) => {
    let el = component.shadowRoot ? (component.shadowRoot as any as HTMLElement) : component;
    updateDOM(component.consumeDirtyState(), el);
}, 150);

export class FrmdbComponent<STATE> extends HTMLElement {
    private state: Partial<STATE>;
    private dirtyState: Partial<STATE>;
    public getState(): Readonly<Partial<STATE>> {
        return this.state;
    }
    public consumeDirtyState(): Readonly<Partial<STATE>> {
        let ret = this.dirtyState;
        this.dirtyState = {};
        return ret;
    }

    initialState(initialState: Partial<STATE>) {
        this.state = {...initialState};
    }
    init(htmlTemplate: string, cssTemplate: string, useShadowDom?: boolean) {
        let html = `<style>${cssTemplate}</style> ${htmlTemplate}`;

        if (!useShadowDom) {
            // this.appendChild(clone);//does not trigger connectedCallback in jsdom
            this.innerHTML = html;//works with jsdom
            I18N.translateElement(this).then(() => {
                debouncedUpdateDOM(this, this.state);
            });
        } else {
            if (!this.shadowRoot) {
                this.attachShadow({ mode: 'open' });
            }
            this.shadowRoot!.innerHTML = html;
            debouncedUpdateDOM(this, this.state);
        }
    }

    public setState(newState: Partial<STATE>) {
        this.state = {
            ...this.state,
            ...newState, 
        }
        this.dirtyState = {
            ...this.dirtyState,
            ...newState,
        }
        debouncedUpdateDOM(this, newState);
    }
}
