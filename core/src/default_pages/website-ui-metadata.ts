/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

import { Form, NodeType } from '@core/domain/uimetadata/form'
import { Pn } from '@core/domain/metadata/entity';
import { Home } from './website-metadata';
import { Table } from '@core/domain/uimetadata/table';

let testUUID = 1;
function getTestUUID() {
    return 'uuid' + ++testUUID;
}

export var HomePage_Form: Form = {
    _id: "Form_:ALL^^" + Home._id, nodeType: NodeType.form,
    page: {
        logoUrl: '/assets/icon2.128.png',
        layout: "frmdb-ly-landing",
    },
    childNodes: [
        { nodeType: NodeType.jumbotron, _id: getTestUUID(), style: "cover", childNodes: [
            { nodeType: NodeType.form_text, _id: getTestUUID(), propertyName: "title", representation: "title" },
            { nodeType: NodeType.form_text, _id: getTestUUID(), propertyName: "tagline", representation: "paragraph" },
        ]},
        { nodeType: NodeType.card_container, _id: getTestUUID(), tableName: "product_features", childNodes: [
            { nodeType: NodeType.grid_row, _id: getTestUUID(), childNodes: [
                { nodeType: NodeType.grid_col, _id: getTestUUID(), childNodes: [
                    { nodeType: NodeType.form_text, _id: getTestUUID(), propertyName: "name", representation: "h3", }
                ]}
            ]},
            { nodeType: NodeType.grid_row, _id: getTestUUID(), childNodes: [
                { nodeType: NodeType.grid_col, _id: getTestUUID(), childNodes: [
                    { nodeType: NodeType.form_text, _id: getTestUUID(), propertyName: "description", representation: "paragraph"}
                ]}
            ]},
        ]}
    ]
};

export var HomePage_Table: Table = {
    _id: "Table_:ALL^^" + Home._id,
    page: {
        logoUrl: '/assets/icon2.128.png',
        layout: "frmdb-ly-landing",
    },
    "columns": [
        {
            "name": "title",
            type: Pn.STRING,
            "_id": "nKq4X7Z1vBEb5xtHJer7uw"
        },
        {
            "name": "tagline",
            type: Pn.STRING,
            "_id": "4Jz4rDLNpMAgNqsiaPfTjT"
        },
        {
            "name": "product_features",
            type: Pn.CHILD_TABLE,
            "_id": "kNNqKxD4rJKejoqGMqyc9C"
        },
        {
            "name": "_id",
            type: Pn.STRING,
            "_id": "ggsFTkHEyYkpfFVipqndU6"
        }
    ],
};
