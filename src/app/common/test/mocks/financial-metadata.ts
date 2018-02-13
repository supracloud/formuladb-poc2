import { Entity, PropertyTypeN } from '../../domain/metadata/entity';

export const Financial = {
    type_: "Entity_", _id: "Financial",
    properties: {},
    module: true
};


export const Financial__Account = {
    type_: "Entity_", _id: "Financial/Account",
    properties: {
        code: { type: PropertyTypeN.STRING, "allowNull": false },
        name: { type: PropertyTypeN.STRING, "allowNull": false },
        actor: {
            type: PropertyTypeN.REFERENCE_ENTITY,
            entity: {
                deepPath: "/General/Actor",
                copiedProperties: [
                    "code",
                    "name",
                ]
            }
        },
    }
};

export const Financial__Transaction = {
    type_: "Entity_", _id: "Financial/Transaction",
    properties: {
        accountDebit: {
            type: PropertyTypeN.REFERENCE_ENTITY,
            entity: {
                deepPath: "/Financial/Account",
                copiedProperties: [
                    "code",
                    "name",
                ]
            }
        },
        accountCredit: {
            type: PropertyTypeN.REFERENCE_ENTITY,
            entity: {
                deepPath: "/Financial/Account",
                copiedProperties: [
                    "code",
                    "name",
                ]
            }
        },
        amount: { type: PropertyTypeN.NUMBER },
    }
};
