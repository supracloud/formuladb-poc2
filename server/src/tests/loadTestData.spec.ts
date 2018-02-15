import 'mocha';
import { expect } from 'chai';
import chai = require('chai');
import { MockMetadata, Forms__ServiceForm } from "../../../src/app/common/test/mocks/mock-metadata";
import { MockData } from "../../../src/app/common/test/mocks/mock-data";


// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
// import 'mocha';
describe('loadTestData', () => {
  let mockMetadata: MockMetadata;
  let mockData: MockData;

  before(() => {
    mockMetadata = new MockMetadata();
    mockData = new MockData(mockMetadata.entitiesMap);
  });

  it('ServiceForm mock data should be correct', () => {
    let serviceForm = mockData.getAllForPath(Forms__ServiceForm._id)[0];
    let item = serviceForm.service_form_units[0].items[0].product;
    // let product
    expect(item.ref_).to.equal('/Inventory/Product/UUID-Inventory-Product:1/inventoryLocation/UUID-Inventory-Product-t-1040');
    // expect(item.code).to.equal()
    // expect(item.name",
    // expect(item.locationCode",
    // expect(item.price",
    // expect(item.currency/code",
  });

});
