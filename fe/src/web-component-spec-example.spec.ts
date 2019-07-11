/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

class Tmp {}

class WebComponentExample extends HTMLElement {
    public connectedCallbackCalled: boolean = false;
    public attributeChangedCallbackCalled: boolean = false;

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = `<span>Hello From innerHTML</span>`;
    }

    connectedCallback() {
        this.connectedCallbackCalled = true;
    }

    attributeChangedCallback(...args) {
        this.shadowRoot!.innerHTML = `<span>Hello ${this.getAttribute("test") || 'From innerHTML'}</span>`;
        this.attributeChangedCallbackCalled = true;
    }
}
(WebComponentExample as any).observedAttributes = ["test"];
customElements.define('web-component-example', WebComponentExample);

describe('WebComponentExample Spec Example', () => {
    beforeEach(() => {
    });

    it('should render', () => { 
        const el: WebComponentExample = document.createElement('web-component-example') as WebComponentExample;
        expect(el.connectedCallbackCalled).toEqual(false);
        expect(el.attributeChangedCallbackCalled).toEqual(false);
        expect(el.shadowRoot!.innerHTML).toEqual('<span>Hello From innerHTML</span>');
        el.setAttribute('test', 'attributeChangedCallback');
        expect(el.attributeChangedCallbackCalled).toEqual(true);
        expect(el.shadowRoot!.innerHTML).toEqual('<span>Hello attributeChangedCallback</span>');
        el.removeAttribute('test');
        
        document.body.innerHTML = '<web-component-example test="blabla"></web-component-example>';
        let el2: WebComponentExample = document.querySelector('web-component-example') as WebComponentExample;
        expect(el2.connectedCallbackCalled).toEqual(true);
        expect(el2.attributeChangedCallbackCalled).toEqual(true);
        expect(el2 instanceof WebComponentExample).toEqual(true);
        expect(el2 instanceof Tmp).toEqual(false);
        expect(el2.shadowRoot!.innerHTML).toEqual('<span>Hello blabla</span>');
    });

});
