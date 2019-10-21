import * as _ from "lodash";
import { onEvent } from "@fe/delegated-events";


const HTML = /*html*/`
<ul class="nav flex-row pl-1">
    <li class="nav-item">
        <a class="nav-link disabled" href="javascript:void(0)" tabindex="-1" aria-disabled="true">Page</a>
    </li>
    <li class="nav-item dropdown flex-grow-1">
        <input id="page-list" class="frmdb-dropdown-toggle" tabindex="-1" />
        <label for="page-list" class="nav-link dropdown-toggle text-center" role="button" aria-haspopup="true"
            aria-expanded="false" data-frmdb-value="$frmdb.selectedPageName">
        </label>
        <div class="dropdown-menu">
            <a class="dropdown-item" data-frmdb-table="$frmdb.pages[]" data-frmdb-value="$frmdb.pages[].name"
                data-frmdb-attr="href::$frmdb.pages[].url"></a>
        </div>
    </li>
    <li class="nav-item dropdown">
        <input id="page-opts" class="frmdb-dropdown-toggle" tabindex="-1" />
        <label class="nav-link" for="page-opts" aria-haspopup="true" aria-expanded="false">
            <i class="la la-ellipsis-v"></i>
        </label>
        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="table-options">
            <a class="dropdown-item" id="new-page-btn" title="New Page"><i class="la la-plus-circle"></i> New Page</a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" id="delete-page-btn" title="Delete Page" data-frmdb-prop="pagePathToDelete::$frmdb.selectedPagePath"><i
                    class="la la-trash"></i> Delete <span data-frmdb-value="$frmdb.selectedPageName"></span></a>
        </div>
    </li>
</ul>
`;

class PageListComponent extends HTMLElement {

    constructor() {
        super();

        this.innerHTML = HTML;
    }

    attributeChangedCallback(name: any, oldVal: any, newVal: any) {
        this.init();
    }

    init() {
    }
}

customElements.define('frmdb-page-list', PageListComponent);
