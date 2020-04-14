/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Entity, Pn, EntityProperty, FormulaProperty, ChildTableProperty } from "@domain/metadata/entity";
import { InventoryProduct, InventoryOrder, InventoryProductUnit } from '../inventory/metadata';
import { GEN__Client } from "./general-metadata";
import { Sn } from '@domain/metadata/stored_procedure';
import { Fn } from "@domain/metadata/functions";

export const Forms__ServiceForm = {
    _id: 'FRM__ServiceForm',
    props: {

        code: {
            name: 'code',
            propType_: Pn.FORMULA,
            formula: '""'
                // `@[client].code` + `'-'` +
                // Fn.TEXT(
                //     Fn.RANK(
                //         Fn.GROUP_BY(`Forms_ServiceForm`, Fn.EOMONTH(`time_interval`, `-1`), `time_of_arrival`),
                //         Fn.EOMONTH(`@[time_interval]`, `-1`), `@[time_of_arrival]`),
                //     `'000000000'`)

        } as FormulaProperty,
        product_form_id: { name: 'product_form_id', propType_: Pn.NUMBER, required: true } as EntityProperty,
        client_name: {
            name: 'client_name',
            propType_: Pn.REFERENCE_TO,
            referencedEntityName: GEN__Client._id,
            referencedPropertyName: 'name'
        } as EntityProperty,
        client_email: {
            name: 'client_email',
            propType_: Pn.REFERENCE_TO,
            referencedEntityName: GEN__Client._id,
            referencedPropertyName: 'email'
        } as EntityProperty,
        time_of_arrival: { name: 'time_of_arrival', propType_: Pn.DATETIME } as EntityProperty,
        time_of_departure: { name: 'time_of_departure', propType_: Pn.DATETIME } as EntityProperty,
        normal_hours: { name: 'normal_hours', propType_: Pn.NUMBER } as EntityProperty,
        warranty_hours: { name: 'warranty_hours', propType_: Pn.NUMBER } as EntityProperty,
        night_hours: { name: 'night_hours', propType_: Pn.NUMBER } as EntityProperty,
        shipment_cost: { name: 'shipment_cost', propType_: Pn.STRING } as EntityProperty,
        notes: { name: 'notes', propType_: Pn.STRING } as EntityProperty,
        technician_code: { name: 'technician_code', propType_: Pn.STRING } as EntityProperty,
        technician2_code: { name: 'technician2_code', propType_: Pn.STRING } as EntityProperty,
        client_person: { name: 'client_person', propType_: Pn.STRING } as EntityProperty,
        state: { name: 'state', propType_: Pn.STRING, required: true } as EntityProperty,
        nb_installments: { name: 'nb_installments', propType_: Pn.NUMBER } as EntityProperty,
        accommodation: { name: 'accommodation', propType_: Pn.NUMBER } as EntityProperty,
        service_form_units: {
            name: 'service_form_units',
            propType_: Pn.CHILD_TABLE, referencedEntityName: InventoryOrder._id,
            props: {
                equipmentCode: {
                    name: 'equipment_code', propType_: Pn.REFERENCE_TO,
                    referencedEntityName: InventoryProductUnit._id, referencedPropertyName: 'code'
                } as EntityProperty,
                equipmentProductCode: {
                    name: 'equipment_code', propType_: Pn.REFERENCE_TO,
                    referencedEntityName: InventoryProductUnit._id, referencedPropertyName: 'product_code'
                } as EntityProperty,
                equipmentSerial1: {
                    name: 'equipment_code', propType_: Pn.REFERENCE_TO,
                    referencedEntityName: InventoryProductUnit._id, referencedPropertyName: 'serial1'
                } as EntityProperty,
                reported_problem: { name: 'reported_problem', propType_: Pn.DOCUMENT } as EntityProperty,
                found_problem: { name: 'found_problem', propType_: Pn.DOCUMENT } as EntityProperty,
                work_description: { name: 'work_description', propType_: Pn.DOCUMENT } as EntityProperty,
                nb_piston_cycles: { name: 'nb_piston_cycles', propType_: Pn.STRING } as EntityProperty,
                brita_counter: { name: 'brita_counter', propType_: Pn.STRING } as EntityProperty,
                washing_cycles: { name: 'washing_cycles', propType_: Pn.STRING } as EntityProperty,
                state: { name: 'state', propType_: Pn.STRING, required: true } as EntityProperty,
                equipment_group: { name: 'equipment_group', propType_: Pn.STRING, } as EntityProperty,
            }
        } as ChildTableProperty,
    }
};

export const Forms = {
    _id: 'FRM',
    pureNavGroupingChildren: [Forms__ServiceForm._id],
    props: {},
};
