import { by, browser, Key } from 'protractor';
import { AppIntroVideoScenario } from "./app-intro-video-scenario";

//TODO: this must be made generic for any app, be based on data attribute selectors and on an entity definition and test data
export function stepCardsDataBinding(scenario: AppIntroVideoScenario) {

    scenario.SCEN.step(`For example you can display the room types as a list of cards`, async () => {
        try {
            await scenario.API.scrollIframe(950);
            await browser.sleep(150);
            let el = await scenario.API.clickByCssInMain('[href="#data-left-panel-tab"]');
            
            console.log(new Date(), 'delete hardcoded cards, leave just the first one');
            for (let i = 0; i < 3; i++) {
                el = await scenario.API.byCssInFrame('iframe', '.accomodation_area .row .col-lg-3:nth-child(2)');
                await scenario.API.clickWithJs(el);
                el = await scenario.API.clickByCssInMain('#select-box #select-actions #delete-btn');
            }
            
            console.log(new Date(), 'configure data binding for the fist card');
            el = await scenario.API.byCssInFrame('iframe', '.accomodation_area .row .col-lg-3:nth-child(1)');
            await scenario.API.clickWithJs(el);
            el = await scenario.API.byCssInMain('[data-key="data-frmdb-table-limit"] input');
            await el.sendKeys('1');
            el = await scenario.API.clickByCssInMain('[data-key="data-frmdb-table"] select');
            el = await scenario.API.clickByCssInMain('[data-key="data-frmdb-table"] select [value="$FRMDB.RoomType[]"]');
            
            console.log(new Date(), 'configure data binding for img');
            el = await scenario.API.byCssInFrame('iframe', '.accomodation_area .row .col-lg-3:nth-child(1) img');
            await scenario.API.clickWithJs(el);
            el = await scenario.API.clickByCssInMain('[data-key="data-frmdb-value"] select');
            el = await scenario.API.clickByCssInMain('[data-key="data-frmdb-value"] select [value="$FRMDB.RoomType[].picture"]');
            
            console.log(new Date(), 'configure data binding for h4');
            el = await scenario.API.byCssInFrame('iframe', '.accomodation_area .row .col-lg-3:nth-child(1) a h4');
            await scenario.API.clickWithJs(el);
            el = await scenario.API.clickByCssInMain('[data-key="data-frmdb-value"] select');
            el = await scenario.API.clickByCssInMain('[data-key="data-frmdb-value"] select [value="$FRMDB.RoomType[].name"]');
            
            console.log(new Date(), 'repeat card 7 times');
            el = await scenario.API.byCssInFrame('iframe', '.accomodation_area .row .col-lg-3:nth-child(1)');
            await scenario.API.clickWithJs(el);
            el = await scenario.API.byCssInMain('[data-key="data-frmdb-table-limit"] input');
            await el.clear(); await el.sendKeys('7'); await el.sendKeys(Key.ENTER);
            
            console.log(new Date(), 'scroll to each of the 7 cards');
            el = await scenario.API.byCssInFrame('iframe', '.accomodation_area .row .col-lg-3:nth-child(2)');
            await scenario.API.clickWithJs(el);
            await scenario.API.scrollIframe(980);
            
            el = await scenario.API.byCssInFrame('iframe', '.accomodation_area .row .col-lg-3:nth-child(3)');
            await scenario.API.clickWithJs(el);
            await scenario.API.scrollIframe(1000);
            
            el = await scenario.API.byCssInFrame('iframe', '.accomodation_area .row .col-lg-3:nth-child(4)');
            await scenario.API.clickWithJs(el);
            await scenario.API.scrollIframe(1100);
            
            el = await scenario.API.byCssInFrame('iframe', '.accomodation_area .row .col-lg-3:nth-child(5)');
            await scenario.API.clickWithJs(el);
            await scenario.API.scrollIframe(1200);
            
            el = await scenario.API.byCssInFrame('iframe', '.accomodation_area .row .col-lg-3:nth-child(6)');
            await scenario.API.clickWithJs(el);
            await scenario.API.scrollIframe(1300);
            
            el = await scenario.API.byCssInFrame('iframe', '.accomodation_area .row .col-lg-3:nth-child(7)');
            await scenario.API.clickWithJs(el);
            await scenario.API.scrollIframe(1350);
            
        } catch (err) {
            console.error(err);
            throw err;
        }
    });
}