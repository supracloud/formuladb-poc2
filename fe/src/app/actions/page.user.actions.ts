import { Action } from '@ngrx/store';
import { Page } from "@core/domain/uimetadata/page";

export const PageChangedActionN = "[page] PageChangedAction";
export const ThemeSidebarImageUrlChangedActionN = "[page] ThemeSidebarImageUrlChangedAction";


export class PageChangedAction implements Action {
  readonly type = PageChangedActionN;

  constructor(public page: Page) { }
}
