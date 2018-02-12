import { browser, by, element } from 'protractor';
import { $wait } from "./common";

export class NavigationPO {
  navLinkForEntity(entityPath: string) {
    return $wait(element(by.css(`[href="${entityPath}"]`)));
  }
}
