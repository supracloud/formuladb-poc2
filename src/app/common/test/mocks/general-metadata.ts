import { Entity, Pn } from '../../domain/metadata/entity';


export const General = {
    type_: "Entity_", _id: "//General",
    module_: true,
};

export const General__Settings = {
    type_: "Entity_", _id: "General_Settings",
    name: { propType_: Pn.STRING },
    valueNumber: { propType_: Pn.NUMBER },
    valueText: { propType_: Pn.TEXT },
    valueDate: { propType_: Pn.DATETIME },
}

export const General__Actor = {
    type_: "Entity_", _id: "General_Actor",

    code: { propType_: Pn.STRING, "allowNull": false },
    username: { propType_: Pn.STRING },
    name: { propType_: Pn.STRING },
    role: { propType_: Pn.STRING },
    password: { propType_: Pn.STRING },
    details: { propType_: Pn.STRING },
    type: { propType_: Pn.STRING },
    parent_code: { propType_: Pn.STRING },
    param1: { propType_: Pn.STRING },
    state: { propType_: Pn.STRING, "allowNull": false, }

};

export const General__Currency = {
    type_: "Entity_", _id: "General_Currency",

    code: { propType_: Pn.STRING },
    rate1: { propType_: Pn.NUMBER },
    rate2: { propType_: Pn.NUMBER },
    rate3: { propType_: Pn.NUMBER },
    rate4: { propType_: Pn.NUMBER },
    rate5: { propType_: Pn.NUMBER, }

};

export const General__Person = {
    type_: "Entity_", _id: "General_Person",

    code: { propType_: Pn.STRING, "allowNull": false },
    actor_code: { propType_: Pn.STRING, "allowNull": false },
    name: { propType_: Pn.STRING },
    district: { propType_: Pn.STRING },
    city: { propType_: Pn.STRING },
    address: { propType_: Pn.STRING },
    supervisor: { propType_: Pn.STRING },
    manager: { propType_: Pn.STRING },
    phone: { propType_: Pn.STRING },
    fax: { propType_: Pn.STRING },
    tax_number: { propType_: Pn.STRING },
    details: { propType_: Pn.STRING },
    state: { propType_: Pn.STRING, "allowNull": false, }

};

export const General__User = {
    type_: "Entity_", _id: "General_User",

    code: { propType_: Pn.STRING, "allowNull": false },
    username: { propType_: Pn.STRING },
    name: { propType_: Pn.STRING },
    role: { propType_: Pn.STRING },
    password: { propType_: Pn.STRING },
    details: { propType_: Pn.STRING },
    type: { propType_: Pn.STRING },
    parent_code: { propType_: Pn.STRING },
    param1: { propType_: Pn.STRING },
    state: { propType_: Pn.STRING, "allowNull": false, }

};

export const General__Client = {
    type_: "Entity_", _id: "Inventory_Client",

    code: { propType_: Pn.STRING, "allowNull": false },
    username: { propType_: Pn.STRING },
    name: { propType_: Pn.STRING },
    role: { propType_: Pn.STRING },
    password: { propType_: Pn.STRING },
    details: { propType_: Pn.STRING },
    type: { propType_: Pn.STRING },
    parent_code: { propType_: Pn.STRING },
    param1: { propType_: Pn.STRING },
    state: { propType_: Pn.STRING, "allowNull": false, }

};
