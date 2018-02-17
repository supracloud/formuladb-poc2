import { Entity, Pn, typesafeDeepPath } from '../../domain/metadata/entity';
import { ExecutionPlan } from '../../domain/metadata/execution_plan';
import { Sn } from '../../domain/metadata/stored_procedure';

export const Inventory = {
    type_: "Entity_", _id: "/Inventory",

    module_: true
};

export const Inventory__Product = {
    type_: "Entity_", _id: "/Inventory/Product",

    code: { propType_: Pn.STRING, allowNull: false },
    barcode: { propType_: Pn.STRING },
    name: { propType_: Pn.STRING, allowNull: false },
    description: { propType_: Pn.STRING },
    inventoryLocation: {
        propType_: Pn.TABLE,
        locationCode: { propType_: Pn.STRING, allowNull: false, defaultValue: "DEFAULT-location" },
        category: { propType_: Pn.STRING, allowNull: false },
        price: { propType_: Pn.NUMBER, allowNull: true },
        currency: {
            propType_: Pn.REFERENCE_ENTITY,
            entity: {
                deepPath: "/General/Currency",
                snapshotCurrentValueOfProperties: ["code"],
            }
        },
        minimal_stock: { propType_: Pn.NUMBER, allowNull: false },
        received_stock: {
            propType_: Pn.FORMULA,
            formula: 'SUM(itemsInReceiptInInventory/received_quantity)'
        },
        available_stock: {
            propType_: Pn.FORMULA,
            formula: 'received_stock - reserved_stock - delivered_stock',
        },
        reserved_stock: {
            propType_: Pn.FORMULA,
            formula: 'SUM(itemsInOrderInInventory/reserved_quantity)'
        },
        delivered_stock: { propType_: Pn.NUMBER },
        moving_stock: { propType_: Pn.NUMBER, allowNull: false },
        state: { propType_: Pn.STRING, allowNull: false }

    }

};

export const Inventory__ProductUnit = {
    type_: "Entity_", _id: "/Inventory/ProductUnit",

    code: { propType_: Pn.STRING, allowNull: false },
    product: {
        propType_: Pn.REFERENCE_ENTITY, entity: {
            deepPath: "/Inventory/Product",
            snapshotCurrentValueOfProperties: [
                "code",
                "name",
                "price",
                "currency_code",
            ]
        }
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

    items: {
        propType_: Pn.TABLE,

        product: {
            propType_: Pn.REFERENCE_ENTITY,
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
        received_quantity: { propType_: Pn.NUMBER, allowNull: false },
        units: {
            propType_: Pn.TABLE,
            unit: { propType_: Pn.REFERENCE_ENTITY, entity: { deepPath: Inventory__ProductUnit._id, snapshotCurrentValueOfProperties: ["code", "serial"] } }
        },
    },
    executionPlan_: {
        items: `
            trigger(item.OLD, item.NEW) {
                product = STORE_getDataObj(item.product.ref_)
                product.NEW.received_stock = product.NEW.received_stock + item.NEW.received_quantity
                product.NEW.available_stock = product.NEW.received_stock - product.NEW.reserved_stock - product.NEW.delivered_stock
                SAVE(item.NEW)
                save(product.NEW)
            }
        `,
    } as ExecutionPlan,
};

export const Inventory__Order = {
    type_: "Entity_", _id: "/Inventory/Order",
    items: {
        propType_: Pn.TABLE,
        product: {
            propType_: Pn.REFERENCE_ENTITY,
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
        requested_quantity: { propType_: Pn.NUMBER, allowNull: false },
        reserved_quantity: {
            propType_: Pn.FORMULA,
            formula: 'if(./available_stock > ./requested_quantity, ./requested_quantity, ./available_stock)',
        },
        client_stock: { propType_: Pn.NUMBER },
        units: {
            propType_: Pn.TABLE,
            unit: { propType_: Pn.REFERENCE_ENTITY, entity: { deepPath: Inventory__ProductUnit._id, snapshotCurrentValueOfProperties: ["code", "serial"] } }
        },
    },
};
