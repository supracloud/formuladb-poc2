/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Pn, EntityProperty } from '../../domain/metadata/entity';


export const Reports = {
    _id: "Reports",
    module_: true,
    props: {},
};

export const Reports___DeliveryRate = {
    _id: "Reports___DeliveryRate",
    props: {
        orderNb: { name: 'orderNb', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        externalOrderNb: { name: 'externalOrderNb', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        orderCreationDate: { name: 'orderCreationDate', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        clientCode: { name: 'clientCode', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        client: { name: 'client', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        addressCode: { name: 'addressCode', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        addressName: { name: 'addressName', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        location: { name: 'location', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        productCode: { name: 'productCode', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        barcode: { name: 'barcode', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        quantity: { name: 'quantity', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        quantityError: { name: 'quantityError', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        price: { name: 'price', propType_: Pn.STRING, "allowNull": false } as EntityProperty,
    }
};
