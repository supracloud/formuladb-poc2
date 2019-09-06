/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from 'lodash';
import * as DOMPurify from "dompurify";

import { FrmdbLogger } from "@domain/frmdb-logger";
import { FrmdbElementBase, FrmdbElementDecorator } from '@fe/live-dom-template/frmdb-element';
import { AppPage } from '@domain/app';
import { BACKEND_SERVICE } from '@fe/backend.service';
const LOG = new FrmdbLogger('frmdb-fragment');

/** Component constants (loaded by webpack) **********************************/
export interface FragmentComponentAttr {
    name: string;
};
export interface FragmentComponentState extends FragmentComponentAttr {
    params: {}
};

DOMPurify.addHook('uponSanitizeElement', function (node, data) {
    if (node.nodeName && node.nodeName.match(/^\w+-[-\w]+$/)
        && !data.allowedTags[data.tagName]) {
        data.allowedTags[data.tagName] = true;
    }
});

@FrmdbElementDecorator({
    tag: 'frmdb-fragment',
    observedAttributes: ['name'],
    template: ' ',
    style: `
        :host { display: block }
    `,
    noShadow: true,
})
export class FragmentComponent extends FrmdbElementBase<FragmentComponentAttr, FragmentComponentState> {
    importHTML_not_using_shadowDom_anymore(html: string) {
        const template = document.createElement('template');
        template.innerHTML = html;
        //FIXME: DOMPurify.sanitize(html) removes <link rel="stylesheet", we need to manually use the purifier and add back the stylesheet
        const clone = document.importNode(template.content, true);
        if (!this.shadowRoot) {
            this.attachShadow({ mode: 'open' });
        }
        let el: ShadowRoot = this.shadowRoot!;
        while (el.firstChild) el.removeChild(el.firstChild);
        el.appendChild(clone);
    }

    async frmdbPropertyChangedCallback<T extends keyof FragmentComponentState>(attrName: T, oldVal: FragmentComponentState[T], newVal: FragmentComponentState[T]): Promise<Partial<FragmentComponentState>> {
        if (attrName === "name") {
            let appBackend = BACKEND_SERVICE();
            let app = await appBackend.getApp();
            if (!app) throw new Error("App not found");
            let fragmentPage: AppPage | undefined = app.pages.find(p => p.name == newVal as string);
            if (!fragmentPage) throw new Error("App not found");

            fetch(`/${appBackend.tenantName}/${appBackend.appName}/${fragmentPage.name}`, {
                headers: {
                    'accept': 'text/html',
                },
            })
                .then(async (response) => {
                    let html = await response.text();
                    this.innerHTML = DOMPurify.sanitize(html);
                    this.updateDOM();
                });
        }

        return this.frmdbState;
    }

    public setParams(params: {}) {
        this.frmdbState.params = params;
    }
}
