import * as metadata from './mock-metadata';
import {Entity} from '../../domain/metadata/entity'
import {Form} from '../../domain/uimetadata/form'

const TestApplication__ServiceForm = `
form-grid-row
  form-input=code
  form-input=time_of_arrival
  form-input=time_of_departure
  form-input=state
form-grid-row
  form-autocomplete.client: "copiedProperties": ["code", "name"]
  form-input=technician_code
  form-input=client_person
form-grid-row
  form-input=nb_installments
  form-input=technician2_code
form-grid-row
  form-input=normal_hours
form-grid-row
  form-input=warranty_hours
form-grid-row
  form-input=night_hours
form-grid-row
  form-input=shipment_cost
form-grid-row
  form-input=notes
form-grid-row
  form-input=accommodation
form-grid-row
  form-tabs#service_form_units
form-grid-row
  form-input=_id
form-grid-row
  form-input=_type
`;

let forms = {
    TestApplication__ServiceForm: TestApplication__ServiceForm,
};

export function getFormText(path: string): string {
    return forms[path];
}
