import { GitStorage } from "./git-storage";

describe('git-storage', () => {
    it("should get list of files", async (done) => {
        let gitStorage = new GitStorage();
        let hotelBookingFiles = await gitStorage.getFiles('frmdb-apps', 'hotel-booking');

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

    it("should get page content", async (done) => {
        let gitStorage = new GitStorage();

        let page = await gitStorage.getPageContent('frmdb-apps', 'hotel-booking', 'index.html');
        expect(page).toContain('<h2>Relax Your Mind</h2>');

        done();
    });

});
