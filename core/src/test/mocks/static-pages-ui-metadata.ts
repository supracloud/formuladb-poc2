/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Entity, Pn } from "@core/domain/metadata/entity";
import { Form, NodeType } from '@core/domain/uimetadata/form'

let testUUID = 1;
function getTestUUID() {
  return 'uuid' + ++testUUID;
}

export var HomePage_Form: Form = {
  _id: "Form_:ALL^^StaticPage~~home",
  "grid": {
    nodeType: NodeType.form_grid, _id: getTestUUID(),
    childNodes: [
      {
        nodeType: NodeType.h_layout, _id: getTestUUID(),
        childNodes: [
          {
            nodeType: NodeType.form_text, _id: getTestUUID(),
            propertyName: "client",
            representation:'paragraph',
          },
          {
            nodeType: NodeType.form_datepicker, _id: getTestUUID(),
            propertyName: "month",
          }
        ],
      },
      {
        nodeType: NodeType.h_layout, _id: getTestUUID(),
        childNodes: [
          {
            nodeType: NodeType.form_chart, _id: getTestUUID(),
            tableName: "large_sales",
            chartType: "bar-vertical",
            width: 850,
            height: 450,
            xPropertyName: "product_name",
            yPropertyName: "large_sales_value",
            groupByPropertyName: undefined,
          },
        ],
      },
      {
        nodeType: NodeType.h_layout, _id: getTestUUID(),
        childNodes: [
          {
            nodeType: NodeType.form_table, _id: getTestUUID(),
            "tableName": "large_sales",
            childNodes: [
              {
                nodeType: NodeType.form_input, _id: getTestUUID(),
                propertyName: "product_id",
                "propertyType": Pn.STRING,
              },
              {
                nodeType: NodeType.form_input, _id: getTestUUID(),
                propertyName: "product_id",
                "propertyType": Pn.STRING,
              },
              {
                nodeType: NodeType.form_input, _id: getTestUUID(),
                propertyName: "large_sales_value",
                "propertyType": Pn.NUMBER,
              },
              {
                nodeType: NodeType.form_input, _id: getTestUUID(),
                propertyName: "_id",
                "propertyType": Pn.STRING,
              }
            ],
          }
        ],
      },
      {
        nodeType: NodeType.h_layout, _id: getTestUUID(),
        childNodes: [
          {
            nodeType: NodeType.form_input, _id: getTestUUID(),
            propertyName: "_id",
            "propertyType": Pn.STRING,
          }
        ],
      }
    ],
  }
};
