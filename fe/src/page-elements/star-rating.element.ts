import { onEventChildren } from "@fe/delegated-events";

const HTML: string = require('raw-loader!@fe-assets/page-elements/star-rating.element.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/page-elements/star-rating.element.scss').default;

export class StarRatingElement extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = `<style>${CSS}</style> ${HTML}`;

        const starEls = this.querySelectorAll('');
        onEventChildren(this.shadowRoot!, 'click', '.star.rating', (ev: MouseEvent) => {
            let starEl = ev.target as HTMLElement;
            console.log(starEl.parentElement?.dataset.stars + ", " + starEl.dataset.rating);
            starEl.parentElement?.setAttribute('data-stars', starEl.dataset.rating || '');
        });
    }

    getElName(el: HTMLElement) {
        return el.tagName + '.' + Array.from(el.classList).join('.');
    }
    
}
customElements.define('frmdb-star-rating', StarRatingElement);
