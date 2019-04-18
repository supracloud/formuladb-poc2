/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

import { Form, NodeType } from '@core/domain/uimetadata/form'
import { Home } from './website-metadata';
import { Table } from '@core/domain/uimetadata/table';
import { FrmdbLy, FrmdbHeader } from '@core/domain/uimetadata/page';

let testUUID = 1;
function getTestUUID() {
    return 'uuid' + ++testUUID;
}

export var HomePage_Form: Form = {
    _id: "Form_:ALL^^" + Home._id, nodeType: NodeType.form,
    page: {
        logoUrl: '/assets/icon2.128.png',
        header: FrmdbHeader.hd_cover,
        layout: FrmdbLy.ly_cards,
    },
    childNodes: [],
};

export var HomePage_Table: Table = {
    _id: "Table_:ALL^^" + Home._id,
    page: {
        logoUrl: '/assets/icon2.128.png',
        header: FrmdbHeader.hd_cover,
        layout: FrmdbLy.ly_cards,
    },
    columns: [],
};
