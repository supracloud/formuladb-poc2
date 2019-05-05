/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

import { FormPage } from '@core/domain/uimetadata/form-page'
import { Pn } from '@core/domain/metadata/entity';
import { TablePage } from '@core/domain/uimetadata/table-page';
import { FrmdbLy } from '@core/domain/uimetadata/page';
import { BookingItem, Booking } from './booking-metadata';
import { $User } from '@core/domain/metadata/default-metadata';
import { NodeType, FormDataGrid, TableColumn } from '@core/domain/uimetadata/node-elements';

let testUUID = 1;
function getTestUUID() {
    return 'uuid' + ++testUUID;
}

export var BookingItem_Form: FormPage = {
    _id: "FormPage:ALL^^" + BookingItem._id,
    nodeType: NodeType.root_node,
    isEditable: true,
    layout: FrmdbLy.ly_fpattern,
    childNodes: [],
};
export var Booking_Form: FormPage = {
    _id: "FormPage:ALL^^" + Booking._id,
    nodeType: NodeType.root_node,
    isEditable: true,
    layout: FrmdbLy.ly_fpattern,
    childNodes: [
        { nodeType: NodeType.h_nav, _id: getTestUUID() },
        { nodeType: NodeType.grid_row, _id: getTestUUID(), childNodes: [
            { nodeType: NodeType.grid_col, _id: getTestUUID(), childNodes: [
                { nodeType: NodeType.v_nav, _id: getTestUUID() },
            ]},
            { nodeType: NodeType.grid_col, _id: getTestUUID(), childNodes: [
                { nodeType: NodeType.date_range_picker, _id: getTestUUID(), startPropertyName: "start_date", endPropertyName: "end_date" },
            ]},
            { nodeType: NodeType.grid_col, _id: getTestUUID(), childNodes: [
                { nodeType: NodeType.form_autocomplete, _id: getTestUUID(), propertyName: "user_id", refEntityName: $User._id, refPropertyName: '_id' },
                { nodeType: NodeType.form_autocomplete, _id: getTestUUID(), propertyName: "user_name", refEntityName: $User._id, refPropertyName: $User.props.name.name },
                { nodeType: NodeType.form_input, _id: getTestUUID(), propertyName: "days", propertyType: Pn.NUMBER },
                { nodeType: NodeType.form_input, _id: getTestUUID(), propertyName: "cost", propertyType: Pn.NUMBER },
                // { nodeType: NodeType.form_input, _id: getTestUUID(), propertyName: "overlapping", propertyType: Pn.NUMBER },
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

export var BookingItem_Table: TablePage = {
    _id: "TablePage:ALL^^" + BookingItem._id,
    nodeType: NodeType.root_node,
    layout: FrmdbLy.ly_fpattern,
    childNodes: [
        { nodeType: NodeType.h_nav, _id: getTestUUID() },
        {
            _id: getTestUUID(),  
            nodeType: NodeType.form_data_grid,
            refEntityName: BookingItem._id,
            columns: Object.values(BookingItem.props).map(pn => ({
                _id: getTestUUID(),
                name: pn.name, 
                type: pn.propType_
            } as TableColumn))
        }
    ]
};

export var Booking_Table: TablePage = {
    _id: "TablePage:ALL^^" + Booking._id,
    nodeType: NodeType.root_node,
    layout: FrmdbLy.ly_fpattern,
};
