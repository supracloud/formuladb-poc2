import { Optional } from 'utility-types';
import { Entity, Pn, EntityProperty, Schema } from "@domain/metadata/entity";
import { parseDataObjId, DataObj, entityNameFromDataObjId } from './data_obj';
import { DefaultPageOptsForApp } from '@domain/url-utils';

export const _$App = {
    _id: "$App",
    props: {
        _id: { name: "_id", propType_: Pn.KEY, scalarFormula: 'name' } as EntityProperty,
        name: { name: "name", propType_: Pn.STRING, required: true } as EntityProperty,
        category: { name: "category", propType_: Pn.STRING, required: true } as EntityProperty,
        description: { name: "description", propType_: Pn.STRING, required: true } as EntityProperty,
        defaultLook: { name: "defaultLook", propType_: Pn.STRING } as EntityProperty,
        defaultPrimaryColor: { name: "defaultPrimaryColor", propType_: Pn.STRING } as EntityProperty,
        defaultSecondaryColor: { name: "defaultSecondaryColor", propType_: Pn.STRING } as EntityProperty,
        defaultTheme: { name: "defaultTheme", propType_: Pn.STRING } as EntityProperty,
    }
};
export const $App: Entity = _$App;
export type $AppObjT = {[K in keyof typeof _$App['props']]: string};
export const DefaultAppOpts = {
    defaultLook: DefaultPageOptsForApp.look,
    defaultPrimaryColor: DefaultPageOptsForApp.primaryColor,
    defaultSecondaryColor: DefaultPageOptsForApp.secondaryColor,
    defaultTheme: DefaultPageOptsForApp.theme,
};

export const _$Page = {
    _id: "$Page",
    props: {
        _id: { name: "_id", propType_: Pn.STRING, required: true } as EntityProperty,
        name: { name: "name", propType_: Pn.STRING, required: true } as EntityProperty,
        title: { name: "title", propType_: Pn.STRING, required: true } as EntityProperty,
        author: { name: "author", propType_: Pn.STRING, required: true } as EntityProperty,
        frmdb_display_date: { name: "display_date", propType_: Pn.STRING, required: true } as EntityProperty,
        description: { name: "description", propType_: Pn.STRING, required: true } as EntityProperty,
        screenshot: { name: "screenshot", propType_: Pn.STRING, required: true } as EntityProperty,
    }
};
export const $Page: Entity = _$Page;
export type $PageObjT = {[K in keyof typeof _$Page['props']]: string};

export const _$Table = {
    _id: "$Table",
    props: {
        _id: { name: "_id", propType_: Pn.STRING, required: true } as EntityProperty,
    }
};
export const $Table: Entity = _$Table;

export const _$FrmdbEnv = {
    _id: "$FrmdbEnv",
    props: {
        _id: { name: "_id", propType_: Pn.STRING, required: true } as EntityProperty,
        default_app_name: { name: "default_app_name", propType_: Pn.STRING, required: true } as EntityProperty,
        _owner: { name: "_owner", propType_: Pn.STRING, required: true } as EntityProperty,
        _role: { name: "_role", propType_: Pn.STRING, required: true } as EntityProperty,
        _rev: { name: "_rev", propType_: Pn.STRING, required: true } as EntityProperty,
    }
};
export const $FrmdbEnv: Entity = _$FrmdbEnv;
export type $FrmdbEnvObjT = {[K in keyof typeof _$FrmdbEnv['props']]: string};

export const _$User = {
    _id: "$User",
    props: {
        _id: { name: "_id", propType_: Pn.STRING, required: true } as EntityProperty,
        role: { name: "role", propType_: Pn.STRING, required: true } as EntityProperty,
        password: { name: "password", propType_: Pn.STRING } as EntityProperty,
        name: { name: "name", propType_: Pn.STRING } as EntityProperty,
        details: { name: "details", propType_: Pn.STRING } as EntityProperty,
    }
};
export const $User: Entity = _$User;
export type $UserObjT = {[K in keyof typeof _$User['props']]: string};

