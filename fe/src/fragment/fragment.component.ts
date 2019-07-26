/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import * as _ from 'lodash';
import * as DOMPurify from "dompurify";

import '../autocomplete/autocomplete.component';

import { FrmdbLogger } from "@domain/frmdb-logger";
import { FrmdbElementBase, FrmdbElementDecorator } from '@fe/live-dom-template/frmdb-element';
import { APP_BACKEND } from '@fe/app-backend';
import { AppPage } from '@domain/app';
const LOG = new FrmdbLogger('frmdb-fragment');

/** Component constants (loaded by webpack) **********************************/
const HTML: string = require('raw-loader!@fe-assets/form/form.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/form/form.component.scss').default;
export interface FragmentComponentAttr {
    name: string;
};
export interface FragmentComponentState extends FragmentComponentAttr {
};

@FrmdbElementDecorator({
    tag: 'frmdb-fragment',
    observedAttributes: ['name'],
    template: ' ',
    noShadow: true,
})
export class FragmentComponent extends FrmdbElementBase<FragmentComponentAttr, FragmentComponentState> {

    async frmdbPropertyChangedCallback<T extends keyof FragmentComponentState>(attrName: T, oldVal: FragmentComponentState[T], newVal: FragmentComponentState[T]): Promise<Partial<FragmentComponentState>> {
        if (attrName === "name") {
            let appBackend = APP_BACKEND();
            let app = await appBackend.getApp();
            if (!app) throw new Error("App not found");
            let fragmentPage: AppPage | undefined = app.pages.find(p => p.name == newVal as string); 
            if (!fragmentPage) throw new Error("App not found");
            
            fetch(`/${appBackend.tenantName}/${appBackend.appName}/${fragmentPage.html}`)
            .then(async (response) => {
                let html = await response.text();
                this.innerHTML = DOMPurify.sanitize(html);
            });
            
            return this.frmdbState;
        }
    }
}
