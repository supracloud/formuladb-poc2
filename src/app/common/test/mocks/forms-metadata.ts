import { Entity, Pn } from '../../domain/metadata/entity';
import { Inventory__Product, Inventory__Order, Inventory__ProductUnit } from './inventory-metadata';
import { General__Client } from "./general-metadata";
import { ExecutionPlan, En } from '../../domain/metadata/execution_plan';

export const Forms = {
    type_: "Entity_", _id: "/Forms",
    
    module_: true
};

export const Forms__ServiceForm = {
    type_: "Entity_", _id: "/Forms/ServiceForm",

    code: {
        propType_: Pn.FORMULA,
        formula: [
            "./client/code", '||', 
            [
                'TEXT',
                ['INDEX_OF', './time_of_arrival', 
                    ['DATE_UTILS', 'time_of_arrival', 'START_OF_MONTH'], 
                    ['DATE_UTILS', 'time_of_arrival', 'END_OF_MONTH']
                ],
                '000000000'
            ]
        ]
    },
    product_form_id: { propType_: Pn.NUMBER, "allowNull": false },
    client: { propType_: Pn.REFERENCE_ENTITY, entity: { deepPath: General__Client._id, snapshotCurrentValueOfProperties: ["code", "username"] } },
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
        propType_: Pn.TABLE, entity: { deepPath: Inventory__Order._id },
        equipment: { propType_: Pn.REFERENCE_ENTITY, entity: { deepPath: Inventory__ProductUnit._id, snapshotCurrentValueOfProperties: ['code', 'product_code', 'serial1'] } },
        reported_problem: { propType_: Pn.TEXT },
        found_problem: { propType_: Pn.TEXT },
        work_description: { propType_: Pn.TEXT },
        nb_piston_cycles: { propType_: Pn.STRING },
        brita_counter: { propType_: Pn.STRING },
        washing_cycles: { propType_: Pn.STRING },
        state: { propType_: Pn.STRING, "allowNull": false },
        equipment_group: { propType_: Pn.STRING, }
    },
    executionPlan_: {
        service_form_units: {
            items: null //should be the same as /Inventory/Order after compilation
        },
        code: [
            ['val1=', En.STORE_queryWithDeepPath, '/Forms/ServiceForm[./time_of_arrival > startOfMonth && time_of_arrival < endOfMonth]'],
            ['map1=', En.DEF_MAP_FUN, 'value.code = value.client.code + TEXT(index, "00000000")'],
            ['val3=', En.EVAL, '_(val1).sortBy(["time_of_arrival"]).map(map1)'],
            [En.STORE_setObj, 'val2'],
        ]
    } as ExecutionPlan,
};
