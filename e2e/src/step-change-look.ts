import { by, browser } from 'protractor';
import { AppIntroVideoScenario } from "./app-intro-video-scenario";

export function stepChangeLook(scenario: AppIntroVideoScenario) {

    scenario.SCEN.step(`You can get started quickly with very simple cosmetic/branding changes like change the color palette`, async () => {
        let getColor = async () => {
            let icon = await scenario.API.byCssInFrame('iframe', '.navbar-brand.logo_h i');//TODO: make this generic for all apps
            return await icon.getCssValue('color');
        };

        await scenario.API.clickByCssInMain('#frmdb-editor-color-palette-select');
        await scenario.API.clickByCssInMain('[aria-labelledby="frmdb-editor-color-palette-select"] .dropdown-item:nth-child(2)');
        await browser.wait(async () => (await getColor()) == 'rgba(255, 0, 0, 1)', 5000, 'wait for color to become red');
        expect(await getColor()).toEqual('rgba(255, 0, 0, 1)');

        await scenario.API.clickByCssInMain('#frmdb-editor-color-palette-select');
        await scenario.API.clickByCssInMain('[aria-labelledby="frmdb-editor-color-palette-select"] .dropdown-item:nth-child(1)');
        await browser.wait(async () => (await getColor()) == 'rgba(243, 195, 0, 1)', 5000, 'wait for color to become yellow');
        expect(await getColor()).toEqual('rgba(243, 195, 0, 1)');

    });
}