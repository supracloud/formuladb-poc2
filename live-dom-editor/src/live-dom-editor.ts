const HTML = /*html*/`
<div id="iframe-layer">
    <div id="highlight-box">
        <div id="highlight-name"></div>

        <div id="section-actions">
            <a id="add-section-btn" href="" title="Add element"><i class="la la-plus"></i></a>
        </div>
    </div>
</div>
`;

class MyComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = HTML;
    }
}

customElements.define('frdb-live-dom-editor', MyComponent);
