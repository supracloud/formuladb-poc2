/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Pn, EntityProperty } from '../../domain/metadata/entity';


export const MusicBooking = {
    _id: "MBK",
    module_: true,
    props: {},
};

export const MBK___Service = {
    _id: "MBK___Service",
    props: {
        category: { name: 'category', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        name: { name: 'name', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        //we should invent ENUM-ul
        unitType: { name: 'unitType', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        unitPrice: { name: 'unitPrice ', propType_: Pn.NUMBER, "allowNull": false } as EntityProperty,
    },
};

export const MBK___Estimate = {
    _id: "MBK___Estimate",
    props: {
        date: { name: 'date', propType_: Pn.DATETIME, "allowNull": false } as EntityProperty,
        client: { name: 'client', propType_: Pn.STRING, "allowNull": false } as EntityProperty,//should be reference to General___Client
        //etc...
        totalPlayers: { name: "totalPlayers", propType_: Pn.FORMULA, formula: 'SUMIF(MBK___Estimate___Service.musicians, estimateId == @[_id])' } as EntityProperty,
        services$: {
            name: 'services$',
            propType_: Pn.CHILD_TABLE,
            referencedEntityName: 'MBK___Estimate___Service',
            props: {},
            isLargeTable: true,
        } as EntityProperty,
    },
};

export const MBK___Estimate___Service = {
    _id: "MBK___Estimate___Service",
    props: {
        estimateId: { name: 'estimateId', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        service: { name: "service", propType_: Pn.REFERENCE_TO, referencedEntityName: MBK___Service._id, snapshotCurrentValueOfProperties: ['category', 'name', 'unitType', 'unitPrice'] } as EntityProperty,
        musicians: { name: "musicians", propType_: Pn.NUMBER, allowNull: false } as EntityProperty,
        quantity: { name: "quantity", propType_: Pn.NUMBER, allowNull: false } as EntityProperty,
        doubles: { name: "doubles", propType_: Pn.NUMBER, allowNull: false } as EntityProperty,
        doubling: { name: "doubling", propType_: Pn.FORMULA, formula: 'quantity * service.unitPrice * doubles * 0.2' } as EntityProperty,
        cartage: { name: "cartage", propType_: Pn.NUMBER, allowNull: false } as EntityProperty,
        total: { name: "total", propType_: Pn.FORMULA, formula: 'musicians * quantity * service.unitPrice + doubling + cartage' } as EntityProperty,
    },
};

export const MBK___Session = {
    _id: "MBK___Session",
    props: {
        estimateId: { name: 'estimateId', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        date: { name: 'date', propType_: Pn.DATETIME, "allowNull": false } as EntityProperty,
    },
};

export const MBK___Booking = {
    _id: "MBK___Booking",
    props: {
        sessionId: { name: 'sessionId', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
    },
};

export const MBK___Booking___Musician = {
    _id: "MBK___Booking___Musician",
    props: {
        bookingId: { name: 'bookingId', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        musicianName: { name: 'musicianName', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        musicianEmail: { name: 'musicianEmail', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
    },
};

export const MBK___Email = {
    _id: "MBK___Email",
    props: {
        date: { name: 'date', propType_: Pn.DATETIME, "allowNull": false } as EntityProperty,
        template: { name: 'template', propType_: Pn.STRING, "allowNull": false } as EntityProperty,//should be reference to General___Client
    },
};