/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Pn, EntityProperty } from '../../domain/metadata/entity';


export const MusicBooking = {
    _id: "MusicBooking",
    module_: true,
    props: {},
};

export const MusicBooking___Service = {
    _id: "MusicBooking___Service",
    props: {
        category: { name: 'category', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        name: { name: 'name', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        //we should invent ENUM-ul
        unitType: { name: 'unitType', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        unitPrice: { name: 'unitPrice ', propType_: Pn.NUMBER, "allowNull": false } as EntityProperty,
    },
};

export const MusicBooking___Estimate = {
    _id: "MusicBooking___Estimate",
    props: {
        date: { name: 'date', propType_: Pn.DATETIME, "allowNull": false } as EntityProperty,
        client: { name: 'client', propType_: Pn.STRING, "allowNull": false } as EntityProperty,//should be reference to General___Client
        //etc...
        totalPlayers: { name: "totalPlayers", propType_: Pn.FORMULA, formula: 'SUMIF(MusicBooking___Estimate___Service.musicians, estimateId == @[_id])' } as EntityProperty,
        services$: {
            name: 'services$',
            propType_: Pn.CHILD_TABLE,
            referencedEntityName: 'MusicBooking___Estimate___Service',
            props: {},
            isLargeTable: true,
        } as EntityProperty,
    },
};

export const MusicBooking___Estimate___Service = {
    _id: "MusicBooking___Estimate___Service",
    props: {
        estimateId: { name: 'estimateId', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        service: { name: "service", propType_: Pn.REFERENCE_TO, referencedEntityName: MusicBooking___Service._id, snapshotCurrentValueOfProperties: ['category', 'name', 'unitType', 'unitPrice'] } as EntityProperty,
        musicians: { name: "musicians", propType_: Pn.NUMBER, allowNull: false } as EntityProperty,
        quantity: { name: "quantity", propType_: Pn.NUMBER, allowNull: false } as EntityProperty,
        doubles: { name: "doubles", propType_: Pn.NUMBER, allowNull: false } as EntityProperty,
        doubling: { name: "doubling", propType_: Pn.FORMULA, formula: 'quantity * service.unitPrice * doubles * 0.2' } as EntityProperty,
        cartage: { name: "cartage", propType_: Pn.NUMBER, allowNull: false } as EntityProperty,
        total: { name: "total", propType_: Pn.FORMULA, formula: 'musicians * quantity * service.unitPrice + doubling + cartage' } as EntityProperty,
    },
};
