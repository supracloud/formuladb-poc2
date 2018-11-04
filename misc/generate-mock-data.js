var faker = require('faker');
var fs = require('fs');

let jsonArr = [];
let objs = {};

const UserRoles = ['ADMIN', 'USER'];

function g(count, callback) {
    for (let i = 1; i <= count; i++) {
        let obj = callback(i);
        jsonArr.push(obj);
        objs[obj._id] = obj;
    }
}

g(5, i => ({_id: "General___Actor~~" + i, code: "act" + i, username: faker.internet.userName(), avatar: faker.internet.userName(), name: faker.name.findName(), role: UserRoles[i] || 'USER',  password: faker.internet.password(),  details: faker.name.title(),  state: "ACTIVE_" }));
g(1, i => ({_id: "General___Currency~~1", "rate1": 101,"rate2": 102,"rate3": 103,"rate4": 104,"rate5": 105}));
g(1, i => ({_id: "General___Person~~1"}));
g(1, i => ({_id: "General___User~~1"}));
g(1, i => ({_id: "General___Client~~1"}));
g(1, i => ({_id: "Inventory___Product~~1", code: "p1", barcode: "11111111", name: "Product1", description: "Product 1 Description lorem ipsum bla bla"}));
g(1, i => ({_id: "Inventory___Product___Location~~1___1", locationCode: "Warehouse1", category: "C1", price: 12.5,received_stock__: 15, ordered_stock__: 14, available_stock__: 1}));
g(1, i => ({_id: "Inventory___ProductUnit~~1"}));
g(1, i => ({_id: "Inventory___Order~~1", sales_agent: "John Doe", creation_date: "2018-09-27"}));
g(1, i => ({_id: "Inventory___Order___Item~~1___1", Inventory___Product___Location$product: {_id: "Inventory___Product___Location~~1___1"}, quantity: 10}));
g(1, i => ({_id: "Inventory___Order___Item~~1___2", Inventory___Product___Location$product: {_id: "Inventory___Product___Location~~1___1"}, quantity: 4}));
g(1, i => ({_id: "Inventory___Receipt~~1"}));
g(1, i => ({_id: "Inventory___Receipt___Item~~1___1", Inventory___Product___Location$product: {_id: "Inventory___Product___Location~~1___1"}, quantity: 10}));
g(1, i => ({_id: "Inventory___Receipt___Item~~1___2", Inventory___Product___Location$product: {_id: "Inventory___Product___Location~~1___1"}, quantity: 5}));
g(1, i => ({_id: "Forms___ServiceForm~~1"}));
g(1, i => ({_id: "Reports___DetailedCentralizerReport~~1"}));
g(1, i => ({_id: "Reports___ServiceCentralizerReport~~1"}));

fs.writeFile("../fe/src/app/common/test/mocks/faker-mock-data.ts", 
    "export const FAKER_MOCK_DATA = [\n"
    + jsonArr.map(x => JSON.stringify(x)).join(",\n")
    + "\n];\n",
    function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    }
);
