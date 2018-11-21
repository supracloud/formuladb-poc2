/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Entity, Pn, FormulaProperty, EntityProperty, ReferenceToProperty } from '../../domain/metadata/entity';
import { ExecutionPlan } from '../../domain/metadata/execution_plan';
import { Sn } from '../../domain/metadata/stored_procedure';
import { $s2e } from '../../formula_compiler';

export const Inventory = {
    _id: "Inventory",
    module_: true,
    props: {},
};

export const Inventory___Product___Location = {
    _id: "Inventory___Product___Location",
    props: {
        productId: { name: "productId", propType_: Pn.STRING, allowNull: false, defaultValue: "DEFAULT-location" } as EntityProperty,
        locationCode: { name: "locationCode", propType_: Pn.STRING, allowNull: false, defaultValue: "DEFAULT-location" } as EntityProperty,
        category: { name: "category", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        received_stock__: {
            name: "received_stock__",
            propType_: Pn.FORMULA,
            formula: 'SUMIF(Inventory___Receipt___Item.quantity, productLocationId == @[_id])',
        } as FormulaProperty,
        available_stock__: {
            name: "available_stock__",
            propType_: Pn.FORMULA,
            formula: 'received_stock__ - ordered_stock__',
        } as FormulaProperty,
        ordered_stock__: {
            name: "ordered_stock__",
            propType_: Pn.FORMULA,
            formula: 'SUMIF(Inventory___Order___Item.quantity, productLocationId == @[_id])'
        } as FormulaProperty,
        price: { name: "price", propType_: Pn.NUMBER, allowNull: true } as EntityProperty,
        currency: {
            propType_: Pn.REFERENCE_TO,
            referencedEntityName: "General_Currency",
            snapshotCurrentValueOfProperties: ["code"],
        } as EntityProperty,
        minimal_stock: { name: "minimal_stock", propType_: Pn.NUMBER, allowNull: false } as EntityProperty,
        moving_stock: { name: "moving_stock", propType_: Pn.NUMBER, allowNull: false } as EntityProperty,
        state: { name: "state", propType_: Pn.STRING, allowNull: false } as EntityProperty,
    },
    validations: {
        positiveStock: { conditionExpr: $s2e('available_stock__ >= 0') }
    },
};
let eeee: Entity = Inventory___Product___Location as Entity;

export const Inventory___Product = {
    _id: "Inventory___Product",
    props: {
        code: { name: "code", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        barcode: { name: "barcode", propType_: Pn.STRING } as EntityProperty,
        name: { name: "name", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        description: { name: "description", propType_: Pn.STRING } as EntityProperty,
        inventoryLocation: { name: "inventoryLocation", propType_: Pn.CHILD_TABLE, referencedEntityName: Inventory___Product___Location._id, props: {} } as EntityProperty,
    }
};

export const Inventory___ProductUnit = {
    _id: "Inventory___ProductUnit",
    props: {

        code: { name: "code", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        product: {
            propType_: Pn.REFERENCE_TO,
            name: "product",
            referencedEntityName: Inventory___Product._id,
            snapshotCurrentValueOfProperties: [
                "code",
                "name",
                "price",
                "currency_code",
            ]
        } as EntityProperty,
        inventoryLocation: { name: "inventoryLocation", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        serial1: { name: "serial1", propType_: Pn.STRING } as EntityProperty,
        serial2: { name: "serial2", propType_: Pn.STRING } as EntityProperty,
        serial3: { name: "serial3", propType_: Pn.STRING } as EntityProperty,
        serial4: { name: "serial4", propType_: Pn.STRING } as EntityProperty,
        serial5: { name: "serial5", propType_: Pn.STRING } as EntityProperty,
        serial6: { name: "serial6", propType_: Pn.STRING } as EntityProperty,
        serial7: { name: "serial7", propType_: Pn.STRING } as EntityProperty,
        install_date: { name: "install_date", propType_: Pn.DATETIME } as EntityProperty,
        state: { name: "state", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        nb_piston_cycles: { name: "nb_piston_cycles", propType_: Pn.STRING } as EntityProperty,
        brita_counter: { name: "brita_counter", propType_: Pn.STRING } as EntityProperty,
        washing_cycles: { name: "washing_cycles", propType_: Pn.STRING, } as EntityProperty,
    }
};


export const Inventory___Receipt = {
    _id: "Inventory___Receipt",
    props: {
        items$: { name: "items$", propType_: Pn.CHILD_TABLE, referencedEntityName: 'Inventory___Receipt___Item', props: {}, isLargeTable: true } as EntityProperty,
    }
};

export const Inventory___Receipt___Item = {
    _id: "Inventory___Receipt___Item",
    props: {

        productLocationId: { name: "productLocationId", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        quantity: { name: "quantity", propType_: Pn.NUMBER, allowNull: false } as EntityProperty,
        units: {
            name: "units",
            propType_: Pn.CHILD_TABLE,
            props: {
                unit: { name: "unit", propType_: Pn.REFERENCE_TO, referencedEntityName: Inventory___ProductUnit._id, snapshotCurrentValueOfProperties: ["code", "serial"] } as EntityProperty,
            }
        } as EntityProperty,
    }
};


export const Inventory___Order = {
    _id: "Inventory___Order",
    props: {
        sales_agent: { name: "sales_agent", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        creation_date: { name: "creation_date", propType_: Pn.DATETIME, allowNull: false } as EntityProperty,
        items$: {
            name: 'items$',
            propType_: Pn.CHILD_TABLE,
            referencedEntityName: 'Inventory___Order___Item',
            props: {},
            isLargeTable: true,
        } as EntityProperty,
    }
};

export const Inventory___Order___Item = {
    _id: "Inventory___Order___Item",
    props: {
        productLocationId: { name: "productLocationId", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        quantity: { name: "quantity", propType_: Pn.NUMBER, allowNull: false } as EntityProperty,
        error_quantity: { name: "error_quantity", propType_: Pn.FORMULA, formula: '0' } as EntityProperty,
        client_stock: { name: "client_stock", propType_: Pn.NUMBER } as EntityProperty,
        units: {
            name: "units",
            propType_: Pn.CHILD_TABLE,
            props: {
                unit: { name: "unit", propType_: Pn.REFERENCE_TO, referencedEntityName: Inventory___ProductUnit._id, snapshotCurrentValueOfProperties: ["code", "serial"] } as EntityProperty,
            }
        } as EntityProperty,
    },
    autoCorrectionsOnValidationFailed: {
        'Inventory___Product___Location!positiveStock': [
            {targetPropertyName: 'quantity', autoCorrectExpr: $s2e('MAX(0, quantity + $ROW$.available_stock__)')},
            {targetPropertyName: 'error_quantity', autoCorrectExpr: $s2e('ABS($OLD$.quantity - quantity)')},
        ],
    },
};
