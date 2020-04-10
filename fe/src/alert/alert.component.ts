import { FrmdbElementState, camelCaseProp2kebabCaseAttr, kebabCaseAttr2CamelCaseProp } from "@fe/frmdb-element-state";
import { onEventChildren } from "@fe/delegated-events";
import { ThemeColors } from "@domain/uimetadata/theme";

const defaultState = {
    eventTitle: "some event!",
    eventDetail: "details of the event.",
    severity: ThemeColors.success,
    visible: "show",
};

export class AlertComponent extends HTMLElement {
    state = defaultState;
    static observedAttributes = Object.keys(defaultState).map(k => camelCaseProp2kebabCaseAttr(k));
    attributeChangedCallback(name: string, oldVal: string, newVal: string) {
        this.state[kebabCaseAttr2CamelCaseProp(name)] = newVal;
        this.render();
    }

    render() {
        this.innerHTML = /*html*/`
            <div class="alert shadow border alert-dismissible alert-${this.state.severity} fade ${this.state.visible}" role="alert">
                <strong>${this.state.eventTitle}</strong>
                <span>${this.state.eventDetail}</span>
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            `
    }

    change(state: Partial<typeof defaultState>) {
        Object.assign(this.state, state);
        this.render();
    }

    connectedCallback() {
        this.render();
        onEventChildren(this, ['click'], '[data-dismiss="alert"]', () => {
            this.parentElement?.removeChild(this);
        });
    }
}

customElements.define('frmdb-alert', AlertComponent);
