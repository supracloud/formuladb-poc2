import { by, browser, Key } from 'protractor';
import { AppIntroVideoScenario } from "./app-intro-video-scenario";
    
//TODO: this must be made generic for any app
export function stepFormulaEditorBasic(scenario: AppIntroVideoScenario) {

    scenario.SCEN.step(`You can use Formulas to perform basic computations`, async () => {

        try {
            let el;
            await browser.sleep(957);
            let els = await scenario.API.allByCss('[data-frmdb-value="$frmdb.tables[]._id"]');
            let found = false;
            for (el of els) {
                let txt = await el.getAttribute('innerText');
                if ('Booking' === txt) {
                    found = true;
                    await (await scenario.API.byCss('[data-toggle="dropdown"][data-frmdb-value="$frmdb.selectedTableId"]')).click();
                    await browser.sleep(957);
                    await el.click();
                }
            }
            expect(found).toEqual(true);
            await browser.sleep(957);
            
            //select day column
            await scenario.API.clickByCssInShadowDOM('frmdb-data-grid', '.ag-row:nth-child(2) .ag-cell[col-id="days"]');
            
            //TODO: make this configurable for any app
            await scenario.API.byCssInMain('.editor-textarea', 'DATEDIF(start_date, end_date, "D") + ');
            
            await scenario.API.clickByCssInMain('#toggle-formula-editor');
            el = await scenario.API.clickByCssInMain('.editor-textarea:not([readonly])');
            let nb = Math.round(Math.random()*100);
            await el.sendKeys(Key.BACK_SPACE.repeat(50) + 'DATEDIF(start_date, end_date, "D") + ' + nb + Key.TAB);
            
            await scenario.API.clickByCssInMain('#apply-formula-changes.bg-success[data-frmdb-dirty="true"]');
            await scenario.API.acceptAlert('Please confirm, apply modifications to DB');
            
            await scenario.API.byCssInShadowDOM('frmdb-data-grid', '.ag-row:nth-child(2) .ag-cell[col-id="days"]', 
                `${nb+4}.00`);
            
        } catch (err) {
            console.error(err);
            throw err;
        }        
    });
}