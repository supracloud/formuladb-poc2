import { Component, OnInit, Input } from '@angular/core';

export class BaseLayoutComponent implements OnInit {
    
    @Input()
    brandName: string = 'Cover';
  
    @Input()
    logoUrl: string = 'Cover';

    @Input()
    hNav: boolean = true;
  
    @Input()
    vNav: boolean = true;

    @Input()
    sidebarImageUrl: string;

    @Input()
    colorPalette: string;
    
    constructor() { }
    
    ngOnInit() {
    }
    
}
