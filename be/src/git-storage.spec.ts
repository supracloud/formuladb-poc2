import { getFiles, getPage } from "./git-storage";

describe('git-storage', () => {
    it("should get list of files", async (done) => {
        let hotelBookingFiles = await getFiles('frmdb-apps', 'hotel-booking');

        expect(hotelBookingFiles as any).toContain(jasmine.objectContaining({
            "id": "61a92a3ea161e9b26a2af06d1cdcc6a726e3d8c9",
            "name": "booking.html",
            "type": "blob",
            "path": "booking.html",
            "mode": "100644"
        }));
        expect(hotelBookingFiles as any).toContain(jasmine.objectContaining({
            "id": "e7e765d7a884a98c936120dadcc214ca81070a7c",
            "name": "index.html",
            "type": "blob",
            "path": "index.html",
            "mode": "100644"
        }));

        done();
    });

    fit("should get page content", async (done) => {
        let page = await getPage('frmdb-apps', 'hotel-booking', 'index');
        
        expect(page).toContain('<h2>Relax Your Mind</h2>');

        done();
    });

});
