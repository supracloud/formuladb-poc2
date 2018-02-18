


import { MockMetadata, Forms__ServiceForm } from "../../../src/app/common/test/mocks/mock-metadata";
import { MockData } from "../../../src/app/common/test/mocks/mock-data";


// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line

describe('loadTestData', () => {
  let mockMetadata: MockMetadata;
  let mockData: MockData;

  beforeAll(() => {
    mockMetadata = new MockMetadata();
    mockData = new MockData(mockMetadata.entitiesMap);
  });

});
