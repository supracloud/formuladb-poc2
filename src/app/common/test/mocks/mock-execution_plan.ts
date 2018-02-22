import { Sn } from "../../domain/metadata/stored_procedure";
import { ExecutionPlan, CompiledFunction } from "../../domain/metadata/execution_plan";
import { matchesTypeES5, emit, getES5, packMapFunction, evalTemplateES5 } from "../../domain/map_reduce_utils";

export const MockExecutionPlan = {
    'Inventory_ProductLocation.received_stock=': {
        triggers: [{
            viewName: 'Inventory_ProductLocation.received_stock=!1',
            observableFromObserver: 'Inventory_ReceiptItem?(product/ref_ = {{_id}}).quantity',
            observerFromObservable: 'Inventory_ProductLocation/[_id = {{product/ref_}}].received_stock',
            reduce: '_sum',
            queryOptsFromObserver: {
                keyTemplate: ['Inventory_ProductLocation/[_id = {{_id}}].received_stock'],
            }
        }],
        expr: 'Inventory_ProductLocation.received_stock=!1',
    } as CompiledFunction,
    'Inventory_ProductLocation.ordered_stock=': {
        triggers: [{
            observableFromObserver: 'Inventory_OrderItem?(product/ref_ = {{_id}}).quantity',
            observerFromObservable: 'Inventory_ProductLocation?(_id = {{product/ref_}}).ordered_stock',
            reduce: '_sum',
            queryOptsFromObserver: {
                keyTemplate: ['Inventory_ProductLocation?(_id = {{_id}}).ordered_stock'],
            }
        }],
        expr: 'Inventory_ProductLocation.ordered_stock=',
    } as CompiledFunction,
    'Inventory_ProductLocation.available_stock=': {
        triggers: [
            {
                viewName: 'Inventory_ProductLocation.available_stock=!1',
                observableFromObserver: 'Inventory_ProductLocation?(_id = {{_id}}).received_stock',
                observerFromObservable: 'Inventory_ProductLocation/[_id = {{_id}}].available_stock',
                mapExprFromObservable: 'Inventory_ProductLocation.received_stock',
            },
            {
                viewName: 'Inventory_ProductLocation.available_stock=!2',
                observableFromObserver: 'Inventory_ProductLocation?(_id = {{_id}}).ordered_stock',
                observerFromObservable: 'Inventory_ProductLocation/[_id = {{_id}}].available_stock',
                mapExprFromObservable: 'Inventory_ProductLocation.ordered_stock',
            }
        ],
        expr: 'Inventory_ProductLocation.available_stock=!1 - Inventory_ProductLocation.available_stock=!2',
        postConditions: {
            positiveStock: { conditionExpr: '> 0', returnValueExpr: '0 - available_stock' }
        },
    } as CompiledFunction,
    'Forms_ServiceForm.code=': {
        triggers: [
            {
                viewName: 'Forms_ServiceForm.code=!1',
                observableFromObserver: 'Forms_ServiceForm?(EOMONTH(time_interval,-1)=EOMONTH({{time_of_arrival}},-1)).time_of_arrival',
                observerFromObservable: 'Forms_ServiceForm?(EOMONTH(time_interval,-1)=EOMONTH({{time_of_arrival}},-1)).code=',
                map: packMapFunction(
                    function (doc) {
                        if (matchesTypeES5(doc, 'Forms_ServiceForm.time_of_arrival'))
                            emit([getES5(doc, 'Forms_ServiceForm.[EOMONTH(t,-1)]'), getES5(doc, 'Forms_ServiceForm.time_of_arrival'), '0'], 1);
                    }, [matchesTypeES5, getES5], {}),
                reduce: '_count',
                queryOptsFromObserver: { startkey: ['EOMONTH({{time_of_arrival}},-1)', ''], endkey: ['EOMONTH({{time_of_arrival}},-1)', '{{time_of_arrival}}'], group_level: 2 },
            },
            {
                viewName: 'Forms_ServiceForm.code=!2',
                observableFromObserver: 'Forms_ServiceForm?(EOMONTH(time_interval,-1)=EOMONTH({{time_of_arrival}},-1)).code=',
                observerFromObservable: 'Forms_ServiceForm?(EOMONTH(time_interval,-1)=EOMONTH({{time_of_arrival}},-1)).code=',
                mapExprFromObservable: 'Forms_ServiceForm.code=',
            },
        ],
        expr: `Forms_ServiceForm.code=!2 + "-" + TEXT(Forms_ServiceForm.code=!1, "000000000")`,
    } as CompiledFunction,
    'Reports_ServiceCentralizerReport.serviceForms=': {
        triggers: [
            {
                viewName: 'Reports_ServiceCentralizerReport.serviceForms=!1',
                observableFromObserver: 'Forms_ServiceForm?(EOMONTH(time_interval,-1)=EOMONTH({{month}},-1)).(REGEXREPLACE(code, ".*\-0+", "") + "/" + TEXT(time_interval,"dd.mm"))',
                observerFromObservable: 'Forms_ServiceForm?(EOMONTH(time_interval,-1)=EOMONTH({{month}},-1)).serviceForms=',
                map: packMapFunction(
                    function (doc) {
                        if (matchesTypeES5(doc, 'Forms_ServiceForm'))
                            emit([getES5(doc, 'Forms_ServiceForm.[EOMONTH(t,-1)]'), getES5(doc, 'Forms_ServiceForm.time_of_arrival'), '0'], getES5(doc, 'Forms_ServiceForm.time_of_arrival'));
                    }, [matchesTypeES5, getES5], {}),
                reduce: '_count',
                queryOptsFromObserver: { startkey: ['EOMONTH({{time_of_arrival}},-1)', ''], endkey: ['EOMONTH({{time_of_arrival}},-1)', '{{time_of_arrival}}'], group_level: 2 },
            },
        ],
        expr: `Forms_ServiceForm.code=!2 + "-" + TEXT(Forms_ServiceForm.code=!1, "000000000")`,

    }
};
