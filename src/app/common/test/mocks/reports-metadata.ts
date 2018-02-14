import { Entity, PropertyTypeN } from '../../domain/metadata/entity';


export const Reports = {
    type_: "Entity_", _id: "/Reports",
    properties: {},
    module: true
};

export const Reports__DetailedCentralizerReport = {
    type_: "Entity_", _id: "/Reports/DetailedCentralizerReport",
    properties: { _id: { type: PropertyTypeN.STRING },
        name: { type: PropertyTypeN.STRING, "allowNull": false },
        user_code: { type: PropertyTypeN.STRING, "allowNull": false },
        type: { type: PropertyTypeN.STRING },
        group: { type: PropertyTypeN.STRING },
        client_code: { type: PropertyTypeN.STRING },
        file_name: { type: PropertyTypeN.STRING },
        start_date: { type: PropertyTypeN.DATETIME },
        end_date: { type: PropertyTypeN.DATETIME },
        options: { type: PropertyTypeN.STRING },
        flags: { type: PropertyTypeN.NUMBER },
        last_user: { type: PropertyTypeN.STRING },
        last_error: { type: PropertyTypeN.STRING },
        state: { type: PropertyTypeN.STRING, "allowNull": false },
        created_at: { type: PropertyTypeN.DATETIME, "allowNull": false },
        updated_at: { type: PropertyTypeN.DATETIME, "allowNull": false },
        exchange_rate: { type: PropertyTypeN.NUMBER, }
    }
};

export const Reports__GenericReport = {
    type_: "Entity_", _id: "/Reports/GenericReport",
    properties: { _id: { type: PropertyTypeN.STRING },
        name: { type: PropertyTypeN.STRING, "allowNull": false },
        user_code: { type: PropertyTypeN.STRING, "allowNull": false },
        type: { type: PropertyTypeN.STRING },
        group: { type: PropertyTypeN.STRING },
        client_code: { type: PropertyTypeN.STRING },
        file_name: { type: PropertyTypeN.STRING },
        start_date: { type: PropertyTypeN.DATETIME },
        end_date: { type: PropertyTypeN.DATETIME },
        options: { type: PropertyTypeN.STRING },
        flags: { type: PropertyTypeN.NUMBER },
        last_user: { type: PropertyTypeN.STRING },
        last_error: { type: PropertyTypeN.STRING },
        state: { type: PropertyTypeN.STRING, "allowNull": false },
        created_at: { type: PropertyTypeN.DATETIME, "allowNull": false },
        updated_at: { type: PropertyTypeN.DATETIME, "allowNull": false },
        exchange_rate: { type: PropertyTypeN.NUMBER, }
    }
};

export const Reports__ServiceCentralizerReport = {
    type_: "Entity_", _id: "/Forms/ServiceCentralizerReport",
    properties: { _id: { type: PropertyTypeN.STRING },
        name: { type: PropertyTypeN.STRING, "allowNull": false },
        user_code: { type: PropertyTypeN.STRING, "allowNull": false },
        group: { type: PropertyTypeN.STRING },
        client_code: { type: PropertyTypeN.STRING },
        file_name: { type: PropertyTypeN.STRING },
        start_date: { type: PropertyTypeN.DATETIME },
        end_date: { type: PropertyTypeN.DATETIME },
        options: { type: PropertyTypeN.STRING },
        flags: { type: PropertyTypeN.NUMBER },
        last_user: { type: PropertyTypeN.STRING },
        last_error: { type: PropertyTypeN.STRING },
        state: { type: PropertyTypeN.STRING, "allowNull": false },
        created_at: { type: PropertyTypeN.DATETIME, "allowNull": false },
        updated_at: { type: PropertyTypeN.DATETIME, "allowNull": false },
        exchange_rate: { type: PropertyTypeN.NUMBER, }
    }
};
