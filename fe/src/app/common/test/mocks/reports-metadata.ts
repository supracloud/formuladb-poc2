/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Entity, Pn, EntityProperty } from '../../domain/metadata/entity';
import { Inventory___Product, Inventory___Product___Location } from './inventory-metadata';
import { Fn } from '../../domain/metadata/functions';


export const Reports = {
    _id: "Reports",
    module_: true,
    props: {},
};

export const Reports___DetailedCentralizerReport = {
    _id: "Reports___DetailedCentralizerReport",
    props: {
        //TODO
    }
};

export const Reports___ServiceCentralizerReport = {
    _id: "Reports___ServiceCentralizerReport",
    aliases: {
        thisMonthServiceForms: Fn.IF(`Forms_ServiceForm`, Fn.EOMONTH(`time_of_arrival`, `-1`) + ` == ` + Fn.EOMONTH(`$ROW$.month`, `-1`)),
    },
    props: {
        client: { name: "client", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        month: { name: "month", propType_: Pn.DATETIME } as EntityProperty,
        serviceForms: {
            name: "serviceForms",
            propType_: Pn.FORMULA, formula:
                Fn.TEXTJOIN(Fn._MAP(`{{thisMonthServiceForms}}`, Fn.REGEXREPLACE(`code`, `".*\-0+"`, `""`) + `"/"` + Fn.TEXT(`time_interval`, `"dd.mm"`)), `", "`)
        } as EntityProperty,
        totalItemsCost: { name: "totalItemsCost", propType_: Pn.STRING } as EntityProperty,

        totalNormalWorkHours: { name: "totalNormalWorkHours", propType_: Pn.FORMULA, formula: Fn.SUM(`{{thisMonthServiceForms}}.normal_hours`) } as EntityProperty,
        normalHourPrice: { name: "normalHourPrice", propType_: Pn.FORMULA, formula: Fn.VLOOKUP(`General_Settings`, `name == "normalHourPrice"`, `valueNumber`) } as EntityProperty,
        totalNormalWorkHoursCost: { name: "totalNormalWorkHoursCost", propType_: Pn.FORMULA, formula: `totalNormalWorkHours * normalHourPrice` } as EntityProperty,

        totalNightWorkHours: { name: "totalNightWorkHours", propType_: Pn.STRING } as EntityProperty,
        nightHourPrice: { name: "nightHourPrice", propType_: Pn.STRING } as EntityProperty,
        totalNightWorkHoursCost: { name: "totalNightWorkHoursCost", propType_: Pn.STRING } as EntityProperty,

        totalWorkHoursCost: { name: "totalWorkHoursCost", propType_: Pn.STRING } as EntityProperty,

        totalLocalTransportUnits: { name: "totalLocalTransportUnits", propType_: Pn.STRING } as EntityProperty,
        localTransportUnitPrice: { name: "localTransportUnitPrice", propType_: Pn.STRING } as EntityProperty,
        totalLocalTransportCost: { name: "totalLocalTransportCost", propType_: Pn.STRING } as EntityProperty,

        totalTransportCost: { name: "totalTransportCost", propType_: Pn.STRING } as EntityProperty,

        totalAccomodationsCost: { name: "totalAccomodationsCost", propType_: Pn.STRING } as EntityProperty,

        eurExchangeRate: { name: "eurExchangeRate", propType_: Pn.STRING } as EntityProperty,
        totalEURCost: { name: "totalEURCost", propType_: Pn.STRING } as EntityProperty,
        totalRONCost: { name: "totalRONCost", propType_: Pn.STRING } as EntityProperty,
        vatCost: { name: "vatCost", propType_: Pn.STRING } as EntityProperty,
        totalCost: { name: "totalCost", propType_: Pn.STRING } as EntityProperty,
    }
};

export const Reports___TestReport1 = {
    _id: "Reports___TestReport1",
    props: {
        largeSalesPerProduct: {
            propType_: Pn.SUB_TABLE,
            props: {
                product: {
                    propType_: Pn.BELONGS_TO,
                    referencedEntityName: Inventory___Product___Location._id,
                    snapshotCurrentValueOfProperties: [
                        "../../code",
                        "../../name",
                        "locationCode",
                        "price",
                        "currency/code",
                        "available_stock"
                    ]
                },
                largeSalesValue: {
                    propType_: Pn.FORMULA,
                    formula: Fn.SUM(`itemsInOrderInInventory/reserved_quantity > 10 ? itemsInOrderInInventory/reserved_quantity : 0`)
                },
            },
        },
    }
};
