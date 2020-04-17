/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { Entity, Pn, EntityProperty, FormulaProperty } from "@domain/metadata/entity";
import { Fn } from "@domain/metadata/functions";


export const REP__DetailedCentralizerReport = {
    _id: "REP__DetailedCentralizerReport",
    props: {
        dummy: { name: "dummy", propType_: Pn.TEXT, required: true } as EntityProperty,
    }
};

export const REP__ServiceCentralizerReport = {
    _id: "REP__ServiceCentralizerReport",
    aliases: {
        thisMonthServiceForms: Fn.IF(`Forms_ServiceForm`, Fn.EOMONTH(`time_of_arrival`, `-1`) + ` == ` + Fn.EOMONTH(`@[month]`, `-1`)),
    },
    props: {
        client: { name: "client", propType_: Pn.TEXT, required: true } as EntityProperty,
        month: { name: "month", propType_: Pn.DATETIME } as EntityProperty,
        serviceForms: {
            name: "serviceForms",
            propType_: Pn.FORMULA, formula: '""'
                // Fn.TEXTJOIN(Fn._MAP(`{{thisMonthServiceForms}}`, Fn.REGEXREPLACE(`code`, `".*\-0+"`, `""`) + `"/"` + Fn.TEXT(`time_interval`, `"dd.mm"`)), `", "`)
        } as EntityProperty,
        totalItemsCost: { name: "totalItemsCost", propType_: Pn.TEXT } as EntityProperty,

        totalNormalWorkHours: { name: "totalNormalWorkHours", propType_: Pn.FORMULA, formula: '"Fn.SUM(`{{thisMonthServiceForms}}.normal_hours`)"' } as EntityProperty,
        normalHourPrice: { name: "normalHourPrice", propType_: Pn.FORMULA, formula: '""'/*Fn.VLOOKUP(`General_Settings`, `name == "normalHourPrice"`, `valueNumber`)*/ } as EntityProperty,
        totalNormalWorkHoursCost: { name: "totalNormalWorkHoursCost", propType_: Pn.FORMULA, formula: `totalNormalWorkHours * normalHourPrice` } as EntityProperty,

        totalNightWorkHours: { name: "totalNightWorkHours", propType_: Pn.TEXT } as EntityProperty,
        nightHourPrice: { name: "nightHourPrice", propType_: Pn.TEXT } as EntityProperty,
        totalNightWorkHoursCost: { name: "totalNightWorkHoursCost", propType_: Pn.TEXT } as EntityProperty,

        totalWorkHoursCost: { name: "totalWorkHoursCost", propType_: Pn.TEXT } as EntityProperty,

        totalLocalTransportUnits: { name: "totalLocalTransportUnits", propType_: Pn.TEXT } as EntityProperty,
        localTransportUnitPrice: { name: "localTransportUnitPrice", propType_: Pn.TEXT } as EntityProperty,
        totalLocalTransportCost: { name: "totalLocalTransportCost", propType_: Pn.TEXT } as EntityProperty,

        totalTransportCost: { name: "totalTransportCost", propType_: Pn.TEXT } as EntityProperty,

        totalAccomodationsCost: { name: "totalAccomodationsCost", propType_: Pn.TEXT } as EntityProperty,

        eurExchangeRate: { name: "eurExchangeRate", propType_: Pn.TEXT } as EntityProperty,
        totalEURCost: { name: "totalEURCost", propType_: Pn.TEXT } as EntityProperty,
        totalRONCost: { name: "totalRONCost", propType_: Pn.TEXT } as EntityProperty,
        vatCost: { name: "vatCost", propType_: Pn.TEXT } as EntityProperty,
        totalCost: { name: "totalCost", propType_: Pn.TEXT } as EntityProperty,
    }
};

export const Reports = {
    _id: "REP",
    pureNavGroupingChildren: [REP__DetailedCentralizerReport._id, REP__ServiceCentralizerReport._id],
    props: {},
};
