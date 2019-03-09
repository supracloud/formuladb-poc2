import { Component, OnInit, Input } from '@angular/core';
import * as shape from 'd3-shape';
import { EntityStateGraph } from "@core/domain/metadata/entity";
import { FormEditingService } from '../form-editing.service';

export class FormStateComponent implements OnInit {
  curve: any = shape.curveBundle.beta(1);
  view: any[];
  autoZoom: boolean = false;
  panOnZoom: boolean = true;
  enableZoom: boolean = true;
  autoCenter: boolean = false;
  showLegend: boolean = false;
  colorScheme: any = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  @Input()
  stateGraph: EntityStateGraph;

  nodes: { id: string, label: string }[] = [];
  links: {
    source: string,
    target: string,
    label: string
  }[] = [];

  constructor(formEditingService: FormEditingService) {
  }


  ngOnInit() {
    this.nodes = this.stateGraph.nodes.map(n => ({id: n, label: n}));
    this.links = this.stateGraph.transitions.map(tr => ({source: tr.source, target: tr.target, label: ""}));
  }

  onLegendLabelClick($event) {
    //TODO
  }
  select($event) {
    //TODO
  }
}
