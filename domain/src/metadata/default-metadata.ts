import { Entity, Pn, EntityProperty } from "@domain/metadata/entity";

export const _$App = {
    _id: "$App",
    props: {
        _id: { name: "_id", propType_: Pn.STRING, allowNull: false } as EntityProperty,
    }
};
export const $App: Entity = _$App;
export type $AppObjT = {[K in keyof typeof _$App['props']]: string};

export const _$Page = {
    _id: "$Page",
    props: {
        _id: { name: "_id", propType_: Pn.STRING, allowNull: false } as EntityProperty,
    }
};
export const $Page: Entity = _$Page;
export type $PageObjT = {[K in keyof typeof _$Page['props']]: string};

export const _$Table = {
    _id: "$Table",
    props: {
        _id: { name: "_id", propType_: Pn.STRING, allowNull: false } as EntityProperty,
    }
};
export const $Table: Entity = _$Table;

export const _$User = {
    _id: "$User",
    props: {
        _id: { name: "_id", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        role: { name: "role", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        password: { name: "password", propType_: Pn.STRING } as EntityProperty,
        name: { name: "name", propType_: Pn.STRING } as EntityProperty,
        details: { name: "details", propType_: Pn.STRING } as EntityProperty,
    }
};
export const $User: Entity = _$User;
export type $UserObjT = {[K in keyof typeof _$User['props']]: string};

const _$Dictionary = {
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
export const $Dictionary: Entity = _$Dictionary;
export type $DictionaryObjT = {[K in keyof typeof _$Dictionary['props']]: string};

export const $Currency: Entity = {
    _id: "$Currency",
    props: {
        code: { name: "code", propType_: Pn.STRING } as EntityProperty,
    },
};

export const _$Icon = {
    _id: "$Icon",
    props: {
        _id: { name: "_id", propType_: Pn.STRING, allowNull: false } as EntityProperty,
    }
};
export const $Icon: Entity = _$Icon;
export type $IconObjT = {[K in keyof typeof _$Icon['props']]: string};

export const _$Image = {
    _id: "$Image",
    props: {
        _id: { name: "_id", propType_: Pn.STRING, allowNull: false } as EntityProperty,
    }
};
export const $Image: Entity = _$Image;
export type $ImageObjT = {[K in keyof typeof _$Image['props']]: string};

export function isMetadataEntity(tableName: string) {
    return [
        $Icon._id, 
        $Image._id, 
        $App._id, 
        $Table._id,
        $Page._id
    ].includes(tableName);
}

export function isDefaultEntity(tableName: string) {
    return isMetadataEntity(tableName) || [
        $User._id, 
        "$Role_TBD", 
        $Dictionary._id, 
    ].includes(tableName);
}
