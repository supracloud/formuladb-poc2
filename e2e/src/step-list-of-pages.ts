import { by, browser } from 'protractor';
import { Pn } from "@domain/metadata/entity";
import { AppIntroVideoScenario } from "./app-intro-video-scenario";

export function stepListOfPages(scenario: AppIntroVideoScenario) {
    scenario.SCEN.step(`For the ${scenario.data.app._id} app you will find a few predefined Pages like ${scenario.mainPages().join(',')}`, async () => {
        let el = await scenario.API.clickByCssInMain('.dropdown-toggle[data-frmdb-value="$frmdb.selectedPageName"]');
        
        for (let page of scenario.mainPages()) {
            console.log("    [E2E] checking page " + page);
            el = await scenario.API.byCssInMain('[data-frmdb-value="$frmdb.pages[].name"]', page);
            browser.actions().mouseMove(el);
        }
    });
}