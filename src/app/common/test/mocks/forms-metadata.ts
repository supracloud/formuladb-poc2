import { Entity, PropertyTypeN } from '../../domain/metadata/entity';
import { Inventory__Product, Inventory__Order, Inventory__ProductUnit } from './inventory-metadata';
import {  General__Client} from "./general-metadata";

export const Forms = {
    type_: "Entity_", _id: "/Forms",
    properties: {},
    module: true
};

export const Forms__ServiceForm = {
    type_: "Entity_", _id: "/Forms/ServiceForm",
    properties: { _id: { type: PropertyTypeN.STRING },
        code: {
            type: PropertyTypeN.FORMULA,
            formula: {
                CONCATENATE: [
                    {EXPRESSION: "client.code"},
                    {FORMAT: {
                        format: "%09d", 
                        values: [
                            {INDEX_OF: {
                                expression: "time_of_arrival", 
                                startRange: { TIME_UTILS: {operation: 'START_OF_MONTH', expression: "time_of_arrival"} },
                                endRange: { TIME_UTILS: {operation: 'END_OF_MONTH', expression: "time_of_arrival"} }
                            }},
                        ]
                    }}
                ]
            }
        },
        product_form_id: { type: PropertyTypeN.NUMBER, "allowNull": false },
        client: { type: PropertyTypeN.REFERENCE_ENTITY, entity: { deepPath: General__Client._id, copiedProperties: ["code", "username"] } },
        time_of_arrival: { type: PropertyTypeN.DATETIME },
        time_of_departure: { type: PropertyTypeN.DATETIME },
        normal_hours: { type: PropertyTypeN.NUMBER },
        warranty_hours: { type: PropertyTypeN.NUMBER },
        night_hours: { type: PropertyTypeN.NUMBER },
        shipment_cost: { type: PropertyTypeN.STRING },
        notes: { type: PropertyTypeN.STRING },
        technician_code: { type: PropertyTypeN.STRING },
        technician2_code: { type: PropertyTypeN.STRING },
        client_person: { type: PropertyTypeN.STRING },
        state: { type: PropertyTypeN.STRING, "allowNull": false },
        nb_installments: { type: PropertyTypeN.NUMBER },
        accommodation: { type: PropertyTypeN.NUMBER },
        service_form_units: {
            type: PropertyTypeN.TABLE, entity: { deepPath: Inventory__Order._id }, properties: { _id: { type: PropertyTypeN.STRING },
                equipment: { type: PropertyTypeN.REFERENCE_ENTITY, entity: { deepPath: Inventory__ProductUnit._id, copiedProperties: ['code', 'product_code', 'serial1'] } },
                reported_problem: { type: PropertyTypeN.TEXT },
                found_problem: { type: PropertyTypeN.TEXT },
                work_description: { type: PropertyTypeN.TEXT },
                nb_piston_cycles: { type: PropertyTypeN.STRING },
                brita_counter: { type: PropertyTypeN.STRING },
                washing_cycles: { type: PropertyTypeN.STRING },
                state: { type: PropertyTypeN.STRING, "allowNull": false },
                equipment_group: { type: PropertyTypeN.STRING, }
            }
        }
    }
};
