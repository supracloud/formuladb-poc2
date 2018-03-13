import { browser, by, element, ElementFinder } from 'protractor';
import { $wait } from "./common";

export class FormPO {
  navigateToEntity(entityPath: string) {
    return element(by.css(`[href="${entityPath}"]`)).click();
  }

  fieldActorName(): Promise<ElementFinder> {
    return $wait(element(by.css('form.ng-pristine input[name="name"]')));
  }

  /**
   * Return the form grid row element in the form layout editor panel based on the column index
   * 
   * @param index - 1 based
   * 
   */
  formGridRow(index): Promise<ElementFinder> {
    // add 1 to index because of an extra div before the form_grid_row(s)
    return $wait(element(by.css('mwz-tree div.parent-trace-none div:nth-child(' + (index + 1) +')')));
  }
}
