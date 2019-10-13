import './router';
import './fragment/fragment.component';
import { initFrmdb } from './init';
import './form/form.component';

import './directives/data-frmdb-select';
import './fe-functions';
import './highlight-box/highlight-box.component';

window.addEventListener('DOMContentLoaded', (event) => {
    initFrmdb();
});
