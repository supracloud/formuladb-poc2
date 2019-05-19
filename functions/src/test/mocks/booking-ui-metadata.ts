/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

import { FormPage } from '../../uimetadata/form-page'
import { Pn } from '../../metadata/entity';
import { TablePage } from '../../uimetadata/table-page';

import { BookingItem, Booking } from './booking-metadata';
import { $User } from '../../metadata/default-metadata';
import { NodeType, DataGrid, TableColumn } from '../../uimetadata/node-elements';

let testUUID = 1;
function getTestUUID() {
    return 'uuid' + ++testUUID;
}

export var BookingItem_Form: FormPage = {
    _id: "FormPage:ALL^^" + BookingItem._id,
    nodeType: NodeType.root_node,
    isEditable: true,
    layout: "frmdb-ly-fpattern",
    childNodes: [],
};
export var Booking_Form: FormPage = {
    _id: "FormPage:ALL^^" + Booking._id,
    nodeType: NodeType.root_node,
    isEditable: true,
    layout: "frmdb-ly-fpattern",
    childNodes: [
        { nodeType: NodeType.h_nav, _id: getTestUUID() },
        { nodeType: NodeType.grid_layout, _id: getTestUUID(), childNodes: [
            { nodeType: NodeType.flex_layout, direction: "column", _id: getTestUUID(), childNodes: [
                { nodeType: NodeType.v_nav, _id: getTestUUID() },
            ]},
            { nodeType: NodeType.flex_layout, direction: "column", _id: getTestUUID(), childNodes: [
                { nodeType: NodeType.date_range_picker, _id: getTestUUID(), startPropertyName: "start_date", endPropertyName: "end_date" },
            ]},
            { nodeType: NodeType.flex_layout, direction: "column", _id: getTestUUID(), childNodes: [
                { nodeType: NodeType.form_autocomplete, _id: getTestUUID(), propertyName: "user_id", refEntityName: $User._id, refPropertyName: '_id' },
                { nodeType: NodeType.form_autocomplete, _id: getTestUUID(), propertyName: "user_name", refEntityName: $User._id, refPropertyName: $User.props.name.name },
                { nodeType: NodeType.form_input, _id: getTestUUID(), propertyName: "days", propertyType: Pn.NUMBER },
                { nodeType: NodeType.form_input, _id: getTestUUID(), propertyName: "cost", propertyType: Pn.NUMBER },
                // { nodeType: NodeType.form_input, _id: getTestUUID(), propertyName: "overlapping", propertyType: Pn.NUMBER },
            ]},
        ]},
        { 
            nodeType: NodeType.data_grid, _id: getTestUUID(), 
            layout: "frmdb-ly-fpattern",
            refEntityName: BookingItem._id,
            properties: [
                { nodeType: NodeType.form_input, _id: getTestUUID(), propertyType: Pn.STRING, propertyName: "booking_item_id", refPropertyName: '_id' },
                { nodeType: NodeType.form_input, _id: getTestUUID(), propertyType: Pn.STRING, propertyName: "booking_item_name", refPropertyName: BookingItem.props.name.name },
                { nodeType: NodeType.form_input, _id: getTestUUID(), propertyType: Pn.NUMBER, propertyName: "booking_item_price", refPropertyName: BookingItem.props.price.name },
            ]
        } as DataGrid
    ]
};

export var BookingItem_Table: TablePage = {
    _id: "TablePage:ALL^^" + BookingItem._id,
    nodeType: NodeType.root_node,
    layout: "frmdb-ly-fpattern",
    childNodes: [
        { nodeType: NodeType.h_nav, _id: getTestUUID() },
        {
            _id: getTestUUID(),  
            nodeType: NodeType.data_grid,
            refEntityName: BookingItem._id,
            dblClickAction: "edit-row",
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
    layout: "frmdb-ly-fpattern",
};
