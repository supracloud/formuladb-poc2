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

@FrmdbElementDecorator({
    tag: 'frmdb-live-dom-editor',
    attributeExamples: {},
    initialState: {},
    template: HTML,
    style: '',
})
class LiveDomEditor extends FrmdbElementBase<{}, {}> {
    on = onEvent.bind(null, this);
    emit = FrmdbElementBase.prototype.emit.bind(this);
    
    connectedCallback() {

        this.on('mousemove', '*', _.debounce((event) => {
            console.log(event.target);
            // this.highlightEl$ = jQuery(event.this.highlightEl$);
            // let offset = this.highlightEl$.offset();
            // let height = this.highlightEl$.outerHeight();
            // let halfHeight = Math.max((height || 0) / 2, 50);
            // let width = this.highlightEl$.outerWidth();
            // let halfWidth = Math.max((width || 0) / 2, 50);

            // $("#highlight-box").css({
            //     top: offset.top - window.document.scrollTop(),
            //     left: offset.left - self.frameDoc.scrollLeft(),
            //     width: width,
            //     height: height,
            // });
        }, 20));
    }
}

customElements.define('frmdb-live-dom-editor', LiveDomEditor);
