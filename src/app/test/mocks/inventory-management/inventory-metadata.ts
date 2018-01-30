import { Entity, PropertyTypeN, FormulaTypeN } from '../../../domain/metadata/entity';

export var Inventory: Entity = {
    mwzType: "Entity_", _id: "Inventory",
    properties: [],
    module: true
};

export var Inventory__InventoryProduct: Entity = {
    mwzType: "Entity_", _id: "Inventory__InventoryProduct",
    properties: [
        { name: "inventory_code", type: PropertyTypeN.STRING, allowNull: false },
        {
            name: "product", type: PropertyTypeN.REFERENCE_ENTITY,
            entity: {
                path: "Inventory__Product",
                copiedProperties: ["code", "name"],
            }
        },
        { name: "category", type: PropertyTypeN.STRING, allowNull: false },
        { name: "price", type: PropertyTypeN.NUMBER, allowNull: true },
        {
            name: "currency", type: PropertyTypeN.REFERENCE_ENTITY,
            entity: {
                path: "General__Currency",
                copiedProperties: ["code", "name"],
            }
        },
        { name: "minimal_stock", type: PropertyTypeN.NUMBER, allowNull: false },
        {
            name: "received_stock", type: PropertyTypeN.FORMULA,
            formula: {
                type: FormulaTypeN.SUM,
                arguments: [{ type: FormulaTypeN.VALUE_OF, property: "receiptItems.received_quantity" }]
            }
        },
        {
            name: "available_stock", type: PropertyTypeN.FORMULA,
            formula: {
                type: FormulaTypeN.SUBTRACT,
                minuend: { type: FormulaTypeN.VALUE_OF, property: "received_stock" },
                subtrahends: [
                    { type: FormulaTypeN.VALUE_OF, property: "reserved_stock" },
                    { type: FormulaTypeN.VALUE_OF, property: "delivered_stock" }
                ]
            }
        },
        {
            name: "reserved_stock", type: PropertyTypeN.FORMULA,
            formula: {
                type: FormulaTypeN.SUM,
                arguments: [{ type: FormulaTypeN.VALUE_OF, property: "orderItems.reserved_quantity" }]
            }
        },
        { name: "delivered_stock", type: PropertyTypeN.NUMBER },
        { name: "moving_stock", type: PropertyTypeN.NUMBER, allowNull: false },
        { name: "state", type: PropertyTypeN.STRING, allowNull: false }
    ]
};

export var Inventory__ReceiptItem: Entity = {
    mwzType: "Entity_", _id: "Inventory__ReceiptItem",
    properties: [
        {
            name: "product",
            type: PropertyTypeN.REFERENCE_ENTITY,
            entity: {
                path: "Inventory__InventoryProduct",
                copiedProperties: [
                    "inventory_code",
                    "product_code",
                    "price",
                    "currency_code",
                    "name"
                ]
            }
        },
        { name: "received_quantity", type: PropertyTypeN.NUMBER, allowNull: false },
    ]
};

export var Inventory__OrderItem: Entity = {
    mwzType: "Entity_", _id: "Inventory__OrderItem",
    properties: [
        {
            name: "product",
            type: PropertyTypeN.REFERENCE_ENTITY,
            entity: {
                path: "Inventory__InventoryProduct",
                copiedProperties: [
                    "inventory_code",
                    "product_code",
                    "price",
                    "currency_code",
                    "name"
                ]
            }
        },
        { name: "requested_quantity", type: PropertyTypeN.NUMBER, allowNull: false },
        {
            name: "reserved_quantity",
            type: PropertyTypeN.FORMULA,
            formula: {
                type: FormulaTypeN.CHAIN,
                steps: [
                    { formula: { type: FormulaTypeN.CURRENT_VALUE_OF, property: "product.available_stock" }, alias: "stock" },
                    {
                        formula: {
                            type: FormulaTypeN.IF,
                            expression: null,//stock < requested_quantity
                            trueValue: null,//requested_quantity
                            falseValue: null//stock
                        }
                    }
                ]
            }
        },
        { name: "client_stock", type: PropertyTypeN.NUMBER },
    ]
};

export var Inventory__ProductListProductUnit: Entity = {
    mwzType: "Entity_", _id: "Inventory__ProductListProductUnit",
    properties: [
        { name: "product_list_product_id", type: PropertyTypeN.NUMBER, allowNull: false },
        { name: "sy5_index", type: PropertyTypeN.NUMBER, allowNull: false },
        { name: "product_unit_code", type: PropertyTypeN.STRING },
        { name: "product_code", type: PropertyTypeN.STRING },
        { name: "manual_product_code", type: PropertyTypeN.STRING, allowNull: false },
        { name: "manual_product_serial", type: PropertyTypeN.STRING, allowNull: false },
        { name: "state", type: PropertyTypeN.STRING, allowNull: false, }
    ]
};

export var Inventory__Product: Entity = {
    mwzType: "Entity_", _id: "Inventory__Product",
    properties: [
        { name: "code", type: PropertyTypeN.STRING, allowNull: false },
        { name: "barcode", type: PropertyTypeN.STRING },
        { name: "name", type: PropertyTypeN.STRING, allowNull: false },
        { name: "description", type: PropertyTypeN.STRING },
    ]
};

export var Inventory__ProductUnit: Entity = {
    mwzType: "Entity_", _id: "Inventory__ProductUnit",
    properties: [
        { name: "code", type: PropertyTypeN.STRING, allowNull: false },
        { name: "product_code", type: PropertyTypeN.STRING, allowNull: false },
        { name: "location", type: PropertyTypeN.STRING, allowNull: false },
        { name: "serial1", type: PropertyTypeN.STRING },
        { name: "serial2", type: PropertyTypeN.STRING },
        { name: "serial3", type: PropertyTypeN.STRING },
        { name: "serial4", type: PropertyTypeN.STRING },
        { name: "serial5", type: PropertyTypeN.STRING },
        { name: "serial6", type: PropertyTypeN.STRING },
        { name: "serial7", type: PropertyTypeN.STRING },
        { name: "install_date", type: PropertyTypeN.DATETIME },
        { name: "state", type: PropertyTypeN.STRING, allowNull: false },
        { name: "nb_piston_cycles", type: PropertyTypeN.STRING },
        { name: "brita_counter", type: PropertyTypeN.STRING },
        { name: "washing_cycles", type: PropertyTypeN.STRING, }
    ]
};

