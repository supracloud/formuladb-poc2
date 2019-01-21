/**
 * © 2017 S.C. CRYSTALKEY S.R.L.
 * License TBD
 */




import { MockMetadata, Forms__ServiceForm } from "./mock-metadata";
import { MockData } from "./mock-data";
import { obj2MapES5 } from "../../ts-utils";


// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line

xdescribe('mock-data', () => {
  let mockMetadata: MockMetadata;
  let mockData: MockData;

  beforeAll(() => {
    mockMetadata = new MockMetadata();
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
