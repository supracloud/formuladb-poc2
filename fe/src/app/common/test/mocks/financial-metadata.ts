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

        code: { name: 'code', propType_: Pn.STRING, 'allowNull': false } as EntityProperty,
        name: { name: 'name', propType_: Pn.STRING, 'allowNull': false } as EntityProperty,
        actor_code: {
            name: 'actor_code',
            propType_: Pn.REFERENCE_TO,
            referencedEntityName: GEN__Actor._id,
            referencedPropertyName: 'code'
        } as EntityProperty,
        actor_name: {
            name: 'actor_name',
            propType_: Pn.REFERENCE_TO,
            referencedEntityName: GEN__Actor._id,
            referencedPropertyName: 'name'
        } as EntityProperty,
    }
};

export const FIN__Transaction = {
    _id: "FIN__Transaction",
    props: {

        accountDebitCode: {
            name: 'accountDebitCode',
            propType_: Pn.REFERENCE_TO,
            referencedEntityName: FIN__Account._id,
            referencedPropertyName: 'code'
        } as EntityProperty,
        accountDebitName: {
            name: 'accountDebitName',
            propType_: Pn.REFERENCE_TO,
            referencedEntityName: FIN__Account._id,
            referencedPropertyName: 'name'
        } as EntityProperty,
        accountCreditCode: {
            name: 'accountCreditCode',
            propType_: Pn.REFERENCE_TO,
            referencedEntityName: FIN__Account._id,
            referencedPropertyName: 'code'
        } as EntityProperty,
        accountCreditName: {
            name: 'accountCreditName',
            propType_: Pn.REFERENCE_TO,
            referencedEntityName: FIN__Account._id,
            referencedPropertyName: 'name'
        } as EntityProperty,
        amount: { name: 'amount', propType_: Pn.NUMBER } as EntityProperty,
    }
};
