import { Entity, PropertyTypeN } from '../../domain/metadata/entity';

export const Forms: Entity = {
    type_: "Entity_", _id: "Forms",
    properties: {},
    module: true
};

export const Forms__Order: Entity = {
    type_: "Entity_", _id: "Forms/Order",
    properties: {
        code: { type: PropertyTypeN.STRING, "allowNull": false },
        product_list: { type: PropertyTypeN.TABLE, entity: { deepPath: "/Inventory/Order/item" } },
        state: { type: PropertyTypeN.STRING, "allowNull": false, }
    }
};

export const Forms__Receipt: Entity = {
    type_: "Entity_", _id: "Forms/Acquisition",
    properties: {
        code: { type: PropertyTypeN.STRING, "allowNull": false },
        state: { type: PropertyTypeN.STRING, "allowNull": false, }
    }
};

export const Forms__ServiceForm: Entity = {
    type_: "Entity_", _id: "Forms/ServiceForm",
    properties: {
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
            // type: "FORMULA:CONCATENATE(client.code;FORMAT(\"0\";\"9\";INDEX_IN_INTERVAL(time_of_arrival,monthly))",
        },
        product_form_id: { type: PropertyTypeN.NUMBER, "allowNull": false },
        client: { type: PropertyTypeN.REFERENCE_ENTITY, entity: { deepPath: "/Inventory/Client", copiedProperties: ["code", "username"] } },
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
            type: PropertyTypeN.TABLE, entity: { deepPath: "/Inventory/Order" }, properties: {
                equipment: { type: PropertyTypeN.REFERENCE_ENTITY, entity: { deepPath: "/Inventory/ProductUnit", copiedProperties: ['code', 'product_code', 'serial1'] } },
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
