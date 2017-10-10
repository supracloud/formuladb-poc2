import { Directive, OnInit, Input } from '@angular/core';

@Directive({
    selector: '[form-grids-row]',
    host: { class: "row" }
})
export class FormGridRowComponent implements OnInit {
    constructor() { }

    ngOnInit(): void { }
}