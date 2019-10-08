import { E2eScenario } from "./e2e-scenario";
import { E2EApi } from "./e2e-api";

export interface AppIntroVideoScenarioData {
    appName: string;
    url: string;
}

export function appIntroVideoScenario(data: AppIntroVideoScenarioData, SCEN: E2eScenario, API: E2EApi) {
    SCEN.describe(data.appName, () => {
        
        SCEN.step(`welcome to ${data.appName} application`, async () => {
            await API.navigateTo(data.url);
        });
    });
}
