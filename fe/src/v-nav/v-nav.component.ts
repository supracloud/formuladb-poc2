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
import { elvis } from "@core/elvis";

const HTML: string = ' ';
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/v-nav/v-nav.component.scss').default;

interface VNavComponentState {
    navigationItemsTree: NavigationItem[];
    selectedEntityId: string;
}

declare var Vvveb: any;
declare var $: any;

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

        this.loadTables();

        onEvent(this, 'click', 'a.nav-link *', (event) => {
            let link: HTMLAnchorElement = event.target.closest('.nav-link');
            if (!link || link.dataset.id == null) return;
            this.frmdbState.selectedEntityId = link.dataset.id;
            elvis(elvis((window as any).Vvveb).Gui).CurrentTableId = link.dataset.id;
            elvis_el(this.querySelector('li.active')).classList.remove('active');
            elvis_el(link.parentElement).classList.add('active');
          
        });
    }

    showButtons(link: HTMLAnchorElement) {
        //WTF: cannot get this shit to work ! the first 'show' creates a zombie popover that never hides !! ugly workaround
        $('.popover').hide();

        let span: HTMLElement = link.children[0] as HTMLElement;
        if (!$(span).data("bs.popover") || !$(span).attr('data-popover-attached')) {
            $(span).popover('dispose').popover({
                placement:'right',
                trigger:'manual',
                html:true,
                template: /*html*/`
                    <div class="popover border-0 p-0 m-0" role="tooltip">
                        <div class="popover-body p-0 ml-4"></div>
                    </div>                    
                `
            })
            .attr('data-popover-attached', true)
            .popover('show');

        } else $(span).popover('show'); 
    }

    loadTables(selectedTable?: string) {

        return BACKEND_SERVICE().getEntities().then(entities => {
            this.frmdbState.selectedEntityId = selectedTable || entities[0]._id;
            setTimeout(() => elvis(elvis((window as any).Vvveb).Gui).CurrentTableId = entities[0]._id, 500);

            this.entities = entities;

            // this.frmdbState.navigationItemsTree = entites2navItems(entities, this.frmdbState.selectedEntityId);
        })

    }

    updateDOM() {
        this.elem.innerHTML = /*html*/`
            <div class="tree" style="height: 100%;">
                ${this.render()}
            </div>
        `;
        this.showButtons(this.elem.querySelector(`a[data-id="${this.frmdbState.selectedEntityId}"]`) as HTMLAnchorElement);
    }

    render() {
        return /*html*/`
        <ol>
            ${this.entities.map(ent => /*html*/`
                <li class="nav-item  ${this.frmdbState.selectedEntityId === ent._id ? 'active' : ''}">
                    <a class="nav-link position-relative py-0" data-id="${ent._id}">
                        <span class="frmdb-nav-segment-text" data-content="<a class='delete-table-btn' data-id='${ent._id}' href='#'><i class='la la-trash'></i></a>">
                            <span>${I18N.tt(ent._id)}</span>
                            <!--<span class="frmdb-nav-segment-dev-mode-identifier">${ent._id}</span>-->
                        </span>
                    </a>
                </li>
            `).join('')}
        </ol>
        `
    }

    // _old_render(navItems: NavigationItem[]) {
    //     return /*html*/`
    //     <ol>
    //         ${navItems.map(nav => /*html*/`
    //             <li class="nav-item  ${this.frmdbState.selectedEntityId === nav.id ? 'active' : ''}">
    //                 <a class="nav-link position-relative py-0" data-id="${nav.id}">
    //                     <span class="frmdb-nav-segment-text">
    //                         <span>${nav.linkNameI18n}</span>
    //                         <!--<span class="frmdb-nav-segment-dev-mode-identifier">${nav.id}</span>-->
    //                     </span>
    //                 </a>
    //                 ${nav.children && nav.children.length > 0 ? /*html*/`<input type="checkbox" checked="">` : ''}
    //                 ${this.render(nav.children || [])}
    //             </li>
    //         `).join('')}
    //     </ol>
    //     `        
    // }

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
