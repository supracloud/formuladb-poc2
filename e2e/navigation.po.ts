import { browser, by, element, ElementFinder } from 'protractor';
import { $wait } from "./common";

export class NavigationPO {
  navLinkForEntity(entityPath: string) {
    return $wait(element(by.css(`[href="${entityPath}"]`)));
  }

  fieldActorName(): Promise<ElementFinder> {
    return $wait(element(by.css('form.ng-pristine input[name="name"]')));
  }
} 
