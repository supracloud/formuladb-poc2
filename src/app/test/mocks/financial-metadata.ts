import { Entity, PropertyTypeN, Fnn } from '../../domain/metadata/entity';

export const Financial: Entity = {
    mwzType: "Entity_", _id: "Financial",
    properties: [],
    module: true
};


export const Financial__Account: Entity = {
    mwzType: "Entity_", _id: "Financial__Account",
    properties: [
        { name: "code", type: PropertyTypeN.STRING, "allowNull": false },
        { name: "name", type: PropertyTypeN.STRING, "allowNull": false },
        {
            name: "actor",
            type: PropertyTypeN.REFERENCE_ENTITY,
            entity: {
                path: "General__Actor",
                copiedProperties: [
                    "code",
                    "name",
                ]
            }
        },
    ]
};

export const Financial__Transaction: Entity = {
    mwzType: "Entity_", _id: "Financial__Transaction",
    properties: [
        {
            name: "accountDebit",
            type: PropertyTypeN.REFERENCE_ENTITY,
            entity: {
                path: "Financial__Account",
                copiedProperties: [
                    "code",
                    "name",
                ]
            }
        },
        {
            name: "accountCredit",
            type: PropertyTypeN.REFERENCE_ENTITY,
            entity: {
                path: "Financial__Account",
                copiedProperties: [
                    "code",
                    "name",
                ]
            }
        },
        { name: "amount", type: PropertyTypeN.NUMBER },
    ]
};
