import { Action } from '@ngrx/store';
import { Page } from "@core/domain/uimetadata/page";

export const PageChangedActionN = "[page] PageChangedAction";

export class PageChangedAction implements Action {
  readonly type = PageChangedActionN;

  constructor(public page: Page) { }
}

export class AutoLayoutPageAction implements Action {
  readonly type = "[page] AutoLayoutPageAction";

  constructor(public layout: Exclude<Page['layout'], undefined>) { }
}
