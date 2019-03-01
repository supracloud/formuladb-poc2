/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Entity, Pn, FormulaProperty, EntityProperty, ReferenceToProperty, EntityStateGraph } from "@core/domain/metadata/entity";
import { $s2e } from '../../formula_compiler';

export const ProductLocation = {
    _id: 'ProductLocation',
    props: {
        _id: { name: "_id", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        product_id: { name: 'product_id', propType_: Pn.STRING, allowNull: false, defaultValue: 'DEFAULT-location' } as EntityProperty,
        location_code: { name: 'location_code', propType_: Pn.STRING, allowNull: false, defaultValue: 'DEFAULT-location' } as EntityProperty,
        category: { name: 'category', propType_: Pn.STRING, allowNull: false } as EntityProperty,
        received_stock__: {
            name: 'received_stock__',
            propType_: Pn.FORMULA,
            formula: 'SUMIF(ReceiptItem.quantity, product_id == @[_id])',
        } as FormulaProperty,
        available_stock__: {
            name: 'available_stock__',
            propType_: Pn.FORMULA,
            formula: 'received_stock__ - ordered_stock__',
        } as FormulaProperty,
        ordered_stock__: {
            name: 'ordered_stock__',
            propType_: Pn.FORMULA,
            formula: 'SUMIF(OrderItem.quantity, product_id == @[_id])'
        } as FormulaProperty,
        price: { name: 'price', propType_: Pn.NUMBER, allowNull: true } as EntityProperty,
        currency: {
            propType_: Pn.REFERENCE_TO,
            referencedEntityName: 'General_Currency',
            referencedPropertyName: 'code',
            name: 'currency__'
        } as EntityProperty,
        minimal_stock: { name: 'minimal_stock', propType_: Pn.NUMBER, allowNull: false } as EntityProperty,
        moving_stock: { name: 'moving_stock', propType_: Pn.NUMBER, allowNull: false } as EntityProperty,
        state: { name: 'state', propType_: Pn.STRING, allowNull: false } as EntityProperty,
    },
    validations: {
        positiveStock: { conditionExpr: $s2e('available_stock__ >= 0') }
    },
};
const eeee: Entity = ProductLocation as Entity;

export const InventoryProduct = {
    _id: 'InventoryProduct',
    props: {
        code: { name: 'code', propType_: Pn.STRING, allowNull: false } as EntityProperty,
        barcode: { name: 'barcode', propType_: Pn.STRING } as EntityProperty,
        name: { name: 'name', propType_: Pn.STRING, allowNull: false } as EntityProperty,
        description: { name: 'description', propType_: Pn.STRING } as EntityProperty,
        inventory_location: {
            name: 'inventory_location',
            propType_: Pn.CHILD_TABLE, referencedEntityName: ProductLocation._id, props: {}
        } as EntityProperty,
    }
};

export const InventoryProductUnit = {
    _id: 'InventoryProductUnit',
    props: {

        code: { name: 'code', propType_: Pn.STRING, allowNull: false } as EntityProperty,
        productCode: {
            propType_: Pn.REFERENCE_TO,
            name: 'product_code',
            referencedEntityName: InventoryProduct._id,
            referencedPropertyName: 'code'
        } as EntityProperty,
        product_name: {
            propType_: Pn.REFERENCE_TO,
            name: 'product_name',
            referencedEntityName: InventoryProduct._id,
            referencedPropertyName: 'name'
        } as EntityProperty,
        inventory_location: { name: 'inventory_location', propType_: Pn.STRING, allowNull: false } as EntityProperty,
        serial1: { name: 'serial1', propType_: Pn.STRING } as EntityProperty,
        serial2: { name: 'serial2', propType_: Pn.STRING } as EntityProperty,
        serial3: { name: 'serial3', propType_: Pn.STRING } as EntityProperty,
        serial4: { name: 'serial4', propType_: Pn.STRING } as EntityProperty,
        serial5: { name: 'serial5', propType_: Pn.STRING } as EntityProperty,
        serial6: { name: 'serial6', propType_: Pn.STRING } as EntityProperty,
        serial7: { name: 'serial7', propType_: Pn.STRING } as EntityProperty,
        install_date: { name: 'install_date', propType_: Pn.DATETIME } as EntityProperty,
        state: { name: 'state', propType_: Pn.STRING, allowNull: false } as EntityProperty,
        nb_piston_cycles: { name: 'nb_piston_cycles', propType_: Pn.STRING } as EntityProperty,
        brita_counter: { name: 'brita_counter', propType_: Pn.STRING } as EntityProperty,
        washing_cycles: { name: 'washing_cycles', propType_: Pn.STRING, } as EntityProperty,
    }
};


export const InventoryReceipt = {
    _id: 'InventoryReceipt',
    props: {
        items: {
            name: 'items', propType_: Pn.CHILD_TABLE,
            referencedEntityName: 'ReceiptItem', props: {}, isLargeTable: true
        } as EntityProperty,
    }
};

export const ReceiptItem = {
    _id: 'ReceiptItem',
    props: {
        _id: { name: "_id", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        product_id: { name: 'product_id', propType_: Pn.STRING, allowNull: false } as EntityProperty,
        quantity: { name: 'quantity', propType_: Pn.NUMBER, allowNull: false } as EntityProperty,
        units: {
            name: 'units',
            propType_: Pn.CHILD_TABLE,
            props: {
                unitCode: {
                    name: 'unit_code', propType_: Pn.REFERENCE_TO,
                    referencedEntityName: InventoryProductUnit._id,
                    referencedPropertyName: 'code'
                } as EntityProperty,
                unitSerial: {
                    name: 'unit_serial', propType_: Pn.REFERENCE_TO,
                    referencedEntityName: InventoryProductUnit._id,
                    referencedPropertyName: 'serial'
                } as EntityProperty,
            }
        } as EntityProperty,
    }
};


export const OrderItem = {
    _id: 'OrderItem',
    props: {
        _id: { name: "_id", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        product_id: { name: 'product_id', propType_: Pn.STRING, allowNull: false } as EntityProperty,
        quantity: { name: 'quantity', propType_: Pn.NUMBER, allowNull: false } as EntityProperty,
        error_quantity: { name: 'error_quantity', propType_: Pn.FORMULA, formula: '0 - 0' } as EntityProperty,
        client_stock: { name: 'client_stock', propType_: Pn.NUMBER } as EntityProperty,
        units: {
            name: 'units',
            propType_: Pn.CHILD_TABLE,
            props: {
                unitCode: {
                    name: 'unit_code', propType_: Pn.REFERENCE_TO,
                    referencedEntityName: InventoryProductUnit._id,
                    referencedPropertyName: 'code'
                } as EntityProperty,
                unitSerial: {
                    name: 'unit_serial', propType_: Pn.REFERENCE_TO,
                    referencedEntityName: InventoryProductUnit._id,
                    referencedPropertyName: 'serial'
                } as EntityProperty,
            }
        } as EntityProperty,
    },
    autoCorrectionsOnValidationFailed: {
        'ProductLocation!positiveStock': [
            { targetPropertyName: 'quantity', autoCorrectExpr: $s2e('MAX(0, quantity + $ROW$.available_stock__)') },
            { targetPropertyName: 'error_quantity', autoCorrectExpr: $s2e('ABS($OLD$.quantity - quantity)') },
        ],
    },
};


export const InventoryOrder = {
    _id: 'InventoryOrder',
    stateGraph: {
        nodes: ['PENDING', 'COMPLETE', 'APPROVED', 'PROCESSED', 'CANCELLED'],
        transitions: [
            { source: 'PENDING', target: 'COMPLETE' },
            { source: 'COMPLETE', target: 'APPROVED' },
            { source: 'APPROVED', target: 'PROCESSED' },
            { source: 'PENDING', target: 'CANCELLED' },
            { source: 'COMPLETE', target: 'CANCELLED' },
            { source: 'APPROVED', target: 'CANCELLED' },
        ]
    } as EntityStateGraph,
    props: {
        sales_agent: { name: 'sales_agent', propType_: Pn.STRING, allowNull: false } as EntityProperty,
        creation_date: { name: 'creation_date', propType_: Pn.DATETIME, allowNull: false } as EntityProperty,
        items: {
            name: 'items',
            propType_: Pn.CHILD_TABLE,
            referencedEntityName: OrderItem._id,
            props: {},
            isLargeTable: true,
        } as EntityProperty,
    }
};

export const Inventory = {
    _id: 'Inventory',
    pureNavGroupingChildren: [InventoryProduct._id, InventoryOrder._id, InventoryReceipt._id, InventoryProductUnit._id],
    props: {},
};

export { Reports } from './reports-metadata';

export const LargeSalesReport = {
    _id: "LargeSalesReport",
    props: {
        client: { name: "client", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        month: { name: "month", propType_: Pn.DATETIME } as EntityProperty,
        large_sales: {
            name: "large_sales",
            propType_: Pn.CHILD_TABLE,
            referencedEntityName: "LargeSalesProduct",
            isLargeTable: true,
            props: {},
        } as EntityProperty,
    }
};

export const LargeSalesProduct = {
    _id: "LargeSalesProduct",
    props: {
        product_id: { name: "product_id", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        product_name: { name: "product_name", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        large_sales_value: {
            name: "large_sales_value",
            propType_: Pn.FORMULA,
            formula: `SUMIF(OrderItem.quantity, product_id == @[product_id] && quantity > 100)`,
        } as FormulaProperty,
    }
}
