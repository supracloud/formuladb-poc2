import { browser, by, element, ElementFinder } from 'protractor';
import { $wait } from "./common";

export class NavigationPO {
  navLinkForEntity(entityPath: string) {
    return $wait(element(by.css(`[href="${entityPath}"]`)));
  }

  async navToEntityPage(entityPath: string, entityName: string) {
    let link = await this.navLinkForEntity(entityPath);
    await expect(link.getText()).toContain(entityName);
    await link.click();
  }

  fieldActorName(): Promise<ElementFinder> {
    return $wait(element(by.css('form.ng-pristine input[name="name"]')));
  }
} 
