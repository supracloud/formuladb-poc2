/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Pn } from "@core/domain/metadata/entity";
import { FormPage } from '@core/domain/uimetadata/form-page'
import { FrmdbLy } from "@core/domain/uimetadata/page";
import { NodeType } from "@core/domain/uimetadata/node-elements";
import { LargeSalesReport } from "./inventory-metadata";

let testUUID = 1;
function getTestUUID() {
  return 'uuid' + ++testUUID;
}

export var LargeSalesReport_Form: FormPage = {
  _id: "FormPage:ALL^^LargeSalesReport",
  nodeType: NodeType.root_node,
  layout: FrmdbLy.ly_admin,
  childNodes: [
    {
      nodeType: NodeType.grid_row,
      childNodes: [
        {
          nodeType: NodeType.form_text,
          propertyName: "client",
          propertyType: Pn.STRING,
          representation: 'paragraph',
          // "propertyType": Pn.STRING,
          _id: "7x8JM1B39JihWrCoX6B64K"
        },
        {
          nodeType: NodeType.form_datepicker,
          propertyName: "month",
          _id: "oBuxsDC9wUamzQ9Ft2M3Ja"
        }
      ],
      _id: "fVmzojRQqQSeAWJzQtjf9h"
    },
    {
      nodeType: NodeType.grid_row,
      childNodes: [
        {
          nodeType: NodeType.form_chart,
          tableName: "large_sales",
          chartType: "bar-vertical",
          width: 850,
          height: 450,
          xPropertyName: "product_name",
          yPropertyName: "large_sales_value",
          groupByPropertyName: undefined,
          _id: "7x8JM1B39JihWrCoX6B64z"
        },
      ],
      _id: "fVmzojRQqQSeAWJzQtjf9h"
    },
    {
      nodeType: NodeType.grid_row,
      childNodes: [
        {
          nodeType: NodeType.form_table,
          tableName: "large_sales",
          refEntityName: LargeSalesReport._id,
          childNodes: [
            {
              nodeType: NodeType.form_input,
              propertyName: "product_id",
              "propertyType": Pn.STRING,
              _id: "9fGmxqFEtxP9ypQYzJ9Uoe"
            },
            {
              nodeType: NodeType.form_input,
              propertyName: "product_id",
              "propertyType": Pn.STRING,
              _id: "4x12CPz2SRTasvTpEgA37G"
            },
            {
              nodeType: NodeType.form_input,
              propertyName: "large_sales_value",
              "propertyType": Pn.NUMBER,
              _id: "hy94dLU9CNYrKnJxyhAvGa"
            },
            {
              nodeType: NodeType.form_input,
              propertyName: "_id",
              "propertyType": Pn.STRING,
              _id: "qZULQDuppbY1C9MVVdMsz5"
            }
          ],
          _id: "qwYyqnVcDkExQDrsc8sBKP"
        }
      ],
      _id: "6rHs2cBbzYNyfESXeVuqMn"
    },
    {
      nodeType: NodeType.grid_row,
      childNodes: [
        {
          nodeType: NodeType.form_input,
          propertyName: "_id",
          "propertyType": Pn.STRING,
          _id: "vpSLco8jAdLXDzDo9FDxp6"
        }
      ],
      _id: "sVg53VC62sxpNRcUyDSDJn"
    }
  ],
};
