/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { NavigationItem } from './navigation.item';
import { FrmdbElementDecorator, FrmdbElementBase } from '@fe/live-dom-template/frmdb-element';
import { onEvent } from '@fe/delegated-events';

const HTML: string = require('raw-loader!@fe-assets/v-nav/v-nav-segment.component.html').default;
const CSS: string = require('!!raw-loader!sass-loader?sourceMap!@fe-assets/v-nav/v-nav-segment.component.scss').default;

interface VNavSegmentState {
    nav: NavigationItem[];
}

@FrmdbElementDecorator<{}, VNavSegmentState>({
    tag: 'frmdb-v-nav-segment',
    observedAttributes: [],
    template: HTML,
    style: CSS,
    noShadow: true,
})
export class VNavSegmentComponent extends FrmdbElementBase<{}, VNavSegmentState> {

    connectedCallback() {
        onEvent(this, 'click', '.icon-expand,.icon-collapse', (ev: MouseEvent) => {
            ev.preventDefault();
            let target = ev.target! as Element;
            let entityId = (target.closest('li.nav-item') as any).entityId;
            if ((ev.target! as Element).classList.contains('icon-expand')) {
                this.expand(entityId);
            } else {
                this.collapse(entityId);
            }
        })
    }
    expand(id: string) {
        this.frmdbStreams.userEvents$.next({type: "UserCollapsedNavItem", id, collapsed: false});
    }

    collapse(id: string) {
        this.frmdbStreams.userEvents$.next({type: "UserCollapsedNavItem", id, collapsed: true});
    }

}