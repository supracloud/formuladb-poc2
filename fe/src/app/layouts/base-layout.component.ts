import { Component, OnInit, Input } from '@angular/core';
import { Page } from '@core/domain/uimetadata/page';

export class BaseLayoutComponent implements OnInit {
    
    @Input()
    page: Page;

    @Input()
    sidebarImageUrl: string;

    @Input()
    themeColorPalette: string;
    
    constructor() { }
    
    ngOnInit() {
    }
    
}
