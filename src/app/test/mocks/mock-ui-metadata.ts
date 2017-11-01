import * as metadata from './mock-metadata';
import {Entity} from '../../domain/metadata/entity'
import {Form} from '../../domain/uimetadata/form'

const TestApplication__ServiceForm = `
form-grid-row
  form-input=code
  form-datepicker=time_of_arrival
  form-datepicker=time_of_departure
  form-input=state
form-grid-row
  form-autocomplete.client: "copiedProperties": ["code", "username"]
  form-input=technician_code
  form-input=client_person
form-grid-row
  form-input=nb_installments
  form-input=technician2_code
form-grid-row
  form-input=notes
form-grid-row
  form-input=accommodation
form-grid-row
  form-tabs#service_form_units: "tabNameFormPath": "equipment.code"
    form-grid
      form-grid-row
        form-input=equipment_group
        form-autocomplete.equipment
      form-grid-row
        form-input=washing_cycles
        form-input=nb_piston_cycles
      form-grid-row
        form-input=reported_problem
      form-grid-row
        form-input=found_problem
      form-grid-row
        form-input=work_description
      form-grid-row
        form-table#product_list
          form-autocomplete.product: "copiedProperties": ["inventory_code", "price"]
          form-input=requested_quantity
          form-input=client_stock
form-grid-row
  form-timepicker=time_of_arrival
  form-timepicker=time_of_departure
  form-input=normal_hours
  form-input=warranty_hours
  form-input=night_hours
  form-input=shipment_cost
form-grid-row
  form-input=mwzType
  form-input=_id
`;

let forms = {
    TestApplication__ServiceForm: TestApplication__ServiceForm,
};

export function getFormText(path: string): string {
    return forms[path];
}
