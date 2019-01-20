/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Entity, Pn, EntityProperty } from '../../domain/metadata/entity';
import { GEN___Actor } from './general-metadata';

export const Financial = {
    _id: "FIN",
    module_: true,
    props: {},
};


export const FIN___Account = {
    _id: "FIN___Account",
    props: {

        code: { name: "code", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        name: { name: "name", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        actor: {
            name: "actor",
            propType_: Pn.REFERENCE_TO,
            referencedEntityName: GEN___Actor._id,
            snapshotCurrentValueOfProperties: [
                "code",
                "name",
            ]
        } as EntityProperty,
    }
};

export const FIN___Transaction = {
    _id: "FIN___Transaction",
    props: {

        accountDebit: {
            name: "accountDebit",
            propType_: Pn.REFERENCE_TO,
            referencedEntityName: FIN___Account._id,
            snapshotCurrentValueOfProperties: [
                "code",
                "name",
            ]
        } as EntityProperty,
        accountCredit: {
            name: "accountCredit",
            propType_: Pn.REFERENCE_TO,
            referencedEntityName: FIN___Account._id,
            snapshotCurrentValueOfProperties: [
                "code",
                "name",
            ]
        } as EntityProperty,
        amount: { name: "amount", propType_: Pn.NUMBER } as EntityProperty,
    }
};
