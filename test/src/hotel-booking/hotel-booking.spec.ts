/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

import { HotelBookingSchema } from "./metadata";

const fetchMock = require('fetch-mock');


describe('[FE - for now] App hotel-booking', () => {
    beforeEach(() => {
        fetchMock.get('/formuladb-api/unknown-app/schema', HotelBookingSchema);
    });

    afterEach(fetchMock.restore)

    it('User should be able to book a room', async (done) => { 
        

        done();
    });
});
