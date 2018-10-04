/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Entity, Pn, EntityProperty } from '../../domain/metadata/entity';
import { General___Actor } from './general-metadata';

export const Financial = {
    _id: "Financial",
    module_: true,
    props: {},
};


export const Financial___Account = {
    _id: "Financial___Account",
    props: {

        code: { name: "code", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        name: { name: "name", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        actor: {
            name: "actor",
            propType_: Pn.BELONGS_TO,
            referencedEntityName: General___Actor._id,
            snapshotCurrentValueOfProperties: [
                "code",
                "name",
            ]
        } as EntityProperty,
    }
};

export const Financial___Transaction = {
    _id: "Financial___Transaction",
    props: {

        accountDebit: {
            name: "accountDebit",
            propType_: Pn.BELONGS_TO,
            referencedEntityName: Financial___Account._id,
            snapshotCurrentValueOfProperties: [
                "code",
                "name",
            ]
        } as EntityProperty,
        accountCredit: {
            name: "accountCredit",
            propType_: Pn.BELONGS_TO,
            referencedEntityName: Financial___Account._id,
            snapshotCurrentValueOfProperties: [
                "code",
                "name",
            ]
        } as EntityProperty,
        amount: { name: "amount", propType_: Pn.NUMBER } as EntityProperty,
    }
};
