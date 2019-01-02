/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Entity, Pn, EntityProperty, FormulaProperty, ChildTableProperty } from '../../domain/metadata/entity';
import { INV___PRD, INV___Order, INV___PRD___Unit } from './inventory-metadata';
import { General___Client } from "./general-metadata";
import { Fn } from '../../domain/metadata/functions';

export const Forms = {
    _id: "Forms",
    module_: true,
    props: {},
};

export const Forms___ServiceForm = {
    _id: "FRM___ServiceForm",
    props: {

        code: {
            name: "code",
            propType_: Pn.FORMULA,
            formula:
                `@[client].code` + `"-"` +
                Fn.TEXT(
                    Fn.RANK(
                        Fn.GROUP_BY(`Forms_ServiceForm`, Fn.EOMONTH(`time_interval`, `-1`), `time_of_arrival`),
                        Fn.EOMONTH(`@[time_interval]`, `-1`), `@[time_of_arrival]`),
                    `"000000000"`)

        } as FormulaProperty,
        product_form_id: { name: "product_form_id", propType_: Pn.NUMBER, "allowNull": false } as EntityProperty,
        client: { name: "client", propType_: Pn.REFERENCE_TO, referencedEntityName: General___Client._id, snapshotCurrentValueOfProperties: ["code", "username"] } as EntityProperty,
        time_of_arrival: { name: "time_of_arrival", propType_: Pn.DATETIME } as EntityProperty,
        time_of_departure: { name: "time_of_departure", propType_: Pn.DATETIME } as EntityProperty,
        normal_hours: { name: "normal_hours", propType_: Pn.NUMBER } as EntityProperty,
        warranty_hours: { name: "warranty_hours", propType_: Pn.NUMBER } as EntityProperty,
        night_hours: { name: "night_hours", propType_: Pn.NUMBER } as EntityProperty,
        shipment_cost: { name: "shipment_cost", propType_: Pn.STRING } as EntityProperty,
        notes: { name: "notes", propType_: Pn.STRING } as EntityProperty,
        technician_code: { name: "technician_code", propType_: Pn.STRING } as EntityProperty,
        technician2_code: { name: "technician2_code", propType_: Pn.STRING } as EntityProperty,
        client_person: { name: "client_person", propType_: Pn.STRING } as EntityProperty,
        state: { name: "state", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        nb_installments: { name: "nb_installments", propType_: Pn.NUMBER } as EntityProperty,
        accommodation: { name: "accommodation", propType_: Pn.NUMBER } as EntityProperty,
        service_form_units: {
            name: "service_form_units",
            propType_: Pn.CHILD_TABLE, referencedEntityName: INV___Order._id,
            props: {
                equipment: { name: "equipment", propType_: Pn.REFERENCE_TO, referencedEntityName: INV___PRD___Unit._id, snapshotCurrentValueOfProperties: ['code', 'product_code', 'serial1'] } as EntityProperty,
                reported_problem: { name: "reported_problem", propType_: Pn.TEXT } as EntityProperty,
                found_problem: { name: "found_problem", propType_: Pn.TEXT } as EntityProperty,
                work_description: { name: "work_description", propType_: Pn.TEXT } as EntityProperty,
                nb_piston_cycles: { name: "nb_piston_cycles", propType_: Pn.STRING } as EntityProperty,
                brita_counter: { name: "brita_counter", propType_: Pn.STRING } as EntityProperty,
                washing_cycles: { name: "washing_cycles", propType_: Pn.STRING } as EntityProperty,
                state: { name: "state", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
                equipment_group: { name: "equipment_group", propType_: Pn.STRING, } as EntityProperty,
            }
        } as ChildTableProperty,
    }
};
