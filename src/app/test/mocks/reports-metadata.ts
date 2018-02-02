import { Entity, PropertyTypeN, Fnn } from '../../domain/metadata/entity';


export const Reports: Entity = {
    mwzType: "Entity_", _id: "Reports",
    properties: [],
    module: true
};

export const Reports__DetailedCentralizerReport: Entity = {
    mwzType: "Entity_", _id: "Reports__DetailedCentralizerReport",
    properties: [
        { name: "name", type: PropertyTypeN.STRING, "allowNull": false },
        { name: "user_code", type: PropertyTypeN.STRING, "allowNull": false },
        { name: "type", type: PropertyTypeN.STRING },
        { name: "group", type: PropertyTypeN.STRING },
        { name: "client_code", type: PropertyTypeN.STRING },
        { name: "file_name", type: PropertyTypeN.STRING },
        { name: "start_date", type: PropertyTypeN.DATETIME },
        { name: "end_date", type: PropertyTypeN.DATETIME },
        { name: "options", type: PropertyTypeN.STRING },
        { name: "flags", type: PropertyTypeN.NUMBER },
        { name: "last_user", type: PropertyTypeN.STRING },
        { name: "last_error", type: PropertyTypeN.STRING },
        { name: "state", type: PropertyTypeN.STRING, "allowNull": false },
        { name: "created_at", type: PropertyTypeN.DATETIME, "allowNull": false },
        { name: "updated_at", type: PropertyTypeN.DATETIME, "allowNull": false },
        { name: "exchange_rate", type: PropertyTypeN.NUMBER, }
    ]
};

export const Reports__GenericReport: Entity = {
    mwzType: "Entity_", _id: "Reports__GenericReport",
    properties: [
        { name: "name", type: PropertyTypeN.STRING, "allowNull": false },
        { name: "user_code", type: PropertyTypeN.STRING, "allowNull": false },
        { name: "type", type: PropertyTypeN.STRING },
        { name: "group", type: PropertyTypeN.STRING },
        { name: "client_code", type: PropertyTypeN.STRING },
        { name: "file_name", type: PropertyTypeN.STRING },
        { name: "start_date", type: PropertyTypeN.DATETIME },
        { name: "end_date", type: PropertyTypeN.DATETIME },
        { name: "options", type: PropertyTypeN.STRING },
        { name: "flags", type: PropertyTypeN.NUMBER },
        { name: "last_user", type: PropertyTypeN.STRING },
        { name: "last_error", type: PropertyTypeN.STRING },
        { name: "state", type: PropertyTypeN.STRING, "allowNull": false },
        { name: "created_at", type: PropertyTypeN.DATETIME, "allowNull": false },
        { name: "updated_at", type: PropertyTypeN.DATETIME, "allowNull": false },
        { name: "exchange_rate", type: PropertyTypeN.NUMBER, }
    ]
};

