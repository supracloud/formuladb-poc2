import { FrmdbElementState, camelCaseProp2kebabCaseAttr, kebabCaseAttr2CamelCaseProp } from "@fe/frmdb-element-state";
import { onEventChildren } from "@fe/delegated-events";
import { ThemeColors } from "@domain/uimetadata/theme";
import { updateDOM } from "@fe/live-dom-template/live-dom-template";

const HTML: string = /*html*/`
<div class="alert alert-dismissible fade show" role="alert" 
    data-frmdb-attr="class[${Object.keys(ThemeColors).join('|')}]:severity"
    data-frmdb-attr="class.d-none:hidden"
>
  <strong data-frmdb-value="eventTitle">some event!</strong>
  <span data-frmdb-value="eventDetail">details of the event.</span>
  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
</div>
`;

const defaultState = {
    eventTitle: "some event!",
    eventDetail: "details of the event.",
    severity: ThemeColors,
    hidden: false,
};
export class AlertComponent extends HTMLElement {
    state = new FrmdbElementState(this, defaultState);
    static observedAttributes = Object.keys(defaultState)
        .map(k => camelCaseProp2kebabCaseAttr(k));

    public change(state: Partial<typeof defaultState>) {
        for (let [k, v] of Object.entries(state)) {
            this.setAttribute(camelCaseProp2kebabCaseAttr(k), v + '');
        }
    }

    connectedCallback() {
        this.innerHTML = HTML;

        onEventChildren(this, ['click'], '[data-dismiss="alert"]', () => {
            this.state.emitChange({hidden: true});
        });
    }

    attributeChangedCallback(name: any, oldVal: any, newVal: any) {
        this.state.emitChange({[kebabCaseAttr2CamelCaseProp(name)]: newVal});
    }
}

customElements.define('frmdb-alert', AlertComponent);
