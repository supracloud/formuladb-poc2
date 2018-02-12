import { browser, by, element } from 'protractor';

export class FormPO {
  navigateToEntity(entityPath: string) {
    return element(by.css(`[href="${entityPath}"]`)).click();
  }
}
