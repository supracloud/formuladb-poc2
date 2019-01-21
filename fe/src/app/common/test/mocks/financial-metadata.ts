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

        code: { name: 'code', propType_: Pn.STRING, 'allowNull': false } as EntityProperty,
        name: { name: 'name', propType_: Pn.STRING, 'allowNull': false } as EntityProperty,
        actor_code: {
            name: 'actor_code',
            propType_: Pn.REFERENCE_TO,
            referencedEntityName: GEN___Actor._id,
            referencedPropertyName: 'code'
        } as EntityProperty,
        actor_name: {
            name: 'actor_name',
            propType_: Pn.REFERENCE_TO,
            referencedEntityName: GEN___Actor._id,
            referencedPropertyName: 'name'
        } as EntityProperty,
    }
};

export const FIN___Transaction = {
    _id: "FIN___Transaction",
    props: {

        accountDebitCode: {
            name: 'accountDebitCode',
            propType_: Pn.REFERENCE_TO,
            referencedEntityName: FIN___Account._id,
            referencedPropertyName: 'code'
        } as EntityProperty,
        accountDebitName: {
            name: 'accountDebitName',
            propType_: Pn.REFERENCE_TO,
            referencedEntityName: FIN___Account._id,
            referencedPropertyName: 'name'
        } as EntityProperty,
        accountCreditCode: {
            name: 'accountCreditCode',
            propType_: Pn.REFERENCE_TO,
            referencedEntityName: FIN___Account._id,
            referencedPropertyName: 'code'
        } as EntityProperty,
        accountCreditName: {
            name: 'accountCreditName',
            propType_: Pn.REFERENCE_TO,
            referencedEntityName: FIN___Account._id,
            referencedPropertyName: 'name'
        } as EntityProperty,
        amount: { name: 'amount', propType_: Pn.NUMBER } as EntityProperty,
    }
};
