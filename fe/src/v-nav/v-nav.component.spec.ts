/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

class Gigi { }

class WebComponent extends HTMLElement {
    constructor(props = { someMessage: 'From innerHTML' }) {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = `<span>Hello ${props.someMessage}</span>`;
    }

    connectedCallback() {
        console.log('connectedCallback Called from innerHTML code path');
    }

    attributeChangedCallback(...args) {
        console.log("attributeChangedCallback", args);
    }
}
(WebComponent as any).observedAttributes = ["test"];

// Define into the internal JSDOM CustomElementsRegistry
console.log(customElements, window.customElements);
customElements.define('web-component', WebComponent);

const el = document.createElement('web-component');

console.log(el, el.outerHTML, el.shadowRoot);
el.setAttribute('test', 'attributeChangedCallback');
console.log(el, el.outerHTML, el.shadowRoot);
el.removeAttribute('test');

console.log(el.outerHTML);


describe('VNavComponent', () => {
    beforeEach(() => {
    });

    it('should render', () => {
        document.body.innerHTML = '<web-component></web-component>';
        console.log(document.body.innerHTML);
        console.log(document.querySelector('web-component'));
        console.log("instanceof WebComponent = ", document.querySelector('web-component') instanceof WebComponent, document.querySelector('web-component') instanceof Gigi);
        console.log(document.querySelector('web-component')!.shadowRoot);
        console.log(document.querySelector('web-component')!.shadowRoot!.innerHTML);
    });

    it('should render', () => {
        document.body.innerHTML = /* html */`
            <frmdb-v-nav></frmdb-v-nav>
            <script src="dist-fe/frmdb-editor.js"></script>
        `;

        let cmp = document.querySelector('frmdb-v-nav');
        console.error(cmp, cmp!.innerHTML);
    })
});
