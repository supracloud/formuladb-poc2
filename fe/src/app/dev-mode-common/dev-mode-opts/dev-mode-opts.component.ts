import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';

import * as appState from '@fe/app/state/app.state';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { ThemeColorPaletteChangedAction, ThemeSidebarImageUrlChangedAction } from '@fe/app/state/theme.state';
import { Subscription, Subject, Observable, merge, combineLatest } from 'rxjs';

import { faTable, faColumns, faPlusCircle, faMinusCircle, faPlus, faTools, faUserCircle, faImages, faCogs, faPalette, faSortNumericDown, faTextHeight, faCalendarAlt, faHourglassHalf, faShareSquare, faEdit, faQuestionCircle, faQuestion, faCheckCircle, faTimesCircle, faSquare, faPen, faPenFancy, faNewspaper, faObjectGroup, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { Pn, EntityProperty, Entity } from "@core/domain/metadata/entity";
import { debounceTime, withLatestFrom, map, tap } from 'rxjs/operators';
import { FormulaEditorService } from '../../effects/formula-editor.service';
import { GridsterConfig, GridsterItem, DisplayGrid } from 'angular-gridster2';
import { FrmdbLook, FrmdbLy } from '@core/domain/uimetadata/page';
import { I18nPipe } from '@fe/app/crosscutting/i18n/i18n.pipe';

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

    layoutIcon = faObjectGroup;
    dataIcon = faTable;
    styleIcon = faPalette;
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

    constructor(protected store: Store<appState.AppState>, private router: Router, 
        public formulaEditorService: FormulaEditorService,
        private i18npipe: I18nPipe) {
        this.developerMode$ = this.store.select(appState.getDeveloperMode);
        this.editorOn$ = this.store.select(appState.getEditorOn);

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

    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe())
    }

    allThemes = [
        {name: "Basic", layout: "frmdb-ly-admin", look: "Professional", img: "assets/img/themes/basic-admin.png", css: ""},
        {name: "Basic", layout: "frmdb-ly-cover", look: "Stylish", img: "assets/img/themes/basic-cover.png", css: ""},
        {name: "Basic", layout: "frmdb-ly-horizontal-symetry", look: "Approachable", img: "assets/img/themes/basic-horizontal-symetry.png", css: ""},
        {name: "Light", layout: "frmdb-ly-admin", look: "Professional", img: "assets/img/themes/light.jpg", css: ""},
        {name: "Material", layout: "frmdb-ly-admin", look: "Professional", img: "assets/img/themes/material.jpg", css: "/assets/material-dashboard-theme/material-dashboard.min.css"},
        {name: "NowUI", layout: "frmdb-ly-admin", look: "Professional", img: "assets/img/themes/nowui.jpg", css: ""},
    ];

    get themes() {
        let areLooksFilered = Object.values(this.looks).filter(x => x === true).length > 0;
        let areLayoutsFilered = Object.values(this.layouts).filter(x => x === true).length > 0;
        return this.allThemes.filter(theme => {
            let ret = true;
            if (areLooksFilered && !this.looks[theme.look]) ret = false;
            if (areLayoutsFilered && !this.layouts[theme.layout]) ret = false;
            return ret;
        });
    }

    switchTheme(cssURL: string) {
        if (this.themeStylesheetElement) {
            this.getDocHead().removeChild(this.themeStylesheetElement);
            this.themeStylesheetElement = null;
        }
        if (cssURL) {
            this.loadExternalStyles(cssURL);
        }
    }

    switchThemeColorPalette(color: string) {
        this.store.dispatch(new ThemeColorPaletteChangedAction(color));
    }

    switchLanguage(language: string) {

    }

    switchSideBarImage(url: string) {
        this.store.dispatch(new ThemeSidebarImageUrlChangedAction(url));
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
        return this.currentEntity ? this.i18npipe.transform('add child table to', this.currentEntity._id) : this.i18npipe.transform('add table');
    }

    get addColumnLabel() {
        return this.currentEntity ? this.i18npipe.transform('add column to', this.currentEntity._id) : this.i18npipe.transform('add column');
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


    applyChanges(editorExprHasErrors: boolean, editedEntity: Entity, editedProperty: EntityProperty) {
        if (!editorExprHasErrors) {
            if (confirm("Please confirm, apply modifications to DB ?")) {
                this.store.dispatch(new appState.ServerEventSetProperty(editedEntity, editedProperty));
                this.formulaEditorService.toggleFormulaEditor();
            }
        } else {
            alert("Expression has errors, cannot apply on DB");
        }
    }
    discardChanges() {
        if (confirm("Please confirm, dicard changes ?")) {
            this.formulaEditorService.toggleFormulaEditor();
        }
    }
}
