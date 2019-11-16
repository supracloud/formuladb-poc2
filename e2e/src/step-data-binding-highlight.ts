import { by, browser } from 'protractor';
import { AppIntroVideoScenario } from "./app-intro-video-scenario";
import { CURRENT_COLUMN_HIGHLIGHT_STYLE } from '@domain/constants';


export function stepDataBindingHighlight(scenario: AppIntroVideoScenario) {

    scenario.SCEN.step(`You can create more powerful customizations by binding Page elements to data from Table Records, which allows dynamic content to be created from your data`, async () => {

        async function getColBgImage(colName) {
            let el = await scenario.API.byCssInShadowDOM('frmdb-data-grid', `.ag-cell[col-id="${colName}"]`);
            return await el.getCssValue('background-image');
        }
        async function assertColBgImage(colName, value) {
            await browser.wait(async () => (await getColBgImage(colName)) == value, 5000, `wait for ${colName} to have bg ${value}, found ${await getColBgImage(colName)}`);
            expect(await getColBgImage(colName)).toEqual(value);
        }

        await scenario.API.scrollIframe(280);
        await scenario.API.clickByCssInFrameWithJs('iframe', '[data-frmdb-value="::start_date"]');
        await assertColBgImage('start_date', CURRENT_COLUMN_HIGHLIGHT_STYLE['background-image']);

        await scenario.API.clickByCssInFrameWithJs('iframe', '[data-frmdb-value="::end_date"]');
        await assertColBgImage('end_date', CURRENT_COLUMN_HIGHLIGHT_STYLE['background-image']);

        await scenario.API.clickByCssInFrameWithJs('iframe', '[data-frmdb-value="::nb_adults"]');
        await assertColBgImage('nb_adults', CURRENT_COLUMN_HIGHLIGHT_STYLE['background-image']);

        await scenario.API.clickByCssInFrameWithJs('iframe', '[data-frmdb-value="::nb_children"]');
        await assertColBgImage('nb_children', CURRENT_COLUMN_HIGHLIGHT_STYLE['background-image']);
    });
}
