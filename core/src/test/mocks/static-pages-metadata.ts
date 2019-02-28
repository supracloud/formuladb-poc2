import { Entity, Pn, EntityProperty } from "@core/domain/metadata/entity";

export const StaticPage: Entity = {
    _id: "StaticPage",
    props: {
        name: { name: "name", propType_: Pn.STRING } as EntityProperty,
        elements: {
            name: 'elements',
            propType_: Pn.CHILD_TABLE, referencedEntityName: "StaticPageElement", props: {}
        } as EntityProperty,
    }
}

export const StaticPageElement: Entity = {
    _id: "StaticPageElement",
    props: {
        type: { name: "type", propType_: Pn.STRING } as EntityProperty,
        value: { name: "value", propType_: Pn.STRING } as EntityProperty,
        number: { name: "number", propType_: Pn.NUMBER } as EntityProperty,
        elements: {
            name: 'elements',
            propType_: Pn.CHILD_TABLE, referencedEntityName: "StaticPageElement", props: {}
        } as EntityProperty,
    }
}
