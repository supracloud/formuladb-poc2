/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */

import { Entity, Pn, EntityProperty, FormulaProperty } from '../../domain/metadata/entity';
import { INV___PRD, INV___PRD___Location } from './inventory-metadata';
import { Fn } from '../../domain/metadata/functions';


export const Reports = {
    _id: "REP",
    module_: true,
    props: {},
};

export const REP___DetailedCentralizerReport = {
    _id: "REP___DetailedCentralizerReport",
    props: {
        //TODO
    }
};

export const REP___ServiceCentralizerReport = {
    _id: "REP___ServiceCentralizerReport",
    aliases: {
        thisMonthServiceForms: Fn.IF(`Forms_ServiceForm`, Fn.EOMONTH(`time_of_arrival`, `-1`) + ` == ` + Fn.EOMONTH(`@[month]`, `-1`)),
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

export const REP___LargeSales = {
    _id: "REP___LargeSales",
    props: {
        client: { name: "client", propType_: Pn.STRING, "allowNull": false } as EntityProperty,
        month: { name: "month", propType_: Pn.DATETIME } as EntityProperty,
        largeSales: {
            name: "largeSales",
            propType_: Pn.CHILD_TABLE,
            referencedEntityName: "REP___LargeSales___Product",
            isLargeTable: true,
            props: {},
        } as EntityProperty,
    }
};

export const REP___LargeSales___Product = {
    _id: "REP___LargeSales___Product",
    props: {
        productLocationId: { name: "productLocationId", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        productName: { name: "productLocationId", propType_: Pn.STRING, allowNull: false } as EntityProperty,
        largeSalesValue: {
            name: "largeSalesValue",
            propType_: Pn.FORMULA,
            formula: `SUMIF(INV___Order___Item.quantity, quantity > 100 && productLocationId = @[productLocationId])`,
        } as FormulaProperty,
    }
}
