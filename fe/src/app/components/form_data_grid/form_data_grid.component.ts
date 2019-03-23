/**
 * © 2018 S.C. FORMULA DATABASE S.R.L.
 * License TBD
 */

import { OnChanges, OnInit, OnDestroy, Component } from '@angular/core';
import { BaseNodeComponent } from '../base_node';
import { NodeElement, NodeType, TableNodeElement } from "@core/domain/uimetadata/form";

import { CircularJSON } from "@core/json-stringify";

import { Pn } from "@core/domain/metadata/entity";
import { FormEditingService } from '../form-editing.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: '[frmdb-form_data_grid]',
  templateUrl: './form_data_grid.component.html',
  styleUrls: ['./form_data_grid.component.scss']
})
export class FormDataGridComponent extends BaseNodeComponent implements OnInit, OnChanges, OnDestroy {

  data: any;
  frameworkComponents: any;
  defaultColDef: any;

  constructor(formEditingService: FormEditingService) {
    super(formEditingService);
  }


  tableElement: TableNodeElement;

  ngOnInit() {
    this.tableElement = this.nodel as TableNodeElement;
  }

  ngOnChanges() {
    console.log(this.nodel, this.formgrp);
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  getType(child: NodeElement): string {
    if (child.nodeType !== NodeType.form_input) {
      throw new Error('form-input node element is wrong: ' + CircularJSON.stringify(this.nodel));
    }
    if (child.propertyType === Pn.NUMBER) { return 'number'; } else { return 'text'; }
  }

}
