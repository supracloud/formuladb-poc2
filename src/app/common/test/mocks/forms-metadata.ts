import { Entity, PropertyTypeN } from '../../domain/metadata/entity';
import { Inventory__Product, Inventory__Order, Inventory__ProductUnit } from './inventory-metadata';
import { General__Client } from "./general-metadata";

export const Forms = {
    type_: "Entity_", _id: "/Forms",
    
    module_: true
};

export const Forms__ServiceForm = {
    type_: "Entity_", _id: "/Forms/ServiceForm",

    code: {
        propType_: PropertyTypeN.FORMULA,
        formula: {
            CONCATENATE: [
                { EXPRESSION: "./client/code" },
                {
                    FORMAT: {
                        format: "%09d",
                        values: [
                            {
                                INDEX_OF: {
                                    expression: "time_of_arrival",
                                    startRange: { TIME_UTILS: { operation: 'START_OF_MONTH', expression: "time_of_arrival" } },
                                    endRange: { TIME_UTILS: { operation: 'END_OF_MONTH', expression: "time_of_arrival" } }
                                }
                            },
                        ]
                    }
                }
            ]
        }
    },
    product_form_id: { propType_: PropertyTypeN.NUMBER, "allowNull": false },
    client: { propType_: PropertyTypeN.REFERENCE_ENTITY, entity: { deepPath: General__Client._id, snapshotCurrentValueOfProperties: ["code", "username"] } },
    time_of_arrival: { propType_: PropertyTypeN.DATETIME },
    time_of_departure: { propType_: PropertyTypeN.DATETIME },
    normal_hours: { propType_: PropertyTypeN.NUMBER },
    warranty_hours: { propType_: PropertyTypeN.NUMBER },
    night_hours: { propType_: PropertyTypeN.NUMBER },
    shipment_cost: { propType_: PropertyTypeN.STRING },
    notes: { propType_: PropertyTypeN.STRING },
    technician_code: { propType_: PropertyTypeN.STRING },
    technician2_code: { propType_: PropertyTypeN.STRING },
    client_person: { propType_: PropertyTypeN.STRING },
    state: { propType_: PropertyTypeN.STRING, "allowNull": false },
    nb_installments: { propType_: PropertyTypeN.NUMBER },
    accommodation: { propType_: PropertyTypeN.NUMBER },
    service_form_units: {
        propType_: PropertyTypeN.TABLE, entity: { deepPath: Inventory__Order._id },
        equipment: { propType_: PropertyTypeN.REFERENCE_ENTITY, entity: { deepPath: Inventory__ProductUnit._id, snapshotCurrentValueOfProperties: ['code', 'product_code', 'serial1'] } },
        reported_problem: { propType_: PropertyTypeN.TEXT },
        found_problem: { propType_: PropertyTypeN.TEXT },
        work_description: { propType_: PropertyTypeN.TEXT },
        nb_piston_cycles: { propType_: PropertyTypeN.STRING },
        brita_counter: { propType_: PropertyTypeN.STRING },
        washing_cycles: { propType_: PropertyTypeN.STRING },
        state: { propType_: PropertyTypeN.STRING, "allowNull": false },
        equipment_group: { propType_: PropertyTypeN.STRING, }

    }

};
