import './router';
import './fragment/fragment.component';
import { initFrmdb } from './init';
import './form/form.component';

import './directives/data-frmdb-select';
import './fe-functions';
import './start-menu/start-menu.component';

window.addEventListener('DOMContentLoaded', (event) => {
    initFrmdb();
    document.body.appendChild(document.createElement('frmdb-start-menu'));
});
