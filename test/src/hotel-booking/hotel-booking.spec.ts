import { HotelBookingApp, HotelBookingSchema } from "./metadata";
import { navigate, setValue, testSleep } from "@fe/fe-test-urils.spec";

/**
* © 2018 S.C. FORMULA DATABASE S.R.L.
* License TBD
*/

const fetchMock = require('fetch-mock');

const booking_fragment_html = /*html*/`
    <div class="input-group"><input type='date' data-frmdb-value="::start_date" /></div>
    <div class="input-group"><input type='date' data-frmdb-value="::end_date" /></div>
    <div class="input-group"><input type='number' placeholder="Nb Adults" data-frmdb-value="::nb_adults"/></div>
    <div class="input-group"><input type='number' placeholder="Nb Children" data-frmdb-value="::nb_children"/></div>
    <div class="input-group"><input type='number' data-frmdb-value="::days" disabled /></div>
`;

const index_html = /*html*/`
    <div class="container">
        <div data-frmdb-record="Booking~~" data-frmdb-record-no-autosave>
            <frmdb-fragment name="booking [F]" data-vvveb-disabled></frmdb-fragment>
        </div>
    </div>
`;

const booking_html = /*html*/`
<div class="container">
    <div data-frmdb-record="Booking~~">
        <frmdb-fragment name="booking [F]" data-vvveb-disabled></frmdb-fragment>
    </div>
</div>
`;

import { FragmentComponent } from '@fe/fragment/fragment.component';
import { ServerEventModifiedFormDataN } from "@domain/event";

describe('[FE] Hotel Booking', () => {
    let clock;

    beforeEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

        fetchMock.get('/formuladb-api/test-tenant/hotel-booking', HotelBookingApp);
        fetchMock.get('/formuladb-api/test-tenant/hotel-booking/schema', HotelBookingSchema);
        fetchMock.get('/test-tenant/hotel-booking/booking._fragment_.html', booking_fragment_html);
    });

    afterEach(() => {
        fetchMock.restore();
        if (clock) clock.uninstall();
    })

    describe('User should be able to create new booking and update it', () => {
        let start_date_El: HTMLInputElement;
        let end_date_El: HTMLInputElement;
        let nb_adults_El: HTMLInputElement;
        let nb_children_El: HTMLInputElement;
        let days_El: HTMLInputElement;

        let bookingObjFromServer = {
            _id: 'Booking~~1234NewId', 
            start_date: '2019-01-01',
            end_date: '2019-01-07',
            nb_adults: "2",
            nb_children: "2",
            days: 8,
        };

        it("user navigates to index page, and fills in preliminary data for a new booking", async (done) => {
            await navigate('/test-tenant/hotel-booking', index_html);

            expect(document.querySelector('frmdb-fragment') instanceof FragmentComponent).toEqual(true);

            start_date_El = document.querySelector('[data-frmdb-value="::start_date"]') as HTMLInputElement;
            end_date_El = document.querySelector('[data-frmdb-value="::end_date" ]') as HTMLInputElement;
            nb_adults_El = document.querySelector('[data-frmdb-value="::nb_adults"]') as HTMLInputElement;
            nb_children_El = document.querySelector('[data-frmdb-value="::nb_children"]') as HTMLInputElement;
    
            setValue(start_date_El, '2019-01-01');
            setValue(end_date_El, '2019-01-07');
            setValue(nb_adults_El, "2");
            setValue(nb_children_El, "2");
    
            await testSleep(110, "wait for new record cache to fill");
            
            done();
        });

        it("user clicks 'Book Now', navigates to the booking page, all data introduced on index page is visible", async (done) => {

            await navigate('/test-tenant/hotel-booking/booking', booking_html);

            start_date_El = document.querySelector('[data-frmdb-value="::start_date"]') as HTMLInputElement;
            end_date_El = document.querySelector('[data-frmdb-value="::end_date" ]') as HTMLInputElement;
            nb_adults_El = document.querySelector('[data-frmdb-value="::nb_adults"]') as HTMLInputElement;
            nb_children_El = document.querySelector('[data-frmdb-value="::nb_children"]') as HTMLInputElement;
            days_El = document.querySelector('[data-frmdb-value="::days"]') as HTMLInputElement;
    
            expect(start_date_El.value).toEqual('2019-01-01');
            expect(end_date_El.value).toEqual('2019-01-07');
            expect(nb_adults_El.value).toEqual("2");
            expect(nb_children_El.value).toEqual("2");

            done();
        });

        it("User updates the booking but server validation fails", async (done) => {

            fetchMock.post('/formuladb-api/test-tenant/hotel-booking/event', {
                type: ServerEventModifiedFormDataN,
                state_: "ABORT",
                reason_: "ABORTED_FAILED_VALIDATIONS_RETRIES_EXCEEDED",
                error_: "Validations failed: maxBooking",
                obj: {
                    ...bookingObjFromServer,
                    _id: "Booking~~", //still a new object, not saved because of validation failure
                },
            });
    
            setValue(end_date_El, '2019-08-01');
            await testSleep(500, "wait for debounced onchange handlers to fire");
            expect(end_date_El.validationMessage).toEqual('Validations failed: maxBooking');

            done();
        });

        it("User updates the booking and it is saved successfully", async (done) => {
            fetchMock.post('/formuladb-api/test-tenant/hotel-booking/event', {
                type: ServerEventModifiedFormDataN,
                obj: bookingObjFromServer,
            });

            setValue(end_date_El, '2019-01-08');
            testSleep(500, "wait for debounced onchange handlers to fire");
            await new Promise(resolve => setTimeout(resolve, 500));
            
            expect(days_El.value).toEqual('8');
            expect(start_date_El.validity.valid).toEqual(true);
            expect(end_date_El.validity.valid).toEqual(true);
            expect(nb_adults_El.validity.valid).toEqual(true);
            expect(nb_children_El.validity.valid).toEqual(true);
            expect(days_El.validity.valid).toEqual(true);

            done();
        });        
    });
});
