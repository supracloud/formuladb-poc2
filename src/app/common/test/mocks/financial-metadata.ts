import { Entity, PropertyTypeN } from '../../domain/metadata/entity';
import { General__Actor } from './general-metadata';

export const Financial = {
    type_: "Entity_", _id: "/Financial",
    
    module_: true
};


export const Financial__Account = {
    type_: "Entity_", _id: "/Financial/Account",

    code: { propType_: PropertyTypeN.STRING, "allowNull": false },
    name: { propType_: PropertyTypeN.STRING, "allowNull": false },
    actor: {
        propType_: PropertyTypeN.REFERENCE_ENTITY,
        entity: {
            deepPath: General__Actor._id,
            snapshotCurrentValueOfProperties: [
                "code",
                "name",
            ]
        }
    },

};

export const Financial__Transaction = {
    type_: "Entity_", _id: "/Financial/Transaction",

    accountDebit: {
        propType_: PropertyTypeN.REFERENCE_ENTITY,
        entity: {
            deepPath: Financial__Account._id,
            snapshotCurrentValueOfProperties: [
                "code",
                "name",
            ]
        }
    },
    accountCredit: {
        propType_: PropertyTypeN.REFERENCE_ENTITY,
        entity: {
            deepPath: Financial__Account._id,
            snapshotCurrentValueOfProperties: [
                "code",
                "name",
            ]
        }
    },
    amount: { propType_: PropertyTypeN.NUMBER },

};
