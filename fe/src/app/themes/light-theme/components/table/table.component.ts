/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import {
    Component, OnInit, OnDestroy
} from '@angular/core';
import * as _ from "lodash";

import { TableComponent  as BaseTableComponent} from '@fe/app/table/table.component';

@Component({
    selector: 'mwz-table',
    templateUrl: '../../../../table/table.component.html',
    styleUrls: ['../../../../table/table.component.scss']
})
export class TableComponent extends BaseTableComponent implements OnInit, OnDestroy {
    
}
