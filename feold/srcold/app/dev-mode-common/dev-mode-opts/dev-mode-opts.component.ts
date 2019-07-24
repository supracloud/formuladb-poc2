import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';

import * as appState from '@fe/app/state/app.state';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { Subscription, Subject, Observable, merge, combineLatest } from 'rxjs';
import { untilDestroyed } from 'ngx-take-until-destroy';

import { faTable, faColumns, faPlusCircle, faMinusCircle, faPlus, faTools, faUserCircle, faImages, faCogs, faPalette, faSortNumericDown, faTextHeight, faCalendarAlt, faHourglassHalf, faShareSquare, faEdit, faQuestionCircle, faQuestion, faCheckCircle, faTimesCircle, faSquare, faPen, faPenFancy, faNewspaper, faObjectGroup, faSignOutAlt, faCode } from '@fortawesome/free-solid-svg-icons';
import { Pn, EntityProperty, Entity } from "@domain/metadata/entity";
import { debounceTime, withLatestFrom, map, tap } from 'rxjs/operators';
import { FormulaEditorService } from '../../effects/formula-editor.service';
import { GridsterConfig, GridsterItem, DisplayGrid } from 'angular-gridster2';
import { FrmdbLook, FrmdbLy, Page, FrmdbHeader, FrmdbLayoutType, FrmdbHeaderType } from '@domain/uimetadata/page';
import { I18nPipe } from '@fe/app/crosscutting/i18n/i18n.pipe';
import { PageChangedAction, AutoLayoutPageAction } from '@fe/app/actions/page.user.actions';
import { FrmdbStreamsService } from '@fe/app/state/frmdb-streams.service';

@Component({
    selector: 'frmdb-dev-mode-opts',
    templateUrl: './dev-mode-opts.component.html',
    styleUrls: ['./dev-mode-opts.component.scss'],
})
export class DevModeOptsComponent implements OnInit, OnDestroy {
    gridsterOptions: GridsterConfig;
    gridsterPage: Array<GridsterItem>;

    editIcon = faEdit;
    edit2Icon = faEdit;
    applyChangesIcon = faCheckCircle;
    discardChangesIcon = faTimesCircle;

    themeIcon = faImages;
    layoutIcon = faObjectGroup;
    dataIcon = faTable;
    styleIcon = faPalette;
    userIcon = faUserCircle;
    changeAppIcon = faSignOutAlt;

    tableIcon = faTable;
    columnIcon = faColumns;
    addIcon = faPlusCircle;
    delIcon = faMinusCircle;
    devModeIcon = faTools;
    pageEditorIcon = faNewspaper;
    collorPaletteIcon = faPalette;

    undefinedPropTypeIcon = faQuestion;
    numberPropTypeIcon = faSortNumericDown;
    stringPropTypeIcon = faTextHeight;
    datePropTypeIcon = faCalendarAlt;
    durationPropTypeIcon = faHourglassHalf;
    childTablePropTypeIcon = faTable;
    referenceToPropTypeIcon = faShareSquare;

    codeIcon = faCode;

    developerMode$: Observable<boolean>;
    editorOn$: Observable<boolean>;
    displayedProperty$: Observable<EntityProperty | undefined>;

    clickPropertyType$: Subject<string> = new Subject();
    clickStartEdit$: Subject<void> = new Subject();
    clickCancelEdits$: Subject<void> = new Subject();
    clickSaveEdits$: Subject<void> = new Subject();

    menuOpened: boolean = false;
    pageEditorOpened: boolean = false;

    currentEntity: appState.Entity | undefined;
    currentProperty: EntityProperty | undefined;
    protected subscriptions: Subscription[] = [];

    looks: {[x: string]: boolean} = {};
    layouts: {[x: string]: boolean} = {};
    page$: Observable<Page>;
    page: Page;

