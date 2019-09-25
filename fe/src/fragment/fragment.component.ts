/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from 'lodash';

import { FrmdbLogger } from "@domain/frmdb-logger";
import { FrmdbElementBase, FrmdbElementDecorator } from '@fe/live-dom-template/frmdb-element';
import { AppPage } from '@domain/app';
import { BACKEND_SERVICE } from '@fe/backend.service';
import { loadPage } from '@fe/fe-functions';
const LOG = new FrmdbLogger('frmdb-fragment');

/** Component constants (loaded by webpack) **********************************/
export interface FragmentComponentAttr {
    name: string;
};
export interface FragmentComponentState extends FragmentComponentAttr {
    params: {}
};

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
            loadPage(newVal as string).then(html => {
                this.innerHTML = html;
                this.updateDOM();
            });
        }

        return this.frmdbState;
    }

    public setParams(params: {}) {
        this.frmdbState.params = params;
    }
}
