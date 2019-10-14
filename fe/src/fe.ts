import './router';
import './fragment/fragment.component';
import { initFrmdb } from './init';
import './form/form.component';

import './directives/data-frmdb-select';
import './fe-functions';

window.addEventListener('DOMContentLoaded', (event) => {
    initFrmdb();
    
    // if (new URL(window.location.href).searchParams.get('formuladb-editor') != null) {
    //     loadExternalScript('/formuladb/frmdb-editor.js');
    //     document.body.appendChild(document.createElement('frmdb-editor'));
    // }

});

var themeStylesheetElement: HTMLLinkElement | null;
function loadExternalStyles(styleUrl: string): Promise<any> {
    return new Promise((resolve, reject) => {
        themeStylesheetElement = document.createElement('link');
        themeStylesheetElement.rel = 'stylesheet';
        themeStylesheetElement.href = styleUrl;
        themeStylesheetElement.onload = resolve;
        document.head.appendChild(this.themeStylesheetElement);
    });
}

function loadExternalScript(scriptUrl: string): Promise<any> {
    return new Promise(resolve => {
        const scriptElement = document.createElement('script');
        scriptElement.src = scriptUrl;
        scriptElement.onload = resolve;
        document.body.appendChild(scriptElement);
    });
}
