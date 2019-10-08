import { E2eScenario } from "./e2e-scenario";
import { E2EApi } from "./e2e-api";
import { App } from "@domain/app";

export interface AppIntroVideoScenarioData {
    app: App;
}

export function appIntroVideoScenario(data: AppIntroVideoScenarioData, SCEN: E2eScenario, API: E2EApi) {
    SCEN.describe(data.app._id, () => {
        
        SCEN.step(`welcome to ${data.app._id} application`, async () => {
            await API.navigateTo(`formuladb-editor/editor.html#/formuladb-apps/${data.app._id}/index.html`);
        });
    });
}
