import { Entity, PropertyTypeN, Fnn } from '../../domain/metadata/entity';


export const General: Entity = {
    mwzType: "Entity_", _id: "General",
    properties: [],
    module: true
};

export const General__Actor: Entity = {
    mwzType: "Entity_", _id: "General__Actor",
    properties: [
        { name: "code", type: PropertyTypeN.STRING, "allowNull": false },
        { name: "username", type: PropertyTypeN.STRING },
        { name: "name", type: PropertyTypeN.STRING },
        { name: "role", type: PropertyTypeN.STRING },
        { name: "password", type: PropertyTypeN.STRING },
        { name: "details", type: PropertyTypeN.STRING },
        { name: "type", type: PropertyTypeN.STRING },
        { name: "parent_code", type: PropertyTypeN.STRING },
        { name: "param1", type: PropertyTypeN.STRING },
        { name: "state", type: PropertyTypeN.STRING, "allowNull": false, }
    ]
};

export const General__Currency: Entity = {
    mwzType: "Entity_", _id: "General__Currency",
    properties: [
        { name: "code", type: PropertyTypeN.STRING },
        { name: "rate1", type: PropertyTypeN.NUMBER },
        { name: "rate2", type: PropertyTypeN.NUMBER },
        { name: "rate3", type: PropertyTypeN.NUMBER },
        { name: "rate4", type: PropertyTypeN.NUMBER },
        { name: "rate5", type: PropertyTypeN.NUMBER, }
    ]
};

export const General__Person: Entity = {
    mwzType: "Entity_", _id: "General__Person",
    properties: [
        { name: "code", type: PropertyTypeN.STRING, "allowNull": false },
        { name: "actor_code", type: PropertyTypeN.STRING, "allowNull": false },
        { name: "name", type: PropertyTypeN.STRING },
        { name: "district", type: PropertyTypeN.STRING },
        { name: "city", type: PropertyTypeN.STRING },
        { name: "address", type: PropertyTypeN.STRING },
        { name: "supervisor", type: PropertyTypeN.STRING },
        { name: "manager", type: PropertyTypeN.STRING },
        { name: "phone", type: PropertyTypeN.STRING },
        { name: "fax", type: PropertyTypeN.STRING },
        { name: "tax_number", type: PropertyTypeN.STRING },
        { name: "details", type: PropertyTypeN.STRING },
        { name: "state", type: PropertyTypeN.STRING, "allowNull": false, }
    ]
};

export const General__User: Entity = {
    mwzType: "Entity_", _id: "General__User",
    properties: [
        { name: "code", type: PropertyTypeN.STRING, "allowNull": false },
        { name: "username", type: PropertyTypeN.STRING },
        { name: "name", type: PropertyTypeN.STRING },
        { name: "role", type: PropertyTypeN.STRING },
        { name: "password", type: PropertyTypeN.STRING },
        { name: "details", type: PropertyTypeN.STRING },
        { name: "type", type: PropertyTypeN.STRING },
        { name: "parent_code", type: PropertyTypeN.STRING },
        { name: "param1", type: PropertyTypeN.STRING },
        { name: "state", type: PropertyTypeN.STRING, "allowNull": false, }
    ]
};

export const General__Client: Entity = {
    mwzType: "Entity_", _id: "Inventory__Client",
    properties: [
        { name: "code", type: PropertyTypeN.STRING, "allowNull": false },
        { name: "username", type: PropertyTypeN.STRING },
        { name: "name", type: PropertyTypeN.STRING },
        { name: "role", type: PropertyTypeN.STRING },
        { name: "password", type: PropertyTypeN.STRING },
        { name: "details", type: PropertyTypeN.STRING },
        { name: "type", type: PropertyTypeN.STRING },
        { name: "parent_code", type: PropertyTypeN.STRING },
        { name: "param1", type: PropertyTypeN.STRING },
        { name: "state", type: PropertyTypeN.STRING, "allowNull": false, }
    ]
};
