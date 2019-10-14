import './router';
import './fragment/fragment.component';
import { initFrmdb } from './init';
import './form/form.component';

import './directives/data-frmdb-select';
import './fe-functions';

window.addEventListener('DOMContentLoaded', (event) => {
    initFrmdb();
});
