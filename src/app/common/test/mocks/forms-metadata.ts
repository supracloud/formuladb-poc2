import { Entity, Pn } from '../../domain/metadata/entity';
import { Inventory__Product, Inventory__Order, Inventory__ProductUnit } from './inventory-metadata';
import { General__Client } from "./general-metadata";
import { Sn } from '../../domain/metadata/stored_procedure';
import { Fn } from '../../schema_compiler';

export const Forms = {
    type_: "Entity_", _id: "//Forms",

    module_: true
};

export const Forms__ServiceForm = {
    type_: "Entity_", _id: "Forms_ServiceForm",

    code: {
        propType_: Pn.FORMULA,
        formula:
            `client.code` + `"-"` +
            Fn.TEXT(
                Fn.MATCH(
                    Fn.GROUP_BY(`Forms_ServiceForm`, Fn.EOMONTH(`time_interval`, -1), `time_of_arrival`),
                    `time_of_arrival`),
                `"000000000"`)

    },
    product_form_id: { propType_: Pn.NUMBER, "allowNull": false },
    client: { propType_: Pn.BELONGS_TO, deepPath: General__Client._id, snapshotCurrentValueOfProperties: ["code", "username"] },
    time_of_arrival: { propType_: Pn.DATETIME },
    time_of_departure: { propType_: Pn.DATETIME },
    normal_hours: { propType_: Pn.NUMBER },
    warranty_hours: { propType_: Pn.NUMBER },
    night_hours: { propType_: Pn.NUMBER },
    shipment_cost: { propType_: Pn.STRING },
    notes: { propType_: Pn.STRING },
    technician_code: { propType_: Pn.STRING },
    technician2_code: { propType_: Pn.STRING },
    client_person: { propType_: Pn.STRING },
    state: { propType_: Pn.STRING, "allowNull": false },
    nb_installments: { propType_: Pn.NUMBER },
    accommodation: { propType_: Pn.NUMBER },
    service_form_units: {
        propType_: Pn.SUB_TABLE, deepPath: Inventory__Order._id,
        equipment: { propType_: Pn.BELONGS_TO, deepPath: Inventory__ProductUnit._id, snapshotCurrentValueOfProperties: ['code', 'product_code', 'serial1'] },
        reported_problem: { propType_: Pn.TEXT },
        found_problem: { propType_: Pn.TEXT },
        work_description: { propType_: Pn.TEXT },
        nb_piston_cycles: { propType_: Pn.STRING },
        brita_counter: { propType_: Pn.STRING },
        washing_cycles: { propType_: Pn.STRING },
        state: { propType_: Pn.STRING, "allowNull": false },
        equipment_group: { propType_: Pn.STRING, }
    },
};
