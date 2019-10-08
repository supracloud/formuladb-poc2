import { by, browser } from 'protractor';
import { AppIntroVideoScenario } from "./app-intro-video-scenario";

export function stepChangeLanguage(scenario: AppIntroVideoScenario) {

    scenario.SCEN.step(`And also change the language`, async () => {

        await scenario.API.clickByCssInMain('#frmdb-editor-i18n-select');
        await scenario.API.clickByCssInMain('[aria-labelledby="frmdb-editor-i18n-select"] .dropdown-item:nth-child(2)');
        await scenario.API.byCssInFrame('iframe', '.banner_content  h2', 'Détends ton esprit');

        await scenario.API.clickByCssInMain('#frmdb-editor-i18n-select');
        await scenario.API.clickByCssInMain('[aria-labelledby="frmdb-editor-i18n-select"] .dropdown-item:nth-child(1)');
        await scenario.API.byCssInFrame('iframe', '.banner_content  h2', 'Relax Your Mind');

    });
}
