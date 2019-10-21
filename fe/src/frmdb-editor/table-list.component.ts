import * as _ from "lodash";
import { onEvent } from "@fe/delegated-events";


const HTML = /*html*/`
<ul class="nav flex-row pl-1">
    <li class="nav-item">
        <a class="nav-link disabled" href="javascript:void(0)" tabindex="-1" aria-disabled="true">Table</a>
    </li>
    <li class="nav-item dropdown flex-grow-1">
        <input id="table-list" class="frmdb-dropdown-toggle" tabindex="-1" />
        <label for="table-list" class="nav-link dropdown-toggle text-primary text-center" aria-haspopup="true" aria-expanded="false"
            data-frmdb-value="$frmdb.selectedTableId">
        </label>
        <div class="dropdown-menu">
            <a class="dropdown-item" data-frmdb-table="$frmdb.tables[]" data-frmdb-value="$frmdb.tables[]._id" href="javascript:void(0)">table 1</a>
        </div>
    </li>
    <li class="nav-item dropdown">
        <input id="table-opts" class="frmdb-dropdown-toggle" tabindex="-1" />
        <label for="table-opts" class="nav-link" id="table-options" aria-haspopup="true" aria-expanded="false">
            <i class="la la-ellipsis-v"></i>
        </label>
        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="table-options">
            <a class="dropdown-item" id="new-table-btn" title="New Table"><i class="la la-plus-circle"></i> New Table</a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" id="delete-table-btn" title="Delete Table" data-frmdb-prop="tableToDelete::$frmdb.selectedTableId"><i
                    class="la la-trash"></i> Delete <span data-frmdb-value="$frmdb.selectedTableId"></span></a>
        </div>
    </li>
</ul>
`;

class HighlightBoxComponent extends HTMLElement {

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

customElements.define('frmdb-table-list', HighlightBoxComponent);
