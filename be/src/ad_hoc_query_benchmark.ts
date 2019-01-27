import { createInterface } from 'readline';
import { createReadStream } from 'fs';

import { KeyValueStoreFactoryMem } from "@storage/mem/key_value_store_mem";
import { $s2e } from '@storage/formula_compiler';
import { evalExprES5 } from '@storage/map_reduce_utils';


interface Prlp {
    _id: string;
    id: number;
    product_list_id: number;
    _sy5_index: number;
    inventory_code: string;
    product_code: string;
    quantity: 1;
    quantity_error: number;
    quantity_delta: number;
    clientty_delta: number;
    quantity_del: number;
    client_stock: number;
    name: number;
    price: number;
    currency_code: number;
    state: string;
    created_at: string;
    updated_at: string;
};

let kvsFactory = new KeyValueStoreFactoryMem();
let kvs = kvsFactory.createKeyObjS<Prlp>('test');

var lineReader = createInterface({
    input: createReadStream('../ep-data/product_list_products.json')
});

let filterExpr = $s2e('("2012-07-07T12:24:34.649196" == updated_at || "2018-10-23T21:20:36.627208" == updated_at) && MAX(0, quantity) > -2');

let filterFunc = new Function('obj', 'return ("2012-07-07T12:24:34.649196" == obj.updated_at || "2018-10-23T21:20:36.627208" == obj.updated_at) && Math.max(0, obj.quantity) > -2;');

let time = Date.now();
let i = 0;
let rawData: string[] = [];
let DB: Prlp[] = [];
lineReader.on('line', function (line) {
    if (line[1] !== '{') return;
    rawData.push(line);
    // obj._id = 'Prlp~~' + obj.id;
    // kvs.put(obj);
    i++;
    if (i%500000 == 0) console.log(i);
})
.on('close', () => {
    console.log(new Date(), "finished loading data in " + (Date.now() - time) + " ms");
    time = Date.now();

    i = 0;
    for (let line of rawData) {
        let obj = JSON.parse(line);
        DB.push(obj);
        i++;
        if (i%500000 == 0) console.log(i);
    }

    console.log(new Date(), "finished JSON parsing in " + (Date.now() - time) + " ms");
    time = Date.now();
    
    let values = [
        "2012-07-07T12:24:34.649196",
        "2018-10-23T21:20:36.627208",
        "2012-07-11T11:02:33.553823",
        "2012-09-05T11:36:11.789066",
        "2012-09-14T13:01:01.249575",
        "2014-05-29T14:28:37.05063",
        "2018-10-23T21:20:36.627208",
    ];
    
    let ret: Prlp[] = [];
    for (let obj of DB) {
        // if (values.includes(obj.updated_at)) {
        // if ("2018-10-23T21:20:36.627208" === obj.updated_at) {
        // if (evalExprES5(obj, filterExpr)) {
        if (filterFunc(obj)) {
            ret.push(obj);
        }
    }
    console.log(new Date(), "finished filtering data in " + (Date.now() - time) + " ms");
    console.log(ret.length);

});
