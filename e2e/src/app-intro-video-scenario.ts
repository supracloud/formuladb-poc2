import { browser, element, by, ExpectedConditions, ElementArrayFinder, ElementFinder } from 'protractor';
import { E2eScenario } from "./e2e-scenario";
import { E2EApi } from "./e2e-api";
import { App } from "@domain/app";
import { Schema, Entity, Pn } from "@domain/metadata/entity";
import { DataObj } from "@domain/metadata/data_obj";

export interface AppIntroVideoScenarioData {
    app: App;
    schema: Schema;
    appData: DataObj[];
    homePageTitle: string;
}


export class AppIntroVideoScenario {
    
    constructor(private data: AppIntroVideoScenarioData, private SCEN: E2eScenario, private API: E2EApi) {

    }

    mainEntities(): Entity[] {
        return Object.values(this.data.schema.entities)
            .filter(e => e._id.indexOf('$') < 0)
    }

    mainTables(): string {
        return this.mainEntities().map(e => e._id)
            .join(',');
    }

    init() {
    this.SCEN.describe(this.data.app._id, () => {
        this.SCEN.step(`welcome to ${this.data.app._id} application`, async () => {
            await this.API.navigateTo(`formuladb-editor/editor.html#/formuladb-apps/${this.data.app._id}/index.html`);
            await this.API.byCssInFrame('iframe#iframe1', 'h1,h2', this.data.homePageTitle);
        });

        this.SCEN.step(`For the ${this.data.app._id} app you will find a few predefined Tables like ${this.mainTables()}`, async () => {
            for (let entity of this.mainEntities()) {
                let el = await this.API.byCssInMain('[data-toggle="dropdown"][data-frmdb-value="$frmdb.selectedTableId"]');
                await el.click();
                el = await this.API.byCssInMain('[data-frmdb-value="$frmdb.tables[]._id"]', entity._id);
                await el.click();
                for (let obj of this.API.getDataForTable(this.data.appData, entity._id)) {
                    let webel = await this.API.byCssInShadowDOM('frmdb-data-grid', '.ag-cell[col-id="_id"]', obj._id.replace(/^\w+~~/, ''));
                    await webel.click();
                    for (let prop of Object.values(entity.props)) {
                        if (prop.name == '_id') continue;
                        if (prop.propType_ === Pn.BOOLEAN) continue;
                        webel = await this.API.byCssInShadowDOM('frmdb-data-grid', '.ag-cell[col-id="_id"]', obj._id.replace(/^\w+~~/, ''));
                        let sibling = await webel.findElement(by.xpath('..')).findElement(by.css(`.ag-cell[col-id="${prop.name}"]`));
                        await sibling.click();
                        let siblingText = await sibling.getAttribute('innerText');
                        //FIXME: proper comparison based on column type
                        if (prop.propType_ == Pn.STRING) expect((siblingText||'').slice(0, 10)).toEqual(((obj[prop.name]||'')+'').slice(0, 10));
                        else expect((siblingText||'').slice(0, 2)).toEqual(((obj[prop.name]||'')+'').slice(0, 2));
                    }
                }
            }
        });


        this.SCEN.step(`Please follow our website for news about the official launch and more details like how to create Tables and Pages, perform data rollups with SUMIF/COUNTIF, define validations, import data from Spreadsheets and other systems, and much much more.`, async () => {
            await this.API.finish();
        });        
    });
}
}

