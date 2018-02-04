import { Entity, PropertyTypeN, Fnn } from '../../domain/metadata/entity';

export const Forms: Entity = {
    mwzType: "Entity_", _id: "Forms",
    properties: [],
    module: true
};

export const Forms__Order: Entity = {
    mwzType: "Entity_", _id: "Forms__Order",
    properties: [
        { name: "code", type: PropertyTypeN.STRING, "allowNull": false },
        { name: "product_list", type: PropertyTypeN.TABLE, entity: { path: "Inventory__OrderItem" } },
        { name: "state", type: PropertyTypeN.STRING, "allowNull": false, }
    ]
};

export const Forms__Receipt: Entity = {
    mwzType: "Entity_", _id: "Forms__Acquisition",
    properties: [
        { name: "code", type: PropertyTypeN.STRING, "allowNull": false },
        { name: "state", type: PropertyTypeN.STRING, "allowNull": false, }
    ]
};

export const Forms__ServiceForm: Entity = {
    mwzType: "Entity_", _id: "Forms__ServiceForm",
    properties: [
        {
            name: "code",
            type: PropertyTypeN.FORMULA,
            formula: {
                fn: Fnn.CONCATENATE,
                arguments: [
                    { fn: Fnn.VALUE_OF, property: "client.code" },
                    {
                        fn: Fnn.FORMAT, format: "%09d", values: [{
                            fn: Fnn.INDEX_OF, property: "time_of_arrival",
                            startRange: { fn: Fnn.START_OF_MONTH, property: "time_of_arrival" },
                            endRange: { fn: Fnn.END_OF_MONTH, property: "time_of_arrival" },
                        }]
                    }
                ]
            }
            // type: "FORMULA:CONCATENATE(client.code;FORMAT(\"0\";\"9\";INDEX_IN_INTERVAL(time_of_arrival,monthly))",
        },
        { name: "product_form_id", type: PropertyTypeN.NUMBER, "allowNull": false },
        { name: "client", type: PropertyTypeN.REFERENCE_ENTITY, entity: { path: "Inventory__Client", copiedProperties: ["code", "username"] } },
        { name: "time_of_arrival", type: PropertyTypeN.DATETIME },
        { name: "time_of_departure", type: PropertyTypeN.DATETIME },
        { name: "normal_hours", type: PropertyTypeN.NUMBER },
        { name: "warranty_hours", type: PropertyTypeN.NUMBER },
        { name: "night_hours", type: PropertyTypeN.NUMBER },
        { name: "shipment_cost", type: PropertyTypeN.STRING },
        { name: "notes", type: PropertyTypeN.STRING },
        { name: "technician_code", type: PropertyTypeN.STRING },
        { name: "technician2_code", type: PropertyTypeN.STRING },
        { name: "client_person", type: PropertyTypeN.STRING },
        { name: "state", type: PropertyTypeN.STRING, "allowNull": false },
        { name: "nb_installments", type: PropertyTypeN.NUMBER },
        { name: "accommodation", type: PropertyTypeN.NUMBER },
        {
            name: "service_form_units", type: PropertyTypeN.TABLE, properties: [
                { name: "equipment", type: PropertyTypeN.REFERENCE_ENTITY, entity: { path: "Inventory__ProductUnit", copiedProperties: ['code', 'product_code', 'serial1'] } },
                { name: "product_list", type: PropertyTypeN.TABLE, entity: { path: "Inventory__OrderItem" }, isLargeTable: true },
                { name: "reported_problem", type: PropertyTypeN.TEXT },
                { name: "found_problem", type: PropertyTypeN.TEXT },
                { name: "work_description", type: PropertyTypeN.TEXT },
                { name: "nb_piston_cycles", type: PropertyTypeN.STRING },
                { name: "brita_counter", type: PropertyTypeN.STRING },
                { name: "washing_cycles", type: PropertyTypeN.STRING },
                { name: "state", type: PropertyTypeN.STRING, "allowNull": false },
                { name: "equipment_group", type: PropertyTypeN.STRING, }
            ]
        }
    ]
};
