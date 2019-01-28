/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */




import { MockMetadata, Forms__ServiceForm, ExampleApps } from "./mock-metadata";
import { MockData } from "./mock-data";


// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line

xdescribe('mock-data', () => {
  let mockMetadata: MockMetadata;
  let mockData: MockData;

  beforeAll(() => {
    mockMetadata = new MockMetadata(ExampleApps.service);
    mockData = new MockData(mockMetadata.schema.entities);
  });

  it('should correctly mock a ServiceForm', () => {
    let serviceForm: any = mockData.getAllForPath(Forms__ServiceForm._id)[0];
    let item = serviceForm.service_form_units[0].items[0].product;
    
    expect(item.ref_).toEqual('Inventory_Product/UUID-Inventory-Product:3/inventoryLocation/UUID-Inventory-Product-t-3040');
    // expect(item.code).toEqual()
    // expect(item.name",
    // expect(item.locationCode",
    // expect(item.price",
    // expect(item.currency/code",
  });

});
