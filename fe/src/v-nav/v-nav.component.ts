/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

import { I18N } from "@fe/i18n.service";
import { NavigationItem, entites2navItems } from './navigation.item';

import * as _ from 'lodash';
import { FrmdbElementDecorator, FrmdbElementBase } from '@fe/live-dom-template/frmdb-element';
import { BACKEND_SERVICE } from '@fe/backend.service';
import { Entity } from '@domain/metadata/entity';
import { onEvent } from '@fe/delegated-events';
import { elvis_el } from '@fe/live-dom-template/dom-node';

const HTML: string = ' ';
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/v-nav/v-nav.component.scss').default;

interface VNavComponentState {
    navigationItemsTree: NavigationItem[];
    selectedEntityId: string;
}

declare var Vvveb: any;

@FrmdbElementDecorator<{}, VNavComponentState>({
    tag: 'frmdb-v-nav',
    observedAttributes: [],
    template: HTML,
    style: CSS,
    noShadow: true,
})
export class VNavComponent extends FrmdbElementBase<{}, VNavComponentState> {

    entities: Entity[] = [];
    
    connectedCallback() {
        
        BACKEND_SERVICE().getEntities().then(entities => {
            this.frmdbState.selectedEntityId = entities[0]._id;
            setTimeout(() => Vvveb.Gui.CurrentTableId = entities[0]._id, 500);

            this.entities = entities;
            
            // this.frmdbState.navigationItemsTree = entites2navItems(entities, this.frmdbState.selectedEntityId);
        })

        onEvent(this, 'click', '*', (event) => {
            let link: HTMLAnchorElement = event.target.closest('.nav-link');
            if (!link || link.dataset.id == null) return;
            this.frmdbState.selectedEntityId = link.dataset.id;
            Vvveb.Gui.CurrentTableId = link.dataset.id;
            elvis_el(this.querySelector('li.active')).classList.remove('active');
            elvis_el(link.parentElement).classList.add('active');
        });
    }

    updateDOM() {
        let el = this.frmdbConfig.noShadow ? this : this.shadowRoot as any as HTMLElement;
        el.innerHTML = /*html*/`
            <div class="tree" style="height: 100%;">
                ${this.render()}
            </div>
        `;
    }

    render() {
        return /*html*/`
        <ol>
            ${this.entities.map(ent => /*html*/`
                <li class="nav-item  ${this.frmdbState.selectedEntityId === ent._id ? 'active' : ''}">
                    <a class="nav-link position-relative py-0" data-id="${ent._id}">
                        <span class="frmdb-nav-segment-text">
                            <span>${I18N.tt(ent._id)}</span>
                            <!--<span class="frmdb-nav-segment-dev-mode-identifier">${ent._id}</span>-->
                        </span>
                    </a>
                </li>
            `).join('')}
        </ol>
        `        
    }
    
z
    
    private setCollapsed(entities: any[], route: string[]): any[] {
        return entities.map(e => {
            if (route.indexOf(e.linkName) < 0 && e.children.length > 0) e.onPath = false;
            if (route.indexOf(e.linkName) >= 0 && e.children.length > 0) e.onPath = true;
            e.children = this.setCollapsed(e.children, route);
            return e;
        });
    }
}


export function queryVNav(el: Document | HTMLElement): VNavComponent {
    let nav: VNavComponent = el.querySelector("frmdb-v-nav") as VNavComponent;
    if (!nav) throw new Error("v-nav not found");
    return nav;
}
