import { Sn } from "../../domain/metadata/stored_procedure";
import { Fn } from "../../domain/metadata/entity";

export const MockExecutionPlan = {
    '/Inventory/Order/items': [
        [Sn.PARAMS, 'item'],
        ['product=', Sn.STORE_getDataObj, 'item.product.ref_'],
        //NOTE: iF item.OLD is null, it means this is the item is being created 
        //  OR the Formula has been created or changed and triggers for all items are run for the initial computation of the new Formula
        ['product.OLD.reserved_stock=', Sn.EVAL, 'product.reserved_quantity - item.OLD.reserved_quantity'],
        ['product.OLD.available_stock=', Sn.EVAL, 'product.received_stock - product.OLD.reserved_stock - product.delivered_stock'],
        ['item.available_stock=', Sn.EVAL, 'product.OLD.available_stock'],
        ['item.reserved_quantity=', Sn.EVAL, 'item.available_stock > item.requested_quantity ? item.requested_quantity : item.available_stock'],
        ['product.reserved_quantity=', Sn.EVAL, 'product.reserved_quantity + item.reserved_quantity'],
        ['product.available_stock=', Sn.EVAL, 'product.received_stock - product.reserved_stock - product.delivered_stock'],
        [Sn.STORE_SAVE_DIRTY_OBJS, 'item', 'product'],
    ],
    '/Forms/ServiceForm/time_of_arrival': [
        [Sn.PARAMS, 'OLD', 'NEW'],
        ['startRange=', Sn.EVAL, Fn.DATE_UTILS('NEW.time_interval', 'START_OF_MONTH')],
        ['endRange=', Sn.EVAL, Fn.DATE_UTILS('NEW.time_interval', 'END_OF_MONTH')],
        ['val1=', Sn.STORE_queryWithDeepPath, '/Forms/ServiceForm[startRange <= time_of_arrival and time_of_arrival <= endRange]'],
        ['val2=', Sn.EVAL, `_(val1).sortBy(["time_of_arrival"]).mapProp("i","index").mapProp("code","'00000000' + index").value()`],
        [Sn.STORE_SAVE_DIRTY_OBJS, 'val2'],
    ],
    '/Forms/ServiceForm/service_form_units/items': [
        //should be the same as /Inventory/Order/items after complete Schema compilation
    ]
};
