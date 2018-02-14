import { Entity, PropertyTypeN } from '../../domain/metadata/entity';


export const Reports = {
    type_: "Entity_", _id: "/Reports",
    
    module_: true
};

export const Reports__DetailedCentralizerReport = {
    type_: "Entity_", _id: "/Reports/DetailedCentralizerReport",

    name: { propType_: PropertyTypeN.STRING, "allowNull": false },
    user_code: { propType_: PropertyTypeN.STRING, "allowNull": false },
    type: { propType_: PropertyTypeN.STRING },
    group: { propType_: PropertyTypeN.STRING },
    client_code: { propType_: PropertyTypeN.STRING },
    file_name: { propType_: PropertyTypeN.STRING },
    start_date: { propType_: PropertyTypeN.DATETIME },
    end_date: { propType_: PropertyTypeN.DATETIME },
    options: { propType_: PropertyTypeN.STRING },
    flags: { propType_: PropertyTypeN.NUMBER },
    last_user: { propType_: PropertyTypeN.STRING },
    last_error: { propType_: PropertyTypeN.STRING },
    state: { propType_: PropertyTypeN.STRING, "allowNull": false },
    created_at: { propType_: PropertyTypeN.DATETIME, "allowNull": false },
    updated_at: { propType_: PropertyTypeN.DATETIME, "allowNull": false },
    exchange_rate: { propType_: PropertyTypeN.NUMBER, }

};

export const Reports__GenericReport = {
    type_: "Entity_", _id: "/Reports/GenericReport",

    name: { propType_: PropertyTypeN.STRING, "allowNull": false },
    user_code: { propType_: PropertyTypeN.STRING, "allowNull": false },
    type: { propType_: PropertyTypeN.STRING },
    group: { propType_: PropertyTypeN.STRING },
    client_code: { propType_: PropertyTypeN.STRING },
    file_name: { propType_: PropertyTypeN.STRING },
    start_date: { propType_: PropertyTypeN.DATETIME },
    end_date: { propType_: PropertyTypeN.DATETIME },
    options: { propType_: PropertyTypeN.STRING },
    flags: { propType_: PropertyTypeN.NUMBER },
    last_user: { propType_: PropertyTypeN.STRING },
    last_error: { propType_: PropertyTypeN.STRING },
    state: { propType_: PropertyTypeN.STRING, "allowNull": false },
    created_at: { propType_: PropertyTypeN.DATETIME, "allowNull": false },
    updated_at: { propType_: PropertyTypeN.DATETIME, "allowNull": false },
    exchange_rate: { propType_: PropertyTypeN.NUMBER, }

};

export const Reports__ServiceCentralizerReport = {
    type_: "Entity_", _id: "/Forms/ServiceCentralizerReport",

    name: { propType_: PropertyTypeN.STRING, "allowNull": false },
    user_code: { propType_: PropertyTypeN.STRING, "allowNull": false },
    group: { propType_: PropertyTypeN.STRING },
    client_code: { propType_: PropertyTypeN.STRING },
    file_name: { propType_: PropertyTypeN.STRING },
    start_date: { propType_: PropertyTypeN.DATETIME },
    end_date: { propType_: PropertyTypeN.DATETIME },
    options: { propType_: PropertyTypeN.STRING },
    flags: { propType_: PropertyTypeN.NUMBER },
    last_user: { propType_: PropertyTypeN.STRING },
    last_error: { propType_: PropertyTypeN.STRING },
    state: { propType_: PropertyTypeN.STRING, "allowNull": false },
    created_at: { propType_: PropertyTypeN.DATETIME, "allowNull": false },
    updated_at: { propType_: PropertyTypeN.DATETIME, "allowNull": false },
    exchange_rate: { propType_: PropertyTypeN.NUMBER, }

};
