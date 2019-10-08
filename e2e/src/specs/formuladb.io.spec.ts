/**
* © 2019 S.C. FORMULA DATABASE S.R.L.
* License TBD
* 
*/

import { E2eScenario } from "@e2e/e2e-scenario";
import { E2EApi } from "@e2e/e2e-api";
import { AppIntroVideoScenarioData, appIntroVideoScenario } from "@e2e/app-intro-video-scenario";

let testData: AppIntroVideoScenarioData = {
    appName: 'formuladb.io',
    url: 'formuladb-editor/editor.html#/formuladb-apps/formuladb.io/index.html',
};

appIntroVideoScenario(testData, new E2eScenario(), new E2EApi());
