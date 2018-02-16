import { Entity, PropertyTypeN, typesafeDeepPath } from '../../domain/metadata/entity';
import { ExecutionPlan } from '../../domain/metadata/execution_plan';

export const Inventory = {
    type_: "Entity_", _id: "/Inventory",

    module_: true
};

export const Inventory__Product = {
    type_: "Entity_", _id: "/Inventory/Product",

    code: { propType_: PropertyTypeN.STRING, allowNull: false },
    barcode: { propType_: PropertyTypeN.STRING },
    name: { propType_: PropertyTypeN.STRING, allowNull: false },
    description: { propType_: PropertyTypeN.STRING },
    inventoryLocation: {
        propType_: PropertyTypeN.TABLE,
        locationCode: { propType_: PropertyTypeN.STRING, allowNull: false, defaultValue: "DEFAULT-location" },
        category: { propType_: PropertyTypeN.STRING, allowNull: false },
        price: { propType_: PropertyTypeN.NUMBER, allowNull: true },
        currency: {
            propType_: PropertyTypeN.REFERENCE_ENTITY,
            entity: {
                deepPath: "/General/Currency",
                snapshotCurrentValueOfProperties: ["code"],
            }
        },
        minimal_stock: { propType_: PropertyTypeN.NUMBER, allowNull: false },
        received_stock: {
            propType_: PropertyTypeN.FORMULA,
            formula: {
                SUM: [{ EXPRESSION: "itemsInReceipt.received_quantity" }]
            }
        },
        available_stock: {
            propType_: PropertyTypeN.FORMULA,
            formula: {
                EXPRESSION: 'received_stock - reserved_stock - delivered_stock'
            }
        },
        reserved_stock: {
            propType_: PropertyTypeN.FORMULA,
            formula: {
                SUM: [{ EXPRESSION: "itemsInOrder.reserved_quantity" }]
            }
        },
        delivered_stock: { propType_: PropertyTypeN.NUMBER },
        moving_stock: { propType_: PropertyTypeN.NUMBER, allowNull: false },
        state: { propType_: PropertyTypeN.STRING, allowNull: false }

    }

};

export const Inventory__ProductUnit = {
    type_: "Entity_", _id: "/Inventory/ProductUnit",

    code: { propType_: PropertyTypeN.STRING, allowNull: false },
    product: {
        propType_: PropertyTypeN.REFERENCE_ENTITY, entity: {
            deepPath: "/Inventory/Product",
            snapshotCurrentValueOfProperties: [
                "code",
                "name",
                "price",
                "currency_code",
            ]
        }
    },
    inventoryLocation: { propType_: PropertyTypeN.STRING, allowNull: false },
    serial1: { propType_: PropertyTypeN.STRING },
    serial2: { propType_: PropertyTypeN.STRING },
    serial3: { propType_: PropertyTypeN.STRING },
    serial4: { propType_: PropertyTypeN.STRING },
    serial5: { propType_: PropertyTypeN.STRING },
    serial6: { propType_: PropertyTypeN.STRING },
    serial7: { propType_: PropertyTypeN.STRING },
    install_date: { propType_: PropertyTypeN.DATETIME },
    state: { propType_: PropertyTypeN.STRING, allowNull: false },
    nb_piston_cycles: { propType_: PropertyTypeN.STRING },
    brita_counter: { propType_: PropertyTypeN.STRING },
    washing_cycles: { propType_: PropertyTypeN.STRING, }

};

console.log("typesafeDeepPath=", typesafeDeepPath);

export const Inventory__Receipt = {
    type_: "Entity_", _id: "/Inventory/Receipt",

    items: {
        propType_: PropertyTypeN.TABLE,

        product: {
            propType_: PropertyTypeN.REFERENCE_ENTITY,
            entity: {
                deepPath: typesafeDeepPath(Inventory__Product._id, Inventory__Product, 'inventoryLocation', '@'),
                snapshotCurrentValueOfProperties: [
                    "../../code",
                    "../../name",
                    "locationCode",
                    "price",
                    "currency/code",
                ]
            }
        },
        received_quantity: { propType_: PropertyTypeN.NUMBER, allowNull: false },
        units: {
            propType_: PropertyTypeN.TABLE,
            unit: { propType_: PropertyTypeN.REFERENCE_ENTITY, entity: { deepPath: Inventory__ProductUnit._id, snapshotCurrentValueOfProperties: ["code", "serial"] } }
        },
    },
    executionPlan_: {
        FOREACH: {
            relativePath: './items',
            nested: [
                { RESOLVE_REFS: '' },
                { EVAL_EXPRESSIONS: '' },
            ]
        },
        SAVE_DIRTY_OBJECTS: '',
    } as ExecutionPlan,
};

export const Inventory__Order = {
    type_: "Entity_", _id: "/Inventory/Order",
    items: {
        propType_: PropertyTypeN.TABLE,
        product: {
            propType_: PropertyTypeN.REFERENCE_ENTITY,
            entity: {
                deepPath: typesafeDeepPath(Inventory__Product._id, Inventory__Product, 'inventoryLocation', '@'),
                snapshotCurrentValueOfProperties: [
                    "../../code",
                    "../../name",
                    "locationCode",
                    "price",
                    "currency/code",
                    "available_stock"
                ]
            }
        },
        requested_quantity: { propType_: PropertyTypeN.NUMBER, allowNull: false },
        reserved_quantity: {
            propType_: PropertyTypeN.FORMULA,
            formula: { EXPRESSION: 'if(./available_stock > ./requested_quantity, ./requested_quantity, ./available_stock)' }
        },
        client_stock: { propType_: PropertyTypeN.NUMBER },
        units: {
            propType_: PropertyTypeN.TABLE,
            unit: { propType_: PropertyTypeN.REFERENCE_ENTITY, entity: { deepPath: Inventory__ProductUnit._id, snapshotCurrentValueOfProperties: ["code", "serial"] } }
        },
    },
    executionPlan_: {
        items: `
            item_before, item
            product,location = STORE.getWithDeepPath(item.product.ref_) ;
            item.available_stock = location.available_stock - item.reserved_quantity.lhs
        `,
    } as ExecutionPlan,
};
