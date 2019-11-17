import { updateDOM } from "@fe/live-dom-template/live-dom-template";

const HTML: string = require('raw-loader!@fe-assets/frmdb-editor/element-tree.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/frmdb-editor/element-tree.component.scss').default;

export class ElementTreeComponent extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = `<style>${CSS}</style> ${HTML}`;
    }

    render(el: HTMLElement) {
        let grandParentElName = '', parentElName = '', prevName = '', elName = this.getElName(el);
        if (el.parentElement && el.parentElement.parentElement) grandParentElName = this.getElName(el.parentElement.parentElement);
        if (el.parentElement) parentElName = this.getElName(el.parentElement);
        if (el.previousElementSibling) prevName = this.getElName(el.previousElementSibling as HTMLElement);
        updateDOM({grandParentElName, parentElName, prevName, elName}, this.shadowRoot! as any as HTMLElement /*WTF?!*/);
    }

    getElName(el: HTMLElement) {
        return el.tagName + '.' + Array.from(el.classList).join('.');
    }
    
}
customElements.define('frmdb-element-tree', ElementTreeComponent);
