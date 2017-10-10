import { Directive, OnInit, Input } from '@angular/core';

@Directive({
    selector: '[form-grid]',
    host: { class: "container" }
})
export class FormGridComponent implements OnInit {
    constructor() { }

    ngOnInit(): void { }
}