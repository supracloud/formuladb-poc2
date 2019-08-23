/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

const fetchMock = require('fetch-mock');

import { VNavComponent } from './v-nav.component';
import { normalizeHTML } from "@fe/fe-test-urils.spec";
import { InventorySchema } from '@test/inventory/metadata';

export const InventoryVNavHtml = normalizeHTML(/* html */`
<frmdb-v-nav>
    <frmdb-v-nav-segment data-frmdb-prop="nav::navigationItemsTree" class="nav flex-column">
        <ul class="nav flex-column">
            <li class="nav-item" data-frmdb-table="nav[]" data-frmdb-prop="entityId::nav[].id">
                <a style="padding: 10px 10px 10px 10px; margin: 3px" class="nav-link collapsed" data-frmdb-attr="class.collapsed::nav[].collapsed"
                    data-toggle="collapse">
                    <p>
                        <span class="frmdb-nav-segment-text" data-frmdb-value="::nav[].linkNameI18n">Inventory<span
                                class="frmdb-nav-segment-dev-mode-identifier" data-frmdb-value="::nav[].id">Inventory</span>Inventory</span>
                        <i data-frmdb-if="::nav[].collapsed" class="icon-expand nc-icon nc-stre-right"></i>
                        <template data-frmdb-if="!::nav[].collapsed"><i data-frmdb-if="!::nav[].collapsed"
                                class="icon-collapse nc-icon nc-stre-down"></i></template>
                        <i data-frmdb-if="::nav[].hasChildren">&nbsp;</i>
                    </p>
                </a>
                <template data-frmdb-if="!::nav[].collapsed">
                    <frmdb-v-nav-segment data-frmdb-prop="nav::nav[].children"></frmdb-v-nav-segment>
                </template>
            </li>
            <li class="nav-item" data-frmdb-table="nav[]" data-frmdb-prop="entityId::nav[].id">
                <a style="padding: 10px 10px 10px 10px; margin: 3px" class="nav-link" data-frmdb-attr="class.collapsed::nav[].collapsed" data-toggle="collapse">
                    <p>
                        <span class="frmdb-nav-segment-text" data-frmdb-value="::nav[].linkNameI18n">REP<span class="frmdb-nav-segment-dev-mode-identifier"
                                data-frmdb-value="::nav[].id">REP</span>REP</span>
                        <template data-frmdb-if="::nav[].collapsed"><i data-frmdb-if="::nav[].collapsed"
                                class="icon-expand nc-icon nc-stre-right"></i></template>
                        <i data-frmdb-if="!::nav[].collapsed" class="icon-collapse nc-icon nc-stre-down"></i>
                        <template data-frmdb-if="::nav[].hasChildren"><i data-frmdb-if="::nav[].hasChildren">&nbsp;</i></template>
                    </p>
                </a>

                <frmdb-v-nav-segment data-frmdb-prop="nav::nav[].children">
                    <ul class="nav flex-column">
                        <li class="nav-item" data-frmdb-table="nav[]" data-frmdb-prop="entityId::nav[].id">
                            <a style="padding: 10px 10px 10px 10px; margin: 3px" class="nav-link collapsed" data-frmdb-attr="class.collapsed::nav[].collapsed"
                                data-toggle="collapse">
                                <p>
                                    <span class="frmdb-nav-segment-text" data-frmdb-value="::nav[].linkNameI18n">LargeSalesReport<span
                                            class="frmdb-nav-segment-dev-mode-identifier"
                                            data-frmdb-value="::nav[].id">LargeSalesReport</span>LargeSalesReport</span>
                                    <i data-frmdb-if="::nav[].collapsed" class="icon-expand nc-icon nc-stre-right"></i>
                                    <template data-frmdb-if="!::nav[].collapsed"><i data-frmdb-if="!::nav[].collapsed"
                                            class="icon-collapse nc-icon nc-stre-down"></i></template>
                                    <i data-frmdb-if="::nav[].hasChildren">&nbsp;</i>
                                </p>
                            </a>
                            <template data-frmdb-if="!::nav[].collapsed">
                                <frmdb-v-nav-segment data-frmdb-prop="nav::nav[].children"></frmdb-v-nav-segment>
                            </template>
                        </li>
                    </ul>
                </frmdb-v-nav-segment>

            </li>
            <li class="nav-item" data-frmdb-table="nav[]" data-frmdb-prop="entityId::nav[].id">
                <a style="padding: 10px 10px 10px 10px; margin: 3px" class="nav-link collapsed" data-frmdb-attr="class.collapsed::nav[].collapsed"
                    data-toggle="collapse">
                    <p>
                        <span class="frmdb-nav-segment-text" data-frmdb-value="::nav[].linkNameI18n">GEN<span class="frmdb-nav-segment-dev-mode-identifier"
                                data-frmdb-value="::nav[].id">GEN</span>GEN</span>
                        <i data-frmdb-if="::nav[].collapsed" class="icon-expand nc-icon nc-stre-right"></i>
                        <template data-frmdb-if="!::nav[].collapsed"><template data-frmdb-if="!::nav[].collapsed"><i data-frmdb-if="!::nav[].collapsed"
                                    class="icon-collapse nc-icon nc-stre-down"></i></template></template>
                        <i data-frmdb-if="::nav[].hasChildren">&nbsp;</i>
                    </p>
                </a>
                <template data-frmdb-if="!::nav[].collapsed">
                    <frmdb-v-nav-segment data-frmdb-prop="nav::nav[].children"></frmdb-v-nav-segment>
                </template>
            </li>
        </ul>
    </frmdb-v-nav-segment>
</frmdb-v-nav>        
`);

describe('VNavComponent', () => {
    beforeEach(() => {
        fetchMock.get('/formuladb-api/test-tenant/test-app/schema', InventorySchema);
    });

    afterEach(fetchMock.restore)

    it('should render', async (done) => { 
        document.body.innerHTML = '<frmdb-v-nav></frmdb-v-nav>';
        let el: VNavComponent = document.querySelector('frmdb-v-nav') as VNavComponent;
        expect(el instanceof VNavComponent).toEqual(true);

        // await new Promise(resolve => setTimeout(resolve, 1000));
        // expect(normalizeHTML(el.outerHTML)).toEqual(InventoryVNavHtml);

        done();
    });
});
