import * as _ from "lodash";
import { translateThemeRulesByReplacingClasses, _old_ThemeRules, ThemeRules } from "@core/frmdb-themes";

export class ThemePreviewComponent extends HTMLElement {
    static observedAttributes = ['color', 'look'];

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
    }

    link: HTMLLinkElement | undefined;
    attributeChangedCallback(name: any, oldVal: any, newVal: any) {
        let theme = this.getAttribute('theme');
        let look = this.getAttribute('look');
        let color = this.getAttribute('color');
        if (!look || !color) return;

        color = color.replace(/#/g, '');
        let css = `/formuladb-env/css/${look}-${color}.css`;

        if (!this.link) {
            this.render();
            this.link = document.createElement('link');
            this.link.rel = 'stylesheet';
            this.link.href = css;
            this.shadowRoot!.appendChild(this.link);
        } else {
            this.link.href = css;            
        }

        fetch(`/formuladb-env/themes/${theme}.json`)
        .then(async (response) => {
            let themeRules: ThemeRules = await response.json();
            translateThemeRulesByReplacingClasses(this.shadowRoot!, themeRules);
        });
    }

    render() {
        this.shadowRoot!.innerHTML = /*html*/`
        <header class="frmdb-t-cover">
            <div class="frmdb-t-main">
                <div class="jumbotron">
                    <h6>Subtitle of app, can be a bit longer in words</h6>
                    <h1 class="display-4">${this.getAttribute('theme')}</h1>
                    <p>Lead paragraph providing a short introduction to you website or app,
                        <br>it would be good to keep it under two lines of text
                    </p>
                    <a href="javascript:void(0)" class="btn btn-primary mx-auto">Call To Action</a>
                </div>
            </div>
            <div class="frmdb-t-aside">
                Section embedded into the cover page
            </div>
        </header>

        <section class="container py-5">
            <div class="text-center mb-5">
                <h2>Cards with Images</h2>
                <p>Section lead paragraph, some text about the content described in this section.</p>
            </div>
            <div class="card-deck">
                <div class="card frmdb-t-card-media-main" style="display: grid;">
                    <div class="frmdb-t-img overflow-hidden">
                        <img src="/formuladb-env/frmdb-apps/base-app/static/card1.jpg" alt="" />
                    </div>
                    <div class="card-body">
                        <h5>Card 1 title</h5>
                        <h6>Card 1 subtitle</h6>
                        <p>Quisque ornare, quam a blandit malesuada</p>
                    </div>
                    <div class="frmdb-t-card-action">
                        <a href="javascript:void(0)">Action</a>
                    </div>
                    <div class="frmdb-t-card-note">
                        <span>INFO <small>info</small></span>
                    </div>
                </div>
                <div class="card frmdb-t-card-media-main">
                    <div class="frmdb-t-img overflow-hidden">
                        <img src="/formuladb-env/frmdb-apps/base-app/static/card2.jpg" alt="">
                    </div>
                    <div class="card-body">
                        <h5>Card 2 title</h5>
                        <h6>Card 2 subtitle</h6>
                        <p>Integer sit amet nisi viverra, pharetra nibh vitae</p>
                    </div>
                    <div class="frmdb-t-card-action">
                        <a href="javascript:void(0)">Action</a>
                    </div>
                    <div class="frmdb-t-card-note">
                        <span>INFO <small>info</small></span>
                    </div>
                </div>
                <div class="card frmdb-t-card-media-main">
                    <div class="frmdb-t-img overflow-hidden">
                        <img src="/formuladb-env/frmdb-apps/base-app/static/card3.jpg" alt="">
                    </div>
                    <div class="card-body">
                        <h5>Card 3 title</h5>
                        <h6>Card 3 subtitle</h6>
                        <p>Curabitur suscipit, massa eu maximus fringilla</p>
                    </div>
                    <div class="frmdb-t-card-action">
                        <a href="javascript:void(0)">Action</a>
                    </div>
                    <div class="frmdb-t-card-note">
                        <span>INFO <small>info</small></span>
                    </div>
                </div>
                <div class="card frmdb-t-card-media-main">
                    <div class="frmdb-t-img overflow-hidden">
                        <img src="/formuladb-env/frmdb-apps/base-app/static/card4.jpg" alt="">
                    </div>
                    <div class="card-body">
                        <h5>Card 4 title</h5>
                        <h6>Card 4 subtitle</h6>
                        <p>Etiam porta magna eu rutrum rhoncus</p>
                    </div>
                    <div class="frmdb-t-card-action">
                        <a href="javascript:void(0)">Action</a>
                    </div>
                    <div class="frmdb-t-card-note">
                        <span>INFO <small>info</small></span>
                    </div>
                </div>
            </div>
        </section>
        `;
    }
}

customElements.define('frmdb-theme-preview', ThemePreviewComponent);
