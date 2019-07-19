/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

import { NavigationItem, entites2navItems } from './navigation.item';

import * as _ from 'lodash';
import { FrmdbElementDecorator, FrmdbElementBase } from '@fe/live-dom-template/frmdb-element';
import { BACKEND_SERVICE } from '@fe/backend.service';
import { Entity } from '@domain/metadata/entity';

const HTML: string = ' ';
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/v-nav/v-nav.component.scss').default;

interface VNavComponentState {
    navigationItemsTree: NavigationItem[];
    selectedEntityId: string;
}

@FrmdbElementDecorator<{}, VNavComponentState>({
    tag: 'frmdb-v-nav',
    observedAttributes: [],
    template: HTML,
    style: CSS,
    noShadow: true,
})
export class VNavComponent extends FrmdbElementBase<{}, VNavComponentState> {
    
    connectedCallback() {
        
        BACKEND_SERVICE().getEntities().then(entities => {
            this.frmdbState.selectedEntityId = entities[0]._id;
            this.frmdbState.navigationItemsTree = entites2navItems(entities, this.frmdbState.selectedEntityId);
        })
    }

    updateDOM() {
        let el = this.frmdbConfig.noShadow ? this : this.shadowRoot as any as HTMLElement;
        el.innerHTML = `<style>${CSS}</style>` + this.render(this.frmdbState.navigationItemsTree || []);
    }

    render(navItems: NavigationItem[]) {
        return /*html*/`
        <ul class="nav flex-column" >
            ${navItems.map(nav => /*html*/`
            <li class="nav-item">
                <a class="nav-link position-relative" data-toggle="collapse">
                    <span class="frmdb-nav-segment-text">
                        <span>${nav.linkNameI18n}</span>
                        <span class="frmdb-nav-segment-dev-mode-identifier">${nav.id}</span>
                    </span>
                </a>
                ${this.render(nav.children || [])}
            </li>
            `).join('')}
        </ul>
        `        
    }
    
    private setCollapsed(entities: any[], route: string[]): any[] {
        return entities.map(e => {
            if (route.indexOf(e.linkName) < 0 && e.children.length > 0) e.onPath = false;
            if (route.indexOf(e.linkName) >= 0 && e.children.length > 0) e.onPath = true;
            e.children = this.setCollapsed(e.children, route);
            return e;
        });
    }
}
