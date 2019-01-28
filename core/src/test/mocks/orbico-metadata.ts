/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Pn, EntityProperty } from "@core/domain/metadata/entity";


export const Reports = {
    _id: "REP",
    module_: true,
    props: {},
};

export const REP__DeliveryRate = {
    _id: "REP__DeliveryRate",
    props: {
        ordernb: { name: 'orderNb', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        externalordernb: { name: 'externalOrderNb', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        ordercreationdate: { name: 'orderCreationDate', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        clientcode: { name: 'clientCode', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        client: { name: 'client', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        addresscode: { name: 'addressCode', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        addressname: { name: 'addressName', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        location: { name: 'location', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        productcode: { name: 'productCode', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        barcode: { name: 'barcode', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        quantity: { name: 'quantity', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        quantityerror: { name: 'quantityError', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        price: { name: 'price', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
    }
};
