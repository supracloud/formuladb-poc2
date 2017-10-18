import { Directive, OnInit, Input } from '@angular/core';

@Directive({
    selector: '[form-grid-row]',
    host: { class: "row" }
})
export class FormGridRowComponent implements OnInit {
    constructor() { }

    ngOnInit(): void { }
}