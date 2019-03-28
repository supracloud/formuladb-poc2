/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

import { Form, NodeType, FormDataGrid } from '@core/domain/uimetadata/form'
import { Pn } from '@core/domain/metadata/entity';
import { Table } from '@core/domain/uimetadata/table';
import { FrmdbLy } from '@core/domain/uimetadata/page';
import { BookingItem, Booking } from './booking-metadata';
import { GEN__Actor } from './general-metadata';

let testUUID = 1;
function getTestUUID() {
    return 'uuid' + ++testUUID;
}

export var BookingItem_Form: Form = {
    _id: "Form_:ALL^^" + BookingItem._id, nodeType: NodeType.form,
    isEditable: true,
    page: {
        layout: FrmdbLy.ly_fpattern,
    },
    childNodes: [],
};
export var Booking_Form: Form = {
    _id: "Form_:ALL^^" + Booking._id, nodeType: NodeType.form,
    isEditable: true,
    page: {
        layout: FrmdbLy.ly_fpattern,
    },
    childNodes: [
        { nodeType: NodeType.grid_row, _id: getTestUUID(), childNodes: [
            { nodeType: NodeType.grid_col, _id: getTestUUID(), childNodes: [
                { nodeType: NodeType.date_range_picker, _id: getTestUUID(), startPropertyName: "start_date", endPropertyName: "end_date" },
            ]},
            { nodeType: NodeType.grid_col, _id: getTestUUID(), childNodes: [
                { nodeType: NodeType.form_autocomplete, _id: getTestUUID(), propertyName: "user_id", refEntityName: GEN__Actor._id, refPropertyName: '_id' },
                { nodeType: NodeType.form_autocomplete, _id: getTestUUID(), propertyName: "user_name", refEntityName: GEN__Actor._id, refPropertyName: GEN__Actor.props.name.name },
                { nodeType: NodeType.form_input, _id: getTestUUID(), propertyName: "days", propertyType: Pn.NUMBER },
                { nodeType: NodeType.form_input, _id: getTestUUID(), propertyName: "cost", propertyType: Pn.NUMBER },
                { nodeType: NodeType.form_input, _id: getTestUUID(), propertyName: "overlapping", propertyType: Pn.NUMBER },
            ]},
        ]},
        { 
            nodeType: NodeType.form_data_grid, _id: getTestUUID(), 
            layout: FrmdbLy.ly_fpattern,
            refEntityName: BookingItem._id,
            properties: [
                { nodeType: NodeType.form_input, _id: getTestUUID(), propertyType: Pn.STRING, propertyName: "booking_item_id", refPropertyName: '_id' },
                { nodeType: NodeType.form_input, _id: getTestUUID(), propertyType: Pn.STRING, propertyName: "booking_item_name", refPropertyName: BookingItem.props.name.name },
                { nodeType: NodeType.form_input, _id: getTestUUID(), propertyType: Pn.NUMBER, propertyName: "booking_item_price", refPropertyName: BookingItem.props.price.name },
            ]
        } as FormDataGrid
    ]
};

export var BookingItem_Table: Table = {
    _id: "Table_:ALL^^" + BookingItem._id,
    page: {
        layout: FrmdbLy.ly_fpattern,
    },
    columns: [],
};

export var Booking_Table: Table = {
    _id: "Table_:ALL^^" + Booking._id,
    page: {
        layout: FrmdbLy.ly_fpattern,
    },
    columns: [],
};
