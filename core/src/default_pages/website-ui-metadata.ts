/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

import { Form, NodeType } from '@core/domain/uimetadata/form'
import { Pn } from '@core/domain/metadata/entity';
import { Home } from './website-metadata';
import { Table } from '@core/domain/uimetadata/table';
import { FrmdbLy } from '@core/domain/uimetadata/page';

let testUUID = 1;
function getTestUUID() {
    return 'uuid' + ++testUUID;
}

export var HomePage_Form: Form = {
    _id: "Form_:ALL^^" + Home._id, nodeType: NodeType.form,
    page: {
        logoUrl: '/assets/icon2.128.png',
        layout: FrmdbLy.ly_cover,
    },
    childNodes: [],
};

export var HomePage_Table: Table = {
    _id: "Table_:ALL^^" + Home._id,
    page: {
        logoUrl: '/assets/icon2.128.png',
        layout: FrmdbLy.ly_cover,
    },
    columns: [],
};
