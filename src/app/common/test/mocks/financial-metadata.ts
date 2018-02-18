import { Entity, Pn } from '../../domain/metadata/entity';
import { General__Actor } from './general-metadata';

export const Financial = {
    type_: "Entity_", _id: "/Financial",

    module_: true
};


export const Financial__Account = {
    type_: "Entity_", _id: "/Financial/Account",

    code: { propType_: Pn.STRING, "allowNull": false },
    name: { propType_: Pn.STRING, "allowNull": false },
    actor: {
        propType_: Pn.SUB_ENTITY,
        deepPath: General__Actor._id,
        snapshotCurrentValueOfProperties: [
            "code",
            "name",
        ]
    },

};

export const Financial__Transaction = {
    type_: "Entity_", _id: "/Financial/Transaction",

    accountDebit: {
        propType_: Pn.SUB_ENTITY,
        deepPath: Financial__Account._id,
        snapshotCurrentValueOfProperties: [
            "code",
            "name",
        ]
    },
    accountCredit: {
        propType_: Pn.SUB_ENTITY,
        deepPath: Financial__Account._id,
        snapshotCurrentValueOfProperties: [
            "code",
            "name",
        ]
    },
    amount: { propType_: Pn.NUMBER },

};
