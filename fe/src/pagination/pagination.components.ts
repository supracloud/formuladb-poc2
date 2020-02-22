const CSSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/pagination/pagination.component.scss').default;
const HTML: string = require('raw-loader!@fe-assets/pagination/pagination.component.html').default;

class PaginationComponent extends HTMLElement {
    static observedAttributes = ['name'];
    svg: SVGElement;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = /*html*/`
            <style>${CSSS}</style>
            ${HTML}
        `;
        this.svg = this.shadowRoot!.querySelector('svg') as SVGElement;
    }
}

customElements.define('frmdb-pagination', PaginationComponent);
customElements.whenDefined('frmdb-pagination').then(() => console.info('frmdb-pagination is defined'));
