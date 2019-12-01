import { browser, element, by, ExpectedConditions, ElementArrayFinder, ElementFinder } from 'protractor';
import { E2eScenarioWithVideo } from "./e2e-scenario";
import { E2EApi } from "./e2e-api";
import { App } from "@domain/app";
import { Schema, Entity, Pn } from "@domain/metadata/entity";
import { DataObj } from "@domain/metadata/data_obj";
import { stepListOfTables } from './step-list-of-tables';
import { stepListOfPages } from './step-list-of-pages';
import { stepChangeLook } from './step-change-look';
import { stepChangeLanguage } from './step-change-language';
import { stepDataBindingHighlight } from './step-data-binding-highlight';
import { stepCardsDataBinding } from './step-cards-data-binding';
import { stepFormulaEditorBasic } from './step-formula-editor-basic';

export interface AppIntroVideoScenarioData {
    app: App;
    schema: Schema;
    appData: DataObj[];
    homePageTitle: string;
}


export class AppIntroVideoScenario {

    constructor(public data: AppIntroVideoScenarioData, public SCEN: E2eScenarioWithVideo, public API: E2EApi) {

    }

    public mainEntities(): Entity[] {
        return Object.values(this.data.schema.entities)
            .filter(e => e._id.indexOf('$') < 0)
    }

    public mainTables(): string {
        return this.mainEntities().map(e => e._id)
            .join(',');
    }

    public mainPages(): string[] {
        return this.data.app.pages.filter(p => p.indexOf('_') != 0);
    }

    init() {
        this.SCEN.describe(this.data.app._id, () => {
            this.SCEN.step(`Welcome to ${this.data.app._id} application`, async () => {
                await this.API.navigateTo(`formuladb/editor.html#/formuladb-env/apps/${this.data.app._id}/index.html`);
                await this.API.byCssInFrame('iframe', 'h1,h2', this.data.homePageTitle);
            });

            stepListOfTables(this);
            stepListOfPages(this);
            stepChangeLook(this);
            stepChangeLanguage(this);
            stepDataBindingHighlight(this);
            stepCardsDataBinding(this);
            stepFormulaEditorBasic(this);

            this.SCEN.step(`Please follow our website for news about the official launch and more details like how to create Tables and Pages, perform data rollups with SUMIF/COUNTIF, define validations, import data from Spreadsheets and other systems, and much much more.`, async () => {
                await this.API.finish();
            });
        });
    }
}

