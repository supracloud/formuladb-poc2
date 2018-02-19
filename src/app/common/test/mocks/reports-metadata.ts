import { Entity, Pn } from '../../domain/metadata/entity';
import { Inventory__Product, Inventory__ProductLocation } from './inventory-metadata';


export const Reports = {
    type_: "Entity_", _id: "/Reports",

    module_: true
};

export const Reports__DetailedCentralizerReport = {
    type_: "Entity_", _id: "/Reports/DetailedCentralizerReport",

    name: { propType_: Pn.STRING, "allowNull": false },
    user_code: { propType_: Pn.STRING, "allowNull": false },
    type: { propType_: Pn.STRING },
    group: { propType_: Pn.STRING },
    client_code: { propType_: Pn.STRING },
    file_name: { propType_: Pn.STRING },
    start_date: { propType_: Pn.DATETIME },
    end_date: { propType_: Pn.DATETIME },
    options: { propType_: Pn.STRING },
    flags: { propType_: Pn.NUMBER },
    last_user: { propType_: Pn.STRING },
    last_error: { propType_: Pn.STRING },
    state: { propType_: Pn.STRING, "allowNull": false },
    created_at: { propType_: Pn.DATETIME, "allowNull": false },
    updated_at: { propType_: Pn.DATETIME, "allowNull": false },
    exchange_rate: { propType_: Pn.NUMBER, }

};

export const Reports__GenericReport = {
    type_: "Entity_", _id: "/Reports/GenericReport",

    name: { propType_: Pn.STRING, "allowNull": false },
    user_code: { propType_: Pn.STRING, "allowNull": false },
    type: { propType_: Pn.STRING },
    group: { propType_: Pn.STRING },
    client_code: { propType_: Pn.STRING },
    file_name: { propType_: Pn.STRING },
    start_date: { propType_: Pn.DATETIME },
    end_date: { propType_: Pn.DATETIME },
    options: { propType_: Pn.STRING },
    flags: { propType_: Pn.NUMBER },
    last_user: { propType_: Pn.STRING },
    last_error: { propType_: Pn.STRING },
    state: { propType_: Pn.STRING, "allowNull": false },
    created_at: { propType_: Pn.DATETIME, "allowNull": false },
    updated_at: { propType_: Pn.DATETIME, "allowNull": false },
    exchange_rate: { propType_: Pn.NUMBER, }

};

export const Reports__ServiceCentralizerReport = {
    type_: "Entity_", _id: "/Forms/ServiceCentralizerReport",

    name: { propType_: Pn.STRING, "allowNull": false },
    user_code: { propType_: Pn.STRING, "allowNull": false },
    group: { propType_: Pn.STRING },
    client_code: { propType_: Pn.STRING },
    file_name: { propType_: Pn.STRING },
    start_date: { propType_: Pn.DATETIME },
    end_date: { propType_: Pn.DATETIME },
    options: { propType_: Pn.STRING },
    flags: { propType_: Pn.NUMBER },
    last_user: { propType_: Pn.STRING },
    last_error: { propType_: Pn.STRING },
    state: { propType_: Pn.STRING, "allowNull": false },
    created_at: { propType_: Pn.DATETIME, "allowNull": false },
    updated_at: { propType_: Pn.DATETIME, "allowNull": false },
    exchange_rate: { propType_: Pn.NUMBER, }

};

export const Reports__TestReport1 = {
    type_: "Entity_", _id: "/Reports/TestReport1",
    largeSalesPerProduct: {
        propType_: Pn.TABLE,
        product: {
            propType_: Pn.SUB_ENTITY,
            deepPath: Inventory__ProductLocation._id,
            snapshotCurrentValueOfProperties: [
                "../../code",
                "../../name",
                "locationCode",
                "price",
                "currency/code",
                "available_stock"
            ]
        },
        largeSalesValue: {
            propType_: Pn.FORMULA,
            formula: 'SUM(IF(itemsInOrderInInventory/reserved_quantity > 10, itemsInOrderInInventory/reserved_quantity, 0))'
        },
    },
};
