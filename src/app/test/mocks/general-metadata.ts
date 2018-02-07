import { Entity, PropertyTypeN } from '../../domain/metadata/entity';


export const General: Entity = {
    type_: "Entity_", _id: "General",
    properties: {},
    module: true
};

export const General__Actor: Entity = {
    type_: "Entity_", _id: "General/Actor",
    properties: {
        code: { type: PropertyTypeN.STRING, "allowNull": false },
        username: { type: PropertyTypeN.STRING },
        name: { type: PropertyTypeN.STRING },
        role: { type: PropertyTypeN.STRING },
        password: { type: PropertyTypeN.STRING },
        details: { type: PropertyTypeN.STRING },
        type: { type: PropertyTypeN.STRING },
        parent_code: { type: PropertyTypeN.STRING },
        param1: { type: PropertyTypeN.STRING },
        state: { type: PropertyTypeN.STRING, "allowNull": false, }
    }
};

export const General__Currency: Entity = {
    type_: "Entity_", _id: "General/Currency",
    properties: {
        code: { type: PropertyTypeN.STRING },
        rate1: { type: PropertyTypeN.NUMBER },
        rate2: { type: PropertyTypeN.NUMBER },
        rate3: { type: PropertyTypeN.NUMBER },
        rate4: { type: PropertyTypeN.NUMBER },
        rate5: { type: PropertyTypeN.NUMBER, }
    }
};

export const General__Person: Entity = {
    type_: "Entity_", _id: "General/Person",
    properties: {
        code: { type: PropertyTypeN.STRING, "allowNull": false },
        actor_code: { type: PropertyTypeN.STRING, "allowNull": false },
        name: { type: PropertyTypeN.STRING },
        district: { type: PropertyTypeN.STRING },
        city: { type: PropertyTypeN.STRING },
        address: { type: PropertyTypeN.STRING },
        supervisor: { type: PropertyTypeN.STRING },
        manager: { type: PropertyTypeN.STRING },
        phone: { type: PropertyTypeN.STRING },
        fax: { type: PropertyTypeN.STRING },
        tax_number: { type: PropertyTypeN.STRING },
        details: { type: PropertyTypeN.STRING },
        state: { type: PropertyTypeN.STRING, "allowNull": false, }
    }
};

export const General__User: Entity = {
    type_: "Entity_", _id: "General/User",
    properties: {
        code: { type: PropertyTypeN.STRING, "allowNull": false },
        username: { type: PropertyTypeN.STRING },
        name: { type: PropertyTypeN.STRING },
        role: { type: PropertyTypeN.STRING },
        password: { type: PropertyTypeN.STRING },
        details: { type: PropertyTypeN.STRING },
        type: { type: PropertyTypeN.STRING },
        parent_code: { type: PropertyTypeN.STRING },
        param1: { type: PropertyTypeN.STRING },
        state: { type: PropertyTypeN.STRING, "allowNull": false, }
    }
};

export const General__Client: Entity = {
    type_: "Entity_", _id: "Inventory/Client",
    properties: {
        code: { type: PropertyTypeN.STRING, "allowNull": false },
        username: { type: PropertyTypeN.STRING },
        name: { type: PropertyTypeN.STRING },
        role: { type: PropertyTypeN.STRING },
        password: { type: PropertyTypeN.STRING },
        details: { type: PropertyTypeN.STRING },
        type: { type: PropertyTypeN.STRING },
        parent_code: { type: PropertyTypeN.STRING },
        param1: { type: PropertyTypeN.STRING },
        state: { type: PropertyTypeN.STRING, "allowNull": false, }
    }
};
