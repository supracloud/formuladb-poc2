import { Entity, PropertyTypeN } from '../../domain/metadata/entity';
import { General__Actor } from './general-metadata';

export const Financial = {
    type_: "Entity_", _id: "/Financial",
    properties: {},
    module: true
};


export const Financial__Account = {
    type_: "Entity_", _id: "/Financial/Account",
    properties: { _id: { type: PropertyTypeN.STRING },
        code: { type: PropertyTypeN.STRING, "allowNull": false },
        name: { type: PropertyTypeN.STRING, "allowNull": false },
        actor: {
            type: PropertyTypeN.REFERENCE_ENTITY,
            entity: {
                deepPath: General__Actor._id,
                copiedProperties: [
                    "code",
                    "name",
                ]
            }
        },
    }
};

export const Financial__Transaction = {
    type_: "Entity_", _id: "/Financial/Transaction",
    properties: { _id: { type: PropertyTypeN.STRING },
        accountDebit: {
            type: PropertyTypeN.REFERENCE_ENTITY,
            entity: {
                deepPath: Financial__Account._id,
                copiedProperties: [
                    "code",
                    "name",
                ]
            }
        },
        accountCredit: {
            type: PropertyTypeN.REFERENCE_ENTITY,
            entity: {
                deepPath: Financial__Account._id,
                copiedProperties: [
                    "code",
                    "name",
                ]
            }
        },
        amount: { type: PropertyTypeN.NUMBER },
    }
};
