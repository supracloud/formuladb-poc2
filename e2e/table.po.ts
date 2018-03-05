import { browser, by, element, promise } from 'protractor';
import { $wait } from "./common";
import { ElementArrayFinder } from 'protractor/built/element';

export class TablePO {
    async getTable(): Promise<string[][]> {
        let firstCellTxt = await (await $wait(element.all(by.css('.mwz-data-table tr td')).first())).getText();
        return element.all(by.css('.mwz-data-table tr'))
            .map<string[]>(tr => tr.all(by.css('td,th')).map<string>(td => td.getText()))
        ;
    }

    async firstCell() {
        return await $wait(element.all(by.css('.mwz-data-table tr td')).first());
    }
}
