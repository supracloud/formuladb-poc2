import { Entity, Pn } from '../../domain/metadata/entity';
import { Inventory__Product, Inventory__ProductLocation } from './inventory-metadata';


export const Reports = {
    type_: "Entity_", _id: "//Reports",

    module_: true
};

export const Reports__DetailedCentralizerReport = {
    type_: "Entity_", _id: "Reports_DetailedCentralizerReport",
    //TODO
};

export const Reports__ServiceCentralizerReport = {
    type_: "Entity_", _id: "Reports_ServiceCentralizerReport",
    aliases_: {
        thisMonthServiceForms: 'IF(Forms_ServiceForm, EOMONTH(time_interval,-1) == EOMONTH(@(time_of_arrival),-1))',
    },

    client: { propType_: Pn.STRING, "allowNull": false },
    month: { propType_: Pn.DATETIME },
    serviceForms: {
        propType_: Pn.FORMULA, formula:
            `TEXTJOIN({{thisMonthServiceForms}}.(REGEXREPLACE(code, '.*\-0+', '') + '/' + TEXT(time_interval, 'dd.mm')), ', ')`
    },
    totalItemsCost: { propType_: Pn.STRING },

    totalNormalWorkHours: { propType_: Pn.FORMULA, formula: `SUM({{thisMonthServiceForms}}/normal_hours))` },
    normalHourPrice: { propType_: Pn.FORMULA, formula: `General_Settings?(name='normalHourPrice')` },
    totalNormalWorkHoursCost: { propType_: Pn.FORMULA, formula: `totalNormalWorkHours * normalHourPrice`},

    totalNightWorkHours: { propType_: Pn.STRING },
    nightHourPrice: { propType_: Pn.STRING },
    totalNightWorkHoursCost: { propType_: Pn.STRING },

    totalWorkHoursCost: { propType_: Pn.STRING },

    totalLocalTransportUnits: { propType_: Pn.STRING },
    localTransportUnitPrice: { propType_: Pn.STRING },
    totalLocalTransportCost: { propType_: Pn.STRING },

    totalTransportCost: { propType_: Pn.STRING },

    totalAccomodationsCost: { propType_: Pn.STRING },

    eurExchangeRate: { propType_: Pn.STRING },
    totalEURCost: { propType_: Pn.STRING },
    totalRONCost: { propType_: Pn.STRING },
    vatCost: { propType_: Pn.STRING },
    totalCost: { propType_: Pn.STRING },
};

export const Reports__TestReport1 = {
    type_: "Entity_", _id: "Reports_TestReport1",
    largeSalesPerProduct: {
        propType_: Pn.SUB_TABLE,
        product: {
            propType_: Pn.BELONGS_TO,
            deepPath: Inventory__ProductLocation._id,
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
            formula: 'SUM(IF(itemsInOrderInInventory/reserved_quantity > 10, itemsInOrderInInventory/reserved_quantity, 0))'
        },
    },
};