    constructor(protected store: Store<appState.AppState>, private router: Router, 
        public formulaEditorService: FormulaEditorService,
        private i18npipe: I18nPipe) {
        this.developerMode$ = this.store.select(appState.getDeveloperMode);
        this.editorOn$ = this.store.select(appState.getEditorOn);
        this.page$ = this.store.select(appState.getPageState).pipe(untilDestroyed(this));
        this.page$.subscribe(p => this.page = p);

        this.sub(this.clickStartEdit$.subscribe(() => this.formulaEditorService.toggleFormulaEditor()));
        this.clickCancelEdits$.subscribe(() => this.discardChanges());

        this.displayedProperty$ = combineLatest(this.formulaEditorService.currentProperty$, this.formulaEditorService.editedProperty$).pipe(
            map(([currentProperty, editedProperty]) => editedProperty ? editedProperty : currentProperty)
        );

        let saveStream$ = this.clickSaveEdits$.pipe(
            withLatestFrom(combineLatest(this.formulaEditorService.editorExprHasErrors$, this.formulaEditorService.editedEntity$, this.formulaEditorService.editedProperty$)),
            map(([x, [editorExprHasErrors, editedEntity, editedProperty]]) => ({ editorExprHasErrors, editedEntity, editedProperty }))
        );
        this.sub(saveStream$.subscribe(({ editorExprHasErrors, editedEntity, editedProperty }) => {
            if (editedEntity) this.applyChanges(editorExprHasErrors, editedEntity, editedProperty);
        }));

        this.sub(store.select(appState.getTableEntityState).subscribe(e => this.currentEntity = e));
        this.sub(this.store.select(appState.getSelectedPropertyState).subscribe(prop => this.currentProperty = prop));

        for (let look of Object.values(FrmdbLook)) {
            this.looks[look] = false;
        }
        
        for (let layout of Object.values(FrmdbLy)) {
            this.layouts[layout] = false;
        }
    }

    objectKeys = Object.keys;

    sub(s: Subscription) {
        this.subscriptions.push(s);
    }

