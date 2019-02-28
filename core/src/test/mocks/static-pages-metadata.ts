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
        name: { name: "name", propType_: Pn.STRING } as EntityProperty,
        value: { name: "value", propType_: Pn.STRING } as EntityProperty,
        number: { name: "number", propType_: Pn.NUMBER } as EntityProperty,
        sub_elements: {
            name: 'sub_elements',
            propType_: Pn.CHILD_TABLE, referencedEntityName: "StaticPageSubElement", props: {}
        } as EntityProperty,
    }
}

export const StaticPageSubElement: Entity = {
    _id: "StaticPageSubElement",
    props: {
        name: { name: "name", propType_: Pn.STRING } as EntityProperty,
        value: { name: "value", propType_: Pn.STRING } as EntityProperty,
        number: { name: "number", propType_: Pn.NUMBER } as EntityProperty,
        third_level_elements: {
            name: 'third_level_elements',
            propType_: Pn.CHILD_TABLE, referencedEntityName: "StaticPageThirdLevelElement", props: {}
        } as EntityProperty,
    }
}

export const StaticPageThirdLevelElement: Entity = {
    _id: "StaticPageThirdLevelElement",
    props: {
        name: { name: "name", propType_: Pn.STRING } as EntityProperty,
        value: { name: "value", propType_: Pn.STRING } as EntityProperty,
        number: { name: "number", propType_: Pn.NUMBER } as EntityProperty,
        fourth_level_elements: {
            name: 'fourth_level_elements',
            propType_: Pn.CHILD_TABLE, referencedEntityName: "StaticPageThirdLevelElement", props: {}
        } as EntityProperty,
    }
}

export const StaticPageFourthLevelElement: Entity = {
    _id: "StaticPageFourthLevelElement",
    props: {
        name: { name: "name", propType_: Pn.STRING } as EntityProperty,
        value: { name: "value", propType_: Pn.STRING } as EntityProperty,
        number: { name: "number", propType_: Pn.NUMBER } as EntityProperty,
        fifth_level_elements: {
            name: 'fifth_level_elements',
            propType_: Pn.CHILD_TABLE, referencedEntityName: "StaticPageThirdLevelElement", props: {}
        } as EntityProperty,
    }
}

export const StaticPageFifthLevelElement: Entity = {
    _id: "StaticPageFifthLevelElement",
    props: {
        name: { name: "name", propType_: Pn.STRING } as EntityProperty,
        value: { name: "value", propType_: Pn.STRING } as EntityProperty,
        number: { name: "number", propType_: Pn.NUMBER } as EntityProperty,
    }
}
