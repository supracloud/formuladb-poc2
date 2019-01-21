/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Entity, Pn, EntityProperty } from '../../domain/metadata/entity';
import { GEN__Actor } from './general-metadata';

export const Financial = {
    _id: "FIN",
    module_: true,
    props: {},
};


export const FIN__Account = {
    _id: "FIN__Account",
    props: {

        code: { name: "code", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        name: { name: "name", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        actor: {
            name: "actor",
            propType_: Pn.REFERENCE_TO,
            referencedEntityName: GEN__Actor._id,
            snapshotCurrentValueOfProperties: [
                "code",
                "name",
            ]
        } as EntityProperty,
    }
};

export const FIN__Transaction = {
    _id: "FIN__Transaction",
    props: {

        accountDebit: {
            name: "accountDebit",
            propType_: Pn.REFERENCE_TO,
            referencedEntityName: FIN__Account._id,
            snapshotCurrentValueOfProperties: [
                "code",
                "name",
            ]
        } as EntityProperty,
        accountCredit: {
            name: "accountCredit",
            propType_: Pn.REFERENCE_TO,
            referencedEntityName: FIN__Account._id,
            snapshotCurrentValueOfProperties: [
                "code",
                "name",
            ]
        } as EntityProperty,
        amount: { name: "amount", propType_: Pn.NUMBER } as EntityProperty,
    }
};
