import { HotelBookingApp, HotelBookingSchema } from "./metadata";
import { navigate, setValue } from "@fe/fe-test-urils.spec";

/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

const fetchMock = require('fetch-mock');

const booking_fragment_html = /*html*/`
<div data-frmdb-record="Booking~~">
    <div class="input-group"><input type='date' data-frmdb-value="::start_date" /></div>
    <div class="input-group"><input type='date' data-frmdb-value="::end_date" /></div>
    <div class="input-group"><input type='number' placeholder="Nb Adults" data-frmdb-value="::nb_adults"/></div>
    <div class="input-group"><input type='number' placeholder="Nb Children" data-frmdb-value="::nb_children"/></div>
    <div class="input-group"><input type='number' data-frmdb-value="::days" disabled /></div>
</div>
`;

const index_html = /*html*/`
    <div class="container">
        <frmdb-fragment name="booking [F]" data-vvveb-disabled></frmdb-fragment>
    </div>
`;

const booking_html = /*html*/`
<div class="container">
    <frmdb-fragment name="booking [F]" data-vvveb-disabled></frmdb-fragment>
</div>
`;

import { FragmentComponent } from '@fe/fragment/fragment.component';
import { ServerEventModifiedFormDataN } from "@domain/event";

describe('[fe] Hotel Booking', () => {
    let clock;

    beforeEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

        fetchMock.get('/formuladb-api/test-tenant/hotel-booking', HotelBookingApp);
        fetchMock.get('/formuladb-api/test-tenant/hotel-booking/schema', HotelBookingSchema);
        fetchMock.get('/test-tenant/hotel-booking/booking._fragment_.html', booking_fragment_html);

        fetchMock.post('/formuladb-api/test-tenant/hotel-booking/event', {
            type: ServerEventModifiedFormDataN,
            obj: { 
                _id: 'Booking~~1234NewId', 
                start_date: '2019-01-01',
                end_date: '2019-01-07',
                nb_adults: "2",
                nb_children: "2",
                days: 7,
            },
        });

    });

    afterEach(() => {
        fetchMock.restore();
        if (clock) clock.uninstall();
    })

    fit('User should be able to create new booking', async (done) => {
        await navigate('/test-tenant/hotel-booking', index_html);
        
        expect(document.querySelector('frmdb-fragment') instanceof FragmentComponent).toEqual(true);

        let start_date_El = document.querySelector('[data-frmdb-value="::start_date"]') as HTMLInputElement;
        let end_date_El = document.querySelector('[data-frmdb-value="::end_date" ]') as HTMLInputElement;
        let nb_adults_El = document.querySelector('[data-frmdb-value="::nb_adults"]') as HTMLInputElement;
        let nb_children_El = document.querySelector('[data-frmdb-value="::nb_children"]') as HTMLInputElement;
        let days_El = document.querySelector('[data-frmdb-value="::days"]') as HTMLInputElement;


        setValue(start_date_El, '2019-01-01');
        setValue(end_date_El, '2019-01-07');
        setValue(nb_adults_El, "2");
        setValue(nb_children_El, "2");

        await new Promise(resolve => setTimeout(resolve, 500));
        expect(days_El.value).toEqual('7');

        await navigate('/test-tenant/hotel-booking/booking', booking_html);

        start_date_El = document.querySelector('[data-frmdb-value="::start_date"]') as HTMLInputElement;
        end_date_El = document.querySelector('[data-frmdb-value="::end_date" ]') as HTMLInputElement;
        nb_adults_El = document.querySelector('[data-frmdb-value="::nb_adults"]') as HTMLInputElement;
        nb_children_El = document.querySelector('[data-frmdb-value="::nb_children"]') as HTMLInputElement;

        expect(start_date_El.value).toEqual('2019-01-01');
        expect(end_date_El.value).toEqual('2019-01-07');
        expect(nb_adults_El.value).toEqual("2");
        expect(nb_children_El.value).toEqual("2");

        done();
    });

});
