import { LiveDomHtmlElement } from "@live-dom-template/live-dom-html-element";

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
    
class MyComponent extends LiveDomHtmlElement {
    private currenEl: Element | null;

    connectedCallback() {
        this.innerHTML = HTML;
        this.render({});

        this.on('click', '*', (event: MouseEvent) => {
            console.log(event.target);
            console.log("adasdas");
        });
    }
}

customElements.define('frdb-live-dom-editor', MyComponent);
