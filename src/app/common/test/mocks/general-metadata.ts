import { Entity, PropertyTypeN } from '../../domain/metadata/entity';


export const General = {
    type_: "Entity_", _id: "/General",
    module_: true,
};

export const General__Actor = {
    type_: "Entity_", _id: "/General/Actor",

    code: { propType_: PropertyTypeN.STRING, "allowNull": false },
    username: { propType_: PropertyTypeN.STRING },
    name: { propType_: PropertyTypeN.STRING },
    role: { propType_: PropertyTypeN.STRING },
    password: { propType_: PropertyTypeN.STRING },
    details: { propType_: PropertyTypeN.STRING },
    type: { propType_: PropertyTypeN.STRING },
    parent_code: { propType_: PropertyTypeN.STRING },
    param1: { propType_: PropertyTypeN.STRING },
    state: { propType_: PropertyTypeN.STRING, "allowNull": false, }

};

export const General__Currency = {
    type_: "Entity_", _id: "/General/Currency",

    code: { propType_: PropertyTypeN.STRING },
    rate1: { propType_: PropertyTypeN.NUMBER },
    rate2: { propType_: PropertyTypeN.NUMBER },
    rate3: { propType_: PropertyTypeN.NUMBER },
    rate4: { propType_: PropertyTypeN.NUMBER },
    rate5: { propType_: PropertyTypeN.NUMBER, }

};

export const General__Person = {
    type_: "Entity_", _id: "/General/Person",

    code: { propType_: PropertyTypeN.STRING, "allowNull": false },
    actor_code: { propType_: PropertyTypeN.STRING, "allowNull": false },
    name: { propType_: PropertyTypeN.STRING },
    district: { propType_: PropertyTypeN.STRING },
    city: { propType_: PropertyTypeN.STRING },
    address: { propType_: PropertyTypeN.STRING },
    supervisor: { propType_: PropertyTypeN.STRING },
    manager: { propType_: PropertyTypeN.STRING },
    phone: { propType_: PropertyTypeN.STRING },
    fax: { propType_: PropertyTypeN.STRING },
    tax_number: { propType_: PropertyTypeN.STRING },
    details: { propType_: PropertyTypeN.STRING },
    state: { propType_: PropertyTypeN.STRING, "allowNull": false, }

};

export const General__User = {
    type_: "Entity_", _id: "/General/User",

    code: { propType_: PropertyTypeN.STRING, "allowNull": false },
    username: { propType_: PropertyTypeN.STRING },
    name: { propType_: PropertyTypeN.STRING },
    role: { propType_: PropertyTypeN.STRING },
    password: { propType_: PropertyTypeN.STRING },
    details: { propType_: PropertyTypeN.STRING },
    type: { propType_: PropertyTypeN.STRING },
    parent_code: { propType_: PropertyTypeN.STRING },
    param1: { propType_: PropertyTypeN.STRING },
    state: { propType_: PropertyTypeN.STRING, "allowNull": false, }

};

export const General__Client = {
    type_: "Entity_", _id: "/Inventory/Client",

    code: { propType_: PropertyTypeN.STRING, "allowNull": false },
    username: { propType_: PropertyTypeN.STRING },
    name: { propType_: PropertyTypeN.STRING },
    role: { propType_: PropertyTypeN.STRING },
    password: { propType_: PropertyTypeN.STRING },
    details: { propType_: PropertyTypeN.STRING },
    type: { propType_: PropertyTypeN.STRING },
    parent_code: { propType_: PropertyTypeN.STRING },
    param1: { propType_: PropertyTypeN.STRING },
    state: { propType_: PropertyTypeN.STRING, "allowNull": false, }

};
