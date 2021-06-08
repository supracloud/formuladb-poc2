import { Optional } from 'utility-types';
import { Entity, Pn, EntityProperty, Schema } from "@domain/metadata/entity";
import { parseDataObjId, DataObj, entityNameFromDataObjId } from './data_obj';
import { DefaultPageLookAndThemeApp } from '@domain/url-utils';
import { PickOmit } from '@domain/ts-utils';
import { KeyValueObjIdType, KeyValueObj } from '@domain/key_value_obj';

export const _$App = {
    _id: "$App",
    props: {
        _id: { name: "_id", propType_: Pn.KEY, scalarFormula: 'name' } as EntityProperty,
        name: { name: "name", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
        category: { name: "category", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
        status: { name: "status", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
        info: { name: "info", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
        is_default_app: { name: "is_default_app", propType_: Pn.INPUT, actualType: {name: "BooleanType"}, required: false } as EntityProperty,
        default_lang: { name: "default_lang", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: false } as EntityProperty,
        default_page: { name: "default_lang", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: false } as EntityProperty,
        description: { name: "description", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
        defaultLook: { name: "defaultLook", propType_: Pn.INPUT, actualType: {name: "TextType"} } as EntityProperty,
        defaultPrimaryColor: { name: "defaultPrimaryColor", propType_: Pn.INPUT, actualType: {name: "TextType"} } as EntityProperty,
        defaultSecondaryColor: { name: "defaultSecondaryColor", propType_: Pn.INPUT, actualType: {name: "TextType"} } as EntityProperty,
        defaultTheme: { name: "defaultTheme", propType_: Pn.INPUT, actualType: {name: "TextType"} } as EntityProperty,
    }
};
export const $App: Entity = _$App;
export type $AppObjTOptional = Optional<{[K in keyof typeof _$App['props']]: string}, "status" | "info" | "is_default_app" | 'default_lang'>;
export type $AppObjT = PickOmit<{[K in keyof $AppObjTOptional]: string}, 'is_default_app' | 'default_page'> & { is_default_app?: boolean, default_page?: string };
export const DefaultAppOpts = {
    defaultLook: DefaultPageLookAndThemeApp.look,
    defaultPrimaryColor: DefaultPageLookAndThemeApp.primaryColor,
    defaultSecondaryColor: DefaultPageLookAndThemeApp.secondaryColor,
    defaultTheme: DefaultPageLookAndThemeApp.theme,
};

export const _$Page = {
    _id: "$Page",
    props: {
        _id: { name: "_id", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
        name: { name: "name", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
        title: { name: "title", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
        author: { name: "author", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
        frmdb_display_date: { name: "frmdb_display_date", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
        frmdb_featured_page_order: { name: "frmdb_featured_page_order", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
        description: { name: "description", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
        screenshot: { name: "screenshot", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
        frmdb_look: { name: "frmdb_look", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
        frmdb_primary_color: { name: "frmdb_primary_color", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
        frmdb_secondary_color: { name: "frmdb_secondary_color", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
        frmdb_theme: { name: "frmdb_theme", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
        template_url: { name: "template_url", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
    }
};
export const $Page: Entity = _$Page;
export type $PageObjT = Optional<{[K in keyof typeof _$Page['props']]: string}, 'template_url'>;

export const _$Table = {
    _id: "$Table",
    props: {
        _id: { name: "_id", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
    }
};
export const $Table: Entity = _$Table;

export const _$User = {
    _id: "$User",
    props: {
        _id: { name: "_id", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
        role: { name: "role", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
        password: { name: "password", propType_: Pn.INPUT, actualType: {name: "TextType"} } as EntityProperty,
        name: { name: "name", propType_: Pn.INPUT, actualType: {name: "TextType"} } as EntityProperty,
        details: { name: "details", propType_: Pn.INPUT, actualType: {name: "TextType"} } as EntityProperty,
        envname: { name: "envname", propType_: Pn.INPUT, actualType: {name: "TextType"} } as EntityProperty,
        subscription_type: { name: "subscription_type", propType_: Pn.INPUT, actualType: {name: "TextType"} } as EntityProperty,
        subscription_state: { name: "subscription_state", propType_: Pn.INPUT, actualType: {name: "TextType"} } as EntityProperty,
        verification_token: { name: "verification_token", propType_: Pn.INPUT, actualType: {name: "TextType"} } as EntityProperty,
        nb_seats: { name: "nb_seats", propType_: Pn.INPUT, actualType: {name: "NumberType"} } as EntityProperty,
    }
};
export const $User: Entity = _$User;
export type $UserObjT = PickOmit<{[K in keyof typeof _$User['props']]: string}, 'nb_seats' | '_id'>& { nb_seats: number, _id: KeyValueObjIdType };

// export const _$Subscription = {
//     _id: "$Subscription",
//     props: {
//         _id: { name: "_id", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
//         subscription_type: { name: "subscription_type", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
//         subscription_state: { name: "subscription_state", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
//         nb_seats: { name: "nb_seats", propType_: Pn.INPUT, actualType: {name: "NumberType"}, required: true } as EntityProperty,
//     }
// };
// export const $Subscription: Entity = _$Subscription;
// export type $SubscriptionObjT = PickOmit<{[K in keyof typeof _$Subscription['props']]: string}, 'nb_seats'>& { nb_seats: number };

// export const _$Environment = {
//     _id: "$Environment",
//     props: {
//         _id: { name: "_id", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
//         default_app_name: { name: "envname", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
//     }
// };
// export const $Environment: Entity = _$Environment;
// export type $EnvironmentObjT = {[K in keyof typeof _$Environment['props']]: string};

export const $Job = {
    _id: "$Job",
    props: {
        _id: { name: "_id", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
        job_type: { name: "job_type", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
    }
}

export const _$Permission = {
    _id: "$Permission",
    props: {
        _id: { name: "_id", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
        role: { name: "role", propType_: Pn.INPUT, actualType: {name: "TextType"} } as EntityProperty,
        app_name: { name: "app_name", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
        resource_entity_id: { name: "resource_entity_id", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
        resource_id: { name: "resource_id", propType_: Pn.INPUT, actualType: {name: "TextType"} } as EntityProperty,
        permission: { name: "permission", propType_: Pn.INPUT, actualType: {name: "TextType"}, enumValues: ["READ", "WRITE", "DELETE"]} as EntityProperty,
        for_who: { name: "for_who", propType_: Pn.INPUT, actualType: {name: "TextType"}, enumValues: ["OWNER", "ROLE", "ALL"]} as EntityProperty,
        details: { name: "details", propType_: Pn.INPUT, actualType: {name: "TextType"} } as EntityProperty,
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
        value: { name: "value", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
    }
};
export const $System_Param: Entity = _$System_Param;
export type $System_ParamObjT = {[K in keyof typeof _$System_Param['props']]: string};

const _$Dictionary = {
    _id: "$Dictionary",
    isEditable: true,
    props: {
        _id: { name: "_id", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
        gb: { name: "gb", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
        fr: { name: "fr", propType_: Pn.INPUT, actualType: {name: "TextType"} } as EntityProperty,
        de: { name: "de", propType_: Pn.INPUT, actualType: {name: "TextType"} } as EntityProperty,
        it: { name: "it", propType_: Pn.INPUT, actualType: {name: "TextType"} } as EntityProperty,
        es: { name: "es", propType_: Pn.INPUT, actualType: {name: "TextType"} } as EntityProperty,
        pl: { name: "pl", propType_: Pn.INPUT, actualType: {name: "TextType"} } as EntityProperty,
        el: { name: "el", propType_: Pn.INPUT, actualType: {name: "TextType"} } as EntityProperty,
        ro: { name: "ro", propType_: Pn.INPUT, actualType: {name: "TextType"} } as EntityProperty,
        bg: { name: "bg", propType_: Pn.INPUT, actualType: {name: "TextType"} } as EntityProperty,
        da: { name: "da", propType_: Pn.INPUT, actualType: {name: "TextType"} } as EntityProperty,
        sv: { name: "sv", propType_: Pn.INPUT, actualType: {name: "TextType"} } as EntityProperty,
        no: { name: "no", propType_: Pn.INPUT, actualType: {name: "TextType"} } as EntityProperty,
        nl: { name: "nl", propType_: Pn.INPUT, actualType: {name: "TextType"} } as EntityProperty,
    }
};
export const $Dictionary: Entity = _$Dictionary;
export type $DictionaryObjT = {[K in keyof typeof _$Dictionary['props']]: string};

export const $Currency: Entity = {
    _id: "$Currency",
    props: {
        _id: { name: "_id", propType_: Pn.INPUT, actualType: {name: "TextType"} } as EntityProperty,
        code: { name: "code", propType_: Pn.INPUT, actualType: {name: "TextType"} } as EntityProperty,
    },
};

export const _$Icon = {
    _id: "$Icon",
    props: {
        _id: { name: "_id", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
    }
};
export const $Icon: Entity = _$Icon;
export type $IconObjT = {[K in keyof typeof _$Icon['props']]: string};

export const _$Image = {
    _id: "$Image",
    props: {
        _id: { name: "_id", propType_: Pn.INPUT, actualType: {name: "TextType"}, required: true } as EntityProperty,
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
export function isMediaStoreMetadataEntity(tableName: string) {
    return MetadataStoreName.includes(tableName);
}
export function isMediaStoreMetadataObject(obj: DataObj) {
    let tableName = entityNameFromDataObjId(obj._id);
    return isMediaStoreMetadataEntity(tableName);
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
        [$System_Param._id]: $System_Param,
    }
}
