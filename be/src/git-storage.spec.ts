import { getFiles, getPageContent } from "./git-storage";

describe('git-storage', () => {
    it("should get list of files", async (done) => {
        let hotelBookingFiles = await getFiles('frmdb-apps', 'hotel-booking');

        expect(hotelBookingFiles as any).toContain(jasmine.objectContaining({
            "name": "booking.html",
            "type": "blob",
            "path": "booking.html",
            "mode": "100644"
        }));
        expect(hotelBookingFiles as any).toContain(jasmine.objectContaining({
            "name": "index.html",
            "type": "blob",
            "path": "index.html",
            "mode": "100644"
        }));

        done();
    });

    fit("should get page content", async (done) => {
        let page = await getPageContent('frmdb-apps', 'hotel-booking', 'index.html');
        expect(page).toContain('<h2>Relax Your Mind</h2>');

        page = await getPageContent('frmdb-apps', 'hotel-booking', '_head.html');
        expect(page).toContain('<link');

        page = await getPageContent('frmdb-apps', 'hotel-booking', '_script.html');
        expect(page).toContain('<script');

        done();
    });

});