    ngOnInit() {
        this.page$.subscribe(p => this.applyTheme(p));
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe())
    }

    allThemes = [
        {name: "Basic", look: "frmdb-ly-professional", img: "assets/img/themes/basic.png", css: ""},
        {name: "Lux", look: "frmdb-ly-stylish", img: "assets/img/themes/lux.png", css: "/assets/themes/lux.min.css"},
        {name: "Yeti", look: "frmdb-ly-friendly", img: "assets/img/themes/yeti.png", css: "/assets/themes/yeti.min.css"},
        {name: "Material", look: "frmdb-ly-professional", img: "assets/img/themes/material.jpg", css: "/assets/themes/material/material-dashboard.min.css"},
        {name: "Light", look: "frmdb-ly-professional", img: "assets/img/themes/light.jpg", css: "/assets/themes/light/bootstrap.min.css"},
        {name: "Now-UI", look: "frmdb-ly-professional", img: "assets/img/themes/nowui.jpg", css: "/assets/themes/now-ui/bootstrap.min.css"},
    ];

    allHeaders = [
        {header: "frmdb-hd-cover", img: "assets/img/headers/hd_cover.png"},
        {header: "frmdb-hd-jumbotron", img: "assets/img/headers/hd_jumbotron.png"},
        {header: "frmdb-hd-carousel", img: "assets/img/headers/hd_carousel.png"},
        {header: "frmdb-hd-split", img: "assets/img/headers/hd_split.png"},
    ];

    allLayouts = [
        {layout: "frmdb-ly-admin", img: "assets/img/layouts/ly_admin.png"},
        {layout: "frmdb-ly-fpattern", img: "assets/img/layouts/ly_fpattern.png"},
        {layout: "frmdb-ly-grid", img: "assets/img/layouts/ly_grid.png"},
        {layout: "frmdb-ly-cards", img: "assets/img/layouts/ly_cards.png"},
        {layout: "frmdb-ly-mosaic", img: "assets/img/layouts/ly_mosaic.png"},
        {layout: "frmdb-ly-zigzagpattern", img: "assets/img/layouts/ly_zigzagpattern.png"},
        {layout: "frmdb-ly-dashboard", img: "assets/img/layouts/ly_dashboard.png"},
        {layout: "frmdb-ly-magazine", img: "assets/img/layouts/ly_magazine.png"},
    ];


    get themes() {
        let areLooksFilered = Object.values(this.looks).filter(x => x === true).length > 0;
        return this.allThemes.filter(theme => {
            let ret = true;
            if (areLooksFilered && !this.looks[theme.look]) ret = false;
            return ret;
        });
    }

    switchTheme(cssUrl: string) {
        this.store.dispatch(new PageChangedAction({
            ...this.page, 
            cssUrl,
        }));
    }

    switchLayout(layout: FrmdbLayoutType) {
        this.store.dispatch(new AutoLayoutPageAction(layout));
    }

    switchHeader(header: FrmdbHeaderType) {
        this.store.dispatch(new PageChangedAction({
            ...this.page, 
            header,
        }));
    }

    get appName() {
        return appState.parseUrl(this.router.url).appName;
    }

    private applyTheme(page: Page) {

        if (this.themeStylesheetElement && this.themeStylesheetElement.href != page.cssUrl) {
            this.getDocHead().removeChild(this.themeStylesheetElement);
            this.themeStylesheetElement = null;
        }
        if (page.cssUrl && null == this.themeStylesheetElement) {
            this.loadExternalStyles(page.cssUrl);
        }
    }

    switchcolorPalette(color: string) {
        this.store.dispatch(new PageChangedAction({...this.page, colorPalette: color}));
    }

    switchLanguage(language: string) {

    }

    switchSideBarImage(url: string) {
        this.store.dispatch(new PageChangedAction({...this.page, sidebarImageUrl: url}));
    }

    private getDocHead(): HTMLHeadElement {
        if (document && document.head != null) {
            return document.head;
        } else throw new Error("document.head null");
    }

    private getDocBody(): HTMLElement {
        if (document && document.body != null) {
            return document.body;
        } else throw new Error("document.head null");
    }

    private themeStylesheetElement: HTMLLinkElement | null;
    private loadExternalStyles(styleUrl: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.themeStylesheetElement = document.createElement('link');
            this.themeStylesheetElement.rel = 'stylesheet';
            this.themeStylesheetElement.href = styleUrl;
            this.themeStylesheetElement.onload = resolve;
            this.getDocHead().appendChild(this.themeStylesheetElement);
        });
    }

    private loadExternalScript(scriptUrl: string): Promise<any> {
        return new Promise(resolve => {
            const scriptElement = document.createElement('script');
            scriptElement.src = scriptUrl;
            scriptElement.onload = resolve;
            this.getDocBody().appendChild(scriptElement);
        });
    }

    stopPropagation($event) {
        $event.stopPropagation();
        $event.preventDefault();
    }

    addColumnToCurrentTable(input: HTMLInputElement) {
        if (!this.currentEntity) {
            alert("Please select an entity for adding a column");//TODO: add i18n
            return;
        }
        let newPropName = input.value.replace(/^\./, '');
        this.store.dispatch(new appState.ServerEventSetProperty(this.currentEntity, {
            name: newPropName,
            propType_: Pn.STRING,
        }));
    }

    addTable(input: HTMLInputElement) {
        let newTableName = input.value;
        let prefix = this.currentEntity ? this.currentEntity._id : '';
        if (prefix === '') newTableName = newTableName.replace(/^__/, '');
        this.store.dispatch(new appState.ServerEventNewEntity(prefix + newTableName));
    }

    delTable() {
        if (!this.currentEntity) {
            alert("Select entity to be deleted");
            return;
        }
        if (confirm("Are you sure you want to delete table " + this.currentEntity._id + " ?")) {
            this.store.dispatch(new appState.ServerEventDeleteEntity(this.currentEntity._id));
        }
    }

    delColumnFromCurrentTable() {
        if (!this.currentEntity || !this.currentProperty) {
            alert("Please select a column to be deleted");//TODO: add i18n
            return;
        }
        if (confirm("Are you sure you want to delete " + this.currentProperty.name + " column of " + this.currentEntity._id + " ?")) {
            this.store.dispatch(new appState.ServerEventDeleteProperty(this.currentEntity, this.currentProperty.name));
        }
    }

    getNameOfAddedTableOrColumn(tableNameInput: HTMLInputElement, colNameInput: HTMLInputElement) {
        let ret = this.currentEntity ? this.currentEntity._id : '';
        if (tableNameInput.value) ret += '__' + tableNameInput.value;
        if (colNameInput.value) ret += '.' + tableNameInput.value;
        return ret;
    }

    get addTableLabel() {
        return this.currentEntity ? this.i18npipe.transform('add-child-table-to', this.currentEntity._id) : this.i18npipe.transform('add-table');
    }

    get addColumnLabel() {
        return this.currentEntity ? this.i18npipe.transform('add-column-to', this.currentEntity._id) : this.i18npipe.transform('add-column');
    }

    goToAppList() {
        this.router.navigate(['/']);
    }

    startEditing() {
        this.formulaEditorService.toggleFormulaEditor();
    }

    modifyPropertyType(type: string) {
        if (!this.formulaEditorService.formulaState.selectedProperty) return;
        if (this.formulaEditorService.formulaState.selectedProperty.propType_ != type && !this.formulaEditorService.formulaState.editorOn) {
            this.formulaEditorService.toggleFormulaEditor();
        }
    }

}
