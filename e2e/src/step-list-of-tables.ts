import { by } from 'protractor';
import { Pn } from "@domain/metadata/entity";
import { AppIntroVideoScenario } from "./app-intro-video-scenario";

export function stepListOfTables(scenario: AppIntroVideoScenario) {
    scenario.SCEN.step(`For the ${scenario.data.app._id} app you will find a few predefined Tables like ${scenario.mainTables()}`, async () => {
        for (let entity of scenario.mainEntities()) {
            console.log("    [E2E] checking table " + entity._id);
            let el = await scenario.API.clickByCssInMain('[data-toggle="dropdown"][data-frmdb-value="$frmdb.selectedTableId"]');
            
            el = await scenario.API.clickByCssInMain('[data-frmdb-value="$frmdb.tables[]._id"]', entity._id);
            
            for (let obj of scenario.API.getDataForTable(scenario.data.appData, entity._id)) {
                console.log("    [E2E] checking table record " + JSON.stringify(obj));
                let webel = await scenario.API.byCssInShadowDOM('frmdb-data-grid', '.ag-cell[col-id="_id"]', obj._id.replace(/^\w+~~/, ''));
                let rowIndex = await webel.findElement(by.xpath('..')).getAttribute('row-index');
                await webel.click();
                for (let prop of Object.values(entity.props)) {
                    if (prop.name == '_id') continue;
                    if (prop.propType_ === Pn.BOOLEAN) continue;
                    await scenario.API.clickByCssInShadowDOM('frmdb-data-grid', `[row-index="${rowIndex}"] > .ag-cell[col-id="${prop.name}"]`);
                    let expectedVal: string;
                    //FIXME: proper comparison based on column type
                    if (prop.propType_ == Pn.STRING) expectedVal = ((obj[prop.name] || '') + '').slice(0, 10);
                    else expectedVal = ((obj[prop.name] || '') + '').slice(0, 2);
                    await scenario.API.clickByCssInShadowDOM('frmdb-data-grid', `[row-index="${rowIndex}"] > .ag-cell[col-id="${prop.name}"]`, expectedVal);
                }
            }
        }
    });
}