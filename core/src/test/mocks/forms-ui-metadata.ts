/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Pn } from "@core/domain/metadata/entity";
import { FormPage } from '@core/domain/uimetadata/form-page';
import { Forms__ServiceForm } from './forms-metadata';
import { NodeType } from "@core/domain/uimetadata/node-elements";

let testUUID = 1;
function getTestUUID() {
  return 'uuid' + ++testUUID;
}
export const Forms__ServiceForm_Form_: FormPage = {
  _id: 'FormPage:ALL^^' + Forms__ServiceForm._id,
  nodeType: NodeType.root_node,
  isEditable: true,
  childNodes: [
    {
      _id: getTestUUID(), nodeType: NodeType.grid_row,
      childNodes: [
        { _id: getTestUUID(), nodeType: NodeType.form_input, propertyType: Pn.STRING, propertyName: 'code' },
        { _id: getTestUUID(), nodeType: NodeType.form_datepicker, propertyName: 'time_of_arrival' },
        { _id: getTestUUID(), nodeType: NodeType.form_datepicker, propertyName: 'time_of_departure' },
        { _id: getTestUUID(), nodeType: NodeType.form_input, propertyType: Pn.STRING, propertyName: 'state' },
      ]
    },
    {
      _id: getTestUUID(), nodeType: NodeType.grid_row,
      childNodes: [
        {
          _id: getTestUUID(), nodeType: NodeType.form_autocomplete,
          refEntityName: 'GEN__Client', refPropertyName: 'name', propertyName: 'client_name'
        },
        {
          _id: getTestUUID(), nodeType: NodeType.form_autocomplete,
          refEntityName: 'GEN__Client', refPropertyName: 'email', propertyName: 'client_email'
        },
        { _id: getTestUUID(), nodeType: NodeType.form_input, propertyType: Pn.STRING, propertyName: 'technician_code' },
        { _id: getTestUUID(), nodeType: NodeType.form_input, propertyType: Pn.STRING, propertyName: 'client_person' },
        { _id: getTestUUID(), nodeType: NodeType.form_input, propertyType: Pn.STRING, propertyName: 'nb_installments' },
        { _id: getTestUUID(), nodeType: NodeType.form_input, propertyType: Pn.STRING, propertyName: 'technician2_code' },
      ]
    },
    {
      _id: getTestUUID(), nodeType: NodeType.grid_row,
      childNodes: [
        { _id: getTestUUID(), nodeType: NodeType.form_input, propertyType: Pn.STRING, propertyName: 'notes' },
      ]
    },
    {
      _id: getTestUUID(), nodeType: NodeType.grid_row,
      childNodes: [
        { _id: getTestUUID(), nodeType: NodeType.form_input, propertyType: Pn.STRING, propertyName: 'accommodation' },
      ]
    },
    {
      _id: getTestUUID(), nodeType: NodeType.grid_row,
      childNodes: [
        {
          _id: getTestUUID(), nodeType: NodeType.form_tabs, tableName: 'service_form_units', tabNameFormPath: 'equipment.code',
          childNodes: [
            {
              _id: getTestUUID(), nodeType: NodeType.grid_row,
              childNodes: [
                { _id: getTestUUID(), nodeType: NodeType.form_input, propertyType: Pn.STRING, propertyName: 'equipment_group' },
                { _id: getTestUUID(), nodeType: NodeType.form_autocomplete, refEntityName: 'equipment', refPropertyName: "asdasdasd", propertyName: "asdcasdcasc" },
              ]
            },
            {
              _id: getTestUUID(), nodeType: NodeType.grid_row,
              childNodes: [
                { _id: getTestUUID(), nodeType: NodeType.form_input, propertyType: Pn.STRING, propertyName: 'washing_cycles' },
                { _id: getTestUUID(), nodeType: NodeType.form_input, propertyType: Pn.STRING, propertyName: 'nb_piston_cycles' },
              ]
            },
            {
              _id: getTestUUID(), nodeType: NodeType.grid_row,
              childNodes: [
                { _id: getTestUUID(), nodeType: NodeType.form_input, propertyType: Pn.STRING, propertyName: 'reported_problem' },
              ]
            },
            {
              _id: getTestUUID(), nodeType: NodeType.grid_row,
              childNodes: [
                { _id: getTestUUID(), nodeType: NodeType.form_input, propertyType: Pn.STRING, propertyName: 'found_problem' },
              ]
            },
            {
              _id: getTestUUID(), nodeType: NodeType.grid_row,
              childNodes: [
                { _id: getTestUUID(), nodeType: NodeType.form_input, propertyType: Pn.STRING, propertyName: 'work_description' },
              ]
            },
            {
              _id: getTestUUID(), nodeType: NodeType.grid_row,
              childNodes: [
                {
                  _id: getTestUUID(), nodeType: NodeType.form_table, tableName: 'items',
                  childNodes: [
                    {
                      _id: getTestUUID(), nodeType: NodeType.form_autocomplete, refEntityName: 'product',
                      refPropertyName: 'code', propertyName: 'product_code'
                    },
                    {
                      _id: getTestUUID(), nodeType: NodeType.form_autocomplete, refEntityName: 'product',
                      refPropertyName: 'name', propertyName: 'product_name'
                    },
                    {
                      _id: getTestUUID(), nodeType: NodeType.form_autocomplete, refEntityName: 'product',
                      refPropertyName: 'location', propertyName: 'product_location'
                    },
                    {
                      _id: getTestUUID(), nodeType: NodeType.form_autocomplete, refEntityName: 'product',
                      refPropertyName: 'price', propertyName: 'product_price'
                    },
                    {
                      _id: getTestUUID(), nodeType: NodeType.form_input,
                      propertyType: Pn.STRING, propertyName: 'requested_quantity'
                    },
                    { _id: getTestUUID(), nodeType: NodeType.form_input, propertyType: Pn.STRING, propertyName: 'client_stock' },
                  ]
                },
              ]
            }
          ]
        },
      ]
    },
    {
      _id: getTestUUID(), nodeType: NodeType.grid_row,
      childNodes: [
        { _id: getTestUUID(), nodeType: NodeType.form_timepicker, propertyName: 'time_of_arrival' },
        { _id: getTestUUID(), nodeType: NodeType.form_timepicker, propertyName: 'time_of_departure' },
        { _id: getTestUUID(), nodeType: NodeType.form_input, propertyType: Pn.STRING, propertyName: 'normal_hours' },
        { _id: getTestUUID(), nodeType: NodeType.form_input, propertyType: Pn.STRING, propertyName: 'warranty_hours' },
        { _id: getTestUUID(), nodeType: NodeType.form_input, propertyType: Pn.STRING, propertyName: 'night_hours' },
        { _id: getTestUUID(), nodeType: NodeType.form_input, propertyType: Pn.STRING, propertyName: 'shipment_cost' },
      ]
    },
    {
      _id: getTestUUID(), nodeType: NodeType.grid_row,
      childNodes: [
        { _id: getTestUUID(), nodeType: NodeType.form_input, propertyType: Pn.STRING, propertyName: 'type_' },
        { _id: getTestUUID(), nodeType: NodeType.form_input, propertyType: Pn.STRING, propertyName: '_id' },
      ]
    },
  ]
};
