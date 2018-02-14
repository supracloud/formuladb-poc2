import * as metadata from './mock-metadata';
import { Entity } from '../../domain/metadata/entity'
import { Form, NodeType } from '../../domain/uimetadata/form'
import { Forms__ServiceForm } from "./forms-metadata";

export var Forms__ServiceForm_Form_: Form = {
  _id: 'Form_:' + Forms__ServiceForm._id,
  type_: 'Form_',
  grid: {
    nodeType: NodeType.form_grid,
    childNodes: [
      {
        nodeType: NodeType.form_grid_row,
        childNodes: [
          { nodeType: NodeType.form_input, propertyName: "code" },
          { nodeType: NodeType.form_input, propertyName: "time_of_arrival" },
          { nodeType: NodeType.form_input, propertyName: "time_of_departure" },
          { nodeType: NodeType.form_input, propertyName: "state" },
        ]
      },
      {
        nodeType: NodeType.form_grid_row,
        childNodes: [
          { nodeType: NodeType.form_autocomplete, entityName: "client", copiedProperties: ["code", "username"] },
          { nodeType: NodeType.form_input, propertyName: "technician_code" },
          { nodeType: NodeType.form_input, propertyName: "client_person" },
        ]
      },
      {
        nodeType: NodeType.form_grid_row,
        childNodes: [
          { nodeType: NodeType.form_input, propertyName: "nb_installments" },
          { nodeType: NodeType.form_input, propertyName: "technician2_code" },
        ]
      },
      {
        nodeType: NodeType.form_grid_row,
        childNodes: [
          { nodeType: NodeType.form_input, propertyName: "notes" },
        ]
      },
      {
        nodeType: NodeType.form_grid_row,
        childNodes: [
          { nodeType: NodeType.form_input, propertyName: "accommodation" },
        ]
      },
      {
        nodeType: NodeType.form_grid_row,
        childNodes: [
          {
            nodeType: NodeType.form_tabs, tableName: "service_form_units", tabNameFormPath: "equipment.code",
            childNodes: [
              {
                nodeType: NodeType.form_grid,
                childNodes: [
                  {
                    nodeType: NodeType.form_grid_row,
                    childNodes: [
                      { nodeType: NodeType.form_input, propertyName: "equipment_group" },
                      { nodeType: NodeType.form_autocomplete, entityName: "equipment" },
                    ]
                  },
                  {
                    nodeType: NodeType.form_grid_row,
                    childNodes: [
                      { nodeType: NodeType.form_input, propertyName: "washing_cycles" },
                      { nodeType: NodeType.form_input, propertyName: "nb_piston_cycles" },
                    ]
                  },
                  {
                    nodeType: NodeType.form_grid_row,
                    childNodes: [
                      { nodeType: NodeType.form_input, propertyName: "reported_problem" },
                    ]
                  },
                  {
                    nodeType: NodeType.form_grid_row,
                    childNodes: [
                      { nodeType: NodeType.form_input, propertyName: "found_problem" },
                    ]
                  },
                  {
                    nodeType: NodeType.form_grid_row,
                    childNodes: [
                      { nodeType: NodeType.form_input, propertyName: "work_description" },
                    ]
                  },
                  {
                    nodeType: NodeType.form_grid_row,
                    childNodes: [
                      {
                        nodeType: NodeType.form_table, tableName: "items",
                        childNodes: [
                          { nodeType: NodeType.form_autocomplete, entityName: "product", copiedProperties: ["code", "name", "location", "price"] },
                          { nodeType: NodeType.form_input, propertyName: "requested_quantity" },
                          { nodeType: NodeType.form_input, propertyName: "client_stock" },
                        ]
                      },
                    ]
                  },
                ]
              }
            ]
          },
        ]
      },
      {
        nodeType: NodeType.form_grid_row,
        childNodes: [
          { nodeType: NodeType.form_timepicker, propertyName: "time_of_arrival" },
          { nodeType: NodeType.form_timepicker, propertyName: "time_of_departure" },
          { nodeType: NodeType.form_input, propertyName: "normal_hours" },
          { nodeType: NodeType.form_input, propertyName: "warranty_hours" },
          { nodeType: NodeType.form_input, propertyName: "night_hours" },
          { nodeType: NodeType.form_input, propertyName: "shipment_cost" },
        ]
      },
      {
        nodeType: NodeType.form_grid_row,
        childNodes: [
          { nodeType: NodeType.form_input, propertyName: "type_" },
          { nodeType: NodeType.form_input, propertyName: "_id" },
        ]
      },
    ]
  }

};
