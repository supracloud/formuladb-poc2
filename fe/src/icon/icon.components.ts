
const STYLE: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/icon/icon.component.scss').default;

class IconComponent extends HTMLElement {
    static observedAttributes = ['href'];
    svg: SVGElement;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = /*html*/`
            <style>${STYLE}</style>
            <svg>
            </svg>
        `;
        this.svg = this.shadowRoot!.querySelector('svg') as SVGElement;
    }

    render() {
        this.svg.innerHTML = `<use xlink:href="/formuladb-env/icons/svg/${this.getAttribute("href")}#frmdb-icon"></use>`;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.render();
    }
}

customElements.define('frmdb-icon', IconComponent);
customElements.whenDefined('frmdb-icon').then(() => console.info('frmdb-icon is defined'));
