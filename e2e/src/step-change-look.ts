import { by, browser } from 'protractor';
import { AppIntroVideoScenario } from "./app-intro-video-scenario";

export function stepChangeLook(scenario: AppIntroVideoScenario) {

    scenario.SCEN.step(`You can get started quickly with very simple cosmetic/branding changes like change the color palette and the theme`, async () => {
        let getColor = async () => {
            let icon = await scenario.API.byCssInFrame('iframe', '.navbar-brand i');//TODO: make this generic for all apps
            return await icon.getCssValue('color');
        };

        await scenario.API.clickByCssInMain('#frmdb-editor-color-palette-select');
        await scenario.API.clickByCssInMain('[aria-labelledby="frmdb-editor-color-palette-select"] .dropdown-item:nth-child(3)');
        await browser.wait(async () => (await getColor()) == 'rgba(89, 49, 150, 1)', 5000, 'wait for color to become red');
        expect(await getColor()).toEqual('rgba(89, 49, 150, 1)');

        await scenario.API.clickByCssInMain('#frmdb-editor-theme-select');
        await scenario.API.clickByCssInMain('[theme="sketchy"]');
        //TODO add assertions

        await scenario.API.clickByCssInMain('#frmdb-editor-theme-select');
        await scenario.API.clickByCssInMain('[theme="lux"]');
        //TODO add assertions

        await scenario.API.clickByCssInMain('#frmdb-editor-color-palette-select');
        await scenario.API.clickByCssInMain('[aria-labelledby="frmdb-editor-color-palette-select"] .dropdown-item:nth-child(7)');
        await browser.wait(async () => (await getColor()) == 'rgba(255, 193, 7, 1)', 5000, 'wait for color to become yellow');
        expect(await getColor()).toEqual('rgba(255, 193, 7, 1)');

    });
}