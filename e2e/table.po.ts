import { browser, by, element, promise } from 'protractor';

export class TablePO {
  async getTable(_id: string, colName: string): Promise<string[][]> {
    let tableCells: string[][] = [];
    let trs = element(by.css('.mwz-data-table')).all(by.tagName('tr'));
    trs.each(async tr => {
      let row = [];
      tableCells.push(row);
      tr.all(by.tagName('td')).each(async td => {
        row.push(await td.getText());
      })
    });

    return tableCells;
  }
}
