class SvgIconComponent extends HTMLImageElement {
    static observedAttributes = ['class', 'style'];

    constructor() {
        super();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if ("class" === name || "style" === name) {
            let color = getComputedStyle(this).color || '';
            let svgColor = color;
            let m: RegExpMatchArray | null = null;
            if (m = color?.match(/^rgb\((\d+), (\d+), (\d+)\)/)) {
                svgColor = '#' + [m[1], m[2], m[3]].map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
            } else if (m = color?.match(/^rgba\((\d+), (\d+), (\d+), (\d+)\)/)) {
                svgColor = '#' + [m[1], m[2], m[3], m[4]].map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
            }
        }
    }
}

customElements.define('frmdb-svg-icon', SvgIconComponent, { extends: 'img' });
