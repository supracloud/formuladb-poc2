import { Sn } from "../../domain/metadata/stored_procedure";
import { Fn, Mn, Rn } from "../../domain/metadata/entity";

export const MockExecutionPlan = {
    triggers: [
        ['/Forms/ServiceForm/time_of_arrival',
        '/Forms/ServiceForm[EOMONTH({{time_interval}}, -1) < time_of_arrival and time_of_arrival <= EOMONTH({{time_of_arrival}}, 0)]/time_of_arrival'],
        ['/Inventory/ReceiptItem/quantity', '/Inventory/ProductLocation[_id = {{product/ref_}}]/received_stock'],
        ['/Inventory/OrderItem/quantity', '/Inventory/ProductLocation[_id = {{product/ref_}}]/ordered_stock'],
        ['/Inventory/ProductLocation/received_stock', '/Inventory/ProductLocation[_id = {{_id}}]/available_stock'],
        ['/Inventory/ProductLocation/ordered_stock','/Inventory/ProductLocation[_id = {{_id}}]/available_stock'],
    ],
    formulas: {
        '/Inventory/ProductLocation/received_stock': {
            observables: '/Inventory/ReceiptItem[product/ref_ = {{_id}}]/quantity',
            map: Mn.MAP_DEEP_PATH('/Inventory/ReceiptItem[product/ref_ = {{_id}}]/quantity'),
            reduce: Rn._sum,
        },
        '/Inventory/ProductLocation/ordered_stock': {
            observables: '/Inventory/OrderItem[product/ref_ = {{_id}}]/quantity',
            map: Mn.MAP_DEEP_PATH('/Inventory/OrderItem[product/ref_ = {{_id}}]/quantity'),
            reduce: Rn._sum,
        },
        '/Inventory/ProductLocation/available_stock': {
            observables: ['/Inventory/ProductLocation[_id = {{_id}}]/received_stock', '/Inventory/ProductLocation[_id = {{_id}}]/ordered_stock'],
            map: Mn.MAP_EXPR('/Inventory/OrderItem[_id = {{_id}}]/available_stock', 'received_stock - ordered_stock'),
        },
        '/Forms/ServiceForm/code': {
            observables: '/Forms/ServiceForm[EOMONTH({{time_interval}}, -1) < time_of_arrival and time_of_arrival <= EOMONTH({{time_of_arrival}}, 0)]/time_of_arrival',
            map: Mn.MAP_EXPR('/Inventory/OrderItem[_id = {{_id}}]/available_stock', 'received_stock - ordered_stock'),
        },
    }
};
