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
        gb: { name: "gb", propType_: Pn.STRING } as EntityProperty,
        fr: { name: "fr", propType_: Pn.STRING } as EntityProperty,
        de: { name: "de", propType_: Pn.STRING } as EntityProperty,
        it: { name: "it", propType_: Pn.STRING } as EntityProperty,
        es: { name: "es", propType_: Pn.STRING } as EntityProperty,
        pt: { name: "pl", propType_: Pn.STRING } as EntityProperty,
        gr: { name: "el", propType_: Pn.STRING } as EntityProperty,
        ro: { name: "ro", propType_: Pn.STRING } as EntityProperty,
        bg: { name: "bg", propType_: Pn.STRING } as EntityProperty,
        da: { name: "da", propType_: Pn.STRING } as EntityProperty,
        sv: { name: "sv", propType_: Pn.STRING } as EntityProperty,
        no: { name: "no", propType_: Pn.STRING } as EntityProperty,
        nl: { name: "nl", propType_: Pn.STRING } as EntityProperty,
    }
};

export const $Currency: Entity = {
    _id: "$Currency",
    props: {

        code: { name: "code", propType_: Pn.STRING } as EntityProperty,
    },
};