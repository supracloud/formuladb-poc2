/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

import { FormPage } from '@core/domain/uimetadata/form-page'
import { Home } from './website-metadata';
import { TablePage } from '@core/domain/uimetadata/table-page';
import { FrmdbLy, FrmdbHeader } from '@core/domain/uimetadata/page';
import { NodeType, DataGrid } from '@core/domain/uimetadata/node-elements';

let testUUID = 1;
function getTestUUID() {
    return 'uuid' + ++testUUID;
}

export var HomePage_Form: FormPage = {
    _id: "FormPage:ALL^^" + Home._id,
    nodeType: NodeType.root_node,
    logoUrl: '/assets/icon2.128.png',
    header: FrmdbHeader.hd_cover,
    layout: FrmdbLy.ly_cards,
    childNodes: [],
};

export var HomePage_Table: TablePage = {
    _id: "TablePage:ALL^^" + Home._id,
    nodeType: NodeType.root_node,
    logoUrl: '/assets/icon2.128.png',
    header: FrmdbHeader.hd_cover,
    layout: FrmdbLy.ly_cards,
    childNodes: [
        { nodeType: NodeType.data_grid, _id: getTestUUID(), refEntityName: Home._id },
    ]
};
