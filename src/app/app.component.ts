import { Component, OnInit, Type } from '@angular/core';

import { MockService } from "./test/mock.service";
import { NodeChildrenService } from "./form/node-children.service";
import { NodeType } from "./domain/uimetadata/form";
import { FormGridComponent } from "./form/form-grid.component";
import { FormGridRowComponent } from "./form/form-grid-row.component";
import { FormGridColComponent } from "./form/form-grid-col.component";
import { FormInputComponent } from "./form/form-input.component";
import { FormAutocompleteComponent } from "./form/form-autocomplete.component";
import { FormTableComponent } from "./form/form-table.component";
import { FormTabsComponent } from "./form/form-tabs.component";
import { BaseNodeComponent } from "./form/base_node";

@Component({
    selector: 'app-root',
    template: `
        <nav class="navbar navbar-toggleable-md fixed-top navbar-dark bg-primary text-white">
            <button class="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarResponsive"
                aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <a href="/" class="navbar-brand">Metawiz</a>
            <div class="collapse navbar-collapse" id="navbarResponsive">
                <ul class="navbar-nav">
                    <li class="nav-item" routerLinkActive="active">
                        <a routerLink="/form-editor" class="nav-link">Form editor</a>
                    </li>
                    <li class="nav-item" routerLinkActive="active">
                        <a routerLink="/ecommerce" class="nav-link"><i class="fa fa-cart"></i> E-commerce</a>
                    </li>
                </ul>
            </div>
        </nav>
        <div class="mwz-body">
            <div class="mwz-sidebar mwz-independent-scroll ml-2">
                <mwz-navigation></mwz-navigation>
            </div>
            <div class="mwz-content mwz-independent-scroll ml-2 card">
                <router-outlet></router-outlet>
            </div>
        </div>

        <editor></editor>
  `
})
export class AppComponent implements OnInit {
    title = 'app';

    public constructor(private mockService: MockService, private nodeChildrenService: NodeChildrenService) {}

    ngOnInit(): void {
        this.nodeChildrenService.setNodeType2ComponentClass(new Map<NodeType, Type<BaseNodeComponent>>(
            [
                [NodeType.FormGrid, FormGridComponent],
                [NodeType.FormGridRow, FormGridRowComponent],
                [NodeType.FormGridCol, FormGridColComponent],
                [NodeType.FormInput, FormInputComponent],
                [NodeType.FormAutocomplete, FormAutocompleteComponent],
                [NodeType.FormTable, FormTableComponent],
                [NodeType.FormTabs, FormTabsComponent]
            ]));
        this.mockService.loadInitialEntities();
    }
}
