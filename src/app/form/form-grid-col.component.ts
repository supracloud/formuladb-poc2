import { Directive, OnInit, Input } from '@angular/core';

@Directive({
    selector: '[form-grids-col]',
    host: { class: "col" }
})
export class FormGridColComponent implements OnInit {
    constructor() { }

    ngOnInit(): void { }
}