export const _$Permission = {
    _id: "$Permission",
    props: {
        _id: { name: "_id", propType_: Pn.STRING, required: true } as EntityProperty,
        role: { name: "role", propType_: Pn.STRING } as EntityProperty,
        app_name: { name: "app_name", propType_: Pn.STRING, required: true } as EntityProperty,
        resource_entity_id: { name: "resource_entity_id", propType_: Pn.STRING, required: true } as EntityProperty,
        resource_id: { name: "resource_id", propType_: Pn.STRING } as EntityProperty,
        permission: { name: "permission", propType_: Pn.STRING, enumValues: ["READ", "WRITE", "DELETE"]} as EntityProperty,
        for_who: { name: "for_who", propType_: Pn.STRING, enumValues: ["OWNER", "ROLE", "ALL"]} as EntityProperty,
        details: { name: "details", propType_: Pn.STRING } as EntityProperty,
    }
};
export type PermissionType = "0READ" | "2PREVIEWEDIT" | "5WRITE" | "7DELETE";
export const $Permission: Entity = _$Permission;
type PermissionWithEnums = {[K in keyof typeof _$Permission['props']]: string} 
    & {permission: PermissionType, resource_entity_id: "$ALL_RESOURCES$" | string} 
    & {for_who: "OWNER" | "ROLE" | "ALL"}
;
export type $PermissionObjT = Optional<PermissionWithEnums,"resource_id" | "details">;

export const _$System_Param = {
    _id: "$System_Param",
    isEditable: true,
    props: {
        _id: { name: "_id", propType_: Pn.KEY, scalarFormula: "name" } as EntityProperty,
        name: { name: "name", propType_: Pn.STRING, required: true } as EntityProperty,
        value: { name: "value", propType_: Pn.STRING, required: true } as EntityProperty,
    }
};
export const $System_Param: Entity = _$System_Param;
export type $System_ParamObjT = {[K in keyof typeof _$System_Param['props']]: string};

const _$Dictionary = {
    _id: "$Dictionary",
    props: {
        _id: { name: "_id", propType_: Pn.STRING, required: true } as EntityProperty,
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
        _id: { name: "_id", propType_: Pn.STRING } as EntityProperty,
        code: { name: "code", propType_: Pn.STRING } as EntityProperty,
    },
};

export const _$Icon = {
    _id: "$Icon",
    props: {
        _id: { name: "_id", propType_: Pn.STRING, required: true } as EntityProperty,
    }
};
export const $Icon: Entity = _$Icon;
export type $IconObjT = {[K in keyof typeof _$Icon['props']]: string};

export const _$Image = {
    _id: "$Image",
    props: {
        _id: { name: "_id", propType_: Pn.STRING, required: true } as EntityProperty,
    }
};
export const $Image: Entity = _$Image;
export type $ImageObjT = {[K in keyof typeof _$Image['props']]: string};

const MetadataEntities = [
    // $User, //WTF node crash
    $Icon, 
    $Image, 
    $App, 
    $Table,
    $Page,
    $System_Param,
    $Permission,
];
const MetadataEntityNames = MetadataEntities.map(e => e._id);
const MetadataStoreName = [$App._id, $Image._id, $Icon._id, $Page._id, $Table._id];
export function isMetadataEntity(tableName: string) {
    return MetadataEntityNames.includes(tableName);
}
export function isMetadataStoreEntity(tableName: string) {
    return MetadataStoreName.includes(tableName);
}
export function isMetadataStoreObject(obj: DataObj) {
    let tableName = entityNameFromDataObjId(obj._id);
    return isMetadataStoreEntity(tableName);
}
export function isMetadataObject(obj: DataObj) {
    let tableName = entityNameFromDataObjId(obj._id);
    return MetadataEntityNames.includes(tableName);
}

export function getDefaultEntity(path: string): Entity | null {
    return MetadataEntities.filter(e => e._id === path)[0];
}

export const DefaultSchema: Schema = {
    _id: 'FRMDB_SCHEMA~~DefaultSchema',
    entities: MetadataEntities.reduce((acc, m) => {acc[m._id] = m; return acc}, {})
}

export const AuthSchema: Schema = {
    _id: 'FRMDB_SCHEMA~~AuthSchema',
    entities: {
        [$User._id]: $User,
        [$Permission._id]: $Permission,
    }
}
