import { Entity, Pn } from '../../domain/metadata/entity';
import { ExecutionPlan } from '../../domain/metadata/execution_plan';
import { Sn } from '../../domain/metadata/stored_procedure';

export const Inventory = {
    type_: "Entity_", _id: "/Inventory",
    module_: true
};

export const Inventory__ProductLocation = {
    type_: "Entity_", _id: "/Inventory/ProductLocation",
    locationCode: { propType_: Pn.STRING, allowNull: false, defaultValue: "DEFAULT-location" },
    category: { propType_: Pn.STRING, allowNull: false },
    price: { propType_: Pn.NUMBER, allowNull: true },
    currency: {
        propType_: Pn.SUB_ENTITY,
        deepPath: "/General/Currency",
        snapshotCurrentValueOfProperties: ["code"],
    },
    minimal_stock: { propType_: Pn.NUMBER, allowNull: false },
    received_stock: {
        propType_: Pn.FORMULA,
        formula: 'SUM(receiptItems/quantity)'
    },
    available_stock: {
        propType_: Pn.FORMULA,
        formula: 'received_stock - ordered_stock',
        postConditions: {
            positiveStock: { condition: '> 0', errorValue: '0 - available_stock' }
        },
    },
    ordered_stock: {
        propType_: Pn.FORMULA,
        formula: 'SUM(orderItems/reserved_quantity)'
    },
    moving_stock: { propType_: Pn.NUMBER, allowNull: false },
    state: { propType_: Pn.STRING, allowNull: false },
};

export const Inventory__Product = {
    type_: "Entity_", _id: "/Inventory/Product",

    code: { propType_: Pn.STRING, allowNull: false },
    barcode: { propType_: Pn.STRING },
    name: { propType_: Pn.STRING, allowNull: false },
    description: { propType_: Pn.STRING },
    inventoryLocation: { propType_: Pn.TABLE, deepPath: Inventory__ProductLocation._id },
};

export const Inventory__ProductUnit = {
    type_: "Entity_", _id: "/Inventory/ProductUnit",

    code: { propType_: Pn.STRING, allowNull: false },
    product: {
        propType_: Pn.SUB_ENTITY,
        deepPath: "/Inventory/Product",
        snapshotCurrentValueOfProperties: [
            "code",
            "name",
            "price",
            "currency_code",
        ]

    },
    inventoryLocation: { propType_: Pn.STRING, allowNull: false },
    serial1: { propType_: Pn.STRING },
    serial2: { propType_: Pn.STRING },
    serial3: { propType_: Pn.STRING },
    serial4: { propType_: Pn.STRING },
    serial5: { propType_: Pn.STRING },
    serial6: { propType_: Pn.STRING },
    serial7: { propType_: Pn.STRING },
    install_date: { propType_: Pn.DATETIME },
    state: { propType_: Pn.STRING, allowNull: false },
    nb_piston_cycles: { propType_: Pn.STRING },
    brita_counter: { propType_: Pn.STRING },
    washing_cycles: { propType_: Pn.STRING, }

};


export const Inventory__Receipt = {
    type_: "Entity_", _id: "/Inventory/Receipt",
    items: { propType_: Pn.TABLE, deepPath: 'Inventory/ReceiptItem' },
};



export const Inventory__ReceiptItem = {
    type_: "Entity_", _id: "/Inventory/ReceiptItem",

    product: {
        propType_: Pn.SUB_ENTITY,
        deepPath: Inventory__ProductLocation._id,
        foreignKey: 'receiptItems',
        snapshotCurrentValueOfProperties: [
            "../../code",
            "../../name",
            "locationCode",
            "price",
            "currency/code",
        ]
    },
    quantity: { propType_: Pn.NUMBER, allowNull: false },
    units: {
        propType_: Pn.TABLE,
        unit: { propType_: Pn.SUB_ENTITY, deepPath: Inventory__ProductUnit._id, snapshotCurrentValueOfProperties: ["code", "serial"] }
    },
};


export const Inventory__Order = {
    type_: "Entity_", _id: "/Inventory/Order",
    items: {
        propType_: Pn.TABLE,
        deepPath: '/Inventory/OrderItem',
    },
};

export const Inventory__OrderItem = {
    type_: "Entity_", _id: "/Inventory/OrderItem",
    product: {
        propType_: Pn.SUB_ENTITY,
        deepPath: Inventory__ProductLocation._id,
        foreignKey: '',
        snapshotCurrentValueOfProperties: [
            "../../code",
            "../../name",
            "locationCode",
            "price",
            "currency/code",
            "available_stock"
        ]
    },
    quantity: {
        propType_: Pn.NUMBER, allowNull: false,
        autoCorrectOnPostConditionFailed: {
            'product/available_stock!positiveStock': ['quantity -= errorValue', 'error_quantity = errorValue'],
        },
    },
    error_quantity: { propType_: Pn.NUMBER },
    client_stock: { propType_: Pn.NUMBER },
    units: {
        propType_: Pn.TABLE,
        unit: { propType_: Pn.SUB_ENTITY, deepPath: Inventory__ProductUnit._id, snapshotCurrentValueOfProperties: ["code", "serial"] }
    },
};
