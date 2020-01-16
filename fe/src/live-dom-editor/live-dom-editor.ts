import { FrmdbElementBase, FrmdbElementDecorator } from "@fe/live-dom-template/frmdb-element";
import * as _ from "lodash";
import { onEvent } from "@fe/delegated-events";

const HTML = /*html*/`
<div class="live-dom-editor">
    <div class="overlay">
        <div id="highlight-name"></div>

        <div id="section-actions">
            <a id="add-section-btn" href="" title="Add element">M</a>
        </div>
    </div>
</div>
`;

class LiveDomEditor extends HTMLElement {
    highlightEl: HTMLElement;
    box: HTMLElement;
    on = onEvent.bind(null, this);
    emit = FrmdbElementBase.prototype.emit.bind(this);
    constructor() {
        super();
    }
    connectedCallback() {

        this.on('mousemove', '*', _.debounce((event) => {
            console.log(event.target);
            let offset = this.highlightEl.getBoundingClientRect();
            let height = this.highlightEl.clientHeight;
            let width = this.highlightEl.clientWidth;
 
            this.box.style.top = (offset.top + window.scrollY).toString();
            this.box.style.left = (offset.left - window.scrollX).toString();
            this.box.style.width = width.toString();
            this.box.style.height = height.toString();
        }, 20));
    }
}

customElements.define('frmdb-live-dom-editor', LiveDomEditor);
