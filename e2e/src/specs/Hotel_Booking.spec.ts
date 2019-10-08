/**
* © 2019 S.C. FORMULA DATABASE S.R.L.
* License TBD
* 
*/

import * as _ from "lodash";
import { E2EApi } from '../e2e-api';
import { browser, Key } from 'protractor';
import * as e2e_utils from "../utils";
import { E2eScenario } from "@e2e/e2e-scenario";

var MESSAGES: string[] = [];
var DURATIONS: number[] = [];

const SCEN = new E2eScenario;
const API = new E2EApi();

SCEN.describe('hotel-booking view mode testing', () => {
    
    MESSAGES.push('<speak>Welcome to the Hotel Booking draft intro video. As an admin you can customize the Hotel Booking app. On the left side pane there are the available data tables<break time="3s"/></speak>');
    DURATIONS.push(0);
    it('should display the home page', async (done) => {
        // check that page loads and title is as expected
        await API.navigateToHome();
        expect(await API.getPageTitle()).toEqual('Relax Your Mind');
        
        if (browser.params.recordings || browser.params.audio) {
            e2e_utils.setup_directories();
        }
        
        if (browser.params.audio) {
            await e2e_utils.create_audio_tracks(MESSAGES, DURATIONS);
        }
        
        if (browser.params.recordings) {
            stream = e2e_utils.create_stream_and_run();
        }

        done();
    });

    it('dismiss the intro-video modal', async (done) => {
        try {
            let found = await e2e_utils.retryUntilTrueOrRetryLimitReached(async () => {
                let el = await API.byCss('#intro-video-modal');
                let cls = await el.getAttribute('class');
                return cls.indexOf('show') >= 0;
            })
            expect(found).toEqual(true);
            await browser.sleep(150);
            let el = await API.byCss('#intro-video-modal [data-dismiss="modal"]');
            await el.click();
            await browser.sleep(150);
        } catch (err) {
            console.error(err);
            done.fail(err);
        }

        console.log(new Date(), "DISMISS intro video modal");
        done();
    });    
    
    it('should have tables drop down', async (done) => {
        console.log(new Date(), "checking tables dropdown");
        await API.byCss('#intro-video-modal:not(.show)');
        await browser.sleep(1800);//WTF modal is hidden but dropdown is still not clickable
        let el = await API.getTablesDropdown();
        await el.click();
        done();
    });
    
    MESSAGES.push('<speak>For the Hotel Booking app you will find a few predefined Tables like RoomType, Room or Booking<break time="3s"/></speak>');
    DURATIONS.push(0);
    it('should load the booking tables: RoomType, Room, Booking', async (done) => {
        await e2e_utils.handle_generic_action(DURATIONS[action_index++]);
        // check that at least hotel booking tables ('RoomType', 'Room', 'Booking') are displayed in the left navbar
        let foundTables = await e2e_utils.retryUntilTrueOrRetryLimitReached(async () => {
            let tables = await API.getTables();
            console.log(tables);
            return _.difference(['RoomType', 'Room', 'Booking'], tables).length === 0
        })
        expect(foundTables).toEqual(true);

        done();
    });
    
    it('should load the room types list', async (done) => {
        // check that room types list is correctly displayed; verify the first row against the e2e data
        let roomTypes: { id: string, value: string }[] = await API.getFirstRoomTypeData();
        console.log(roomTypes);
        //expect(['RoomType', 'Room', 'Booking'].sort().toString() == bookingTables.sort().toString());

        done();
    });
    
    MESSAGES.push('<speak>You will also find the predefined Pages like the home page<break time="1s"/>, about page<break time="1s"/>, gallery page<break time="1s"/>, contact page<break time="1s"/></speak>');
    DURATIONS.push(0);
    it('should load the page list: index.html, about.html, contact.html', async (done) => {
        //close tables dropdown
        let el = await API.getTablesDropdown();
        await el.click();

        await e2e_utils.handle_element_click(await API.getPagesDropdown(), DURATIONS[action_index++]);
        // check that at least hotel booking tables ('RoomType', 'Room', 'Booking') are displayed in the left navbar
        let foundPages = await e2e_utils.retryUntilTrueOrRetryLimitReached(async () => {
            let pages = await API.getPages();
            console.log(pages);
            return _.difference(['index.html', 'about.html', 'contact.html'], pages).length === 0
        })
        expect(foundPages).toEqual(true);

        done();
    });
    
    MESSAGES.push('<speak>You can get started quickly with very simple cosmetic/branding changes like change the color palette<break time="4s"/></speak>');
    DURATIONS.push(0);
    it('should change theme color', async (done) => {
        await e2e_utils.handle_element_click(await API.byCss('#frmdb-editor-color-palette-select'), DURATIONS[action_index++]);
        await browser.sleep(2000);
        let colors = await API.allByCss('[aria-labelledby="frmdb-editor-color-palette-select"] .dropdown-item');
        await browser.sleep(550);
        await colors[1].click();
        await browser.sleep(200);
        await browser.sleep(3500);
        let icon = await API.getLogoIcon();
        let color = await icon.getCssValue('color');
        expect(color).toEqual('rgba(255, 0, 0, 1)');
        
        await (await API.byCss('#frmdb-editor-color-palette-select')).click();
        colors = await API.allByCss('[aria-labelledby="frmdb-editor-color-palette-select"] .dropdown-item');
        await colors[0].click();
        await browser.sleep(2500);
        icon = await API.getLogoIcon();
        color = await icon.getCssValue('color');
        expect(color).toEqual('rgba(243, 195, 0, 1)');

        done();
    });
    
    MESSAGES.push('<speak>and also the website language<break time="5s"/></speak>');
    DURATIONS.push(0);
    it('should change language', async (done) => {
        await e2e_utils.handle_element_click(await API.byCss('#frmdb-editor-i18n-select'), DURATIONS[action_index++]);
        let languages = await API.allByCss('[aria-labelledby="frmdb-editor-i18n-select"] .dropdown-item');
        await browser.sleep(550);
        await languages[1].click();
        await browser.sleep(2200);
        expect(await API.getPageTitle()).toEqual('Détends ton esprit');
        
        await (await API.byCss('#frmdb-editor-i18n-select')).click();
        languages = await API.allByCss('[aria-labelledby="frmdb-editor-i18n-select"] .dropdown-item');
        await languages[0].click();
        await browser.sleep(2200);
        expect(await API.getPageTitle()).toEqual('Relax Your Mind');

        done();
    });
    
    MESSAGES.push('<speak>You can create more powerful customizations by binding Page elements to data from Table Records, which allows dynamic content to be created from your data<break time="4s"/></speak>');
    DURATIONS.push(0);
    it('should highlight column for data binding', async (done) => {
        await e2e_utils.handle_generic_action(DURATIONS[action_index++]);
        await API.scrollIframe(350);
        let arivalDateFormEl = await API.byCssInFrame('[data-frmdb-value="::start_date"]');
        await browser.sleep(1051);
        let departureDateFormEl = await API.byCssInFrame('[data-frmdb-value="::end_date"]');
        await API.clickWithJs(arivalDateFormEl);
        await browser.sleep(150);
        await API.clickWithJs(departureDateFormEl);
        await browser.sleep(150);
        await API.clickWithJs(arivalDateFormEl);
        
        await browser.sleep(1051);
        await API.clickWithJs(departureDateFormEl);
        //TODO check background color of column in the data grid
        
        await browser.sleep(1051);
        //TODO check background color of column in the data grid
        let nbAdultsFormEl = await API.byCssInFrame('[data-frmdb-value="::nb_adults"]');
        await API.clickWithJs(nbAdultsFormEl);
        
        await browser.sleep(1051);
        //TODO check background color of column in the data grid
        let nbChildrenFormEl = await API.byCssInFrame('[data-frmdb-value="::nb_children"]');
        await API.clickWithJs(nbChildrenFormEl);
        await browser.sleep(1051);
        //TODO check background color of column in the data grid

        done();
    });
    
    MESSAGES.push('<speak>For example you can display the room types as a list of cards<break time="20s"/></speak>');
    DURATIONS.push(0);
    it('should work with data binding for cards', async (done) => {
        try {
            await e2e_utils.handle_generic_action(DURATIONS[action_index++]);
            await API.scrollIframe(950);
            await browser.sleep(150);
            let el = await API.byCss('[href="#data-left-panel-tab"]');
            await el.click();
            
            console.log(new Date(), 'delete hardcoded cards, leave just the first one');
            for (let i = 0; i < 3; i++) {
                el = await API.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(2)');
                await API.clickWithJs(el);
                await browser.sleep(956);
                el = await API.byCss('#select-box #select-actions #delete-btn');
                await el.click();
            }
            
            console.log(new Date(), 'configure data binding for the fist card');
            el = await API.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(1)');
            await API.clickWithJs(el);
            await browser.sleep(956);
            el = await API.byCss('[data-key="data-frmdb-table-limit"] input');
            await el.sendKeys('1');
            await browser.sleep(956);
            el = await API.byCss('[data-key="data-frmdb-table"] select');
            await el.click();
            await browser.sleep(956);
            el = await API.byCss('[data-key="data-frmdb-table"] select [value="$FRMDB.RoomType[]"]');
            await el.click();
            await browser.sleep(956);
            
            console.log(new Date(), 'configure data binding for img');
            el = await API.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(1) img');
            await API.clickWithJs(el);
            await browser.sleep(956);
            el = await API.byCss('[data-key="data-frmdb-value"] select');
            await el.click();
            await browser.sleep(956);
            el = await API.byCss('[data-key="data-frmdb-value"] select [value="$FRMDB.RoomType[].picture"]');
            await el.click();
            await browser.sleep(956);
            
            console.log(new Date(), 'configure data binding for h4');
            el = await API.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(1) a h4');
            await API.clickWithJs(el);
            await browser.sleep(956);
            el = await API.byCss('[data-key="data-frmdb-value"] select');
            await el.click();
            await browser.sleep(956);
            el = await API.byCss('[data-key="data-frmdb-value"] select [value="$FRMDB.RoomType[].name"]');
            await el.click();
            await browser.sleep(956);
            
            console.log(new Date(), 'repeat card 7 times');
            el = await API.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(1)');
            await API.clickWithJs(el);
            await browser.sleep(956);
            el = await API.byCss('[data-key="data-frmdb-table-limit"] input');
            await el.clear(); await el.sendKeys('7'); await el.sendKeys(Key.ENTER);
            await browser.sleep(956);
            
            console.log(new Date(), 'scroll to each of the 7 cards');
            el = await API.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(2)');
            await API.clickWithJs(el);
            await API.scrollIframe(980);
            await browser.sleep(550);
            el = await API.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(3)');
            await API.clickWithJs(el);
            await API.scrollIframe(1000);
            await browser.sleep(550);
            el = await API.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(4)');
            await API.clickWithJs(el);
            await API.scrollIframe(1100);
            await browser.sleep(550);
            el = await API.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(5)');
            await API.clickWithJs(el);
            await API.scrollIframe(1200);
            await browser.sleep(550);
            el = await API.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(6)');
            await API.clickWithJs(el);
            await API.scrollIframe(1300);
            await browser.sleep(550);
            el = await API.byCssInFrame('.accomodation_area .row .col-lg-3:nth-child(7)');
            await API.clickWithJs(el);
            await API.scrollIframe(1350);
            await browser.sleep(550);
        } catch (err) {
            console.error(err);
            done.fail(err);
        }

        done();
    });
    
    MESSAGES.push('<speak>You can use Formulas to perform computations<break time="12s"/></speak>');
    DURATIONS.push(0);
    it('should allow basic formula editing', async (done) => {
        try {
            await e2e_utils.handle_generic_action(DURATIONS[action_index++]);
            
            //select booking table
            let el;
            await browser.sleep(957);
            let els = await API.allByCss('[data-frmdb-value="$frmdb.tables[]._id"]');
            let found = false;
            for (el of els) {
                let txt = await el.getAttribute('innerText');
                if ('Booking' === txt) {
                    found = true;
                    await (await API.byCss('[data-toggle="dropdown"][data-frmdb-value="$frmdb.selectedTableId"]')).click();
                    await browser.sleep(957);
                    await el.click();
                }
            }
            expect(found).toEqual(true);
            await browser.sleep(957);
            
            //select day column
            el = await API.byCssInShadowDOM('frmdb-data-grid', '.ag-row:nth-child(2) .ag-cell[col-id="days"]');
            await el.click();
            await browser.sleep(150);
            el = await API.byCssInShadowDOM('frmdb-data-grid', '.ag-row:nth-child(2) .ag-cell[col-id="nb_children"]');
            await el.click();
            await browser.sleep(150);
            el = await API.byCssInShadowDOM('frmdb-data-grid', '.ag-row:nth-child(2) .ag-cell[col-id="days"]');
            await el.click();
            await browser.sleep(957);
            
            el = await API.byCss('.editor-textarea');
            expect(await el.getAttribute('value')).toEqual('DATEDIF(start_date, end_date, "D") + 1');
            await browser.sleep(250);
            
            el = await API.byCss('#toggle-formula-editor');
            await el.click();
            await browser.sleep(957);
            
            el = await API.byCss('.editor-textarea');
            await el.click();
            await browser.sleep(551);
            await browser.sleep(957);
            await el.sendKeys('00'); await el.sendKeys(Key.TAB);
            await browser.sleep(957);
            
            el = await API.byCss('#apply-formula-changes');
            await el.click();
            await browser.sleep(957);
            
            var alertDialog = browser.switchTo().alert();
            let txt = await alertDialog.getText();
            expect(txt).toContain('Please confirm, apply modifications to DB');
            await alertDialog.accept();  // Use to accept (simulate clicking ok)
            await browser.switchTo().defaultContent();
            await browser.sleep(957);
            await browser.sleep(957);
            
            el = await API.byCssInShadowDOM('frmdb-data-grid', '.ag-row:nth-child(2) .ag-cell[col-id="days"]');
            await el.click();
            txt = await el.getAttribute('innerText');
            expect(txt).toContain('104.00');
            await browser.sleep(1150);
            
        } catch (err) {
            console.error(err);
            done.fail(err);
        }

        done();
    });
    
    MESSAGES.push('<speak>Please follow out website for news about the official launch and more details like how to create Tables and Pages, perform data rollups with SUMIF/COUNTIF, define validations and much much more.<break time="2s"/></speak>');
    DURATIONS.push(0);
    it('please follow formuladb.io', async (done) => {
        await e2e_utils.handle_generic_action(DURATIONS[action_index++]);

        done();
    });
    
    it('Should end recording and cleanup', async (done) => {
        if (browser.params.recordings) {
            await e2e_utils.wait_for_ffmpeg_stream_to_finish(stream);
            if (browser.params.audio) {
                await e2e_utils.concat_audio(MESSAGES);
                await e2e_utils.merge_video_and_audio();
            } else {
                e2e_utils.create_final_video();
            }
            await e2e_utils.crop_video();
            await e2e_utils.create_gif_palette_and_video();
            e2e_utils.cleanup(test_name);
        }

        done();
    });
    
});
