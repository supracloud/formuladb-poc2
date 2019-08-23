import { Entity, Pn, EntityProperty } from "@domain/metadata/entity";

export const $User: Entity = {
    _id: "$User",
    props: {
        _id: { name: "_id", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        role: { name: "role", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        password: { name: "password", propType_: Pn.STRING } as EntityProperty,
        name: { name: "name", propType_: Pn.STRING } as EntityProperty,
        details: { name: "details", propType_: Pn.STRING } as EntityProperty,
    }
};

export const $Dictionary: Entity = {
    _id: "$Dictionary",
    props: {
        _id: { name: "_id", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        en: { name: "en", propType_: Pn.STRING } as EntityProperty,
        ro: { name: "ro", propType_: Pn.STRING } as EntityProperty,
    }
};

export const $Currency: Entity = {
    _id: "$Currency",
    props: {

        code: { name: "code", propType_: Pn.STRING } as EntityProperty,
    },
};