/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

import { NavigationItem, entites2navItems } from './navigation.item';

import * as _ from 'lodash';
import { FrmdbElementDecorator, FrmdbElementBase } from '@fe/live-dom-template/frmdb-element';
import { BACKEND_SERVICE } from '@fe/backend.service';
import { Entity } from '@domain/metadata/entity';

const HTML: string = require('raw-loader!@fe-assets/v-nav/v-nav.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/v-nav/v-nav.component.scss').default;

interface VNavComponentState {
    navigationItemsTree: NavigationItem[];
    selectedEntity: Entity;
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
        
        BACKEND_SERVICE.getEntities().then(entities => {
            this.frmdbState.selectedEntity = entities[0];
            this.frmdbState.navigationItemsTree = entites2navItems(entities, this.frmdbState.selectedEntity);
        })
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
