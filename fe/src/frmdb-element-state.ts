import { debounce } from "lodash";
import { updateDOM } from "./live-dom-template/live-dom-template";

export interface FrmdbStateChangeHandler {
    frmdbStateChangedCallback<STATE>(state: FrmdbElementState<STATE>, stateChange: Partial<STATE>): void;
}
function isFrmdbStateChangeHandler(param): param is FrmdbStateChangeHandler {
    return param && typeof param.frmdbStateChangedCallback === 'function';
}

/** Approach using events */
export class FrmdbElementState<STATE> {
    private events: Partial<STATE>[] = [];
    constructor(private el: HTMLElement, private state: STATE) {
    }

    get data(): Readonly<STATE> {
        return this.state;
    }

    emitChange(stateChange: Partial<STATE>) {
        this.events.push(stateChange);
        if (isFrmdbStateChangeHandler(this.el)) {
            this.el.frmdbStateChangedCallback(this, stateChange);
        }
        this.debouncedUpdateComponentDOM();
    }

    debouncedUpdateComponentDOM = debounce(() => this.updateComponentDOM(), 100);
    updateComponentDOM() {
        let newState: Partial<STATE> = {};
        for (let ev of this.events) {
            newState = {
                ...newState,
                ...ev,
            }
        }
        updateDOM(newState, this.el);
        Object.assign(this.state, newState);
    }
}
