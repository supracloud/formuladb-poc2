import { Action } from '@ngrx/store';
import { Page } from "@core/domain/uimetadata/page";
import { NodeElement, NodeType } from '@core/domain/uimetadata/node-elements';

export const PageChangedActionN = "[page] PageChangedAction";

export class PageChangedAction implements Action {
  readonly type = PageChangedActionN;

  constructor(public page: Page) { }
}

export class AutoLayoutPageAction implements Action {
  readonly type = "[page] AutoLayoutPageAction";

  constructor(public layout: Exclude<Page['layout'], undefined>) { }
}

export class PageDropAction implements Action {
  readonly type = "[page] PageDropAction";

  constructor(
    public removedFromNodeId: string,
    public removedFromPos: number,
    public movedNodeId: string,
    public addedToNodeId: string,
    public addedToPos: number) { }
}

export class NodeElementDeleteAction implements Action {
  readonly type = "[page] NodeElementDeleteAction";

  constructor(public removedFromNodeId: string, public movedNodeId: string) { }
}

export class NodeElementSwitchTypeAction implements Action {
  readonly type = "[page] NodeElementSwitchTypeAction";

  constructor(public payload: { node: NodeElement, toType: NodeType }) { }
}
